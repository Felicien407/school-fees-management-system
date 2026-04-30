import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await loginUser({
        username: username.trim().toLowerCase(),
        password,
      });
      onLoginSuccess({ username: data.username, role: data.role });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md border border-lms-panel bg-lms-panel p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-lms-paper">Library Login</h1>
        <p className="mb-6 text-sm text-lms-paper/70">Sign in with the username and password you were given.</p>
        {error && (
          <div className="mb-4 border border-lms-accent bg-lms-dark px-3 py-2 text-sm text-lms-accent">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4 border border-lms-dark p-4">
          <label className="block text-sm text-lms-paper/80">
            Username
            <input
              className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block text-sm text-lms-paper/80">
            Password
            <input
              type="password"
              className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full border border-lms-accent bg-lms-accent py-2 font-semibold text-lms-paper hover:bg-lms-accent-hover"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
