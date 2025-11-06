const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ 1️⃣ Check Authorization Header for Bearer Token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ✅ 2️⃣ Fallback: Allow token from cookies (optional if you use cookies)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 🚫 No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // ✅ 3️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 4️⃣ Fetch user from DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    // ✅ 5️⃣ Attach user to request object
    req.user = user;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);

    // Handle JWT-specific errors more clearly
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please log in again",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token, please log in again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized, token verification failed",
    });
  }
};

module.exports = protect;
