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

    const room = await ChatRoom.findOneAndUpdate(
      {
        room_id,
        status: "waiting",
        $or: [
          { assigned_agent_id: null },
          { assigned_agent_id: user._id },
        ],
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

    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("visitor:agent-joined", { room_id });
    }

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

    room.agent_socket_id = socket.id;
    room.is_agent_online = true;

    // ✅ Only active if visitor online
    room.status = room.is_visitor_online ? "active" : "waiting";

    await room.save();
    socket.join(room_id);

    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("visitor:agent-joined", { room_id });
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

    // ✅ MAP DB FORMAT → FRONTEND FORMAT
    const formatted = messages.map((m) => ({
      msg_id: m.metadata?.client_msg_id || m._id.toString(),
      room_id,
      sender_type: m.sender_type,
      sender_id: m.sender_id,

      // ✅ THIS IS MOST IMPORTANT
      msg_content: m.content,

      send_at: m.createdAt,
    }));

    socket.emit("chat:history", formatted);

    console.log("📜 Employee History Loaded:", room_id);
  } catch (err) {
    console.error("employeeLoadHistory error:", err.message);
  }
};


/* ===================================================
   ✅ EMPLOYEE TYPING
=================================================== */
export const employeeTyping = async (io, socket, payload) => {
  const { room_id } = payload;
  if (!room_id) return;

  socket.to(room_id).emit("employee:typing", { room_id });
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
/* ===================================================
   ✅ EMPLOYEE LEAVE ROOM (FIXED: Visitor Goes Back Waiting)
=================================================== */
export const employeeLeaveRoom = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    const room = await ChatRoom.findOne({ room_id });
    if (!room) return;

    /* ==========================================
       ✅ Employee Leaving Should NOT Close Chat
    ========================================== */

    room.status = "waiting"; // ✅ visitor back in queue

    room.closed_by = null;
    room.closed_at = null;

    // Remove agent assignment
    room.assigned_agent_id = null;
    room.agent_socket_id = null;
    room.is_agent_online = false;

    await room.save();

    socket.leave(room_id);

    console.log("🚪 Employee Left → Visitor Back Waiting:", room_id);

    /* ==========================================
       ✅ Notify Visitor
    ========================================== */
    if (room.visitor_socket_id) {
      io.to(room.visitor_socket_id).emit("visitor:agent-left", {
        room_id,
        message: "Agent left. Waiting for another agent...",
      });
    }

    /* ==========================================
       ✅ Notify Company Dashboard (Waiting List Update)
    ========================================== */
    io.to(`company_${room.company_id}`).emit(
      "employee:new-waiting-visitor",
      {
        room_id,
        session_id: room.session_id,
      }
    );

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
