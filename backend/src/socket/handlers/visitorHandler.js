import { Visitor } from "../../models/Visitors.model.js";
import { Company } from "../../models/Company.model.js";
import { ApiKey } from "../../models/ApiKey.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { getCompanyRoomId, getVisitorRoomId } from "../rooms.js";

const RECONNECT_GRACE_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Handle visitor verification (FIRST TIME)
 */
export const handleVisitorVerification = async (socket, io, payload) => {
  try {
    const { session_id, company_apikey, user_info, current_page } = payload;

    if (!session_id || !company_apikey) {
      return socket.emit("verify:failed", {
        message: "Session ID and API key are required",
      });
    }

    // Validate API key
    const apiKey = await ApiKey.findOne({ api_key_hash: company_apikey });
    if (!apiKey) {
      return socket.emit("verify:failed", { message: "INVALID_API_KEY" });
    }

    // Validate company
    const company = await Company.findById(apiKey.company_id);
    if (!company || company.status !== "active") {
      return socket.emit("verify:failed", { message: "COMPANY_NOT_ACTIVE" });
    }

    // Find or create visitor
    let visitor = await Visitor.findOne({
      company_id: company._id,
      session_id,
    });

    if (!visitor) {
      visitor = await Visitor.create({
        company_id: company._id,
        session_id,
        user_info,
        current_page,
        socket_id: socket.id,
        is_verified: true,
      });
    } else {
      await Visitor.updateOne(
        { _id: visitor._id },
        {
          socket_id: socket.id,
          is_verified: true,
          user_info,
          current_page,
        }
      );
    }

    const visitorRoomId = getVisitorRoomId(session_id);

    // Find or create chat room
    let room = await ChatRoom.findOne({
      company_id: company._id,
      visitor_id: visitor._id,
      status: { $ne: "closed" },
    });

    const isNewVisitor = !room;

    if (!room) {
      room = await ChatRoom.create({
        company_id: company._id,
        visitor_id: visitor._id,
        status: "waiting",
        room_id: visitorRoomId,
        closed_at: null,
      });
    } else if (room.closed_at) {
      await ChatRoom.updateOne(
        { _id: room._id },
        { $set: { closed_at: null } }
      );
    }

    await socket.join(visitorRoomId);

    // Notify employees only on first-time visitor
    if (isNewVisitor) {
      const companyRoomId = getCompanyRoomId(company._id);

      io.to(companyRoomId).emit("visitor:connected", {
        visitorSessionId: session_id,
        roomId: visitorRoomId,
        user_info,
        current_page,
      });
    }

    // Notify visitor
    socket.emit("visitor:connected", {
      visitorSessionId: session_id,
      roomId: visitorRoomId,
      user_info,
      current_page,
    });

    console.log(`Visitor ${session_id} joined room ${visitorRoomId}`);
  } catch (error) {
    console.error("Visitor verification error:", error);
    socket.emit("verify:failed", { message: "SERVER_ERROR" });
  }
};

/**
 * Handle visitor reconnection (WITHIN 30 MINUTES)
 */
export const handleVisitorReconnection = async (socket, io, { session_id }) => {
  try {
    if (!session_id) {
      return socket.emit("backend:verify-request");
    }

    const visitor = await Visitor.findOne({ session_id });
    if (!visitor || !visitor.is_verified) {
      return socket.emit("backend:verify-request");
    }

    await Visitor.updateOne(
      { _id: visitor._id },
      { $set: { socket_id: socket.id } }
    );

    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: "closed" },
      $or: [
        { closed_at: null },
        { closed_at: { $gte: new Date(Date.now() - RECONNECT_GRACE_TIME) } },
      ],
    });

    if (!room) {
      return socket.emit("backend:verify-request");
    }

    await ChatRoom.updateOne(
      { _id: room._id },
      { $set: { closed_at: null } }
    );

    const visitorRoomId = getVisitorRoomId(session_id);
    await socket.join(visitorRoomId);

    socket.emit("visitor:connected", {
      visitorSessionId: session_id,
      roomId: visitorRoomId,
      user_info: visitor.user_info,
      current_page: visitor.current_page,
    });

    const companyRoomId = getCompanyRoomId(room.company_id);

    io.to(companyRoomId).emit("visitor:connected", {
      visitorSessionId: session_id,
      roomId: visitorRoomId,
      user_info: visitor.user_info,
      current_page: visitor.current_page,
    });

    console.log(`Visitor ${session_id} reconnected`);
  } catch (error) {
    console.error("Visitor reconnection error:", error);
    socket.emit("backend:verify-request");
  }
};

/**
 * Handle visitor disconnection
 */
export const handleVisitorDisconnection = async (socket, io) => {
  try {
    const visitor = await Visitor.findOne({ socket_id: socket.id });
    if (!visitor) return;

    await Visitor.updateOne(
      { _id: visitor._id },
      { $set: { socket_id: null } }
    );

    await ChatRoom.updateOne(
      {
        visitor_id: visitor._id,
        room_id: getVisitorRoomId(visitor.session_id),
        status: { $ne: "closed" },
      },
      { $set: { closed_at: new Date() } }
    );

    const companyRoomId = getCompanyRoomId(visitor.company_id);

    io.to(companyRoomId).emit("visitor:disconnected", {
      visitorSessionId: visitor.session_id,
    });

    console.log(`Visitor ${visitor.session_id} disconnected`);
  } catch (error) {
    console.error("Visitor disconnection error:", error);
  }
};
