import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    const email = form.email.trim();
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!form.newPassword) errors.newPassword = "New password is required.";
    else if (form.newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters.";
    if (!form.confirmPassword) errors.confirmPassword = "Confirm password is required.";
    else if (form.newPassword && form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = "Passwords must match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
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
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-8">
      <form
        onSubmit={submit}
        className="w-full max-w-md border border-brand-100 bg-white p-6 text-brand-900 shadow-sm md:p-8"
      >
        <h1 className="border-l-4 border-accent-500 pl-3 text-2xl font-bold">Forgot Password</h1>
        <p className="mt-1 pl-3 text-sm text-gray-600">Enter your email and new password</p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full border border-brand-100 p-2.5"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
          <input
            className="w-full border border-brand-100 p-2.5"
            type="password"
            placeholder="New password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          {fieldErrors.newPassword && <p className="text-sm text-red-600">{fieldErrors.newPassword}</p>}
          <input
            className="w-full border border-brand-100 p-2.5"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>
        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full border border-brand-800 bg-brand-800 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Please wait…" : "Reset Password"}
        </button>
        <Link to="/login" className="mt-3 block w-full text-center text-sm text-brand-800 underline">
          Back to login
        </Link>
      </form>
    </div>
  );
}

export default ForgotPassword;
