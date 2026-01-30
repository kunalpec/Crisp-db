import { Visitor } from '../../models/Visitors.model.js';
import { Company } from '../../models/Company.model.js';
import { ApiKey } from '../../models/ApiKey.model.js';
import { ChatRoom } from '../../models/ChatRoom.model.js';
import { getCompanyRoomId, getVisitorRoomId } from '../rooms.js';

/**
 * Handle visitor verification
 * - Validate API key
 * - Find or create visitor
 * - Create chat room
 * - Join visitor room
 * - Notify company room of new visitor
 */
export const handleVisitorVerification = async (socket, io, payload) => {
  try {
    const { session_id, company_apikey, user_info, current_page } = payload;

    if (!session_id || !company_apikey) {
      return socket.emit('verify:failed', { message: 'Session ID and API key are required' });
    }

    // 1. Validate API key
    const apiKey = await ApiKey.findOne({
      api_key_hash: company_apikey,
    });

    if (!apiKey) {
      return socket.emit('verify:failed', { message: 'INVALID_API_KEY' });
    }

    // 2. Validate company
    const company = await Company.findById(apiKey.company_id);
    if (!company || company.status !== 'active') {
      return socket.emit('verify:failed', { message: 'COMPANY_NOT_ACTIVE' });
    }

    // 3. Find or create visitor
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
      visitor.socket_id = socket.id;
      visitor.is_verified = true;
      await visitor.save();
    }

    // 4. Find or create chat room
    let room = await ChatRoom.findOne({
      company_id: company._id,
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
    });

    const visitorRoomId = getVisitorRoomId(session_id);
    const isNewVisitor = !room;

    if (!room) {
      room = await ChatRoom.create({
        company_id: company._id,
        visitor_id: visitor._id,
        status: 'waiting',
        room_id: visitorRoomId,
      });
    }

    // 5. Join visitor room
    await socket.join(visitorRoomId);

    // 6. Notify company room of new visitor (only if new)
    if (isNewVisitor) {
      const companyRoomId = getCompanyRoomId(company._id);
      io.to(companyRoomId).emit('visitor:connected', {
        visitorSessionId: session_id,
        visitorId: visitor._id,
        roomId: visitorRoomId,
        user_info,
        current_page,
        companyId: company._id,
      });
    }

    // 7. Confirm to visitor
    socket.emit('visitor:connected', {
      visitor_id: visitor._id,
      room_id: visitorRoomId,
      session_id,
    });

    console.log(`Visitor ${session_id} verified and joined room: ${visitorRoomId}`);
  } catch (error) {
    console.error('Visitor verification error:', error);
    socket.emit('verify:failed', { message: 'SERVER_ERROR' });
  }
};

/**
 * Handle visitor reconnection
 * - Rejoin visitor room if verified
 */
export const handleVisitorReconnection = async (socket, io, { session_id }) => {
  try {
    if (!session_id) {
      return socket.emit('backend:verify-request');
    }

    const visitor = await Visitor.findOne({ session_id });

    if (!visitor || !visitor.is_verified) {
      return socket.emit('backend:verify-request');
    }

    // Update socket ID
    visitor.socket_id = socket.id;
    await visitor.save();

    // Find room
    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
    });

    if (!room) {
      return socket.emit('backend:verify-request');
    }

    // Rejoin room
    const visitorRoomId = getVisitorRoomId(session_id);
    await socket.join(visitorRoomId);

    socket.emit('visitor:connected', {
      visitor_id: visitor._id,
      room_id: visitorRoomId,
      session_id,
    });

    console.log(`Visitor ${session_id} reconnected to room: ${visitorRoomId}`);
  } catch (error) {
    console.error('Visitor reconnection error:', error);
    socket.emit('backend:verify-request');
  }
};

/**
 * Handle visitor disconnection
 * - Update visitor socket ID
 * - Notify company room
 */
export const handleVisitorDisconnection = async (socket, io) => {
  try {
    // Find visitor by socket ID
    const visitor = await Visitor.findOne({ socket_id: socket.id });

    if (visitor) {
      visitor.socket_id = null;
      await visitor.save();

      // Notify company room
      const companyRoomId = getCompanyRoomId(visitor.company_id);
      io.to(companyRoomId).emit('visitor:disconnected', {
        visitorSessionId: visitor.session_id,
        visitorId: visitor._id,
      });

      console.log(`Visitor ${visitor.session_id} disconnected`);
    }
  } catch (error) {
    console.error('Visitor disconnection error:', error);
  }
};
