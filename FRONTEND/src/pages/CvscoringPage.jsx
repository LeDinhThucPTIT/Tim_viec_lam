// ===========================
// pages/CVScoringPage.jsx
// Trang AI chấm điểm CV – dùng Anthropic API thật
// ===========================

import React, { useState, useRef } from "react";
import {
  Upload,
  Button,
  Progress,
  Tag,
  Divider,
  message,
  Spin,
  Row,
  Col,
  Select,
  Input,
} from "antd";
import {
  RobotOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  StarFilled,
  StarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  BulbOutlined,
  ThunderboltFilled,
  SafetyOutlined,
  TrophyOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import cvService from "../services/cvService";
import "./CvscoringPage.css";

const { Option } = Select;
const { TextArea } = Input;

// ── Score ring ──────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 160 }) => {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80
      ? "#00b14f"
      : score >= 60
        ? "#f59e0b"
        : score >= 40
          ? "#f97316"
          : "#ef4444";
  const label =
    score >= 80
      ? "Xuất sắc"
      : score >= 65
        ? "Tốt"
        : score >= 50
          ? "Khá"
          : score >= 35
            ? "Trung bình"
            : "Yếu";

  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={12}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </svg>
      <div className="score-ring-center">
        <span className="score-ring-num" style={{ color }}>
          {score}
        </span>
        <span className="score-ring-label" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
};

// ── Section score bar ────────────────────────────────────────────────────────
const SectionBar = ({ label, score, icon, details }) => {
  const color =
    score >= 80
      ? "#00b14f"
      : score >= 60
        ? "#f59e0b"
        : score >= 40
          ? "#f97316"
          : "#ef4444";
  return (
    <div className="section-bar">
      <div className="section-bar__header">
        <div className="section-bar__left">
          <span className="section-bar__icon">{icon}</span>
          <span className="section-bar__label">{label}</span>
        </div>
        <span className="section-bar__score" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="section-bar__track">
        <div
          className="section-bar__fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      {details && <p className="section-bar__details">{details}</p>}
    </div>
  );
};

