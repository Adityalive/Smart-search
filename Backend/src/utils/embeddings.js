// backend/utils/embeddings.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function getEmbedding(text) {
  try {
    const result = await model.embedContent(text.slice(0, 8000));
    return result.embedding.values; // array of 768 numbers
  } catch(e) {
    console.error("Gemini embedding failed:", e.message);
    return [];
  }
}

export { getEmbedding };