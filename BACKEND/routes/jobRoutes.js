const express = require("express");
const router = express.Router();
const { uploadCv } = require("../middleware/upload");

// Import Controller và Middleware dựa theo cấu trúc thư mục của bạn
const jobController = require("../controllers/jobController");
const {
  verifyToken,
  optionalAuth,
  isEmployer,
  isCandidate,
} = require("../middleware/authMiddleware");

// ==========================================
// PUBLIC ROUTES (Ai cũng có quyền truy cập)
// ==========================================

// Lấy danh sách việc làm (có tìm kiếm, lọc, phân trang)
router.get("/", optionalAuth, jobController.getJobs);

// Lấy việc làm nổi bật
router.get("/hot", jobController.getHotJobs);

// Lấy việc làm gợi ý
router.get("/recommended", jobController.getRecommendedJobs);

// Lấy chi tiết 1 việc làm
// (Lưu ý: Route có param /:id bắt buộc phải để ở DƯỚI các route tĩnh như /hot, /recommended)
router.get("/:id", optionalAuth, jobController.getJobById);

// ==========================================
// PRIVATE ROUTES (Bắt buộc phải có Token)
// ==========================================

// [NHÀ TUYỂN DỤNG] - Tạo tin tuyển dụng mới
router.post("/", verifyToken, isEmployer, jobController.createJob);

// [NHÀ TUYỂN DỤNG] - Xóa tin tuyển dụng
router.delete("/:id", verifyToken, isEmployer, jobController.deleteJob);

// [ỨNG VIÊN] - Nộp đơn ứng tuyển (Apply)
router.post(
  "/:id/apply",
  verifyToken,
  isCandidate,
  jobController.checkAlreadyApplied,
  uploadCv.fields([
    { name: "cv", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  jobController.applyJob,
);

// [ỨNG VIÊN] - Lưu/Bỏ lưu việc làm yêu thích
router.post("/:id/save", verifyToken, isCandidate, jobController.saveJob);

module.exports = router;
