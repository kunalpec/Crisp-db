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
      unique: true,
    },

    start_at:{
      type:Date,
      default:null,
    },
    
    expires_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Only ONE active key per company
apiKeySchema.index(
  { company_id: 1 },
  { unique: true, partialFilterExpression: { is_active: true } }
);

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);
