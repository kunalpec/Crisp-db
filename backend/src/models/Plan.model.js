import mongoose from 'mongoose';

// Plan Schema
const planSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },

    description: String,

    price: { type: Number, min: 0 },

    billing_cycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },

    duration: Number,

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Plan = mongoose.model('Plan', planSchema);

