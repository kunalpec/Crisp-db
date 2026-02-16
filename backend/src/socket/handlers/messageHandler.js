import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";

/* ===================================================
   ✅ SEND MESSAGE (VISITOR + EMPLOYEE)
=================================================== */
export const handleSendMessage = async (io, socket, payload) => {
  try {
    const { msg_id, msg_content, room_id, send_at } = payload;

    /* ===================================================
       ✅ BASIC VALIDATION
    =================================================== */
    if (!room_id) return;

    if (!msg_content || !msg_content.trim()) {
      return;
    }

    /* ===================================================
       ✅ FIND CHAT ROOM
    =================================================== */
    const chatRoom = await ChatRoom.findOne({ room_id });

    if (!chatRoom) {
      console.log("❌ Room Not Found:", room_id);
      return;
    }

    if (chatRoom.status === "closed") {
      console.log("❌ Chat Closed:", room_id);
      return;
    }

    /* ===================================================
       ✅ PREVENT DUPLICATE MESSAGE (CLIENT RESEND ISSUE)
    =================================================== */
    if (msg_id) {
      const existing = await Message.findOne({
        "metadata.client_msg_id": msg_id,
        conversation_id: chatRoom._id,
      });

      if (existing) {
        return socket.emit("chat:duplicate-message", {
          msg_id,
          db_id: existing._id,
        });
      }
    }

    /* ===================================================
       ✅ DETERMINE SENDER
    =================================================== */
    let sender_type = "visitor";
    let sender_id = null;

    if (socket.role !== "visitor") {
      sender_type = "agent";
      sender_id = socket.user?._id;
    }

    /* ===================================================
       ✅ SECURITY CHECK (ONLY ROOM USERS CAN SEND)
    =================================================== */
    if (
      sender_type === "visitor" &&
      chatRoom.visitor_socket_id !== socket.id
    ) {
      console.log("❌ Unauthorized Visitor Send Attempt");
      return;
    }

    if (
      sender_type === "agent" &&
      String(chatRoom.assigned_agent_id) !== String(sender_id)
    ) {
      console.log("❌ Unauthorized Agent Send Attempt");
      return;
    }

    /* ===================================================
       ✅ DELIVERY STATUS (ONLINE CHECK)
    =================================================== */
    let delivered_at = null;

    if (sender_type === "visitor" && chatRoom.is_agent_online) {
      delivered_at = new Date();
    }

    if (sender_type === "agent" && chatRoom.is_visitor_online) {
      delivered_at = new Date();
    }

    /* ===================================================
       ✅ SAVE MESSAGE IN DATABASE
    =================================================== */
    const message = await Message.create({
      conversation_id: chatRoom._id,

      sender_type,
      sender_id,

      content: msg_content.trim(),

      metadata: {
        client_msg_id: msg_id || null,
        client_send_time: send_at || null,
      },

      delivered_at,
    });

    /* ===================================================
       ✅ UPDATE CHATROOM LAST MESSAGE INFO
    =================================================== */
    chatRoom.last_message_at = new Date();
    chatRoom.last_message_content = msg_content.trim();

    await chatRoom.save();

    /* ===================================================
       ✅ EMIT MESSAGE TO BOTH SIDES
    =================================================== */
    io.to(room_id).emit("chat:new-message", {
      msg_id,
      db_id: message._id,

      room_id,

      sender_type,
      sender_id,

      msg_content: message.content,

      send_at: message.createdAt,
      delivered_at: message.delivered_at,
    });

    /* ===================================================
       ✅ ACK BACK TO SENDER (SUCCESS CONFIRM)
    =================================================== */
    socket.emit("chat:message-sent", {
      msg_id,
      db_id: message._id,
    });

    console.log("✅ Message Sent:", room_id);
  } catch (err) {
    console.error("handleSendMessage error:", err.message);
  }
};
