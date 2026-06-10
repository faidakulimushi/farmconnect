const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Order = require("../models/Order");

// ─────────────────────────────────────────
// @desc    Create a review for a product
// @route   POST /api/reviews
// @access  Private / Customer
// ─────────────────────────────────────────
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    res.status(400);
    throw new Error("Product ID, rating, and comment are required");
  }

  // Verify the customer has actually purchased the product
  const purchased = await Order.findOne({
    customer: req.user._id,
    "items.product": productId,
    status: "delivered",
  });

  if (!purchased) {
    res.status(403);
    throw new Error("You can only review products you have purchased and received");
  }

  // Prevent duplicate reviews
  const existing = await Review.findOne({ customer: req.user._id, product: productId });
  if (existing) {
    res.status(409);
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    customer: req.user._id,
    product: productId,
    rating: Number(rating),
    comment,
  });

  await review.populate("customer", "name avatar");

  res.status(201).json({ success: true, review });
});

// ─────────────────────────────────────────
// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
// ─────────────────────────────────────────
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("customer", "name avatar")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// ─────────────────────────────────────────
// @desc    Delete a review (own review or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
// ─────────────────────────────────────────
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.customer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorised to delete this review");
  }

  await review.deleteOne();
  res.json({ success: true, message: "Review deleted" });
});

module.exports = { createReview, getProductReviews, deleteReview };
