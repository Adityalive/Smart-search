// backend/utils/tagger.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

async function detectContentType(text) {
  const prompt = `
Given this text, classify it as exactly ONE of these types:
"Tutorial", "Research Paper", "News Article", "Opinion", "Video Transcript",
"Documentation", "Tweet", "Forum Post", "Guide", "Case Study"

Return ONLY the single type word. Nothing else.

Text:
"""
${text.slice(0, 500)}
"""`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error("Gemini content type detection failed:", e.message);
    return "article"; // safe fallback
  }
}

async function generateTags(text, contentType = "article") {
  const prompt = `
You are an expert knowledge manager and content classifier.
Your job is to generate highly accurate tags for a saved ${contentType}.

RULES:
1. Return ONLY a valid JSON array. No explanation, no markdown, no extra text.
2. Generate between 4 and 7 tags.
3. Mix tag types — include ALL of these where relevant:
   - TOPIC tags: the main subject        e.g. "Machine Learning", "React", "Investing"
   - SUBTOPIC tags: specific concepts    e.g. "Gradient Descent", "React Hooks", "Index Funds"
   - FORMAT tag: type of content         e.g. "Tutorial", "Research Paper", "Opinion", "Guide", "News"
   - SKILL LEVEL tag if detectable:      e.g. "Beginner", "Advanced"
4. Tags must be Title Case.
5. Tags must be 1-3 words maximum.
6. Do NOT use vague tags like "Technology", "Article", "Content", "Information".
7. Prefer specific over general — "Neural Networks" beats "AI".

EXAMPLES:
Input: article about building REST APIs with Node.js for beginners
Output: ["Node.js", "REST API", "Express", "Backend", "Tutorial", "Beginner", "JavaScript"]

Input: research paper on transformer attention mechanisms
Output: ["Transformers", "Attention Mechanism", "NLP", "Deep Learning", "Research Paper", "Advanced"]

Input: YouTube video about personal finance and index funds
Output: ["Personal Finance", "Index Funds", "Investing", "Wealth Building", "Video", "Beginner"]

Now generate tags for this content:
"""
${text.slice(0, 4000)}
"""

Return ONLY the JSON array:`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // clean up in case Gemini wraps it in markdown
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Gemini tagging failed:", e.message);
    return [];
  }
}

// main function — auto detects type then tags
async function generateTagsWithDetection(text) {
  const contentType = await detectContentType(text);
  console.log(`Detected content type: ${contentType}`);
  const tags = await generateTags(text, contentType);
  return { tags, contentType };
}

export { generateTags, detectContentType, generateTagsWithDetection };