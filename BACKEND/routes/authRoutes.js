const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/Auth"); // Lưu ý: Tên file lúc trước bạn gửi là authController.js, hãy đảm bảo import đúng tên file nhé
const { verifyToken } = require("../middleware/authMiddleware");

const { uploadImage } = require("../middleware/upload");

// dang nhap
router.post("/login", AuthController.login);

// dang ky
router.post("/register", AuthController.register);

// lay thong tin nguoi dung
router.get("/profile", verifyToken, AuthController.getProfile);

// cap nhat thong tin nguoi dung
router.patch("/profile", verifyToken, AuthController.updateProfile);

// doi mat khau
router.put("/change-password", verifyToken, AuthController.changePassword);

// cap nhat avatar
router.post(
  "/update-avatar",
  verifyToken, // Bước 1: Kiểm tra xem token có hợp lệ không
  uploadImage.single("avatar"), // Bước 2: Xử lý file ảnh và lưu vào thư mục img
  AuthController.updateAvatar, // Bước 3: Cập nhật đường dẫn ảnh vào Database
);

module.exports = router;
