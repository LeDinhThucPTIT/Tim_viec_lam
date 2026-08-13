// ===========================
// services/cvService.js
// ===========================
import axios from "axios";
import apiClient from "./api";

const CV_ENDPOINT = "/cvs";

export const CV_TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Hiện đại, phù hợp IT & Design",
    color: "#00b14f",
    preview: "🟢",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Chuyên nghiệp, phù hợp mọi ngành",
    color: "#1a1a2e",
    preview: "⚫",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Sáng tạo, phù hợp Marketing & Design",
    color: "#6366f1",
    preview: "🟣",
  },
];

const cvService = {
  /** Lấy danh sách CV của user */
  getCVList: async () => {
    // Nhờ interceptor, kết quả trả về đã là data thực tế, không cần .data nữa
    return await apiClient.get(CV_ENDPOINT);
  },

  /** Lấy 1 CV theo id */
  getCVById: async (id) => {
    return await apiClient.get(`${CV_ENDPOINT}/${id}`);
  },

  /** Tạo CV mới từ builder */
  createCV: async (cvData) => {
    return await apiClient.post(CV_ENDPOINT, cvData);
  },

  /** Cập nhật CV */
  updateCV: async (id, updates) => {
    return await apiClient.patch(`${CV_ENDPOINT}/${id}`, updates);
  },

  /** Upload CV dạng PDF/Word */
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Ghi đè Content-Type riêng cho upload file, các header khác (như Token) vẫn được giữ nguyên
    return await apiClient.post(`${CV_ENDPOINT}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** Đặt CV mặc định */
  setDefaultCV: async (id) => {
    return await apiClient.patch(`${CV_ENDPOINT}/${id}/default`);
  },

  /** Xóa CV */
  deleteCV: async (id) => {
    return await apiClient.delete(`${CV_ENDPOINT}/${id}`);
  },

  /** Tải về CV */
  downloadCV: async (id) => {
    const token = localStorage.getItem("token");
    const headers = token
      ? { Authorization: `Bearer ${token}`, Accept: "*/*" }
      : { Accept: "*/*" };

    const response = await axios.post(`${CV_ENDPOINT}/${id}/download`, null, {
      baseURL: apiClient.defaults.baseURL,
      headers,
      responseType: "arraybuffer",
    });

    const contentType =
      response.headers["content-type"] || "application/octet-stream";
    const disposition = response.headers["content-disposition"] || "";
    const fileNameMatch = disposition.match(/filename\*?=[^;]+/i);
    let filename = null;

    if (fileNameMatch) {
      filename = fileNameMatch[0].split("=")[1].trim();
      filename = filename.replace(/^(UTF-8'')?/i, "");
      filename = filename.replace(/"/g, "");
    }

    const blob = new Blob([response.data], { type: contentType });

    const headerBytes = new Uint8Array(response.data.slice(0, 8));
    const headerString = Array.from(headerBytes)
      .map((byte) => String.fromCharCode(byte))
      .join("");
    const isPdfHeader = headerString.startsWith("%PDF");
    const isZipHeader = headerString.startsWith("PK");

    if (
      contentType.includes("application/json") ||
      contentType.includes("text/") ||
      contentType.includes("html") ||
      (!isPdfHeader && !isZipHeader && contentType.includes("application/pdf"))
    ) {
      const text = await blob.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed?.message) {
          throw new Error(parsed.message);
        }
        return parsed;
      } catch (_err) {
        if (text.trim().startsWith("<")) {
          throw new Error(
            "Lỗi server khi tải CV: nội dung trả về không phải file",
          );
        }
        throw new Error("Không thể tải CV, dữ liệu trả về không hợp lệ");
      }
    }

    return {
      blob,
      filename,
      contentType,
    };
  },

  scoreCV: async (data) => {
    return await apiClient.post(`${CV_ENDPOINT}/score`, data);
  },
};

export default cvService;
