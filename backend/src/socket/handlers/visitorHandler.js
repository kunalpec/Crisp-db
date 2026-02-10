import crypto from "crypto";
import { ApiKey } from "../../models/ApiKey.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";

/* ===================================================
   HELPER → Validate API Key & Get company_id
=================================================== */

const validateCompany = async (company_apikey) => {
  const apiKeyHash = crypto
    .createHash("sha256")
    .update(company_apikey)
    .digest("hex");

  const apiKeyDoc = await ApiKey.findOne({
    api_key_hash: apiKeyHash,
    is_active: true,
  });

  if (!apiKeyDoc) return null;
  if (apiKeyDoc.isExpired()) return null;

  apiKeyDoc.last_used_at = new Date();
  await apiKeyDoc.save();

  return apiKeyDoc.company_id;
};

/* ===================================================
   CREATE NEW VISITOR
=================================================== */

export const createNewVisitor = async (io, socket, payload) => {
  try {
    const { company_apikey, session_id } = payload;
    if (!company_apikey || !session_id) return;

    const company_id = await validateCompany(company_apikey);
    if (!company_id) return;

    const room_id = `${company_id}_${session_id}`;

    let chatRoom = await ChatRoom.findOne({
      company_id,
      session_id,
      status: { $in: ["waiting", "active", "disconnected"] },
    });

    if (chatRoom) {
      chatRoom.is_visitor_online = true;
      chatRoom.visitor_socket_id = socket.id;

      // ✅ FIX: Do NOT override active chats
      if (chatRoom.status === "disconnected") {
        chatRoom.status = "waiting";
      }

      await chatRoom.save();
    } else {
      chatRoom = await ChatRoom.create({
        company_id,
        session_id,
        room_id,
        visitor_socket_id: socket.id,
        is_visitor_online: true,
        status: "waiting",
      });
    }

    socket.join(room_id);

    io.to(`company_${company_id}`).emit(
      "employee:new-waiting-visitor",
      {
        session_id,
        room_id,
        chatRoomId: chatRoom._id,
      }
    );

  } catch (err) {
    console.error("createNewVisitor error:", err.message);
  }
};

/* ===================================================
   RESUME VISITOR CHAT  ✅ FIXED SECURITY
=================================================== */

export const resumeVisitorChat = async (io, socket, payload) => {
  try {
    const { company_apikey, session_id } = payload;
    if (!company_apikey || !session_id) return;

    const company_id = await validateCompany(company_apikey);
    if (!company_id) return;

    const chatRoom = await ChatRoom.findOne({
      company_id, // ✅ FIXED
      session_id,
      status: { $in: ["waiting", "active", "disconnected"] },
    });

    if (!chatRoom) return;

    chatRoom.visitor_socket_id = socket.id;
    chatRoom.is_visitor_online = true;

    socket.join(chatRoom.room_id);

    if (
      chatRoom.assigned_agent_id &&
      chatRoom.is_agent_online &&
      chatRoom.agent_socket_id
    ) {
      chatRoom.status = "active";
      await chatRoom.save();

      io.to(chatRoom.agent_socket_id).emit(
        "employee:visitor-reconnected",
        {
          session_id,
          room_id: chatRoom.room_id,
        }
      );

      return;
    }

    chatRoom.status = "waiting";
    chatRoom.assigned_agent_id = null;
    chatRoom.agent_socket_id = null;
    chatRoom.is_agent_online = false;

    await chatRoom.save();

    io.to(`company_${company_id}`).emit(
      "employee:new-waiting-visitor",
      {
        session_id,
        room_id: chatRoom.room_id,
        chatRoomId: chatRoom._id,
      }
    );

  } catch (err) {
    console.error("resumeVisitorChat error:", err.message);
  }
};

/* ===================================================
   VISITOR DISCONNECT (UNCHANGED)
=================================================== */

export const handleVisitorDisconnect = async (io, socket) => {
  try {
    const chatRoom = await ChatRoom.findOne({
      visitor_socket_id: socket.id,
      status: { $in: ["waiting", "active"] },
    });

    if (!chatRoom) return;

    chatRoom.is_visitor_online = false;
    chatRoom.visitor_socket_id = null;
    chatRoom.status = "disconnected";

    await chatRoom.save();

    if (
      chatRoom.assigned_agent_id &&
      chatRoom.is_agent_online &&
      chatRoom.agent_socket_id
    ) {
      io.to(chatRoom.agent_socket_id).emit(
        "employee:visitor-disconnected",
        {
          session_id: chatRoom.session_id,
          room_id: chatRoom.room_id,
          chatRoomId: chatRoom._id,
        }
      );
      return;
    }

    io.to(`company_${chatRoom.company_id}`).emit(
      "employee:visitor-disconnected",
      {
        session_id: chatRoom.session_id,
        room_id: chatRoom.room_id,
        chatRoomId: chatRoom._id,
      }
    );

  } catch (err) {
    console.error("handleVisitorDisconnect error:", err.message);
  }
};

/* ===================================================
   VISITOR LEAVE  ✅ FIXED SECURITY
=================================================== */

export const handleVisitorLeave = async (io, socket, payload) => {
  try {
    const { company_apikey, session_id } = payload;
    if (!company_apikey || !session_id) return;

    const company_id = await validateCompany(company_apikey);
    if (!company_id) return;

    const chatRoom = await ChatRoom.findOne({
      company_id, // ✅ FIXED
      session_id,
      status: { $in: ["waiting", "active", "disconnected"] },
    });

    if (!chatRoom) return;

    chatRoom.status = "closed";
    chatRoom.closed_by = "visitor";
    chatRoom.closed_at = new Date();
    chatRoom.is_visitor_online = false;
    chatRoom.visitor_socket_id = null;

    await chatRoom.save();

    if (
      chatRoom.assigned_agent_id &&
      chatRoom.is_agent_online &&
      chatRoom.agent_socket_id
    ) {
      io.to(chatRoom.agent_socket_id).emit(
        "employee:visitor-left-chat",
        {
          session_id,
          room_id: chatRoom.room_id,
          chatRoomId: chatRoom._id,
        }
      );
      return;
    }

    io.to(`company_${company_id}`).emit(
      "employee:visitor-left-waiting",
      {
        session_id,
        room_id: chatRoom.room_id,
        chatRoomId: chatRoom._id,
      }
    );

  } catch (err) {
    console.error("handleVisitorLeave error:", err.message);
  }
};

