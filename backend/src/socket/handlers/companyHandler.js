// employee connection to company
// reconnect 1-if connected to visitor room or 2-if not connecyed t visitor room
// disconnected to 1-if in visitor room or 2-not in visitor room
// leave the room 1-if in visitor room

import { CompanyUser } from "../../models/CompanyUser.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";

/* ===================================================
   EMPLOYEE CONNECT / RECONNECT
=================================================== */

export const handleEmployeeConnect = async (io, socket) => {
  try {
    if (!socket.user) return;

    const { _id, company_id, role } = socket.user;

    if (!["company_agent", "company_admin"].includes(role)) return;

    await CompanyUser.findByIdAndUpdate(_id, {
      is_online: true,
      socket_id: socket.id,
    });

    socket.join(`company_${company_id}`);

    const activeChat = await ChatRoom.findOne({
      company_id,
      assigned_agent_id: _id,
      status: "active",
    });

    if (activeChat) {
      socket.join(activeChat.room_id);

      activeChat.agent_socket_id = socket.id;
      activeChat.is_agent_online = true;
      await activeChat.save();

      // 🔥 Notify visitor that agent reconnected
      if (activeChat.is_visitor_online && activeChat.visitor_socket_id) {
        io.to(activeChat.visitor_socket_id).emit(
          "visitor:agent-reconnected"
        );
      }
    }

  } catch (err) {
    console.error("handleEmployeeConnect error:", err.message);
  }
};

export const handleEmployeeDisconnect = async (io, socket) => {
  try {
    if (!socket.user) return;

    const { _id, company_id } = socket.user;

    await CompanyUser.findByIdAndUpdate(_id, {
      is_online: false,
      socket_id: null,
    });

    const chatRoom = await ChatRoom.findOne({
      company_id,
      assigned_agent_id: _id,
      status: "active",
    });

    if (!chatRoom) return;

    chatRoom.is_agent_online = false;
    chatRoom.agent_socket_id = null;
    chatRoom.status = "waiting";
    chatRoom.assigned_agent_id = null;

    await chatRoom.save();

    /* 🔥 Notify Visitor */
    if (chatRoom.is_visitor_online && chatRoom.visitor_socket_id) {
      io.to(chatRoom.visitor_socket_id).emit(
        "visitor:agent-disconnected"
      );
    }

    /* 🔥 Notify Company Dashboard */
    io.to(`company_${chatRoom.company_id}`).emit(
      "employee:chat-back-to-queue",
      {
        room_id: chatRoom.room_id,
        chatRoomId: chatRoom._id,
      }
    );

  } catch (err) {
    console.error("handleEmployeeDisconnect error:", err.message);
  }
};

export const handleEmployeeLeaveRoom = async (io, socket, payload) => {
  try {
    if (!socket.user) return;

    const { room_id } = payload;
    const { _id, company_id } = socket.user;

    if (!room_id) return;

    const chatRoom = await ChatRoom.findOne({
      company_id,
      room_id,
      assigned_agent_id: _id,
      status: "active",
    });

    if (!chatRoom) return;

    chatRoom.status = "waiting";
    chatRoom.assigned_agent_id = null;
    chatRoom.agent_socket_id = null;
    chatRoom.is_agent_online = false;

    await chatRoom.save();

    socket.leave(room_id);

    /* 🔥 Notify Visitor */
    if (chatRoom.is_visitor_online && chatRoom.visitor_socket_id) {
      io.to(chatRoom.visitor_socket_id).emit(
        "visitor:agent-left"
      );
    }

    /* 🔥 Notify Dashboard */
    io.to(`company_${chatRoom.company_id}`).emit(
      "employee:chat-back-to-queue",
      {
        room_id,
        chatRoomId: chatRoom._id,
      }
    );

  } catch (err) {
    console.error("handleEmployeeLeaveRoom error:", err.message);
  }
};

/* ===================================================
   1️⃣ JOIN VISITOR CHATROOM (ASSIGN CHAT)
=================================================== */
export const handleEmployeeJoinVisitorRoom = async (
  io,
  socket,
  payload
) => {
  try {
    if (!socket.user) return;

    const { room_id } = payload;
    const { _id, company_id } = socket.user;

    if (!room_id) return;

    // 🔒 Atomic assignment → prevent double assignment
    const chatRoom = await ChatRoom.findOneAndUpdate(
      {
        company_id,
        room_id,
        status: "waiting",
        assigned_agent_id: null,
      },
      {
        status: "active",
        assigned_agent_id: _id,
        agent_socket_id: socket.id,
        is_agent_online: true,
      },
      { new: true }
    );

    if (!chatRoom) {
      socket.emit("employee:room-already-assigned");
      return;
    }

    // Join socket room
    socket.join(room_id);

    /* 🔥 Notify Visitor */
    if (chatRoom.is_visitor_online && chatRoom.visitor_socket_id) {
      io.to(chatRoom.visitor_socket_id).emit(
        "visitor:agent-joined",
        { room_id }
      );
    }

    /* 🔥 Notify Dashboard (remove from waiting list) */
    io.to(`company_${company_id}`).emit(
      "employee:visitor-assigned",
      {
        session_id: chatRoom.session_id,
        room_id: chatRoom.room_id,
      }
    );

  } catch (err) {
    console.error(
      "handleEmployeeJoinVisitorRoom error:",
      err.message
    );
  }
};

/* ===================================================
   2️⃣ SEND WAITING CHATS TO EMPLOYEE
   (Used on employee connect / refresh)
=================================================== */
export const handleSendWaitingToEmployee = async (
  io,
  socket
) => {
  try {
    if (!socket.user) return;

    const { company_id } = socket.user;

    // Get all waiting chats
    const waitingChats = await ChatRoom.find({
      company_id,
      status: "waiting",
    }).select("session_id room_id");

    socket.emit("employee:waiting-list", waitingChats);

  } catch (err) {
    console.error(
      "handleSendWaitingToEmployee error:",
      err.message
    );
  }
};
