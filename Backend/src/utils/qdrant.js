// backend/utils/qdrant.js

import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
    url: process.env.QDRANT_URL,        // your cloud cluster URL
    apiKey: process.env.QDRANT_API_KEY, // your secret key
});

const COLLECTION = "knowledge_items";

// run this once when your server starts
async function initCollection() {
    const existing = await client.getCollections();
    const exists = existing.collections.some(c => c.name === COLLECTION);

    if (!exists) {
        await client.createCollection(COLLECTION, {
            vectors: {
                size: 3072,          // Gemini gemini-embedding-001 = 3072 dimensions
                distance: "Cosine", // best for semantic similarity
            },
        });
        // Create an index on userId so that pure filtering (e.g. scroll) works efficiently
        await client.createPayloadIndex(COLLECTION, {
            field_name: "userId",
            field_schema: "keyword", // strings for exact match filtering
        });
        console.log("Qdrant collection and indexes created ✓");
    } else {
        console.log("Qdrant collection already exists ✓");
    }
}

// Qdrant requires IDs to be UUIDs or unsigned integers. This helper converts 24-char MongoDB ObjectIds to UUIDs.
function objectIdToUuid(objectIdStr) {
    const padded = objectIdStr.padStart(32, "0");
    return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
}

// save an item's embedding
async function upsertItem(itemId, embedding, payload) {
    const qdrantId = objectIdToUuid(itemId.toString());
    await client.upsert(COLLECTION, {
        points: [
            {
                id: qdrantId,    // Use converted UUID format
                vector: embedding,
                payload: { ...payload, mongodbId: itemId.toString() }, // save original MongoDB ID in payload
            },
        ],
    });
}

// search for similar items by meaning using a vector query
async function searchSimilar(queryEmbedding, userId, limit = 5) {
    const results = await client.search(COLLECTION, {
        vector: queryEmbedding,
        limit,
        filter: {
            must: [{ key: "userId", match: { value: userId } }] // only search this user's items
        },
        with_payload: true,
    });
    return results;
}

// recommend similar items based on an existing item's ID
async function recommendSimilar(itemId, userId, limit = 5) {
    const qdrantId = objectIdToUuid(itemId.toString());
    const results = await client.recommend(COLLECTION, {
        positive: [qdrantId],
        limit,
        filter: {
            must: [{ key: "userId", match: { value: userId } }]
        },
        with_payload: true,
    });
    return results;
}

// fetch all points for a user (used for clustering)
async function getAllUserPoints(userId) {
    let allPoints = [];
    let offset = null;
    
    do {
        const result = await client.scroll(COLLECTION, {
            filter: {
                must: [{ key: "userId", match: { value: userId } }]
            },
            with_vector: true,
            with_payload: true,
            limit: 1000,
            offset: offset,
        });
        
        allPoints = allPoints.concat(result.points);
        offset = result.next_page_offset;
    } while (offset !== null);
    
    return allPoints;
}

// delete an item from vector DB when user deletes it
async function deleteItem(itemId) {
    const qdrantId = objectIdToUuid(itemId.toString());
    await client.delete(COLLECTION, {
        points: [qdrantId],
    });
}

export { initCollection, upsertItem, searchSimilar, recommendSimilar, deleteItem, getAllUserPoints };