import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // ChatRoom reference
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },

    // Sender type
    sender_type: {
      type: String,
      enum: ["visitor", "agent", "bot", "system"],
      required: true,
    },

    // Sender ID (agent id, visitor null)
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Message content
    content: {
      type: String,
      default: "",
    },

    // Type of message
    message_type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },

    // Extra info (file URL, AI tokens, etc.)
    metadata: {
      type: Object,
      default: {},
    },

    // Read system
    is_read: {
      type: Boolean,
      default: false,
    },

    delivered_at: {
      type: Date,
      default: null,
    },

    read_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast message ordering
messageSchema.index({ conversation_id: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);