// ── Feedback item ────────────────────────────────────────────────────────────
const FeedbackItem = ({ type, text }) => {
  const cfg = {
    strength: {
      icon: <CheckCircleFilled />,
      color: "#00b14f",
      bg: "#e6f9ee",
      label: "Điểm mạnh",
    },
    weakness: {
      icon: <CloseCircleFilled />,
      color: "#ef4444",
      bg: "#fef2f2",
      label: "Cần cải thiện",
    },
    tip: {
      icon: <BulbOutlined />,
      color: "#f59e0b",
      bg: "#fffbeb",
      label: "Gợi ý",
    },
  }[type];

  return (
    <div
      className="feedback-item"
      style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.color}` }}
    >
      <span className="feedback-item__icon" style={{ color: cfg.color }}>
        {cfg.icon}
      </span>
      <span className="feedback-item__text">{text}</span>
    </div>
  );
};

// ── Keyword chip ─────────────────────────────────────────────────────────────
const KeywordChip = ({ word, found }) => (
  <span className={`keyword-chip ${found ? "found" : "missing"}`}>
    {found ? <CheckCircleFilled /> : <CloseCircleFilled />} {word}
  </span>
);

// ── Parse AI JSON safely ─────────────────────────────────────────────────────
const parseAIResult = (text) => {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON");
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
};

// ── Build prompt ─────────────────────────────────────────────────────────────
const buildPrompt = (cvText, jobTitle, jobDesc) => `
Bạn là chuyên gia HR và tuyển dụng tại Việt Nam với 15 năm kinh nghiệm. Hãy chấm điểm và phân tích CV sau.

=== NỘI DUNG CV ===
${cvText}

=== VỊ TRÍ ỨNG TUYỂN ===
Vị trí: ${jobTitle || "Chưa xác định"}
${jobDesc ? `Mô tả JD:\n${jobDesc}` : ""}

=== YÊU CẦU PHÂN TÍCH ===
Trả về JSON object với cấu trúc CHÍNH XÁC sau (không thêm text nào ngoài JSON):
{
  "overallScore": <số 0-100>,
  "grade": "<A+|A|B+|B|C+|C|D>",
  "summary": "<nhận xét tổng quan 2-3 câu bằng tiếng Việt>",
  "sections": {
    "format": { "score": <0-100>, "details": "<nhận xét ngắn>" },
    "experience": { "score": <0-100>, "details": "<nhận xét ngắn>" },
    "skills": { "score": <0-100>, "details": "<nhận xét ngắn>" },
    "education": { "score": <0-100>, "details": "<nhận xét ngắn>" },
    "presentation": { "score": <0-100>, "details": "<nhận xét ngắn>" },
    "ats_compatibility": { "score": <0-100>, "details": "<nhận xét ngắn>" }
  },
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>", "<điểm mạnh 3>"],
  "weaknesses": ["<điểm yếu 1>", "<điểm yếu 2>", "<điểm yếu 3>"],
  "tips": ["<gợi ý cải thiện 1>", "<gợi ý 2>", "<gợi ý 3>", "<gợi ý 4>"],
  "keywords": {
    "found": ["<keyword có trong CV>", ...],
    "missing": ["<keyword quan trọng còn thiếu>", ...]
  },
  "jobMatch": <số 0-100 nếu có JD, else null>,
  "hiringChance": "<Cao|Khá cao|Trung bình|Thấp>",
  "estimatedSalary": "<ước tính mức lương phù hợp theo thị trường VN>",
  "improvementPriority": ["<ưu tiên cải thiện 1>", "<ưu tiên 2>", "<ưu tiên 3>"]
}

Chú ý: Tất cả text trong JSON phải bằng tiếng Việt. Chỉ trả về JSON, không có text nào khác.
`;

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
const CVScoringPage = () => {
  const [step, setStep] = useState("upload"); // upload | scoring | result
  const [uploadedFile, setUploadedFile] = useState(null);
  const [cvText, setCvText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [inputMode, setInputMode] = useState("paste"); // paste | upload
  const [scoring, setScoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // ── Saved CVs from cvService ─────────────────────────────────────
  const [savedCVs, setSavedCVs] = useState([]);
  React.useEffect(() => {
    cvService
      .getCVList()
      .then((list) => setSavedCVs(list.filter((c) => c.type === "created")));
  }, []);

  // ── CV text từ CV builder ────────────────────────────────────────
  const getTextFromBuilderCV = (cvData) => {
    if (!cvData) return "";
    const parts = [];
    if (cvData.fullName) parts.push(`Họ tên: ${cvData.fullName}`);
    if (cvData.jobTitle) parts.push(`Vị trí: ${cvData.jobTitle}`);
    if (cvData.email) parts.push(`Email: ${cvData.email}`);
    if (cvData.phone) parts.push(`SĐT: ${cvData.phone}`);
    if (cvData.location) parts.push(`Địa điểm: ${cvData.location}`);
    if (cvData.summary)
      parts.push(`\nMục tiêu nghề nghiệp:\n${cvData.summary}`);
    if (cvData.experiences?.length) {
      parts.push("\nKinh nghiệm làm việc:");
      cvData.experiences.forEach((e) => {
        parts.push(
          `- ${e.position} tại ${e.company} (${e.startDate}${e.current ? " – Hiện tại" : e.endDate ? ` – ${e.endDate}` : ""})`,
        );
        if (e.description) parts.push(`  ${e.description}`);
      });
    }
    if (cvData.educations?.length) {
      parts.push("\nHọc vấn:");
      cvData.educations.forEach((e) =>
        parts.push(
          `- ${e.school} – ${e.major} – ${e.degree} (${e.startDate}–${e.endDate})${e.gpa ? ` GPA: ${e.gpa}` : ""}`,
        ),
      );
    }
    if (cvData.skills?.length)
      parts.push(`\nKỹ năng: ${cvData.skills.join(", ")}`);
    if (cvData.languages?.length)
      parts.push(
        `Ngôn ngữ: ${cvData.languages.map((l) => `${l.language} (${l.level})`).join(", ")}`,
      );
    if (cvData.certifications?.length)
      parts.push(
        `Chứng chỉ: ${cvData.certifications.map((c) => `${c.name} – ${c.issuer} (${c.year})`).join(", ")}`,
      );
    if (cvData.projects?.length) {
      parts.push("\nDự án:");
      cvData.projects.forEach((p) => {
        parts.push(`- ${p.name}${p.tech ? ` [${p.tech}]` : ""}`);
        if (p.description) parts.push(`  ${p.description}`);
      });
    }
    return parts.join("\n");
  };

  // ── File upload handler ──────────────────────────────────────────
  const handleUploadFile = (file) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      message.error("Chỉ hỗ trợ PDF, Word, hoặc TXT");
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      message.error("File tối đa 20MB");
      return false;
    }
    setUploadedFile(file);
    // Try read as text (works for .txt)
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => setCvText(e.target.result);
      reader.readAsText(file);
    } else {
      message.info(
        "File PDF/Word đã chọn. Hiện tại hệ thống chưa tự động trích xuất nội dung từ file này. Vui lòng mở file và dán nội dung CV vào ô bên dưới.",
      );
    }
    return false;
  };

  // ── Call Anthropic API ───────────────────────────────────────────
  // ── Call Backend API (sử dụng Gemini) ───────────────────────────────────
  const scoreCV = async () => {
    const textToScore = cvText.trim();
    if (!textToScore || textToScore.length < 100) {
      message.error("Vui lòng nhập nội dung CV (tối thiểu 100 ký tự)");
      return;
    }

    setScoring(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setStep("scoring");

    const msgs = [
      { pct: 10, text: "🔍 Đang phân tích cấu trúc CV..." },
      { pct: 25, text: "📊 Đánh giá nội dung và kỹ năng..." },
      { pct: 45, text: "🎯 So sánh với tiêu chuẩn ngành..." },
      { pct: 65, text: "🤖 AI đang tính điểm các tiêu chí..." },
      { pct: 80, text: "💡 Tổng hợp góp ý cải thiện..." },
      { pct: 92, text: "✨ Hoàn thiện báo cáo phân tích..." },
    ];

    let msgIdx = 0;
    const progressTimer = setInterval(() => {
      if (msgIdx < msgs.length) {
        setProgress(msgs[msgIdx].pct);
        setProgressMsg(msgs[msgIdx].text);
        msgIdx++;
      }
    }, 900);

    try {
      const parsed = await cvService.scoreCV({
        cvText: textToScore,
        jobTitle: jobTitle,
        jobDesc: jobDesc,
      });

      clearInterval(progressTimer);

      if (!parsed || typeof parsed.overallScore !== "number") {
        throw new Error("Phản hồi không hợp lệ từ AI");
      }

      setProgress(100);
      setProgressMsg("✅ Hoàn thành!");
      await new Promise((r) => setTimeout(r, 600));
      setResult(parsed);
      setStep("result");
    } catch (err) {
      clearInterval(progressTimer);
      setError(err.message || "Có lỗi xảy ra khi gọi AI");
      setStep("upload");
      setScoring(false);
    }

    setScoring(false);
  };

  // ── Reset ────────────────────────────────────────────────────────
  const reset = () => {
    setStep("upload");
    setResult(null);
    setError(null);
    setProgress(0);
    setCvText("");
    setUploadedFile(null);
    setJobTitle("");
    setJobDesc("");
  };

  const gradeColor = {
    "A+": "#00b14f",
    A: "#00b14f",
    "B+": "#22c55e",
    B: "#f59e0b",
    "C+": "#f97316",
    C: "#f97316",
    D: "#ef4444",
  };

  // ════════════════════
  // RENDER
  // ════════════════════
  return (
    <div className="cv-scoring-page">
      {/* Hero header */}
      <div className="cv-scoring-header">
        <div className="container">
          <div className="cv-scoring-header__badge">
            <RobotOutlined /> Được hỗ trợ bởi Claude AI
          </div>
          <h1 className="cv-scoring-header__title">AI Chấm điểm CV</h1>
          <p className="cv-scoring-header__subtitle">
            Phân tích CV của bạn bằng AI tiên tiến — nhận điểm số, nhận xét chi
            tiết và gợi ý cụ thể để tăng cơ hội được phỏng vấn.
          </p>
          <div className="cv-scoring-header__features">
            {[
              "Chấm điểm 6 tiêu chí",
              "Phân tích ATS compatibility",
              "So sánh với JD",
              "Gợi ý cải thiện cụ thể",
            ].map((f) => (
              <span key={f} className="header-feature-tag">
                <CheckCircleFilled /> {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container cv-scoring-body">
        {/* ══ BƯỚC 1: NHẬP CV ══ */}
        {step === "upload" && (
          <Row gutter={[28, 28]}>
            <Col xs={24} lg={16}>
              <div className="scoring-card">
                <div className="scoring-card__title">
                  <span className="scoring-card__step-num">1</span>
                  Nhập nội dung CV của bạn
                </div>

                {/* Mode selector */}
                <div className="input-mode-tabs">
                  <button
                    className={`mode-tab ${inputMode === "paste" ? "active" : ""}`}
                    onClick={() => setInputMode("paste")}
                  >
                    ✏️ Nhập/Dán nội dung CV
                  </button>
                  <button
                    className={`mode-tab ${inputMode === "builder" ? "active" : ""}`}
                    onClick={() => setInputMode("builder")}
                  >
                    📋 Chọn từ CV đã tạo
                  </button>
                  <button
                    className={`mode-tab ${inputMode === "upload" ? "active" : ""}`}
                    onClick={() => setInputMode("upload")}
                  >
                    📎 Upload file
                  </button>
                </div>

                {/* Mode: Paste */}
                {inputMode === "paste" && (
                  <div>
                    <div className="scoring-field-label">
                      Dán toàn bộ nội dung CV vào đây *
                    </div>
                    <TextArea
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      rows={14}
                      placeholder={`Dán nội dung CV của bạn vào đây...\n\nVí dụ:\nNguyễn Văn An\nFrontend Developer\nEmail: an@email.com | SĐT: 0912345678 | Hà Nội\n\nMỤC TIÊU NGHỀ NGHIỆP\nFrontend Developer với 3 năm kinh nghiệm...\n\nKINH NGHIỆM LÀM VIỆC\nFrontend Developer – Công ty ABC (01/2022 – Hiện tại)\n- Phát triển UI với ReactJS + TypeScript\n...\n\nHỌC VẤN\nĐại học Bách khoa Hà Nội – KTMT – Kỹ sư (2018-2022)\n\nKỸ NĂNG\nReactJS, TypeScript, Node.js, Git, Docker`}
                      className="cv-text-input"
                    />
                    <div className="cv-text-counter">
                      <span
                        style={{
                          color:
                            cvText.length < 100
                              ? "#ef4444"
                              : "var(--color-text-muted)",
                        }}
                      >
                        {cvText.length} ký tự
                      </span>
                      {cvText.length < 100 && (
                        <span style={{ color: "#ef4444" }}>
                          {" "}
                          (tối thiểu 100)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Mode: Builder CV */}
                {inputMode === "builder" && (
                  <div>
                    {savedCVs.length === 0 ? (
                      <div className="builder-empty-state">
                        <div style={{ fontSize: 48 }}>📄</div>
                        <p>Bạn chưa có CV nào được tạo từ builder.</p>
                        <Button type="primary" href="/cv">
                          Tạo CV ngay
                        </Button>
                      </div>
                    ) : (
                      <div className="builder-cv-list">
                        {savedCVs.map((cv) => (
                          <div
                            key={cv.id}
                            className={`builder-cv-item ${cvText === getTextFromBuilderCV(cv.data) ? "selected" : ""}`}
                            onClick={() =>
                              setCvText(getTextFromBuilderCV(cv.data))
                            }
                          >
                            <div className="builder-cv-item__icon">📄</div>
                            <div className="builder-cv-item__info">
                              <div className="builder-cv-item__name">
                                {cv.name}
                              </div>
                              <div className="builder-cv-item__meta">
                                Cập nhật:{" "}
                                {new Date(cv.updatedAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                            </div>
                            {cvText === getTextFromBuilderCV(cv.data) && (
                              <CheckCircleFilled
                                style={{
                                  color: "var(--color-primary)",
                                  fontSize: 18,
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {cvText && (
                      <div className="cv-preview-snippet">
                        <strong>Đã trích xuất:</strong> {cvText.slice(0, 200)}
                        ...
                      </div>
                    )}
                  </div>
                )}

                {/* Mode: Upload */}
                {inputMode === "upload" && (
                  <div>
                    <Upload.Dragger
                      accept=".pdf,.doc,.docx,.txt"
                      showUploadList={false}
                      beforeUpload={handleUploadFile}
                      className="score-upload-dragger"
                    >
                      <div className="score-upload-inner">
                        <div className="score-upload-icon">
                          {uploadedFile ? (
                            uploadedFile.type.includes("pdf") ? (
                              <FilePdfOutlined style={{ color: "#ef4444" }} />
                            ) : (
                              <FileWordOutlined style={{ color: "#2563eb" }} />
                            )
                          ) : (
                            <UploadOutlined />
                          )}
                        </div>
                        {uploadedFile ? (
                          <>
                            <p className="upload-file-name">
                              {uploadedFile.name}
                            </p>
                            <p
                              style={{
                                fontSize: 13,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              Click để thay đổi file
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="upload-hint-main">
                              Kéo thả hoặc <span>nhấn để chọn file</span>
                            </p>
                            <p className="upload-hint-sub">
                              PDF, DOC, DOCX, TXT · Tối đa 20MB
                            </p>
                          </>
                        )}
                      </div>
                    </Upload.Dragger>
                    <div style={{ marginTop: 16 }}>
                      <div className="scoring-field-label">
                        Hoặc dán nội dung CV (để AI đọc chính xác nhất):
                      </div>
                      <TextArea
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        rows={6}
                        placeholder="Dán text từ CV vào đây..."
                        className="cv-text-input"
                      />
                      {uploadedFile &&
                        !uploadedFile.type.includes("text/plain") && (
                          <div
                            style={{
                              marginTop: 10,
                              color: "#444",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              padding: "12px 14px",
                              borderRadius: 8,
                            }}
                          >
                            <strong>Lưu ý:</strong> Với file PDF/Word, hệ thống
                            hiện chưa tự động trích xuất text. Vui lòng mở file
                            và dán toàn bộ nội dung CV vào ô bên trên để chấm
                            điểm.
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="scoring-error">
                    <ExclamationCircleFilled /> {error}
                    <button
                      onClick={() => setError(null)}
                      style={{
                        marginLeft: "auto",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Job info */}
              <div className="scoring-card" style={{ marginTop: 20 }}>
                <div className="scoring-card__title">
                  <span className="scoring-card__step-num">2</span>
                  Thông tin vị trí ứng tuyển{" "}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    (không bắt buộc nhưng sẽ cho kết quả chính xác hơn)
                  </span>
                </div>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div className="scoring-field-label">Vị trí ứng tuyển</div>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="VD: Senior Frontend Developer"
                      size="large"
                      style={{ marginBottom: 16 }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="scoring-field-label">Level</div>
                    <Select
                      value={
                        jobTitle.includes("Senior")
                          ? "senior"
                          : jobTitle.includes("Junior")
                            ? "junior"
                            : "mid"
                      }
                      onChange={(v) => {}}
                      size="large"
                      style={{ width: "100%", marginBottom: 16 }}
                      placeholder="Chọn level"
                    >
                      <Option value="intern">Thực tập sinh</Option>
                      <Option value="junior">Junior (0-2 năm)</Option>
                      <Option value="mid">Middle (2-4 năm)</Option>
                      <Option value="senior">Senior (4+ năm)</Option>
                      <Option value="lead">Tech Lead / Manager</Option>
                    </Select>
                  </Col>
                </Row>
                <div className="scoring-field-label">Mô tả công việc (JD)</div>
                <TextArea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={5}
                  placeholder="Dán mô tả công việc từ tin tuyển dụng để AI so sánh CV với yêu cầu cụ thể của nhà tuyển dụng..."
                />
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<RobotOutlined />}
                onClick={scoreCV}
                disabled={!cvText.trim() || cvText.length < 100}
                className="score-btn"
              >
                <ThunderboltFilled /> Chấm điểm CV ngay
              </Button>
            </Col>

            {/* Right panel – Info */}
            <Col xs={24} lg={8}>
              <div className="scoring-info-card">
                <h3 className="scoring-info-card__title">
                  🤖 AI phân tích 6 tiêu chí
                </h3>
                <div className="scoring-criteria-list">
                  {[
                    {
                      icon: "📐",
                      name: "Định dạng & Trình bày",
                      desc: "Bố cục, font chữ, màu sắc, cân đối nội dung",
                    },
                    {
                      icon: "💼",
                      name: "Kinh nghiệm làm việc",
                      desc: "Độ liên quan, thành tích cụ thể, timeline",
                    },
                    {
                      icon: "🔧",
                      name: "Kỹ năng",
                      desc: "Technical skills, soft skills, công nghệ phù hợp",
                    },
                    {
                      icon: "🎓",
                      name: "Học vấn",
                      desc: "Trường, ngành, GPA, chứng chỉ bổ sung",
                    },
                    {
                      icon: "✍️",
                      name: "Cách trình bày",
                      desc: "Ngôn ngữ, từ ngữ, độ súc tích, tác động",
                    },
                    {
                      icon: "🤖",
                      name: "ATS Compatibility",
                      desc: "Từ khóa, cấu trúc đọc bởi phần mềm tuyển dụng",
                    },
                  ].map((c) => (
                    <div key={c.name} className="scoring-criterion">
                      <span className="scoring-criterion__icon">{c.icon}</span>
                      <div>
                        <div className="scoring-criterion__name">{c.name}</div>
                        <div className="scoring-criterion__desc">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="scoring-info-card" style={{ marginTop: 16 }}>
                <h3 className="scoring-info-card__title">
                  💡 Mẹo để có kết quả tốt nhất
                </h3>
                <ul className="scoring-tips-list">
                  <li>
                    Dán <strong>toàn bộ nội dung CV</strong> kể cả thông tin
                    liên hệ
                  </li>
                  <li>
                    Thêm <strong>mô tả JD</strong> để AI so sánh độ phù hợp
                  </li>
                  <li>CV tiếng Việt hoặc tiếng Anh đều được</li>
                  <li>Nội dung càng chi tiết, phân tích càng chính xác</li>
                </ul>
              </div>
            </Col>
          </Row>
        )}

        {/* ══ BƯỚC 2: ĐANG CHẤM ══ */}
        {step === "scoring" && (
          <div className="scoring-loading-screen">
            <div className="scoring-loading-card">
              <div className="scoring-loading-robot">🤖</div>
              <h2 className="scoring-loading-title">
                AI đang phân tích CV của bạn...
              </h2>
              <p className="scoring-loading-msg">{progressMsg}</p>
              <div className="scoring-loading-progress">
                <Progress
                  percent={progress}
                  strokeColor={{ "0%": "#00b14f", "100%": "#4ade80" }}
                  trailColor="#e5e7eb"
                  strokeWidth={10}
                  showInfo
                  format={(p) => `${p}%`}
                />
              </div>
              <div className="scoring-loading-steps">
                {["Nhận CV", "Phân tích", "Đánh giá", "Báo cáo"].map((s, i) => (
                  <div
                    key={s}
                    className={`loading-step ${progress > i * 25 ? "done" : progress > i * 25 - 10 ? "active" : ""}`}
                  >
                    <div className="loading-step__dot">
                      {progress > (i + 1) * 25 ? "✓" : i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ BƯỚC 3: KẾT QUẢ ══ */}
        {step === "result" && result && (
          <div className="scoring-result">
            {/* Top actions */}
            <div className="result-actions-bar">
              <Button icon={<ReloadOutlined />} onClick={reset}>
                Chấm CV khác
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() =>
                  message.info("Tính năng export PDF sẽ ra mắt sớm!")
                }
              >
                Tải báo cáo PDF
              </Button>
            </div>

            <Row gutter={[24, 24]}>
              {/* ── Score overview ── */}
              <Col xs={24} lg={8}>
                <div className="result-card result-card--score">
                  <div className="result-card__title">
                    <TrophyOutlined /> Điểm tổng quan
                  </div>
                  <div className="result-score-center">
                    <ScoreRing score={result.overallScore} size={180} />
                    <div
                      className="result-grade"
                      style={{ color: gradeColor[result.grade] || "#6b7280" }}
                    >
                      Hạng <strong>{result.grade}</strong>
                    </div>
                  </div>
                  <p className="result-summary">{result.summary}</p>
                  <Divider style={{ margin: "16px 0" }} />
                  <div className="result-quick-stats">
                    <div className="quick-stat">
                      <span className="quick-stat__label">
                        Cơ hội phỏng vấn
                      </span>
                      <Tag
                        color={
                          result.hiringChance === "Cao"
                            ? "green"
                            : result.hiringChance === "Khá cao"
                              ? "cyan"
                              : result.hiringChance === "Trung bình"
                                ? "orange"
                                : "red"
                        }
                        style={{ fontWeight: 700, fontSize: 13 }}
                      >
                        {result.hiringChance}
                      </Tag>
                    </div>
                    {result.jobMatch !== null &&
                      result.jobMatch !== undefined && (
                        <div className="quick-stat">
                          <span className="quick-stat__label">
                            Độ phù hợp JD
                          </span>
                          <Tag
                            color={
                              result.jobMatch >= 70
                                ? "green"
                                : result.jobMatch >= 50
                                  ? "orange"
                                  : "red"
                            }
                            style={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {result.jobMatch}%
                          </Tag>
                        </div>
                      )}
                    {result.estimatedSalary && (
                      <div className="quick-stat">
                        <span className="quick-stat__label">
                          Mức lương phù hợp
                        </span>
                        <span
                          className="quick-stat__value"
                          style={{
                            color: "var(--color-primary)",
                            fontWeight: 700,
                          }}
                        >
                          {result.estimatedSalary}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority improvements */}
                {result.improvementPriority?.length > 0 && (
                  <div className="result-card" style={{ marginTop: 16 }}>
                    <div className="result-card__title">
                      <RiseOutlined /> Ưu tiên cải thiện
                    </div>
                    <div className="priority-list">
                      {result.improvementPriority.map((p, i) => (
                        <div key={i} className="priority-item">
                          <span className="priority-item__num">{i + 1}</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Col>

              {/* ── Section scores ── */}
              <Col xs={24} lg={16}>
                <div className="result-card">
                  <div className="result-card__title">
                    <BarChartIcon /> Điểm chi tiết theo tiêu chí
                  </div>
                  <div className="section-bars">
                    {[
                      {
                        key: "format",
                        icon: "📐",
                        label: "Định dạng & Trình bày",
                      },
                      {
                        key: "experience",
                        icon: "💼",
                        label: "Kinh nghiệm làm việc",
                      },
                      { key: "skills", icon: "🔧", label: "Kỹ năng" },
                      { key: "education", icon: "🎓", label: "Học vấn" },
                      {
                        key: "presentation",
                        icon: "✍️",
                        label: "Cách trình bày",
                      },
                      {
                        key: "ats_compatibility",
                        icon: "🤖",
                        label: "ATS Compatibility",
                      },
                    ].map(
                      (s) =>
                        result.sections?.[s.key] && (
                          <SectionBar
                            key={s.key}
                            icon={s.icon}
                            label={s.label}
                            score={result.sections[s.key].score}
                            details={result.sections[s.key].details}
                          />
                        ),
                    )}
                  </div>
                </div>

                {/* Feedback */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} md={12}>
                    <div className="result-card">
                      <div
                        className="result-card__title"
                        style={{ color: "#00b14f" }}
                      >
                        <CheckCircleFilled /> Điểm mạnh
                      </div>
                      <div className="feedback-list">
                        {result.strengths?.map((s, i) => (
                          <FeedbackItem key={i} type="strength" text={s} />
                        ))}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="result-card">
                      <div
                        className="result-card__title"
                        style={{ color: "#ef4444" }}
                      >
                        <CloseCircleFilled /> Cần cải thiện
                      </div>
                      <div className="feedback-list">
                        {result.weaknesses?.map((w, i) => (
                          <FeedbackItem key={i} type="weakness" text={w} />
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Tips */}
                <div className="result-card" style={{ marginTop: 16 }}>
                  <div className="result-card__title">
                    <BulbOutlined /> Gợi ý cải thiện cụ thể
                  </div>
                  <div className="feedback-list">
                    {result.tips?.map((t, i) => (
                      <FeedbackItem key={i} type="tip" text={t} />
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                {(result.keywords?.found?.length > 0 ||
                  result.keywords?.missing?.length > 0) && (
                  <div className="result-card" style={{ marginTop: 16 }}>
                    <div className="result-card__title">
                      <SafetyOutlined /> Phân tích từ khóa ATS
                    </div>
                    {result.keywords?.found?.length > 0 && (
                      <div className="keywords-group">
                        <div
                          className="keywords-group__label"
                          style={{ color: "#00b14f" }}
                        >
                          <CheckCircleFilled /> Từ khóa đã có (
                          {result.keywords.found.length})
                        </div>
                        <div className="keywords-chips">
                          {result.keywords.found.map((k) => (
                            <KeywordChip key={k} word={k} found={true} />
                          ))}
                        </div>
                      </div>
                    )}
                    {result.keywords?.missing?.length > 0 && (
                      <div className="keywords-group" style={{ marginTop: 14 }}>
                        <div
                          className="keywords-group__label"
                          style={{ color: "#ef4444" }}
                        >
                          <CloseCircleFilled /> Từ khóa còn thiếu (
                          {result.keywords.missing.length})
                        </div>
                        <div className="keywords-chips">
                          {result.keywords.missing.map((k) => (
                            <KeywordChip key={k} word={k} found={false} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Col>
            </Row>

            {/* Bottom CTA */}
            <div className="result-bottom-cta">
              <div className="result-cta-left">
                <h3>Sẵn sàng nộp CV?</h3>
                <p>
                  Áp dụng các gợi ý trên để cải thiện CV, sau đó tìm việc làm
                  phù hợp.
                </p>
              </div>
              <div className="result-cta-right">
                <Button
                  type="primary"
                  size="large"
                  href="/jobs"
                  style={{ fontWeight: 700, height: 48, paddingInline: 32 }}
                >
                  Tìm việc làm ngay
                </Button>
                <Button
                  size="large"
                  href="/cv"
                  style={{ height: 48, paddingInline: 24, fontWeight: 600 }}
                >
                  Chỉnh sửa CV
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mini bar chart icon (fallback)
const BarChartIcon = () => <span>📊</span>;

export default CVScoringPage;
