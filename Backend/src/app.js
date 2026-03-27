import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import itemRouter from "./routes/items.routes.js";

const app = express();

// ─── Security & Utility Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = process.env.CLIENT_URL || "http://localhost:5174";
            // Allow requests with no origin (e.g. mobile apps, curl) or matching origin
            if (!origin || origin === allowed || /^http:\/\/localhost:\d+$/.test(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        credentials: true,
    })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/items", itemRouter);

// ─── Health check ──────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "Smart-search API is running 🚀" });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong.", error: err.message });
});

export default app;