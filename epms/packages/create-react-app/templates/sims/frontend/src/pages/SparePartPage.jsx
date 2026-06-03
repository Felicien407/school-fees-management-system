import { useEffect, useState } from "react";
import { getSpareParts, createSparePart } from "../api/sparePartsApi";

const initial = { name: "", category: "", quantity: "", unitPrice: "" };

const validateSparePart = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (form.quantity === "" || Number.isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
    errors.quantity = "Quantity must be 0 or greater.";
  }
  if (form.unitPrice === "" || Number.isNaN(Number(form.unitPrice)) || Number(form.unitPrice) < 0) {
    errors.unitPrice = "Unit price must be 0 or greater.";
  }
  return errors;
};

function SparePartPage() {
  const [form, setForm] = useState(initial);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");

  const load = () =>
    getSpareParts()
      .then((r) => setRows(r.data))
      .catch(() => setMessage("Failed to load parts"));

  useEffect(() => {
    load();
  }, []);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const inputClass = (key) =>
    `w-full rounded border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : ""}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const errors = validateSparePart(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      await createSparePart({
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
      });
      setForm(initial);
      setFieldErrors({});
      setMessage("Saved");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-lg border border-emerald-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-emerald-900">Spare Part (insert only)</h2>
        <form onSubmit={onSubmit} className="space-y-2">
          <input
            name="name"
            className={inputClass("name")}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
          <input
            name="category"
            className={inputClass("category")}
            placeholder="Category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
          />
          {fieldErrors.category && <p className="text-xs text-red-600">{fieldErrors.category}</p>}
          <input
            type="number"
            name="quantity"
            className={inputClass("quantity")}
            placeholder="Quantity"
            min="0"
            value={form.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
          />
          {fieldErrors.quantity && <p className="text-xs text-red-600">{fieldErrors.quantity}</p>}
          <input
            type="number"
            name="unitPrice"
            className={inputClass("unitPrice")}
            placeholder="Unit price"
            min="0"
            step="0.01"
            value={form.unitPrice}
            onChange={(e) => setField("unitPrice", e.target.value)}
          />
          {fieldErrors.unitPrice && <p className="text-xs text-red-600">{fieldErrors.unitPrice}</p>}
          <button
            type="submit"
            className="w-full rounded bg-emerald-700 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Save
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Parts list (read)</h2>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2">{p.unitPrice}</td>
                  <td className="p-2">{p.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SparePartPage;
