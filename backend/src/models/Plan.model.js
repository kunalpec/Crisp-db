import mongoose from "mongoose";

// Plan Schema (Crisp Style)
const planSchema = new mongoose.Schema(
  {
    // Plan Name
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Price (₹)
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Billing Cycle
    billing_cycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    // Duration in Days
    duration_in_days: {
      type: Number,
      required: true,
      default: 30,
    },

    // Plan Limits
    max_agents: {
      type: Number,
      default: 1,
    },

    max_conversations_per_month: {
      type: Number,
      default: 100,
    },

    max_ai_tokens: {
      type: Number,
      default: 50000,
    },

    // Feature List (Optional quick display)
    features: {
      type: [String],
      default: [],
    },

    // Default plan for new companies
    is_default: {
      type: Boolean,
      default: false,
    },

    // Active/Inactive
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Plan = mongoose.model("Plan", planSchema);
