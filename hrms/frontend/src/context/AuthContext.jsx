import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";
import { isAdmin } from "../constants/permissions.js";

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  const role = user.role || (user.employeeId ? "employee" : "admin");
  return { ...user, role };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => {
        const refreshed = normalizeUser(data.user);
        setUser(refreshed);
        if (refreshed) localStorage.setItem("hrms_user", JSON.stringify(refreshed));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("hrms_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem("hrms_user", JSON.stringify(normalized));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* session may already be gone */
    }
    setUser(null);
    localStorage.removeItem("hrms_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: isAdmin(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
