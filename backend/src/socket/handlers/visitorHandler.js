import { Visitor } from '../../models/Visitors.model.js';
import { Company } from '../../models/Company.model.js';
import { CompanyUser } from '../../models/CompanyUser.model.js';
import { ApiKey } from '../../models/ApiKey.model.js';
import { ChatRoom } from '../../models/ChatRoom.model.js';
import { getCompanyRoomId, getVisitorRoomId } from '../rooms.js';

//  1. Calculate the cutoff point (e.g., if it's 5:00 PM now, this is 4:30 PM)

// HANDLE VISITOR VERIFICATION (FIRST TIME) *
export const handleVisitorVerification = async (socket, io, payload) => {
  try {
    const { session_id, company_apikey, user_info, current_page } = payload;

    if (!session_id || !company_apikey) {
      return socket.emit("verify:failed", { message: "INVALID_REQUEST" });
    }

    const apiKey = await ApiKey.findOne({ api_key_hash: company_apikey });
    if (!apiKey) {
      return socket.emit("verify:failed", { message: "INVALID_API_KEY" });
    }

    const company = await Company.findById(apiKey.company_id);

    if (!company || company.status !== "active" || company.isBlocked) {
      return socket.emit("verify:failed", { message: "COMPANY_NOT_ACTIVE" });
    }

    // Atomic visitor upsert
    const visitor = await Visitor.findOneAndUpdate(
      { company_id: company._id, session_id },
      {
        $set: {
          socket_id: socket.id,
          user_info,
          current_page,
          is_verified: true,
        },
      },
      { upsert: true, new: true }
    );

    const visitorRoomId = getVisitorRoomId(session_id);

    // Atomic room upsert
    const room = await ChatRoom.findOneAndUpdate(
      {
        company_id: company._id,
        visitor_id: visitor._id,
        status: { $ne: "closed" },
      },
      {
        $setOnInsert: {
          room_id: visitorRoomId,
          status: "online",
          assigned_agent_id: null,
          closed_at: null,
        },
      },
      { upsert: true, new: true }
    );

    socket.join(visitorRoomId);

    socket.emit("visitor:connected", {
      visitorSessionId: session_id,
      roomId: visitorRoomId,
      user_info,
      current_page,
    });

    io.to(getCompanyRoomId(company._id)).emit("visitor:connected", {
      visitorSessionId: session_id,
      roomId: visitorRoomId,
      user_info,
      current_page,
    });

  } catch (error) {
    console.error("Visitor verification error:", error);
    socket.emit("verify:failed", { message: "SERVER_ERROR" });
  }
};



/* =====================================================
   HANDLE VISITOR RECONNECTION *
===================================================== */

export const handleVisitorReconnection = async (socket, io, { session_id }) => {
  try {
    if (!session_id) {
      return socket.emit("backend:verify-request");
    }

    const visitor = await Visitor.findOneAndUpdate(
      { session_id, is_verified: true },
      { $set: { socket_id: socket.id } },
      { new: true }
    );

    if (!visitor) {
      return socket.emit("backend:verify-request");
    }

    const company = await Company.findById(visitor.company_id);

    if (!company || company.status !== "active" || company.isBlocked) {
      return socket.emit("backend:verify-request");
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: "closed" },
      $or: [
        { closed_at: null },
        { closed_at: { $gte: thirtyMinutesAgo } },
      ],
    });

    if (!room) {
      return socket.emit("backend:verify-request");
    }

    await ChatRoom.updateOne(
      { _id: room._id },
      { $set: { closed_at: null } }
    );

    socket.join(room.room_id);

    socket.emit("visitor:connected", {
      visitorSessionId: session_id,
      roomId: room.room_id,
      user_info: visitor.user_info,
      current_page: visitor.current_page,
    });

    if (room.assigned_agent_id) {
      const agent = await CompanyUser.findById(room.assigned_agent_id);
      const isAgentOnline = Boolean(agent?.socket_id);

      socket.emit("employee:joined-room", {
        roomId: room.room_id,
        agentpresent: isAgentOnline,
      });

      if (isAgentOnline) {
        io.to(room.room_id).emit("visitor:reconnected", {
          visitorSessionId: session_id,
          roomId: room.room_id,
        });
      }
    } else {
      io.to(getCompanyRoomId(company._id)).emit("visitor:connected", {
        visitorSessionId: session_id,
        roomId: room.room_id,
        user_info: visitor.user_info,
        current_page: visitor.current_page,
      });
    }

  } catch (error) {
    console.error("Visitor reconnection error:", error);
    socket.emit("backend:verify-request");
  }
};


/* =====================================================
    HANDLE VISITOR DISCONNECTION *
===================================================== */
export const handleVisitorDisconnection = async (socket, io) => {
  try {
    const visitor = await Visitor.findOne({ socket_id: socket.id });
    if (!visitor) return;

    await Visitor.updateOne(
      { _id: visitor._id },
      { $set: { socket_id: null } }
    );

    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: "closed" },
    });

    if (!room) return;

    const now = new Date();

    if (room.assigned_agent_id) {
      await ChatRoom.updateOne(
        { _id: room._id },
        { $set: { closed_at: now } }
      );

      io.to(room.room_id).emit("visitor:disconnected", {
        visitorSessionId: visitor.session_id,
        roomId: room.room_id,
      });

    } else {

      await ChatRoom.updateOne(
        { _id: room._id },
        { $set: { closed_at: now } }
      );

      io.to(getCompanyRoomId(visitor.company_id)).emit(
        "visitor:disconnected",
        {
          visitorSessionId: visitor.session_id,
          roomId: room.room_id,
        }
      );
    }

  } catch (error) {
    console.error("Visitor disconnection error:", error);
  }
};


// leave the room *
export const handleVisitorLeaveChat = async (socket, io, { session_id }) => {
  try {
    const visitor = await Visitor.findOne({ session_id });
    if (!visitor) return;

    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: "closed" },
    });

    if (!room) return;

    await ChatRoom.updateOne(
      { _id: room._id },
      {
        status: "closed",
        closed_at: new Date(),
        assigned_agent_id: null,
      }
    );

    await Visitor.updateOne(
      { _id: visitor._id },
      { $set: { socket_id: null } }
    );

    io.to(room.room_id).emit("chat:closed", {
      visitorSessionId: session_id,
      roomId: room.room_id,
    });

  } catch (error) {
    console.error("Visitor leave chat error:", error);
  }
};

