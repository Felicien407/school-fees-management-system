import { useEffect, useState } from "react";
import { createBook, deleteBook, listBooks, updateBook } from "../api/booksApi";

const empty = { title: "", author: "", category: "", quantity: 0, publishedYear: new Date().getFullYear() };

const validateBook = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.author.trim()) errors.author = "Author is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (form.quantity === "" || Number.isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
    errors.quantity = "Quantity must be 0 or greater.";
  }
  if (!form.publishedYear || Number.isNaN(Number(form.publishedYear))) {
    errors.publishedYear = "Published year is required.";
  }
  return errors;
};

export default function BooksPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [err, setErr] = useState("");

  const load = () =>
    listBooks()
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
    const errors = validateBook(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
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
      setFieldErrors({});
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
    setFieldErrors({});
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
          <div className="sm:col-span-2">
            <input
              className={inputClass("title")}
              placeholder="Title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-red-400">{fieldErrors.title}</p>}
          </div>
          <div>
            <input
              className={inputClass("author")}
              placeholder="Author"
              value={form.author}
              onChange={(e) => setField("author", e.target.value)}
            />
            {fieldErrors.author && <p className="mt-1 text-xs text-red-400">{fieldErrors.author}</p>}
          </div>
          <div>
            <input
              className={inputClass("category")}
              placeholder="Category"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            />
            {fieldErrors.category && <p className="mt-1 text-xs text-red-400">{fieldErrors.category}</p>}
          </div>
          <div>
            <input
              className={inputClass("quantity")}
              type="number"
              min={0}
              placeholder="Quantity (copies in library)"
              value={form.quantity}
              onChange={(e) => setField("quantity", e.target.value)}
            />
            {fieldErrors.quantity && <p className="mt-1 text-xs text-red-400">{fieldErrors.quantity}</p>}
          </div>
          <div>
            <input
              className={inputClass("publishedYear")}
              type="number"
              placeholder="Published year"
              value={form.publishedYear}
              onChange={(e) => setField("publishedYear", e.target.value)}
            />
            {fieldErrors.publishedYear && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.publishedYear}</p>
            )}
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
