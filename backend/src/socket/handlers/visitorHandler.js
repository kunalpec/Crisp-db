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
export const createNewVisitor = async (io, socket, payload, callback) => {
  try {
    const { company_apikey, session_id } = payload;
    if (!company_apikey || !session_id) return;

    const company_id = await validateCompany(company_apikey);
    console.log("comapny id", company_id);
    if (!company_id) return;

    const room_id = `${company_id}_${session_id}`;

    let room = await ChatRoom.findOne({
      company_id,
      session_id,
      status: { $ne: "closed" },
    });

    if (!room) {
      room = await ChatRoom.create({
        company_id,
        session_id,
        room_id,
        visitor_socket_id: socket.id,
        is_visitor_online: true,
        status: "waiting",
      });
    } else {
      room.visitor_socket_id = socket.id;
      room.is_visitor_online = true;
      room.status = "waiting";
      await room.save();
    }

    // Join socket room
    socket.join(room_id);

    // Notify Employees
    io.to(`company_${company_id}`).emit("employee:new-waiting-visitor", {
      room_id,
      session_id,
    });

    callback?.({
      room_id,
      chatRoomId: room._id,
    });

    console.log("✅ Visitor Room Created:", room_id);
  } catch (err) {
    console.error("createNewVisitor error:", err.message);
  }
};

/* ===================================================
   ✅ RESUME VISITOR ROOM
=================================================== */
export const resumeVisitorRoom = async (io, socket, payload) => {
  try {
    const { room_id, session_id } = payload;
    if (!room_id || !session_id) return;
   
    const room = await ChatRoom.findOne({
      room_id,
      session_id,
      status: { $ne: "closed" },
    });

    if (!room) return;

    // Join first (important)
    socket.join(room_id);

    // Update visitor socket + online
    room.visitor_socket_id = socket.id;
    room.is_visitor_online = true;

    // If agent already connected → active
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

    console.log("✅ Visitor Resumed Room:", room_id);
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

    socket.emit("chat:history", messages);

    console.log("📜 History Sent:", room_id);
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
=================================================== */
export const visitorLeaveRoom = async (io, socket, payload) => {
  try {
    const { room_id } = payload;
    if (!room_id) return;

    const room = await ChatRoom.findOne({ room_id });
    if (!room) return;

    room.status = "closed";
    room.closed_by = "visitor";
    room.closed_at = new Date();

    room.is_visitor_online = false;
    room.visitor_socket_id = null;

    await room.save();

    socket.leave(room_id);

    console.log("🚪 Visitor Left Chat:", room_id);

    // Notify employee
    if (room.agent_socket_id) {
      io.to(room.agent_socket_id).emit("visitor:left", {
        room_id,
      });
    }

    // Remove from waiting list
    io.to(`company_${room.company_id}`).emit(
      "employee:visitor-left-waiting",
      { room_id }
    );
  } catch (err) {
    console.error("visitorLeaveRoom error:", err.message);
  }
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
