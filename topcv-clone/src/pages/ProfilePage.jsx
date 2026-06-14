// ==========================================
// pages/ProfilePage.jsx
// Trang hồ sơ ứng viên
// ==========================================

import React, { useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Avatar,
  Tag,
  Tabs,
  Form,
  Input,
  Select,
  message,
  Modal,
  Divider,
  Empty,
  Progress,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  LinkedinOutlined,
  GithubOutlined,
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/authService";
import JobCard from "../components/job/JobCard";
import "./ProfilePage.css";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

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
  "Docker",
  "Figma",
  "Git",
];

const ProfileCompletion = ({ user }) => {
  const fields = [
    { label: "Ảnh đại diện", done: !!user?.avatar },
    { label: "Giới thiệu bản thân", done: !!user?.headline },
    { label: "Số điện thoại", done: !!user?.phone },
    { label: "Địa điểm", done: !!user?.location },
    { label: "Kỹ năng", done: user?.skills?.length > 0 },
    { label: "Kinh nghiệm", done: !!user?.experience },
    { label: "Học vấn", done: !!user?.education },
  ];
  const done = fields.filter((f) => f.done).length;
  const percent = Math.round((done / fields.length) * 100);

  return (
    <div className="profile-completion">
      <div className="profile-completion__header">
        <span className="profile-completion__label">Độ hoàn thiện hồ sơ</span>
        <span className="profile-completion__percent">{percent}%</span>
      </div>
      <Progress
        percent={percent}
        strokeColor={{ "0%": "#00b14f", "100%": "#00802e" }}
        trailColor="#e5e7eb"
        showInfo={false}
        strokeWidth={8}
        style={{ borderRadius: 4 }}
      />
      <div className="profile-completion__items">
        {fields.map((f) => (
          <div
            key={f.label}
            className={`completion-item ${f.done ? "done" : ""}`}
          >
            {f.done ? (
              <CheckCircleFilled style={{ color: "#00b14f" }} />
            ) : (
              <div className="completion-item__dot" />
            )}
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // chúng ta rút thẳng mảng ra từ đối tượng user, tránh dùng hàm .filter bừa bãi gây lỗi.
  const appliedJobs = user?.appliedJobs || [];
  const savedJobs = user?.savedJobs || [];

  const handleEditProfile = () => {
    form.setFieldsValue({
      name: user?.name,
      phone: user?.phone,
      location: user?.location,
      headline: user?.headline,
      education: user?.education,
      experience: user?.experience,
      skills: user?.skills || [],
      linkedin: user?.linkedin,
      github: user?.github,
      bio: user?.bio,
    });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (values) => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile(values);
      updateUser(updated);
      message.success("Cập nhật hồ sơ thành công!");
      setEditModalOpen(false);
    } catch {
      message.error("Lưu thất bại, thử lại sau");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    setSaving(true);
    try {
      await authService.changePassword(values);
      message.success("Đổi mật khẩu thành công!");
      setPwdModalOpen(false);
      pwdForm.resetFields();
    } catch (err) {
      message.error(err.message || "Đổi mật khẩu thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Hàm xử lý khi người dùng chọn file ảnh
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Chuẩn bị form data
    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      // Lưu ý: Lấy token theo cách dự án của bạn đang làm (vd: từ localStorage)
      const token = localStorage.getItem("token");

      // Nhớ thay đổi đường dẫn URL cho khớp với route backend của bạn nhé
      const response = await fetch("http://localhost:5000/auth/update-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Cập nhật ảnh đại diện thành công!");
        // Đồng bộ ngay lập tức dữ liệu user mới vào Context (Navbar sẽ tự động đổi ảnh)
        updateUser(data.user);
      } else {
        message.error(data.message || "Tải ảnh thất bại!");
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      message.error("Lỗi kết nối đến máy chủ!");
    } finally {
      setUploadingAvatar(false);
      // Reset input để có thể chọn lại cùng 1 ảnh nếu muốn
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <div className="container">
          <h1 className="profile-page-header__title">Hồ sơ của tôi</h1>
        </div>
      </div>

      <div className="container">
        <Row gutter={[24, 24]} className="profile-layout">
          {/* Sidebar */}
          <Col xs={24} md={8} lg={7}>
            <Card className="profile-identity-card" bordered={false}>
              <div className="profile-avatar-wrap">
                <Avatar
                  size={96}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{
                    background: "linear-gradient(135deg, #00b14f, #007a36)",
                    fontSize: 40,
                    // Thêm hiệu ứng mờ khi đang tải ảnh
                    opacity: uploadingAvatar ? 0.5 : 1,
                    transition: "opacity 0.3s",
                  }}
                />

                {/* 1. Thêm sự kiện onClick vào nút Edit */}
                <button
                  className="profile-avatar-edit"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingAvatar}
                  style={{ cursor: uploadingAvatar ? "wait" : "pointer" }}
                >
                  {/* Hiển thị icon xoay xoay nếu đang upload */}
                  {uploadingAvatar ? (
                    <ClockCircleOutlined spin />
                  ) : (
                    <EditOutlined />
                  )}
                </button>

                {/* 2. Thêm thẻ input ẩn ở ngay dưới */}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <button
                  className="profile-avatar-edit"
                  onClick={() => fileInputRef.current.click()} // Thêm dòng này để gọi thẻ input ẩn
                  disabled={uploadingAvatar} // (Tùy chọn) Khóa nút khi đang tải ảnh
                  style={{ cursor: uploadingAvatar ? "wait" : "pointer" }}
                >
                  {uploadingAvatar ? (
                    <ClockCircleOutlined spin />
                  ) : (
                    <EditOutlined />
                  )}
                </button>

                {/* Đảm bảo thẻ input này nằm ngay bên dưới (hoặc đâu đó trong cùng component) */}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-headline">
                {user?.headline || "Thêm tiêu đề nghề nghiệp"}
              </p>

              <div className="profile-contact-list">
                <div className="profile-contact-item">
                  <MailOutlined />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="profile-contact-item">
                    <PhoneOutlined />
                    <span>{user?.phone}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="profile-contact-item">
                    <EnvironmentOutlined />
                    <span>{user?.location}</span>
                  </div>
                )}
              </div>

              <div className="profile-card-actions">
                <Button
                  type="primary"
                  block
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                  style={{ fontWeight: 600 }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
                <Button
                  block
                  icon={<LockOutlined />}
                  onClick={() => setPwdModalOpen(true)}
                  style={{ fontWeight: 600 }}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </Card>

            <Card
              className="profile-side-card"
              bordered={false}
              style={{ marginTop: 16 }}
            >
              <ProfileCompletion user={user} />
            </Card>
          </Col>

          {/* Main content */}
          <Col xs={24} md={16} lg={17}>
            <Card bordered={false} className="profile-main-card">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                {/* Tab 1: Profile info */}
                <TabPane
                  tab={
                    <span>
                      <UserOutlined /> Thông tin
                    </span>
                  }
                  key="profile"
                >
                  <div className="profile-sections">
                    <div className="profile-section">
                      <div className="profile-section__header">
                        <h3 className="profile-section__title">
                          Giới thiệu bản thân
                        </h3>
                      </div>
                      <p className="profile-section__content">
                        {user?.bio || (
                          <span className="profile-empty-text">
                            Chưa có giới thiệu. Hãy viết vài dòng về bản thân để
                            nhà tuyển dụng hiểu bạn hơn.
                          </span>
                        )}
                      </p>
                    </div>

                    <Divider />

                    <div className="profile-section">
                      <div className="profile-section__header">
                        <h3 className="profile-section__title">
                          <TrophyOutlined /> Kỹ năng
                        </h3>
                      </div>
                      <div className="profile-skills">
                        {user?.skills?.length > 0 ? (
                          user.skills.map((skill) => (
                            <Tag
                              key={skill}
                              color="green"
                              style={{
                                padding: "4px 12px",
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                              }}
                            >
                              {skill}
                            </Tag>
                          ))
                        ) : (
                          <span className="profile-empty-text">
                            Chưa thêm kỹ năng
                          </span>
                        )}
                      </div>
                    </div>

                    <Divider />

                    <div className="profile-section">
                      <div className="profile-section__header">
                        <h3 className="profile-section__title">
                          <BookOutlined /> Học vấn
                        </h3>
                      </div>
                      {user?.education ? (
                        <div className="profile-edu-item">
                          <div className="profile-edu-dot"></div>
                          <div>
                            <div className="profile-edu-school">
                              {user.education}
                            </div>
                            <div className="profile-edu-degree">
                              Cử nhân / Kỹ sư chuyên ngành
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="profile-empty-text">
                          Chưa thêm học vấn
                        </span>
                      )}
                    </div>

                    <Divider />

                    <div className="profile-section">
                      <div className="profile-section__header">
                        <h3 className="profile-section__title">
                          <FileTextOutlined /> Kinh nghiệm làm việc
                        </h3>
                      </div>
                      {user?.experience ? (
                        <div className="profile-exp-item">
                          <div className="profile-edu-dot"></div>
                          <div>
                            <div className="profile-edu-school">
                              Kinh nghiệm tích lũy
                            </div>
                            <div className="profile-edu-degree">
                              Thời gian: {user.experience}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="profile-empty-text">
                          Chưa thêm kinh nghiệm
                        </span>
                      )}
                    </div>
                  </div>
                </TabPane>

                {/* Tab 2: Applied jobs */}
                <TabPane
                  tab={
                    <span>
                      <FileTextOutlined /> Đã ứng tuyển ({appliedJobs.length})
                    </span>
                  }
                  key="applied"
                >
                  {appliedJobs.length === 0 ? (
                    <div className="profile-tab-empty">
                      <Empty
                        description="Bạn chưa ứng tuyển vào vị trí nào"
                        imageStyle={{ height: 80 }}
                      >
                        <Button type="primary" href="/jobs">
                          Tìm việc ngay
                        </Button>
                      </Empty>
                    </div>
                  ) : (
                    <div className="profile-applied-list">
                      {appliedJobs.map((job) => (
                        <div
                          key={job._id || job.id}
                          className="applied-job-item"
                          style={{ marginBottom: 16 }}
                        >
                          {/* Sửa từ job.id sang job._id vì MongoDB sử dụng _id */}
                          <JobCard job={job} />
                          <div
                            className="applied-job-status"
                            style={{
                              marginTop: 8,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span className="applied-status-badge applied-status-badge--pending">
                              <ClockCircleOutlined /> Đang chờ xét duyệt
                            </span>
                            <span
                              className="applied-date"
                              style={{ color: "#8c8c8c" }}
                            >
                              Trạng thái: Realtime từ Hệ thống
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabPane>

                {/* Tab 3: Saved jobs */}
                <TabPane
                  tab={
                    <span>
                      <BookOutlined /> Đã lưu ({savedJobs.length})
                    </span>
                  }
                  key="saved"
                >
                  {savedJobs.length === 0 ? (
                    <div className="profile-tab-empty">
                      <Empty
                        description="Bạn chưa lưu việc làm nào"
                        imageStyle={{ height: 80 }}
                      >
                        <Button type="primary" href="/jobs">
                          Khám phá việc làm
                        </Button>
                      </Empty>
                    </div>
                  ) : (
                    <Row gutter={[16, 16]}>
                      {savedJobs.map((job) => (
                        <Col key={job._id || job.id} xs={24} sm={12}>
                          <JobCard job={job} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 700 }}>Chỉnh sửa hồ sơ</span>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Divider />
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="headline" label="Tiêu đề nghề nghiệp">
            <Input
              placeholder="VD: Frontend Developer với 3 năm kinh nghiệm"
              size="large"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="Địa điểm">
                <Select size="large">
                  {[
                    "Hà Nội",
                    "Hồ Chí Minh",
                    "Đà Nẵng",
                    "Cần Thơ",
                    "Bình Dương",
                  ].map((l) => (
                    <Option key={l} value={l}>
                      {l}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="experience" label="Kinh nghiệm">
                <Select size="large">
                  {[
                    "Dưới 1 năm",
                    "1-2 năm",
                    "2-3 năm",
                    "3-5 năm",
                    "5+ năm",
                  ].map((e) => (
                    <Option key={e} value={e}>
                      {e}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="education" label="Học vấn">
            <Input
              placeholder="VD: Học viện Công nghệ Bưu chính Viễn thông"
              size="large"
            />
          </Form.Item>
          <Form.Item name="skills" label="Kỹ năng">
            <Select mode="tags" size="large" placeholder="Thêm kỹ năng của bạn">
              {SKILL_OPTIONS.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="bio" label="Giới thiệu bản thân">
            <TextArea
              rows={4}
              placeholder="Mô tả ngắn về bản thân, mục tiêu nghề nghiệp..."
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="linkedin" label="LinkedIn">
                <Input
                  prefix={<LinkedinOutlined />}
                  placeholder="linkedin.com/in/..."
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="github" label="GitHub">
                <Input
                  prefix={<GithubOutlined />}
                  placeholder="github.com/..."
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button size="large" onClick={() => setEditModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saving}
              style={{ fontWeight: 700 }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 700 }}>Đổi mật khẩu</span>
        }
        open={pwdModalOpen}
        onCancel={() => setPwdModalOpen(false)}
        footer={null}
        width={440}
        destroyOnClose
      >
        <Divider />
        <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="oldPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải dài tối thiểu 6 ký tự!" },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Tối thiểu 6 ký tự"
            />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button size="large" onClick={() => setPwdModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saving}
              style={{ fontWeight: 700 }}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
