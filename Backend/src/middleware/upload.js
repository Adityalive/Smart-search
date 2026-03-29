import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Extended to 50MB to accommodate standard video files
    fileFilter: (req, file, cb) => {
        // Allow pdf, standard images, and standard videos
        const filetypes = /pdf|jpeg|jpg|png|mp4|webm|avi|mov/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /pdf|image\/|video\//.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only PDFs, Images, and Videos are allowed!"));
    },
});
