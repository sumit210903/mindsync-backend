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
// ✅ CORS Configuration
// -------------------------------------------
const allowedOrigins = [
  "http://localhost:5500",                  // Local development
  "https://mindsync-frontend.onrender.com", // Render frontend (if used)
  "https://sumit210903.github.io",          // GitHub Pages frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
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

// ✅ Serve static files (uploads, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------------------------
// ✅ API Routes
// -------------------------------------------
app.use("/api/users", userRoutes);

// -------------------------------------------
// ✅ Default Route
// -------------------------------------------
app.get("/", (req, res) => {
  res.send("🌿 MindSync Backend API is running successfully!");
});

// -------------------------------------------
// ✅ Global Error Handler
// -------------------------------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// -------------------------------------------
// ✅ Start Server
// -------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
