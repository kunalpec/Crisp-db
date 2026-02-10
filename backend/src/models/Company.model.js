import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    owner_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyUser",
      default: null,
      index: true,
    },

    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
      index: true,
    },

    subscription_status: {
      type: String,
      enum: ["trial", "active", "expired", "cancelled"],
      default: "trial",
      index: true,
    },

    subscription_expiry: {
      type: Date,
      default: null,
      index: true,
    },

    api_key_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      default: null,
    },

    is_system: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "blocked"],
      default: "active",
      index: true,
    },

    billing_customer_id: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Compound index for admin filtering
 */
companySchema.index({
  status: 1,
  subscription_status: 1,
});

/**
 * Normalize domain before save
 */
companySchema.pre("save", function (next) {
  if (this.domain) {
    this.domain = this.domain.trim().toLowerCase();
  }
  next();
});

/**
 * Auto expire subscription
 */
companySchema.methods.checkSubscriptionStatus = function () {
  if (
    this.subscription_expiry &&
    this.subscription_expiry < new Date()
  ) {
    this.subscription_status = "expired";
  }
};

export const Company = mongoose.model("Company", companySchema);
