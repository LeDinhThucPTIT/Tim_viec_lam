// ===========================
// pages/CompanyDetailPage.jsx
// ===========================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Tag, Button, Tabs, Skeleton, Empty, message } from "antd";
import {
  EnvironmentOutlined,
  TeamOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleFilled,
  ArrowLeftOutlined,
  CalendarOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  BuildOutlined,
} from "@ant-design/icons";

import JobCard from "../components/job/JobCard";
import companyService from "../services/companyService";
import jobService from "../services/jobService"; 
import "./CompanyDetailPage.css";

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  // FETCH DỮ LIỆU TỪ BACKEND
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        // Chạy song song 2 API: Lấy chi tiết công ty và lấy danh sách việc làm
        const [compRes, jobsRes] = await Promise.all([
          companyService.getCompanyById(id),
          jobService.getJobs({ companyId: id }),
        ]);

        const companyData = compRes.data || compRes;
        const jobsData = jobsRes.data || jobsRes;

        setCompany(companyData);
        // Kiểm tra xem backend trả về object { jobs, total } hay trả về mảng trực tiếp
        setCompanyJobs(jobsData.jobs || jobsData || []);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết công ty:", err);
        message.error(
          "Không thể tải thông tin công ty. Có thể công ty không tồn tại!",
        );
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
    window.scrollTo(0, 0);
  }, [id]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 20px" }}>
        <Skeleton active avatar={{ size: 80 }} paragraph={{ rows: 10 }} />
      </div>
    );
  }

  // Handle lỗi 404 (Không tìm thấy công ty)
  if (!company) {
    return (
      <div
        className="container"
        style={{ padding: "100px 20px", textAlign: "center" }}
      >
        <Empty description="Công ty không tồn tại hoặc đã bị xóa" />
        <Button
          type="primary"
          onClick={() => navigate("/companies")}
          style={{ marginTop: 16 }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="company-detail-page">
      {/* --- Cover --- */}
      <div className="company-cover" style={{ background: company.cover }}>
        <div className="container">
          <button
            className="company-back-btn"
            onClick={() => navigate("/companies")}
          >
            <ArrowLeftOutlined /> Tất cả công ty
          </button>
        </div>
      </div>

      {/* --- Header Công ty --- */}
      <div className="company-identity-strip">
        <div className="container">
          <div className="company-identity">
            <div className="company-identity__logo-wrap">
              <img
                src={company.logo}
                alt={company.companyName || company.name}
                className="company-identity__logo"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    company.companyName || company.name || "Company",
                  )}&background=00b14f&color=fff&size=100`;
                }}
              />
              {company.verified && (
                <span className="company-identity__verified">
                  <CheckCircleFilled />
                </span>
              )}
            </div>

            <div className="company-identity__info">
              <div className="company-identity__top">
                <div>
                  <h1 className="company-identity__name">
                    {company.companyName || company.name}
                  </h1>
                  <div className="company-identity__meta">
                    <span>
                      <BuildOutlined /> {company.industry}
                    </span>
                    <span>
                      <TeamOutlined /> {company.size}
                    </span>
                    <span>
                      <EnvironmentOutlined /> {company.location}
                    </span>
                    {company.founded && (
                      <span>
                        <CalendarOutlined /> Thành lập {company.founded}
                      </span>
                    )}
                  </div>
                </div>

                <div className="company-identity__actions">
                  <Button
                    icon={
                      followed ? (
                        <HeartFilled style={{ color: "#e53e3e" }} />
                      ) : (
                        <HeartOutlined />
                      )
                    }
                    onClick={() => setFollowed(!followed)}
                    style={
                      followed
                        ? { borderColor: "#e53e3e", color: "#e53e3e" }
                        : {}
                    }
                  >
                    {followed ? "Đang theo dõi" : "Theo dõi"}
                  </Button>

                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      message.success("Đã sao chép đường dẫn!");
                    }}
                  >
                    Chia sẻ
                  </Button>

                  {companyJobs.length > 0 && (
                    <Button
                      type="primary"
                      onClick={() => setActiveTab("jobs")}
                      style={{ fontWeight: 700 }}
                    >
                      {companyJobs.length} việc làm đang tuyển
                    </Button>
                  )}
                </div>
              </div>

              <div className="company-identity__stats">
                {[
                  {
                    v: `⭐ ${company.rating || 0}`,
                    l: `${company.reviewCount || 0} đánh giá`,
                  },
                  {
                    v: `❤️ ${(company.followerCount || 0).toLocaleString()}`,
                    l: "người theo dõi",
                  },
                  { v: `💼 ${companyJobs.length}`, l: "việc làm" },
                ].map((s) => (
                  <div key={s.l} className="company-stat">
                    <span className="company-stat__value">{s.v}</span>
                    <span className="company-stat__label">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Body Chi tiết --- */}
      <div className="container company-detail-body">
        <Row gutter={[28, 0]}>
          <Col xs={24} lg={17}>
            <div className="company-detail-tabs-wrap">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="company-detail-tabs"
                items={[
                  { key: "about", label: "📋 Giới thiệu" },
                  { key: "jobs", label: `💼 Việc làm (${companyJobs.length})` },
                ]}
              />
            </div>

            {activeTab === "about" && (
              <div className="company-about-content">
                {company.description && (
                  <div className="company-section">
                    <h2 className="company-section__title">Về chúng tôi</h2>
                    <div className="company-section__body">
                      {company.description
                        .split("\n")
                        .filter(Boolean)
                        .map((p, i) => (
                          <p key={i}>{p.trim()}</p>
                        ))}
                    </div>
                  </div>
                )}

                {company.whyJoin && company.whyJoin.length > 0 && (
                  <div className="company-section">
                    <h2 className="company-section__title">
                      Tại sao nên gia nhập {company.companyName || company.name}
                      ?
                    </h2>
                    <div className="company-why-list">
                      {company.whyJoin.map((r, i) => (
                        <div key={i} className="company-why-item">
                          <CheckCircleFilled className="company-why-icon" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {company.tags && company.tags.length > 0 && (
                  <div className="company-section">
                    <h2 className="company-section__title">Lĩnh vực</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {company.tags.map((t) => (
                        <Tag
                          key={t}
                          color="green"
                          style={{
                            padding: "5px 14px",
                            borderRadius: 7,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "jobs" && (
              <div className="company-jobs-content">
                {companyJobs.length === 0 ? (
                  <Empty description="Công ty hiện không có tin tuyển dụng">
                    <Button type="primary" onClick={() => navigate("/jobs")}>
                      Xem tất cả việc làm
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
                    {companyJobs.map((j) => (
                      <Col key={j.id} xs={24} sm={12}>
                        <JobCard job={j} />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )}
          </Col>

          {/* --- Sidebar Liên hệ --- */}
          <Col xs={24} lg={7}>
            <div className="company-sidebar">
              <div className="company-info-card">
                <h3 className="company-info-card__title">Thông tin liên hệ</h3>
                {[
                  {
                    icon: <GlobalOutlined />,
                    val: company.website,
                    link: true,
                  },
                  { icon: <MailOutlined />, val: company.email },
                  { icon: <PhoneOutlined />, val: company.phone },
                  { icon: <EnvironmentOutlined />, val: company.address },
                ]
                  .filter((r) => r.val)
                  .map((r, i) => (
                    <div key={i} className="company-info-row">
                      {r.icon}
                      {r.link ? (
                        <a
                          href={
                            r.val.startsWith("http")
                              ? r.val
                              : `https://${r.val}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="company-info-link"
                        >
                          {r.val.replace(/https?:\/\//, "")}
                        </a>
                      ) : (
                        <span>{r.val}</span>
                      )}
                    </div>
                  ))}
              </div>

              <div className="company-info-card">
                <h3 className="company-info-card__title">Tổng quan</h3>
                {[
                  { l: "Ngành nghề", v: company.industry },
                  { l: "Quy mô", v: company.size },
                  { l: "Thành lập", v: company.founded },
                  { l: "Địa điểm", v: company.location },
                ]
                  .filter((r) => r.v)
                  .map((r) => (
                    <div key={r.l} className="company-overview-row">
                      <span className="company-overview-row__label">{r.l}</span>
                      <span className="company-overview-row__value">{r.v}</span>
                    </div>
                  ))}
              </div>

              {companyJobs.length > 0 && (
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={() => setActiveTab("jobs")}
                  style={{ fontWeight: 700, height: 50 }}
                >
                  Xem {companyJobs.length} việc làm
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
