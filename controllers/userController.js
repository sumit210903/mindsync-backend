// backend/controllers/userController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

// Helper: BASE URL for building absolute image URLs
const BASE_URL = process.env.BASE_URL || "https://mindsync-backend-c7v9.onrender.com";

// ✅ Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment variables");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Helper: normalize photo URL (accepts either `photo` or `profilePic` fields)
function buildPhotoUrl(user) {
  // prefer profilePic if set, otherwise photo
  const raw = user?.profilePic || user?.photo || "";
  if (!raw) return "";
  // if already an absolute URL (http/https) return as-is
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  // otherwise assume it's a path like /uploads/xxx and prefix with BASE_URL
  return `${BASE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

// ---------------------------
// 🧩 SIGNUP USER → redirect to profile setup
// ---------------------------
exports.signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    console.log("✅ New user created:", user.email);

    // respond with token (do not return password)
    res.status(201).json({
      success: true,
      message: "Signup successful. Redirecting to profile setup...",
      token: generateToken(user._id),
      redirect: "/profile-setup.html",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: buildPhotoUrl(user),
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
};

// ---------------------------
// 🔑 LOGIN USER → redirect to dashboard
// ---------------------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🧠 Login request received:", {
      email,
      passwordReceived: !!password,
    });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.warn("⚠️ User not found for email:", email);
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("⚠️ Invalid password for:", email);
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    console.log("✅ Login successful:", email);

    // return token + minimal user info
    res.status(200).json({
      success: true,
      message: "Login successful. Redirecting to dashboard...",
      token: generateToken(user._id),
      redirect: "/dashboard.html",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: buildPhotoUrl(user),
      },
    });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// ---------------------------
// ✅ VERIFY TOKEN & RETURN USER DETAILS (used by frontend /api/users/verify)
//    - This verifies the token from Authorization header and returns user info
// ---------------------------
exports.verifyUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("name email profilePic photo");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: buildPhotoUrl(user) || "",
      },
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};

// ---------------------------
// 👤 GET USER PROFILE (protected route that uses req.user from middleware)
// ---------------------------
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // normalize/resolve profilePic
    const userObj = user.toObject();
    userObj.photo = buildPhotoUrl(userObj);

    res.json({ success: true, user: userObj });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// ---------------------------
// ✏️ UPDATE USER PROFILE (protected)
//    - Accepts multipart upload via multer (req.file) OR JSON fields
// ---------------------------
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, location, phone, age, gender, goal } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (phone) updateData.phone = phone;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (goal) updateData.goal = goal;

    if (req.file) {
      // multer saved file at /uploads/<filename> (ensure server serves /uploads)
      updateData.profilePic = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userObj = updatedUser.toObject();
    userObj.photo = buildPhotoUrl(userObj);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userObj,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

// ---------------------------
// 🧾 SETUP PROFILE (after signup) (protected)
// ---------------------------
exports.setupUserProfile = async (req, res) => {
  try {
    const { bio, location, phone, age, gender, goal } = req.body;
    const updateData = {};
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (phone) updateData.phone = phone;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (goal) updateData.goal = goal;

    if (req.file) {
      updateData.profilePic = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userObj = updatedUser.toObject();
    userObj.photo = buildPhotoUrl(userObj);

    res.status(200).json({
      success: true,
      message: "Profile setup complete. Redirecting to dashboard...",
      user: userObj,
      redirect: "/dashboard.html",
    });
  } catch (error) {
    console.error("Setup Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error during setup" });
  }
};

// ---------------------------
// 🔍 VERIFY TOKEN (protected middleware variant)
//    - This function expects protect middleware to have set req.user
//    - Returns token validity and user details
// ---------------------------
exports.verifyToken = async (req, res) => {
  try {
    // req.user is attached by your Auth middleware (protect)
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // fetch fresh user (avoid sending password)
    const user = await User.findById(req.user.id).select("name email profilePic photo");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Token valid",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: buildPhotoUrl(user),
      },
    });
  } catch (error) {
    console.error("Verify Token Error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
