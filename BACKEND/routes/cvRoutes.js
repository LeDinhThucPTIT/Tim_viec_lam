// ===========================
// routes/cvRoutes.js
// Quản lý các endpoint liên quan đến CV
// ===========================

const express = require("express");
const router = express.Router();

// Import Controller
const cvController = require("../controllers/cvController");
const cvscoreController = require("../controllers/cvscoreController");

// LƯU Ý 1: Đổi cách import thành dạng destructuring để lấy đúng hàm upload CV
// (Đảm bảo tên file là "../middleware/upload" hay "../middleware/uploadMiddleware" khớp với dự án của bạn)
const { uploadCv } = require("../middleware/upload");

const {
  verifyToken,
  isEmployer,
  isCandidate,
} = require("../middleware/authMiddleware");

// ==========================================
// PUBLIC ROUTES (Ai cũng có quyền truy cập)
// ==========================================

// Tải CV về máy hoặc xuất file PDF trực tiếp
router.get("/:id/download", cvController.downloadCV);
router.post("/:id/download", cvController.downloadCV);

// LƯU Ý 2: Route /score đang để public (không có verifyToken).
// Nếu chức năng chấm điểm CV này cần đăng nhập thì bạn nên đưa xuống phần Private nhé!
router.post("/score", cvscoreController.scoreCV);

// ==========================================
// PRIVATE ROUTES (Bắt buộc phải có Token và phải là [ỨNG VIÊN])
// ==========================================

// Lấy danh sách toàn bộ CV của ứng viên đang đăng nhập
router.get("/", verifyToken, isCandidate, cvController.getCVList);

// Tạo một CV mới từ giao diện Builder (Lưu dạng dữ liệu JSON)
router.post("/", verifyToken, isCandidate, cvController.createCV);

// Upload file CV có sẵn (PDF, DOC, DOCX)
// LƯU Ý 3: Đổi từ `upload.single` thành `uploadCv.single`
router.post(
  "/upload",
  verifyToken,
  isCandidate,
  uploadCv.single("file"), // Frontend gửi form-data phải dùng key là "file"
  cvController.uploadCV,
);

// Đặt một CV làm mặc định để tham gia ứng tuyển nhanh
router.patch(
  "/:id/default",
  verifyToken,
  isCandidate,
  cvController.setDefaultCV,
);

// Chỉnh sửa/Cập nhật nội dung dữ liệu của CV Builder
router.patch("/:id", verifyToken, isCandidate, cvController.updateCV);

// Xóa bỏ CV
router.delete("/:id", verifyToken, isCandidate, cvController.deleteCV);

module.exports = router;
