const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db_connect");

// Load env variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");

// Use Routes
app.use("/api/auth", authRoutes);

// Default Route (health check)
app.get("/", (req, res) => {
  res.send("✅ MindSync API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
