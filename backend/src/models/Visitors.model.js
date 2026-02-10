import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    session_id: {
      type: String,
      required: true,
      index: true,
    },

    user_info: {
      type: Object,
      default: {},
    },

    current_page: {
      type: String,
      default: "",
    },

    socket_id: {
      type: String,
      default: null,
    },

    is_verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    last_seen_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate visitor sessions per company
 */
visitorSchema.index(
  { company_id: 1, session_id: 1 },
  { unique: true }
);

/**
 * Auto update last_seen when modified
 */
visitorSchema.pre("save", function (next) {
  this.last_seen_at = new Date();
  next();
});

export const Visitor = mongoose.model("Visitor", visitorSchema);
