import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const err = {};
    const email = form.email.trim();
    if (!email) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Invalid email';
    if (!form.newPassword) err.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) err.newPassword = 'At least 6 characters';
    if (!form.confirmPassword) err.confirmPassword = 'Confirm password is required';
    else if (form.newPassword && form.newPassword !== form.confirmPassword) {
      err.confirmPassword = 'Passwords must match';
    }
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await forgotPassword({
        email: form.email.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage(data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h1 className="font-display text-2xl font-bold text-sfms-ink text-center">Reset Password</h1>
        <p className="text-center text-slate-500 text-sm mt-1 mb-6">Enter your email and new password</p>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {message}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            {fieldErrors.newPassword && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.newPassword}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm disabled:opacity-60 transition"
          >
            {loading ? 'Please wait…' : 'Reset password'}
          </button>
        </form>
        <Link to="/login" className="mt-4 block text-center text-sm text-slate-600 hover:text-teal-700">
          Back to login
        </Link>
      </div>
    </div>
  );
}
