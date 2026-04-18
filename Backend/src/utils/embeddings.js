// backend/utils/embeddings.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function getEmbedding(text) {
  try {
    const result = await model.embedContent(text.slice(0, 8000));
    const values = result.embedding.values;
    // Guard: must be a non-empty array (gemini-embedding-001 = 3072 dims)
    if (!values || values.length === 0) return null;
    return values;
  } catch (e) {
    console.error("Gemini embedding failed:", e.message);
    return null; // return null, NOT [] — empty array is truthy and would fool the caller
  }
}

export { getEmbedding };