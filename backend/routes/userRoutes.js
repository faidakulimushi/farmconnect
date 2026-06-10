const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getFarmerStats,
} = require("../controllers/userController");
const { protect, authorise } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/stats", authorise("admin"), getDashboardStats);
router.get("/farmer-stats", authorise("farmer"), getFarmerStats);
router.get("/", authorise("admin"), getAllUsers);
router.get("/:id", authorise("admin"), getUserById);
router.put("/:id", authorise("admin"), updateUser);
router.delete("/:id", authorise("admin"), deleteUser);

module.exports = router;
