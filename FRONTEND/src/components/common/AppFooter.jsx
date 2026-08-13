// ===========================
// footer chính của ứng dụng
// ===========================

import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import {
  FacebookOutlined,
  LinkedinOutlined,
  YoutubeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import './AppFooter.css';

const footerLinks = {
  candidates: [
    { label: 'Tìm việc làm', to: '/jobs' },
    { label: 'Tạo CV online', to: '/cv' },
    { label: 'Hồ sơ của tôi', to: '/profile' },
    { label: 'Việc làm đã lưu', to: '/profile' },
    { label: 'Thông báo việc làm', to: '/profile' },
  ],
  employers: [
    { label: 'Đăng tin tuyển dụng', to: '/employer/dashboard' },
    { label: 'Tìm hồ sơ ứng viên', to: '/employer/candidates' },
    { label: 'Quản lý tin đăng', to: '/employer/dashboard' },
    { label: 'Bảng giá dịch vụ', to: '/pricing' },
  ],
  about: [
    { label: 'Về chúng tôi', to: '/about' },
    { label: 'Blog nghề nghiệp', to: '/blog' },
    { label: 'Điều khoản dịch vụ', to: '/terms' },
    { label: 'Chính sách bảo mật', to: '/privacy' },
    { label: 'Liên hệ', to: '/contact' },
  ],
};

const AppFooter = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="app-footer__top">
          <Row gutter={[48, 40]}>
            {/* Brand */}
            <Col xs={24} sm={24} md={8} lg={7}>
              <div className="footer-brand">
                <Link to="/" className="footer-logo">
                  <span className="logo-top">Top</span>
                  <span className="logo-cv">CV</span>
                </Link>
                <p className="footer-tagline">
                  Nền tảng kết nối việc làm hàng đầu Việt Nam, nơi ứng viên và nhà tuyển dụng gặp nhau.
                </p>
                <div className="footer-contact">
                  <div className="footer-contact-item">
                    <PhoneOutlined />
                    <span>1800 6242</span>
                  </div>
                  <div className="footer-contact-item">
                    <MailOutlined />
                    <span>support@topcv.vn</span>
                  </div>
                  <div className="footer-contact-item">
                    <EnvironmentOutlined />
                    <span>Tầng 14, Tòa nhà HM, Hà Nội</span>
                  </div>
                </div>
                <div className="footer-socials">
                  <a href="#" className="footer-social-btn" aria-label="Facebook">
                    <FacebookOutlined />
                  </a>
                  <a href="#" className="footer-social-btn" aria-label="LinkedIn">
                    <LinkedinOutlined />
                  </a>
                  <a href="#" className="footer-social-btn" aria-label="YouTube">
                    <YoutubeOutlined />
                  </a>
                </div>
              </div>
            </Col>

            {/* Candidate Links */}
            <Col xs={12} sm={8} md={5} lg={5}>
              <div className="footer-nav">
                <h4 className="footer-nav__title">Ứng viên</h4>
                <ul className="footer-nav__list">
                  {footerLinks.candidates.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Employer Links */}
            <Col xs={12} sm={8} md={5} lg={5}>
              <div className="footer-nav">
                <h4 className="footer-nav__title">Nhà tuyển dụng</h4>
                <ul className="footer-nav__list">
                  {footerLinks.employers.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* About Links */}
            <Col xs={12} sm={8} md={6} lg={7}>
              <div className="footer-nav">
                <h4 className="footer-nav__title">Về TopCV</h4>
                <ul className="footer-nav__list">
                  {footerLinks.about.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        </div>

        <div className="app-footer__bottom">
          <p>© {new Date().getFullYear()} TopCV Clone. Dự án học tập - Không phải sản phẩm thương mại.</p>
          <p>Xây dựng với React + Ant Design + Node.js</p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
