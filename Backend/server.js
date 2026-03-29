import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initCollection } from "./src/utils/qdrant.js";
import "./src/workers/itemworker.js";
import { initJobs } from "./src/jobs/resurfaceJob.js";

const PORT = process.env.PORT || 3000;

// ─── Start Server ────────────────────────────────────────────────────────────
connectDB().then(() => {
    // Start listening FIRST — don't let Qdrant block the server
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });

    initJobs();

    // Init Qdrant in the background — failure won't crash the server
    initCollection()
        .then(() => console.log("✅ Qdrant collection initialized"))
        .catch((err) => console.error("⚠️ Qdrant init failed (non-fatal):", err.message));

}).catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
});