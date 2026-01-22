import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    domain: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Assigned AFTER company admin is created
    owner_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyUser',
      default: null, // ✅ NOT required
    },

    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null, // ✅ NOT required
    },

    // 🔑 VERY IMPORTANT
    is_system: {
      type: Boolean,
      default: false, // true for Crisp
      index: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'blocked'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);
