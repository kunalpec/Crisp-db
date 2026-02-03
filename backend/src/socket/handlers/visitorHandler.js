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
      return socket.emit('verify:failed', { message: 'INVALID_REQUEST' });
    }

    // get the api key details
    const apiKey = await ApiKey.findOne({ api_key_hash: company_apikey });
    if (!apiKey) {
      return socket.emit('verify:failed', { message: 'INVALID_API_KEY' });
    }

    // with this get comapny
    const company = await Company.findById(apiKey.company_id);
    if (!company || company.status !== 'active') {
      return socket.emit('verify:failed', { message: 'COMPANY_NOT_ACTIVE' });
    }

    // find the visitor with this session ans compnay
    let visitor = await Visitor.findOne({
      company_id: company._id,
      session_id,
    });

    // if visitior not present then make the visitior
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
          user_info,
          current_page,
          is_verified: true,
        }
      );
    }

    // get the visitior room
    const visitorRoomId = getVisitorRoomId(session_id);

    // find the room with this visitior room id
    let room = await ChatRoom.findOne({
      company_id: company._id,
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
    });

    // if room not present then maker new visitor
    const isNewVisitor = !room;

    // make new room
    if (!room) {
      room = await ChatRoom.create({
        company_id: company._id,
        visitor_id: visitor._id,
        room_id: visitorRoomId,
        status: 'online',
        assigned_agent_id: null,
        closed_at: null,
      });
    }

    // do join visitor room
    socket.join(visitorRoomId);

    // give notification to visitor join
    if (isNewVisitor) {
      io.to(getCompanyRoomId(company._id)).emit('visitor:connected', {
        visitorSessionId: session_id,
        roomId: visitorRoomId,
        user_info,
        current_page,
      });
    }

    // Notify visitor
    socket.emit('visitor:connected', {
      visitorSessionId: session_id,
      roomId: visitorRoomId,
      user_info,
      current_page,
    });

    console.log(`Visitor ${session_id} verified`);
  } catch (error) {
    console.error(error);
    socket.emit('verify:failed', { message: 'SERVER_ERROR' });
  }
};

/* =====================================================
   HANDLE VISITOR RECONNECTION *
===================================================== */

export const handleVisitorReconnection = async (socket, io, { session_id }) => {
  try {
    if (!session_id) {
      return socket.emit('backend:verify-request');
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // 2. Find and update the visitor in one go (Atomic)
    const visitor = await Visitor.findOneAndUpdate(
      { session_id, is_verified: true },
      { $set: { socket_id: socket.id } }, // Crucial: Update socket_id for future disconnects
      { new: true }
    );

    if (!visitor) {
      console.log(`Reconnection failed: Visitor ${session_id} not found/verified`);
      return socket.emit('backend:verify-request');
    }

    // 3. Find the active or "grace period" room
    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
      $or: [
        { closed_at: null }, // Currently online
        { closed_at: { $gte: thirtyMinutesAgo } }, // Recently disconnected
      ],
    });

    if (!room) {
      console.log(`Reconnection failed: No active room for ${session_id}`);
      return socket.emit('backend:verify-request');
    }

    // 4. Restore room state: remove the disconnect timestamp
    await ChatRoom.updateOne({ _id: room._id }, { $set: { closed_at: null } });

    // 5. Join the physical socket room
    const visitorRoomId = room.room_id;
    socket.join(visitorRoomId);

    // 6. Notify the visitor they are back in
    socket.emit('visitor:connected', {
      visitorSessionId: session_id,
      roomId: visitorRoomId,
      user_info: visitor.user_info,
      current_page: visitor.current_page,
    });

    // 7. Notify the Agent or Dashboard
    if (room.assigned_agent_id) {
      // Find the agent to get their current socket_id
      const agent = await CompanyUser.findById(room.assigned_agent_id);
      const isAgentOnline = Boolean(agent && agent.socket_id);
      socket.emit('employee:joined-room', {
        roomId: visitorRoomId,
        agentpresent: isAgentOnline,
      });

      if (agent && agent.socket_id) {
        // Send notification directly to agent's current socket
        io.to(visitorRoomId).emit('visitor:reconnected', {
          visitorSessionId: session_id,
          roomId: visitorRoomId,
        });
      }

    } else {
      // Unassigned: Notify all company employees to update their waiting list
      io.to(getCompanyRoomId(room.company_id)).emit('visitor:connected', {
        visitorSessionId: session_id,
        roomId: visitorRoomId,
        user_info: visitor.user_info,
        current_page: visitor.current_page,
      });
    }

    console.log(`Visitor ${session_id} successfully reconnected to ${visitorRoomId}`);
  } catch (error) {
    console.error('Visitor reconnection error:', error);
    socket.emit('backend:verify-request');
  }
};

/* =====================================================
    HANDLE VISITOR DISCONNECTION *
===================================================== */
export const handleVisitorDisconnection = async (socket, io) => {
  try {
    // 1️⃣ Identify visitor
    const visitor = await Visitor.findOne({ socket_id: socket.id });
    if (!visitor) return;

    // 2️⃣ Clear visitor socket (keep verified)
    await Visitor.updateOne({ _id: visitor._id }, { $set: { socket_id: null } });

    // 3️⃣ Find active room
    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
    });

    if (!room) return;

    const now = new Date();

    // 4️⃣ ASSIGNED visitor (was in chat)
    if (room.assigned_agent_id) {
      // Start grace period ONLY
      await ChatRoom.updateOne({ _id: room._id }, { $set: { closed_at: now } });

      io.to(room.room_id).emit('visitor:disconnected', {
        visitorSessionId: visitor.session_id,
        roomId: room.room_id,
      });
    }
    // 5️⃣ UNASSIGNED visitor (waiting list)
    else {
      await ChatRoom.updateOne(
        { _id: room._id },
        {
          $set: {
            closed_at: now,
            status: 'online', // stays online for waiting logic
          },
        }
      );

      io.to(getCompanyRoomId(visitor.company_id)).emit('visitor:disconnected', {
        visitorSessionId: visitor.session_id,
        roomId: room.room_id,
      });
    }

    console.log(`⚠️ Visitor ${visitor.session_id} offline (Grace started)`);
  } catch (error) {
    console.error('Visitor disconnection error:', error);
  }
};

export const handleVisitorLeaveChat = async (socket, io, { session_id }) => {
  try {
    const visitor = await Visitor.findOne({ session_id });
    if (!visitor) return;

    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
    });

    if (!room) return;

    // 1️⃣ Close room immediately (NO grace period)
    await ChatRoom.updateOne(
      { _id: room._id },
      {
        status: 'closed',
        closed_at: new Date(),
        assigned_agent_id: null,
      }
    );

    // 2️⃣ Clear visitor socket
    await Visitor.updateOne({ _id: visitor._id }, { socket_id: null });

    // 3️⃣ Notify agent (if any)
    if (!room.assigned_agent_id) {
      io.to(getCompanyRoomId(room.company_id)).emit('visitor:left-chat', {
        visitorSessionId: session_id,
        roomId: room.room_id,
      });
    }

    console.log(`🚪 Visitor ${session_id} left chat intentionally`);
  } catch (err) {
    console.error('Visitor leave chat error:', err);
  }
};
