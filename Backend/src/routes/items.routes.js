import { Router } from "express";
import { saveItem, getItems, getResurfacedItems } from "../controllers/item.controller.js";
import { getClusters } from "../controllers/cluster.controller.js";
import { getGraph, getRelatedItems, semanticSearch } from "../controllers/graph.controller.js";
import { saveItemValidator } from "../validators/item.validator.js";
import verifyAuth from "../middleware/verifyAuth.js";
import { upload } from "../middleware/upload.js";

const itemRouter = Router();

// All item routes are protected
itemRouter.use(verifyAuth);

// POST /api/items — save a link or upload a file
itemRouter.post("/", upload.single("file"), saveItemValidator, saveItem);

// GET /api/items — fetch all saved items
itemRouter.get("/", getItems);
// GET /api/items/clusters — fetch semantic clusters based on Qdrant embeddings
itemRouter.get("/clusters", getClusters);
// GET /api/items/resurfaced — fetch items from the last 30/60/90 days
itemRouter.get("/resurfaced", getResurfacedItems);

// GET /api/items/graph — fetch global knowledge graph nodes and links
itemRouter.get("/graph", getGraph);
// GET /api/items/search?q=... — perform semantic AI search
itemRouter.get("/search", semanticSearch);
// GET /api/items/:id/related — fetch conceptually matching items via vector geometry
itemRouter.get("/:id/related", getRelatedItems);

export default itemRouter;
