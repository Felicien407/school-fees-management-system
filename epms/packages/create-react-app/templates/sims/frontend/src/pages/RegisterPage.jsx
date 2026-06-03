import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { strongPasswordError } from "../utils/passwordPolicy";

function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    const err = {};
    const u = form.username.trim();
    if (u.length < 3) err.username = "Username must be at least 3 characters";
    const email = form.email.trim();
    if (!email) err.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = "Enter a valid email address.";
    const pErr = strongPasswordError(form.password);
    if (pErr) err.password = pErr;
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!validate()) return;
    try {
      const r = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setMsg(r.data.message);
      setForm({ username: form.username, email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-900">Register</h1>
        <p className="mb-2 text-sm text-slate-500">
          Strong password: 8+ chars, uppercase, lowercase, number
        </p>
        {error && <div className="mb-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {msg && <div className="mb-2 rounded bg-green-50 px-3 py-2 text-sm text-green-800">{msg}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              minLength={3}
              required
            />
            {fieldErrors.username && <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>}
          </div>
          <div>
            <input
              type="email"
              className="w-full rounded border px-3 py-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>
          <button type="submit" className="w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700">
            Register
          </button>
        </form>
        <Link to="/login" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
