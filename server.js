// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express app
const app = express();

// ✅ Middleware: Parse JSON bodies
app.use(express.json());

// ✅ Configure CORS for frontend origins
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",           // Local testing (VSCode Live Server)
      "http://localhost:5500",           // Localhost
      "https://sumit210903.github.io",   // GitHub Pages frontend
      "https://mindsync-frontend.vercel.app" // Optional future deployment
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ✅ API Routes (important — define before 404 handler)
app.use("/api/users", userRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 MindSync Backend is Running Successfully!",
  });
});

// ✅ Catch-all for unmatched API routes (kept after real routes)
app.all("*", (req, res) => {
  console.warn(`⚠️ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.stack);
  res.status(500).json({ message: "Server error, please try again later." });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 Server running on port ${PORT}`);
});
