import { CompanyUser } from "../../models/CompanyUser.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";

/* ===================================================
   ✅ EMPLOYEE CONNECT (AUTO ONLINE + JOIN COMPANY ROOM)
=================================================== */
export const handleEmployeeConnect = async (io, socket) => {
  try {
    const user = socket.user;
    if (!user) return;

    // Mark employee online
    await CompanyUser.findByIdAndUpdate(user._id, {
      is_online: true,
      socket_id: socket.id,
    });

    // Join company dashboard room
    socket.join(`company_${user.company_id}`);

    console.log("✅ Employee Connected:", user.email);

    // Send waiting visitors instantly
    const waitingRooms = await ChatRoom.find({
      company_id: user.company_id,
      status: "waiting",
    }).select("room_id session_id createdAt");

    socket.emit("employee:waiting-list", waitingRooms);
  } catch (err) {
    console.error("handleEmployeeConnect error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE READY (REFRESH WAITING LIST)
=================================================== */
export const employeeReady = async (io, socket) => {
  try {
    const user = socket.user;
    if (!user) return;

    const waitingRooms = await ChatRoom.find({
      company_id: user.company_id,
      status: "waiting",
    }).select("room_id session_id createdAt");

    socket.emit("employee:waiting-list", waitingRooms);

    console.log("📌 Employee Ready: Waiting list refreshed");
  } catch (err) {
    console.error("employeeReady error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE JOIN ROOM (ASSIGN VISITOR)
=================================================== */
export const employeeJoinRoom = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    const user = socket.user;
    if (!room_id || !user) return;

    // Assign visitor only if waiting
    const room = await ChatRoom.findOneAndUpdate(
      {
        room_id,
        status: "waiting",
        assigned_agent_id: null,
      },
      {
        status: "active",
        assigned_agent_id: user._id,
        agent_socket_id: socket.id,
        is_agent_online: true,
      },
      { new: true }
    );

    if (!room) {
      return socket.emit("employee:room-already-assigned");
    }

    socket.join(room_id);

    console.log("🎯 Employee Joined Room:", room_id);

    // Notify visitor agent joined
    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("visitor:agent-joined", {
        room_id,
      });
    }

    // Remove visitor from waiting dashboard
    io.to(`company_${user.company_id}`).emit("employee:visitor-assigned", {
      room_id,
    });
  } catch (err) {
    console.error("employeeJoinRoom error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE RESUME ROOM (RECONNECT SUPPORT)
=================================================== */
export const employeeResumeRoom = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    const user = socket.user;
    if (!room_id || !user) return;

    const room = await ChatRoom.findOne({
      room_id,
      assigned_agent_id: user._id,
      status: { $ne: "closed" },
    });

    if (!room) return;

    // Update agent socket
    room.agent_socket_id = socket.id;
    room.is_agent_online = true;
    room.status = "active";
    await room.save();

    socket.join(room_id);

    console.log("🔄 Employee Resumed Room:", room_id);

    // Notify visitor employee reconnected
    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("visitor:agent-joined", {
        room_id,
      });
    }
  } catch (err) {
    console.error("employeeResumeRoom error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE LOAD CHAT HISTORY
=================================================== */
export const employeeLoadHistory = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    const room = await ChatRoom.findOne({ room_id });
    if (!room) return;

    const messages = await Message.find({
      conversation_id: room._id,
    }).sort({ createdAt: 1 });

    socket.emit("chat:history", messages);

    console.log("📜 Employee History Loaded:", room_id);
  } catch (err) {
    console.error("employeeLoadHistory error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE TYPING
=================================================== */
export const employeeTyping = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    const room = await ChatRoom.findOne({ room_id });
    if (!room) return;

    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("employee:typing", {
        room_id,
      });
    }
  } catch (err) {
    console.error("employeeTyping error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE STOP TYPING
=================================================== */
export const employeeStopTyping = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    const room = await ChatRoom.findOne({ room_id });
    if (!room) return;

    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("employee:stop-typing", {
        room_id,
      });
    }
  } catch (err) {
    console.error("employeeStopTyping error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE LEAVE ROOM (END CHAT)
=================================================== */
export const employeeLeaveRoom = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    const room = await ChatRoom.findOne({ room_id });
    if (!room) return;

    room.status = "closed";
    room.closed_by = "employee";
    room.closed_at = new Date();

    room.is_agent_online = false;
    room.agent_socket_id = null;

    await room.save();

    socket.leave(room_id);

    console.log("🚪 Employee Left Chat:", room_id);

    // Notify visitor
    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("visitor:agent-left", {
        room_id,
      });
    }
  } catch (err) {
    console.error("employeeLeaveRoom error:", err.message);
  }
};

/* ===================================================
   ✅ EMPLOYEE OFFLINE (DISCONNECT / TAB CLOSE)
=================================================== */
export const employeeOffline = async (io, socket) => {
  try {
    const user = socket.user;
    if (!user) return;

    await CompanyUser.findByIdAndUpdate(user._id, {
      is_online: false,
      socket_id: null,
    });

    console.log("⚠ Employee Offline:", user.email);

    // Mark active rooms disconnected
    const rooms = await ChatRoom.find({
      assigned_agent_id: user._id,
      status: "active",
    });

    for (let room of rooms) {
      room.is_agent_online = false;
      room.agent_socket_id = null;
      room.status = "disconnected";
      await room.save();

      // Notify visitor
      if (room.visitor_socket_id) {
        io.to(room.visitor_socket_id).emit("visitor:agent-left", {
          room_id: room.room_id,
        });
      }
    }
  } catch (err) {
    console.error("employeeOffline error:", err.message);
  }
};
