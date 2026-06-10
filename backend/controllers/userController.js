const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ─────────────────────────────────────────
// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private / Admin
// ─────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// ─────────────────────────────────────────
// @desc    Get single user by ID (admin)
// @route   GET /api/users/:id
// @access  Private / Admin
// ─────────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user });
});

// ─────────────────────────────────────────
// @desc    Update user role or active status (admin)
// @route   PUT /api/users/:id
// @access  Private / Admin
// ─────────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { role, isActive, isVerified } = req.body;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (isVerified !== undefined) user.isVerified = isVerified;

  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// ─────────────────────────────────────────
// @desc    Delete a user (admin)
// @route   DELETE /api/users/:id
// @access  Private / Admin
// ─────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.json({ success: true, message: "User deleted successfully" });
});

// ─────────────────────────────────────────
// @desc    Get admin dashboard statistics
// @route   GET /api/users/stats
// @access  Private / Admin
// ─────────────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalFarmers, totalProducts, totalOrders, recentOrders] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "farmer" }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("customer", "name email"),
  ]);

  // Revenue from delivered orders
  const revenueData = await Order.aggregate([
    { $match: { status: "delivered" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = revenueData[0]?.total || 0;

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Monthly revenue for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    { $match: { status: "delivered", createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalFarmers,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      monthlyRevenue,
      recentOrders,
    },
  });
});

// ─────────────────────────────────────────
// @desc    Get farmer dashboard statistics
// @route   GET /api/users/farmer-stats
// @access  Private / Farmer
// ─────────────────────────────────────────
const getFarmerStats = asyncHandler(async (req, res) => {
  const farmerProducts = await Product.find({ farmer: req.user._id }).distinct("_id");

  const [totalProducts, totalOrders] = await Promise.all([
    Product.countDocuments({ farmer: req.user._id }),
    Order.countDocuments({ "items.product": { $in: farmerProducts } }),
  ]);

  const revenueData = await Order.aggregate([
    { $match: { "items.product": { $in: farmerProducts }, status: "delivered" } },
    { $unwind: "$items" },
    { $match: { "items.product": { $in: farmerProducts } } },
    { $group: { _id: null, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
  ]);

  const totalRevenue = revenueData[0]?.revenue || 0;

  const recentOrders = await Order.find({ "items.product": { $in: farmerProducts } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("customer", "name email");

  res.json({
    success: true,
    stats: { totalProducts, totalOrders, totalRevenue, recentOrders },
  });
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats, getFarmerStats };
