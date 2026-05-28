import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (mode === "register") {
        await api.post("/auth/register", form);
        setMode("login");
        setMessage("Registration successful. Please login.");
        setForm({ username: "", password: "" });
        return;
      }

      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("smartshop_user", JSON.stringify(data.user));
      localStorage.setItem("smartshop_token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-xl bg-white p-6 text-brand-900 shadow-2xl"
      >
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Student Project Login" : "Student Project Register"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          SmartShop LTD Sales System ({mode === "login" ? "Sign In" : "Create Account"})
        </p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-md border p-2"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            className="w-full rounded-md border p-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-brand-800 px-4 py-2 font-semibold text-white"
        >
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
            setMessage("");
          }}
          className="mt-3 w-full rounded-md border border-brand-800 px-4 py-2 font-semibold text-brand-800"
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
