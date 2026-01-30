import { Server } from 'socket.io';
import { SocketAuth } from '../middlewares/SocketAuth.middleware.js';

// New socket handlers
import {
  handleEmployeeConnection,
  handleEmployeeDisconnection,
  handleJoinVisitorRoom,
  handleLeaveVisitorRoom,
  handleGetWaitingVisitors,
} from './handlers/companyHandler.js';

import {
  handleVisitorVerification,
  handleVisitorReconnection,
  handleVisitorDisconnection,
} from './handlers/visitorHandler.js';

import {
  handleSendMessage,
  handleTyping,
  handleStopTyping,
} from './handlers/messageHandler.js';

let io;

export const initSocket = (server) => {
  const PORT = process.env.PORT || 3000;
  console.log(`Socket.IO initialized on server port: ${PORT}`);
  
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // 🔐 AUTH (visitor + employee)
  io.use(SocketAuth);

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id, 'Role:', socket.role);

    // ============================================
    // EMPLOYEE HANDLERS
    // ============================================
    if (
      socket.role === 'company_agent' ||
      socket.role === 'company_admin' ||
      socket.role === 'super_admin'
    ) {
      // Automatically join company room on connection
      handleEmployeeConnection(socket, io);

      // Join company room explicitly (for compatibility)
      socket.on('joinCompanyRoom', (data) => {
        // JWT uses snake_case: _id, company_id
        const companyId = socket.user.company_id;
        const userId = socket.user._id;
        if (companyId) {
          const companyRoomId = `company_${companyId}`;
          socket.join(companyRoomId);
          console.log(`Employee ${userId} joined company room: ${companyRoomId}`);
        }
      });

      // Join visitor room
      socket.on('joinVisitorRoom', (data) => {
        handleJoinVisitorRoom(socket, io, data);
      });

      // Leave visitor room
      socket.on('leaveVisitorRoom', (data) => {
        handleLeaveVisitorRoom(socket, io, data);
      });

      // Get waiting visitors
      socket.on('employee:waiting', () => {
        handleGetWaitingVisitors(socket, io);
      });
    }

    // ============================================
    // VISITOR HANDLERS
    // ============================================
    if (socket.role === 'visitor') {
      // Visitor verification
      socket.on('frontend:verify-response', (payload) => {
        handleVisitorVerification(socket, io, payload);
      });

      // Visitor reconnection
      socket.on('visitor:hello', (data) => {
        handleVisitorReconnection(socket, io, data);
      });
    }

    // ============================================
    // MESSAGE HANDLERS (for both employees and visitors)
    // ============================================
    socket.on('sendMessage', (payload) => {
      handleSendMessage(socket, io, payload);
    });

    socket.on('typing', (payload) => {
      handleTyping(socket, io, payload);
    });

    socket.on('stopTyping', (payload) => {
      handleStopTyping(socket, io, payload);
    });

    // ============================================
    // DISCONNECTION HANDLERS
    // ============================================
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);

      if (socket.role === 'visitor') {
        handleVisitorDisconnection(socket, io);
      } else if (
        socket.role === 'company_agent' ||
        socket.role === 'company_admin' ||
        socket.role === 'super_admin'
      ) {
        handleEmployeeDisconnection(socket, io);
      }
    });
  });

  return io;
};
