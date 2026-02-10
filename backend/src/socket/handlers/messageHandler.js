import { Message } from "../../models/Message.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Visitor } from "../../models/Visitors.model.js";

export const handleSendMessage = async (socket, io, payload) => {
  try {
    const { roomId, message } = payload;

    if (!roomId || !message || !message.trim()) {
      return socket.emit("error", { message: "Invalid message" });
    }

    console.log("📩 Message received:", payload);
    console.log("📢 Emitting to room:", roomId);


    const trimmedMessage = message.trim();

    // 🔎 Strict Room Validation
    const room = await ChatRoom.findOne({
      room_id: roomId,
      status: { $ne: "closed" },
    });

    if (!room) {
      return socket.emit("error", { message: "Room not active" });
    }

    let senderType;
    let senderId = null;

    // ===============================
    // EMPLOYEE MESSAGE
    // ===============================
    if (socket.user) {

      if (
        room.company_id.toString() !==
        socket.user.company_id.toString()
      ) {
        return socket.emit("error", { message: "Unauthorized company access" });
      }

      if (
        room.assigned_agent_id &&
        room.assigned_agent_id.toString() !== socket.user._id.toString()
      ) {
        return socket.emit("error", { message: "Room assigned to another agent" });
      }

      senderType = "agent";
      senderId = socket.user._id;
    }

    // ===============================
    // VISITOR MESSAGE
    // ===============================
    else {

      const visitor = await Visitor.findOne({
        _id: room.visitor_id,
        socket_id: socket.id,
        is_verified: true,
      });

      if (!visitor) {
        return socket.emit("error", { message: "Unauthorized visitor" });
      }

      senderType = "visitor";
      senderId = visitor._id;
    }

    // ===============================
    // SAVE MESSAGE
    // ===============================
    const newMessage = await Message.create({
      conversation_id: room._id,
      sender_id: senderId,
      sender_type: senderType,
      content: trimmedMessage,
    });

    // Atomic last message update
    await ChatRoom.updateOne(
      { _id: room._id },
      { $set: { last_message_at: new Date() } }
    );

    // ===============================
    // EMIT MESSAGE
    // ===============================
io.to(roomId).emit("message:received", {
  _id: newMessage._id,
  roomId: roomId, // 🔥 ADD THIS
  content: newMessage.content,
  sender_type: senderType,
  sender_id: senderId,
  createdAt: newMessage.createdAt,
});



  } catch (error) {
    console.error("Message Error:", error);
    socket.emit("error", { message: "Message failed" });
  }
};

export const handleTyping = (socket, io, { roomId }) => {
  if (!roomId) return;
  socket.to(roomId).emit("typing", { user: socket.user?._id || "visitor" });
};

export const handleStopTyping = (socket, io, { roomId }) => {
  if (!roomId) return;
  socket.to(roomId).emit("stopTyping");
};
