import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // Store only hashed API key
    api_key_hash: {
      type: String,
      required: true,
      unique: true,
    },

    // Optional label
    key_name: {
      type: String,
      default: "default",
    },

    // Active / Revoked
    is_active: {
      type: Boolean,
      default: true,
    },

    // Key validity
    start_at: {
      type: Date,
      default: Date.now,
    },

    expires_at: {
      type: Date,
      default: null,
    },

    // Usage tracking
    last_used_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One key per company (MVP)
apiKeySchema.index({ company_id: 1 }, { unique: true });

//
// Helper method
//
apiKeySchema.methods.isExpired = function () {
  return this.expires_at && this.expires_at < new Date();
};

export const ApiKey = mongoose.model("ApiKey", apiKeySchema);
