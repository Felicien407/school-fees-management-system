import { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient.js';

const inputClass =
  'border border-slate-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-teal-500 outline-none';

export function PaymentsPage() {
  const [list, setList] = useState([]);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formTarget, setFormTarget] = useState(null);

  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  async function load() {
    setError('');
    try {
      const [pay, stud] = await Promise.all([
        apiRequest('/api/payments'),
        apiRequest('/api/students'),
      ]);
      setList(pay);
      setStudents(stud);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function validate() {
    const err = {};
    if (!studentId) err.studentId = 'Select a student';
    const n = Number(amount);
    if (amount === '' || Number.isNaN(n) || n < 0) err.amount = 'Enter a valid amount';
    if (!paymentDate) err.paymentDate = 'Pick a date';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  function openNew() {
    setFormTarget('new');
    setStudentId(students[0]?.id || '');
    setAmount('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setFieldErrors({});
  }

  function openEdit(row) {
    setFormTarget(row);
    setStudentId(row.student_id || '');
    setAmount(String(row.amount ?? ''));
    setPaymentDate(row.payment_date?.slice(0, 10) || '');
    setFieldErrors({});
  }

  function closeForm() {
    setFormTarget(null);
    setFieldErrors({});
  }

  async function save(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        student_id: studentId,
        amount: Number(amount),
        payment_date: paymentDate,
      };
      if (formTarget !== 'new' && formTarget?.id) {
        await apiRequest(`/api/payments/${formTarget.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/payments', { method: 'POST', body: JSON.stringify(payload) });
      }
      closeForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await apiRequest(`/api/payments/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-sfms-ink">Payments</h1>
          <p className="text-slate-600 text-sm mt-0.5">Record and edit fee payments.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          disabled={students.length === 0}
          className="text-sm font-medium text-teal-700 border border-teal-200 rounded-lg px-4 py-2 hover:bg-teal-50 w-fit disabled:opacity-50"
        >
          + New payment
        </button>
      </div>

      {students.length === 0 && (
        <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Add at least one student before recording payments.
        </p>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {formTarget === 'new' && (
        <form
          onSubmit={save}
          className="mb-8 p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3 max-w-xl"
        >
          <h2 className="font-semibold text-sfms-ink">New payment</h2>
          <div>
            <label className="text-sm text-slate-600">Student</label>
            <select
              className={inputClass + ' mt-1'}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} — {s.class}
                </option>
              ))}
            </select>
            {fieldErrors.studentId && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.studentId}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-600">Amount</label>
            <input
              type="number"
              min="0"
              step="1"
              className={inputClass + ' mt-1'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {fieldErrors.amount && <p className="text-xs text-red-600 mt-1">{fieldErrors.amount}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Payment date</label>
            <input
              type="date"
              className={inputClass + ' mt-1'}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            {fieldErrors.paymentDate && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.paymentDate}</p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg border text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  {p.student?.full_name || '—'}{' '}
                  <span className="text-slate-500">({p.student?.class || '—'})</span>
                </td>
                <td className="px-4 py-3 font-medium">{Number(p.amount).toLocaleString()} FRW</td>
                <td className="px-4 py-3">{p.payment_date}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="text-teal-700 font-medium"
                    onClick={() => openEdit(p)}
                  >
                    Edit
                  </button>
                  <button type="button" className="text-red-600 font-medium" onClick={() => remove(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="p-6 text-center text-slate-500">No payments recorded.</p>
        )}
      </div>

      {formTarget && formTarget !== 'new' && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
          role="presentation"
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="font-semibold text-lg">Edit payment</h2>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Student</label>
                <select
                  className={inputClass + ' mt-1'}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Amount</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass + ' mt-1'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Date</label>
                <input
                  type="date"
                  className={inputClass + ' mt-1'}
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium"
                >
                  Save
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg border text-sm">
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
