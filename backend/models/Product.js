const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    // Cloudinary image URL
    image: {
      type: String,
      default: "",
    },
    // Cloudinary public_id for deletion
    imagePublicId: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    unit: {
      type: String,
      default: "kg", // e.g. kg, litre, piece, dozen
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Aggregate rating (recomputed on each review)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    salesCount: { type: Number, default: 0 }, // Used for best-sellers
    tags: [String], // Used for AI recommendations
  },
  { timestamps: true }
);

// Full-text search index
productSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
