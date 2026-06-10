const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { cloudinary } = require("../config/cloudinary");

// ─────────────────────────────────────────
// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
// ─────────────────────────────────────────
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };

  // Regex search – case-insensitive partial match on title, description, tags
  if (keyword) {
    const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { title: re },
      { description: re },
      { tags: re },
    ];
  }

  // Category filter – accept either an ObjectId or a slug string
  if (category) {
    const mongoose = require("mongoose");
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ slug: category.toLowerCase() });
      if (cat) query.category = cat._id;
      else query.category = null; // no match → return empty
    }
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sorting
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    popular: { salesCount: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("category", "name slug")
    .populate("farmer", "name farmName avatar farmLocation")
    .sort(sortBy)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    products,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

// ─────────────────────────────────────────
// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
// ─────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("farmer", "name farmName avatar farmLocation farmDescription");

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

// ─────────────────────────────────────────
// @desc    Create a product (farmer only)
// @route   POST /api/products
// @access  Private / Farmer
// ─────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, quantity, unit, tags, isFeatured } = req.body;

  if (!title || !description || !price || !category || quantity === undefined) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  let image = "";
  let imagePublicId = "";

  if (req.file) {
    image = req.file.path;
    imagePublicId = req.file.filename;
  }

  const product = await Product.create({
    title,
    description,
    price: Number(price),
    image,
    imagePublicId,
    category,
    quantity: Number(quantity),
    unit: unit || "kg",
    farmer: req.user._id,
    tags: tags ? JSON.parse(tags) : [],
    isFeatured: isFeatured === "true",
  });

  await product.populate("category", "name slug");

  res.status(201).json({ success: true, product });
});

// ─────────────────────────────────────────
// @desc    Update a product (farmer – own products only)
// @route   PUT /api/products/:id
// @access  Private / Farmer
// ─────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Farmers can only update their own; admins can update any
  if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorised to update this product");
  }

  const { title, description, price, category, quantity, unit, tags, isFeatured, isActive } =
    req.body;

  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (category !== undefined) product.category = category;
  if (quantity !== undefined) product.quantity = Number(quantity);
  if (unit !== undefined) product.unit = unit;
  if (tags !== undefined) product.tags = JSON.parse(tags);
  if (isFeatured !== undefined) product.isFeatured = isFeatured === "true" || isFeatured === true;
  if (isActive !== undefined) product.isActive = isActive === "true" || isActive === true;

  // Replace image if a new file was uploaded
  if (req.file) {
    // Delete the old image from Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }
    product.image = req.file.path;
    product.imagePublicId = req.file.filename;
  }

  const updated = await product.save();
  await updated.populate("category", "name slug");

  res.json({ success: true, product: updated });
});

// ─────────────────────────────────────────
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private / Farmer | Admin
// ─────────────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorised to delete this product");
  }

  // Remove image from Cloudinary
  if (product.imagePublicId) {
    await cloudinary.uploader.destroy(product.imagePublicId);
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted successfully" });
});

// ─────────────────────────────────────────
// @desc    Get products listed by the logged-in farmer
// @route   GET /api/products/my-products
// @access  Private / Farmer
// ─────────────────────────────────────────
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ farmer: req.user._id })
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  res.json({ success: true, products });
});

// ─────────────────────────────────────────
// @desc    Get AI-powered product recommendations based on a product
// @route   GET /api/products/:id/recommendations
// @access  Public
// ─────────────────────────────────────────
const getRecommendations = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Simple content-based filtering: same category, similar tags, high rating
  const recommendations = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { tags: { $in: product.tags } }],
  })
    .populate("category", "name slug")
    .populate("farmer", "name farmName")
    .sort({ rating: -1, salesCount: -1 })
    .limit(6);

  res.json({ success: true, recommendations });
});

// ─────────────────────────────────────────
// @desc    Autocomplete search suggestions (products + categories)
// @route   GET /api/products/suggestions?q=<text>
// @access  Public
// ─────────────────────────────────────────
const getSuggestions = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();

  if (!q) {
    return res.json({ success: true, suggestions: [] });
  }

  // Escape special regex chars then build a case-insensitive partial-match pattern
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "i");

  const [products, categories] = await Promise.all([
    Product.find({ isActive: true, title: re })
      .select("title image")
      .limit(6)
      .lean(),
    Category.find({ isActive: true, name: re })
      .select("name slug")
      .limit(3)
      .lean(),
  ]);

  const suggestions = [
    ...categories.map((c) => ({ type: "category", label: c.name, slug: c.slug })),
    ...products.map((p) => ({
      type: "product",
      label: p.title,
      image: p.image || null,
    })),
  ];

  res.json({ success: true, suggestions });
});

// ─────────────────────────────────────────
// @desc    Get the min (always 0) and max product price
// @route   GET /api/products/price-range
// @access  Public
// ─────────────────────────────────────────
const getPriceRange = asyncHandler(async (req, res) => {
  const result = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, maxPrice: { $max: "$price" } } },
  ]);

  const maxPrice = result.length > 0 ? result[0].maxPrice : 0;
  res.json({ success: true, min: 0, max: maxPrice });
});

// ─────────────────────────────────────────
// @desc    Get featured & best-selling products
// @route   GET /api/products/featured
// @access  Public
// ─────────────────────────────────────────
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const featured = await Product.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .populate("farmer", "name farmName")
    .sort({ createdAt: -1 })
    .limit(8);

  const bestSellers = await Product.find({ isActive: true })
    .populate("category", "name slug")
    .populate("farmer", "name farmName")
    .sort({ salesCount: -1 })
    .limit(8);

  res.json({ success: true, featured, bestSellers });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getRecommendations,
  getFeaturedProducts,
  getSuggestions,
  getPriceRange,
};
