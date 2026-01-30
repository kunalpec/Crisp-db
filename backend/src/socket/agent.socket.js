import { ChatRoom } from "../models/ChatRoom.model.js";

/**
 * 1️⃣ Employee connection verification
 */
export const registerEmployeeSocket = (socket, io) => {
  // JWT uses snake_case: _id, company_id
  const userId = socket.user._id;
  const companyId = socket.user.company_id;
  const role = socket.user.role;
  const email = socket.user.email;

  socket.emit("employee:connected", {
    userId,
    companyId,
    role,
    email,
  });
};

/**
 * 2️⃣ Verify employee can access a room
 */
export const JoinRoomById = (socket, io) => {
  socket.on("employee:verify-room", async ({ room_id }) => {
    if (!room_id) {
      return socket.emit("employee:verify-failed", "ROOM_ID_REQUIRED");
    }

    try {
      const companyId = socket.user.company_id; // JWT uses snake_case

      const room = await ChatRoom.findOne({
        room_id,
        company_id: companyId,
        status: { $ne: "closed" },
      });

      if (!room) {
        return socket.emit("employee:verify-failed", "ROOM_NOT_AUTHORIZED");
      }

      socket.emit("employee:verify-success", {
        room_id: room.room_id,
      });
    } catch (err) {
      console.error("Employee verify error:", err);
      socket.emit("employee:verify-failed", "SERVER_ERROR");
    }
  });
};


// check the waiting room
export const waitingRoom = (socket, io) => {
  socket.on("employee:waiting", async () => {
    try {

      const companyId = socket.user.company_id; // JWT uses snake_case

      if (!companyId) {
        return socket.emit("employee:waiting-rooms", []);
      }

      const rooms = await ChatRoom.find({
        company_id: companyId,
        status: "waiting", // make sure DB has same value
      })
        .select("room_id visitor_id createdAt")
        .lean();

      socket.emit("employee:waiting-rooms", rooms);
    } catch (err) {
      socket.emit("employee:waiting-error", "SERVER_ERROR");
    }
  });
};
