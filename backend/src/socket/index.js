import { Server } from "socket.io";
import { SocketAuth } from "../middlewares/SocketAuth.middleware.js";

/* ================================
   VISITOR HANDLERS
================================ */
import {
  createNewVisitor,
  resumeVisitorRoom,
  visitorLoadHistory,
  visitorTyping,
  visitorStopTyping,
  visitorLeaveRoom,
  visitorOffline,
} from "./handlers/visitorHandler.js";

/* ================================
   EMPLOYEE HANDLERS
================================ */
import {
  handleEmployeeConnect,
  employeeReady,
  employeeJoinRoom,
  employeeResumeRoom,
  employeeLoadHistory,
  employeeTyping,
  employeeStopTyping,
  employeeLeaveRoom,
  employeeOffline,
} from "./handlers/companyHandler.js";

/* ================================
   MESSAGE HANDLER
================================ */
import { handleSendMessage } from "./handlers/messageHandler.js";

/* ======================================================
   ✅ INIT SOCKET SERVER
====================================================== */
export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  /* ======================================================
     ✅ SOCKET AUTH
  ====================================================== */
  io.use(SocketAuth);

  /* ======================================================
     ✅ MAIN CONNECTION
  ====================================================== */
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id, "| Role:", socket.role);

    /* ======================================================
       ================= VISITOR SOCKET =====================
    ====================================================== */
    if (socket.role === "visitor") {
      console.log("👤 Visitor Connected");

      socket.on("visitor:create-new", (payload, cb) =>{
        createNewVisitor(io, socket, payload, cb)
        console.log("visitor ban rha ha");}
      );

      socket.on("visitor:resume-room", (payload) =>
        resumeVisitorRoom(io, socket, payload)
      );

      socket.on("visitor:load-history", (payload) =>
        visitorLoadHistory(io, socket, payload)
      );

      socket.on("visitor:send-message", (payload, cb) =>
        handleSendMessage(io, socket, payload, cb)
      );

      /* ✅ FIXED TYPING EVENTS */
      socket.on("visitor:typing", (payload) =>
        visitorTyping(io, socket, payload)
      );

      socket.on("visitor:stop-typing", (payload) =>
        visitorStopTyping(io, socket, payload)
      );

      socket.on("visitor:leave-room", (payload) =>
        visitorLeaveRoom(io, socket, payload)
      );
    }

    /* ======================================================
       ================= EMPLOYEE SOCKET =====================
    ====================================================== */
    else if (socket.role === "employee") {
      console.log("👨‍💻 Employee Connected");

      handleEmployeeConnect(io, socket);

      socket.on("employee:ready", () =>
        employeeReady(io, socket)
      );

      socket.on("employee:join-room", (payload) =>
        employeeJoinRoom(io, socket, payload)
      );

      socket.on("employee:resume-room", (payload) =>
        employeeResumeRoom(io, socket, payload)
      );

      socket.on("employee:load-history", (payload) =>
        employeeLoadHistory(io, socket, payload)
      );

      socket.on("employee:send-message", (payload, cb) =>
        handleSendMessage(io, socket, payload, cb)
      );

      socket.on("employee:typing", (payload) =>
        employeeTyping(io, socket, payload)
      );

      socket.on("employee:stop-typing", (payload) =>
        employeeStopTyping(io, socket, payload)
      );

      socket.on("employee:leave-room", (payload) =>{
        employeeLeaveRoom(io, socket, payload);
        console.log("employee:leave-room call");
      });
    }

    /* ======================================================
       ❌ UNKNOWN ROLE SAFETY
    ====================================================== */
    else {
      console.log("❌ Unknown socket role:", socket.role);
      socket.disconnect();
    }

    /* ======================================================
       ✅ GLOBAL DISCONNECT HANDLER (MOST IMPORTANT)
    ====================================================== */
    socket.on("disconnect", async () => {
      console.log("❌ Socket Disconnected:", socket.id);

      try {
        if (socket.role === "visitor") {
          await visitorOffline(io, socket, {
            room_id: socket.room_id,
          });
        }

        if (socket.role === "employee") {
          await employeeOffline(io, socket);
        }
      } catch (err) {
        console.log("disconnect cleanup error:", err.message);
      }
    });
  });

  return io;
};
