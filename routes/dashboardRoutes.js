const express = require("express");
const { getUserDashboard } = require("../controllers/dashboardController");
const { Auth } = require("../middleware/Auth"); // ✅ ensure named export if using destructuring

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get authenticated user's wellness dashboard data
 * @access  Private
 */
router.get("/", Auth, getUserDashboard);

module.exports = router;
