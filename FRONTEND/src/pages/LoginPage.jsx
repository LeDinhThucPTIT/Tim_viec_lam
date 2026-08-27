// ===========================
// pages/LoginPage.jsx
// ===========================

import React, { useState } from "react";
import "./AuthPages.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, Checkbox, Divider, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  GoogleOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import "./AuthPages.css";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import apiClient from "../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const userData = await login(values);

      message.success("Đăng nhập thành công! Chào mừng bạn trở lại 👋");

      const isEmployer = userData?.role === "employer";

      // Nếu là nhà tuyển dụng thì trang mặc định là dashboard, ngược lại là trang chủ
      const defaultPath = isEmployer ? "/employer/dashboard" : "/";

      const fromPath = location.state?.from?.pathname;
      const targetPath = fromPath && fromPath !== "/" ? fromPath : defaultPath;

      navigate(targetPath, { replace: true });
    } catch (err) {
      message.error(
        err.message || "Đăng nhập thất bại, kiểm tra lại thông tin",
      );
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        message.loading({
          content: "Đang xác thực với Google...",
          key: "google-login",
        });

        // Gọi xuống API Backend của bạn để đổi Code lấy Token
        const res = await apiClient.post("/auth/google", {
          code: codeResponse.code,
        });

        // Backend trả về JWT của hệ thống, lưu vào localStorage
        const systemToken = res.data.token;
        const userData = res.data.user;
        localStorage.setItem("token", systemToken);

        message.success({
          content: "Đăng nhập Google thành công!",
          key: "google-login",
        });

        // Logic điều hướng sau khi login thành công
        const isEmployer = userData?.role === "employer";
        const defaultPath = isEmployer ? "/employer/dashboard" : "/";
        const fromPath = location.state?.from?.pathname;
        const targetPath =
          fromPath && fromPath !== "/" ? fromPath : defaultPath;

        window.location.href = targetPath;
      } catch (err) {
        console.error(err);
        message.error({
          content: "Lỗi xác thực từ máy chủ!",
          key: "google-login",
        });
      }
    },
    onError: () => message.error("Đăng nhập Google bị hủy hoặc thất bại"),
  });

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h1 className="auth-page__title">Đăng nhập</h1>
        <p className="auth-page__subtitle">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="auth-link">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="auth-form"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="auth-input-icon" />}
            placeholder="email@example.com"
            size="large"
            className="auth-input"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="auth-input-icon" />}
            placeholder="Nhập mật khẩu"
            size="large"
            className="auth-input"
            iconRender={(visible) =>
              visible ? (
                <EyeTwoTone twoToneColor="#00b14f" />
              ) : (
                <EyeInvisibleOutlined />
              )
            }
          />
        </Form.Item>

        <div className="auth-form__remember">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" className="auth-link auth-link--small">
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            className="auth-submit-btn"
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider className="auth-divider">
        <span className="auth-divider-text">Hoặc đăng nhập bằng</span>
      </Divider>

      <div className="auth-social-btns">
        <Button
          icon={<GoogleOutlined />}
          size="large"
          block
          className="auth-social-btn auth-social-btn--google"
          onClick={() => loginWithGoogle()}
        >
          Google
        </Button>
        <Button
          icon={<GithubOutlined />}
          size="large"
          block
          className="auth-social-btn auth-social-btn--github"
          onClick={() => message.info("Tính năng sắp ra mắt")}
        >
          GitHub
        </Button>
      </div>

      <p className="auth-terms">
        Bằng cách đăng nhập, bạn đồng ý với{" "}
        <Link to="/terms" className="auth-link">
          Điều khoản sử dụng
        </Link>{" "}
        và{" "}
        <Link to="/privacy" className="auth-link">
          Chính sách bảo mật
        </Link>{" "}
        của chúng tôi.
      </p>
    </div>
  );
};

export default LoginPage;
