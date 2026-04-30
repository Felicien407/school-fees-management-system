import { useEffect, useState } from "react";
import { listBooks } from "../api/booksApi";
import { createBorrow } from "../api/borrowsApi";
import { listStudents } from "../api/studentsApi";

export default function BorrowPage() {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  const [borrowDate, setBorrowDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [returnDueDate, setReturnDueDate] = useState(() => new Date().toISOString().slice(0, 10));
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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await createBorrow({
        studentId,
        bookId,
        borrowDate,
        returnDueDate,
      });
      setMsg("Borrowing saved.");
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
            className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">— Select —</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.fullName} · {s.className}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-lms-paper/80">
          Book (only titles with copies available)
          <select
            className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            required
          >
            <option value="">— Select —</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title} — {b.quantity} left
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-lms-paper/80">
          Borrow date
          <input
            type="date"
            className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            value={borrowDate}
            onChange={(e) => setBorrowDate(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-lms-paper/80">
          Return due date
          <input
            type="date"
            className="mt-1 w-full border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            value={returnDueDate}
            onChange={(e) => setReturnDueDate(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="border border-lms-accent bg-lms-accent px-4 py-2 font-semibold text-lms-paper">
          Save borrowing
        </button>
      </form>
    </div>
  );
}
