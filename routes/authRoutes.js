const express = require("express");
const router = express.Router();

// 🧩 Import controller functions
const { signup, login } = require("../controllers/authController");

// 🧠 Auth routes
// Register a new user
router.post("/signup", signup);

// Login existing user
router.post("/login", login);

// 🧾 Export router
module.exports = router;
