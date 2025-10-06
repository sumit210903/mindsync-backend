// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// ✅ Middleware: parse JSON
app.use(express.json());

// ✅ Configure CORS
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",         // Local dev (VSCode Live Server)
      "http://localhost:5500",         // Local dev
      "https://sumit210903.github.io", // GitHub Pages frontend
      "https://mindsync-frontend.vercel.app" // (optional) if you deploy to Vercel later
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

// ✅ Routes
app.use("/api/users", userRoutes);

// ✅ Root route for testing
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 MindSync Backend is Running Successfully!",
  });
});

// ✅ Error handler for invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Server error, please try again later." });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🌍 Server running on http://localhost:${PORT}`)
);
