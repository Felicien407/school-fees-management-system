import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  function validate() {
    const err = {};
    if (!form.username.trim()) err.username = 'Username is required';
    if (mode === 'register') {
      if (!form.email.trim()) err.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) err.email = 'Invalid email';
    }
    if (!form.password || form.password.length < 6) err.password = 'At least 6 characters';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'login') await login(form.username.trim(), form.password);
      else await register(form.username.trim(), form.email.trim(), form.password, 'admin');
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h1 className="font-display text-2xl font-bold text-sfms-ink text-center">SFMS</h1>
        <p className="text-center text-slate-500 text-sm mt-1 mb-6">
          {mode === 'login' ? 'Sign in to continue' : 'Create an admin account'}
        </p>

        <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === 'login' ? 'bg-white shadow text-sfms-ink' : 'text-slate-600'
            }`}
            onClick={() => {
              setMode('login');
              setFieldErrors({});
              setFormError('');
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === 'register' ? 'bg-white shadow text-sfms-ink' : 'text-slate-600'
            }`}
            onClick={() => {
              setMode('register');
              setFieldErrors({});
              setFormError('');
            }}
          >
            Register
          </button>
        </div>

        {formError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              autoComplete="username"
            />
            {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm disabled:opacity-60 transition"
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        {mode === 'login' && (
          <Link to="/forgot-password" className="mt-4 block text-center text-sm text-slate-600 hover:text-teal-700">
            Forgot password?
          </Link>
        )}
      </div>
    </div>
  );
}
