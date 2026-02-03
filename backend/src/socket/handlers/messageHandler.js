import { Message } from "../../models/Message.model.js";
import { Conversation } from "../../models/Conversation.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Visitor } from "../../models/Visitors.model.js";

export const handleSendMessage = async (socket, io, payload) => {
  try {
    const { roomId, message } = payload;

    // 1. Basic Validation
    if (!roomId || !message?.trim()) {
      return socket.emit("error", { message: "Message content is required" });
    }

    // 2. Verify Room exists and is active
    const room = await ChatRoom.findOne({
      room_id: roomId,
      status: { $in: ["online", "both-active"] },
    });

    if (!room) {
      return socket.emit("error", { message: "Chat session is not active" });
    }

    let senderType;
    let senderId = null;

    // 3. Identify Sender (Agent vs Visitor)
    if (socket.user) {
      // Ensure agent belongs to the correct company
      if (room.company_id.toString() !== socket.user.company_id.toString()) {
        return socket.emit("error", { message: "Unauthorized: Company mismatch" });
      }
      senderType = "agent";
      senderId = socket.user._id;
    } else {
      // Verify visitor session
      const visitor = await Visitor.findOne({ _id: room.visitor_id, is_verified: true });
      if (!visitor) {
        return socket.emit("error", { message: "Unauthorized visitor" });
      }
      senderType = "visitor";
      senderId = visitor._id;
    }

    // 4. Update or Create Conversation record (Atomic)
    const conversation = await Conversation.findOneAndUpdate(
      { 
        company_id: room.company_id, 
        visitor_id: room.visitor_id, 
        status: { $ne: "closed" } 
      },
      { 
        $set: { last_message_at: new Date() },
        $setOnInsert: { status: "open", assigned_agent: room.assigned_agent_id || null }
      },
      { upsert: true, new: true }
    );

    // 5. Save the Message to DB
    const newMessage = await Message.create({
      conversation_id: conversation._id,
      sender_id: senderId,
      sender_type: senderType,
      content: message,
      message_type: "text",
    });

    // 6. Broadcast to everyone in the room
    io.to(roomId).emit("message:received", {
      messageId: newMessage._id,
      roomId,
      message: newMessage.content,
      senderType,
      senderId,
      timestamp: newMessage.createdAt,
    });

  } catch (error) {
    console.error("Message Error:", error);
    socket.emit("error", { message: "Message failed to send" });
  }
};

/**
 * Indicators: Use .to() so the person typing doesn't receive their own event
 */
export const handleTyping = (socket, io, { roomId }) => {
  if (!roomId) return;
  socket.to(roomId).emit("typing");
};

export const handleStopTyping = (socket, io, { roomId }) => {
  if (!roomId) return;
  socket.to(roomId).emit("stopTyping");
};