const User = require("../models/User");

/**
 * @desc    Fetch authenticated user's wellness dashboard data
 * @route   GET /api/dashboard
 * @access  Private
 */
const getUserDashboard = async (req, res) => {
  try {
    // ✅ Ensure the user is authenticated via middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in again.",
      });
    }

    const userId = req.user.id;

    // ✅ Fetch user info (minimal fields)
    const user = await User.findById(userId).select("name email profilePic goal");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Construct BASE_URL for consistent image path handling
    const BASE_URL =
      process.env.BASE_URL || "https://mindsync-backend-c7v9.onrender.com";

    // ✅ Ensure profilePic is a full URL
    const profilePic =
      user.profilePic && !user.profilePic.startsWith("http")
        ? `${BASE_URL}${user.profilePic}`
        : user.profilePic || `${BASE_URL}/uploads/default-avatar.png`;

    // ✅ Mock wellness data (replace later with dynamic DB data)
    const dashboardData = {
      userInfo: {
        name: user.name,
        email: user.email,
        profilePic,
        goal: user.goal || "Stay healthy & mindful",
      },
      fitness: {
        steps: [5000, 7000, 8000, 6500, 9000],
        workoutMinutes: [30, 45, 50, 60, 40],
      },
      nutrition: {
        calories: [2000, 1800, 2200, 2100, 1900],
        waterIntake: [2, 2.5, 3, 2.8, 2.2],
      },
      mentalHealth: {
        moodRatings: [7, 8, 6, 9, 8],
        meditationMinutes: [10, 15, 20, 10, 12],
      },
    };

    // ✅ Send successful response
    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("❌ Dashboard Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = { getUserDashboard };
