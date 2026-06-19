const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/productController");
const { protect, authorise } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// Multer / Cloudinary upload error handler
const handleUploadError = (err, req, res, next) => {
  if (err && (err.message?.includes("Only image") || err.code === "LIMIT_FILE_SIZE" || err.http_code)) {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : err.message || "Image upload failed",
    });
  }
  next(err);
};

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
