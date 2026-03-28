// backend/utils/tagger.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateTags(text) {
  const prompt = `
    You are a content tagger.
    Given the article text below, return ONLY a JSON array of 3-6 short topic tags.
    No explanation. No markdown. Just the array.
    Example output: ["React", "JavaScript", "Frontend"]

    Article text:
    ${text.slice(0, 1000)}
  `;

  try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text();

      // clean up in case Gemini wraps it in markdown
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
  } catch(e) {
      console.error("Gemini tagging failed:", e.message);
      return [];
  }
}

export { generateTags };