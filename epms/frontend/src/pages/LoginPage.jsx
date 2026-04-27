import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await loginUser({ username: cleanUsername, password });
      onLoginSuccess(response.data.username);
      navigate("/employee");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-blue-900">EPMS Login</h1>
        <p className="mb-6 text-slate-600">Use your account to manage employee payroll data.</p>

        {(error || message) && (
          <div
            className={`mb-4 rounded-md px-4 py-3 text-sm ${
              error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold text-blue-800">Login</h2>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            required
          />
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
          <button className="w-full rounded-md bg-blue-700 px-3 py-2 font-medium text-white hover:bg-blue-800">
            Login
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link to="/register" className="text-emerald-700 hover:underline">
            Create new account
          </Link>
          <Link to="/reset-password" className="text-amber-700 hover:underline">
            Forgot password? Reset here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
