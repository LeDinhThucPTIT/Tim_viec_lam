# 🟢 TopCV Clone — Frontend

Dự án clone TopCV xây dựng bằng **ReactJS + Ant Design**, phong cách production-ready dành cho đồ án tốt nghiệp.

---

## 📁 Cấu trúc thư mục

```
src/
├── assets/
│   └── styles/
│       └── global.css              # CSS biến toàn cục, reset, utility classes
│
├── components/
│   ├── common/                     # Component dùng chung cho toàn app
│   │   ├── AppHeader.jsx / .css    # Thanh navigation đầu trang
│   │   ├── AppFooter.jsx / .css    # Footer đầy đủ thông tin
│   │   └── ProtectedRoute.jsx      # Guard route yêu cầu đăng nhập
│   │
│   ├── job/                        # Component liên quan đến việc làm
│   │   ├── JobCard.jsx / .css      # Card hiển thị 1 tin tuyển dụng
│   │   └── JobFilter.jsx / .css    # Sidebar bộ lọc tìm việc
│   │
│   └── employer/                   # Component dành cho nhà tuyển dụng
│       ├── StatsCard.jsx / .css    # Card thống kê dashboard
│       ├── ApplicationCard.jsx / .css  # Card hồ sơ ứng tuyển
│       └── PostJobModal.jsx        # Modal đăng / chỉnh sửa tin tuyển dụng
│
├── constants/
│   ├── mockData.js                 # Mock data tổng (jobs, companies, categories)
│   └── employerData.js             # Mock data nhà tuyển dụng (jobs, applications, stats)
│
├── hooks/
│   └── useAuth.jsx                 # Context + hook quản lý authentication
│
├── layouts/
│   ├── MainLayout.jsx / .css       # Layout chính (Header + Content + Footer)
│   └── AuthLayout.jsx / .css       # Layout 2 cột cho trang Login/Register
│
├── pages/
│   ├── HomePage.jsx / .css         # Trang chủ — Hero, Stats, Categories, Hot Jobs, CTA
│   ├── JobListPage.jsx / .css      # Danh sách việc làm + Filter sidebar
│   ├── JobDetailPage.jsx / .css    # Chi tiết công việc + Apply modal
│   ├── LoginPage.jsx               # Đăng nhập
│   ├── RegisterPage.jsx            # Đăng ký (chọn role ứng viên / nhà tuyển dụng)
│   ├── AuthPages.css               # CSS dùng chung cho Login + Register
│   ├── ProfilePage.jsx / .css      # Hồ sơ ứng viên — thông tin, jobs đã ứng tuyển, đã lưu
│   ├── EmployerDashboardPage.jsx / .css  # Dashboard nhà tuyển dụng (4 tabs)
│   └── NotFoundPage.jsx / .css     # 404 page
│
├── services/
│   ├── api.js                      # Axios instance với interceptors
│   ├── authService.js              # Mock auth (login, register, profile)
│   ├── jobService.js               # Mock job API (list, detail, apply, save)
│   └── employerService.js          # Mock employer API (dashboard, jobs, applications)
│
├── utils/
│   └── formatters.js               # Hàm format: salary, date, timeAgo, truncate...
│
├── App.jsx                         # Router chính
└── main.jsx                        # Entry point + Ant Design theme config
```

---

## 🚀 Cài đặt và chạy

```bash
# Cài dependencies
npm install

# Chạy dev server (port 3000)
npm run dev

# Build production
npm run build
```

---

## 🔐 Tài khoản demo

| Role | Email | Password |
|------|-------|----------|
| Ứng viên | test@email.com | 123456 |
| Nhà tuyển dụng | employer@email.com | 123456 |

---

## 📄 Các trang

| Route | Trang | Mô tả |
|-------|-------|-------|
| `/` | Trang chủ | Hero banner, danh mục, hot jobs, CTA |
| `/jobs` | Danh sách việc làm | Grid jobs + filter sidebar |
| `/jobs/:id` | Chi tiết công việc | Mô tả, kỹ năng, quyền lợi, apply modal |
| `/login` | Đăng nhập | Form login, social login |
| `/register` | Đăng ký | Form đăng ký, chọn role |
| `/profile` | Hồ sơ ứng viên | Thông tin, jobs đã ứng tuyển, đã lưu *(yêu cầu đăng nhập)* |
| `/employer/dashboard` | Dashboard NTD | Tổng quan, tin đăng, hồ sơ ứng viên, hồ sơ công ty *(yêu cầu role employer)* |

---

## 🔗 Kết nối Backend Node.js + Express + MongoDB

Khi backend sẵn sàng, chỉ cần:

1. **Tạo file `.env`:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Thay mock implementations trong `services/`:**
   ```js
   // Trước (mock):
   const data = await delay(); return mockJobs;

   // Sau (thật):
   const data = await apiClient.get('/jobs', { params });
   return data;
   ```

3. **Giữ nguyên toàn bộ component và page** — không cần sửa UI.

---

## 🛠 Công nghệ

- **ReactJS 18** — Functional components + Hooks
- **React Router DOM 6** — Client-side routing, nested routes
- **Ant Design 5** — UI component library
- **Axios** — HTTP client với interceptors
- **dayjs** — Xử lý ngày tháng
- **Vite** — Build tool nhanh

---

## 🎨 Design System

Dự án dùng CSS Variables trong `global.css`:

```css
--color-primary: #00b14f        /* Xanh lá TopCV */
--color-primary-dark: #009140
--color-primary-light: #e6f9ee
--font-primary: 'Be Vietnam Pro'
--font-display: 'Manrope'
--shadow-sm / --shadow-md / --shadow-lg
--radius-sm / --radius-md / --radius-lg
```
