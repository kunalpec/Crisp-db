import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },

    session_id: { type: String, required: true },

    name: String,
    email: String,

    user_info: {
      ip: String,
      browser: String,
      os: String,
      device: String,
    },

    current_page: String,
  },
  { timestamps: true }
);

visitorSchema.index({ company_id: 1, session_id: 1 }, { unique: true });

export const Visitor = mongoose.model('Visitor', visitorSchema);
