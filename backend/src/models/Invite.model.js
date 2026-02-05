import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // Only agents should be invited
    role: {
      type: String,
      enum: ["company_agent"],
      default: "company_agent",
    },

    // Who invited this user
    invited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyUser",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-delete expired invites
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent duplicate unused invites
inviteSchema.index(
  { company_id: 1, email: 1 },
  { unique: true, partialFilterExpression: { used: false } }
);

export const Invite = mongoose.model("Invite", inviteSchema);
