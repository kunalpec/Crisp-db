import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    visitor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
      index: true,
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

/**
 * One active room per visitor per company
 */
chatRoomSchema.index(
  { company_id: 1, visitor_id: 1, status: 1 }
);

export const ChatRoom = mongoose.model(
  "ChatRoom",
  chatRoomSchema
);
