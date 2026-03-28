import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initCollection } from "./src/utils/qdrant.js";
import "./src/workers/itemworker.js"; 

const PORT = process.env.PORT || 3000;
initCollection();
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });
});
// Trigger restart