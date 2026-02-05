import mongoose from "mongoose";

const tokenUsageSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // Direct link to active chatroom
    chatroom_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      default: null,
    },

    // Visitor session tracking
    session_id: {
      type: String,
      required: true,
      index: true,
    },

    triggered_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyUser",
      default: null,
    },

    model: {
      type: String,
      required: true,
    },

    prompt_tokens: { type: Number, default: 0 },
    completion_tokens: { type: Number, default: 0 },
    total_tokens: { type: Number, default: 0 },

    cost: { type: Number, default: 0 },

    source: {
      type: String,
      enum: ["chat", "kb_search", "agent_tools"],
      required: true,
    },

    billing_month: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

tokenUsageSchema.index({ company_id: 1, billing_month: 1 });

export const TokenUsage = mongoose.model("TokenUsage", tokenUsageSchema);
