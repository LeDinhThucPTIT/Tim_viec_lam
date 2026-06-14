// ===========================
// pages/BecomeEmployerPage.jsx
// ===========================

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import {
  HomeOutlined,
  UserAddOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import "./NotFoundPage.css"; // reuse luôn CSS cho nhanh 😏

const BecomeEmployerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-page__inner">
        <div className="notfound-code">🚀</div>
        <div className="notfound-emoji">💼</div>

        <h1 className="notfound-title">Bạn muốn tuyển dụng?</h1>

        <p className="notfound-desc">
          Có vẻ bạn đang cố truy cập khu vực dành cho nhà tuyển dụng. Nếu bạn
          muốn đăng tin tuyển dụng, quản lý ứng viên và xây dựng đội ngũ, hãy
          đăng ký tài khoản nhà tuyển dụng ngay nhé!
        </p>

        <div className="notfound-actions">
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            onClick={() => navigate("/register")}
            style={{ fontWeight: 700, height: 48, paddingInline: 32 }}
          >
            Đăng ký nhà tuyển dụng
          </Button>

          <Button
            size="large"
            icon={<RocketOutlined />}
            onClick={() => navigate("/upgrade-to-employer")}
            style={{ height: 48, paddingInline: 32, fontWeight: 600 }}
          >
            Nâng cấp tài khoản
          </Button>

          <Button
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            style={{ height: 48, paddingInline: 32 }}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BecomeEmployerPage;
