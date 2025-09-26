// middleware/roleMiddleware.js
const User = require("../models/UserManagement/UserReg"); // User schema

// Middleware to protect route and check login
const protect = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId; // Assume userId is sent in token or body
    if (!userId) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized, invalid user" });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware to authorize based on allowed positions
const authorizePositions = (...positions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userPosition = req.user.position.toLowerCase();
    const allowedPositions = positions.map(pos => pos.toLowerCase());

    if (!allowedPositions.includes(userPosition)) {
      return res
        .status(403)
        .json({ message: `Access denied for position: ${req.user.position}` });
    }

    next();
  };
};

module.exports = { protect, authorizePositions };
