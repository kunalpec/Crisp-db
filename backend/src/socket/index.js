import { Server } from 'socket.io';
import {
  registerVisitorVerification,
  joinRoomIfVerified,
  readVisitorMessage,
} from './visitor.socket.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connect', (socket) => {
    console.log('Socket connected:', socket.id);

    // Visitor
    registerVisitorVerification(socket, io);
    joinRoomIfVerified(socket, io);
    readVisitorMessage(socket, io);

    // Employee
    console.log("Employee",socket.id);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};
