const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ─────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/register
// @access  Public
// ─────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, and password");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error("Email already registered");
  }

  // Only allow valid public roles; admin must be set manually in DB
  const allowedRoles = ["customer", "farmer"];
  const userRole = allowedRoles.includes(role) ? role : "customer";

  const user = await User.create({ name, email, password, role: userRole });

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    token: generateToken(user._id),
  });
});

// ─────────────────────────────────────────
// @desc    Login user & return token
// @route   POST /api/login
// @access  Public
// ─────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Re-include password field that is normally excluded
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Account has been deactivated");
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      farmName: user.farmName,
    },
    token: generateToken(user._id),
  });
});

// ─────────────────────────────────────────
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// ─────────────────────────────────────────
// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
// ─────────────────────────────────────────
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  const { name, phone, address, farmName, farmDescription, farmLocation, avatar } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (farmName !== undefined) user.farmName = farmName;
  if (farmDescription !== undefined) user.farmDescription = farmDescription;
  if (farmLocation !== undefined) user.farmLocation = farmLocation;
  if (avatar) user.avatar = avatar;

  // Allow password change if provided
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = req.body.password;
  }

  const updated = await user.save();

  res.json({
    success: true,
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      phone: updated.phone,
      address: updated.address,
      farmName: updated.farmName,
      farmDescription: updated.farmDescription,
      farmLocation: updated.farmLocation,
    },
  });
});

module.exports = { registerUser, loginUser, getMe, updateMe };
