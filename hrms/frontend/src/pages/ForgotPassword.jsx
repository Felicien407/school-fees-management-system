import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiError } from "../api/client.js";
import AuthShell from "../components/AuthShell.jsx";
import { Button, Field, Input } from "../components/ui.jsx";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.username.trim()) err.username = "Username is required.";
    if (!form.newPassword) err.newPassword = "New password is required.";
    if (!form.confirmPassword) err.confirmPassword = "Confirm password is required.";
    else if (form.newPassword !== form.confirmPassword) err.confirmPassword = "Passwords must match.";
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", form);
      setMessage(data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(getApiError(err, "Request failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Enter your username and new password">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username" error={fieldErrors.username}>
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={fieldErrors.username} />
        </Field>
        <Field label="New password" error={fieldErrors.newPassword}>
          <Input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={fieldErrors.newPassword} />
        </Field>
        <Field label="Confirm password" error={fieldErrors.confirmPassword}>
          <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={fieldErrors.confirmPassword} />
        </Field>
        {message && <p className="text-sm text-primary">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Please wait…" : "Update password"}
        </Button>
        <Link to="/login" className="block text-center text-sm text-primary underline">
          Back to login
        </Link>
      </form>
    </AuthShell>
  );
}
