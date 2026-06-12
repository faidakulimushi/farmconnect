const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const sendNotification = require("../utils/sendNotification");

// ─────────────────────────────────────────
// @desc    Create a new order from the user's cart
// @route   POST /api/orders
// @access  Private
// ─────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Validate stock and build order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product "${item.product?.title || "unknown"}" is no longer available`);
    }
    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.title}"`);
    }
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    });
  }

  const totalPrice = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // Create the order
  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    shippingAddress,
    totalPrice,
    paymentMethod: paymentMethod || "cash_on_delivery",
  });

  // Decrease product stock and increment sales count
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity, salesCount: item.quantity },
    });
  }

  // Clear the cart after successful order
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Notify the customer
  await sendNotification(req.user._id, `Your order #${order._id} has been placed successfully!`);

  res.status(201).json({ success: true, order });
});

// ─────────────────────────────────────────
// @desc    Get orders for the logged-in customer
// @route   GET /api/orders
// @access  Private
// ─────────────────────────────────────────
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.product", "title image price");

  res.json({ success: true, orders });
});

// ─────────────────────────────────────────
// @desc    Get all orders (admin) or farmer's relevant orders
// @route   GET /api/orders/all
// @access  Private / Admin | Farmer
// ─────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  let orders;

  if (req.user.role === "admin") {
    orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("customer", "name email")
      .populate("items.product", "title image price farmer");
  } else if (req.user.role === "farmer") {
    // Return orders that contain at least one product owned by this farmer
    const farmerProductIds = await Product.find({ farmer: req.user._id }).distinct("_id");
    orders = await Order.find({ "items.product": { $in: farmerProductIds } })
      .sort({ createdAt: -1 })
      .populate("customer", "name email")
      .populate("items.product", "title image price farmer");
  } else {
    res.status(403);
    throw new Error("Not authorised");
  }

  res.json({ success: true, orders });
});

// ─────────────────────────────────────────
// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
// ─────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "name email phone address")
    .populate("items.product", "title image price farmer");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Customers can only view their own orders
  if (
    req.user.role === "customer" &&
    order.customer._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorised to view this order");
  }

  res.json({ success: true, order });
});

// ─────────────────────────────────────────
// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private / Farmer | Admin
// ─────────────────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (status && !validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  if (paymentStatus === "paid") {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  const updated = await order.save();

  // Notify the customer
  await sendNotification(
    order.customer,
    `Your order #${order._id} status has been updated to "${status || order.status}".`
  );

  res.json({ success: true, order: updated });
});

// ─────────────────────────────────────────
// @desc    Mark an order as paid (simulated card / mobile payment)
// @route   PUT /api/orders/:id/pay
// @access  Private – order owner only
// ─────────────────────────────────────────
const payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorised to pay for this order");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentStatus = "paid";

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById, updateOrderStatus, payOrder };
