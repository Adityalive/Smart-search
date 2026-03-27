import { Router } from "express";
import { saveItem, getItems } from "../controllers/item.controller.js";
import { saveItemValidator } from "../validators/item.validator.js";
import verifyAuth from "../middleware/verifyauth.js";
import { upload } from "../middleware/upload.js";

const itemRouter = Router();

// All item routes are protected
itemRouter.use(verifyAuth);

// POST /api/items — save a link or upload a file
itemRouter.post("/", upload.single("file"), saveItemValidator, saveItem);

// GET /api/items — fetch all saved items
itemRouter.get("/", getItems);

export default itemRouter;
