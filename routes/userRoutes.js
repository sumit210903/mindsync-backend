const express = require("express");
const {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  setupUserProfile,
} = require("../controllers/userController");

const protect = require("../middleware/Auth");
const upload = require("../middleware/uploadmiddleware"); // fixed naming

const router = express.Router();

/**
 * @route   POST /api/users/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", signupUser);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/users/profile
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get("/profile", protect, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user's profile details (without image)
 * @access  Private
 */
router.put("/profile", protect, updateUserProfile);

/**
 * @route   POST /api/users/profile-setup
 * @desc    Initial or detailed profile setup (with optional image upload)
 * @access  Private
 */
router.post(
  "/profile-setup",
  protect,
  upload.single("profilePic"), // handle single image upload
  setupUserProfile
);

/**
 * @route   GET /api/users
 * @desc    Health check for user routes
 * @access  Public
 */
router.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 User routes are working fine!" });
});

module.exports = router;
