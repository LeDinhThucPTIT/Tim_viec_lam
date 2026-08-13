// ===========================
// pages/RegisterPage.jsx
// ===========================

import React, { useState } from "react";
import "./AuthPages.css";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Divider, message, Radio } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  GoogleOutlined,
  TeamOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("candidate");
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        { name: "confirmPassword", errors: ["Mật khẩu xác nhận không khớp"] },
      ]);
      return;
    }
    setLoading(true);
    try {
      await register({ ...values, role });
      message.success("Đăng ký thành công! Chào mừng bạn đến với TopCV 🎉");
      navigate(role === "employer" ? "/employer/dashboard" : "/");
    } catch (err) {
      message.error(err.message || "Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h1 className="auth-page__title">Tạo tài khoản</h1>
        <p className="auth-page__subtitle">
          Đã có tài khoản?{" "}
          <Link to="/login" className="auth-link">
            Đăng nhập
          </Link>
        </p>
      </div>

      {/* Role selector */}
      <div className="register-role-selector">
        <div
          className={`role-option ${role === "candidate" ? "active" : ""}`}
          onClick={() => setRole("candidate")}
        >
          <SolutionOutlined className="role-option__icon" />
          <div>
            <div className="role-option__label">Ứng viên</div>
            <div className="role-option__desc">Tìm kiếm việc làm</div>
          </div>
        </div>
        <div
          className={`role-option ${role === "employer" ? "active" : ""}`}
          onClick={() => setRole("employer")}
        >
          <TeamOutlined className="role-option__icon" />
          <div>
            <div className="role-option__label">Nhà tuyển dụng</div>
            <div className="role-option__desc">Đăng tin tuyển dụng</div>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="auth-form"
      >
        <Form.Item
          // Nếu là employer thì gửi biến 'companyName', ngược lại gửi 'name'
          name={role === "employer" ? "companyName" : "name"}
          label={role === "employer" ? "Tên công ty" : "Họ và tên"}
          rules={[{ required: true, message: "Vui lòng nhập thông tin này" }]}
        >
          <Input
            prefix={<UserOutlined className="auth-input-icon" />}
            placeholder={
              role === "employer" ? "Tên công ty của bạn" : "Nguyễn Văn A"
            }
            size="large"
            className="auth-input"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="auth-input-icon" />}
            placeholder="email@example.com"
            size="large"
            className="auth-input"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^[0-9]{10,11}$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="auth-input-icon" />}
            placeholder="0912345678"
            size="large"
            className="auth-input"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Mật khẩu phải từ 6 ký tự" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="auth-input-icon" />}
            placeholder="Tối thiểu 6 ký tự"
            size="large"
            className="auth-input"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="auth-input-icon" />}
            placeholder="Nhập lại mật khẩu"
            size="large"
            className="auth-input"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            className="auth-submit-btn"
          >
            Tạo tài khoản
          </Button>
        </Form.Item>
      </Form>

      <Divider className="auth-divider">
        <span className="auth-divider-text">Hoặc đăng ký bằng</span>
      </Divider>

      <div className="auth-social-btns">
        <Button
          icon={<GoogleOutlined />}
          size="large"
          block
          className="auth-social-btn auth-social-btn--google"
          onClick={() => message.info("Tính năng sắp ra mắt")}
        >
          Google
        </Button>
      </div>

      <p className="auth-terms">
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <Link to="/terms" className="auth-link">
          Điều khoản sử dụng
        </Link>{" "}
        và{" "}
        <Link to="/privacy" className="auth-link">
          Chính sách bảo mật
        </Link>
        .
      </p>
    </div>
  );
};

export default RegisterPage;
