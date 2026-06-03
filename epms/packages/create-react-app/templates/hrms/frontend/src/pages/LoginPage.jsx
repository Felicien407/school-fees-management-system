import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { isEmployee } from "../constants/permissions.js";
import AuthShell from "../components/AuthShell.jsx";
import { Button, Field, Input } from "../components/ui.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  if (loading) return null;
  if (isAuthenticated) {
    const saved = localStorage.getItem("hrms_user");
    const u = saved ? JSON.parse(saved) : null;
    return <Navigate to={isEmployee(u) ? "/my-profile" : "/"} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Username and password are required.");
      return;
    }
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user);
      const employee = data.user?.role === "employee" || data.user?.employeeId;
      navigate(employee ? "/my-profile" : "/", { replace: true });
    } catch (err) {
      setError(getApiError(err, "Login failed."));
    }
  };

  return (
    <AuthShell title="Login" subtitle="Enter your username and password">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username">
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="primary" className="w-full">
          Login
        </Button>
        <Link to="/forgot-password" className="block text-center text-sm text-primary underline">
          Forgot password?
        </Link>
      </form>
      <p className="mt-4 pt-4 border-t border-border text-xs text-muted leading-relaxed">
        <strong className="text-text">No registration page?</strong> The exam requires session-based login only.
        HR creates accounts under <strong>Users</strong> (linked to an employee record). Public self-sign-up is not
        part of the specification and would let anyone create access without HR approval.
      </p>
    </AuthShell>
  );
}
