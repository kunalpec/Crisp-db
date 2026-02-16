import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },

    sender_type: {
      type: String,
      enum: ["visitor", "agent", "bot", "system"],
      required: true,
    },

    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    message_type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },

    metadata: {
      type: Object,
      default: {},
    },

    is_read: {
      type: Boolean,
      default: false,
    },

    delivered_at: {
      type: Date,
      default: Date.now,
    },

    read_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation_id: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);
