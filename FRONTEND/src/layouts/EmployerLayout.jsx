// ===========================
// layouts/MainLayout.jsx
// Layout chính có Header và Footer
// ===========================

import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import AppHeader from "../components/common/AppHeader";
import AppFooter from "../components/common/AppFooter";
import "./MainLayout.css";

const { Content } = Layout;

const EmployerLayout = () => {
  return (
    <Layout className="main-layout">
      <Content className="main-content">
        <Outlet />
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default EmployerLayout;
