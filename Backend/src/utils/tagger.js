// backend/utils/tagger.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

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
async function generateTagsWithDetection(text, typeHint) {
  // If we already know the source type from upload (Image, Video, pdf) skip detection
  let contentType = typeHint;
  if (!contentType || contentType === "article") {
      contentType = await detectContentType(text);
  } else if (contentType === "Article") { // From scraper fallback
      contentType = await detectContentType(text);
  }
  
  console.log(`Detected content type: ${contentType}`);
  const tags = await generateTags(text, contentType);
  return { tags, contentType };
}

// Vision AI: analyze an image URL directly
async function generateImageTags(imageUrl) {
  try {
     const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
     
     const mimeType = imageResp.headers['content-type'] || 'image/jpeg';
     const base64Str = Buffer.from(imageResp.data).toString('base64');
     
     const imagePart = {
         inlineData: {
            data: base64Str,
            mimeType,
         }
     };

     const prompt = `
     You are an expert visual analyzer and knowledge indexer.
     Please look at this uploaded image and generate a highly accurate Title, a 2-3 sentence visual Description, and between 4 and 7 categorical tags for a vector database.
     
     RULES:
     1. Return exactly this JSON structure. DO NOT use markdown code blocks (\`\`\`json). Just the raw JSON format:
     {
         "title": "A short, descriptive title",
         "description": "2-3 sentences visually detailing the content...",
         "tags": ["Tag1", "Tag2", "Tag3", "Image"]
     }
     `;
     
     const result = await model.generateContent([prompt, imagePart]);
     const raw = result.response.text();
     const cleaned = raw.replace(/```json|```/g, "").trim();
     return JSON.parse(cleaned);

  } catch (e) {
     console.error("Gemini Vision AI failed:", e.message);
     // Fallback if Vision AI fails
     return {
         title: "Uploaded Image",
         description: "An image file uploaded to the knowledge base.",
         tags: ["Image", "Media", "Visual"]
     };
  }
}

export { generateTags, detectContentType, generateTagsWithDetection, generateImageTags };