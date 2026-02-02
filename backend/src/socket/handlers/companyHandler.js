import { CompanyUser } from "../../models/CompanyUser.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Visitor } from "../../models/Visitors.model.js";
import { getCompanyRoomId } from "../rooms.js";

/**
 * Handle employee connection
 */
export const handleEmployeeConnection = async (socket, io) => {
  try {
    const userId = socket.user._id;
    const companyId = socket.user.company_id;
    const role = socket.user.role;
    const email = socket.user.email;

    await CompanyUser.findByIdAndUpdate(userId, {
      is_online: true,
      socket_id: socket.id,
    });

    const companyRoomId = getCompanyRoomId(companyId);
    await socket.join(companyRoomId);

    socket.to(companyRoomId).emit("employee:connected", {
      userId,
      companyId,
      role,
      email,
      socketId: socket.id,
    });

    socket.emit("employee:connected", {
      userId,
      companyId,
      role,
      email,
      socketId: socket.id,
    });

    console.log(`Employee ${email} connected`);
  } catch (error) {
    console.error("Employee connection error:", error);
    socket.emit("error", { message: "Employee connection failed" });
  }
};

/**
 * Handle employee disconnection
 */
export const handleEmployeeDisconnection = async (socket, io) => {
  try {
    if (!socket.user) return;

    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    await CompanyUser.findByIdAndUpdate(userId, {
      is_online: false,
      socket_id: null,
    });

    // 🔥 IMPORTANT: release active rooms
    await ChatRoom.updateMany(
      {
        company_id: companyId,
        assigned_agent_id: userId,
        status: "active",
      },
      {
        $set: {
          status: "waiting",
          assigned_agent_id: null,
          closed_at: new Date(), // start 30-min timer
        },
      }
    );

    const companyRoomId = getCompanyRoomId(companyId);
    socket.to(companyRoomId).emit("employee:disconnected", {
      userId,
      companyId,
    });

    console.log(`Employee ${userId} disconnected`);
  } catch (error) {
    console.error("Employee disconnection error:", error);
  }
};

/**
 * Handle employee joining a visitor room
 */
export const handleJoinVisitorRoom = async (
  socket,
  io,
  { visitorSessionId }
) => {
  try {
    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    if (!visitorSessionId) {
      return socket.emit("error", {
        message: "Visitor session ID is required",
      });
    }

    const visitor = await Visitor.findOne({
      session_id: visitorSessionId,
      company_id: companyId,
    });

    if (!visitor) {
      return socket.emit("error", {
        message: "Visitor not found or unauthorized",
      });
    }

    const chatRoom = await ChatRoom.findOne({
      company_id: companyId,
      visitor_id: visitor._id,
      status: "waiting",
      closed_at: null,
    });

    if (!chatRoom) {
      return socket.emit("error", {
        message: "Visitor is no longer available",
      });
    }

    if (chatRoom.assigned_agent_id) {
      return socket.emit("error", {
        message: "Visitor already assigned to another agent",
      });
    }

    chatRoom.status = "active";
    chatRoom.assigned_agent_id = userId;
    chatRoom.closed_at = null;
    await chatRoom.save();

    const visitorRoomId = `visitor_${visitorSessionId}`;
    await socket.join(visitorRoomId);

    io.to(visitorRoomId).emit("employee:joined-room", {
      employeeId: userId,
      companyId,
      roomId: visitorRoomId,
    });

    const companyRoomId = getCompanyRoomId(companyId);
    io.to(companyRoomId).emit("visitor:assigned", {
      roomId: visitorRoomId,
      visitorSessionId,
      visitorId: visitor._id,
    });

    socket.emit("employee:joined-room-success", {
      roomId: visitorRoomId,
      visitorId: visitor._id,
      visitorSessionId,
    });

    console.log(`Employee ${userId} joined ${visitorRoomId}`);
  } catch (error) {
    console.error("Join visitor room error:", error);
    socket.emit("error", { message: "Failed to join visitor room" });
  }
};

/**
 * Handle employee leaving a visitor room
 */
export const handleLeaveVisitorRoom = async (socket, io, { visitorSessionId }) => {
  try {
    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    if (!visitorSessionId) {
      return socket.emit("error", { message: "Visitor session ID is required" });
    }

    const visitorRoomId = `visitor_${visitorSessionId}`;
    await socket.leave(visitorRoomId);

    await ChatRoom.updateOne(
      { company_id: companyId, assigned_agent_id: userId },
      {
        $set: {
          status: "waiting",
          assigned_agent_id: null,
        },
      }
    );

    // 🔔 Visitor notification
    io.to(visitorRoomId).emit("employee:left-room", {
      system: true,
      message: "Agent left the chat",
    });

    // 🔁 Waiting list update for ALL employees
    const companyRoomId = getCompanyRoomId(companyId);
    io.to(companyRoomId).emit("visitor:back-to-waiting", {
      visitorSessionId,
    });

    socket.emit("employee:left-room-success", {
      roomId: visitorRoomId,
      visitorSessionId,
    });

    console.log(`Employee ${userId} left ${visitorRoomId}`);
  } catch (err) {
    console.error(err);
    socket.emit("error", { message: "Failed to leave visitor room" });
  }
};


/**
 * Get waiting visitors
 */
export const handleGetWaitingVisitors = async (socket) => {
  try {
    const companyId = socket.user.company_id;

    const waitingRooms = await ChatRoom.find({
      company_id: companyId,
      status: "waiting",
      closed_at: null,
    })
      .populate("visitor_id", "session_id user_info current_page")
      .select("room_id visitor_id createdAt status")
      .lean();

    socket.emit("employee:waiting-rooms", waitingRooms);
  } catch (error) {
    console.error("Get waiting visitors error:", error);
    socket.emit("employee:waiting-rooms-error", {
      message: "Failed to get waiting visitors",
    });
  }
};
