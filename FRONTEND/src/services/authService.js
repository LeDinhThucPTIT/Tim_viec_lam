// ===========================
// Giao tiếp với API Backend thật
// ===========================

import apiClient from "./api";

const authService = {
  login: async (credentials) => {
    // credentials là object { email, password }
    return await apiClient.post("/auth/login", credentials);
  },

  register: async (userData) => {
    // userData là object { name, email, phone, password, role }
    return await apiClient.post("/auth/register", userData);
  },

  logout: async () => {
    return { success: true };
  },

  getProfile: async () => {
    return await apiClient.get("/auth/profile");
  },

  updateProfile: async (data) => {
    const res = await apiClient.patch("/auth/profile", data);
    return res?.user ?? res;
  },

  changePassword: async (passwordData) => {
    // passwordData là object { oldPassword, newPassword }
    return await apiClient.put("/auth/change-password", passwordData);
  },

  updateAvatar: async (formData) => {
    return await apiClient.post("/auth/update-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  sendOtp: async (email) => {
    return await apiClient.post("/auth/send-otp", { email });
  },

  resetPassword: async (resetData) => {
    // resetData là object { email, otp, newPassword }
    return await apiClient.post("/auth/reset-password", resetData);
  },
};

export default authService;
