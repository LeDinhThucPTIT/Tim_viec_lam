import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import HomePage from "./pages/HomePage";
import JobListPage from "./pages/JobListPage";
import JobDetailPage from "./pages/JobDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EmployerDashboardPage from "./pages/EmployerDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CompaniesPage from "./pages/CompaniesPage";
import CVPage from "./pages/CVPage";
import BecomeEmployerPage from "./pages/BecomeEmployerPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import CvscoringPage from "./pages/CvscoringPage";
import EmployerLayout from "./layouts/EmployerLayout";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
            <Route
              path="/cv"
              element={
                <ProtectedRoute>
                  <CVPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cvscoring"
              element={
                <ProtectedRoute>
                  <CvscoringPage />
                </ProtectedRoute>
              }
            />
            <Route path="/become-employer" element={<BecomeEmployerPage />} />
          </Route>

          <Route element={<EmployerLayout />}>
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute requiredRole="employer">
                  <EmployerDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth routes with minimal layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
