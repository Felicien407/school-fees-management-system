import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("hrms_user");
    const savedToken = localStorage.getItem("hrms_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      api.get("/auth/me").catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("hrms_user");
        localStorage.removeItem("hrms_token");
      });
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("hrms_user", JSON.stringify(userData));
    localStorage.setItem("hrms_token", authToken);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* session may already be gone */
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("hrms_user");
    localStorage.removeItem("hrms_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
