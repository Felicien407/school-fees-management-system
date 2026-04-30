import { useState } from "react";
import { listBooks } from "../api/booksApi";
import { listBorrows } from "../api/borrowsApi";
import { listStudents } from "../api/studentsApi";

export default function SearchPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [err, setErr] = useState("");

  const searchStudents = async () => {
    setErr("");
    try {
      const { data } = await listStudents({ name });
      setStudents(data);
    } catch (e) {
      setErr(e.response?.data?.message || "Search failed");
    }
  };

  const searchBooks = async () => {
    setErr("");
    try {
      const { data } = await listBooks({ title });
      setBooks(data);
    } catch (e) {
      setErr(e.response?.data?.message || "Search failed");
    }
  };

  const filterBorrows = async () => {
    setErr("");
    try {
      const params = { status: "all" };
      if (from) params.dateFrom = from;
      if (to) params.dateTo = to;
      const { data } = await listBorrows(params);
      setBorrows(data);
    } catch (e) {
      setErr(e.response?.data?.message || "Filter failed");
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-lms-paper">Search and filter</h1>
      {err && <p className="border border-lms-accent px-3 py-2 text-sm text-lms-accent">{err}</p>}

      <section className="border border-lms-panel bg-lms-panel p-4">
        <h2 className="mb-2 text-sm font-semibold text-lms-accent">Students by name</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            placeholder="Name contains…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="border border-lms-accent bg-lms-accent px-4 py-2 text-lms-paper"
            onClick={searchStudents}
          >
            Search
          </button>
        </div>
        <ul className="mt-3 max-h-48 overflow-auto text-sm text-lms-paper/90">
          {students.map((s) => (
            <li key={s._id} className="border-b border-lms-dark py-1">
              {s.fullName} · {s.className} · {s.email}
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-lms-panel bg-lms-panel p-4">
        <h2 className="mb-2 text-sm font-semibold text-lms-accent">Books by title</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            placeholder="Title contains…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="button"
            className="border border-lms-accent bg-lms-accent px-4 py-2 text-lms-paper"
            onClick={searchBooks}
          >
            Search
          </button>
        </div>
        <ul className="mt-3 max-h-48 overflow-auto text-sm text-lms-paper/90">
          {books.map((b) => (
            <li key={b._id} className="border-b border-lms-dark py-1">
              {b.title} — {b.author} ({b.quantity} in library)
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-lms-panel bg-lms-panel p-4">
        <h2 className="mb-2 text-sm font-semibold text-lms-accent">Borrowings by borrow date</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button
            type="button"
            className="border border-lms-accent bg-lms-accent px-4 py-2 text-lms-paper"
            onClick={filterBorrows}
          >
            Apply
          </button>
        </div>
        <div className="mt-3 max-h-64 overflow-auto text-sm">
          <table className="w-full text-left text-lms-paper">
            <thead className="text-lms-paper/60">
              <tr>
                <th className="p-1">Student</th>
                <th className="p-1">Book</th>
                <th className="p-1">Borrowed</th>
                <th className="p-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map((r) => (
                <tr key={r._id} className="border-t border-lms-dark">
                  <td className="p-1">{r.student?.fullName}</td>
                  <td className="p-1">{r.book?.title}</td>
                  <td className="p-1">{fmt(r.borrowDate)}</td>
                  <td className="p-1">{r.returnedAt ? "Returned" : "Borrowed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
