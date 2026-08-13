// ===========================
// Trang chủ - Landing page
// ===========================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Select, Button, Row, Col, Card, Statistic, Spin } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  RightOutlined,
  FireFilled,
  ThunderboltFilled,
  StarFilled,
  TeamOutlined,
  SolutionOutlined,
  RocketOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import JobCard from "../components/job/JobCard";
import jobService from "../services/jobService";
import {
  mockCategories,
  mockCompanies,
  mockStats,
} from "../constants/mockData";
import "./HomePage.css";

const { Option } = Select;

const LOCATIONS = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Bình Dương"];

const HomePage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [hotJobs, setHotJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchHotJobs = async () => {
      try {
        const data = await jobService.getHotJobs(6);
        setHotJobs(data);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchHotJobs();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="home-page">
      {/* ===== HERO BANNER ===== */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1"></div>
          <div className="hero__blob hero__blob--2"></div>
          <div className="hero__grid"></div>
        </div>
        <div className="container">
          <div className="hero__content">
            <div className="hero__badge">
              <FireFilled style={{ color: "#ff6b35" }} />
              <span>
                Hơn {mockStats.newJobsToday.toLocaleString()} việc làm mới hôm
                nay
              </span>
            </div>
            <h1 className="hero__title">
              Tìm việc làm{" "}
              <span className="hero__title-highlight">phù hợp</span>
              <br /> với bạn ngay hôm nay
            </h1>
            <p className="hero__subtitle">
              Kết nối với hàng ngàn nhà tuyển dụng hàng đầu. Xây dựng sự nghiệp
              của bạn cùng TopCV.
            </p>

            {/* Search bar */}
            <div className="hero__search">
              <div className="hero__search-inner">
                <div className="hero__search-field hero__search-field--keyword">
                  <SearchOutlined className="hero__search-icon" />
                  <input
                    type="text"
                    placeholder="Vị trí, kỹ năng, công ty..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="hero__search-input"
                  />
                </div>
                <div className="hero__search-divider"></div>
                <div className="hero__search-field hero__search-field--location">
                  <EnvironmentOutlined className="hero__search-icon" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="hero__search-select"
                  >
                    <option value="">Tất cả địa điểm</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="hero__search-btn" onClick={handleSearch}>
                  <SearchOutlined />
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Quick tags */}
            <div className="hero__quick-tags">
              <span className="hero__quick-label">Tìm kiếm phổ biến:</span>
              {[
                "Frontend Developer",
                "Product Manager",
                "UI/UX Designer",
                "Data Engineer",
              ].map((tag) => (
                <button
                  key={tag}
                  className="hero__quick-tag"
                  onClick={() => {
                    setKeyword(tag);
                    navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="home-stats">
        <div className="container">
          <div className="home-stats__grid">
            {[
              {
                icon: <SolutionOutlined />,
                value: mockStats.totalJobs.toLocaleString() + "+",
                label: "Việc làm đang tuyển",
              },
              {
                icon: <TeamOutlined />,
                value: mockStats.totalCompanies.toLocaleString() + "+",
                label: "Công ty uy tín",
              },
              {
                icon: <RocketOutlined />,
                value: mockStats.totalCandidates.toLocaleString() + "+",
                label: "Ứng viên đã đăng ký",
              },
              {
                icon: <StarFilled />,
                value: "4.8/5",
                label: "Đánh giá từ người dùng",
              },
            ].map((stat) => (
              <div key={stat.label} className="home-stat-item">
                <div className="home-stat-icon">{stat.icon}</div>
                <div className="home-stat-number">{stat.value}</div>
                <div className="home-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="page-section page-section-white home-categories">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Khám phá theo ngành nghề</h2>
              <p className="section-subtitle">
                Tìm việc làm theo lĩnh vực bạn quan tâm
              </p>
            </div>
            <button
              className="section-view-all"
              onClick={() => navigate("/jobs")}
            >
              Xem tất cả <RightOutlined />
            </button>
          </div>
          <Row gutter={[16, 16]}>
            {mockCategories.map((cat) => (
              <Col key={cat.key} xs={12} sm={8} md={6} lg={6}>
                <div
                  className="category-card"
                  onClick={() => navigate(`/jobs?category=${cat.label}`)}
                >
                  <span className="category-card__icon">{cat.icon}</span>
                  <div className="category-card__label">{cat.label}</div>
                  <div className="category-card__count">
                    {cat.count.toLocaleString()} việc làm
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ===== HOT JOBS ===== */}
      <section className="page-section page-section-gray home-hot-jobs">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <FireFilled style={{ color: "#ff6b35", marginRight: 8 }} />
                Việc làm nổi bật
              </h2>
              <p className="section-subtitle">
                Những cơ hội hấp dẫn đang chờ đón bạn
              </p>
            </div>
            <button
              className="section-view-all"
              onClick={() => navigate("/jobs")}
            >
              Xem tất cả <RightOutlined />
            </button>
          </div>

          {loadingJobs ? (
            <div className="home-loading">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[20, 20]}>
              {hotJobs.map((job) => (
                <Col key={job.id} xs={24} sm={12} lg={8}>
                  <JobCard job={job} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>

      {/* ===== TOP COMPANIES ===== */}
      <section className="page-section page-section-white home-companies">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Nhà tuyển dụng hàng đầu</h2>
              <p className="section-subtitle">
                Các công ty uy tín đang tuyển dụng tích cực
              </p>
            </div>
            <button
              className="section-view-all"
              onClick={() => navigate("/companies")}
            >
              Xem tất cả <RightOutlined />
            </button>
          </div>
          <Row gutter={[20, 20]}>
            {mockCompanies.map((company) => (
              <Col key={company._id || company.id} xs={12} sm={8} md={6} lg={4}>
                <div className="company-card">
                  <img
                    src={company.logo}
                    alt={company.companyName || company.name}
                    className="company-card__logo"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.companyName || company.name || "Company")}&background=00b14f&color=fff`;
                    }}
                  />
                  <div className="company-card__name">
                    {company.companyName || company.name}
                  </div>
                  <div className="company-card__jobs">
                    {company.jobs} việc làm
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ===== WHY TOPCV ===== */}
      <section className="page-section page-section-gray home-why">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">Tại sao chọn TopCV?</h2>
            <p className="section-subtitle">
              Nền tảng tìm việc làm hàng đầu Việt Nam
            </p>
          </div>
          <Row gutter={[32, 32]}>
            {[
              {
                icon: "🎯",
                title: "Gợi ý việc làm thông minh",
                desc: "Thuật toán AI phân tích hồ sơ và đề xuất những vị trí phù hợp nhất với kỹ năng của bạn.",
              },
              {
                icon: "⚡",
                title: "Ứng tuyển nhanh chóng",
                desc: "Chỉ vài bước đơn giản để gửi CV đến nhà tuyển dụng mơ ước của bạn.",
              },
              {
                icon: "🏆",
                title: "Công ty uy tín, đã xác thực",
                desc: "Tất cả doanh nghiệp trên TopCV đều được kiểm tra và xác thực thông tin pháp lý.",
              },
              {
                icon: "📊",
                title: "Theo dõi hồ sơ realtime",
                desc: "Biết chính xác nhà tuyển dụng đã xem CV của bạn hay chưa, khi nào.",
              },
            ].map((feature) => (
              <Col key={feature.title} xs={24} sm={12} md={6}>
                <div className="why-card">
                  <div className="why-card__icon">{feature.icon}</div>
                  <h3 className="why-card__title">{feature.title}</h3>
                  <p className="why-card__desc">{feature.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="home-cta">
        <div className="container">
          <div className="home-cta__content">
            <div className="home-cta__text">
              <h2>Bạn là nhà tuyển dụng?</h2>
              <p>
                Đăng tin tuyển dụng miễn phí và tiếp cận hàng triệu ứng viên
                chất lượng cao.
              </p>
              <div className="home-cta__checks">
                {[
                  "Đăng tin miễn phí",
                  "Tìm kiếm CV ứng viên",
                  "Quản lý tuyển dụng dễ dàng",
                ].map((item) => (
                  <div key={item} className="home-cta__check-item">
                    <CheckCircleFilled />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="home-cta__btns">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/employer/dashboard")}
                  style={{ height: 48, paddingInline: 32, fontWeight: 700 }}
                >
                  Đăng tin ngay
                </Button>
                <Button
                  size="large"
                  style={{
                    height: 48,
                    paddingInline: 32,
                    fontWeight: 600,
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "white",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
            <div className="home-cta__visual">
              <div className="home-cta__card-preview">
                <div className="cta-preview-stat">
                  <span className="cta-preview-num">125K+</span>
                  <span>Hồ sơ ứng viên</span>
                </div>
                <div className="cta-preview-stat">
                  <span className="cta-preview-num">18K+</span>
                  <span>Doanh nghiệp</span>
                </div>
                <div className="cta-preview-stat">
                  <span className="cta-preview-num">98%</span>
                  <span>Hài lòng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
