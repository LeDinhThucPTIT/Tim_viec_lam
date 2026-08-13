// ===========================
// middleware/authMiddleware.js
// ===========================

const jwt = require("jsonwebtoken");

/**
 *  Middleware kiểm tra Token hợp lệ
 * Áp dụng cho MỌI API yêu cầu đăng nhập
 */
exports.verifyToken = (req, res, next) => {
  // Lấy token từ header Authorization. Định dạng chuẩn: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Truy cập bị từ chối. Vui lòng đăng nhập!",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Giải mã token bằng Secret Key
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "topcv_secret_key_2026_default",
    );

    // Gắn thông tin giải mã được (chứa id và role) vào request để các Controller dùng
    req.user = decoded;

    // Cho phép đi tiếp vào Controller
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ." });
  }
};

/**
 *  Middleware phân quyền: Dành riêng cho Nhà tuyển dụng
 */
exports.isEmployer = (req, res, next) => {
  // Lúc này req.user đã có sẵn nhờ hàm verifyToken chạy trước đó
  if (!req.user || req.user.role !== "employer") {
    return res.status(403).json({
      success: false,
      message:
        "Bạn không có quyền truy cập. Tính năng này chỉ dành cho Nhà tuyển dụng.",
    });
  }
  next();
};

exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "topcv_secret_key_2026_default",
    );
    req.user = decoded;
  } catch (error) {
    // Nếu token không hợp lệ thì bỏ qua, vì đây chỉ là route public
  }

  next();
};

/**
 *  Middleware phân quyền: Dành riêng cho Ứng viên (Candidate)

 */
exports.isCandidate = (req, res, next) => {
  if (!req.user || req.user.role !== "candidate") {
    return res.status(403).json({
      success: false,
      message:
        "Bạn không có quyền truy cập. Tính năng này chỉ dành cho Ứng viên.",
    });
  }
  next();
};
