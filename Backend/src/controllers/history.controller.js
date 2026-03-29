import History from "../models/history.model.js";

/**
 * @desc    Save a new search/navigation query into user history
 * @route   POST /api/history
 */
export const createHistory = async (req, res) => {
    try {
        const { query, type } = req.body;
        const userId = req.user.id;

        if (!query) {
            return res.status(400).json({ message: "Query string is required." });
        }

        // Check if the same query already exists for this user recently to avoid duplicates
        // We can either update the timestamp or just create a new one. 
        // Let's just create a new one to keep a true stack behavior, 
        // or optionally find and update if it's the exact same query within a short window.
        
        const historyItem = await History.create({
            user: userId,
            query: query.trim(),
            type: type || "search"
        });

        return res.status(201).json(historyItem);
    } catch (error) {
        console.error("Create history error:", error);
        return res.status(500).json({ message: "Failed to save history." });
    }
};

/**
 * @desc    Get user search history (latest to oldest)
 * @route   GET /api/history
 */
export const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch last 20 history items sorted by newest first
        const history = await History.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json(history);
    } catch (error) {
        console.error("Get history error:", error);
        return res.status(500).json({ message: "Failed to fetch history." });
    }
};

/**
 * @desc    Clear all history for the logged-in user
 * @route   DELETE /api/history
 */
export const clearHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        await History.deleteMany({ user: userId });
        
        return res.status(200).json({ message: "History cleared successfully." });
    } catch (error) {
        console.error("Clear history error:", error);
        return res.status(500).json({ message: "Failed to clear history." });
    }
};
