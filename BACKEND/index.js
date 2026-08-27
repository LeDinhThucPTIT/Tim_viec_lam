require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
const connectDB = require("./config/db");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép các request không có origin (ví dụ như Postman, cURL) hoặc nằm trong danh sách được phép
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:")
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS Policy: Origin không được phép kết nối"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

connectDB();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:5000 ws://localhost:5000; img-src 'self' data: blob: https://ui-avatars.com",
  );
  next();
});
// Phục vụ tệp CV upload trong thư mục uploads/cvs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const routes = require("./routes");
routes(app);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Lỗi máy chủ nội bộ",
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
