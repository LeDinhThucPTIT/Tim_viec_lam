// ===========================
// Trang chi tiết việc làm
// ===========================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tag,
  Skeleton,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Spin,
  Divider,
  Row,
  Col,
} from "antd";
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  UploadOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  EyeOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import jobService from "../services/jobService";
import authService from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import {
  formatSalary,
  timeAgo,
  formatDate,
  getJobTypeLabel,
} from "../utils/formatters";
import "./JobDetailPage.css";

const { TextArea } = Input;

const normalizeUploadFileList = (event) => {
  if (Array.isArray(event)) return event;
  return event?.fileList || [];
};

const hasAppliedJob = (appliedJobs, jobId) => {
  if (!Array.isArray(appliedJobs) || !jobId) return false;

  return appliedJobs.some(
    (item) => String(getAppliedJobId(item)) === String(jobId),
  );
};

const normalizeApplicationStatus = (status) => {
  const value = String(status || "").toLowerCase();

  const statusMap = {
    pending: "reviewing",
    review: "reviewing",
    reviewed: "reviewing",
    considering: "reviewing",
    interview: "interviewed",
    interviewing: "interviewed",
    accepted: "offered",
    offer: "offered",
    hired: "offered",
    denied: "rejected",
    reject: "rejected",
    declined: "rejected",
  };

  return statusMap[value] || value || null;
};

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity !== "object") return entity;
  return entity._id || entity.id || entity.jobId || null;
};

const getUserIds = (user) =>
  [user?.id, user?._id, user?.userId].filter(Boolean).map(String);

const getAppliedJobId = (item) => {
  if (!item || typeof item !== "object") return item;

  return (
    getEntityId(item.job) ||
    getEntityId(item.jobId) ||
    item.job?._id ||
    item.job?.id ||
    item._id ||
    item.id
  );
};

const getAppliedJobStatus = (item) => {
  if (!item || typeof item !== "object") return null;

  return normalizeApplicationStatus(
    item.status ||
      item.applicationStatus ||
      item.application?.status ||
      item.latestApplicationStatus,
  );
};

const findAppliedJob = (appliedJobs, jobId) => {
  if (!Array.isArray(appliedJobs) || !jobId) return null;
  return appliedJobs.find(
    (item) => String(getAppliedJobId(item)) === String(jobId),
  );
};

const getStatusFromJobDetail = (jobDetail) =>
  normalizeApplicationStatus(
    jobDetail?.applicationStatus ||
      jobDetail?.myApplicationStatus ||
      jobDetail?.currentUserApplication?.status ||
      jobDetail?.application?.status ||
      jobDetail?.appliedStatus,
  );

