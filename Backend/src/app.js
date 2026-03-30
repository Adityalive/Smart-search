import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRouter from "./routes/auth.routes.js";
import itemRouter from "./routes/items.routes.js";
import historyRouter from "./routes/history.routes.js";

const app = express();

// ─── Security & Utility Middleware ─────────────────────────────────────────
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "blob:", "https:"],
                connectSrc: ["'self'", "https:", "wss:"],
            },
        },
    })
);
app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = process.env.CLIENT_URL || "http://localhost:5174";
            // Allow requests with no origin, matching origin, or chrome-extension origins
            if (!origin || origin === allowed || /^http:\/\/localhost:\d+$/.test(origin) || origin.startsWith("chrome-extension://")) {
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

// ─── Static Files ────────────────────────────────────────────────────────
// Serve the built frontend from the 'src/public/dist' directory
app.use(express.static(path.join(__dirname, "public/dist")));
// Also serve other public files (like install.html) from 'src/public'
app.use(express.static(path.join(__dirname, "public")));

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/items", itemRouter);
app.use("/api/history", historyRouter);

// ─── Health check (API only) ───────────────────────────────────────────────
app.get("/api", (req, res) => {
    res.json({ message: "Smart-search API is running 🚀" });
});

// ─── API 404 handler — must be BEFORE the SPA catch-all ───────────────────
app.use("/api", (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Client-side Routing (SPA) — only for non-API routes ─────────────────
app.get(/\/(?!api).*/, (req, res) => {
    const indexPath = path.join(__dirname, "public/dist/index.html");
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(404).json({ message: "Frontend not built. Run: npm run build" });
        }
    });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong.", error: err.message });
});

export default app;