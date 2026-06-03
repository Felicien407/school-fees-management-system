import { useEffect, useState } from "react";
import { getSpareParts } from "../api/sparePartsApi";
import { getStockOut, createStockOut, updateStockOut, deleteStockOut } from "../api/stockOutApi";

const empty = { sparePartId: "", stockOutQuantity: "", stockOutUnitPrice: "", stockOutDate: "" };

const validateStockOut = (form, editing) => {
  const errors = {};
  if (!editing && !form.sparePartId) errors.sparePartId = "Select a spare part.";
  if (!form.stockOutQuantity || Number(form.stockOutQuantity) <= 0) {
    errors.stockOutQuantity = "Quantity must be greater than 0.";
  }
  if (form.stockOutUnitPrice === "" || Number.isNaN(Number(form.stockOutUnitPrice)) || Number(form.stockOutUnitPrice) < 0) {
    errors.stockOutUnitPrice = "Unit price must be 0 or greater.";
  }
  if (!form.stockOutDate) errors.stockOutDate = "Stock-out date is required.";
  return errors;
};

function StockOutPage() {
  const [parts, setParts] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");

  const load = async () => {
    const [pr, out] = await Promise.all([getSpareParts(), getStockOut()]);
    setParts(pr.data);
    setRows(out.data);
  };

  useEffect(() => {
    load().catch(() => setMessage("Load failed"));
  }, []);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `rounded border px-2 py-2 ${fieldErrors[key] ? "border-red-500" : ""}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const errors = validateStockOut(form, editing);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    const q = Number(form.stockOutQuantity);
    const u = Number(form.stockOutUnitPrice);
    if (!editing) {
      try {
        await createStockOut({
          sparePartId: form.sparePartId,
          stockOutQuantity: q,
          stockOutUnitPrice: u,
          stockOutDate: new Date(form.stockOutDate).toISOString(),
        });
        setForm(empty);
        setFieldErrors({});
        setMessage("Saved");
        load();
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed");
      }
    } else {
      try {
        await updateStockOut(editing, {
          stockOutQuantity: q,
          stockOutUnitPrice: u,
          stockOutDate: new Date(form.stockOutDate).toISOString(),
        });
        setEditing(null);
        setForm(empty);
        setFieldErrors({});
        setMessage("Updated");
        load();
      } catch (err) {
        setMessage(err.response?.data?.message || "Update failed");
      }
    }
  };

  const startEdit = (r) => {
    setEditing(r._id);
    setFieldErrors({});
    setForm({
      sparePartId: r.sparePart?._id || r.sparePart,
      stockOutQuantity: r.stockOutQuantity,
      stockOutUnitPrice: r.stockOutUnitPrice,
      stockOutDate: r.stockOutDate
        ? new Date(r.stockOutDate).toISOString().slice(0, 10)
        : "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this stock out?")) return;
    setMessage("");
    try {
      await deleteStockOut(id);
      if (editing === id) {
        setEditing(null);
        setForm(empty);
        setFieldErrors({});
      }
      setMessage("Deleted");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-amber-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-amber-900">Stock Out (create / list / update / delete)</h2>
        <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <select
              className={`w-full ${inputClass("sparePartId")}`}
              value={form.sparePartId}
              disabled={Boolean(editing)}
              onChange={(e) => setField("sparePartId", e.target.value)}
            >
              <option value="">Spare part</option>
              {parts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            {fieldErrors.sparePartId && <p className="mt-1 text-xs text-red-600">{fieldErrors.sparePartId}</p>}
          </div>
          <div>
            <input
              type="number"
              className={`w-full ${inputClass("stockOutQuantity")}`}
              min="1"
              placeholder="Quantity"
              value={form.stockOutQuantity}
              onChange={(e) => setField("stockOutQuantity", e.target.value)}
            />
            {fieldErrors.stockOutQuantity && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.stockOutQuantity}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              className={`w-full ${inputClass("stockOutUnitPrice")}`}
              min="0"
              step="0.01"
              placeholder="Unit price"
              value={form.stockOutUnitPrice}
              onChange={(e) => setField("stockOutUnitPrice", e.target.value)}
            />
            {fieldErrors.stockOutUnitPrice && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.stockOutUnitPrice}</p>
            )}
          </div>
          <div>
            <input
              type="date"
              className={`w-full ${inputClass("stockOutDate")}`}
              value={form.stockOutDate}
              onChange={(e) => setField("stockOutDate", e.target.value)}
            />
            {fieldErrors.stockOutDate && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.stockOutDate}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded bg-amber-600 px-2 py-2 text-white hover:bg-amber-700"
            >
              {editing ? "Update" : "Save"}
            </button>
            {editing && (
              <button
                type="button"
                className="rounded bg-slate-500 px-2 py-2 text-white"
                onClick={() => {
                  setEditing(null);
                  setForm(empty);
                  setFieldErrors({});
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">All stock out records</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2">Part</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit $</th>
                <th className="p-2">Total</th>
                <th className="p-2">Date</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="p-2">{r.sparePart?.name || ""}</td>
                  <td className="p-2">{r.stockOutQuantity}</td>
                  <td className="p-2">{r.stockOutUnitPrice}</td>
                  <td className="p-2">{r.stockOutTotalPrice}</td>
                  <td className="p-2">
                    {r.stockOutDate ? new Date(r.stockOutDate).toLocaleDateString() : ""}
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      className="mr-1 rounded bg-amber-100 px-2 py-0.5 text-amber-900"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded bg-red-100 px-2 py-0.5 text-red-800"
                      onClick={() => onDelete(r._id)}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StockOutPage;
