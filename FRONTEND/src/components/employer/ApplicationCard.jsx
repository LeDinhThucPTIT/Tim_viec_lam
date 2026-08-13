// ===========================
// Card hiển thị 1 hồ sơ ứng tuyển
// ===========================

import React, { useState } from "react";
import { Avatar, Tag, Button, Dropdown, Modal, Input, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BookOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  MoreOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import employerService from "../../services/employerService";
import "./ApplicationCard.css";

const STATUS_CONFIG = {
  new: { label: "Hồ sơ mới", color: "#6366f1", bg: "#eef2ff" },
  reviewing: { label: "Đang xét", color: "#f59e0b", bg: "#fffbeb" },
  interviewed: { label: "Phỏng vấn", color: "#3b82f6", bg: "#eff6ff" },
  offered: { label: "Đã offer", color: "#00b14f", bg: "#e6f9ee" },
  rejected: { label: "Từ chối", color: "#ef4444", bg: "#fef2f2" },
};

const { TextArea } = Input;

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity !== "object") return entity;
  return entity._id || entity.id || entity.userId || null;
};

const getApplicationJobId = (application) =>
  getEntityId(application.job) ||
  getEntityId(application.jobId) ||
  application.job?._id ||
  application.job?.id ||
  null;

const getApplicationCandidateId = (application) =>
  getEntityId(application.candidate) ||
  getEntityId(application.candidateId) ||
  getEntityId(application.candidate?.user) ||
  getEntityId(application.user) ||
  null;

const persistApplicationStatus = ({ jobId, candidateId, status }) => {
  if (!jobId || !status) return;

  const entries = [[`applicationStatus:${jobId}`, status]];
  if (candidateId) {
    entries.push([`applicationStatus:${candidateId}:${jobId}`, status]);
  }

  entries.forEach(([key, value]) => localStorage.setItem(key, value));
};

