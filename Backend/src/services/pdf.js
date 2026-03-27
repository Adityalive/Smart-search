import { PDFParse } from "pdf-parse";

/**
 * Extracts text from a PDF Buffer.
 * @param {Buffer} dataBuffer - Buffer of the PDF file
 * @returns {string} Extracted text content
 */
export const extractPdfContent = async (dataBuffer) => {
    let parser = null;
    try {
        // Instantiate the parser using the new v2.x class-based API
        parser = new PDFParse({ data: dataBuffer });
        
        // Extract the raw text
        const result = await parser.getText();

        // Limit length to prevent blown DB sizes
        let content = result.text || "";
        content = content.replace(/\s+/g, " ").trim();
        if (content.length > 20000) {
            content = content.substring(0, 20000) + "...";
        }
        
        return content;
    } catch (error) {
        console.error("Error reading PDF content:", error.message);
        return "";
    } finally {
        // Always clean up resources to prevent memory leaks in v2
        if (parser && typeof parser.destroy === 'function') {
            await parser.destroy();
        }
    }
};


