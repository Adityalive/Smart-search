import axios from "axios";

/**
 * Scrapes a URL and extracts its title, description, and main text content.
 * We use the free Jina Reader API (r.jina.ai) which handles JS-rendered
 * websites (React/Next) and extracts clean Markdown of only the readable content.
 * @param {string} url - The URL to scrape
 * @returns {Object} - { title, description, content }
 */
export const extractUrlContent = async (url) => {
    try {
        const response = await axios.get(`https://r.jina.ai/${url}`, {
            headers: {
                "Accept": "application/json",
                "X-Return-Format": "markdown"
            },
            timeout: 20000, // 20 seconds timeout as headful browsers take longer
        });

        const data = response.data.data || {};

        let title = data.title || "";
        let description = data.description || "";
        let content = data.content || "";
        
        // Clean up markdown/excessive newlines slightly
        content = content.replace(/\n{3,}/g, "\n\n").trim();

        // Limit content length so we don't blow up the DB
        if (content.length > 10000) {
            content = content.substring(0, 10000) + "...";
        }

        // If scraping returned empty content, use URL as fallback data
        if (!content || content.trim() === "") {
            const urlObj = new URL(url);
            const fallbackTitle = urlObj.hostname.replace(/^www\./, "") + urlObj.pathname.replace(/\//g, " - ");
            return {
                title: fallbackTitle || url,
                description: `Source: ${url}`,
                content: `Unable to scrape content from: ${url}`,
            };
        }

        return {
            title,
            description,
            content,
        };
    } catch (error) {
        console.error("Error scraping URL with Reader:", url, error.message);
        // If scraping fails, use URL as fallback data
        const urlObj = new URL(url);
        const fallbackTitle = urlObj.hostname.replace(/^www\./, "") + urlObj.pathname.replace(/\//g, " - ");
        return {
            title: fallbackTitle || url,
            description: `Source: ${url}`,
            content: `Unable to scrape content from: ${url}`,
        };
    }
};
