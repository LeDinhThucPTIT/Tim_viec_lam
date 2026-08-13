// ===========================

// Kết nối với Backend API thật qua Axios
// ===========================

import apiClient from "./api"; 

const companyService = {
  /**
   * Lấy danh sách bộ lọc (Ngành nghề, Địa điểm)
   */
  getFilters: async () => {
    return await apiClient.get("/companies/filters");
  },

  /**
   * Lấy danh sách công ty (Backend đã lo việc filter và phân trang)
   * @param {Object} params - { keyword, industry, location, page, limit }
   */
  getCompanies: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.industry) queryParams.append("industry", params.industry);
    if (params.location) queryParams.append("location", params.location);

    // Thêm tham số phân trang
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    return await apiClient.get("/companies", { params }); // Nếu dùng Axios thì truyền object params thẳng vào đây luôn cũng được
  },

  /**
   * Lấy chi tiết một công ty theo ID
   * @param {string} id - ID của công ty
   */
  getCompanyById: async (id) => {
    return await apiClient.get(`/companies/${id}`);
  },
};

export default companyService;
