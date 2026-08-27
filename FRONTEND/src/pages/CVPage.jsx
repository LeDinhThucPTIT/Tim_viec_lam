// ===========================
// Gồm 3 tab: Danh sách CV | Builder | Upload PDF
// ===========================

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Tabs,
  Button,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Spin,
  Tag,
  Tooltip,
  Popconfirm,
  Badge,
  Divider,
  Steps,
  Switch,
  Empty,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  FilePdfOutlined,
  FileWordOutlined,
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  BankOutlined,
  TrophyOutlined,
  ProjectOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import CVPreview from "../components/CV/CVPreview";
import cvService, { CV_TEMPLATES } from "../services/cvService";
import { useAuth } from "../hooks/useAuth";
import "./CVPage.css";

const { Option } = Select;
const { TextArea } = Input;

// ─── Helper ──────────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SKILL_OPTIONS = [
  "ReactJS",
  "Vue.js",
  "Angular",
  "JavaScript",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "PHP",
  "MySQL",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Git",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Agile/Scrum",
  "Product Management",
];

// ─── CV Card ─────────────────────────────────────────────────────────────────
const CVCard = ({
  cv,
  onEdit,
  onDelete,
  onSetDefault,
  onPreview,
  onDownload,
}) => {
  const isUploaded = cv.type === "uploaded";
  const tmpl = CV_TEMPLATES.find((t) => t.id === cv.template);

  return (
    <div className={`cv-card ${cv.isDefault ? "cv-card--default" : ""}`}>
      {cv.isDefault && (
        <div className="cv-card__default-badge">
          <StarFilled /> CV mặc định
        </div>
      )}

      <div className="cv-card__icon-area">
        {isUploaded ? (
          <div className="cv-card__file-icon">
            {cv.mimeType === "application/pdf" ? (
              <FilePdfOutlined style={{ color: "#ef4444", fontSize: 36 }} />
            ) : (
              <FileWordOutlined style={{ color: "#2563eb", fontSize: 36 }} />
            )}
          </div>
        ) : (
          <div
            className="cv-card__template-badge"
            style={{ background: tmpl?.color + "20", color: tmpl?.color }}
          >
            {tmpl?.preview || "📄"}
          </div>
        )}
      </div>

      <div className="cv-card__content">
        <div className="cv-card__name">{cv.name}</div>
        <div className="cv-card__meta">
          {isUploaded ? (
            <span className="cv-card__type uploaded">
              📎 File upload · {formatFileSize(cv.fileSize)}
            </span>
          ) : (
            <span className="cv-card__type created">
              ✏️ Tạo bằng builder · {tmpl?.name || "Modern"}
            </span>
          )}
        </div>
        <div className="cv-card__date">
          Cập nhật: {new Date(cv.updatedAt).toLocaleDateString("vi-VN")}
        </div>
        <div className="cv-card__stats">
          <span>
            <EyeOutlined /> {cv.views} lượt xem
          </span>
          <span>
            <DownloadOutlined /> {cv.downloads} tải về
          </span>
        </div>
      </div>

      <div className="cv-card__actions">
        <Tooltip title="Xem preview">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onPreview(cv)}
          />
        </Tooltip>
        {!isUploaded && (
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(cv)}
            />
          </Tooltip>
        )}
        <Tooltip title="Tải về">
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => onDownload(cv)}
          />
        </Tooltip>
        {!cv.isDefault && (
          <Tooltip title="Đặt làm mặc định">
            <Button
              icon={<StarOutlined />}
              size="small"
              onClick={() => onSetDefault(cv._id || cv.id)}
            />
          </Tooltip>
        )}
        <Popconfirm
          title="Xóa CV này?"
          onConfirm={() => onDelete(cv._id || cv.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Xóa">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Popconfirm>
      </div>
    </div>
  );
};

// ─── CV Builder Steps ─────────────────────────────────────────────────────────
const BUILDER_STEPS = [
  { title: "Thông tin cá nhân", icon: <UserOutlined /> },
  { title: "Kinh nghiệm", icon: <BankOutlined /> },
  { title: "Học vấn & Kỹ năng", icon: <TrophyOutlined /> },
  { title: "Dự án & Khác", icon: <ProjectOutlined /> },
];

