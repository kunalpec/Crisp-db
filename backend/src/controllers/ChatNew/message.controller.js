import { Message } from "../../models/Message.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import ApiError from "../../utils/ApiError.util.js";

/**
 * ======================================================
 * MANUAL MESSAGE SEND (Fallback HTTP)
 * POST /api/company/chatrooms/:roomId/message
 * ======================================================
 */
export const sendMessageHTTP = AsyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;

  if (!content?.trim())
    throw new ApiError(400, "Message content required");

  const room = await ChatRoom.findOne({ room_id: roomId });
  if (!room) throw new ApiError(404, "Room not found");

  const message = await Message.create({
    conversation_id: room._id,
    sender_type: "agent",
    sender_id: req.user._id,
    content,
  });

  room.last_message_at = new Date();
  await room.save();

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent"));
});
