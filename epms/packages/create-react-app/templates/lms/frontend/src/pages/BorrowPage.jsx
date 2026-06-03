import { useEffect, useState } from "react";
import { listBooks } from "../api/booksApi";
import { createBorrow } from "../api/borrowsApi";
import { listStudents } from "../api/studentsApi";

const validateBorrow = (form) => {
  const errors = {};
  if (!form.studentId) errors.studentId = "Select a student.";
  if (!form.bookId) errors.bookId = "Select a book.";
  if (!form.borrowDate) errors.borrowDate = "Borrow date is required.";
  if (!form.returnDueDate) errors.returnDueDate = "Return due date is required.";
  else if (form.borrowDate && form.returnDueDate < form.borrowDate) {
    errors.returnDueDate = "Return due date cannot be before borrow date.";
  }
  return errors;
};

export default function BorrowPage() {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    bookId: "",
    borrowDate: new Date().toISOString().slice(0, 10),
    returnDueDate: new Date().toISOString().slice(0, 10),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([listStudents(), listBooks()])
      .then(([s, b]) => {
        setStudents(s.data);
        setBooks(b.data.filter((x) => x.quantity > 0));
      })
      .catch((e) => setErr(e.response?.data?.message || "Failed to load lists"));
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `mt-1 w-full border bg-lms-dark px-3 py-2 text-lms-paper ${fieldErrors[key] ? "border-red-500" : "border-lms-dark"}`;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    const errors = validateBorrow(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      await createBorrow(form);
      setMsg("Borrowing saved.");
      setFieldErrors({});
      const b = await listBooks();
      setBooks(b.data.filter((x) => x.quantity > 0));
    } catch (e2) {
      setErr(e2.response?.data?.message || "Borrow failed");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-lms-paper">Borrow book</h1>
      {err && <p className="mb-3 border border-lms-accent px-3 py-2 text-sm text-lms-accent">{err}</p>}
      {msg && <p className="mb-3 border border-lms-paper/30 px-3 py-2 text-sm text-lms-paper">{msg}</p>}
      <form onSubmit={submit} className="max-w-xl border border-lms-panel bg-lms-panel p-4 space-y-4">
        <label className="block text-sm text-lms-paper/80">
          Student
          <select
            className={inputClass("studentId")}
            value={form.studentId}
            onChange={(e) => setField("studentId", e.target.value)}
          >
            <option value="">— Select —</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.fullName} · {s.className}
              </option>
            ))}
          </select>
          {fieldErrors.studentId && <p className="mt-1 text-xs text-red-400">{fieldErrors.studentId}</p>}
        </label>
        <label className="block text-sm text-lms-paper/80">
          Book (only titles with copies available)
          <select
            className={inputClass("bookId")}
            value={form.bookId}
            onChange={(e) => setField("bookId", e.target.value)}
          >
            <option value="">— Select —</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title} — {b.quantity} left
              </option>
            ))}
          </select>
          {fieldErrors.bookId && <p className="mt-1 text-xs text-red-400">{fieldErrors.bookId}</p>}
        </label>
        <label className="block text-sm text-lms-paper/80">
          Borrow date
          <input
            type="date"
            className={inputClass("borrowDate")}
            value={form.borrowDate}
            onChange={(e) => setField("borrowDate", e.target.value)}
          />
          {fieldErrors.borrowDate && <p className="mt-1 text-xs text-red-400">{fieldErrors.borrowDate}</p>}
        </label>
        <label className="block text-sm text-lms-paper/80">
          Return due date
          <input
            type="date"
            className={inputClass("returnDueDate")}
            value={form.returnDueDate}
            onChange={(e) => setField("returnDueDate", e.target.value)}
          />
          {fieldErrors.returnDueDate && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.returnDueDate}</p>
          )}
        </label>
        <button type="submit" className="border border-lms-accent bg-lms-accent px-4 py-2 font-semibold text-lms-paper">
          Save borrowing
        </button>
      </form>
    </div>
  );
}
