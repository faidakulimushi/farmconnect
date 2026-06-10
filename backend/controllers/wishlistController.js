const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/Wishlist");

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ customer: req.user._id }).populate(
    "products",
    "title price image rating numReviews isActive"
  );
  res.json({ success: true, products: wishlist ? wishlist.products : [] });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) { res.status(400); throw new Error("Product ID is required"); }

  let wishlist = await Wishlist.findOne({ customer: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ customer: req.user._id, products: [productId] });
  } else if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  res.json({ success: true, message: "Added to wishlist" });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ customer: req.user._id });
  if (!wishlist) { res.status(404); throw new Error("Wishlist not found"); }
  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();
  res.json({ success: true, message: "Removed from wishlist" });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
