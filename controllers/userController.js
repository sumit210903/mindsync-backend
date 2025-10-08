const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // you can adjust (e.g. "7d")
  });
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          token: generateToken(user.id),
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.error("Signup Error:", err.message);
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
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Successful login
    res.json({
      success: true,
      message: "Login successful",
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
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

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Get Profile Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ @desc Update user profile
// @route PUT /api/users/profile
// @access Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // If password is provided, hash it
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          _id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          token: generateToken(updatedUser.id), // reissue fresh token
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Update Profile Error:", err.message);
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

    // Save setup fields
    user.age = req.body.age || user.age;
    user.gender = req.body.gender || user.gender;
    user.goal = req.body.goal || user.goal;
    user.bio = req.body.bio || user.bio;

    // If you want to save profilePic as a file or URL, handle upload middleware separately
    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePic) {
      user.profilePic = req.body.profilePic; // fallback
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile setup completed successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Profile Setup Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🚪 @desc Logout user (optional for JWT - handled on client)
// @route POST /api/users/logout
// @access Private (but just clears token client-side)
exports.logoutUser = (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
