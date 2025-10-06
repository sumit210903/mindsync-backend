const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require("../controllers/userController");
const protect = require("../middleware/Auth");

const router = express.Router();

// ✅ Public Routes
router.post("/signup", registerUser);
router.post("/login", loginUser);

// ✅ Protected Routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
