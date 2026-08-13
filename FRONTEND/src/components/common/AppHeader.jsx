// ===========================
// Header chính của ứng dụng
// ===========================

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Dropdown, Avatar, Badge } from "antd";
import {
  UserOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
  CaretDownOutlined,
  FileTextOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import "./AppHeader.css";

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isEmployer, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ sơ của tôi</Link>,
    },
    ...(isEmployer
      ? [
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: <Link to="/employer/dashboard">Quản lý tin tuyển dụng</Link>,
          },
        ]
      : [
          {
            key: "applied",
            icon: <FileTextOutlined />,
            label: <Link to="/profile">Việc làm đã ứng tuyển</Link>,
          },
          {
            key: "saved",
            icon: <BookOutlined />,
            label: <Link to="/profile">Việc làm đã lưu</Link>,
          },
        ]),
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const navLinks = [
    { to: "/jobs", label: "Việc làm" },
    { to: "/companies", label: "Công ty" },
    { to: "/cv", label: "Tạo CV" },
    { to: "/cvscoring", label: "Chấm điểm CV" },
    { to: "/employer/dashboard", label: "Nhà tuyển dụng" },
  ];

  return (
    <header className={`app-header ${scrolled ? "app-header--scrolled" : ""}`}>
      <div className="container app-header__inner">
        {/* Logo */}
        <Link to="/" className="app-header__logo">
          <span className="logo-top">Top</span>
          <span className="logo-cv">CV</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="app-header__nav">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`app-header__nav-link ${location.pathname === link.to ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="app-header__actions">
          {isAuthenticated ? (
            <>
              <Badge count={3} size="small">
                <button className="app-header__icon-btn">
                  <BellOutlined />
                </button>
              </Badge>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="app-header__user">
                  <Avatar
                    size={34}
                    src={user?.avatar}
                    icon={!user?.avatar ? <UserOutlined /> : null}
                    style={{
                      backgroundColor: user?.avatar ? undefined : "#00b14f",
                      cursor: "pointer",
                    }}
                  />
                  <div className="app-header__user-info">
                    <span className="app-header__user-name">
                      {user?.name?.split(" ").slice(-1)[0]}
                    </span>
                    <CaretDownOutlined
                      style={{ fontSize: 10, color: "#6b7280" }}
                    />
                  </div>
                </div>
              </Dropdown>
            </>
          ) : (
            <>
              <Button
                type="text"
                onClick={() => navigate("/login")}
                className="app-header__btn-login"
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                onClick={() => navigate("/register")}
                className="app-header__btn-register"
              >
                Đăng ký
              </Button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="app-header__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="app-header__mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="app-header__mobile-link"
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="app-header__mobile-auth">
              <Button block onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
              <Button
                type="primary"
                block
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AppHeader;
