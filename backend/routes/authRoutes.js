const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, updateMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/auth/me", protect, getMe);
router.put("/auth/me", protect, updateMe);

module.exports = router;
