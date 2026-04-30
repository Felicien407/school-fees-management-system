import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import BooksPage from "./pages/BooksPage";
import BorrowPage from "./pages/BorrowPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import ReturnPage from "./pages/ReturnPage";
import SearchPage from "./pages/SearchPage";
import StudentsPage from "./pages/StudentsPage";
import { fetchMe, logoutUser } from "./api/authApi";

function ProtectedLayout({ authed, username, role, onLogout }) {
  if (!authed) return <Navigate to="/login" replace />;
  return <AppLayout onLogout={onLogout} username={username} role={role} />;
}

function AdminRoute({ role, children }) {
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(({ data }) => {
        setAuthed(true);
        setUsername(data.username);
        setRole(data.role);
      })
      .catch(() => {
        setAuthed(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const onLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    setAuthed(false);
    setUsername("");
    setRole("");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-lms-dark text-lms-paper">Loading…</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authed ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage
              onLoginSuccess={({ username: u, role: r }) => {
                setAuthed(true);
                setUsername(u);
                setRole(r);
              }}
            />
          )
        }
      />
      <Route
        element={<ProtectedLayout authed={authed} username={username} role={role} onLogout={onLogout} />}
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="students"
          element={
            <AdminRoute role={role}>
              <StudentsPage />
            </AdminRoute>
          }
        />
        <Route
          path="books"
          element={
            <AdminRoute role={role}>
              <BooksPage />
            </AdminRoute>
          }
        />
        <Route path="borrow" element={<BorrowPage />} />
        <Route path="return" element={<ReturnPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={authed ? "/" : "/login"} replace />} />
    </Routes>
  );
}
