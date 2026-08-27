# 🚀 TopCV Clone - Nền Tảng Tuyển Dụng & Việc Làm

Dự án Full-stack Web Application mô phỏng nền tảng tuyển dụng TopCV, kết nối ứng viên và nhà tuyển dụng. Hệ thống được thiết kế với giao diện hiện đại, tích hợp xác thực bảo mật đa luồng và hệ thống quản lý dữ liệu linh hoạt.

## 🌟 Tính Năng Nổi Bật

**1. Xác thực & Bảo mật (Authentication)**
* Đăng nhập/Đăng ký tài khoản hệ thống với mã hóa mật khẩu.
* Tích hợp đăng nhập nhanh bằng Google (OAuth 2.0 Auth-Code Flow).
* Phân quyền truy cập (Role-Based Access Control) cho Ứng viên và Nhà tuyển dụng.
* Khôi phục mật khẩu thông qua xác thực mã OTP.

**2. Phân hệ Ứng viên (Candidate)**
* Tìm kiếm, xem chi tiết và lọc việc làm theo đa tiêu chí.
* Cập nhật thông tin cá nhân (Profile, Bio, Skills) và tải lên ảnh đại diện (Avatar).
* Lưu tin tuyển dụng và nộp hồ sơ ứng tuyển.

**3. Phân hệ Nhà tuyển dụng (Employer)**
* Bảng điều khiển (Dashboard) thống kê dữ liệu trực quan.
* Đăng tải, chỉnh sửa và quản lý các chiến dịch tuyển dụng.
* Xét duyệt hồ sơ và quản lý danh sách ứng viên.

## 🛠️ Công Nghệ & Kiến Trúc

Dự án áp dụng mô hình Client-Server với stack công nghệ MERN (lược bỏ React thay bằng Vite để tối ưu hiệu suất):

* **Frontend:** React.js (Vite), React Router DOM, Ant Design (UI), Axios.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB, Mongoose ODM.
* **Tiện ích:** JSON Web Token (JWT), Google Auth Library, Multer (Upload file).

## 🚀 Cài Đặt & Chạy Dự Án

**Bước 1: Clone mã nguồn**
> git clone https://github.com/LeDinhThucPTIT/Tim_viec_lam.git
> cd Tim_viec_lam

**Bước 2: Thiết lập môi trường (.env)**
Tạo file `.env` tại thư mục `backend` và điền các thông số:
> PORT=5000
> MONGODB_URI=mongodb://localhost:27017/topcv_clone
> JWT_SECRET=your_jwt_secret_key
> GOOGLE_CLIENT_ID=your_google_client_id
> GOOGLE_CLIENT_SECRET=your_google_client_secret

Tạo file `.env` tại thư mục `frontend`:
> VITE_GOOGLE_CLIENT_ID=your_google_client_id

**Bước 3: Cài đặt & Khởi chạy**
Mở 2 terminal song song cho Frontend và Backend:
> # Terminal 1 - Backend
> cd backend
> npm install
> npm run dev

> # Terminal 2 - Frontend
> cd frontend
> npm install
> npm run dev

## 🔌 Bảng API Auth Cơ Bản

| Phương thức | Endpoint | Mô tả chức năng |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Đăng nhập bằng Email/Password |
| `POST` | `/api/auth/google` | Đăng nhập an toàn qua Google OAuth2 |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `GET` | `/api/auth/profile` | Lấy thông tin user (Yêu cầu Token) |
| `POST` | `/api/auth/update-avatar`| Upload ảnh đại diện (Yêu cầu Token) |
| `POST` | `/api/auth/send-otp` | Gửi mã OTP khôi phục mật khẩu |

---
## 🌐 Demo & Deployment

* **Link Frontend (Live Demo):** [https://tim-viec-lam.vercel.app](https://tim-viec-lam.vercel.app)
* **Link Backend API:** [https://tim-viec-lam-backend.onrender.com](https://tim-viec-lam-backend.onrender.com)

[![Live Demo](https://img.shields.io/badge/Status-Live%20Demo-brightgreen?style=for-the-badge&logo=vercel)](https://tim-viec-lam.vercel.app)
[![API Status](https://img.shields.io/badge/Backend-Render-blue?style=for-the-badge&logo=render)](https://tim-viec-lam-backend.onrender.com)

**Bản quyền © 2026 bởi Lê Đình Thức.**
