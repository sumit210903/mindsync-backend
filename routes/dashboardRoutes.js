const express = require("express");
const { getUserDashboard } = require("../controllers/dashboardController");
const protect = require("../middleware/Auth");

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get authenticated user's wellness dashboard data
 * @access  Private
 */
router.get("/", protect, getUserDashboard);

module.exports = router;
