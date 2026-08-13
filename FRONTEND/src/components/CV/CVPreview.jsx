// ===========================
// Hiển thị preview CV theo template đã chọn
// ===========================

import React from "react";
import "./CVPreview.css";

const formatPeriod = (start, end, current) => {
  if (!start) return "";
  const endStr = current ? "Hiện tại" : end || "";
  return [start, endStr].filter(Boolean).join(" – ");
};

// ─── Template: Modern (xanh lá) ──────────────────────────────────────────────
const ModernTemplate = ({ data }) => (
  <div className="cv-modern">
    {/* Sidebar trái */}
    <div className="cv-modern__sidebar">
      <div className="cv-modern__avatar">
        {data.fullName
          ? data.fullName
              .split(" ")
              .map((w) => w[0])
              .slice(-2)
              .join("")
          : "CV"}
      </div>
      <h2 className="cv-modern__name">{data.fullName || "Họ và Tên"}</h2>
      <p className="cv-modern__jobtitle">
        {data.jobTitle || "Vị trí ứng tuyển"}
      </p>

      <div className="cv-modern__sidebar-section">
        <div className="cv-modern__sidebar-title">Liên hệ</div>
        {data.phone && (
          <div className="cv-modern__contact-item">📞 {data.phone}</div>
        )}
        {data.email && (
          <div className="cv-modern__contact-item">✉️ {data.email}</div>
        )}
        {data.location && (
          <div className="cv-modern__contact-item">📍 {data.location}</div>
        )}
        {data.linkedin && (
          <div className="cv-modern__contact-item">🔗 {data.linkedin}</div>
        )}
        {data.github && (
          <div className="cv-modern__contact-item">💻 {data.github}</div>
        )}
        {data.website && (
          <div className="cv-modern__contact-item">🌐 {data.website}</div>
        )}
      </div>

      {data.skills?.length > 0 && (
        <div className="cv-modern__sidebar-section">
          <div className="cv-modern__sidebar-title">Kỹ năng</div>
          <div className="cv-modern__skills">
            {data.skills.map((s) => (
              <span key={s} className="cv-modern__skill-tag">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.languages?.length > 0 && (
        <div className="cv-modern__sidebar-section">
          <div className="cv-modern__sidebar-title">Ngôn ngữ</div>
          {data.languages.map((l, i) => (
            <div key={i} className="cv-modern__lang-item">
              <span>{l.language}</span>
              <span className="cv-modern__lang-level">{l.level}</span>
            </div>
          ))}
        </div>
      )}

      {data.certifications?.length > 0 && (
        <div className="cv-modern__sidebar-section">
          <div className="cv-modern__sidebar-title">Chứng chỉ</div>
          {data.certifications.map((c, i) => (
            <div key={i} className="cv-modern__cert-item">
              <div className="cv-modern__cert-name">{c.name}</div>
              <div className="cv-modern__cert-meta">
                {c.issuer} · {c.year}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Nội dung phải */}
    <div className="cv-modern__main">
      {data.summary && (
        <div className="cv-modern__section">
          <div className="cv-modern__section-title">Mục tiêu nghề nghiệp</div>
          <p className="cv-modern__summary">{data.summary}</p>
        </div>
      )}

      {data.experiences?.length > 0 && (
        <div className="cv-modern__section">
          <div className="cv-modern__section-title">Kinh nghiệm làm việc</div>
          {data.experiences.map((exp, idx) => (
            <div key={exp.id || idx} className="cv-modern__timeline-item">
              <div className="cv-modern__timeline-header">
                <div>
                  <div className="cv-modern__item-title">{exp.position}</div>
                  <div className="cv-modern__item-subtitle">{exp.company}</div>
                </div>
                <div className="cv-modern__item-period">
                  {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                </div>
              </div>
              {exp.description && (
                <p className="cv-modern__item-desc">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data.educations?.length > 0 && (
        <div className="cv-modern__section">
          <div className="cv-modern__section-title">Học vấn</div>
          {data.educations.map((edu, idx) => (
            <div key={edu.id || idx} className="cv-modern__timeline-item">
              <div className="cv-modern__timeline-header">
                <div>
                  <div className="cv-modern__item-title">{edu.school}</div>
                  <div className="cv-modern__item-subtitle">
                    {edu.degree} {edu.major}
                    {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                  </div>
                </div>
                <div className="cv-modern__item-period">
                  {edu.startDate}
                  {edu.endDate ? ` – ${edu.endDate}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.projects?.length > 0 && (
        <div className="cv-modern__section">
          <div className="cv-modern__section-title">Dự án nổi bật</div>
          {data.projects.map((proj, idx) => (
            <div key={proj.id || idx} className="cv-modern__timeline-item">
              <div className="cv-modern__item-title">{proj.name}</div>
              {proj.tech && (
                <div className="cv-modern__item-tech">🔧 {proj.tech}</div>
              )}
              {proj.description && (
                <p className="cv-modern__item-desc">{proj.description}</p>
              )}
              {proj.link && (
                <div className="cv-modern__item-link">🔗 {proj.link}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Template: Classic (đen trắng) ───────────────────────────────────────────
const ClassicTemplate = ({ data }) => (
  <div className="cv-classic">
    <div className="cv-classic__header">
      <h1 className="cv-classic__name">{data.fullName || "Họ và Tên"}</h1>
      <p className="cv-classic__jobtitle">
        {data.jobTitle || "Vị trí ứng tuyển"}
      </p>
      <div className="cv-classic__contacts">
        {[data.phone, data.email, data.location, data.linkedin, data.github]
          .filter(Boolean)
          .map((c, i) => (
            <span key={i} className="cv-classic__contact">
              {c}
            </span>
          ))}
      </div>
    </div>

    {data.summary && (
      <div className="cv-classic__section">
        <div className="cv-classic__section-title">GIỚI THIỆU</div>
        <p className="cv-classic__summary">{data.summary}</p>
      </div>
    )}

    {data.experiences?.length > 0 && (
      <div className="cv-classic__section">
        <div className="cv-classic__section-title">KINH NGHIỆM</div>
        {data.experiences.map((exp, idx) => (
          <div key={exp.id || idx} className="cv-classic__item">
            <div className="cv-classic__item-header">
              <strong>{exp.position}</strong> — {exp.company}
              <span className="cv-classic__item-period">
                {formatPeriod(exp.startDate, exp.endDate, exp.current)}
              </span>
            </div>
            {exp.description && (
              <p className="cv-classic__item-desc">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    )}

    {data.educations?.length > 0 && (
      <div className="cv-classic__section">
        <div className="cv-classic__section-title">HỌC VẤN</div>
        {data.educations.map((edu, idx) => (
          <div key={edu.id || idx} className="cv-classic__item">
            <div className="cv-classic__item-header">
              <strong>{edu.school}</strong> — {edu.major}
              <span className="cv-classic__item-period">
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
            <p className="cv-classic__item-desc">
              {edu.degree}
              {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
            </p>
          </div>
        ))}
      </div>
    )}

    {data.skills?.length > 0 && (
      <div className="cv-classic__section">
        <div className="cv-classic__section-title">KỸ NĂNG</div>
        <p className="cv-classic__skills-text">{data.skills.join(" · ")}</p>
      </div>
    )}

    {data.projects?.length > 0 && (
      <div className="cv-classic__section">
        <div className="cv-classic__section-title">DỰ ÁN</div>
        {data.projects.map((proj, idx) => (
          <div key={proj.id || idx} className="cv-classic__item">
            <div className="cv-classic__item-header">
              <strong>{proj.name}</strong>
              {proj.tech && ` — ${proj.tech}`}
            </div>
            {proj.description && (
              <p className="cv-classic__item-desc">{proj.description}</p>
            )}
          </div>
        ))}
      </div>
    )}

    {data.certifications?.length > 0 && (
      <div className="cv-classic__section">
        <div className="cv-classic__section-title">CHỨNG CHỈ</div>
        {data.certifications.map((c, i) => (
          <div key={i} className="cv-classic__item">
            <strong>{c.name}</strong> — {c.issuer} ({c.year})
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Template: Creative (tím) ────────────────────────────────────────────────
const CreativeTemplate = ({ data }) => (
  <div className="cv-creative">
    <div className="cv-creative__header">
      <div className="cv-creative__header-left">
        <div className="cv-creative__avatar">
          {data.fullName
            ? data.fullName
                .split(" ")
                .map((w) => w[0])
                .slice(-2)
                .join("")
            : "CV"}
        </div>
      </div>
      <div className="cv-creative__header-right">
        <h1 className="cv-creative__name">{data.fullName || "Họ và Tên"}</h1>
        <p className="cv-creative__jobtitle">
          {data.jobTitle || "Vị trí ứng tuyển"}
        </p>
        <div className="cv-creative__contacts">
          {data.phone && <span>📞 {data.phone}</span>}
          {data.email && <span>✉️ {data.email}</span>}
          {data.location && <span>📍 {data.location}</span>}
        </div>
      </div>
    </div>

    <div className="cv-creative__body">
      <div className="cv-creative__left">
        {data.summary && (
          <div className="cv-creative__section">
            <div className="cv-creative__section-title">Về tôi</div>
            <p className="cv-creative__summary">{data.summary}</p>
          </div>
        )}
        {data.skills?.length > 0 && (
          <div className="cv-creative__section">
            <div className="cv-creative__section-title">Kỹ năng</div>
            <div className="cv-creative__skills">
              {data.skills.map((s) => (
                <span key={s} className="cv-creative__skill">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.languages?.length > 0 && (
          <div className="cv-creative__section">
            <div className="cv-creative__section-title">Ngôn ngữ</div>
            {data.languages.map((l, i) => (
              <div key={i} className="cv-creative__lang">
                <span>{l.language}</span>
                <span className="cv-creative__lang-level">{l.level}</span>
              </div>
            ))}
          </div>
        )}
        {data.certifications?.length > 0 && (
          <div className="cv-creative__section">
            <div className="cv-creative__section-title">Chứng chỉ</div>
            {data.certifications.map((c, i) => (
              <div key={i} className="cv-creative__cert">
                {c.name} — {c.year}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cv-creative__right">
        {data.experiences?.length > 0 && (
          <div className="cv-creative__section">
            <div className="cv-creative__section-title">Kinh nghiệm</div>
            {data.experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="cv-creative__exp-item">
                <div className="cv-creative__exp-dot" />
                <div className="cv-creative__exp-content">
                  <div className="cv-creative__exp-title">{exp.position}</div>
                  <div className="cv-creative__exp-company">{exp.company}</div>
                  <div className="cv-creative__exp-period">
                    {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                  </div>
                  {exp.description && (
                    <p className="cv-creative__exp-desc">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {data.educations?.length > 0 && (
          <div className="cv-creative__section">
            <div className="cv-creative__section-title">Học vấn</div>
            {data.educations.map((edu, idx) => (
              <div key={edu.id || idx} className="cv-creative__exp-item">
                <div className="cv-creative__exp-dot" />
                <div className="cv-creative__exp-content">
                  <div className="cv-creative__exp-title">{edu.school}</div>
                  <div className="cv-creative__exp-company">
                    {edu.major} · {edu.degree}
                  </div>
                  <div className="cv-creative__exp-period">
                    {edu.startDate} – {edu.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {data.projects?.length > 0 && (
          <div className="cv-creative__section">
            <div className="cv-creative__section-title">Dự án</div>
            {data.projects.map((proj, idx) => (
              <div key={proj.id || idx} className="cv-creative__project">
                <div className="cv-creative__project-name">{proj.name}</div>
                {proj.tech && (
                  <div className="cv-creative__project-tech">{proj.tech}</div>
                )}
                {proj.description && (
                  <p className="cv-creative__exp-desc">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Main export ──────────────────────────────────────────────────────────────
const CVPreview = ({ data = {}, template = "modern", scale = 1 }) => {
  const content = (() => {
    switch (template) {
      case "classic":
        return <ClassicTemplate data={data} />;
      case "creative":
        return <CreativeTemplate data={data} />;
      default:
        return <ModernTemplate data={data} />;
    }
  })();

  return (
    <div
      className="cv-preview-wrapper"
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      <div className="cv-preview-page">{content}</div>
    </div>
  );
};

export default CVPreview;
