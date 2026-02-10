import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    session_id: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['waiting', 'active', 'disconnected', 'closed'],
      default: 'waiting',
      index: true,
    },

    is_visitor_online: {
      type: Boolean,
      default: false,
    },

    is_agent_online: {
      type: Boolean,
      default: false,
    },

    visitor_socket_id: {
      type: String,
      default: null,
    },

    agent_socket_id: {
      type: String,
      default: null,
    },

    room_id: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["waiting", "assigned", "active", "closed"],
      default: "waiting",
      index: true,
    },

    assigned_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyUser",
      default: null,
    },

    bot_enabled: {
      type: Boolean,
      default: true,
    },

    last_message_at: {
      type: Date,
      default: Date.now,
    },

    is_verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    closed_by: {
      type: String,
      enum: ["agent", "visitor", "system"],
      default: null,
    },

    closed_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Performance index
chatRoomSchema.index({ company_id: 1, session_id: 1, status: 1 });

/* ===================================================
   TTL INDEX → Auto delete 30 mins after closed
=================================================== */

chatRoomSchema.index(
  { closed_at: 1 },
  {
    expireAfterSeconds: 1800, // 30 minutes
    partialFilterExpression: { status: "closed" },
  }
);

export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
