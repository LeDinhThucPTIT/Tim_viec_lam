// ===========================
// utils/formatters.js
// Các hàm format dữ liệu dùng chung
// ===========================

/**
 * Format số tiền lương VND
 */
export const formatSalary = (salary) => {
  if (!salary) return "Thỏa thuận";

  // Defensive: if salary is provided as a plain string (from backend or malformed data),
  // only return it if it contains digits; otherwise treat as negotiable/unknown.
  if (typeof salary === "string") {
    if (salary.trim() === "") return "Thỏa thuận";
    if (/\d/.test(salary)) return salary;
    return "Thỏa thuận";
  }
  const { min: rawMin, max: rawMax, negotiable } = salary;
  if (negotiable) return "Thỏa thuận";

  const min = Number(rawMin);
  const max = Number(rawMax);

  const isValidMin = Number.isFinite(min) && min > 0;
  const isValidMax = Number.isFinite(max) && max > 0;

  const formatMillion = (amount) => {
    // amount is expected to be a positive number (VND)
    if (amount >= 1000000) return `${Math.round(amount / 1000000)} triệu`;
    return `${Math.round(amount / 1000)}K`;
  };

  if (isValidMin && isValidMax) {
    if (min === max) return `${formatMillion(min)}`;
    return `${formatMillion(min)} - ${formatMillion(max)}`;
  }
  if (isValidMin) return `Từ ${formatMillion(min)}`;
  if (isValidMax) return `Lên đến ${formatMillion(max)}`;
  return "Thỏa thuận";
};

/**
 * Format ngày tháng tiếng Việt
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Tính thời gian đăng tin (vd: "3 ngày trước")
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
};

/**
 * Format số lượng lớn (vd: 1.2K, 1.5M)
 */
export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Rút gọn chuỗi nếu quá dài
 */
export const truncate = (str, maxLength = 100) => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
};

/**
 * Map màu badge theo loại công việc
 */
export const getJobTypeLabel = (type) => {
  const map = {
    "full-time": { label: "Toàn thời gian", color: "green" },
    "part-time": { label: "Bán thời gian", color: "blue" },
    remote: { label: "Remote", color: "purple" },
    internship: { label: "Thực tập", color: "orange" },
    contract: { label: "Hợp đồng", color: "cyan" },
  };
  return map[type] || { label: type, color: "default" };
};

/**
 * Kiểm tra deadline có sắp hết không
 */
export const isDeadlineSoon = (deadline, days = 7) => {
  if (!deadline) return false;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};
