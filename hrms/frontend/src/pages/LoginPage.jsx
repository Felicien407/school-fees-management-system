import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api, { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import { Button, Field, Input } from "../components/ui.jsx";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Username and password are required.");
      return;
    }
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
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
    </AuthShell>
  );
}
