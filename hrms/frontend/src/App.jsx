import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { isAdmin, isEmployee } from "./constants/permissions.js";
import AppLayout from "./components/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import DepartmentsPage from "./pages/DepartmentsPage.jsx";
import PositionsPage from "./pages/PositionsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import MyProfilePage from "./pages/MyProfilePage.jsx";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin(user)) return <Navigate to="/my-profile" replace />;
  return children;
}

function EmployeeHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (isEmployee(user)) return <Navigate to="/my-profile" replace />;
  return <EmployeesPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<EmployeeHome />} />
        <Route path="my-profile" element={<MyProfilePage />} />
        <Route path="departments" element={<AdminRoute><DepartmentsPage /></AdminRoute>} />
        <Route path="positions" element={<AdminRoute><PositionsPage /></AdminRoute>} />
        <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
