import { Router } from "express";
import { saveItem, getItems } from "../controllers/item.controller.js";
import { saveItemValidator } from "../validators/item.validator.js";
import verifyAuth from "../middleware/verifyauth.js";

const itemRouter = Router();

// All item routes are protected
itemRouter.use(verifyAuth);

// POST /api/items — save a link
itemRouter.post("/", saveItemValidator, saveItem);

// GET /api/items — fetch all saved links
itemRouter.get("/", getItems);

export default itemRouter;
