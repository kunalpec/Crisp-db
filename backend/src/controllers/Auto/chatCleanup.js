import { Conversation } from "../../models/Conversation.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";
import { Visitor } from "../../models/Visitors.model.js";

const THIRTY_MIN = 30 * 60 * 1000;

export const cleanupAbandonedChats = async () => {
  try {
    const now = new Date();

    // 1️⃣ Find expired rooms
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

    // 2️⃣ Build conversation filter
    const conversationFilter = expiredRooms.map((room) => ({
      visitor_id: room.visitor_id,
      company_id: room.company_id,
    }));

    // 3️⃣ Find conversations
    const conversations = await Conversation.find({
      $or: conversationFilter,
    }).select("_id");

    const conversationIds = conversations.map((c) => c._id);

    // 4️⃣ Delete messages
    if (conversationIds.length) {
      await Message.deleteMany({
        conversation_id: { $in: conversationIds },
      });

      // 5️⃣ Delete conversations
      await Conversation.deleteMany({
        _id: { $in: conversationIds },
      });
    }

    // 6️⃣ Delete chat rooms
    await ChatRoom.deleteMany({
      _id: { $in: expiredRooms.map((r) => r._id) },
    });

    // 7️⃣ Delete visitors (deduplicated)
    const visitorIds = [
      ...new Set(expiredRooms.map((r) => r.visitor_id.toString())),
    ];

    await Visitor.deleteMany({
      _id: { $in: visitorIds },
    });

    console.log("✅ Chat + Visitor cleanup completed");
  } catch (err) {
    console.error("❌ Chat cleanup failed:", err);
  }
};
