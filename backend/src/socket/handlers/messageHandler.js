import { Message } from "../../models/Message.model.js";
import { Conversation } from "../../models/Conversation.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Visitor } from "../../models/Visitors.model.js";

/**
 * Handle sending a message
 */
export const handleSendMessage = async (socket, io, payload) => {
  try {
    const { roomId, message } = payload;

    if (!roomId || !message) {
      return socket.emit("error", {
        message: "Room ID and message are required",
      });
    }

    // 🔍 Validate active room ONLY
    const room = await ChatRoom.findOne({
      room_id: roomId,
      status: "active",
    });

    if (!room) {
      return socket.emit("error", {
        message: "Room not active",
      });
    }

    let senderType;
    let senderId = null;

    // 👨‍💼 Employee authorization
    if (socket.user) {
      if (room.company_id.toString() !== socket.user.company_id.toString()) {
        return socket.emit("error", {
          message: "Unauthorized access",
        });
      }

      senderType = "agent";
      senderId = socket.user._id;
    }
    // 🧑 Visitor authorization
    else {
      const visitor = await Visitor.findOne({
        _id: room.visitor_id,
        is_verified: true,
        socket_id: socket.id,
      });

      if (!visitor) {
        return socket.emit("error", {
          message: "Unauthorized visitor",
        });
      }

      senderType = "visitor";
      senderId = visitor._id;
    }

    // 🔁 Find or create conversation
    let conversation = await Conversation.findOne({
      company_id: room.company_id,
      visitor_id: room.visitor_id,
      status: { $ne: "closed" },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        company_id: room.company_id,
        visitor_id: room.visitor_id,
        assigned_agent: room.assigned_agent_id || null,
        status: "open",
      });
    }

    // 📨 Create message
    const newMessage = await Message.create({
      conversation_id: conversation._id,
      sender_id: senderId,
      sender_type: senderType,
      content: message,
      message_type: "text",
    });

    // 🕒 Update conversation activity
    await Conversation.updateOne(
      { _id: conversation._id },
      { last_message_at: new Date() }
    );

    // 📡 Broadcast message
    io.to(roomId).emit("message:received", {
      messageId: newMessage._id,
      roomId,
      message: newMessage.content,
      senderType,
      senderId,
      timestamp: newMessage.createdAt,
    });

    console.log(`Message sent in room ${roomId}`);
  } catch (error) {
    console.error("Error sending message:", error);
    socket.emit("error", { message: "Failed to send message" });
  }
};


/**
 * Handle typing indicator
 */
export const handleTyping = (socket, io, { roomId }) => {
  if (!roomId) return;
  socket.to(roomId).emit("typing");
};

/**
 * Handle stop typing indicator
 */
export const handleStopTyping = (socket, io, { roomId }) => {
  if (!roomId) return;
  socket.to(roomId).emit("stopTyping");
};