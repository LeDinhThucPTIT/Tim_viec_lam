const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const { verifyToken, isEmployer } = require("../middleware/authMiddleware");

// Tất cả API ở đây ĐỀU BẮT BUỘC là Nhà tuyển dụng
router.use(verifyToken, isEmployer);

// Thống kê
router.get("/dashboard", employerController.getDashboardStats);
router.get("/chart-data", employerController.getChartData);

// Quản lý việc làm (Jobs)
router.get("/jobs", employerController.getPostedJobs);
// Lưu ý: createJob, deleteJob đang nằm ở jobController, bạn có thể gọi API /api/jobs (POST) để tạo
router.put("/jobs/:id", employerController.updateJob);
router.patch("/jobs/:id/status", employerController.changeJobStatus);

// Quản lý ứng viên (Applications)
router.get("/applications", employerController.getApplications);
router.patch(
  "/applications/:appId/offer",
  employerController.offerApplication,
);
router.patch(
  "/applications/:appId/reject",
  employerController.rejectApplication,
);
router.patch(
  "/applications/:appId/status",
  employerController.updateApplicationStatus,
);

// Hồ sơ công ty
router.get("/profile", employerController.getCompanyProfile);
router.patch("/profile", employerController.updateCompanyProfile);

module.exports = router;
