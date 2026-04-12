import jwt from "jsonwebtoken";
import blacklistModel from "../models/blacklist.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Check if token is blacklisted
    const isBlacklisted = await blacklistModel.findOne({ token });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Please log in." });
  }
};
