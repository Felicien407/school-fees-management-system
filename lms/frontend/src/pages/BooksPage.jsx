import { useEffect, useState } from "react";
import { createBook, deleteBook, listBooks, updateBook } from "../api/booksApi";

const empty = { title: "", author: "", category: "", quantity: 0, publishedYear: new Date().getFullYear() };

export default function BooksPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");

  const load = () =>
    listBooks()
      .then(({ data }) => setRows(data))
      .catch((e) => setErr(e.response?.data?.message || "Load failed"));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        publishedYear: Number(form.publishedYear),
      };
      if (editId) await updateBook(editId, payload);
      else await createBook(payload);
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
      title: r.title,
      author: r.author,
      category: r.category,
      quantity: r.quantity,
      publishedYear: r.publishedYear,
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this book?")) return;
    setErr("");
    try {
      await deleteBook(id);
      await load();
    } catch (e2) {
      setErr(e2.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-lms-paper">Books</h1>
      {err && <p className="mb-3 border border-lms-accent px-3 py-2 text-sm text-lms-accent">{err}</p>}
      <form onSubmit={save} className="mb-6 border border-lms-panel bg-lms-panel p-4">
        <h2 className="mb-3 text-sm font-semibold text-lms-accent">{editId ? "Edit" : "Add"} book</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper sm:col-span-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            required
          />
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            type="number"
            min={0}
            placeholder="Quantity (copies in library)"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
          <input
            className="border border-lms-dark bg-lms-dark px-3 py-2 text-lms-paper"
            type="number"
            placeholder="Published year"
            value={form.publishedYear}
            onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
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
              <th className="p-2">Title</th>
              <th className="p-2">Author</th>
              <th className="p-2">Category</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Year</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-lms-dark">
                <td className="p-2">{r.title}</td>
                <td className="p-2">{r.author}</td>
                <td className="p-2">{r.category}</td>
                <td className="p-2">{r.quantity}</td>
                <td className="p-2">{r.publishedYear}</td>
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
