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

// Public routes
router.get("/suggestions", getSuggestions);
router.get("/price-range", getPriceRange);
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);
router.get("/:id/recommendations", getRecommendations);

// Farmer/Admin routes
router.get("/farmer/my-products", protect, authorise("farmer"), getMyProducts);
router.post("/", protect, authorise("farmer", "admin"), upload.single("image"), createProduct);
router.put("/:id", protect, authorise("farmer", "admin"), upload.single("image"), updateProduct);
router.delete("/:id", protect, authorise("farmer", "admin"), deleteProduct);

module.exports = router;
