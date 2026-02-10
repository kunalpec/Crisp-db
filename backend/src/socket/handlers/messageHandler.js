import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";

export const handleSendMessage = async (io, socket, payload) => {
  try {
    const {
      msg_id,
      msg_content,
      msg_type,
      room_id,
      send_at,
    } = payload;

    if (!room_id || !msg_content) return;

    const chatRoom = await ChatRoom.findOne({ room_id });

    if (!chatRoom || chatRoom.status === "closed") return;

    /* ==========================================
       DETERMINE SENDER (NEVER TRUST FRONTEND)
    ========================================== */

    let sender_type = "visitor";
    let sender_id = null;

    if (socket.role !== "visitor") {
      sender_type = "agent";
      sender_id = socket.user?._id || null;
    }

    /* ==========================================
       SAVE MESSAGE
    ========================================== */

    const message = await Message.create({
      chatRoom_id: chatRoom._id, // ✅ UPDATED
      sender_type,
      sender_id,
      content: msg_content,
      message_type: "text",
      metadata: {
        client_msg_id: msg_id,
        client_send_time: send_at,
      },
      delivered_at: new Date(),
    });

    /* ==========================================
       UPDATE CHATROOM
    ========================================== */

    chatRoom.last_message_at = new Date();
    await chatRoom.save();

    /* ==========================================
       EMIT TO ROOM
    ========================================== */

    io.to(room_id).emit("chat:new-message", {
      msg_id,
      db_id: message._id,
      room_id,
      sender_type,
      sender_id,
      msg_content,
      send_at: message.createdAt,
    });

  } catch (err) {
    console.error("handleSendMessage error:", err.message);
  }
};