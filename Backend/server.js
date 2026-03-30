import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initCollection } from "./src/utils/qdrant.js";
import { initJobs } from "./src/jobs/resurfaceJob.js";

const PORT = process.env.PORT || 3000;

// ─── Start Server ────────────────────────────────────────────────────────────
connectDB().then(() => {
    // Start listening FIRST — the most important thing for Render
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
        
        // Lazy load worker and jobs after port is bound to avoid startup crashes
        import("./src/workers/itemworker.js").then(({ default: worker }) => {
            console.log("👷 Background Worker initialized");
        }).catch(err => {
            console.error("⚠️ Worker init failed (non-fatal):", err.message);
        });

        initJobs();
    });

    // Init Qdrant in the background
    initCollection()
        .then(() => console.log("✅ Qdrant collection initialized"))
        .catch((err) => console.error("⚠️ Qdrant init failed (non-fatal):", err.message));

}).catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
});