import mongoose from "mongoose";
import { groqModel } from "./model.js";
import { StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { KnowledgeDocument } from "../../models/KnowledgeBase.model.js";
import { embedText } from "./embedding.js";

function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dot / (normA * normB);
}
/* ======================================================
   1️⃣ Graph State Schema
====================================================== */

export const StateSchema = z.object({
  query: z.object({
    query: z.string(),
    company_id: z.string(),
  }),

  searchConfig: z
    .object({
      k: z.number().min(1).max(20).default(3),
      threshold: z.number().min(0).max(1).default(0.6),
    })
    .default({
      k: 3,
      threshold: 0.6,
    }),

  listQues: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),

  finalAnswer: z.string().default(""),
});

/* ======================================================
   2️⃣ Search Node (Vector Search)
====================================================== */

async function searchQuestion(state) {
  try {
    console.log("📌 Entered searchQuestion");

    const { query, company_id } = state.query;
    const { k, threshold } = state.searchConfig;

    const queryVector = await embedText(query);

    if (!queryVector || !queryVector.length) {
      console.log("⚠️ Query embedding failed");
      return { listQues: [] };
    }

    const docs = await KnowledgeDocument.find({
      company_id: new mongoose.Types.ObjectId(company_id),
    });

    console.log("Documents Found:", docs.length);

    if (!docs.length) {
      return { listQues: [] };
    }

    const scored = [];

    for (const doc of docs) {
      if (
        !doc.question_embedding ||
        doc.question_embedding.length !== queryVector.length
      ) {
        continue;
      }

      const score = cosineSimilarity(
        queryVector,
        doc.question_embedding
      );
      console.log(score);

      if (score >= threshold) {
        scored.push({
          question: doc.question,
          answer: doc.answer,
          score,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const topK = scored.slice(0, k);

    return {
      listQues: topK.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    };
  } catch (error) {
    console.error("❌ searchQuestion Error:", error);
    return { listQues: [] };
  }
}

/* ======================================================
   3️⃣ Generate Answer Node
====================================================== */

async function generateAnswer(state) {
  try {
    console.log("📌 Entered generateAnswer");

    const userQuestion = state.query.query;
    const relatedQA = state.listQues;

    let prompt;

    if (!relatedQA.length) {
      // 🔥 Fallback Mode (No Knowledge Found)
      console.log("⚠️ No knowledge found → Using general AI");

      prompt = `
              You are a helpful AI assistant.

              User Question:
              ${userQuestion}
              
              Answer clearly and helpfully if you know the answer say simply else tell sorry i dont have not info related to right now ok in short way .
              `;
    } else {
      // 🔥 RAG Mode
      const context = relatedQA
        .map(
          (item, index) =>
            `Related Q${index + 1}: ${item.question}\nAnswer: ${item.answer}`
        )
        .join("\n\n");

      prompt = `
You are a company support AI.

User Question:
${userQuestion}

Relevant Knowledge:
${context}

Use the provided knowledge to answer accurately.
Do not invent information outside the given knowledge.
`;
    }

    const response = await groqModel.invoke(prompt, {
      temperature: 0.3,
      max_tokens: 1000,
    });

    return {
      finalAnswer:
        response?.content ||
        "Sorry, I couldn't generate a proper response.",
    };
  } catch (error) {
    console.error("❌ generateAnswer Error:", error);
    return {
      finalAnswer: "Something went wrong while generating the answer.",
    };
  }
}

/* ======================================================
   4️⃣ Build Graph
====================================================== */

const builder = new StateGraph(StateSchema);

builder
  .addNode("search_question", searchQuestion)
  .addNode("generate_answer", generateAnswer)
  .addEdge("__start__", "search_question")
  .addEdge("search_question", "generate_answer")
  .addEdge("generate_answer", "__end__");

export const ragGraph = builder.compile();