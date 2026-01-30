import { CompanyUser } from '../../models/CompanyUser.model.js';
import { ChatRoom } from '../../models/ChatRoom.model.js';
import { Visitor } from '../../models/Visitors.model.js';
import { getCompanyRoomId } from '../rooms.js';

/**
 * Handle employee connection
 * - Join company room automatically
 * - Update user online status
 * - Notify company room of employee connection
 */
export const handleEmployeeConnection = async (socket, io) => {
  try {
    // JWT uses snake_case: _id, company_id
    const userId = socket.user._id;
    const companyId = socket.user.company_id;
    const role = socket.user.role;
    const email = socket.user.email;

    // Update user online status
    await CompanyUser.findByIdAndUpdate(userId, {
      is_online: true,
      socket_id: socket.id,
    });

    // Join company room
    const companyRoomId = getCompanyRoomId(companyId);
    await socket.join(companyRoomId);

    // Notify company room of new employee connection
    socket.to(companyRoomId).emit('employee:connected', {
      userId,
      companyId,
      role,
      email,
      socketId: socket.id,
    });

    // Confirm connection to the employee
    socket.emit('employee:connected', {
      userId,
      companyId,
      role,
      email,
      socketId: socket.id,
    });

    console.log(`Employee ${email} (${userId}) joined company room: ${companyRoomId}`);
  } catch (error) {
    console.error('Error handling employee connection:', error);
    socket.emit('error', { message: 'Failed to connect as employee' });
  }
};

/**
 * Handle employee disconnection
 * - Update user online status
 * - Notify company room of employee disconnection
 */
export const handleEmployeeDisconnection = async (socket, io) => {
  try {
    if (!socket.user) return;

    // JWT uses snake_case: _id, company_id
    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    // Update user online status
    await CompanyUser.findByIdAndUpdate(userId, {
      is_online: false,
      socket_id: null,
    });

    // Notify company room
    const companyRoomId = getCompanyRoomId(companyId);
    socket.to(companyRoomId).emit('employee:disconnected', {
      userId,
      companyId,
      socketId: socket.id,
    });

    console.log(`Employee ${userId} disconnected from company room: ${companyRoomId}`);
  } catch (error) {
    console.error('Error handling employee disconnection:', error);
  }
};

/**
 * Handle employee joining a visitor room
 * - Verify employee has access to the visitor's company
 * - Join visitor room
 * - Update chat room status to 'active'
 * - Assign agent to chat room
 */
export const handleJoinVisitorRoom = async (socket, io, { visitorSessionId }) => {
  try {
    // JWT uses snake_case: _id, company_id
    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    if (!visitorSessionId) {
      return socket.emit('error', { message: 'Visitor session ID is required' });
    }

    // Find visitor
    const visitor = await Visitor.findOne({
      session_id: visitorSessionId,
      company_id: companyId, // Ensure visitor belongs to employee's company
    });

    if (!visitor) {
      return socket.emit('error', { message: 'Visitor not found or unauthorized' });
    }

    // Find or create chat room
    let chatRoom = await ChatRoom.findOne({
      company_id: companyId,
      visitor_id: visitor._id,
      status: { $ne: 'closed' },
    });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        company_id: companyId,
        visitor_id: visitor._id,
        status: 'active',
        room_id: `visitor_${visitorSessionId}`,
        assigned_agent_id: userId,
      });
    } else {
      // Update room status and assign agent
      chatRoom.status = 'active';
      chatRoom.assigned_agent_id = userId;
      await chatRoom.save();
    }

    // Join visitor room
    const visitorRoomId = `visitor_${visitorSessionId}`;
    await socket.join(visitorRoomId);

    // Notify visitor that employee joined
    io.to(visitorRoomId).emit('employee:joined-room', {
      employeeId: userId,
      companyId,
      roomId: visitorRoomId,
    });

    // Confirm to employee
    socket.emit('employee:joined-room-success', {
      roomId: visitorRoomId,
      visitorId: visitor._id,
      visitorSessionId,
    });

    console.log(`Employee ${userId} joined visitor room: ${visitorRoomId}`);
  } catch (error) {
    console.error('Error joining visitor room:', error);
    socket.emit('error', { message: 'Failed to join visitor room' });
  }
};

/**
 * Handle employee leaving a visitor room
 */
export const handleLeaveVisitorRoom = async (socket, io, { visitorSessionId }) => {
  try {
    // JWT uses snake_case: _id, company_id
    const userId = socket.user._id;
    const companyId = socket.user.company_id;

    if (!visitorSessionId) {
      return socket.emit('error', { message: 'Visitor session ID is required' });
    }

    const visitorRoomId = `visitor_${visitorSessionId}`;
    await socket.leave(visitorRoomId);

    // Notify visitor
    io.to(visitorRoomId).emit('employee:left-room', {
      employeeId: userId,
      roomId: visitorRoomId,
    });

    socket.emit('employee:left-room-success', {
      roomId: visitorRoomId,
    });

    console.log(`Employee ${userId} left visitor room: ${visitorRoomId}`);
  } catch (error) {
    console.error('Error leaving visitor room:', error);
    socket.emit('error', { message: 'Failed to leave visitor room' });
  }
};

/**
 * Get waiting visitors for employee's company
 */
export const handleGetWaitingVisitors = async (socket, io) => {
  try {
    // JWT uses snake_case: company_id
    const companyId = socket.user.company_id;

    const waitingRooms = await ChatRoom.find({
      company_id: companyId,
      status: 'waiting',
    })
      .populate('visitor_id', 'session_id user_info current_page')
      .select('room_id visitor_id createdAt status')
      .lean();

    socket.emit('employee:waiting-rooms', waitingRooms);
  } catch (error) {
    console.error('Error getting waiting visitors:', error);
    socket.emit('employee:waiting-rooms-error', { message: 'Failed to get waiting visitors' });
  }
};
