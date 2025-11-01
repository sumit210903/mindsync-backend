// routes/dashboardRoutes.js
const express = require("express");
const { getUserDashboard } = require("../controllers/dashboardController");
const { Auth } = require("../middleware/Auth");

const router = express.Router();

// ✅ Route: GET /api/dashboard
// Protected route — fetches the logged-in user's dashboard data
router.get("/", Auth, getUserDashboard);

module.exports = router;
