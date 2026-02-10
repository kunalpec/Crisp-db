import { Server } from 'socket.io';
import { SocketAuth } from '../middlewares/SocketAuth.middleware.js';

import {
  handleEmployeeConnect,
  handleEmployeeDisconnect,
  handleEmployeeLeaveRoom,
  handleEmployeeJoinVisitorRoom,
  handleSendWaitingToEmployee,
} from './handlers/companyHandler.js';

import {
  createNewVisitor,
  resumeVisitorChat,
  handleVisitorDisconnect,
  handleVisitorLeave,
} from './handlers/visitorHandler.js';

import { handleSendMessage } from './handlers/messageHandler.js';

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log('Socket.io initialized');

  io.use(SocketAuth);

  io.on('connection', async (socket) => {
    console.log('Socket connected:', socket.id, socket.role);

    /* ===================================================
       VISITOR SOCKET
    =================================================== */

    if (socket.role === 'visitor') {
      socket.on('visitor:create-new', async (payload) => {
        await createNewVisitor(io, socket, payload);
      });

      socket.on('visitor:resume-chat', async (payload) => {
        await resumeVisitorChat(io, socket, payload);
      });

      socket.on('visitor:sending-message-to-employee', async (payload) => {
        await handleSendMessage(io, socket, payload);
      });

      socket.on('visitor:me-typing', ({ room_id }) => {
        socket.to(room_id).emit('visitor:typing');
      });

      socket.on('visitor:me-stoptyping', ({ room_id }) => {
        socket.to(room_id).emit('visitor:stop-typing');
      });

      socket.on('visitor:leave-room', async (payload) => {
        await handleVisitorLeave(io, socket, payload);
      });
    } else if (

    /* ===================================================
       EMPLOYEE SOCKET
    =================================================== */
      socket.role === 'company_agent' ||
      socket.role === 'company_admin' ||
      socket.role === 'super_admin'
    ) {
      /* 🔥 CONNECT / RECONNECT */
      await handleEmployeeConnect(io, socket);

      /* 🔥 SEND WAITING LIST ON CONNECT */
      await handleSendWaitingToEmployee(io, socket);

      /* 🔥 JOIN VISITOR ROOM (ASSIGN) */
      socket.on('employee:join-room', async (payload) => {
        await handleEmployeeJoinVisitorRoom(io, socket, payload);
      });

      /* 🔥 SEND MESSAGE */
      socket.on('employee:sending-message-to-visitor', async (payload) => {
        await handleSendMessage(io, socket, payload);
      });

      /* 🔥 TYPING */
      socket.on('employee:me-typing', ({ room_id }) => {
        socket.to(room_id).emit('employee:typing');
      });

      socket.on('employee:me-stoptyping', ({ room_id }) => {
        socket.to(room_id).emit('employee:stop-typing');
      });

      /* 🔥 MANUAL LEAVE */
      socket.on('employee:leave-room', async (payload) => {
        await handleEmployeeLeaveRoom(io, socket, payload);
      });
    }

    /* ===================================================
       GLOBAL DISCONNECT
    =================================================== */

    socket.on('disconnect', async () => {
      console.log('Socket disconnected:', socket.id,socket.role);

      if (socket.role === 'visitor') {
        await handleVisitorDisconnect(io, socket);
      } else if (
        socket.role === 'company_agent' ||
        socket.role === 'company_admin' ||
        socket.role === 'super_admin'
      ) {
        await handleEmployeeDisconnect(io, socket);
      }
    });
  });
};

export { initSocket };
