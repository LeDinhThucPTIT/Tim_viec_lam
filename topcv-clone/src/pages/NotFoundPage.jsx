// ===========================
// pages/NotFoundPage.jsx
// ===========================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { HomeOutlined, SearchOutlined } from '@ant-design/icons';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="notfound-page">
      <div className="notfound-page__inner">
        <div className="notfound-code">404</div>
        <div className="notfound-emoji">🔍</div>
        <h1 className="notfound-title">Trang không tồn tại</h1>
        <p className="notfound-desc">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc tạm thời không khả dụng.
        </p>
        <div className="notfound-actions">
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{ fontWeight: 700, height: 48, paddingInline: 32 }}
          >
            Về trang chủ
          </Button>
          <Button
            size="large"
            icon={<SearchOutlined />}
            onClick={() => navigate('/jobs')}
            style={{ height: 48, paddingInline: 32, fontWeight: 600 }}
          >
            Tìm việc làm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
