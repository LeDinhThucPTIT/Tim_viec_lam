// ===========================
// Guard route yêu cầu đăng nhập
// ===========================

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isEmployer, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === "employer" && !isEmployer) {
    return <Navigate to="/become" replace />;
  }

  return children;
};

export default ProtectedRoute;
