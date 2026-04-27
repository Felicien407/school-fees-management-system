import { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient.js';

const inputClass =
  'border border-slate-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-teal-500 outline-none';

export function StudentsPage() {
  const [list, setList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  /** null | 'new' | student row — drives add form vs edit modal */
  const [formTarget, setFormTarget] = useState(null);

  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  async function load() {
    setError('');
    try {
      const data = await apiRequest('/api/students');
      setList(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function validate() {
    const err = {};
    if (!fullName.trim()) err.fullName = 'Required';
    if (!className.trim()) err.className = 'Required';
    if (!parentPhone.trim()) err.parentPhone = 'Required';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  function openNew() {
    setFormTarget('new');
    setFullName('');
    setClassName('');
    setParentPhone('');
    setFieldErrors({});
  }

  function openEdit(row) {
    setFormTarget(row);
    setFullName(row.full_name || '');
    setClassName(row.class || '');
    setParentPhone(row.parent_phone || '');
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
        full_name: fullName.trim(),
        class: className.trim(),
        parent_phone: parentPhone.trim(),
      };
      if (formTarget !== 'new' && formTarget?.id) {
        await apiRequest(`/api/students/${formTarget.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/students', { method: 'POST', body: JSON.stringify(payload) });
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
    if (!window.confirm('Delete this student?')) return;
    setError('');
    try {
      await apiRequest(`/api/students/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-sfms-ink">Students</h1>
          <p className="text-slate-600 text-sm mt-0.5">Create, update and remove student records.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="text-sm font-medium text-teal-700 border border-teal-200 rounded-lg px-4 py-2 hover:bg-teal-50 w-fit"
        >
          + New student
        </button>
      </div>

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
          <h2 className="font-semibold text-sfms-ink">New student</h2>
          <div>
            <label className="text-sm text-slate-600">Full name</label>
            <input
              className={inputClass + ' mt-1'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-600">Class</label>
            <input
              className={inputClass + ' mt-1'}
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
            {fieldErrors.className && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.className}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-600">Parent phone</label>
            <input
              className={inputClass + ' mt-1'}
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
            />
            {fieldErrors.parentPhone && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.parentPhone}</p>
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Parent phone</th>
              <th className="px-4 py-3 font-medium w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-sfms-ink">{u.full_name}</td>
                <td className="px-4 py-3">{u.class}</td>
                <td className="px-4 py-3">{u.parent_phone}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="text-teal-700 font-medium"
                    onClick={() => openEdit(u)}
                  >
                    Edit
                  </button>
                  <button type="button" className="text-red-600 font-medium" onClick={() => remove(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-center text-slate-500">No students yet.</p>}
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
            <h2 className="font-semibold text-lg">Edit student</h2>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <input
                  className={inputClass + ' mt-1'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-600">Class</label>
                <input
                  className={inputClass + ' mt-1'}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Parent phone</label>
                <input
                  className={inputClass + ' mt-1'}
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium disabled:opacity-60"
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
