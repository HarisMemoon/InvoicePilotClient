// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "undefined" && t !== "null" ? t : null;
  });

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const persist = (newUser, newToken, newRefreshToken) => {
    if (!newUser || !newToken) return;
    setUser(newUser);
    setToken(newToken);

    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
    localStorage.setItem("token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken);
    }
  };

  // LOGIN – SUPABASE FORMAT
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });

      const { data } = res.data;
      const access_token = data.session.access_token;
      const refresh_token = data.session.refresh_token;
      const user = data.user;

      if (!access_token || !user) {
        throw new Error("Missing token or user in response");
      }

      persist(user, access_token, refresh_token);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.response?.data?.error || err.message || "Login failed",
      };
    }
  };

  // REGISTER – SUPABASE FORMAT
  const register = async (full_name, email, password, company_name = "") => {
    try {
      const res = await api.post("/api/auth/signup", {
        full_name,
        email,
        password,
        company_name: company_name || null,
      });

      const { data } = res.data;
      const access_token = data.session?.access_token;
      const refresh_token = data.session?.refresh_token;
      const user = data.user;

      if (!access_token || !user) {
        throw new Error("Missing token or user in response");
      }

      persist(user, access_token, refresh_token);
      return { success: true };
    } catch (err) {
      console.error("Register error:", err);
      return {
        success: false,
        message: err.response?.data?.error || err.message || "Register failed",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
