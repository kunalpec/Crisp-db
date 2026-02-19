import { ChatRoom } from "../../models/ChatRoom.model.js";
import { Message } from "../../models/Message.model.js";
import { ApiKey } from "../../models/ApiKey.model.js";
import { compareApiKey } from "../../utils/apiKey.util.js";

/* ===================================================
   ✅ Validate Company API Key
=================================================== */
export const validateCompany = async (company_apikey) => {
  try {
    if (!company_apikey) return null;

    // 1. Find all active keys
    const activeKeys = await ApiKey.find({
      is_active: true,
    });

    if (!activeKeys.length) return null;

    // 2. Compare raw key with bcrypt hashes
    for (let keyDoc of activeKeys) {
      const isMatch = await compareApiKey(
        company_apikey,
        keyDoc.api_key_hash
      );

      if (isMatch) {
        // Check expiry
        if (keyDoc.isExpired()) return null;

        // Update last used
        keyDoc.last_used_at = new Date();
        await keyDoc.save();

        // Return company id
        return keyDoc.company_id;
      }
    }

    return null;
  } catch (err) {
    console.error("validateCompany error:", err.message);
    return null;
  }
};

/* ===================================================
   ✅ VISITOR CREATE ROOM
=================================================== */
/* ===================================================
   ✅ VISITOR CREATE ROOM (FINAL FIXED)
=================================================== */
export const createNewVisitor = async (io, socket, payload, callback) => {
  try {
    const { company_apikey, session_id } = payload;

    if (!company_apikey || !session_id) {
      return callback?.({ error: "MISSING_DATA" });
    }

    // ✅ FIX: Store session_id in socket
    socket.session_id = session_id;

    /* ==========================================
       ✅ Validate Company Key
    ========================================== */
    const company_id = await validateCompany(company_apikey);

    if (!company_id) {
      return callback?.({ error: "INVALID_COMPANY" });
    }

    const room_id = `${company_id}_${session_id}`;

    /* ==========================================
       ✅ Find Existing Room
    ========================================== */
    let room = await ChatRoom.findOne({
      company_id,
      session_id,
    });

    /* ==========================================
       ✅ CASE 1: Room Exists
    ========================================== */
    if (room) {
      room.visitor_socket_id = socket.id;
      room.is_visitor_online = true;

      // ✅ Closed Room → Apply 30 min Rule
      if (room.status === "closed") {
        const now = Date.now();
        const closedTime = room.closed_at
          ? new Date(room.closed_at).getTime()
          : 0;

        const diffMinutes = (now - closedTime) / (1000 * 60);

        if (diffMinutes <= 30) {
          console.log("♻️ Reopening room within 30 min:", room_id);
          room.status = "waiting";
          room.closed_at = null;
        } else {
          console.log("⏳ Room expired → Creating fresh room:", room_id);

          room = await ChatRoom.create({
            company_id,
            session_id,
            room_id,
            visitor_socket_id: socket.id,
            is_visitor_online: true,
            status: "waiting",
          });
        }
      } else {
        room.status = "waiting";
      }

      await room.save();
    }

    /* ==========================================
       ✅ CASE 2: No Room Exists → Create New
    ========================================== */
    else {
      room = await ChatRoom.create({
        company_id,
        session_id,
        room_id,
        visitor_socket_id: socket.id,
        is_visitor_online: true,
        status: "waiting",
      });

      console.log("🆕 New Visitor Room Created:", room_id);
    }

    /* ==========================================
       ✅ Join Socket Room
    ========================================== */
    socket.join(room_id);

    /* ==========================================
       ✅ Notify Employees
    ========================================== */
    io.to(`company_${company_id}`).emit("employee:new-waiting-visitor", {
      room_id,
      session_id,
    });

    callback?.({
      success: true,
      room_id,
      chatRoomId: room._id,
    });

    console.log("✅ Visitor Room Ready:", room_id);

  } catch (err) {
    console.error("createNewVisitor error:", err.message);

    callback?.({
      success: false,
      error: "SERVER_ERROR",
    });
  }
};



