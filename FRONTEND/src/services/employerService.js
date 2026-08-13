import apiClient from "./api";

const employerService = {
  getDashboardStats: async () => await apiClient.get("/employer/dashboard"),
  getChartData: async () => await apiClient.get("/employer/chart-data"),

  // Quản lý việc làm
  getPostedJobs: async (params) =>
    await apiClient.get("/employer/jobs", { params }),

  // Tạo mới việc làm
  createJob: async (jobData) => await apiClient.post("/jobs", jobData),
  deleteJob: async (id) => await apiClient.delete(`/jobs/${id}`),
  // 👆 ============================

  updateJob: async (id, data) =>
    await apiClient.put(`/employer/jobs/${id}`, data),
  changeJobStatus: async (id, status) =>
    await apiClient.patch(`/employer/jobs/${id}/status`, { status }),

  // Quản lý ứng viên
  getApplications: async (params) =>
    await apiClient.get("/employer/applications", { params }),
  updateApplicationStatus: async (appId, status, note) =>
    await apiClient.patch(`/employer/applications/${appId}/status`, {
      status,
      note,
    }),

  // Hồ sơ công ty
  getCompanyProfile: async () => await apiClient.get("/employer/profile"),
  updateCompanyProfile: async (data) =>
    await apiClient.patch("/employer/profile", data),
};

export default employerService;
