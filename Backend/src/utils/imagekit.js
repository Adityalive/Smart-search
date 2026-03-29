import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

// Initialize ImageKit with fallback empty strings to prevent startup crash if env is missing
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "dummy",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "dummy"
});

/**
 * Uploads a file buffer (image, video, pdf, etc.) to ImageKit.
 * Returns the final remote URL.
 */
export const uploadToImageKit = async (buffer, originalName, mimetype) => {
    try {
        if (!process.env.IMAGEKIT_PUBLIC_KEY) {
             throw new Error("ImageKit ENV variables are missing. Please save your .env file.");
        }

        // Generate a random, collision-free filename
        const ext = originalName.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;

        const uploadResponse = await imagekit.upload({
            file: buffer, // The buffer data
            fileName: filename, // The name of the file on ImageKit
            folder: "/smart_search_uploads", // Store elegantly in a dedicated folder
            useUniqueFileName: true
        });

        // The URL hosted fully by ImageKit CDN
        return uploadResponse.url;

    } catch (error) {
        console.error("ImageKit Upload Error:", error);
        throw new Error(`Failed to upload media to ImageKit: ${error.message}`);
    }
};
