// ===========================
// services/api.js
// ===========================

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: tự động đính kèm token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Đang gửi request tới:", config.url);
    console.log("Token lấy được từ localStorage:", token ? "CÓ TOKEN" : "NULL");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: xử lý lỗi toàn cục
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  },
);

export default apiClient;
