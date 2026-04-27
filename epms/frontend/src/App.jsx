import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DepartmentPage from "./pages/DepartmentPage";
import EmployeePage from "./pages/EmployeePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ReportsPage from "./pages/ReportsPage";
import SalaryPage from "./pages/SalaryPage";
import { fetchCurrentUser, logoutUser } from "./api/authApi";

function ProtectedLayout({ isAuthenticated, username, onLogout }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout onLogout={onLogout} username={username} />;
}

function PublicRoute({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/employee" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetchCurrentUser();
        setIsAuthenticated(true);
        setUsername(response.data.username);
      } catch (_error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setUsername("");
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Checking session...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <LoginPage
              onLoginSuccess={(name) => {
                setIsAuthenticated(true);
                setUsername(name);
              }}
            />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedLayout
            isAuthenticated={isAuthenticated}
            username={username}
            onLogout={handleLogout}
          />
        }
      >
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/department" element={<DepartmentPage />} />
        <Route path="/salary" element={<SalaryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/" element={<Navigate to="/employee" replace />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/employee" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
