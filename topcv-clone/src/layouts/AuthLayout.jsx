// ===========================
// layouts/AuthLayout.jsx
// Layout đơn giản cho trang Login/Register
// ===========================

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-top">Top</span>
            <span className="auth-logo-cv">CV</span>
          </Link>
          <div className="auth-sidebar-text">
            <h2>Kết nối ứng viên <br />với nhà tuyển dụng</h2>
            <p>Hàng triệu cơ hội việc làm đang chờ đón bạn. Hãy bắt đầu hành trình sự nghiệp của bạn ngay hôm nay.</p>
          </div>
          <div className="auth-sidebar-stats">
            <div className="auth-stat">
              <span className="auth-stat-number">125K+</span>
              <span className="auth-stat-label">Việc làm</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-number">18K+</span>
              <span className="auth-stat-label">Công ty</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-number">980K+</span>
              <span className="auth-stat-label">Ứng viên</span>
            </div>
          </div>
          <div className="auth-decoration">
            <div className="auth-blob auth-blob-1"></div>
            <div className="auth-blob auth-blob-2"></div>
          </div>
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-form-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
