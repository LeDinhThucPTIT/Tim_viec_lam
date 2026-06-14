const express = require("express");
const router = express.Router();

// Import Controller
const companyController = require("../controllers/companyController");

// Import Middleware (Giả định bạn có phân quyền sau này, nếu chưa có hãy tạm comment lại)
const { verifyToken, isEmployer } = require("../middleware/authMiddleware");



// 2. [GET] Lấy danh sách công ty (Có Search, Filter, Pagination)
router.get("/", companyController.getCompanies);

// 1. [GET] Lấy danh sách bộ lọc động (Ngành nghề, Địa điểm)

router.get("/filters", companyController.getFilters);

// 3. [GET] Lấy chi tiết 1 công ty theo ID
router.get("/:id", companyController.getCompanyById);

module.exports = router;
