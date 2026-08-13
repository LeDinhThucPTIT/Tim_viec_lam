// ===========================
// Tabs: Tổng quan | Tin đăng | Hồ sơ ứng viên | Hồ sơ công ty
// ===========================

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Tag,
  Select,
  Input,
  Tabs,
  Avatar,
  Popconfirm,
  Spin,
  Badge,
  Tooltip,
  message,
  Empty,
  Modal,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  FireFilled,
  ThunderboltFilled,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CloseCircleFilled,
  RiseOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  GlobalOutlined,
  MailOutlined,
  CalendarOutlined,
  StarFilled,
  LogoutOutlined,
} from "@ant-design/icons";
import StatsCard from "../components/employer/StatsCard";
import ApplicationCard from "../components/employer/ApplicationCard";
import PostJobModal from "../components/employer/PostJobModal";
import employerService from "../services/employerService";
import authService from "../services/authService";
import { mockDashboardStats } from "../constants/employerData";
import companyService from "../services/companyService";
import {
  formatSalary,
  timeAgo,
  formatDate,
  getJobTypeLabel,
} from "../utils/formatters";
import "./EmployerDashboardPage.css";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const JOB_STATUS_CFG = {
  active: { label: "Đang hiển thị", color: "green" },
  paused: { label: "Tạm dừng", color: "orange" },
  closed: { label: "Đã đóng", color: "red" },
  draft: { label: "Nháp", color: "default" },
};

const APP_STATUS_CFG = {
  new: { label: "Hồ sơ mới", color: "#6366f1" },
  reviewing: { label: "Đang xét", color: "#f59e0b" },
  interviewed: { label: "Phỏng vấn", color: "#3b82f6" },
  offered: { label: "Đã offer", color: "#00b14f" },
  rejected: { label: "Từ chối", color: "#ef4444" },
};

// ─── Mini Chart (CSS-only bar chart) ─────────────────────────────────────────

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="mini-bar-chart">
      {data.map((d) => (
        <div key={d.date} className="mini-bar-chart__col">
          <div
            className="mini-bar-chart__bar"
            style={{ height: `${(d.count / max) * 100}%` }}
            title={`${d.date}: ${d.count} hồ sơ`}
          />
          <div className="mini-bar-chart__label">{d.date.split("/")[0]}</div>
        </div>
      ))}
    </div>
  );
};

const normalizeCompanyProfile = (profile = {}) => {
  const actual = profile.data || profile;
  return {
    ...actual,
    companyName: actual.companyName || actual.name,
    name: actual.name || actual.companyName,
  };
};

// ─── EmployerDashboardPage ────────────────────────────────────────────────────

const EmployerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);

  // Filters
  const [jobStatus, setJobStatus] = useState("all");
  const [jobKeyword, setJobKeyword] = useState("");
  const [appJobId, setAppJobId] = useState("all");
  const [appStatus, setAppStatus] = useState("all");

  // Modals
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [postingJob, setPostingJob] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const { updateUser } = useAuth();

  // logout
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // ── Fetch data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadOverview = async () => {
      const [s, c, cp] = await Promise.all([
        employerService.getDashboardStats(),
        employerService.getChartData(),
        employerService.getCompanyProfile(),
      ]);
      const normalizedProfile = normalizeCompanyProfile(cp);

      console.debug("[EmployerDashboard] raw stats:", s);

      // If backend returned the built-in mockDashboardStats (used in demos),
      // don't show those placeholder numbers in the real UI.
      const isMockResponse =
        s &&
        typeof s === "object" &&
        s.hiredThisMonth === mockDashboardStats.hiredThisMonth &&
        s.totalJobs === mockDashboardStats.totalJobs;

      const normalizedStats = {
        totalJobs: s?.totalJobs ?? 0,
        activeJobs: s?.activeJobs ?? 0,
        totalApplications: s?.totalApplications ?? 0,
        newApplications: s?.newApplications ?? 0,
        totalViews: s?.totalViews ?? 0,
        profileViews: s?.profileViews ?? 0,
        hiredThisMonth: isMockResponse ? 0 : (s?.hiredThisMonth ?? 0),
        responseRate: s?.responseRate ?? 0,
      };

      setStats(normalizedStats);
      setChartData(c);
      setCompanyProfile(normalizedProfile);
      setProfileForm(normalizedProfile);
      setLoadingStats(false);
    };
    loadOverview();
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    const data = await employerService.getPostedJobs({
      status: jobStatus,
      keyword: jobKeyword,
    });
    setJobs(data);
    setLoadingJobs(false);
  }, [jobStatus, jobKeyword]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    const data = await employerService.getApplications({
      jobId: appJobId,
      status: appStatus,
    });
    setApplications(data);
    setLoadingApps(false);
  }, [appJobId, appStatus]);

  useEffect(() => {
    if (activeTab === "applications") fetchApplications();
  }, [activeTab, fetchApplications]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePostJob = async (values) => {
    console.log("🚀 [GỬI ĐI] Dữ liệu Form nhận được:", values);
    setPostingJob(true);
    try {
      if (editingJob) {
        const jobId = editingJob._id || editingJob.id;
        await employerService.updateJob(jobId, values);
        message.success("Cập nhật tin tuyển dụng thành công!");
      } else {
        await employerService.createJob(values);
        message.success("Đăng tin tuyển dụng thành công!");
      }
      setPostModalOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      console.error("❌ [LỖI BACKEND]:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setPostingJob(false);
    }
  };

  const handleChangeJobStatus = async (job, newStatus) => {
    const jobId = job._id || job.id;
    await employerService.changeJobStatus(jobId, newStatus);
    message.success(
      `Đã ${newStatus === "active" ? "kích hoạt lại" : "tạm dừng"} tin tuyển dụng`,
    );
    fetchJobs();
  };

  const handleDeleteJob = async (id) => {
    await employerService.deleteJob(id);
    message.success("Đã xóa tin tuyển dụng");
    fetchJobs();
  };

  const handleAppStatusChange = (appId, newStatus, note) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId || a._id === appId
          ? { ...a, status: newStatus, note: note ?? a.note }
          : a,
      ),
    );
  };
  const [isDescExpanded, setIsDescExpanded] = useState(false); // Quản lý nút Xem thêm/Thu gọn mô tả
  const [savingProfile, setSavingProfile] = useState(false); // Quản lý loading khi lưu

  // Hàm lưu (handleSaveCompanyProfile)
  const handleSaveCompanyProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        ...profileForm,
        companyName: profileForm.companyName || profileForm.name,
        name: profileForm.companyName || profileForm.name,
        tags:
          typeof profileForm.tags === "string"
            ? profileForm.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : profileForm.tags,
        whyJoin:
          typeof profileForm.whyJoin === "string"
            ? profileForm.whyJoin
                .split("\n")
                .map((t) => t.trim())
                .filter(Boolean)
            : profileForm.whyJoin,
      };

      const response = await employerService.updateCompanyProfile(payload);
      const updatedProfile = normalizeCompanyProfile(response || payload);
      setCompanyProfile(updatedProfile);
      setProfileForm(updatedProfile);
      message.success("Cập nhật hồ sơ công ty thành công!");

      setEditProfileOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi lưu thông tin!");
    } finally {
      setSavingProfile(false);
    }
  };


  const logoInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);


  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    
    formData.append("avatar", file);

    setUploadingLogo(true);
    try {
      const data = await authService.updateAvatar(formData);
      message.success("Cập nhật logo công ty thành công!");
      if (data?.user) {
        updateUser(data.user);
        setCompanyProfile((prevProfile) => ({
          ...prevProfile,
          logo: data.user.logo || data.user.avatar,
        }));
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      message.error(error?.message || "Tải ảnh thất bại!");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  // ── Job table columns ───────────────────────────────────────────────────────

  const jobColumns = [
    {
      title: "Tiêu đề công việc",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div className="job-table__title-cell">
          <div className="job-table__title">{title}</div>
          <div className="job-table__meta">
            <span>
              <EnvironmentOutlined /> {record.location}
            </span>
            <span>
              <ClockCircleOutlined /> {record.experience}
            </span>
            {record.urgent && (
              <span className="job-badge--urgent-mini">⚡ Gấp</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s) => {
        const cfg = JOB_STATUS_CFG[s] || JOB_STATUS_CFG.draft;
        return (
          <Tag color={cfg.color} style={{ borderRadius: 5, fontWeight: 600 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Ứng viên",
      dataIndex: "applications",
      key: "applications",
      width: 100,
      render: (v) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--color-primary)",
            }}
          >
            {v}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>hồ sơ</div>
        </div>
      ),
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
      width: 90,
      render: (v) => (
        <span style={{ color: "#6b7280", fontWeight: 500 }}>
          {v?.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Lương",
      key: "salary",
      width: 160,
      render: (_, record) => (
        <span
          style={{
            color: "var(--color-primary)",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {formatSalary(record.salary)}
        </span>
      ),
    },
    {
      title: "Hạn nộp",
      dataIndex: "deadline",
      key: "deadline",
      width: 110,
      render: (d) =>
        d ? (
          <span style={{ fontSize: 13 }}>{formatDate(d)}</span>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div className="job-table__actions">
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              type="text"
              onClick={() => {
                setEditingJob(record);
                setPostModalOpen(true);
              }}
            />
          </Tooltip>
          {record.status === "active" ? (
            <Tooltip title="Tạm dừng">
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                type="text"
                style={{ color: "#f59e0b" }}
                onClick={() => handleChangeJobStatus(record, "paused")}
              />
            </Tooltip>
          ) : record.status === "paused" ? (
            <Tooltip title="Kích hoạt lại">
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                type="text"
                style={{ color: "#00b14f" }}
                onClick={() => handleChangeJobStatus(record, "active")}
              />
            </Tooltip>
          ) : null}
          <Popconfirm
            title="Bạn chắc chắn muốn xóa tin này?"
            onConfirm={() => handleDeleteJob(record._id || record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa tin">
              <Button
                size="small"
                icon={<DeleteOutlined />}
                type="text"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="employer-dashboard">
      {/* Page header */}
      <div className="employer-header">
        <div className="container">
          <div className="employer-header__inner">
            <div className="employer-header__left">
              <div className="employer-header__logo-wrap">
                <img
                  src={companyProfile?.logo}
                  alt={companyProfile?.companyName || companyProfile?.name}
                  className="employer-header__logo"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyProfile?.companyName || companyProfile?.name || "C")}&background=00b14f&color=fff&size=80`;
                  }}
                />
              </div>
              <div>
                <h1 className="employer-header__name">
                  {companyProfile?.companyName ||
                    companyProfile?.name ||
                    "Công ty của bạn"}
                </h1>
                <p className="employer-header__meta">
                  {companyProfile?.industry} · {companyProfile?.size} ·{" "}
                  {companyProfile?.location}
                </p>
              </div>
            </div>
            <div className="employer-header__right">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => {
                  setEditingJob(null);
                  setPostModalOpen(true);
                }}
                style={{ fontWeight: 700, height: 44 }}
              >
                Đăng tin mới
              </Button>
              <Button
                type="default"
                danger
                icon={<LogoutOutlined />}
                size="large"
                onClick={handleLogout} // Gọi hàm đăng xuất
                style={{ fontWeight: 700, height: 44 }}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="employer-dashboard__body">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="employer-tabs"
            size="large"
            items={[
              {
                key: "overview",
                label: (
                  <span>
                    <BarChartOutlined /> Tổng quan
                  </span>
                ),
              },
              {
                key: "jobs",
                label: (
                  <span>
                    <FileTextOutlined /> Tin đăng{" "}
                    <Badge
                      count={
                        Array.isArray(jobs)
                          ? jobs.filter((j) => j.status === "active").length
                          : 0
                      }
                      style={{ backgroundColor: "var(--color-primary)" }}
                    />
                  </span>
                ),
              },
              {
                key: "applications",
                label: (
                  <span>
                    <TeamOutlined /> Hồ sơ ứng viên{" "}
                    <Badge
                      count={stats?.newApplications}
                      style={{ backgroundColor: "#6366f1" }}
                    />
                  </span>
                ),
              },
              {
                key: "company",
                label: (
                  <span>
                    <BankOutlined /> Hồ sơ công ty
                  </span>
                ),
              },
            ]}
          />

          {/* ═══════════ TAB 1: TỔNG QUAN ═══════════ */}
          {activeTab === "overview" && (
            <div className="tab-content">
              {loadingStats ? (
                <div className="tab-loading">
                  <Spin size="large" />
                </div>
              ) : (
                <>
                  {/* Stats cards */}
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={12} md={6}>
                      <StatsCard
                        icon="📋"
                        label="Tin đang tuyển"
                        value={stats.activeJobs}
                        sub={`/ ${stats.totalJobs} tổng tin`}
                        color="green"
                        trend={100}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <StatsCard
                        icon="👥"
                        label="Tổng hồ sơ"
                        value={stats.totalApplications}
                        sub={`${stats.newApplications} mới hôm nay`}
                        color="blue"
                        trend={100}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <StatsCard
                        icon="👁️"
                        label="Lượt xem tin"
                        value={stats.totalViews.toLocaleString()}
                        sub={`${stats.profileViews} xem hồ sơ công ty`}
                        color="purple"
                        trend={100}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <StatsCard
                        icon="🏆"
                        label="Đã tuyển dụng"
                        value={stats.hiredThisMonth}
                        sub="trong tháng này"
                        color="orange"
                        trend={100}
                      />
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    {/* Application chart */}
                    <Col xs={24} md={16}>
                      <Card
                        title={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <RiseOutlined
                              style={{ color: "var(--color-primary)" }}
                            />
                            <span>Hồ sơ ứng tuyển 12 ngày gần nhất</span>
                          </div>
                        }
                        bordered={false}
                        className="dashboard-card"
                      >
                        {chartData && (
                          <MiniBarChart data={chartData.applicationsByDay} />
                        )}
                      </Card>
                    </Col>

                    {/* Status distribution */}
                    <Col xs={24} md={8}>
                      <Card
                        title="Phân bố trạng thái hồ sơ"
                        bordered={false}
                        className="dashboard-card"
                      >
                        {chartData?.applicationsByStatus.map((item) => {
                          const pct = Math.round(
                            (item.count / stats.totalApplications) * 100,
                          );
                          return (
                            <div key={item.status} className="status-dist-item">
                              <div className="status-dist-item__header">
                                <span className="status-dist-item__label">
                                  {item.status}
                                </span>
                                <span className="status-dist-item__count">
                                  {item.count}
                                </span>
                              </div>
                              <div className="status-dist-item__bar-bg">
                                <div
                                  className="status-dist-item__bar"
                                  style={{
                                    width: `${pct}%`,
                                    background: item.color,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </Card>
                    </Col>
                  </Row>

                  {/* Recent jobs quick view */}
                  <Card
                    title="Tin đăng gần đây"
                    bordered={false}
                    className="dashboard-card"
                    style={{ marginTop: 20 }}
                    extra={
                      <Button
                        type="link"
                        onClick={() => setActiveTab("jobs")}
                        style={{
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }}
                      >
                        Xem tất cả
                      </Button>
                    }
                  >
                    <div className="recent-jobs-list">
                      {jobs.slice(0, 5).map((job) => (
                        <div
                          key={job._id || job.id}
                          className="recent-job-item"
                        >
                          <div className="recent-job-item__left">
                            <div className="recent-job-item__title">
                              {job.title}
                            </div>
                            <div className="recent-job-item__meta">
                              {job.location} · {job.experience} ·{" "}
                              {formatSalary(job.salary)}
                            </div>
                          </div>
                          <div className="recent-job-item__right">
                            <Tag color={JOB_STATUS_CFG[job.status]?.color}>
                              {JOB_STATUS_CFG[job.status]?.label}
                            </Tag>
                            <span className="recent-job-item__apps">
                              <TeamOutlined /> {job.applications} hồ sơ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ═══════════ TAB 2: TIN ĐĂNG ═══════════ */}
          {activeTab === "jobs" && (
            <div className="tab-content">
              {/* Toolbar */}
              <div className="tab-toolbar">
                <div className="tab-toolbar__left">
                  <Input
                    prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                    placeholder="Tìm theo tiêu đề..."
                    value={jobKeyword}
                    onChange={(e) => setJobKeyword(e.target.value)}
                    style={{ width: 260 }}
                    allowClear
                  />
                  <Select
                    value={jobStatus}
                    onChange={setJobStatus}
                    style={{ width: 160 }}
                  >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="active">Đang hiển thị</Option>
                    <Option value="paused">Tạm dừng</Option>
                    <Option value="closed">Đã đóng</Option>
                    <Option value="draft">Nháp</Option>
                  </Select>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingJob(null);
                    setPostModalOpen(true);
                  }}
                  style={{ fontWeight: 700 }}
                >
                  Đăng tin mới
                </Button>
              </div>

              <Table
                dataSource={jobs}
                columns={jobColumns}
                rowKey={(record) => record._id || record.id}
                loading={loadingJobs}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                scroll={{ x: 900 }}
                locale={{
                  emptyText: <Empty description="Chưa có tin tuyển dụng nào" />,
                }}
                className="jobs-table"
              />
            </div>
          )}

          {/* ═══════════ TAB 3: HỒ SƠ ỨNG VIÊN ═══════════ */}
          {activeTab === "applications" && (
            <div className="tab-content">
              {/* Filters */}
              <div className="tab-toolbar">
                <div className="tab-toolbar__left">
                  <Select
                    value={appJobId}
                    onChange={setAppJobId}
                    style={{ width: 260 }}
                    placeholder="Lọc theo tin tuyển dụng"
                  >
                    <Option value="all">Tất cả tin tuyển dụng</Option>
                    {jobs.map((j) => (
                      <Option key={j.id} value={j.id}>
                        {j.title}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    value={appStatus}
                    onChange={setAppStatus}
                    style={{ width: 180 }}
                  >
                    <Option value="all">Tất cả trạng thái</Option>
                    {Object.entries(APP_STATUS_CFG).map(([key, cfg]) => (
                      <Option key={key} value={key}>
                        {cfg.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <span
                  style={{ fontSize: 13.5, color: "#6b7280", fontWeight: 500 }}
                >
                  <TeamOutlined /> {applications.length} hồ sơ
                </span>
              </div>

              {/* Status summary pills */}
              <div className="app-status-summary">
                {Object.entries(APP_STATUS_CFG).map(([key, cfg]) => {
                  const count = applications.filter(
                    (a) => a.status === key,
                  ).length;
                  return (
                    <button
                      key={key}
                      className={`app-status-pill ${appStatus === key ? "active" : ""}`}
                      style={
                        appStatus === key
                          ? {
                              borderColor: cfg.color,
                              color: cfg.color,
                              background: cfg.color + "15",
                            }
                          : {}
                      }
                      onClick={() =>
                        setAppStatus(appStatus === key ? "all" : key)
                      }
                    >
                      <span>{cfg.label}</span>
                      <span className="app-status-pill__count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {loadingApps ? (
                <div className="tab-loading">
                  <Spin size="large" />
                </div>
              ) : applications.length === 0 ? (
                <div className="tab-loading">
                  <Empty
                    description="Không có hồ sơ nào phù hợp"
                    imageStyle={{ height: 80 }}
                  />
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {applications.map((app) => (
                    <Col key={app.id || app._id} xs={24} md={12} xl={8}>
                      <ApplicationCard
                        application={app}
                        onStatusChange={handleAppStatusChange}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}

          {/* ═══════════ TAB 4: HỒ SƠ CÔNG TY ═══════════ */}
          {activeTab === "company" && (
            <div className="tab-content">
              <Row gutter={[24, 24]}>
                {/* Company info card */}
                <Col xs={24} md={8}>
                  <Card
                    bordered={false}
                    className="dashboard-card company-profile-card"
                  >
                    <div className="company-profile-identity">
                      <div className="company-profile-logo-wrap">
                        <img
                          src={companyProfile?.logo}
                          alt={
                            companyProfile?.companyName || companyProfile?.name
                          }
                          className="company-profile-logo"
                          style={{
                            opacity: uploadingLogo ? 0.5 : 1,
                            transition: "opacity 0.3s",
                          }}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyProfile?.companyName || companyProfile?.name || "C")}&background=00b14f&color=fff&size=100`;
                          }}
                        />

                        {/* Nút bấm để chọn ảnh mới */}
                        <button
                          className="profile-avatar-edit" // Tái sử dụng class CSS của User nếu được
                          onClick={() => logoInputRef.current.click()}
                          disabled={uploadingLogo}
                          style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            backgroundColor: "#00b14f",
                            border: "none",
                            borderRadius: "50%",
                            width: 30,
                            height: 30,
                            color: "white",
                            cursor: uploadingLogo ? "wait" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {uploadingLogo ? (
                            <ClockCircleOutlined spin />
                          ) : (
                            <EditOutlined />
                          )}
                        </button>

                        {/* Thẻ input ẩn chứa file */}
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          ref={logoInputRef}
                          onChange={handleLogoChange}
                          style={{ display: "none" }}
                        />
                      </div>
                      <h3 className="company-profile-name">
                        {companyProfile?.companyName || companyProfile?.name}
                      </h3>

                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        block
                        style={{ marginTop: 12, fontWeight: 600 }}
                        onClick={() => {
                          // Chuyển mảng thành chuỗi để hiển thị vào Input
                          const formData = { ...companyProfile };
                          if (Array.isArray(formData.tags))
                            formData.tags = formData.tags.join(", ");
                          if (Array.isArray(formData.whyJoin))
                            formData.whyJoin = formData.whyJoin.join("\n");

                          setProfileForm(formData);
                          setEditProfileOpen(true);
                        }}
                      >
                        Hoàn thiện hồ sơ
                      </Button>
                    </div>

                    <div className="company-profile-stats">
                      {[
                        {
                          icon: "📋",
                          label: "Tin đăng",
                          value: companyProfile?.totalJobs,
                        },
                        {
                          icon: "👥",
                          label: "Ứng viên",
                          value: companyProfile?.totalApplications,
                        },
                        {
                          icon: "🏆",
                          label: "Đã tuyển",
                          value: companyProfile?.totalHired,
                        },
                      ].map((s) => (
                        <div key={s.label} className="company-profile-stat">
                          <span>{s.icon}</span>
                          <span className="company-profile-stat__value">
                            {s.value}
                          </span>
                          <span className="company-profile-stat__label">
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>

                {/* Details */}
                <Col xs={24} md={16}>
                  <Card
                    bordered={false}
                    className="dashboard-card"
                    title="Thông tin công ty"
                  >
                    <div className="company-detail-grid">
                      {[
                        {
                          icon: <GlobalOutlined />,
                          label: "Website",
                          value: companyProfile?.website,
                        },
                        {
                          icon: <MailOutlined />,
                          label: "Email",
                          value: companyProfile?.email,
                        },
                        {
                          icon: <PhoneOutlined />,
                          label: "Điện thoại",
                          value: companyProfile?.phone,
                        },
                        {
                          icon: <EnvironmentOutlined />,
                          label: "Địa chỉ",
                          value: companyProfile?.address,
                        },
                        {
                          icon: <EnvironmentOutlined />,
                          label: "Khu vực",
                          value: companyProfile?.location,
                        },
                        {
                          icon: <BankOutlined />,
                          label: "Lĩnh vực",
                          value: companyProfile?.industry,
                        },
                        {
                          icon: <TeamOutlined />,
                          label: "Quy mô",
                          value: companyProfile?.size,
                        },
                        {
                          icon: <CalendarOutlined />,
                          label: "Thành lập",
                          value: companyProfile?.founded,
                        },
                        {
                          icon: <StarFilled />,
                          label: "Tags",
                          value: Array.isArray(companyProfile?.tags)
                            ? companyProfile.tags.join(", ")
                            : companyProfile?.tags,
                        },
                      ].map((row) => (
                        <div key={row.label} className="company-detail-row">
                          <div className="company-detail-row__icon">
                            {row.icon}
                          </div>
                          <div className="company-detail-row__label">
                            {row.label}
                          </div>
                          <div className="company-detail-row__value">
                            {row.value || "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card
                    bordered={false}
                    className="dashboard-card"
                    title="Giới thiệu công ty"
                    style={{ marginTop: 16 }}
                  >
                    {/* ĐOẠN ẨN / HIỆN MÔ TẢ CÔNG TY */}
                    <div style={{ position: "relative" }}>
                      <p
                        className="company-profile-description"
                        style={{
                          fontSize: 14.5,
                          color: "#374151",
                          lineHeight: 1.8,
                          // Sử dụng CSS để cắt chữ nếu chưa mở rộng
                          display: isDescExpanded ? "block" : "-webkit-box",
                          WebkitLineClamp: isDescExpanded ? "unset" : 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          whiteSpace: "pre-line", // Giữ nguyên khoảng trắng và xuống dòng
                        }}
                      >
                        {companyProfile?.description ||
                          "Chưa có mô tả công ty."}
                      </p>

                      {companyProfile?.description &&
                        companyProfile.description.length > 200 && (
                          <div style={{ textAlign: "center", marginTop: 10 }}>
                            <Button
                              type="link"
                              onClick={() => setIsDescExpanded(!isDescExpanded)}
                              style={{ fontWeight: 600 }}
                            >
                              {isDescExpanded ? "Thu gọn" : "Xem thêm"}
                            </Button>
                          </div>
                        )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </div>{" "}
      </div>{" "}
      {/* 2. ĐÓNG CHUẨN: .container */}
      {/* Post Job Modal */}
      <PostJobModal
        open={postModalOpen}
        onClose={() => {
          setPostModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handlePostJob}
        initialData={editingJob}
        loading={postingJob}
      />
      {/* Edit Company Profile Modal */}
      <Modal
        title={
          <span style={{ fontSize: 17, fontWeight: 700 }}>
            <BankOutlined
              style={{ color: "var(--color-primary)", marginRight: 8 }}
            />
            {"Chỉnh sửa hồ sơ công ty"}
          </span>
        }
        open={editProfileOpen}
        onCancel={() => setEditProfileOpen(false)}
        onOk={handleSaveCompanyProfile}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        confirmLoading={savingProfile}
        width={700} // Tăng độ rộng vì có nhiều trường
        destroyOnClose
      >
        <Row gutter={16} style={{ marginTop: 16 }}>
          {/* CỘT TRÁI */}
          <Col
            span={12}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label className="form-label">Tên công ty *</label>
              <Input
                value={profileForm.companyName || profileForm.name || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    companyName: e.target.value,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="form-label">Ngành nghề *</label>
              <Input
                placeholder="VD: Công nghệ thông tin"
                value={profileForm.industry || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, industry: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Quy mô nhân sự *</label>
              <Input
                placeholder="VD: 100-500 nhân viên"
                value={profileForm.size || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, size: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Năm thành lập</label>
              <Input
                placeholder="VD: 2015"
                value={profileForm.founded || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, founded: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Khu vực (Tỉnh/Thành phố) *</label>
              <Input
                placeholder="VD: Hà Nội"
                value={profileForm.location || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, location: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Địa chỉ chi tiết</label>
              <Input
                value={profileForm.address || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, address: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Tags (Lĩnh vực chuyên sâu)</label>
              <Input
                placeholder="Cách nhau bằng dấu phẩy. VD: IT, Cloud, AI"
                value={profileForm.tags || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, tags: e.target.value })
                }
              />
            </div>
          </Col>

          {/* CỘT PHẢI */}
          <Col
            span={12}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label className="form-label">Link Logo</label>
              <Input
                placeholder="https://..."
                value={profileForm.logo || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, logo: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Link Ảnh Cover</label>
              <Input
                placeholder="https://..."
                value={profileForm.cover || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, cover: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Website</label>
              <Input
                value={profileForm.website || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, website: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Email liên hệ</label>
              <Input
                value={profileForm.email || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Điện thoại</label>
              <Input
                value={profileForm.phone || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
              />
            </div>
          </Col>

          {/* FULL CHIỀU RỘNG */}
          <Col
            span={24}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 14,
            }}
          >
            <div>
              <label className="form-label">
                Tại sao nên gia nhập? (Why Join)
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Mỗi lý do viết trên 1 dòng..."
                value={profileForm.whyJoin || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, whyJoin: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Giới thiệu công ty</label>
              <Input.TextArea
                rows={5}
                value={profileForm.description || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </Col>
        </Row>

        {/* Style nhỏ để label đẹp hơn */}
        <style>{`
            .form-label { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 5px; }
          `}</style>
      </Modal>
    </div>
  );
};

export default EmployerDashboardPage;
