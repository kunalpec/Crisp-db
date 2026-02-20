import cron from "node-cron";
import mongoose from "mongoose";
import { Message } from "../../models/Message.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";
import { KnowledgeDocument } from "../../models/KnowledgeBase.model.js";
import { embedText } from "./embedding.js";
import { groqModel } from "./model.js";

/* ======================================================
   SAFE JSON EXTRACTOR (handles truncated AI output)
====================================================== */
function extractJSON(text) {
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1) return null;

    const jsonString = text.slice(start, end + 1);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("🧠 Running Knowledge Extraction Job...");

    const last30Min = new Date(Date.now() - 30 * 60 * 1000);

    /* ======================================================
       1️⃣ Get rooms created in last 30 mins
    ====================================================== */
    const rooms = await ChatRoom.find({
      createdAt: { $lte: last30Min },
      knowledge_processed: { $ne: true }, // prevent duplicate processing
    }).select("_id company_id");

    if (!rooms.length) {
      console.log("No new rooms found");
      return;
    }

    const roomIds = rooms.map((r) => r._id);

    /* ======================================================
       2️⃣ Get all text messages of those rooms
    ====================================================== */
    const messages = await Message.find({
      conversation_id: { $in: roomIds },
      message_type: "text",
    }).sort({ createdAt: 1 });

    if (!messages.length) {
      console.log("No messages found");
      return;
    }

    /* ======================================================
       3️⃣ Group messages by company
    ====================================================== */
    const companyMap = {};

    for (const room of rooms) {
      companyMap[room.company_id.toString()] = {
        company_id: room.company_id,
        messages: [],
      };
    }

    for (const msg of messages) {
      const room = rooms.find((r) =>
        r._id.equals(msg.conversation_id)
      );
      if (!room) continue;

      companyMap[room.company_id.toString()].messages.push(
        `${msg.sender_type}: ${msg.content}`
      );
    }

    /* ======================================================
       4️⃣ Process each company separately
    ====================================================== */
    for (const key in companyMap) {
      const data = companyMap[key];
      if (!data.messages.length) continue;

      const chatText = data.messages.join("\n");

      const prompt = `
You are a strict JSON generator.

Extract only meaningful Question & Answer pairs.

Return STRICT VALID JSON.
No explanation.
No markdown.
No extra text.
Close all brackets properly.

Format:
[
  { "question": "...", "answer": "..." }
]

Conversation:
${chatText}
`;

      /* ======================================================
         5️⃣ Call LLM (important fixes added)
      ====================================================== */
      const response = await groqModel.invoke(prompt, {
        max_tokens: 2000,
        temperature: 0,
      });

      if (!response?.content) {
        console.log("Empty AI response");
        continue;
      }

      console.log("Raw AI Output:", response.content);

      const extracted = extractJSON(response.content);

      if (!extracted || !Array.isArray(extracted)) {
        console.log("Invalid or incomplete JSON from AI");
        continue;
      }

      /* ======================================================
         6️⃣ Store Knowledge
      ====================================================== */
      for (const item of extracted) {
        if (
          !item.question ||
          !item.answer ||
          item.question.length < 5 ||
          item.answer.length < 5
        ) {
          continue;
        }

        const vector = await embedText(item.question);

        await KnowledgeDocument.create({
          company_id: new mongoose.Types.ObjectId(data.company_id),
          question: item.question.trim(),
          answer: item.answer.trim(),
          question_embedding: vector,
        });
      }

      console.log(`✅ Knowledge updated for company ${key}`);
    }

    /* ======================================================
       7️⃣ Mark rooms as processed
    ====================================================== */
    await ChatRoom.updateMany(
      { _id: { $in: roomIds } },
      { $set: { knowledge_processed: true } }
    );

  } catch (err) {
    console.error("Cron Error:", err);
  }
});