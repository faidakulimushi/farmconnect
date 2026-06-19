const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getAdminProducts,
  getRecommendations,
  getFeaturedProducts,
  getSuggestions,
  getPriceRange,
} = require("../controllers/productController");
const { protect, authorise } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// Multer / Cloudinary upload error handler
const handleUploadError = (err, req, res, next) => {
  if (!err) return next();
  // Hard reject: wrong file type
  if (err.message?.includes("Only image")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  // Hard reject: file too large
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Image must be 5 MB or smaller" });
  }
  // Cloudinary / network error → skip image upload, continue without image
  // (avoids 500 when Cloudinary credentials are missing or unreachable)
  req.file = undefined;
  next();
};

// Admin-only routes
router.get("/admin/all", protect, authorise("admin"), getAdminProducts);

// Public routes
router.get("/suggestions", getSuggestions);
router.get("/price-range", getPriceRange);
router.get("/featured", getFeaturedProducts);
router.get("/farmer/my-products", protect, authorise("farmer"), getMyProducts);
router.get("/", getProducts);
router.get("/:id/recommendations", getRecommendations);
router.get("/:id", getProductById);

// Farmer/Admin routes
router.post("/", protect, authorise("farmer", "admin"), upload.single("image"), handleUploadError, createProduct);
router.put("/:id", protect, authorise("farmer", "admin"), upload.single("image"), handleUploadError, updateProduct);
router.delete("/:id", protect, authorise("farmer", "admin"), deleteProduct);

module.exports = router;
