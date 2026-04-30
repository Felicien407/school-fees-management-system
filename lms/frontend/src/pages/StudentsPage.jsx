import { useEffect, useState } from "react";
import { createStudent, deleteStudent, listStudents, updateStudent } from "../api/studentsApi";

const empty = { fullName: "", gender: "Male", className: "", phone: "", email: "" };

export default function StudentsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");

  const load = () =>
    listStudents()
      .then(({ data }) => setRows(data))
      .catch((e) => setErr(e.response?.data?.message || "Load failed"));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (editId) await updateStudent(editId, form);
      else await createStudent(form);
      setForm(empty);
      setEditId(null);
      await load();
    } catch (e2) {
      setErr(e2.response?.data?.message || "Save failed");
    }
  };

  const edit = (r) => {
    setEditId(r._id);
    setForm({
      fullName: r.fullName,
      gender: r.gender,
      className: r.className,
      phone: r.phone,
      email: r.email,
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this student?")) return;
    setErr("");
    try {
      await deleteStudent(id);
      await load();
    } catch (e2) {
      setErr(e2.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-lms-paper">Students</h1>
      {err && <p className="mb-3 border border-lms-accent px-3 py-2 text-sm text-lms-accent">{err}</p>}
      <form onSubmit={save} className="mb-6 border border-lms-panel bg-lms-panel p-4">
        <h2 className="mb-3 text-sm font-semibold text-lms-accent">{editId ? "Edit" : "Add"} student</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <select
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            placeholder="Class"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
            required
          />
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper sm:col-span-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" className="border border-lms-accent bg-lms-accent px-4 py-2 text-lms-paper">
            Save
          </button>
          {editId && (
            <button
              type="button"
              className="border border-lms-paper/40 px-4 py-2 text-lms-paper"
              onClick={() => {
                setEditId(null);
                setForm(empty);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto border border-lms-panel">
        <table className="w-full text-left text-sm text-lms-paper">
          <thead className="bg-lms-panel text-lms-paper/70">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Gender</th>
              <th className="p-2">Class</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Email</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-lms-dark">
                <td className="p-2">{r.fullName}</td>
                <td className="p-2">{r.gender}</td>
                <td className="p-2">{r.className}</td>
                <td className="p-2">{r.phone}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">
                  <button type="button" className="text-lms-accent hover:underline" onClick={() => edit(r)}>
                    Edit
                  </button>
                  {" · "}
                  <button type="button" className="text-lms-accent hover:underline" onClick={() => remove(r._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
