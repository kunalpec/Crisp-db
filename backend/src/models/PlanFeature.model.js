// Plan Feature Schema Add more features as needed
const planFeatureSchema = new mongoose.Schema(
  {
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      index: true,
    },

    feature_key: String, // "token_limit", "max_agents", "kb_enabled"

    feature_value: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const PlanFeature = mongoose.model('PlanFeature', planFeatureSchema);
