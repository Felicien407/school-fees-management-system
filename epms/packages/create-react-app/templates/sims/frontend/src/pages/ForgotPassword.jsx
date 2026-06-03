import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";
import { strongPasswordError } from "../utils/passwordPolicy";

function ForgotPassword() {
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
    else {
      const pwdErr = strongPasswordError(form.newPassword);
      if (pwdErr) err.newPassword = pwdErr;
    }
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
      const r = await forgotPassword({
        email: form.email.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage(r.data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-amber-900">Forgot password</h1>
        <p className="mb-4 text-sm text-slate-600">Enter your email and a new password</p>
        {error && <div className="mb-2 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-2 text-sm text-green-800">{message}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <input
              type="email"
              className="w-full rounded border px-3 py-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              placeholder="New password (strong)"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            {fieldErrors.newPassword && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.newPassword}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-amber-600 py-2 text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Reset password"}
          </button>
        </form>
        <Link to="/login" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