const getStoredApplicationStatus = (jobId, user, allowGeneric = false) => {
  if (!jobId) return null;

  const candidateKeys = getUserIds(user).map(
    (userId) => `applicationStatus:${userId}:${jobId}`,
  );
  const keys = allowGeneric
    ? [...candidateKeys, `applicationStatus:${jobId}`]
    : candidateKeys;

  for (const key of keys) {
    const status = normalizeApplicationStatus(localStorage.getItem(key));
    if (status) return status;
  }

  return null;
};

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null); // new: track status like offered/rejected
  const [applicationNote, setApplicationNote] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
        const jobId = data._id || data.id;
        let latestUser = user;

        if (isAuthenticated && user?.role !== "employer") {
          try {
            const profileData = await authService.getProfile();
            latestUser = profileData.user || profileData;
            if (profileData.user) {
              localStorage.setItem("user", JSON.stringify(profileData.user));
            }
          } catch {
            latestUser = user;
          }
        }
        // Kiểm tra xem User đã lưu job này chưa
        if (latestUser && latestUser.savedJobs) {
          setSaved(latestUser.savedJobs.includes(jobId));
        }
        // Kiểm tra xem User đã ứng tuyển job này chưa
        const appliedJob = findAppliedJob(latestUser?.appliedJobs, jobId);
        const hasApplied =
          Boolean(data.isApplied || data.hasApplied) ||
          hasAppliedJob(latestUser?.appliedJobs, jobId);
        const nextApplicationStatus =
          getStatusFromJobDetail(data) ||
          getAppliedJobStatus(appliedJob) ||
          getStoredApplicationStatus(jobId, latestUser, hasApplied);
        const initialNote =
          data?.currentUserApplication?.note || appliedJob?.note || null;

        setApplicationStatus(nextApplicationStatus);
        setApplicationNote(initialNote);
        setApplied(hasApplied || Boolean(nextApplicationStatus));
      } catch {
        message.error("Không tìm thấy việc làm");
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
    window.scrollTo(0, 0);

    // Listen for cross-page updates to applications (e.g., employer offers/rejects)
    const handler = (e) => {
      try {
        const d = e.detail || {};
        const changedJobId = d.jobId;
        const changedCandidateId = d.candidateId;
        const newStatus = d.status;

        if (!user) return;

        // Accept multiple id fields for user and candidate
        const userIds = getUserIds(user);
        const candidateIdStr = changedCandidateId && String(changedCandidateId);

        const isSameCandidate = candidateIdStr
          ? userIds.some((uid) => String(uid) === candidateIdStr)
          : false;

        const isSameJob = changedJobId
          ? String(changedJobId) === String(id)
          : true;

        // Also accept if the current user's appliedJobs includes the jobId
        const userAppliedThisJob = hasAppliedJob(
          user?.appliedJobs,
          changedJobId || id,
        );

        if (
          (isSameCandidate && isSameJob) ||
          (isSameJob && userAppliedThisJob)
        ) {
          const normalizedStatus = normalizeApplicationStatus(newStatus);
          setApplicationStatus(normalizedStatus);
          // set note if provided
          if (d.note) setApplicationNote(d.note);
          if (
            normalizedStatus === "offered" ||
            normalizedStatus === "rejected"
          ) {
            setApplied(true);
          }
        }
      } catch (err) {
        message.error("Có lỗi xảy ra khi cập nhật trạng thái ứng dụng", err);
      }
    };

    window.addEventListener("applicationStatusChanged", handler);
    const storageHandler = (event) => {
      const currentJobId = id;
      if (!event.key || !currentJobId) return;

      const userIds = getUserIds(user);

      // Accept if key mentions current job id or any of the user's ids
      const keyMatchesJob = event.key.includes(String(currentJobId));
      const keyMatchesUser = userIds.some((uid) =>
        event.key.includes(String(uid)),
      );

      if (keyMatchesJob || keyMatchesUser) {
        if (event.key.includes("applicationNote")) {
          setApplicationNote(event.newValue);
        } else {
          const normalizedStatus = normalizeApplicationStatus(event.newValue);
          setApplicationStatus(normalizedStatus);
          if (normalizedStatus) setApplied(true);
        }
      }
    };

    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("applicationStatusChanged", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, [id, isAuthenticated, navigate, user]);

  const handleApply = async (values) => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để ứng tuyển");
      navigate("/login");
      return;
    }

    // Kiểm tra xem đã ứng tuyển rồi không
    if (applied) {
      message.warning("Bạn đã ứng tuyển vị trí này rồi!");
      return;
    }

    // Nếu user đăng nhập bằng tk nhà tuyển dụng -> Chặn nộp CV
    if (user && user.role === "employer") {
      message.error("Nhà tuyển dụng không thể nộp đơn ứng tuyển!");
      return;
    }

    setApplying(true);
    try {
      const jobId = job?._id || job?.id || id;

      // BỔ SUNG TRƯỜNG cvType VÀO PAYLOAD Ở ĐÂY
      const payload = {
        ...values,
        cvType: "pdf",
      };

      // Gửi payload mới thay vì values cũ
      await jobService.applyJob(jobId, payload);
      setApplied(true);

      // Fetch lại profile để cập nhật appliedJobs
      try {
        const profileData = await authService.getProfile();
        if (profileData.user) {
          localStorage.setItem("user", JSON.stringify(profileData.user));
        }
      } catch {
        // Nếu fetch profile thất bại, vẫn show success vì apply đã thành công
      }

      message.success(
        "Ứng tuyển thành công! Nhà tuyển dụng sẽ liên hệ với bạn sớm.",
      );
      setApplyModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Kiểm tra lỗi từ backend
      if (
        error?.isApplied ||
        error?.message?.includes("already applied") ||
        error?.message?.includes("đã ứng tuyển")
      ) {
        setApplied(true);
        setApplyModalOpen(false);
        message.warning("Bạn đã ứng tuyển vị trí này rồi!");
      } else {
        message.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để lưu việc làm");
      return;
    }

    if (user && user.role === "employer") {
      message.warning("Chỉ ứng viên mới có thể lưu việc làm!");
      return;
    }

    try {
      await jobService.saveJob(id);
      setSaved(!saved);
      message.success(saved ? "Đã bỏ lưu" : "Đã lưu việc làm");
    } catch (error) {
      message.error("Có lỗi xảy ra, không thể lưu tin");
    }
  };

  const handleOpenApplyModal = () => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để ứng tuyển");
      navigate("/login");
      return;
    }

    if (applied || job?.isApplied || job?.hasApplied) {
      setApplied(true);
      message.warning("Bạn đã ứng tuyển vị trí này rồi!");
      return;
    }

    if (user?.role === "employer") {
      message.error("Nhà tuyển dụng không thể ứng tuyển!");
      return;
    }

    setApplyModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 20px" }}>
        <Skeleton active avatar paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (!job) return null;

  // ==========================================
  // KHAI BÁO CÁC BIẾN AN TOÀN TRÁNH LỖI UNDEFINED
  // ==========================================
  const jobTypeInfo = getJobTypeLabel(job.jobType);
  const company = job.companySnapshot || job.company || {};
  const skills = job.skills || [];
  const benefits = job.benefits || [];

  // Hỗ trợ cả ID giả và ID thật của MongoDB
  const jobId = job._id || job.id;

  return (
    <div className="job-detail-page">
      {/* Breadcrumb */}
      <div className="job-detail-breadcrumb">
        <div className="container">
          <button className="job-detail-back" onClick={() => navigate("/jobs")}>
            <ArrowLeftOutlined /> Quay lại danh sách việc làm
          </button>
        </div>
      </div>

      <div className="container">
        <div className="job-detail-layout">
          {/* ===== Main Content ===== */}
          <div className="job-detail-main">
            {/* Header card */}
            <div className="job-detail-header-card">
              <div className="job-detail-header-top">
                <div className="job-detail-logo-wrap">
                  <img
                    src={company.logo}
                    alt={company.companyName || company.name}
                    className="job-detail-logo"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        company.companyName || company.name || "Company",
                      )}&background=00b14f&color=fff&size=100`;
                    }}
                  />
                </div>
                <div className="job-detail-header-info">
                  <div className="job-detail-badges">
                    {job.urgent && (
                      <span className="job-badge job-badge--urgent">
                        ⚡ Tuyển gấp
                      </span>
                    )}
                    {job.hot && (
                      <span className="job-badge job-badge--hot">🔥 Hot</span>
                    )}
                    <Tag
                      color={jobTypeInfo.color}
                      style={{ borderRadius: 5, fontWeight: 600 }}
                    >
                      {jobTypeInfo.label}
                    </Tag>
                  </div>
                  <h1 className="job-detail-title">{job.title}</h1>
                  <div className="job-detail-company-row">
                    <BankOutlined />
                    <span className="job-detail-company-name">
                      {company.companyName || company.name}
                    </span>
                    {company.verified && (
                      <span className="job-detail-verified">
                        <SafetyCertificateOutlined /> Đã xác thực
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key info pills */}
              <div className="job-detail-key-info">
                <div className="key-info-item">
                  <DollarOutlined className="key-info-icon salary" />
                  <div>
                    <div className="key-info-label">Mức lương</div>
                    <div className="key-info-value salary">
                      {formatSalary(job.salary)}
                    </div>
                  </div>
                </div>
                <div className="key-info-item">
                  <EnvironmentOutlined className="key-info-icon" />
                  <div>
                    <div className="key-info-label">Địa điểm</div>
                    <div className="key-info-value">{job.location}</div>
                  </div>
                </div>
                <div className="key-info-item">
                  <ClockCircleOutlined className="key-info-icon" />
                  <div>
                    <div className="key-info-label">Kinh nghiệm</div>
                    <div className="key-info-value">{job.experience}</div>
                  </div>
                </div>
                <div className="key-info-item">
                  <CalendarOutlined className="key-info-icon" />
                  <div>
                    <div className="key-info-label">Hạn nộp hồ sơ</div>
                    <div className="key-info-value">
                      {job.deadline
                        ? formatDate(job.deadline)
                        : "Không thời hạn"}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="job-detail-cta">
                <Button
                  type="primary"
                  size="large"
                  disabled={applied}
                  onClick={handleOpenApplyModal}
                  style={{
                    height: 48,
                    paddingInline: 40,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
                </Button>
                {/* Nếu có applicationStatus, hiển thị tag cho ứng viên */}
                <Button
                  size="large"
                  icon={
                    saved ? (
                      <HeartFilled style={{ color: "#e53e3e" }} />
                    ) : (
                      <HeartOutlined />
                    )
                  }
                  onClick={handleSave}
                  style={{ height: 48 }}
                >
                  {saved ? "Đã lưu" : "Lưu việc làm"}
                </Button>
                <Button
                  size="large"
                  icon={<ShareAltOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    message.success("Đã sao chép liên kết");
                  }}
                  style={{ height: 48 }}
                />

                {/* Status indicator button (placed after Share) */}
                {user?.role !== "employer" && (
                  <Button
                    size="large"
                    disabled
                    style={{
                      height: 48,
                      paddingInline: 18,
                      fontWeight: 700,
                      color:
                        applicationStatus === "offered"
                          ? "#006837"
                          : applicationStatus === "rejected"
                            ? "#b91c1c"
                            : "#374151",
                      background:
                        applicationStatus === "offered"
                          ? "#ecfdf5"
                          : applicationStatus === "rejected"
                            ? "#fff1f2"
                            : "#f3f4f6",
                      borderRadius: 8,
                    }}
                  >
                    {applicationStatus === "offered"
                      ? "Đã offer"
                      : applicationStatus === "rejected"
                        ? "Từ chối"
                        : applied
                          ? "Đang xem xét"
                          : "—"}
                  </Button>
                )}
                {applicationNote && user?.role !== "employer" && (
                  <div
                    style={{
                      marginTop: 10,
                      border: "1px solid var(--color-border-light)",
                      padding: 12,
                      borderRadius: 8,
                      background: "white",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      Ghi chú từ nhà tuyển dụng
                    </div>
                    <div style={{ color: "#374151" }}>{applicationNote}</div>
                  </div>
                )}
              </div>

              <div className="job-detail-stats">
                <span>
                  <EyeOutlined /> {job.views?.toLocaleString() || 0} lượt xem
                </span>
                <span>
                  <TeamOutlined /> {job.applied || 0} ứng viên đã nộp
                </span>
                <span>
                  <ClockCircleOutlined /> Đăng{" "}
                  {timeAgo(job.postedAt || job.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="job-detail-section">
              <h2 className="job-detail-section-title">Mô tả công việc</h2>
              <div
                className="job-detail-description"
                // Dùng toán tử OR tránh trường hợp description null gây sập
                dangerouslySetInnerHTML={{
                  __html: job.description || "<p>Chưa có mô tả</p>",
                }}
              />
            </div>

            {/* Skills */}
            <div className="job-detail-section">
              <h2 className="job-detail-section-title">Kỹ năng yêu cầu</h2>
              <div className="job-detail-skills">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <Tag
                      key={skill}
                      color="green"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 13.5,
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </Tag>
                  ))
                ) : (
                  <span>Không yêu cầu kỹ năng đặc thù</span>
                )}
              </div>
            </div>

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="job-detail-section">
                <h2 className="job-detail-section-title">Quyền lợi</h2>
                <div className="job-detail-benefits">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="job-detail-benefit-item">
                      <CheckCircleFilled className="benefit-check" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== Sidebar ===== */}
          <div className="job-detail-sidebar">
            {/* Company info */}
            <div className="sidebar-card">
              <h3 className="sidebar-card__title">Thông tin công ty</h3>
              <div className="company-info">
                <img
                  src={company.logo}
                  alt={company.companyName || company.name}
                  className="company-info__logo"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      company.companyName || company.name || "Company",
                    )}&background=00b14f&color=fff`;
                  }}
                />
                <h4 className="company-info__name">
                  {company.companyName || company.name}
                </h4>
                <div className="company-info__rows">
                  <div className="company-info__row">
                    <span className="company-info__row-label">Quy mô</span>
                    <span>{company.size || "Chưa cập nhật"}</span>
                  </div>
                  <div className="company-info__row">
                    <span className="company-info__row-label">Lĩnh vực</span>
                    <span>{company.industry || "Chưa cập nhật"}</span>
                  </div>
                  <div className="company-info__row">
                    <span className="company-info__row-label">Địa điểm</span>
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline reminder */}
            <div className="sidebar-card sidebar-card--deadline">
              <CalendarOutlined style={{ fontSize: 20, color: "#f57c00" }} />
              <div>
                <div
                  style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}
                >
                  Hạn nộp hồ sơ
                </div>
                <div style={{ color: "#f57c00", fontWeight: 600 }}>
                  {job.deadline ? formatDate(job.deadline) : "Không thời hạn"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  Đừng bỏ lỡ cơ hội này!
                </div>
              </div>
            </div>

            {/* Apply sidebar btn */}
            <Button
              type="primary"
              block
              size="large"
              disabled={applied}
              onClick={handleOpenApplyModal}
              style={{ height: 52, fontWeight: 700, fontSize: 16 }}
            >
              {applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Apply Modal ===== */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 700 }}>
            Nộp hồ sơ ứng tuyển
          </span>
        }
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Divider />
        <div className="apply-modal-job-info">
          <img
            src={company.logo}
            alt=""
            className="apply-modal-logo"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${company.companyName}&background=00b14f&color=fff`;
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {company.companyName}
            </div>
          </div>
        </div>
        <Divider />
        <Form form={form} layout="vertical" onFinish={handleApply}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ và tên của bạn" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
          >
            <Input placeholder="0912345678" size="large" />
          </Form.Item>
          <Form.Item name="coverLetter" label="Thư giới thiệu (tùy chọn)">
            <TextArea
              rows={4}
              placeholder="Viết vài dòng giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
            />
          </Form.Item>
          <Form.Item
            name="cv"
            label="Upload CV"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadFileList}
            rules={[
              {
                validator: async (_, value) => {
                  const fileList = Array.isArray(value)
                    ? value
                    : value?.fileList || [];
                  if (fileList.length === 0) return Promise.resolve();
                  const fileObj = fileList[0];
                  const file = fileObj?.originFileObj || fileObj;
                  if (!file) return Promise.resolve();
                  const name = (file.name || "").toLowerCase();
                  const type = (file.type || "").toLowerCase();
                  const allowedExt = [".pdf", ".doc", ".docx"];
                  const hasExt = allowedExt.some((ext) => name.endsWith(ext));
                  const hasType =
                    type.includes("pdf") ||
                    type.includes("msword") ||
                    type.includes("officedocument");
                  if (hasExt || hasType) return Promise.resolve();
                  return Promise.reject(
                    new Error("Loại CV không hợp lệ. Chỉ chấp nhận PDF/Word."),
                  );
                },
              },
            ]}
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />} size="large" block>
                Chọn file CV (PDF, Word)
              </Button>
            </Upload>
          </Form.Item>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button block size="large" onClick={() => setApplyModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={applying}
              style={{ fontWeight: 700 }}
            >
              Gửi hồ sơ
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default JobDetailPage;
