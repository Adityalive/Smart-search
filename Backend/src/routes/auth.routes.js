import { Router } from "express";
import { register, login, logout, getme } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import verifyAuth from "../middleware/verifyauth.js";

const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", registerValidator, register);

// POST /api/auth/login
authRouter.post("/login", loginValidator, login);

// POST /api/auth/logout
authRouter.post("/logout", logout);

// GET /api/auth/me
authRouter.get("/me", verifyAuth, getme);

export default authRouter;
