import { useEffect, useState } from "react";
import { createStudent, deleteStudent, listStudents, updateStudent } from "../api/studentsApi";

const GENDERS = ["Male", "Female", "Other"];
const empty = { fullName: "", gender: "Male", className: "", phone: "", email: "" };

const validateStudent = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.gender) errors.gender = "Select gender.";
  else if (!GENDERS.includes(form.gender)) errors.gender = "Select a valid gender.";
  if (!form.className.trim()) errors.className = "Class is required.";
  if (!form.phone.trim()) errors.phone = "Phone is required.";
  else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number (7–15 digits).";
  }
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
};

export default function StudentsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [err, setErr] = useState("");

  const load = () =>
    listStudents()
      .then(({ data }) => setRows(data))
      .catch((e) => setErr(e.response?.data?.message || "Load failed"));

  useEffect(() => {
    load();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `border bg-lms-dark px-3 py-2 text-lms-paper ${fieldErrors[key] ? "border-red-500" : "border-lms-dark"}`;

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    const errors = validateStudent(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      if (editId) await updateStudent(editId, form);
      else await createStudent(form);
      setForm(empty);
      setEditId(null);
      setFieldErrors({});
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
    setFieldErrors({});
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
          <div>
            <input
              className={inputClass("fullName")}
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
            />
            {fieldErrors.fullName && <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>}
          </div>
          <div>
            <select
              className={inputClass("gender")}
              value={form.gender}
              onChange={(e) => setField("gender", e.target.value)}
            >
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            {fieldErrors.gender && <p className="mt-1 text-xs text-red-400">{fieldErrors.gender}</p>}
          </div>
          <div>
            <input
              className={inputClass("className")}
              placeholder="Class"
              value={form.className}
              onChange={(e) => setField("className", e.target.value)}
            />
            {fieldErrors.className && <p className="mt-1 text-xs text-red-400">{fieldErrors.className}</p>}
          </div>
          <div>
            <input
              className={inputClass("phone")}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
          </div>
          <div className="sm:col-span-2">
            <input
              className={inputClass("email")}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
          </div>
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
                setFieldErrors({});
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
