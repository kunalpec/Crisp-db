import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    session_id: {
      type: String,
      required: true,
      index: true,
    },

    room_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ✅ SINGLE STATUS FIELD ONLY
    status: {
      type: String,
      enum: ["waiting", "active", "disconnected", "closed"],
      default: "waiting",
      index: true,
    },

    assigned_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyUser",
      default: null,
    },

    visitor_socket_id: {
      type: String,
      default: null,
    },

    agent_socket_id: {
      type: String,
      default: null,
    },

    is_visitor_online: {
      type: Boolean,
      default: false,
    },

    is_agent_online: {
      type: Boolean,
      default: false,
    },

    bot_enabled: {
      type: Boolean,
      default: true,
    },

    last_message_at: {
      type: Date,
      default: Date.now,
    },

    closed_by: {
      type: String,
      enum: ["employee", "visitor", "system"],
      default: null,
    },

    closed_at: {
      type: Date,
      default: null,
    },
    knowledge_processed: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// ✅ Performance Index
chatRoomSchema.index({ company_id: 1, session_id: 1, status: 1 });

/* ===================================================
   TTL AUTO DELETE → 30 mins after closed
=================================================== */
chatRoomSchema.index(
  { closed_at: 1 },
  {
    expireAfterSeconds: 1800,
    partialFilterExpression: { status: "closed" },
  }
);

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
