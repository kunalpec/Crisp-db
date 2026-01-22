import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },

    visitor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
      index: true,
    },

    assigned_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyUser',
      default: null,
    },

    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open',
      index: true,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    bot_enabled: { type: Boolean, default: true },

    last_message_at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
