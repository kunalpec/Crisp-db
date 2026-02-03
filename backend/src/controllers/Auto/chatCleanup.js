import { Conversation } from '../../models/Conversation.model.js';
import { ChatRoom } from '../../models/ChatRoom.model.js';
import { Message } from '../../models/Message.model.js';
import { Visitor } from '../../models/Visitors.model.js';

const THIRTY_MIN = 30 * 60 * 1000;

export const cleanupAbandonedChats = async () => {
  try {
    const cutoffTime = new Date(Date.now() - THIRTY_MIN);

    /* =====================================================
       1️⃣ Find rooms that truly expired
       - Grace period ended
       - OR never joined and abandoned
    ===================================================== */
    const expiredRooms = await ChatRoom.find({
      status: { $ne: 'closed' },
      $or: [
        { closed_at: { $lt: cutoffTime } }, // grace expired
        {
          closed_at: null,
          created_at: { $lt: cutoffTime }, // never joined
        },
      ],
    }).select('_id visitor_id');

    if (!expiredRooms.length) {
      console.log('ℹ️ No abandoned rooms found');
      return;
    }

    const expiredRoomIds = expiredRooms.map(r => r._id);
    const expiredVisitorIds = expiredRooms.map(r => r.visitor_id);

    /* =====================================================
       2️⃣ Find conversations ONLY linked to these rooms
       (CRITICAL FIX)
    ===================================================== */
    const conversations = await Conversation.find({
      chat_room_id: { $in: expiredRoomIds },
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    /* =====================================================
       3️⃣ Delete messages
    ===================================================== */
    if (conversationIds.length) {
      await Message.deleteMany({
        conversation_id: { $in: conversationIds },
      });

      /* =====================================================
         4️⃣ Delete conversations
      ===================================================== */
      await Conversation.deleteMany({
        _id: { $in: conversationIds },
      });
    }

    /* =====================================================
       5️⃣ Delete chat rooms
    ===================================================== */
    await ChatRoom.deleteMany({
      _id: { $in: expiredRoomIds },
    });

    /* =====================================================
       6️⃣ Delete visitors ONLY if they have NO active rooms
       (CRITICAL FIX)
    ===================================================== */
    const stillActiveVisitors = await ChatRoom.distinct('visitor_id', {
      visitor_id: { $in: expiredVisitorIds },
      status: { $ne: 'closed' },
    });

    const safeToDeleteVisitors = expiredVisitorIds.filter(
      id => !stillActiveVisitors.some(activeId => activeId.equals(id))
    );

    if (safeToDeleteVisitors.length) {
      await Visitor.deleteMany({
        _id: { $in: safeToDeleteVisitors },
      });
    }

    console.log(
      `✅ Cleanup complete | Rooms: ${expiredRoomIds.length}, Conversations: ${conversationIds.length}, Visitors: ${safeToDeleteVisitors.length}`
    );
  } catch (err) {
    console.error('❌ Chat cleanup failed:', err);
  }
};
