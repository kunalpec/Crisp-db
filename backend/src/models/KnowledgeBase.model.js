import mongoose from "mongoose";

const knowledgeDocSchema = new mongoose.Schema(
  {
    // Company Reference
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // Knowledge Q&A
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    // Embedding Vector
    question_embedding: {
      type: [Number],
      required: true,
    }
  },
  { timestamps: true }
);

// Full-text search index
knowledgeDocSchema.index({ question: "text", answer: "text" });

export const KnowledgeDocument = mongoose.model(
  "KnowledgeDocument",
  knowledgeDocSchema
);
