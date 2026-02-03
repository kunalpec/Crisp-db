import { CompanyUser } from '../../models/CompanyUser.model.js';
import { ChatRoom } from '../../models/ChatRoom.model.js';
import { Visitor } from '../../models/Visitors.model.js';
import { getCompanyRoomId } from '../rooms.js';

// Handle employee connection & reconnection *
export const handleEmployeeConnection = async (socket, io) => {
  try {
    const { _id: userId, company_id: companyId, role, email } = socket.user;

    // 1. Mark employee online (Atomic update)
    await CompanyUser.findByIdAndUpdate(userId, {
      is_online: true,
      socket_id: socket.id,
    });

    // 2. Join company-wide room for dashboard updates
    const companyRoomId = getCompanyRoomId(companyId);
    await socket.join(companyRoomId);

    // 3. Find active chats to reconnect
    const reconnectRooms = await ChatRoom.find({
      assigned_agent_id: userId,
      status: { $ne: 'closed' }, // More robust than checking specific statuses
      closed_at: null,
    });

    // Use Promise.all if you have many rooms, or keep the loop for clarity
    for (const room of reconnectRooms) {
      await socket.join(room.room_id);

      // Restore state
      room.status = 'both-active';
      await room.save();

      // Notify the employee UI to open this chat tab
      socket.emit('employee:reconnected-room', {
        room_id: room.room_id,
        visitor_id: room.visitor_id
      });

      // Notify visitor ONLY (socket.to excludes the sender)
      socket.to(room.room_id).emit('visitor:agent-reconnected', {
        room_id: room.room_id,
        message: 'Agent is back online',
      });
    }

    // 4. Notify other dashboard users that this agent is online
    io.to(companyRoomId).emit('employee:connected', { userId, email });

    console.log(`Employee synced: ${email}`);
  } catch (error) {
    console.error('Connection Error:', error);
    socket.emit('error', { message: 'Failed to sync employee state' });
  }
};

// Handle employee disconnection *
export const handleEmployeeDisconnection = async (socket) => {
  try {
    if (!socket.user) return;

    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    await CompanyUser.findByIdAndUpdate(userId, {
      is_online: false,
      socket_id: null,
    });

    /**
     * Grace mode:
     * visitor online, agent reserved
     */
    await ChatRoom.updateMany(
      {
        company_id: companyId,
        assigned_agent_id: userId,
        status: 'both-active',
      },
      {
        $set: { status: 'online' },
      }
    );

    const companyRoomId = getCompanyRoomId(companyId);
    socket.to(companyRoomId).emit('employee:disconnected', {
      userId,
      companyId,
    });

    console.log(`Employee ${userId} disconnected (grace mode)`);
  } catch (error) {
    console.error('Employee disconnection error:', error);
  }
};

// employee leave room *
export const handleLeaveVisitorRoom = async (socket, io, { visitorSessionId }) => {
  try {
    const userId = socket.user._id;
    const companyId = socket.user.company_id;
    const roomId = `visitor_${visitorSessionId}`;

    // 1 Leave socket room
    socket.leave(roomId);

    // 2 Update DB (IMPORTANT)
    await ChatRoom.updateOne(
      {
        company_id: companyId,
        room_id: roomId,
        assigned_agent_id: userId,
      },
      {
        $set: {
          assigned_agent_id: null,
          status: "online", // visitor waiting
        },
      }
    );

    // 3 Notify visitor
    io.to(roomId).emit("employee:left-room", {
      system: true,
      message: "Agent left the chat",
    });

    // 4️ Notify employees (waiting list)
    io.to(getCompanyRoomId(companyId)).emit("visitor:back-to-waiting", {
      visitorSessionId,
    });

    // 5 send the room leave notification to employee
    socket.emit("employee:left-room-success");

    console.log(` Agent ${userId} LEFT room ${roomId}`);
  } catch (error) {
    console.error(error);
    socket.emit("error", { message: "Leave failed" });
  }
};

// handle the join of employee
export const handleJoinVisitorRoom = async (socket, io, { visitorSessionId }) => {
  try {
    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    if (!visitorSessionId) {
      return socket.emit("error", { message: "Visitor session ID required" });
    }

    // 1. Find the visitor
    const visitor = await Visitor.findOne({
      session_id: visitorSessionId,
      company_id: companyId,
    });

    if (!visitor) {
      return socket.emit("error", { message: "Visitor not found" });
    }

    // 2. Find the room and ensure it's not already taken (using findOneAndUpdate for atomicity)
    // We check status: "online" and assigned_agent_id: null to prevent race conditions
    const chatRoom = await ChatRoom.findOneAndUpdate(
      {
        company_id: companyId,
        visitor_id: visitor._id,
        status: "online",
        assigned_agent_id: null, // Critical check
        closed_at: null,
      },
      {
        $set: {
          assigned_agent_id: userId,
          status: "both-active",
        },
      },
      { new: true } // Returns the updated document
    );

    if (!chatRoom) {
      return socket.emit("error", { message: "Visitor is no longer available or already assigned" });
    }

    // 3. Join the socket room
    // Use the exact room_id stored in the DB
    socket.join(chatRoom.room_id);

    // 4. Success notification to the JOINING agent
    socket.emit("employee:joined-room-success", {
      roomId: chatRoom.room_id,
      visitorSessionId,

    });

    // 5. Notify the Visitor (and anyone else in the room)
    // We use io.to() because the visitor is already in this room
    io.to(chatRoom.room_id).emit("employee:joined-room", {
      employeeId: userId,
      roomId: chatRoom.room_id,
      agentpresent:true,
    });

    // 6. BROADCAST to all other employees in the company dashboard
    // This tells their UI to REMOVE this visitor from the "Waiting" list
    const companyRoomId = getCompanyRoomId(companyId);
    socket.to(companyRoomId).emit("visitor:assigned", {
      visitorSessionId,
      assignedAgentId: userId,
    });

    console.log(`✅ Employee ${userId} joined Room ${chatRoom.room_id}`);
  } catch (error) {
    console.error("Join Room Error:", error);
    socket.emit("error", { message: "An unexpected error occurred while joining" });
  }
};

export const handleGetWaitingVisitors = async (socket, io) => {
  try {
    const companyId = socket.user.company_id;

    const waitingRooms = await ChatRoom.find({
      company_id: companyId,
      status: 'online',
      assigned_agent_id: null,
      closed_at: null,
    })
      .populate('visitor_id', 'session_id')
      .lean();

    // ✅ Extract ONLY session_id
    const sessionIds = waitingRooms
      .map(room => room.visitor_id?.session_id)
      .filter(Boolean); // safety

    io.to(getCompanyRoomId(companyId))
      .emit('employee:waiting-rooms', sessionIds);

  } catch (error) {
    console.error(error);
    socket.emit('error', { message: 'Failed to load waiting visitors' });
  }
};
