import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import ApiError from "../../utils/ApiError.util.js";

/**
 * ======================================================
 * GET COMPANY CHAT ROOMS (Dashboard List)
 * GET /api/company/chatrooms
 * ======================================================
 */
export const getCompanyChatRooms = AsyncHandler(async (req, res) => {
  const companyId = req.user.company_id;

  const rooms = await ChatRoom.find({
    company_id: companyId,
    status: { $ne: "closed" },
  })
    .populate("assigned_agent_id", "username email is_online")
    .sort({ last_message_at: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, rooms, "Chat rooms fetched successfully")
  );
});

/**
 * ======================================================
 * GET ROOM MESSAGES
 * GET /api/company/chatrooms/:roomId/messages
 * ======================================================
 */
export const getRoomMessages = AsyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const companyId = req.user.company_id;

  const room = await ChatRoom.findOne({
    room_id: roomId,
    company_id: companyId,
  });

  if (!room) throw new ApiError(404, "Room not found");

  const messages = await Message.find({
    conversation_id: room._id,
  }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched"));
});
