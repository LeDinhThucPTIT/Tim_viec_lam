require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = 5000;
const connectDB = require("./config/db");
const cors = require("cors");

app.use(cors());

console.log("ENV TEST:", process.env.JWT_SECRET);
connectDB();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    // Thêm img-src vào cuối chuỗi này
    "default-src 'self'; connect-src 'self' http://localhost:5000 ws://localhost:5000; img-src 'self' data: blob: https://ui-avatars.com",
  );
  next();
});
// Phục vụ tệp CV upload trong thư mục uploads/cvs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const routes = require("./routes");
routes(app);

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
