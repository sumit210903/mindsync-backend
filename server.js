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

// ✅ CORS setup – allow frontend requests
app.use(
  cors({
    origin: [
      "http://localhost:5500", // local dev
      "https://mindsync-frontend.onrender.com", // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (e.g., uploads folder)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API routes
app.use("/api/users", userRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🌿 MindSync Backend API is running successfully!");
});

// ✅ Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
