import { ChatRoom } from "../../models/ChatRoom.model.js";

/* ===================================================
   ✅ GET WAITING VISITORS (EMPLOYEE DASHBOARD)
=================================================== */
export const getWaitingVisitors = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const waitingRooms = await ChatRoom.find({
      company_id,
      status: "waiting",
    }).select("session_id room_id createdAt");

    return res.json({
      success: true,
      visitors: waitingRooms,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ===================================================
   ✅ GET ACTIVE CHAT ROOM (EMPLOYEE)
=================================================== */
export const getActiveChatRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const company_id = req.user.company_id;

    const room = await ChatRoom.findOne({
      company_id,
      room_id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.json({
      success: true,
      room,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
