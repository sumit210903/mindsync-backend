const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ✅ Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET not found in .env");
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Signup new user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    console.log("📩 Signup Request Body:", req.body); // ✅ Debug log

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Signup Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    console.log("📩 Login Request Body:", req.body); // ✅ Debug log

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signup, login };
