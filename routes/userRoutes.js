// backend/routes/userRoutes.js

const express = require("express");
const {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  setupUserProfile,
  verifyUser,      // Added verifyUser endpoint for frontend token checks
  verifyToken,     // For backend middleware validation
} = require("../controllers/userController");

const protect = require("../middleware/Auth");
const upload = require("../middleware/uploadmiddleware");

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
 * @route   GET /api/users/verify
 * @desc    Verify JWT token validity (used by frontend)
 * @access  Private
 */
router.get("/verify", verifyUser);

/**
 * @route   GET /api/users/token
 * @desc    Check token validity using middleware (server-side)
 * @access  Private
 */
router.get("/token", protect, verifyToken);

/**
 * @route   GET /api/users/profile
 * @desc    Get logged-in user's full profile
 * @access  Private
 */
router.get("/profile", protect, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user's profile details (with optional image upload)
 * @access  Private
 */
router.put("/profile", protect, upload.single("profilePic"), updateUserProfile);

/**
 * @route   POST /api/users/profile-setup
 * @desc    Initial or detailed profile setup (after signup)
 * @access  Private
 */
router.post("/profile-setup", protect, upload.single("profilePic"), setupUserProfile);

/**
 * @route   GET /api/users/profile/basic
 * @desc    Return basic user info (name, email, photo)
 * @access  Private
 */
router.get("/profile/basic", protect, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const BASE_URL = process.env.BASE_URL || "https://mindsync-backend-c7v9.onrender.com";
    const photo =
      user.photo?.startsWith("http") || user.profilePic?.startsWith("http")
        ? user.photo || user.profilePic
        : `${BASE_URL}${user.photo || user.profilePic || ""}`;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: photo || "",
      },
    });
  } catch (error) {
    console.error("Basic Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch basic user data",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/users
 * @desc    Health check endpoint for user routes
 * @access  Public
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 User routes are working fine!",
  });
});

module.exports = router;
