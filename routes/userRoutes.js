// routes/userRoutes.js
const express = require("express");
const {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const protect = require("../middleware/Auth");

const router = express.Router();

// ✅ POST: Register a new user
router.post("/signup", signupUser);

// ✅ POST: Login user and return token
router.post("/login", loginUser);

// ✅ GET: Fetch user profile (requires authentication)
router.get("/profile", protect, getUserProfile);

// ✅ PUT: Update user profile (requires authentication)
router.put("/profile", protect, updateUserProfile);

// ✅ Health check route (optional)
router.get("/", (req, res) => {
  res.json({ message: "🚀 User routes are working fine!" });
});

module.exports = router;
