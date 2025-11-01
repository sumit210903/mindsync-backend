// controllers/dashboardController.js
const User = require("../models/User"); // ✅ CommonJS import (consistent with server.js)

// ✅ Fetch user-specific wellness dashboard data
const getUserDashboard = async (req, res) => {
  try {
    // ✅ Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in.",
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).select("name profilePic email");

    // ✅ Handle user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Mock wellness tracking data — replace with actual DB data later
    const dashboardData = {
      userInfo: {
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || "/uploads/default-avatar.png",
      },
      fitness: {
        steps: [5000, 7000, 8000, 6500, 9000], // example step counts
        workoutMinutes: [30, 45, 50, 60, 40], // example exercise duration
      },
      nutrition: {
        calories: [2000, 1800, 2200, 2100, 1900], // daily calorie intake
        waterIntake: [2, 2.5, 3, 2.8, 2.2], // liters per day
      },
      mentalHealth: {
        moodRatings: [7, 8, 6, 9, 8], // scale 1–10
        meditationMinutes: [10, 15, 20, 10, 12],
      },
    };

    // ✅ Respond with dashboard data
    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("❌ Dashboard fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = { getUserDashboard };
