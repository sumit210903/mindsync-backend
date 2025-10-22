const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ✅ Generate JWT token
const generateToken = (id) => {
if (!process.env.JWT_SECRET) {
throw new Error("JWT_SECRET not defined in environment variables");
}
return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 🧩 SIGNUP USER → redirect to profile setup
exports.signupUser = async (req, res) => {
try {
const { name, email, password } = req.body;

```
if (!name || !email || !password)
  return res.status(400).json({ message: "Please fill all fields" });

const userExists = await User.findOne({ email });
if (userExists)
  return res.status(400).json({ message: "User already exists" });

const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, password: hashedPassword });

res.status(201).json({
  success: true,
  message: "Signup successful. Redirecting to profile setup...",
  token: generateToken(user._id),
  redirect: "/profile-setup.html",
});
```

} catch (error) {
console.error("Signup Error:", error);
res.status(500).json({ message: "Server error during signup" });
}
};

// 🔑 LOGIN USER → redirect to dashboard
exports.loginUser = async (req, res) => {
try {
const { email, password } = req.body;

```
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: "User not found" });

const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch)
  return res.status(400).json({ message: "Invalid email or password" });

res.status(200).json({
  success: true,
  message: "Login successful. Redirecting to dashboard...",
  token: generateToken(user._id),
  redirect: "/dashboard.html",
});
```

} catch (error) {
console.error("Login Error:", error);
res.status(500).json({ message: "Server error during login" });
}
};

// 🔍 VERIFY TOKEN
exports.verifyToken = async (req, res) => {
try {
res.status(200).json({ success: true, message: "Token valid", user: req.user });
} catch {
res.status(401).json({ success: false, message: "Invalid token" });
}
};

// 👤 GET USER PROFILE
exports.getUserProfile = async (req, res) => {
try {
const user = await User.findById(req.user.id).select("-password");
if (!user) return res.status(404).json({ message: "User not found" });
res.json({ success: true, user });
} catch (error) {
console.error("Get Profile Error:", error);
res.status(500).json({ message: "Error fetching profile" });
}
};

// ✏️ UPDATE USER PROFILE
exports.updateUserProfile = async (req, res) => {
try {
const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
new: true,
}).select("-password");
res.json({
success: true,
message: "Profile updated successfully",
user: updatedUser,
});
} catch (error) {
console.error("Update Profile Error:", error);
res.status(500).json({ message: "Error updating profile" });
}
};

// 🧾 SETUP PROFILE (after signup) → redirect to dashboard
exports.setupUserProfile = async (req, res) => {
try {
const { bio, location, phone } = req.body;
const updateData = { bio, location, phone };

```
if (req.file) {
  updateData.profilePic = `/uploads/${req.file.filename}`;
}

const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
  new: true,
}).select("-password");

res.status(200).json({
  success: true,
  message: "Profile setup complete. Redirecting to dashboard...",
  user: updatedUser,
  redirect: "/dashboard.html",
});
```

} catch (error) {
console.error("Setup Profile Error:", error);
res.status(500).json({ message: "Server error during setup" });
}
};
