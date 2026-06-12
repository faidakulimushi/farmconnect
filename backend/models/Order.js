const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zip: { type: String, required: true },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash_on_delivery",
        "card",
        "mobile_money",
        "mpesa",
        "airtel_money",
        "mtn_money",
        "orange_money",
        "paypal",
        "bank_transfer",
      ],
      default: "cash_on_delivery",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
