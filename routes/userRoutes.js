// routes/userRoutes.js
const express = require("express");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");
const protect = require("../middleware/Auth");

const router = express.Router();

// ✅ GET: Fetch user profile (requires authentication)
router.get("/profile", protect, getUserProfile);

// ✅ PUT: Update user profile (requires authentication)
router.put("/profile", protect, updateUserProfile);

// ✅ Optional test route
router.get("/", (req, res) => {
  res.json({ message: "User routes are working 🚀" });
});

module.exports = router;
