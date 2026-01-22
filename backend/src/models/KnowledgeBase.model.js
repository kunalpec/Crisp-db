import mongoose from 'mongoose';

const knowledgeDocSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },

    question: { type: String, required: true },
    answer: { type: String, required: true },
    question_embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

export const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocSchema);
