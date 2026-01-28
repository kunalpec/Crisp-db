import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  console.log(`Socket is running on port ${process.env.PORT}`);
  io = new Server(server, {
    cors: {
      origin: "*", // change for production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
