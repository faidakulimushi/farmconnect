const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ─────────────────────────────────────────
// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
// ─────────────────────────────────────────
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "title price image quantity unit isActive farmer",
    populate: { path: "farmer", select: "name farmName" },
  });

  if (!cart) {
    return res.json({ success: true, items: [], total: 0 });
  }

  // Filter out products that have been removed or deactivated
  const validItems = cart.items.filter((item) => item.product && item.product.isActive);

  // Compute totals
  const total = validItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  res.json({ success: true, items: validItems, total });
});

// ─────────────────────────────────────────
// @desc    Add item to cart or update quantity
// @route   POST /api/cart
// @access  Private
// ─────────────────────────────────────────
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.quantity < quantity) {
    res.status(400);
    throw new Error(`Only ${product.quantity} unit(s) available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity }] });
  } else {
    const existingItem = cart.items.find((i) => i.product.toString() === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (newQty > product.quantity) {
        res.status(400);
        throw new Error(`Only ${product.quantity} unit(s) available in stock`);
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
  }

  await cart.populate({
    path: "items.product",
    select: "title price image quantity unit isActive",
  });

  const total = cart.items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  res.json({ success: true, items: cart.items, total });
});

// ─────────────────────────────────────────
// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
// ─────────────────────────────────────────
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.quantity < quantity) {
    res.status(400);
    throw new Error(`Only ${product.quantity} unit(s) available`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error("Item not in cart");
  }

  item.quantity = Number(quantity);
  await cart.save();

  await cart.populate({ path: "items.product", select: "title price image quantity unit" });
  const total = cart.items.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);

  res.json({ success: true, items: cart.items, total });
});

// ─────────────────────────────────────────
// @desc    Remove an item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
// ─────────────────────────────────────────
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();

  await cart.populate({ path: "items.product", select: "title price image quantity unit" });
  const total = cart.items.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);

  res.json({ success: true, items: cart.items, total });
});

// ─────────────────────────────────────────
// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
// ─────────────────────────────────────────
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, items: [], total: 0 });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
