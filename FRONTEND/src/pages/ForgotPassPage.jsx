import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Divider, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import authService from "../services/authService"; // Import file service của bạn

const ForgotPassPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");

  // Xử lý Bước 1: Gửi email lấy OTP
  const handleSendOTP = async (values) => {
    setLoading(true);
    try {
      const res = await authService.sendOtp(values.email);
      message.success(
        res.data?.message || "Đã gửi mã xác nhận đến email của bạn!",
      );
      setSavedEmail(values.email);
      setStep(2);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể gửi email. Vui lòng kiểm tra lại!",
      );
      console.error("Error sending OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Bước 2: Xác nhận OTP và Pass mới
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: savedEmail,
        otp: values.otp,
        newPassword: values.password,
      };
      const res = await authService.resetPasswordOtp(payload);
      message.success(res.data?.message || "Đổi mật khẩu thành công!");

      // Đổi thành công thì chuyển về trang Login
      navigate("/login");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h1 className="auth-page__title">Khôi phục mật khẩu</h1>
        <p className="auth-page__subtitle">
          Đã nhớ mật khẩu?{" "}
          <Link to="/login" className="auth-link">
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        // Dựa vào step để quyết định gọi hàm nào khi submit
        onFinish={step === 1 ? handleSendOTP : handleResetPassword}
        className="auth-form"
      >
        {/* ================= BƯỚC 1: NHẬP EMAIL ================= */}
        {step === 1 && (
          <>
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
                placeholder="Nhập email đã đăng ký..."
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
                Nhận mã xác nhận
              </Button>
            </Form.Item>
          </>
        )}

        {/* ================= BƯỚC 2: NHẬP OTP & PASS MỚI ================= */}
        {step === 2 && (
          <>
            <Form.Item
              name="otp"
              label="Mã xác nhận (OTP)"
              rules={[{ required: true, message: "Vui lòng nhập mã OTP" }]}
            >
              <Input
                prefix={
                  <SafetyCertificateOutlined className="auth-input-icon" />
                }
                placeholder="Nhập mã 6 số trong email"
                size="large"
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="auth-input-icon" />}
                placeholder="Nhập mật khẩu mới"
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

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="auth-input-icon" />}
                placeholder="Nhập lại mật khẩu mới"
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

            <Form.Item style={{ marginBottom: 15 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="auth-submit-btn"
              >
                Xác nhận đổi mật khẩu
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => setStep(1)}
                className="auth-link"
              >
                Quay lại nhập email khác
              </Button>
            </div>
          </>
        )}
      </Form>

      <Divider className="auth-divider" />

      <p className="auth-terms">
        Bạn cần hỗ trợ? Vui lòng liên hệ với{" "}
        <Link to="/contact" className="auth-link">
          Bộ phận CSKH
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassPage;
