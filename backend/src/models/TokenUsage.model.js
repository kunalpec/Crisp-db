import mongoose from 'mongoose';

const tokenUsageSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },

    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },

    model: String,

    prompt_tokens: Number,
    completion_tokens: Number,
    total_tokens: Number,

    cost: Number,

    source: {
      type: String,
      enum: ['chat', 'kb_search', 'agent_tools'],
    },
  },
  { timestamps: true }
);

export const TokenUsage = mongoose.model('TokenUsage', tokenUsageSchema);
