const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  payOrder,
} = require("../controllers/orderController");
const { protect, authorise } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/all", authorise("admin", "farmer"), getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/pay", payOrder);
router.put("/:id", authorise("admin", "farmer"), updateOrderStatus);

module.exports = router;
