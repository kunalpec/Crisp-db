import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    // The browser-generated unique ID visitor session
    session_id: {
      type: String,
      required: true,
      index: true,
    },

    // --- Presence & Status ---
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

    // --- Conversation Details ---
    room_id: {
      type: String,
      required: true,
      unique: true,
    },

    assigned_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyUser',
      default: null,
    },

    bot_enabled: {
      type: Boolean,
      default: true,
    }, 
    // Added from Conversation logic
    
    last_message_at: {
      type: Date,
      default: Date.now,
    }, // Added for sorting chat lists

    // --- Verification & Closing ---
    is_verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    closed_by: {
      type: String,
      enum: ['agent', 'visitor', 'system'],
      default: null,
    },
    closed_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for performance: finding the current active chat for a visitor
chatRoomSchema.index({ company_id: 1, session_id: 1, status: 1 });

export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);