import { Server } from "socket.io";
import { SocketAuth } from "../middlewares/SocketAuth.middleware.js";

// Employee handlers
import {
  handleEmployeeConnection,
  handleEmployeeDisconnection,
  handleJoinVisitorRoom,
  handleLeaveVisitorRoom,
  handleGetWaitingVisitors,
} from "./handlers/companyHandler.js";

// Visitor handlers
import {
  handleVisitorVerification,
  handleVisitorReconnection,
  handleVisitorDisconnection,
  handleVisitorLeaveChat, // ✅ ADD THIS
} from "./handlers/visitorHandler.js";

// Message handlers
import {
  handleSendMessage,
  handleTyping,
  handleStopTyping,
} from "./handlers/messageHandler.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("✅ Socket.IO initialized");

  // 🔐 AUTH (visitor + employee)
  io.use(SocketAuth);

  io.on("connection", (socket) => {
    console.log(
      "🔌 Socket connected:",
      socket.id,
      "Role:",
      socket.role
    );

    // =====================================================
    // EMPLOYEE HANDLERS
    // =====================================================
    if (
      socket.role === "company_agent" ||
      socket.role === "company_admin" ||
      socket.role === "super_admin"
    ) {
      // Auto join company room
      handleEmployeeConnection(socket, io);

      socket.on("joinVisitorRoom", (data) => {
        handleJoinVisitorRoom(socket, io, data);
      });

      socket.on("leaveVisitorRoom", (data) => {
        handleLeaveVisitorRoom(socket, io, data);
      });

      socket.on("employee:waiting", () => {
        handleGetWaitingVisitors(socket, io);
      });
    }

    // =====================================================
    // VISITOR HANDLERS
    // =====================================================
    if (socket.role === "visitor") {
      socket.on("frontend:verify-response", (payload) => {
        handleVisitorVerification(socket, io, payload);
      });

      socket.on("visitor:hello", (data) => {
        handleVisitorReconnection(socket, io, data);
      });

      socket.on("visitor:leave-chat",(data)=>{
        handleVisitorLeaveChat(socket,io,data);
      })
    }

    // =====================================================
    // MESSAGE HANDLERS (BOTH VISITOR & EMPLOYEE)
    // =====================================================
    socket.on("message:send", (payload) => {
      handleSendMessage(socket, io, payload);
    });

    socket.on("typing", (payload) => {
      handleTyping(socket, io, payload);
    });

    socket.on("stopTyping", (payload) => {
      handleStopTyping(socket, io, payload);
    });

    // =====================================================
    // DISCONNECT HANDLERS
    // =====================================================
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      if (socket.role === "visitor") {
        handleVisitorDisconnection(socket, io);
      } else if (
        socket.role === "company_agent" ||
        socket.role === "company_admin" ||
        socket.role === "super_admin"
      ) {
        handleEmployeeDisconnection(socket, io);
      }
    });
  });

  return io;
};