const ApplicationCard = ({ application, onStatusChange }) => {
  const { candidate, status, appliedAt, coverLetter, note } = application;
  const appId = application.id || application._id;
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState(note || "");
  const [currentNote, setCurrentNote] = useState(note || "");
  const [localStatus, setLocalStatus] = useState(status);
  const cfg = STATUS_CONFIG[localStatus] || STATUS_CONFIG.new;

  // Keep local status/note in sync if parent passes updated application props
  React.useEffect(() => {
    setLocalStatus(application.status);
    setCurrentNote(application.note || "");
    setNoteText(application.note || "");
  }, [application.status, application.note]);

  const handleChangeStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await employerService.updateApplicationStatus(
        appId,
        newStatus,
      );
      const resStatus = res?.status || newStatus;
      const resNote = res?.note ?? noteText ?? "";
      message.success("Cập nhật trạng thái thành công");
      // update local UI
      setLocalStatus(resStatus);
      setCurrentNote(resNote);
      onStatusChange?.(appId, resStatus, resNote);
      // persist and emit event
      try {
        const jobId = getApplicationJobId(application);
        const candidateId = getApplicationCandidateId(application);

        persistApplicationStatus({ jobId, candidateId, status: resStatus });

        const detail = {
          appId,
          jobId,
          status: resStatus,
          note: resNote,
          candidateId,
        };

        // ensure cross-tab propagation via localStorage for various key shapes
        try {
          if (jobId) {
            localStorage.setItem(`applicationStatus:${jobId}`, resStatus);
            localStorage.setItem(`applicationNote:${jobId}`, resNote);
          }
          if (candidateId && jobId) {
            localStorage.setItem(
              `applicationStatus:${candidateId}:${jobId}`,
              resStatus,
            );
            localStorage.setItem(
              `applicationNote:${candidateId}:${jobId}`,
              resNote,
            );
          }
          if (candidateId) {
            localStorage.setItem(
              `applicationStatus:${candidateId}:${appId}`,
              resStatus,
            );
            localStorage.setItem(
              `applicationNote:${candidateId}:${appId}`,
              resNote,
            );
          }
        } catch (e) {
          // ignore storage errors
        }

        window.dispatchEvent(
          new CustomEvent("applicationStatusChanged", { detail }),
        );
      } catch (e) {
        // ignore
      }
    } catch (err) {
      message.error("Có lỗi xảy ra");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      const res = await employerService.updateApplicationStatus(
        appId,
        localStatus,
        noteText,
      );
      const resNote = res?.note ?? noteText ?? "";
      setCurrentNote(resNote);
      onStatusChange?.(appId, localStatus, resNote);
      const jobId = getApplicationJobId(application);
      const candidateId = getApplicationCandidateId(application);
      window.dispatchEvent(
        new CustomEvent("applicationStatusChanged", {
          detail: {
            appId,
            jobId,
            status: localStatus,
            note: resNote,
            candidateId,
          },
        }),
      );
      message.success("Đã lưu ghi chú");
      setNoteModalOpen(false);
    } catch (err) {
      message.error("Có lỗi khi lưu ghi chú");
    }
  };

  const handleDownloadCv = () => {
    const cvUrl =
      application.cvUrl?.trim() || application.cv?.pdfUrl?.trim() || null;

    if (!cvUrl || cvUrl === "#") {
      message.warning("Ứng viên chưa gửi CV hoặc chưa có file đính kèm.");
      return;
    }
    window.open(cvUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewCv = () => {
    // Nếu là CV online, show snapshot modal
    if (application.cv && application.cv.type === "online") {
      setViewModalOpen(true);
      return;
    }

    // Nếu có direct pdf url, mở ra xem
    const cvUrl =
      application.cvUrl?.trim() || application.cv?.pdfUrl?.trim() || null;
    if (cvUrl) {
      window.open(cvUrl, "_blank", "noopener,noreferrer");
      return;
    }

    message.warning("Không có CV để xem.");
  };

  const actionItems = [
    {
      key: "reviewing",
      label: "👀 Đánh dấu đang xét",
      disabled: localStatus === "reviewing",
    },
    {
      key: "interviewed",
      label: "📋 Đánh dấu phỏng vấn",
      disabled: localStatus === "interviewed",
    },
    {
      key: "offered",
      label: "✅ Gửi offer",
      disabled: localStatus === "offered",
    },
    {
      key: "rejected",
      label: "❌ Từ chối hồ sơ",
      disabled: localStatus === "rejected",
      danger: true,
    },
    { type: "divider" },
    {
      key: "note",
      label: "📝 Ghi chú nội bộ",
      onClick: () => setNoteModalOpen(true),
    },
  ].map((item) => ({
    ...item,
    onClick: item.onClick || (() => handleChangeStatus(item.key)),
  }));

  return (
    <>
      <div className="application-card">
        {/* Status badge */}
        <div
          className="application-card__status"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </div>

        {/* Top row */}
        <div className="application-card__top">
          <Avatar
            size={52}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #00b14f, #007a36)",
              flexShrink: 0,
            }}
          />
          <div className="application-card__candidate">
            <div className="application-card__name">{candidate.name}</div>
            <div className="application-card__headline">
              {candidate.headline}
            </div>
          </div>
          <Dropdown
            menu={{ items: actionItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button className="application-card__more" disabled={updating}>
              <MoreOutlined />
            </button>
          </Dropdown>
        </div>

        {/* Info grid */}
        <div className="application-card__info-grid">
          <div className="app-info-item">
            <MailOutlined />
            <span>{candidate.email}</span>
          </div>
          <div className="app-info-item">
            <PhoneOutlined />
            <span>{candidate.phone}</span>
          </div>
          <div className="app-info-item">
            <EnvironmentOutlined />
            <span>{candidate.location}</span>
          </div>
          <div className="app-info-item">
            <BookOutlined />
            <span>{candidate.education}</span>
          </div>
          <div className="app-info-item">
            <ClockCircleOutlined />
            <span>{candidate.experience} kinh nghiệm</span>
          </div>
          <div className="app-info-item">
            <CalendarOutlined />
            <span>
              Nộp ngày {new Date(appliedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="application-card__skills">
          {candidate.skills?.slice(0, 4).map((s) => (
            <Tag
              key={s}
              style={{ borderRadius: 5, fontSize: 12, fontWeight: 500 }}
            >
              {s}
            </Tag>
          ))}
        </div>

        {/* Cover letter preview */}
        {coverLetter && (
          <div className="application-card__cover">
            <FileTextOutlined />
            <span className="application-card__cover-text">
              {coverLetter.slice(0, 100)}...
            </span>
          </div>
        )}

        {/* Internal note */}
        {currentNote && (
          <div className="application-card__note">
            📝 <em>{currentNote}</em>
          </div>
        )}

        {/* Action buttons */}
        <div className="application-card__actions">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={handleViewCv}
            style={{ marginRight: 8 }}
          >
            Xem CV
          </Button>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownloadCv}
            disabled={
              !(application.cvUrl || application.cv?.pdfUrl) ||
              application.cvUrl === "#"
            }
          >
            Tải CV
          </Button>
          {localStatus !== "offered" && localStatus !== "rejected" && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleChangeStatus("offered")}
                loading={updating}
                style={{ fontWeight: 600 }}
              >
                Offer
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleChangeStatus("rejected")}
                loading={updating}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Note modal */}
      <Modal
        title="Ghi chú nội bộ"
        open={noteModalOpen}
        onCancel={() => setNoteModalOpen(false)}
        onOk={handleSaveNote}
        okText="Lưu ghi chú"
      >
        <TextArea
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Ghi chú về ứng viên này (chỉ team nội bộ thấy)..."
          style={{ marginTop: 8 }}
        />
      </Modal>

      {/* View CV modal (online snapshot or embedded PDF) */}
      <Modal
        title="Xem CV"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <div style={{ minHeight: 400 }}>
          {application.cv && application.cv.type === "online" ? (
            <div
              className="cv-viewer"
              dangerouslySetInnerHTML={{
                __html:
                  typeof application.cv.onlineSnapshot === "string"
                    ? application.cv.onlineSnapshot
                    : JSON.stringify(
                        application.cv.onlineSnapshot || {},
                        null,
                        2,
                      ),
              }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <p>Không có bản xem trực tuyến. Mở file PDF nếu có.</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ApplicationCard;
