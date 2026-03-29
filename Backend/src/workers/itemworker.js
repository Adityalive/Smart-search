// backend/workers/itemWorker.js
import { Worker } from "bullmq";
import { generateTagsWithDetection, generateImageTags } from "../utils/tagger.js";
import { getEmbedding } from "../utils/embeddings.js";
import { upsertItem } from "../utils/qdrant.js";
import { extractUrlContent } from "../services/scraper.js";
import Item from "../models/item.model.js";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  family: 4, // Force IPv4 for stable Redis Cloud connections
};

const worker = new Worker(
  "item-processing",
  async (job) => {
    const { itemId, url, userId } = job.data;
    console.log(`\n[Worker] Starting job for item: ${itemId}`);

    // ─── 1. Fetch item from MongoDB ───────────────────────────────────────────
    const item = await Item.findById(itemId);
    if (!item) throw new Error(`Item ${itemId} not found in DB`);

    // ─── 2. Scrape URL if needed (Skip for media) ───────────────────────────
    let text = item.content || "";
    let sourceType = item.sourceType || "Article";
    let wordCount = item.wordCount || 0;
    let isPaywalled = item.isPaywalled || false;
    let isMedia = sourceType === "Image" || sourceType === "Video";

    if (!isMedia && !text && url && item.type === "url") {
      console.log(`[Worker] Scraping URL: ${url}`);

      const scraped = await extractUrlContent(url);

      text = scraped.content || "";
      sourceType = scraped.sourceType || "Article";
      wordCount = scraped.wordCount || 0;
      isPaywalled = scraped.isPaywalled || false;

      // update fields only if they were empty
      if (!item.title && scraped.title) item.title = scraped.title;
      if (!item.description && scraped.description) item.description = scraped.description;

      item.content = text;
      item.sourceType = sourceType;
      item.wordCount = wordCount;
      item.isPaywalled = isPaywalled;

      // warn but don't fail — paywalled content has no text to embed
      if (isPaywalled) {
        console.warn(`[Worker] Paywalled content detected: ${url}`);
      }
    }

    // ─── 3. Fail gracefully if no text to process ────────────────────────────
    if (!isMedia && (!text || text.trim().length < 50)) {
      console.warn(`[Worker] Not enough text to process for item: ${itemId}`);
      item.status = "failed";
      item.failReason = !text
        ? "No content extracted from URL"
        : "Content too short to process";
      await item.save();
      return;
    }

    // ─── 4. Generate tags with Gemini ─────────────────────────────────────────
    console.log(`[Worker] Generating AI Metadata (sourceType: ${sourceType})...`);
    let tags = [];
    let detectedType = sourceType;

    try {
      if (sourceType === "Image" && url) {
          // Send Image SDK specifically to Vision AI
          const visionData = await generateImageTags(url);
          if (!item.title) item.title = visionData.title;
          if (!item.description) item.description = visionData.description;
          tags = visionData.tags || ["Image", "Media"];
          text = visionData.description || "A visual image"; 
          detectedType = "Image";
      } else if (sourceType === "Video") {
          // Hardcode for Videos currently
          if (!item.title) item.title = "Uploaded Video";
          tags = ["Video", "Media", "Visual"];
          text = "A video file hosted on ImageKit.";
          detectedType = "Video";
      } else if (sourceType === "PDF") {
          // For PDFs, we want to keep them in "PDF Documents" specifically
          const result = await generateTagsWithDetection(text, sourceType);
          tags = result.tags || [];
          detectedType = "PDF"; // Force override to keep them grouped together as requested
      } else {
          // Regular AI document tagging for URLs
          const result = await generateTagsWithDetection(text, sourceType);
          tags = result.tags || [];
          detectedType = result.contentType || sourceType;
      }
      console.log(`[Worker] AI metadata determined. Type: ${detectedType}`);
    } catch (e) {
      console.error(`[Worker] Metadata generation failed: ${e.message}`);
    }

    // ─── 5. Generate embedding with Gemini ───────────────────────────────────
    console.log(`[Worker] Generating embedding...`);
    let embedding = null;

    try {
      // embed title + description + content together for richer vector
      const textToEmbed = [
        item.title || "",
        item.description || "",
        text.slice(0, 6000),
      ]
        .filter(Boolean)
        .join("\n\n");

      embedding = await getEmbedding(textToEmbed);
      console.log(`[Worker] Embedding generated (${embedding.length} dims)`);
    } catch (e) {
      // embedding failed — not fatal, semantic search won't work for this item
      console.error(`[Worker] Embedding failed: ${e.message}`);
    }

    // ─── 6. Upsert to Qdrant (only if embedding succeeded) ───────────────────
    if (embedding) {
      try {
        await upsertItem(itemId, embedding, {
          userId: userId,
          url: item.url || url,
          title: item.title || "",
          tags: tags,
          sourceType: detectedType,
          wordCount: wordCount,
          createdAt: item.createdAt, // store timestamp for resurfacing UI
        });
        console.log(`[Worker] Upserted to Qdrant ✓`);
      } catch (e) {
        // Qdrant upsert failed — log but don't crash the job
        console.error(`[Worker] Qdrant upsert failed: ${e.message}`);
      }
    }

    // ─── 7. Save everything to MongoDB ───────────────────────────────────────
    item.status = "ready";
    item.tags = Array.from(new Set([...(item.tags || []), ...tags]));
    item.sourceType = detectedType;
    item.hasEmbedding = !!embedding;
    item.processedAt = new Date();
    item.failReason = undefined; // clear any previous failure reason

    await item.save();

    console.log(`[Worker] Done ✓ item: ${itemId} | tags: ${tags.join(", ")} | type: ${detectedType}\n`);
  },
  { connection }
);

// ─── Worker event listeners ───────────────────────────────────────────────────

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed ✓`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} failed: ${err.message}`);
  // mark item as failed in DB so frontend can show error state
  Item.findByIdAndUpdate(job.data.itemId, {
    status: "failed",
    failReason: err.message,
  }).catch(() => { }); // silent catch — don't throw inside event listener
});

worker.on("error", (err) => {
  // connection errors, Redis down etc.
  console.error(`[Worker] Worker error: ${err.message}`);
});

worker.on("stalled", (jobId) => {
  // job was picked up but worker crashed mid-processing
  console.warn(`[Worker] Job ${jobId} stalled — will be retried`);
});

export default worker;