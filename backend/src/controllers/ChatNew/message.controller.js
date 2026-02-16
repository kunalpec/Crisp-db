import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";

/* ===================================================
   ✅ LOAD CHAT HISTORY
=================================================== */
export const getChatMessages = async (req, res) => {
  try {
    const { room_id } = req.params;

    const chatRoom = await ChatRoom.findOne({ room_id });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "ChatRoom not found",
      });
    }

    const messages = await Message.find({
      conversation_id: chatRoom._id,
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
