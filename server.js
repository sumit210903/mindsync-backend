// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// ✅ Load environment variables
dotenv.config();

// ✅ Import MongoDB connection
const connectDB = require("./config/db_connect");

// ✅ Import routes
const userRoutes = require("./routes/userRoutes");

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize Express app
const app = express();

// -------------------------------------------
// ✅ CORS Configuration (Supports Local + Render + GitHub Pages)
// -------------------------------------------
const allowedOrigins = [
  "http://localhost:5500", // Local development
  "http://127.0.0.1:5500",
  "https://mindsync-frontend.onrender.com", // Render frontend
  "https://sumit210903.github.io", // GitHub Pages root
  "https://sumit210903.github.io/mindsync-frontend", // GitHub Pages project path
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow curl/postman/no-origin
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight (OPTIONS) requests globally
app.options("*", cors());

// -------------------------------------------
// ✅ Middleware
// -------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static uploads (profile pictures, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Logging helper (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// -------------------------------------------
// ✅ API Routes
// -------------------------------------------
app.use("/api/users", userRoutes);

// -------------------------------------------
// ✅ Default Root Route
// -------------------------------------------
app.get("/", (req, res) => {
  res.send("🌿 MindSync Backend API is running successfully!");
});

// -------------------------------------------
// ✅ Global Error Handler (Safety net)
// -------------------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Error caught:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// -------------------------------------------
// ✅ Start Server
// -------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
