import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = "Username is required.";
    else if (form.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }
    if (mode === "register") {
      if (!form.email.trim()) errors.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Enter a valid email address.";
      }
    }
    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!validate()) return;
    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        setMode("login");
        setMessage("Registration successful. Please login.");
        setForm({ username: form.username, email: "", password: "" });
        return;
      }

      const { data } = await api.post("/auth/login", {
        username: form.username.trim(),
        password: form.password,
      });
      localStorage.setItem("smartshop_user", JSON.stringify(data.user));
      localStorage.setItem("smartshop_token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-8">
      <form
        onSubmit={submit}
        className="w-full max-w-md border border-brand-100 bg-white p-6 text-brand-900 shadow-sm md:p-8"
      >
        <h1 className="border-l-4 border-accent-500 pl-3 text-2xl font-bold">
          Sales Management System
        </h1>
        <p className="mt-1 pl-3 text-sm text-gray-600">
          SMS — {mode === "login" ? "Sign In" : "Create Account"}
        </p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full border border-brand-100 p-2.5"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          {fieldErrors.username && (
            <p className="text-sm text-red-600">{fieldErrors.username}</p>
          )}
          {mode === "register" && (
            <>
              <input
                className="w-full border border-brand-100 p-2.5"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </>
          )}
          <input
            className="w-full border border-brand-100 p-2.5"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {fieldErrors.password && (
            <p className="text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>
        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="mt-5 w-full border border-brand-800 bg-brand-800 px-4 py-2.5 font-semibold text-white"
        >
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>
        {mode === "login" && (
          <Link to="/forgot-password" className="mt-3 block w-full text-center text-sm text-brand-800 underline">
            Forgot Password?
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
            setMessage("");
            setForm({ username: form.username, email: "", password: "" });
          }}
          className="mt-3 w-full border border-brand-800 px-4 py-2.5 font-semibold text-brand-800"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
