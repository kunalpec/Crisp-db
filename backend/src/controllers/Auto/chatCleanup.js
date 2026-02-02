import { Conversation } from "../../models/Conversation.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";

const THIRTY_MIN = 30 * 60 * 1000;

export const cleanupAbandonedChats = async () => {
  const now = new Date();

  // 1️⃣ find rooms inactive for 30 min
  const expiredRooms = await ChatRoom.find(
    {
      closed_at: { $lte: new Date(now.getTime() - THIRTY_MIN) },
    },
    { visitor_id: 1, company_id: 1 }
  );

  if (!expiredRooms.length) {
    console.log("No abandoned rooms found");
    return;
  }

  // 2️⃣ build conversation filter
  const conversationFilter = expiredRooms.map((room) => ({
    visitor_id: room.visitor_id,
    company_id: room.company_id,
  }));

  // 3️⃣ find conversations once
  const conversations = await Conversation.find({
    $or: conversationFilter,
  }).select("_id");

  const conversationIds = conversations.map((c) => c._id);

  // 4️⃣ delete messages in batch
  if (conversationIds.length) {
    await Message.deleteMany({
      conversation_id: { $in: conversationIds },
    });

    // 5️⃣ delete conversations in batch
    await Conversation.deleteMany({
      _id: { $in: conversationIds },
    });
  }

  // 6️⃣ delete chat rooms in batch
  await ChatRoom.deleteMany({
    _id: { $in: expiredRooms.map((r) => r._id) },
  });

  console.log("✅ Chat cleanup completed");
};
