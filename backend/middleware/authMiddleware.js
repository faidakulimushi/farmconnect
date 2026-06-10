const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

/**
 * Protect routes – verifies JWT from Authorization header.
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorised, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorised, user not found");
    }

    if (!req.user.isActive) {
      res.status(403);
      throw new Error("Account has been deactivated");
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorised, token invalid or expired");
  }
});

/** Allow only users with a specific role */
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not permitted to access this resource`);
    }
    next();
  };
};

module.exports = { protect, authorise };
