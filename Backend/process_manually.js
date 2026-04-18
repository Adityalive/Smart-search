
import mongoose from 'mongoose';
import 'dotenv/config';
import Item from './src/models/item.model.js';
import { getEmbedding } from './src/utils/embeddings.js';
import { upsertItem, initCollection } from './src/utils/qdrant.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await initCollection(); // Ensure collection with 3072 is ready
  
  const items = await Item.find({ hasEmbedding: { $ne: true } }).limit(50).lean();
  console.log(`Manually processing ${items.length} items...`);

  for (const item of items) {
    try {
      const content = item.content || item.description || item.title;
      if (!content || content.length < 50) {
        console.log(`Skipping "${item.title}" - insufficient content`);
        continue;
      }

      console.log(`Embedding "${item.title}"...`);
      const embedding = await getEmbedding(content);
      
      if (embedding && embedding.length === 3072) {
        await upsertItem(item._id, embedding, {
          userId: item.userId.toString(),
          url: item.url,
          title: item.title,
          tags: JSON.parse(JSON.stringify(item.tags || [])),
          sourceType: item.sourceType || 'Article',
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
        });
        
        await Item.findByIdAndUpdate(item._id, { 
          hasEmbedding: true, 
          status: 'ready' 
        });
        console.log(`✓ DONE: ${item.title}`);
      } else {
        console.log(`X FAILED: "${item.title}" - Embedding null or wrong size`);
      }
    } catch (e) {
      console.error(`X ERROR for "${item.title}":`, e.message);
    }
  }
  process.exit(0);
}

run().catch(console.error);
