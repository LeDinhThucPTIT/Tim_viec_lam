const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Đảm bảo các thư mục upload tồn tại
const cvDir = "uploads/cvs";
const imgDir = "uploads/img";

if (!fs.existsSync(cvDir)) fs.mkdirSync(cvDir, { recursive: true });
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// ==========================================
// CẤU HÌNH UPLOAD CV
// ==========================================
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvDir); // Lưu vào thư mục cvs
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "cv-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const cvFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ định dạng PDF, DOC, DOCX"), false);
  }
};

const uploadCv = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// ==========================================
// CẤU HÌNH UPLOAD ẢNH (AVATAR / LOGO)
// ==========================================
const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imgDir); // Lưu vào thư mục img
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const imgFileFilter = (req, file, cb) => {
  // Chỉ cho phép các file có mimetype bắt đầu bằng "image/"
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ định dạng ảnh (JPG, PNG, JPEG,...)"), false);
  }
};

const uploadImage = multer({
  storage: imgStorage,
  fileFilter: imgFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Xuất cả 2 ra để dùng ở các route khác nhau
module.exports = {
  uploadCv,
  uploadImage,
};
