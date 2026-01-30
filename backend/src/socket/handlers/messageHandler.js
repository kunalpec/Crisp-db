import { Message } from '../../models/Message.model.js';
import { Conversation } from '../../models/Conversation.model.js';
import { ChatRoom } from '../../models/ChatRoom.model.js';
import { Visitor } from '../../models/Visitors.model.js';

/**
 * Handle sending a message
 * - Validate room access
 * - Save message to database
 * - Broadcast to room
 */
export const handleSendMessage = async (socket, io, payload) => {
  try {
    const { roomId, message, sender } = payload;

    if (!roomId || !message || !sender) {
      return socket.emit('error', { message: 'Room ID, message, and sender are required' });
    }

    // Validate room exists and user has access
    const room = await ChatRoom.findOne({ room_id: roomId, status: { $ne: 'closed' } });

    if (!room) {
      return socket.emit('error', { message: 'Room not found or closed' });
    }

    // For employees: verify they belong to the room's company
    if (socket.user && socket.role !== 'visitor') {
      // JWT uses snake_case: company_id
      if (room.company_id.toString() !== socket.user.company_id.toString()) {
        return socket.emit('error', { message: 'Unauthorized access to room' });
      }
    }

    // For visitors: verify they belong to the room
    if (socket.role === 'visitor') {
      const visitor = await Visitor.findOne({ socket_id: socket.id });
      if (!visitor || room.visitor_id.toString() !== visitor._id.toString()) {
        return socket.emit('error', { message: 'Unauthorized access to room' });
      }
    }

    // Find or create conversation for this room
    let conversation = await Conversation.findOne({ 
      company_id: room.company_id,
      visitor_id: room.visitor_id,
      status: { $ne: 'closed' }
    });
    if (!conversation) {
      conversation = await Conversation.create({
        company_id: room.company_id,
        visitor_id: room.visitor_id,
        assigned_agent: room.assigned_agent_id || null,
        status: 'open',
      });
    }

    // Map sender type to message schema
    const senderTypeMap = {
      employee: 'agent',
      visitor: 'visitor',
      agent: 'agent',
    };

    // Create message
    const newMessage = await Message.create({
      conversation_id: conversation._id,
      sender_id: sender.userId || null,
      sender_type: senderTypeMap[sender.type] || 'visitor',
      content: message,
      message_type: 'text',
    });

    // Broadcast to room
    io.to(roomId).emit('message:received', {
      messageId: newMessage._id,
      roomId,
      message,
      sender,
      timestamp: newMessage.createdAt,
    });

    console.log(`Message sent in room ${roomId} by ${sender.type}`);
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
};

/**
 * Handle typing indicator
 */
export const handleTyping = async (socket, io, payload) => {
  try {
    const { roomId, sender } = payload;

    if (!roomId) {
      return;
    }

    // Broadcast typing indicator to room (except sender)
    socket.to(roomId).emit('typing', {
      roomId,
      sender,
    });
  } catch (error) {
    console.error('Error handling typing:', error);
  }
};

/**
 * Handle stop typing indicator
 */
export const handleStopTyping = async (socket, io, payload) => {
  try {
    const { roomId, sender } = payload;

    if (!roomId) {
      return;
    }

    // Broadcast stop typing to room (except sender)
    socket.to(roomId).emit('stopTyping', {
      roomId,
      sender,
    });
  } catch (error) {
    console.error('Error handling stop typing:', error);
  }
};
