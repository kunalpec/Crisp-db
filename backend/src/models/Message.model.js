import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },

    sender_type: {
      type: String,
      enum: ['visitor', 'agent', 'bot'],
      required: true,
    },

    sender_id: { type: mongoose.Schema.Types.ObjectId },

    content: { type: String, required: true },

    message_type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },

    metadata: { type: Object },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
