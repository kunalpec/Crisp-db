import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    api_key_hash: {
      type: String,
      required: true,
      // Use sparse unique index to allow multiple nulls (if any exist)
      // but enforce uniqueness for non-null values
    },

    start_at: {
      type: Date,
      default: null,
    },

    expires_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Sparse unique index on api_key_hash (only enforces uniqueness for non-null values)
apiKeySchema.index({ api_key_hash: 1 }, { unique: true, sparse: true });

// Unique index on company_id (one API key per company)
apiKeySchema.index({ company_id: 1 }, { unique: true });

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);
