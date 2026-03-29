import cron from "node-cron";
import Item from "../models/item.model.js";

/**
 * Initialize background scheduled tasks
 */
export const initJobs = () => {
    // Run every day at midnight (Server time)
    cron.schedule("0 0 * * *", async () => {
        console.log("[Job] Running midnight Memory Resurface check...");
        
        try {
            const now = new Date();
            
            const getRange = (days) => {
                const TARGET = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
                const START = new Date(TARGET.setHours(0,0,0,0));
                const END = new Date(TARGET.setHours(23,59,59,999));
                return { $gte: START, $lte: END };
            };

            // Find items that are hitting their 30/60/90 day anniversaries today
            const echoes = await Item.find({
                $or: [
                    { createdAt: getRange(30) },
                    { createdAt: getRange(60) },
                    { createdAt: getRange(90) }
                ]
            });

            if (echoes.length > 0) {
                console.log(`[Job] Found ${echoes.length} items resurfacing today across all users.`);
                // Here we could trigger push notifications or emails
            } else {
                console.log("[Job] No significant memories found for today.");
            }

        } catch (error) {
            console.error("[Job] Error in resurface job:", error);
        }
    });

    console.log("Memory Resurface CRON job scheduled ✓");
};
