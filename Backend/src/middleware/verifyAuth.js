import jwt from "jsonwebtoken";

const verifyAuth = (req, res, next) => {
    // Read token from httpOnly cookie
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, name, email, iat, exp }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token is invalid or expired." });
    }
};

export default verifyAuth;
