import { useState } from 'react';
import { apiRequest } from '../api/apiClient.js';

export function ReportsPage() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const err = {};
    if (!start) err.start = 'Start date is required';
    if (!end) err.end = 'End date is required';
    if (start && end && start > end) err.end = 'End date must be on or after start date';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const q = new URLSearchParams({ start, end });
      const data = await apiRequest(`/api/reports?${q}`);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sfms-ink">Reports</h1>
      <p className="text-slate-600 text-sm mt-1 mb-6">
        Filter payments by date range and see totals.
      </p>

      <form
        onSubmit={onSubmit}
        className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-end max-w-3xl"
      >
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-700">Start date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          />
          {fieldErrors.start && <p className="text-xs text-red-600 mt-1">{fieldErrors.start}</p>}
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-700">End date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          />
          {fieldErrors.end && <p className="text-xs text-red-600 mt-1">{fieldErrors.end}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-teal-600 text-white font-medium text-sm disabled:opacity-60 h-fit"
        >
          {loading ? 'Loading…' : 'Run report'}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 max-w-3xl">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
            <p className="text-slate-600 text-sm">
              From <strong>{report.start}</strong> to <strong>{report.end}</strong>
            </p>
            <p className="text-lg font-display font-bold text-teal-800">
              Total paid: {Number(report.total_amount_paid).toLocaleString()} FRW
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment date</th>
                </tr>
              </thead>
              <tbody>
                {report.payments.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{p.student?.full_name || '—'}</td>
                    <td className="px-4 py-3">{p.student?.class || '—'}</td>
                    <td className="px-4 py-3 font-medium">{Number(p.amount).toLocaleString()} FRW</td>
                    <td className="px-4 py-3">{p.payment_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.payments.length === 0 && (
              <p className="p-6 text-center text-slate-500">No payments in this range.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