const CVBuilder = ({ initialCV = null, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialCV?.template || "modern",
  );
  const [cvName, setCvName] = useState(initialCV?.name || "CV mới của tôi");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(
    initialCV?.data || {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
      summary: "",
      experiences: [],
      educations: [],
      skills: [],
      languages: [],
      certifications: [],
      projects: [],
    },
  );

  const update = (field, value) =>
    setFormData((f) => ({ ...f, [field]: value }));

  const addItem = (field, template) =>
    setFormData((f) => ({
      ...f,
      [field]: [
        ...(f[field] || []),
        { id: Date.now().toString(), ...template },
      ],
    }));

  const updateItem = (field, id, key, value) =>
    setFormData((f) => ({
      ...f,
      [field]: f[field].map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));

  const removeItem = (field, id) =>
    setFormData((f) => ({
      ...f,
      [field]: f[field].filter((item) => item.id !== id),
    }));

  const handleSave = async (publish = true) => {
    setSaving(true);
    try {
      await onSave(
        { name: cvName, template: selectedTemplate, data: formData },
        publish,
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Step content ────────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="builder-step">
      <h3 className="builder-step__title">Thông tin cá nhân</h3>
      <Row gutter={16}>
        <Col span={12}>
          <div className="builder-field">
            <label>Họ và tên *</label>
            <Input
              value={formData.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Nguyễn Văn A"
              size="large"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="builder-field">
            <label>Vị trí ứng tuyển *</label>
            <Input
              value={formData.jobTitle}
              onChange={(e) => update("jobTitle", e.target.value)}
              placeholder="Frontend Developer"
              size="large"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="builder-field">
            <label>Email *</label>
            <Input
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
              size="large"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="builder-field">
            <label>Số điện thoại</label>
            <Input
              value={formData.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="0912345678"
              size="large"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="builder-field">
            <label>Địa điểm</label>
            <Input
              value={formData.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Hà Nội"
              size="large"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="builder-field">
            <label>LinkedIn</label>
            <Input
              value={formData.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="linkedin.com/in/..."
              size="large"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="builder-field">
            <label>GitHub</label>
            <Input
              value={formData.github}
              onChange={(e) => update("github", e.target.value)}
              placeholder="github.com/..."
              size="large"
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="builder-field">
            <label>Website</label>
            <Input
              value={formData.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="portfolio.com"
              size="large"
            />
          </div>
        </Col>
        <Col span={24}>
          <div className="builder-field">
            <label>Mục tiêu nghề nghiệp / Giới thiệu bản thân</label>
            <TextArea
              value={formData.summary}
              onChange={(e) => update("summary", e.target.value)}
              rows={4}
              placeholder="Mô tả ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp của bạn..."
            />
          </div>
        </Col>
      </Row>
    </div>
  );

  const renderStep1 = () => (
    <div className="builder-step">
      <div className="builder-step__header">
        <h3 className="builder-step__title">Kinh nghiệm làm việc</h3>
        <Button
          icon={<PlusCircleOutlined />}
          type="dashed"
          onClick={() =>
            addItem("experiences", {
              position: "",
              company: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
            })
          }
        >
          Thêm kinh nghiệm
        </Button>
      </div>
      {formData.experiences?.length === 0 && (
        <div className="builder-empty">
          Chưa có kinh nghiệm. Nhấn "Thêm kinh nghiệm" để bắt đầu.
        </div>
      )}
      {formData.experiences?.map((exp, idx) => (
        <div key={exp.id} className="builder-item-card">
          <div className="builder-item-card__header">
            <span className="builder-item-card__num">#{idx + 1}</span>
            <Button
              size="small"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removeItem("experiences", exp.id)}
            >
              Xóa
            </Button>
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <div className="builder-field">
                <label>Chức vụ *</label>
                <Input
                  value={exp.position}
                  onChange={(e) =>
                    updateItem(
                      "experiences",
                      exp.id,
                      "position",
                      e.target.value,
                    )
                  }
                  placeholder="Frontend Developer"
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="builder-field">
                <label>Công ty *</label>
                <Input
                  value={exp.company}
                  onChange={(e) =>
                    updateItem("experiences", exp.id, "company", e.target.value)
                  }
                  placeholder="Công ty ABC"
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="builder-field">
                <label>Từ tháng/năm</label>
                <Input
                  value={exp.startDate}
                  onChange={(e) =>
                    updateItem(
                      "experiences",
                      exp.id,
                      "startDate",
                      e.target.value,
                    )
                  }
                  placeholder="2022-01"
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="builder-field">
                <label>Đến tháng/năm</label>
                <Input
                  value={exp.endDate}
                  onChange={(e) =>
                    updateItem("experiences", exp.id, "endDate", e.target.value)
                  }
                  placeholder="2023-12"
                  disabled={exp.current}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="builder-field">
                <label>Đang làm hiện tại</label>
                <Switch
                  checked={exp.current}
                  onChange={(v) =>
                    updateItem("experiences", exp.id, "current", v)
                  }
                />
              </div>
            </Col>
            <Col span={24}>
              <div className="builder-field">
                <label>Mô tả công việc</label>
                <TextArea
                  value={exp.description}
                  onChange={(e) =>
                    updateItem(
                      "experiences",
                      exp.id,
                      "description",
                      e.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Mô tả trách nhiệm, thành tích nổi bật..."
                />
              </div>
            </Col>
          </Row>
        </div>
      ))}
    </div>
  );

  const renderStep2 = () => (
    <div className="builder-step">
      {/* Education */}
      <div className="builder-step__header">
        <h3 className="builder-step__title">Học vấn</h3>
        <Button
          icon={<PlusCircleOutlined />}
          type="dashed"
          onClick={() =>
            addItem("educations", {
              school: "",
              major: "",
              degree: "Cử nhân",
              startDate: "",
              endDate: "",
              gpa: "",
            })
          }
        >
          Thêm học vấn
        </Button>
      </div>
      {formData.educations?.length === 0 && (
        <div className="builder-empty">Chưa có học vấn.</div>
      )}
      {formData.educations?.map((edu, idx) => (
        <div key={edu.id} className="builder-item-card">
          <div className="builder-item-card__header">
            <span className="builder-item-card__num">#{idx + 1}</span>
            <Button
              size="small"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removeItem("educations", edu.id)}
            >
              Xóa
            </Button>
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <div className="builder-field">
                <label>Trường *</label>
                <Input
                  value={edu.school}
                  onChange={(e) =>
                    updateItem("educations", edu.id, "school", e.target.value)
                  }
                  placeholder="Đại học Bách khoa Hà Nội"
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="builder-field">
                <label>Ngành *</label>
                <Input
                  value={edu.major}
                  onChange={(e) =>
                    updateItem("educations", edu.id, "major", e.target.value)
                  }
                  placeholder="Kỹ thuật Máy tính"
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="builder-field">
                <label>Bằng cấp</label>
                <Select
                  value={edu.degree}
                  onChange={(v) =>
                    updateItem("educations", edu.id, "degree", v)
                  }
                  style={{ width: "100%" }}
                >
                  {[
                    "Tiến sĩ",
                    "Thạc sĩ",
                    "Kỹ sư",
                    "Cử nhân",
                    "Cao đẳng",
                    "Trung cấp",
                  ].map((d) => (
                    <Option key={d} value={d}>
                      {d}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={5}>
              <div className="builder-field">
                <label>Từ năm</label>
                <Input
                  value={edu.startDate}
                  onChange={(e) =>
                    updateItem(
                      "educations",
                      edu.id,
                      "startDate",
                      e.target.value,
                    )
                  }
                  placeholder="2018"
                />
              </div>
            </Col>
            <Col span={5}>
              <div className="builder-field">
                <label>Đến năm</label>
                <Input
                  value={edu.endDate}
                  onChange={(e) =>
                    updateItem("educations", edu.id, "endDate", e.target.value)
                  }
                  placeholder="2022"
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="builder-field">
                <label>GPA (tùy chọn)</label>
                <Input
                  value={edu.gpa}
                  onChange={(e) =>
                    updateItem("educations", edu.id, "gpa", e.target.value)
                  }
                  placeholder="3.6 / 4.0"
                />
              </div>
            </Col>
          </Row>
        </div>
      ))}

      <Divider />

      {/* Skills */}
      <h3 className="builder-step__title">Kỹ năng</h3>
      <div className="builder-field">
        <Select
          mode="tags"
          size="large"
          style={{ width: "100%" }}
          placeholder="Thêm kỹ năng (chọn hoặc gõ Enter để thêm)"
          value={formData.skills}
          onChange={(v) => update("skills", v)}
        >
          {SKILL_OPTIONS.map((s) => (
            <Option key={s} value={s}>
              {s}
            </Option>
          ))}
        </Select>
      </div>

      <Divider />

      {/* Languages */}
      <div className="builder-step__header">
        <h3 className="builder-step__title">Ngôn ngữ</h3>
        <Button
          icon={<PlusCircleOutlined />}
          type="dashed"
          onClick={() => addItem("languages", { language: "", level: "" })}
        >
          Thêm
        </Button>
      </div>
      {formData.languages?.map((lang, idx) => (
        <div key={idx} className="builder-inline-row">
          <Input
            value={lang.language}
            onChange={(e) =>
              updateItem(
                "languages",
                lang.id || idx,
                "language",
                e.target.value,
              )
            }
            placeholder="Tiếng Anh"
            style={{ flex: 1 }}
          />
          <Select
            value={lang.level}
            onChange={(v) => {
              const newLangs = [...formData.languages];
              newLangs[idx] = { ...newLangs[idx], level: v };
              update("languages", newLangs);
            }}
            placeholder="Trình độ"
            style={{ width: 200 }}
          >
            {[
              "Bản ngữ",
              "C2 - Thành thạo",
              "C1 - Nâng cao",
              "B2 - Upper Intermediate",
              "B1 - Intermediate",
              "A2 - Sơ cấp",
            ].map((l) => (
              <Option key={l} value={l}>
                {l}
              </Option>
            ))}
          </Select>
          <Button
            danger
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => {
              const newLangs = formData.languages.filter((_, i) => i !== idx);
              update("languages", newLangs);
            }}
          />
        </div>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="builder-step">
      {/* Projects */}
      <div className="builder-step__header">
        <h3 className="builder-step__title">Dự án nổi bật</h3>
        <Button
          icon={<PlusCircleOutlined />}
          type="dashed"
          onClick={() =>
            addItem("projects", {
              name: "",
              tech: "",
              description: "",
              link: "",
            })
          }
        >
          Thêm dự án
        </Button>
      </div>
      {formData.projects?.length === 0 && (
        <div className="builder-empty">Chưa có dự án.</div>
      )}
      {formData.projects?.map((proj, idx) => (
        <div key={proj.id} className="builder-item-card">
          <div className="builder-item-card__header">
            <span className="builder-item-card__num">#{idx + 1}</span>
            <Button
              size="small"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removeItem("projects", proj.id)}
            >
              Xóa
            </Button>
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <div className="builder-field">
                <label>Tên dự án *</label>
                <Input
                  value={proj.name}
                  onChange={(e) =>
                    updateItem("projects", proj.id, "name", e.target.value)
                  }
                  placeholder="E-commerce Dashboard"
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="builder-field">
                <label>Công nghệ sử dụng</label>
                <Input
                  value={proj.tech}
                  onChange={(e) =>
                    updateItem("projects", proj.id, "tech", e.target.value)
                  }
                  placeholder="ReactJS, Node.js, MongoDB"
                />
              </div>
            </Col>
            <Col span={24}>
              <div className="builder-field">
                <label>Mô tả</label>
                <TextArea
                  value={proj.description}
                  onChange={(e) =>
                    updateItem(
                      "projects",
                      proj.id,
                      "description",
                      e.target.value,
                    )
                  }
                  rows={2}
                  placeholder="Mô tả tính năng, vai trò và kết quả đạt được..."
                />
              </div>
            </Col>
            <Col span={24}>
              <div className="builder-field">
                <label>Link (GitHub/Demo)</label>
                <Input
                  value={proj.link}
                  onChange={(e) =>
                    updateItem("projects", proj.id, "link", e.target.value)
                  }
                  placeholder="github.com/username/project"
                  prefix={<GlobalOutlined />}
                />
              </div>
            </Col>
          </Row>
        </div>
      ))}

      <Divider />

      {/* Certifications */}
      <div className="builder-step__header">
        <h3 className="builder-step__title">Chứng chỉ</h3>
        <Button
          icon={<PlusCircleOutlined />}
          type="dashed"
          onClick={() =>
            addItem("certifications", { name: "", issuer: "", year: "" })
          }
        >
          Thêm chứng chỉ
        </Button>
      </div>
      {formData.certifications?.map((cert, idx) => (
        <div key={idx} className="builder-inline-row">
          <Input
            value={cert.name}
            onChange={(e) => {
              const a = [...formData.certifications];
              a[idx] = { ...a[idx], name: e.target.value };
              update("certifications", a);
            }}
            placeholder="Meta Frontend Certificate"
            style={{ flex: 2 }}
          />
          <Input
            value={cert.issuer}
            onChange={(e) => {
              const a = [...formData.certifications];
              a[idx] = { ...a[idx], issuer: e.target.value };
              update("certifications", a);
            }}
            placeholder="Coursera"
            style={{ flex: 1 }}
          />
          <Input
            value={cert.year}
            onChange={(e) => {
              const a = [...formData.certifications];
              a[idx] = { ...a[idx], year: e.target.value };
              update("certifications", a);
            }}
            placeholder="2023"
            style={{ width: 90 }}
          />
          <Button
            danger
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => {
              const a = formData.certifications.filter((_, i) => i !== idx);
              update("certifications", a);
            }}
          />
        </div>
      ))}
    </div>
  );

  const steps = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div className="cv-builder">
      {/* Builder header */}
      <div className="cv-builder__header">
        <Button icon={<LeftOutlined />} onClick={onCancel}>
          Quay lại
        </Button>
        <div className="cv-builder__header-center">
          <Input
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
            className="cv-builder__name-input"
            size="large"
          />
        </div>
        <div className="cv-builder__header-actions">
          <Button
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
          >
            Preview
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={() => handleSave(false)}
            loading={saving}
          >
            Lưu nháp
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleFilled />}
            onClick={() => handleSave(true)}
            loading={saving}
            style={{ fontWeight: 700 }}
          >
            Lưu CV
          </Button>
        </div>
      </div>

      <div className="cv-builder__body">
        {/* Left: Template selector + Steps */}
        <div className="cv-builder__sidebar">
          {/* Template picker */}
          <div className="template-picker">
            <div className="template-picker__label">Chọn template</div>
            <div className="template-picker__options">
              {CV_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className={`template-option ${selectedTemplate === tmpl.id ? "active" : ""}`}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  style={
                    selectedTemplate === tmpl.id
                      ? {
                          borderColor: tmpl.color,
                          background: tmpl.color + "10",
                        }
                      : {}
                  }
                >
                  <span className="template-option__emoji">{tmpl.preview}</span>
                  <div>
                    <div
                      className="template-option__name"
                      style={
                        selectedTemplate === tmpl.id
                          ? { color: tmpl.color }
                          : {}
                      }
                    >
                      {tmpl.name}
                    </div>
                    <div className="template-option__desc">
                      {tmpl.description}
                    </div>
                  </div>
                  {selectedTemplate === tmpl.id && (
                    <CheckCircleFilled
                      className="template-option__check"
                      style={{ color: tmpl.color }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps navigation */}
          <div className="builder-nav-steps">
            {BUILDER_STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`builder-nav-step ${currentStep === idx ? "active" : ""} ${currentStep > idx ? "done" : ""}`}
                onClick={() => setCurrentStep(idx)}
              >
                <div className="builder-nav-step__num">
                  {currentStep > idx ? <CheckCircleFilled /> : idx + 1}
                </div>
                <div className="builder-nav-step__label">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form content */}
        <div className="cv-builder__form">
          {steps[currentStep]()}

          <div className="cv-builder__form-nav">
            <Button
              icon={<LeftOutlined />}
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              Trước
            </Button>
            {currentStep < BUILDER_STEPS.length - 1 ? (
              <Button
                type="primary"
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                Tiếp theo <RightOutlined />
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => handleSave(true)}
                loading={saving}
                style={{ fontWeight: 700 }}
              >
                <SaveOutlined /> Lưu CV
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <EyeOutlined style={{ color: "var(--color-primary)" }} />
            <span>Preview CV — {cvName}</span>
          </div>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        styles={{
          body: {
            padding: "24px",
            background: "#f1f5f9",
            display: "flex",
            justifyContent: "center",
            overflow: "auto",
            maxHeight: "85vh",
          },
        }}
      >
        <div style={{ transform: "scale(0.8)", transformOrigin: "top center" }}>
          <CVPreview data={formData} template={selectedTemplate} />
        </div>
      </Modal>
    </div>
  );
};

// ─── Upload CV Panel ──────────────────────────────────────────────────────────
const UploadCVPanel = ({ onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      message.error("Chỉ hỗ trợ file PDF hoặc Word (.doc, .docx)");
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      message.error("File không được vượt quá 20MB");
      return false;
    }
    setUploading(true);
    try {
      const cv = await cvService.uploadCV(file);
      message.success(`Tải lên "${file.name}" thành công!`);
      onUploaded(cv);
    } catch {
      message.error("Tải lên thất bại, thử lại sau");
    } finally {
      setUploading(false);
    }
    return false; // prevent default antd upload
  };

  return (
    <div className="upload-cv-panel">
      <div className="upload-cv-panel__intro">
        <div className="upload-intro-icon">📎</div>
        <h2>Upload CV của bạn</h2>
        <p>
          Tải lên CV đã có sẵn dạng PDF hoặc Word. CV của bạn sẽ được lưu trữ và
          có thể dùng để ứng tuyển nhanh chóng.
        </p>
      </div>

      <Upload.Dragger
        name="cv"
        accept=".pdf,.doc,.docx"
        showUploadList={false}
        beforeUpload={handleUpload}
        className={`cv-upload-dragger ${dragOver ? "drag-over" : ""}`}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
        disabled={uploading}
      >
        {uploading ? (
          <div className="upload-loading">
            <Spin size="large" />
            <p>Đang xử lý file...</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-placeholder__icon">
              <UploadOutlined />
            </div>
            <div className="upload-placeholder__text">
              <p className="upload-hint-main">
                Kéo thả file vào đây hoặc <span>nhấn để chọn file</span>
              </p>
              <p className="upload-hint-sub">
                Hỗ trợ: PDF, DOC, DOCX · Tối đa 20MB
              </p>
            </div>
          </div>
        )}
      </Upload.Dragger>

      <div className="upload-tips">
        <h3>💡 Tips để CV của bạn nổi bật:</h3>
        <ul>
          <li>
            Đặt tên file rõ ràng: <strong>HoTen_ViTri_CV.pdf</strong>
          </li>
          <li>Độ dài lý tưởng: 1-2 trang</li>
          <li>Font chữ dễ đọc: Arial, Times New Roman, cỡ 11-12pt</li>
          <li>Nên export từ Word sang PDF để giữ nguyên định dạng</li>
          <li>Kiểm tra lỗi chính tả trước khi upload</li>
        </ul>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CVPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  const [cvList, setCvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCV, setEditingCV] = useState(null);
  const [previewCV, setPreviewCV] = useState(null);
  const [hiddenExportCV, setHiddenExportCV] = useState(null);
  const previewExportRef = useRef(null);
  const exportPromiseRef = useRef(null);

  const fetchCVs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cvService.getCVList();
      // Normalize returned CV objects so both `id` and `_id` are available
      const list = Array.isArray(data)
        ? data.map((cv) => ({
            ...cv,
            id: cv.id || cv._id,
            _id: cv._id || cv.id,
          }))
        : [];
      setCvList(list);
    } catch (error) {
      message.error(error.message || "Không thể tải danh sách CV");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  const exportCvPreviewToPdf = async (cv) => {
    if (!cv) {
      throw new Error("Không có CV để xuất PDF");
    }

    setHiddenExportCV(cv);
    return new Promise((resolve, reject) => {
      exportPromiseRef.current = { resolve, reject };
    });
  };

  useEffect(() => {
    if (
      !hiddenExportCV ||
      !previewExportRef.current ||
      !exportPromiseRef.current
    ) {
      return;
    }

    const exportPdf = async () => {
      try {
        const exportNode =
          previewExportRef.current.querySelector(".cv-preview-page") ||
          previewExportRef.current;

        const canvas = await html2canvas(exportNode, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });

        const imageData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imageData);
        const imgWidth = pageWidth;
        const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

        let position = 0;
        pdf.addImage(imageData, "PNG", 0, position, imgWidth, imgHeight);

        if (imgHeight > pageHeight) {
          let remainingHeight = imgHeight - pageHeight;
          while (remainingHeight > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imageData, "PNG", 0, position, imgWidth, imgHeight);
            remainingHeight -= pageHeight;
          }
        }

        const fileName = (
          hiddenExportCV.name ||
          hiddenExportCV.fileName ||
          "cv"
        )
          .replace(/\.[^.]+$/, "")
          .trim();
        pdf.save(`${fileName || "cv"}.pdf`);
        exportPromiseRef.current.resolve();
      } catch (error) {
        exportPromiseRef.current.reject(error);
      } finally {
        exportPromiseRef.current = null;
        setHiddenExportCV(null);
      }
    };

    exportPdf();
  }, [hiddenExportCV]);

  const handleSaveCV = async (payload) => {
    try {
      if (editingCV) {
        await cvService.updateCV(editingCV._id || editingCV.id, {
          name: payload.name,
          template: payload.template,
          data: payload.data,
        });
        message.success("Cập nhật CV thành công!");
      } else {
        await cvService.createCV(payload);
        message.success("Tạo CV mới thành công!");
      }
      setEditingCV(null);
      setActiveTab("list");
      fetchCVs();
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi lưu CV");
    }
  };

  const handleDelete = async (id) => {
    try {
      await cvService.deleteCV(id);
      message.success("Đã xóa CV");
      fetchCVs();
    } catch (error) {
      message.error(error.message || "Không thể xóa CV");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await cvService.setDefaultCV(id);
      message.success("Đã đặt CV mặc định");
      fetchCVs();
    } catch (error) {
      message.error(error.message || "Không thể đặt CV mặc định");
    }
  };

  const handleDownload = async (cv) => {
    if (!cv?._id && !cv?.id) return;
    const cvId = cv._id || cv.id;

    const isUploaded = cv.type === "uploaded";
    if (!isUploaded) {
      message.loading({ content: "Đang tạo file PDF...", key: "downloading" });
      try {
        await exportCvPreviewToPdf(cv);
        message.success({ content: "Tải CV thành công!", key: "downloading" });
      } catch (error) {
        console.error("Lỗi export PDF:", error);
        message.error({
          content: error?.message || "Không thể tải CV, vui lòng thử lại",
          key: "downloading",
        });
      }
      return;
    }

    message.loading({ content: "Đang tải file CV...", key: "downloading" });

    try {
      const result = await cvService.downloadCV(cvId);

      let downloadUrl = null;
      let isBlob = false;
      let downloadName = result?.filename || cv.fileName || cv.name || "cv.pdf";

      if (result instanceof Blob) {
        const peek = await result
          .slice(0, 64)
          .text()
          .catch(() => "");
        const normalized = peek.trim();
        if (normalized.startsWith("<") || normalized.startsWith("{")) {
          try {
            const parsed = JSON.parse(normalized);
            throw new Error(
              parsed?.message ||
                "Lỗi server khi tải CV: nội dung trả về không phải file",
            );
          } catch (_err) {
            throw new Error(
              "Lỗi server khi tải CV: nội dung trả về không phải file",
            );
          }
        }

        downloadUrl = URL.createObjectURL(result);
        isBlob = true;
        const ext = result.type.includes("word") ? ".docx" : ".pdf";
        if (!downloadName.match(/\.[a-zA-Z0-9]+$/)) {
          downloadName = `${downloadName}${ext}`;
        }
      } else if (result?.blob instanceof Blob) {
        const peek = await result.blob
          .slice(0, 64)
          .text()
          .catch(() => "");
        const normalized = peek.trim();
        if (normalized.startsWith("<") || normalized.startsWith("{")) {
          try {
            const parsed = JSON.parse(normalized);
            throw new Error(
              parsed?.message ||
                "Lỗi server khi tải CV: nội dung trả về không phải file",
            );
          } catch (_err) {
            throw new Error(
              "Lỗi server khi tải CV: nội dung trả về không phải file",
            );
          }
        }

        downloadUrl = URL.createObjectURL(result.blob);
        isBlob = true;
        downloadName = result.filename || downloadName;
        if (!downloadName.match(/\.[a-zA-Z0-9]+$/)) {
          const contentType =
            result.contentType || result.blob.type || "application/pdf";
          const ext = contentType.includes("word") ? ".docx" : ".pdf";
          downloadName = `${downloadName}${ext}`;
        }
      } else if (typeof result === "string" && result.startsWith("data:")) {
        downloadUrl = result;
      } else if (result?.url) {
        downloadUrl = result.url;
      }

      if (!downloadUrl) {
        throw new Error("Không nhận được dữ liệu CV để tải xuống");
      }

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (isBlob) {
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
      }

      if (result?.cv) {
        setCvList((list) =>
          list.map((item) => (item._id === result.cv._id ? result.cv : item)),
        );
        setPreviewCV((current) =>
          current?._id === result.cv._id ? result.cv : current,
        );
      }

      message.success({ content: "Tải CV thành công!", key: "downloading" });
    } catch (error) {
      console.error("Lỗi download:", error);
      message.error({
        content: error?.message || "Không thể tải CV, vui lòng thử lại",
        key: "downloading",
      });
    }
  };

  // Nếu đang ở builder mode
  if (activeTab === "builder") {
    return (
      <CVBuilder
        initialCV={editingCV}
        onSave={handleSaveCV}
        onCancel={() => {
          setEditingCV(null);
          setActiveTab("list");
        }}
      />
    );
  }

  return (
    <div className="cv-page">
      {/* Page header */}
      <div className="cv-page-header">
        <div className="container">
          <div className="cv-page-header__inner">
            <div>
              <h1 className="cv-page-header__title">Quản lý CV</h1>
              <p className="cv-page-header__subtitle">
                Tạo CV online với 3 template đẹp hoặc upload CV có sẵn của bạn
              </p>
            </div>
            <div className="cv-page-header__actions">
              <Button
                size="large"
                icon={<UploadOutlined />}
                onClick={() => setActiveTab("upload")}
                style={{ fontWeight: 600 }}
              >
                Upload CV
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCV(null);
                  setActiveTab("builder");
                }}
                style={{ fontWeight: 700 }}
              >
                Tạo CV mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container cv-page-body">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="cv-page-tabs"
          items={[
            {
              key: "list",
              label: (
                <span>
                  📋 Danh sách CV
                  {cvList.length > 0 && (
                    <Badge
                      count={cvList.length}
                      style={{
                        backgroundColor: "var(--color-primary)",
                        marginLeft: 8,
                      }}
                    />
                  )}
                </span>
              ),
            },
            { key: "upload", label: "⬆️ Upload CV" },
            { key: "tips", label: "💡 Mẹo viết CV" },
          ]}
        />

        {/* ── Tab: Danh sách ── */}
        {activeTab === "list" && (
          <div className="cv-list-content">
            {loading ? (
              <div className="cv-loading">
                <Spin size="large" />
              </div>
            ) : cvList.length === 0 ? (
              <div className="cv-empty">
                <Empty
                  description="Bạn chưa có CV nào"
                  imageStyle={{ height: 80 }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setActiveTab("builder")}
                    >
                      Tạo CV mới
                    </Button>
                    <Button
                      icon={<UploadOutlined />}
                      onClick={() => setActiveTab("upload")}
                    >
                      Upload CV
                    </Button>
                  </div>
                </Empty>
              </div>
            ) : (
              <>
                <div className="cv-list-summary">
                  <span>
                    Bạn có <strong>{cvList.length}</strong> CV
                  </span>
                  <span className="cv-list-summary__default">
                    CV mặc định sẽ được dùng khi ứng tuyển nhanh
                  </span>
                </div>
                <div className="cv-grid">
                  {/* Add new card */}
                  <div
                    className="cv-card cv-card--new"
                    onClick={() => {
                      setEditingCV(null);
                      setActiveTab("builder");
                    }}
                  >
                    <PlusOutlined
                      style={{ fontSize: 32, color: "var(--color-primary)" }}
                    />
                    <span>Tạo CV mới</span>
                  </div>
                  {cvList.map((cv) => (
                    <CVCard
                      key={cv._id || cv.id}
                      cv={cv}
                      onEdit={(cv) => {
                        setEditingCV(cv);
                        setActiveTab("builder");
                      }}
                      onDelete={handleDelete}
                      onSetDefault={handleSetDefault}
                      onPreview={(cv) => setPreviewCV(cv)}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Upload ── */}
        {activeTab === "upload" && (
          <UploadCVPanel
            onUploaded={(cv) => {
              fetchCVs();
              setActiveTab("list");
            }}
          />
        )}

        {/* ── Tab: Tips ── */}
        {activeTab === "tips" && (
          <div className="cv-tips-content">
            <Row gutter={[24, 24]}>
              {[
                {
                  icon: "🎯",
                  title: "Mục tiêu rõ ràng",
                  body: "Ghi rõ vị trí bạn muốn ứng tuyển ngay ở đầu CV. Nhà tuyển dụng chỉ mất 6-10 giây để đọc lướt CV — hãy làm nổi bật điểm mạnh ngay từ đầu.",
                },
                {
                  icon: "📏",
                  title: "Độ dài phù hợp",
                  body: "Dưới 3 năm kinh nghiệm: 1 trang. Trên 3 năm: tối đa 2 trang. Không cần viết dài để gây ấn tượng — hãy viết đúng trọng tâm.",
                },
                {
                  icon: "🔢",
                  title: "Dùng số liệu cụ thể",
                  body: 'Thay vì "Cải thiện hiệu suất hệ thống", hãy viết "Tối ưu tốc độ tải trang giảm 40%, từ 3.2s xuống 1.9s". Con số cụ thể tăng độ tin cậy đáng kể.',
                },
                {
                  icon: "🔑",
                  title: "Từ khóa theo JD",
                  body: "Đọc kỹ mô tả công việc (JD) và đưa các từ khóa quan trọng vào CV. Nhiều công ty dùng ATS để lọc CV tự động — thiếu từ khóa có thể bị loại trước khi HR đọc.",
                },
                {
                  icon: "✨",
                  title: "Thiết kế gọn gàng",
                  body: "Dùng 1-2 màu sắc chủ đạo, font chữ dễ đọc, line-height đủ thoáng. Căn chỉnh đều, không dùng quá nhiều ký tự đặc biệt hay emoji trong CV truyền thống.",
                },
                {
                  icon: "🔄",
                  title: "Cập nhật thường xuyên",
                  body: "Cập nhật CV mỗi khi có dự án mới, kỹ năng mới hoặc thành tích đáng kể. Đừng đợi đến khi tìm việc mới nhớ ra cần update.",
                },
                {
                  icon: "📎",
                  title: "Format PDF",
                  body: "Luôn gửi CV dạng PDF để đảm bảo format không bị vỡ trên các thiết bị khác nhau. Đặt tên file rõ ràng: HoTen_ViTri_CV.pdf.",
                },
                {
                  icon: "🇬🇧",
                  title: "Kiểm tra ngữ pháp",
                  body: "Nếu viết CV tiếng Anh, dùng Grammarly hoặc nhờ người native check. Lỗi ngữ pháp và chính tả là điểm trừ nghiêm trọng trong mắt nhà tuyển dụng.",
                },
              ].map((tip) => (
                <Col key={tip.title} xs={24} sm={12} md={12} lg={8} xl={6}>
                  <div className="cv-tip-card">
                    <div className="cv-tip-card__icon">{tip.icon}</div>
                    <h3 className="cv-tip-card__title">{tip.title}</h3>
                    <p className="cv-tip-card__body">{tip.body}</p>
                  </div>
                </Col>
              ))}
            </Row>

            <div className="cv-tips-cta">
              <h2>Sẵn sàng tạo CV ấn tượng?</h2>
              <p>
                Dùng builder của chúng tôi với 3 template được thiết kế chuyên
                nghiệp, hoặc upload CV có sẵn của bạn.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingCV(null);
                    setActiveTab("builder");
                  }}
                  style={{ fontWeight: 700, height: 48, paddingInline: 32 }}
                >
                  Tạo CV ngay
                </Button>
                <Button
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => setActiveTab("upload")}
                  style={{ height: 48, paddingInline: 32, fontWeight: 600 }}
                >
                  Upload CV
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        ref={previewExportRef}
        style={{
          position: "absolute",
          top: 0,
          left: -10000,
          width: 794,
          pointerEvents: "none",
          background: "#ffffff",
        }}
        aria-hidden="true"
      >
        {hiddenExportCV ? (
          <CVPreview
            data={hiddenExportCV.data}
            template={hiddenExportCV.template}
          />
        ) : null}
      </div>

      {/* Preview Modal */}
      <Modal
        title={previewCV?.name}
        open={!!previewCV}
        onCancel={() => setPreviewCV(null)}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => setPreviewCV(null)}>Đóng</Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(previewCV)}
            >
              Tải về
            </Button>
          </div>
        }
        width="90vw"
        style={{ top: 20 }}
        styles={{
          body: {
            background: "#f1f5f9",
            padding: 24,
            display: "flex",
            justifyContent: "center",
            maxHeight: "82vh",
            overflow: "auto",
          },
        }}
      >
        {previewCV?.type === "uploaded" ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <FilePdfOutlined style={{ fontSize: 64, color: "#ef4444" }} />
            <p style={{ marginTop: 16, fontSize: 16, color: "#374151" }}>
              {previewCV.fileName}
            </p>
            <p style={{ color: "#9ca3af" }}>
              {formatFileSize(previewCV.fileSize)}
            </p>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              style={{ marginTop: 16 }}
              onClick={() => handleDownload(previewCV)}
            >
              Tải về để xem
            </Button>
          </div>
        ) : (
          <div
            style={{ transform: "scale(0.75)", transformOrigin: "top center" }}
          >
            <CVPreview data={previewCV?.data} template={previewCV?.template} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CVPage;
