import { Visitor } from '../models/Visitors.model.js';
import { Company } from '../models/Company.model.js';
import { ApiKey } from '../models/ApiKey.model.js';
import { ChatRoom } from '../models/ChatRoom.model.js';

// verify
export const registerVisitorVerification = (socket) => {
  socket.on('frontend:verify-response', async (payload) => {
    try {
      const { session_id, company_apikey, user_info, current_page } = payload;

      // 1️⃣ Validate API key
      const apiKey = await ApiKey.findOne({
        api_key_hash: company_apikey,
      });
      if (!apiKey) {
        return socket.emit('verify:failed', 'INVALID_API_KEY');
      }

      // 2️⃣ Validate company
      const company = await Company.findById(apiKey.company_id);
      if (!company || company.status !== 'active') {
        return socket.emit('verify:failed', 'COMPANY_NOT_ACTIVE');
      }

      // 3️⃣ Find or create visitor
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

      // 4️⃣ Find or create chat room (IMPORTANT)
      let room = await ChatRoom.findOne({
        company_id: company._id,
        visitor_id: visitor._id,
        status: { $ne: 'closed' },
      });

      if (!room) {
        room = await ChatRoom.create({
          company_id: company._id,
          visitor_id: visitor._id,
          status: 'waiting',
          room_id: `company:${company._id}:visitor:${visitor._id}`,
        });
      }

      // 5️⃣ Join room
      socket.join(room.room_id);

      // 6️⃣ Notify frontend
      socket.emit('visitor:connected', {
        visitor_id: visitor._id,
        room_id: room.room_id,
      });
    } catch (err) {
      console.error('Visitor verify error:', err);
      socket.emit('verify:failed', 'SERVER_ERROR');
    }
  });
};

// make the room
export const joinRoomIfVerified = (socket, io) => {
  socket.on('visitor:hello', async ({ session_id }) => {
    if (!session_id) return;

    const visitor = await Visitor.findOne({ session_id });

    // ❌ Not verified → ask for verification
    if (!visitor || !visitor.is_verified) {
      return socket.emit('backend:verify-request');
    }

    // ✅ Reattach on reload
    visitor.socket_id = socket.id;
    await visitor.save();

    const room = await ChatRoom.findOne({
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
    });

    if (!room) {
      return socket.emit('backend:verify-request');
    }

    socket.join(room.room_id);

    socket.emit('visitor:connected', {
      visitor_id: visitor._id,
      room_id: room.room_id,
    });
  });
};

export const readVisitorMessage = (socket, io) => {
  socket.on('Visitor:message', (message) => {
    console.log('Listen to User', message);
  });
};
