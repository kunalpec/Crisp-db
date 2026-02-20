import { ragGraph } from "./rag.graph.js";
import { Message } from "../../models/Message.model.js";
import { ChatRoom } from "../../models/ChatRoom.model.js";


export const handleAIReply = async (io, chatRoom, userMessage) => {
  try {
    console.log("🤖 AI processing started...");

    const { company_id } = chatRoom;

    // ===============================
    // 1️⃣ Run RAG Graph
    // ===============================
    const result = await ragGraph.invoke({
      query: {
        query: userMessage,
        company_id: String(company_id),
      },
      searchConfig: {
        k: 3,
        threshold: 0.6,
      },
    });

    const aiAnswer = result.finalAnswer?.trim();

    if (!aiAnswer) {
      console.log("⚠️ AI returned empty response");
      return;
    }

    // ===============================
    // 2️⃣ Save Bot Message
    // ===============================
    const botMessage = await Message.create({
      conversation_id: chatRoom._id,
      sender_type: "agent",
      sender_id: null,
      content: aiAnswer,
      message_type: "text",
      metadata: {
        source: "rag_ai",
      },
    });

    // ===============================
    // 3️⃣ Update Chat Room
    // ===============================
    chatRoom.last_message_at = new Date();
    chatRoom.last_message_content = botMessage.content;
    await chatRoom.save();

    // ===============================
    // 4️⃣ Emit to Room
    // ===============================
    io.to(chatRoom.room_id).emit("chat:new-message", {
      msg_id: botMessage._id.toString(),   // ✅ FIXED
      room_id: chatRoom.room_id,
      sender_type: "agent",
      sender_id: null,
      msg_content: botMessage.content,
      send_at: botMessage.createdAt,
    });
    console.log("✅ AI Message Sent");

  } catch (err) {
    console.error("❌ AI Reply Error:", err);
  }
};
