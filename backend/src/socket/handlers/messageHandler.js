import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";
import { CompanyUser } from "../../models/CompanyUser.model.js";



export const handleSendMessage = async (io, socket, payload) => {
  try {
    const { msg_id, msg_content, room_id, send_at } = payload;

    if (!room_id) return;
    if (!msg_content || !msg_content.trim()) return;

    const chatRoom = await ChatRoom.findOne({ room_id });

    if (!chatRoom) return;
    if (chatRoom.status === "closed") return;

    /* ==========================================
       ✅ Determine Sender
    ========================================== */
    const sender_type = socket.role === "employee" ? "agent" : "visitor";
    const sender_id = sender_type === "agent" ? socket.user?._id : null;

    /* ==========================================
       ✅ Visitor Security Check (SESSION BASED)
    ========================================== */
    if (
      sender_type === "visitor" &&
      String(chatRoom.session_id) !== String(socket.session_id)
    ) {
      console.log("❌ Unauthorized Visitor Send Attempt");
      return;
    }

    /* ==========================================
       ✅ Agent Security Check
    ========================================== */
    if (
      sender_type === "agent" &&
      String(chatRoom.assigned_agent_id) !== String(sender_id)
    ) {
      console.log("❌ Unauthorized Agent Send Attempt");
      return;
    }

    /* ==========================================
       ✅ Save Message
    ========================================== */
    const message = await Message.create({
      conversation_id: chatRoom._id,
      sender_type,
      sender_id,
      content: msg_content.trim(),
      metadata: {
        client_msg_id: msg_id || null,
        client_send_time: send_at || null,
      },
    });

    chatRoom.last_message_at = new Date();
    chatRoom.last_message_content = message.content;
    await chatRoom.save();

    /* ==========================================
       ✅ Emit Message
    ========================================== */
    io.to(room_id).emit("chat:new-message", {
      msg_id,
      db_id: message._id,
      room_id,
      sender_type,
      sender_id,
      msg_content: message.content,
      send_at: message.createdAt,
    });

    socket.emit("chat:message-sent", {
      msg_id,
      db_id: message._id,
    });

    console.log("✅ Message Sent:", room_id);

  } catch (err) {
    console.error("handleSendMessage error:", err.message);
  }
};

