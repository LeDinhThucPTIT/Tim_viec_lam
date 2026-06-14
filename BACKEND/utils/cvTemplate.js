// ===========================
// utils/cvTemplate.js
// Template chuẩn hóa giữ nguyên 100% Layout và CSS khi xuất PDF bằng Puppeteer
// ===========================

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatPeriod = (start, end, current) => {
  if (!start) return "";
  const endStr = current ? "Hiện tại" : end || "";
  return [start, endStr].filter(Boolean).join(" - ");
};

const getTemplateColors = (templateId) => {
  switch (templateId) {
    case "classic":
      return { main: "#1a1a2e", bg: "#f8fafc", border: "#e2e8f0" };
    case "creative":
      return { main: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" };
    case "modern":
    default:
      return { main: "#00b14f", bg: "#ecfdf5", border: "#a7f3d0" };
  }
};

const renderCreatedCVHtml = (cv) => {
  const data = cv.data || {};
  const colors = getTemplateColors(cv.template);

  const contacts = [
    data.phone ? `<span>📞 ${escapeHtml(data.phone)}</span>` : "",
    data.email ? `<span>✉️ ${escapeHtml(data.email)}</span>` : "",
    data.location ? `<span>📍 ${escapeHtml(data.location)}</span>` : "",
    data.linkedin ? `<span>🔗 ${escapeHtml(data.linkedin)}</span>` : "",
    data.github ? `<span>🐙 ${escapeHtml(data.github)}</span>` : "",
    data.website ? `<span>🌐 ${escapeHtml(data.website)}</span>` : "",
  ]
    .filter(Boolean)
    .join(" <span class='separator'>|</span> ");

  const experiences = (data.experiences || [])
    .map(
      (exp) => `
      <div class="item">
        <div class="item-head">
          <strong class="item-title">${escapeHtml(exp.position)}</strong>
          <span class="item-date">${escapeHtml(formatPeriod(exp.startDate, exp.endDate, exp.current))}</span>
        </div>
        <div class="company-name" style="color: ${colors.main};">${escapeHtml(exp.company)}</div>
        ${exp.description ? `<p class="item-desc">${escapeHtml(exp.description).replace(/\n/g, "<br/>")}</p>` : ""}
      </div>
    `,
    )
    .join("");

  const educations = (data.educations || [])
    .map(
      (edu) => `
      <div class="item">
        <div class="item-head">
          <strong class="item-title">${escapeHtml(edu.school)}</strong>
          <span class="item-date">${escapeHtml([edu.startDate, edu.endDate].filter(Boolean).join(" - "))}</span>
        </div>
        <div class="degree-major">${escapeHtml([edu.degree, edu.major].filter(Boolean).join(" - "))}</div>
        ${edu.gpa ? `<p class="gpa-badge"><strong>GPA:</strong> ${escapeHtml(edu.gpa)}</p>` : ""}
      </div>
    `,
    )
    .join("");

  const projects = (data.projects || [])
    .map(
      (proj) => `
      <div class="item">
        <div class="item-head">
          <strong class="item-title">${escapeHtml(proj.name)}</strong>
          ${proj.link ? `<span class="project-link">🔗 ${escapeHtml(proj.link)}</span>` : ""}
        </div>
        ${proj.tech ? `<div class="tech-stack"><strong>Công nghệ:</strong> ${escapeHtml(proj.tech)}</div>` : ""}
        ${proj.description ? `<p class="item-desc">${escapeHtml(proj.description).replace(/\n/g, "<br/>")}</p>` : ""}
      </div>
    `,
    )
    .join("");

  const skills = (data.skills || [])
    .map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
    .join("");

  const languages = (data.languages || [])
    .map(
      (lang) => `
      <div class="info-list-item">
        <span class="info-label">${escapeHtml(lang.language)}</span>
        <span class="info-value" style="background-color: ${colors.bg}; color: ${colors.main};">${escapeHtml(lang.level || "Thành thạo")}</span>
      </div>
    `,
    )
    .join("");

  const certifications = (data.certifications || [])
    .map(
      (cert) => `
      <div class="info-list-item">
        <span class="info-label">${escapeHtml(cert.name)}</span>
        <span class="info-meta">${escapeHtml([cert.issuer, cert.year].filter(Boolean).join(" - "))}</span>
      </div>
    `,
    )
    .join("");

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(cv.name)}</title>
  <style>
    /* Reset & Base */
    * { box-sizing: border-box; }
    html, body {
      margin: 0; 
      padding: 0;
      background: #eef2f7; 
      color: #1e293b; 
      font-family: 'Segoe UI', Arial, sans-serif;
      /* Ép trình duyệt in màu nền */
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Vùng chứa CV (Định dạng A4) */
    .page { 
      width: 210mm;
      max-width: 210mm;
      min-height: 297mm;
      margin: 20px auto; 
      background: #ffffff; 
      padding: 48px 56px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    /* Header */
    .header { 
      border-bottom: 3px solid ${colors.main}; 
      padding-bottom: 16px; 
      margin-bottom: 24px; 
    }
    .fullname { 
      margin: 0 0 6px 0; 
      font-size: 26px; 
      color: #0f172a; 
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .job-title { 
      color: ${colors.main}; 
      font-weight: 700; 
      font-size: 15px; 
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px; 
    }
    .contacts { 
      display: block;
      line-height: 1.8;
      color: #475569; 
      font-size: 12px; 
    }
    .contacts span { display: inline-block; white-space: nowrap; }
    .separator { margin: 0 6px; color: #cbd5e1; }

    /* Sections */
    .section { margin-bottom: 24px; }
    .section-title { 
      margin: 0 0 14px 0; 
      font-size: 14px; 
      letter-spacing: 1.2px; 
      text-transform: uppercase; 
      color: ${colors.main}; 
      border-bottom: 1px solid ${colors.border}; 
      padding-bottom: 6px; 
      font-weight: 700;
    }
    
    /* Items (Kinh nghiệm, Học vấn, Dự án) */
    .item { 
      margin-bottom: 14px; 
      padding-bottom: 14px; 
      border-bottom: 1px dashed #e2e8f0; 
    }
    .item:last-child { border-bottom: 0; padding-bottom: 0; margin-bottom: 0; }
    
    .item-head { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      gap: 16px; 
      margin-bottom: 4px;
    }
    .item-title { font-size: 14px; color: #0f172a; font-weight: 700; }
    .item-date { color: #64748b; font-size: 12px; font-weight: 500; white-space: nowrap; }
    
    .company-name, .degree-major { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px; }
    .tech-stack { font-size: 12.5px; color: #334155; margin-bottom: 4px; }
    .project-link { font-size: 12px; color: #2563eb; }
    
    .item-desc { 
      margin: 6px 0 0 0; 
      line-height: 1.6; 
      font-size: 12.5px; 
      color: #334155;
      text-align: justify;
    }
    .gpa-badge { margin: 4px 0 0 0; font-size: 12.5px; color: #475569; }

    /* Tags Kỹ năng */
    .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { 
      background: ${colors.bg}; 
      color: ${colors.main}; 
      border: 1px solid ${colors.border}; 
      border-radius: 4px; 
      padding: 4px 10px; 
      font-size: 12px; 
      font-weight: 600;
    }

    /* Lưới thông tin (Ngôn ngữ & Chứng chỉ) */
    .info-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px; }
    .info-list-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      font-size: 12.5px; 
      padding: 6px 0; 
      border-bottom: 1px solid #f1f5f9; 
    }
    .info-label { font-weight: 600; color: #0f172a; }
    .info-value { font-size: 11.5px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .info-meta { color: #64748b; font-size: 12px; }

    /* ==========================================
       CẤU HÌNH IN ẤN (PDF/PUPPETEER)
       ========================================== */
    @media print {
      @page { 
        size: A4 portrait; 
        margin: 0; /* Xóa lề mặc định của máy in */
      }
      
      html, body {
        width: 100% !important;
        height: auto !important;
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .page { 
        width: 100% !important; 
        min-height: auto !important; /* Quan trọng: Cho phép tràn nhiều trang */
        margin: 0 !important; 
        padding: 48px 56px !important; /* Lề trong đóng vai trò lề giấy */
        box-shadow: none !important; 
        border: none !important;
        border-radius: 0 !important;
      }

      /* Quy tắc ngắt trang thông minh (Chống cắt đôi nội dung) */
      .section { page-break-inside: auto; }
      .section-title { page-break-after: avoid; break-after: avoid; }
      .item { page-break-inside: avoid; break-inside: avoid; }
      .info-list-item { page-break-inside: avoid; break-inside: avoid; }
      
      /* Ẩn bớt các khoảng trống không cần thiết khi in */
      .item:last-child { margin-bottom: 0 !important; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <h1 class="fullname">${escapeHtml(data.fullName || cv.name)}</h1>
      <div class="job-title">${escapeHtml(data.jobTitle || "Chuyên viên")}</div>
      ${contacts ? `<div class="contacts">${contacts}</div>` : ""}
    </header>

    ${data.summary ? `<section class="section"><h2 class="section-title">Giới thiệu bản thân</h2><p class="item-desc">${escapeHtml(data.summary).replace(/\n/g, "<br/>")}</p></section>` : ""}

    ${experiences ? `<section class="section"><h2 class="section-title">Kinh nghiệm làm việc</h2>${experiences}</section>` : ""}

    ${projects ? `<section class="section"><h2 class="section-title">Dự án tiêu biểu</h2>${projects}</section>` : ""}

    ${educations ? `<section class="section"><h2 class="section-title">Học vấn</h2>${educations}</section>` : ""}

    ${skills ? `<section class="section"><h2 class="section-title">Kỹ năng chuyên môn</h2><div class="skills-container">${skills}</div></section>` : ""}

    ${
      languages || certifications
        ? `
    <div class="info-list">
      ${languages ? `<div class="section"><h2 class="section-title">Ngôn ngữ</h2>${languages}</div>` : ""}
      ${certifications ? `<div class="section"><h2 class="section-title">Chứng chỉ</h2>${certifications}</div>` : ""}
    </div>
    `
        : ""
    }
  </main>
</body>
</html>`;
};

module.exports = { renderCreatedCVHtml };
