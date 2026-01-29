import { Server } from 'socket.io';
import { SocketAuth } from '../middlewares/SocketAuth.middleware.js';

import {
  registerVisitorVerification,
  joinRoomIfVerified,
  readVisitorMessage,
} from './visitor.socket.js';
import { registerEmployeeSocket, JoinRoomById, waitingRoom } from './agent.socket.js';

let io;

export const initSocket = (server) => {
  console.log('Socket is running on port : 8000');
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // 🔐 AUTH (visitor + employee)
  io.use(SocketAuth);

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id, socket.role);

    if (socket.role === 'visitor') {
      registerVisitorVerification(socket, io);
      joinRoomIfVerified(socket, io);
      readVisitorMessage(socket, io);
    }

    if (
      socket.role === 'company_agent' ||
      socket.role === 'company_admin' ||
      socket.role === 'super_admin'
    ) {
      registerEmployeeSocket(socket, io);
      JoinRoomById(socket, io); // ✅ MUST be called
      waitingRoom(socket, io);
    }

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};
