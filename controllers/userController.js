const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 Helper function to generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment variables");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 📝 @desc Register new user
// @route POST /api/users/signup
// @access Public
exports.signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password safely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔑 @desc Login user
// @route POST /api/users/login
// @access Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Check user existence
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.password) {
      return res.status(500).json({ message: "Password not set for this user" });
    }

    // Validate password safely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 👤 @desc Get user profile
// @route GET /api/users/profile
// @access Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ @desc Update user profile
// @route PUT /api/users/profile
// @access Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // If password is provided, hash it
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        token: generateToken(updatedUser._id),
      },
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✨ @desc Setup user profile (first time after signup)
// @route POST /api/users/setup
// @access Private
exports.setupUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.age = req.body.age || user.age;
    user.gender = req.body.gender || user.gender;
    user.goal = req.body.goal || user.goal;
    user.bio = req.body.bio || user.bio;

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePic) {
      user.profilePic = req.body.profilePic;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile setup completed successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Profile Setup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🚪 @desc Logout user (optional for JWT - handled on client)
// @route POST /api/users/logout
// @access Private
exports.logoutUser = (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
