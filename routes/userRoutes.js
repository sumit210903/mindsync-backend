const express = require("express");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");
const protect = require("../middleware/Auth");

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
