// ===========================

// Card hiển thị 1 tin tuyển dụng
// ===========================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tag, Tooltip, message } from "antd";
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled,
  FireFilled,
  ThunderboltFilled,
} from "@ant-design/icons";
import { formatSalary, timeAgo, getJobTypeLabel } from "../../utils/formatters";
import jobService from "../../services/jobService";
import { useAuth } from "../../hooks/useAuth";
import "./JobCard.css";

const JobCard = ({ job, view = "list" }) => {
  const { isAuthenticated, user } = useAuth();
  const [saved, setSaved] = useState(
    user?.savedJobs?.includes(job.id) || false,
  );
  const [savingLoading, setSavingLoading] = useState(false);
  const jobTypeInfo = getJobTypeLabel(job.jobType);

  const company = job.companySnapshot || job.company || {};

 
  const skills = job.skills || [];

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để lưu việc làm");
      return;
    }
    setSavingLoading(true);
    try {
      await jobService.saveJob(job.id || job._id); // Hỗ trợ cả id giả và _id thật của MongoDB
      setSaved(!saved);
      message.success(saved ? "Đã bỏ lưu việc làm" : "Đã lưu việc làm");
    } catch {
      message.error("Có lỗi xảy ra, thử lại sau");
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    
    <Link
      to={`/jobs/${job._id || job.id}`}
      className={`job-card job-card--${view}`}
    >
      <div className="job-card__inner">
        {/* Badges */}
        <div className="job-card__badges">
          {job.urgent && (
            <span className="job-badge job-badge--urgent">
              <ThunderboltFilled /> Gấp
            </span>
          )}
          {job.hot && (
            <span className="job-badge job-badge--hot">
              <FireFilled /> Hot
            </span>
          )}
        </div>

        {/* Save button */}
        <Tooltip title={saved ? "Bỏ lưu" : "Lưu việc làm"}>
          <button
            className={`job-card__save ${saved ? "saved" : ""}`}
            onClick={handleSave}
            disabled={savingLoading}
          >
            {saved ? <HeartFilled /> : <HeartOutlined />}
          </button>
        </Tooltip>

        {/* Company logo */}
        <div className="job-card__logo-wrap">
          <img
            src={company.logo}
            alt={company.companyName || company.name}
            className="job-card__logo"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                company.companyName || company.name || "Company",
              )}&background=00b14f&color=fff&size=80`;
            }}
          />
          {company.verified && (
            <span className="job-card__verified" title="Công ty đã xác thực">
              ✓
            </span>
          )}
        </div>

        {/* Content */}
        <div className="job-card__content">
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__company">
            {company.companyName || company.name}
          </p>

          <div className="job-card__meta">
            <div className="job-card__meta-item">
              <DollarOutlined className="job-card__meta-icon salary" />
              <span className="job-card__salary">
                {formatSalary(job.salary)}
              </span>
            </div>
            <div className="job-card__meta-item">
              <EnvironmentOutlined className="job-card__meta-icon" />
              <span>{job.location}</span>
            </div>
            <div className="job-card__meta-item">
              <ClockCircleOutlined className="job-card__meta-icon" />
              {/* Fallback ngày tạo nếu postedAt không có */}
              <span>{timeAgo(job.postedAt || job.createdAt)}</span>
            </div>
          </div>

          <div className="job-card__skills">
            {skills.slice(0, 3).map((skill) => (
              <span key={skill} className="job-card__skill-tag">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="job-card__skill-more">+{skills.length - 3}</span>
            )}
          </div>

          <div className="job-card__footer">
            <Tag
              color={jobTypeInfo.color}
              style={{ borderRadius: 4, fontWeight: 500, fontSize: 12 }}
            >
              {jobTypeInfo.label}
            </Tag>
            <span className="job-card__deadline">
              {job.deadline
                ? `Hết hạn: ${new Date(job.deadline).toLocaleDateString("vi-VN")}`
                : "Không thời hạn"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
