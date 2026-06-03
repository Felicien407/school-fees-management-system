import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err = {};
    const email = form.email.trim();
    if (!email) err.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = "Enter a valid email address.";
    if (!form.newPassword) err.newPassword = "New password is required.";
    if (!form.confirmPassword) err.confirmPassword = "Confirm password is required.";
    else if (form.newPassword && form.newPassword !== form.confirmPassword) {
      err.confirmPassword = "Passwords must match.";
    }
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
      const { data } = await api.post("/auth/forgot-password", {
        email: form.email.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage(data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md border border-lms-panel bg-lms-panel p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-lms-paper">Forgot Password</h1>
        <p className="mb-6 text-sm text-lms-paper/70">Enter your email and new password</p>
        {error && (
          <div className="mb-4 border border-lms-accent bg-lms-dark px-3 py-2 text-sm text-lms-accent">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 border border-lms-dark bg-lms-dark px-3 py-2 text-sm text-lms-paper">
            {message}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4 border border-lms-dark p-4">
          <label className="block text-sm text-lms-paper/80">
            Email
            <input
              type="email"
              className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-lms-accent">{fieldErrors.email}</p>}
          </label>
          <label className="block text-sm text-lms-paper/80">
            New password
            <input
              type="password"
              className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            {fieldErrors.newPassword && (
              <p className="mt-1 text-xs text-lms-accent">{fieldErrors.newPassword}</p>
            )}
          </label>
          <label className="block text-sm text-lms-paper/80">
            Confirm password
            <input
              type="password"
              className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-lms-accent">{fieldErrors.confirmPassword}</p>
            )}
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-lms-accent bg-lms-accent py-2 font-semibold text-lms-paper hover:bg-lms-accent-hover disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Reset password"}
          </button>
        </form>
        <Link to="/login" className="mt-4 inline-block text-sm text-lms-paper/80 hover:text-lms-paper">
          Back to login
        </Link>
      </div>
    </div>
  );
}
