import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import DepartmentsPage from "./pages/DepartmentsPage.jsx";
import PositionsPage from "./pages/PositionsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<EmployeesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
