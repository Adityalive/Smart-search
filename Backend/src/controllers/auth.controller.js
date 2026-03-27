import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const COOKIE_OPTIONS = {
    httpOnly: true,          // JS cannot access the cookie (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",      // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// POST /api/auth/register
export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered." });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user);

        // Set token as httpOnly cookie
        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(201).json({
            message: "User registered successfully.",
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = generateToken(user);

        // Set token as httpOnly cookie
        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(200).json({
            message: "Logged in successfully.",
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};

// POST /api/auth/logout
export const logout = (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);
    return res.status(200).json({ message: "Logged out successfully." });
};

export const getme = async (req, res) => {

    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
        user
    });
}
