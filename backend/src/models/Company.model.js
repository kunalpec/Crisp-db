import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // Company Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Domain (unique per company)
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // Owner (Company Admin)
    owner_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyUser",
      default: null,
    },

    // Plan Reference
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },

    // Subscription Status
    subscription_status: {
      type: String,
      enum: ["trial", "active", "expired", "cancelled"],
      default: "trial",
    },

    // Expiry Date
    subscription_expiry: {
      type: Date,
      default: null,
    },

    // API Key Reference
    api_key_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      default: null,
    },

    // System Company (Crisp internal)
    is_system: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Company Status (admin control)
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "blocked"],
      default: "active",
    },

    // Billing (Future Stripe support)
    billing_customer_id: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
