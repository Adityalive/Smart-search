// backend/workers/itemWorker.js
import { Worker } from "bullmq";
import { generateTags } from "../utils/tagger.js";
import { getEmbedding } from "../utils/embeddings.js";
import { upsertItem } from "../utils/qdrant.js";
import { extractUrlContent } from "../services/scraper.js";
import Item from "../models/item.model.js";

const redisPassword = process.env.REDIS_PASSWORD;
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: redisPassword ? redisPassword : undefined
};

const worker = new Worker("item-processing", async (job) => {
  const { itemId, url, userId } = job.data;
  console.log(`Processing item ${itemId}...`);

  // Fetch item to see if there's already parsed content (e.g. from a PDF)
  const item = await Item.findById(itemId);
  if (!item) throw new Error("Item not found");

  let text = item.content || "";

  // 1. scrape if it's a URL and has no text yet
  if (!text && url && item.type === "url") {
    const scraped = await extractUrlContent(url);
    text = scraped.content;
    
    // Update basic scraping details
    item.content = text;
    if (!item.title && scraped.title) item.title = scraped.title;
    if (!item.description && scraped.description) item.description = scraped.description;
  }

  // If there's still no text, we can't tag or embed
  if (!text) {
    item.status = "failed";
    await item.save();
    return;
  }

  // 2. tag with Gemini
  const tags = await generateTags(text);

  // 3. embed with Gemini
  const embedding = await getEmbedding(text);

  // 4. save to Qdrant for semantic search
  await upsertItem(itemId, embedding, { tags, url: item.url, title: item.title, userId: userId });

  // 5. update MongoDB
  item.status = "ready";
  item.tags = Array.from(new Set([...(item.tags || []), ...tags]));
  await item.save();

  console.log(`Done: ${itemId} → tags: ${tags.join(", ")}`);
}, { connection });

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

export default worker;