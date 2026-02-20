import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  maxTokens: 800,
  temperature: 0.3
});