/* ===================================================
   ✅ RESUME VISITOR ROOM
=================================================== */
/* ===================================================
   ✅ RESUME VISITOR ROOM (FINAL FIXED)
=================================================== */
export const resumeVisitorRoom = async (io, socket, payload) => {
  try {
    const { room_id, session_id } = payload;

    if (!room_id || !session_id) return;

    // ✅ FIX: Store session_id again on reconnect
    socket.session_id = session_id;

    let room = await ChatRoom.findOne({
      room_id,
      session_id,
    });

    if (!room) {
      console.log("❌ Resume failed: Room not found");
      return;
    }

    /* ==========================================
       ✅ If Closed → Apply 30 min Rule
    ========================================== */
    if (room.status === "closed") {
      const now = Date.now();

      const closedTime = room.closed_at
        ? new Date(room.closed_at).getTime()
        : 0;

      const diffMinutes = (now - closedTime) / (1000 * 60);

      if (diffMinutes > 30) {
        console.log("⏳ Resume blocked: Room expired");
        return;
      }

      console.log("♻️ Reopening closed room:", room_id);

      room.status = "waiting";
      room.closed_at = null;
      room.closed_by = null;
      room.closed_reason = null;
    }

    /* ==========================================
       ✅ Update Visitor Online
    ========================================== */
    room.visitor_socket_id = socket.id;
    room.is_visitor_online = true;

    socket.join(room_id);

    /* ==========================================
       ✅ Agent Online → Active
    ========================================== */
    if (room.agent_socket_id && room.is_agent_online) {
      room.status = "active";

      io.to(room.agent_socket_id).emit("employee:visitor-reconnected", {
        room_id,
        session_id,
      });
    } else {
      room.status = "waiting";
    }

    await room.save();

    console.log("✅ Visitor Resumed Successfully:", room_id);

  } catch (err) {
    console.error("resumeVisitorRoom error:", err.message);
  }
};




/* ===================================================
   ✅ VISITOR LOAD CHAT HISTORY
=================================================== */
export const visitorLoadHistory = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    const room = await ChatRoom.findOne({ room_id });
    if (!room) return;

    const messages = await Message.find({
      conversation_id: room._id,
    }).sort({ createdAt: 1 });

    // ✅ Normalize for frontend
    const formatted = messages.map((m) => ({
      msg_id: m.metadata?.client_msg_id || m._id,
      sender_type: m.sender_type,
      msg_content: m.content, // ✅ MAIN FIX
      send_at: m.createdAt,
    }));

    socket.emit("chat:history", formatted);

    console.log("📜 History Sent Properly:", room_id);
  } catch (err) {
    console.error("visitorLoadHistory error:", err.message);
  }
};


/* ===================================================
   ✅ VISITOR TYPING
=================================================== */
export const visitorTyping = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    // Optimized: No DB call
    socket.to(room_id).emit("visitor:typing", {
      room_id,
    });
  } catch (err) {
    console.error("visitorTyping error:", err.message);
  }
};

/* ===================================================
   ✅ VISITOR STOP TYPING
=================================================== */
export const visitorStopTyping = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    socket.to(room_id).emit("visitor:stop-typing", {
      room_id,
    });
  } catch (err) {
    console.error("visitorStopTyping error:", err.message);
  }
};

/* ===================================================
   ✅ VISITOR LEAVE ROOM (END CHAT)
// =============================================new code ok ====== */
export const visitorLeaveRoom = async (io, socket, payload) => {
  const { room_id } = payload;

  const room = await ChatRoom.findOne({ room_id });
  if (!room) return;

  // ✅ Permanently closed
  room.status = "closed";
  room.closed_by = "visitor";
  room.closed_reason = "visitor_left";
  room.closed_at = new Date();

  room.is_visitor_online = false;
  room.visitor_socket_id = null;

  await room.save();

  socket.leave(room_id);

  // ✅ Notify employee
  if (room.agent_socket_id) {
    io.to(room.agent_socket_id).emit("visitor:left", { room_id });
  }

  // ✅ Remove from waiting list
  io.to(`company_${room.company_id}`).emit(
    "employee:visitor-left",
    { room_id }
  );
};

/* ===================================================
   ✅ VISITOR OFFLINE (DISCONNECT SAFE)
=================================================== */
export const visitorOffline = async (io, socket, payload) => {
  try {
    let room_id = payload?.room_id;

    let room = null;

    // Case 1: Payload room_id exists
    if (room_id) {
      room = await ChatRoom.findOne({ room_id });
    }

    // Case 2: Browser closed → find by socket.id
    if (!room) {
      room = await ChatRoom.findOne({
        visitor_socket_id: socket.id,
        status: { $in: ["waiting", "active"] },
      });
    }

    if (!room) return;

    room.is_visitor_online = false;
    room.visitor_socket_id = null;

    if (room.status !== "closed") {
      room.status = "disconnected";
    }

    await room.save();

    console.log("⚠ Visitor Offline:", room.room_id);

    // Notify employee
    if (room.agent_socket_id) {
      io.to(room.agent_socket_id).emit("visitor:disconnected", {
        room_id: room.room_id,
      });
    }
  } catch (err) {
    console.error("visitorOffline error:", err.message);
  }
};
