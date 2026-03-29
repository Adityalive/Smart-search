import { Router } from "express";
import { createHistory, getHistory, clearHistory } from "../controllers/history.controller.js";
import verifyAuth from "../middleware/verifyAuth.js";

const historyRouter = Router();

// Protect all history routes
historyRouter.use(verifyAuth);

historyRouter.post("/", createHistory);
historyRouter.get("/", getHistory);
historyRouter.delete("/", clearHistory);

export default historyRouter;
