// ===========================
// Context và hook quản lý trạng thái đăng nhập
// ===========================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { message } from "antd";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục session từ localStorage và verify với Backend
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      if (token) {
        try {
          const data = await authService.getProfile();

          const profileUser = data?.user ?? data;
          if (profileUser) {
            setUser(profileUser);
            localStorage.setItem("user", JSON.stringify(profileUser));
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    // Controller ở backend trả về { success, message, token, user }
    const { token, user: userData } = await authService.login(credentials);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (userData) => {
    const { token, user: newUser } = await authService.register(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);

    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Lỗi khi gọi API logout", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      message.success("Đã đăng xuất thành công");
    }
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  const isAuthenticated = !!user;
  const isEmployer = user?.role === "employer";
  const isCandidate = user?.role === "candidate";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isEmployer,
        isCandidate,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider");
  return context;
};

export default useAuth;
