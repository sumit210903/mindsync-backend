const multer = require("multer");
const path = require("path");
const fs = require("fs");

// -------------------------------
// ⚙️ Storage Configuration
// -------------------------------

// ✅ Option 1: Memory storage (ideal for cloud uploads)
const storage = multer.memoryStorage();

// ✅ Option 2: Local storage (uncomment if you want to save images locally)
/*
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
*/

// -------------------------------
// 🧠 File Filter (Allow only images)
// -------------------------------
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed!"), false);
  }
};

// -------------------------------
// 🚦 Multer Upload Configuration
// -------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// -------------------------------
// ✅ Export Middleware
// -------------------------------
module.exports = upload;
