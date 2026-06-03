import { useEffect, useState } from "react";
import { getSpareParts } from "../api/sparePartsApi";
import { getStockIn, createStockIn } from "../api/stockInApi";

const validateStockIn = (form) => {
  const errors = {};
  if (!form.sparePartId) errors.sparePartId = "Select a spare part.";
  if (!form.stockInQuantity || Number(form.stockInQuantity) <= 0) {
    errors.stockInQuantity = "Quantity must be greater than 0.";
  }
  if (!form.stockInDate) errors.stockInDate = "Stock-in date is required.";
  return errors;
};

function StockInPage() {
  const [parts, setParts] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ sparePartId: "", stockInQuantity: "", stockInDate: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");

  const load = async () => {
    const [pr, inRows] = await Promise.all([getSpareParts(), getStockIn()]);
    setParts(pr.data);
    setRows(inRows.data);
  };

  useEffect(() => {
    load().catch(() => setMessage("Load failed"));
  }, []);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const inputClass = (key) =>
    `w-full rounded border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : ""}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const errors = validateStockIn(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      await createStockIn({
        sparePartId: form.sparePartId,
        stockInQuantity: Number(form.stockInQuantity),
        stockInDate: new Date(form.stockInDate).toISOString(),
      });
      setForm({ sparePartId: "", stockInQuantity: "", stockInDate: "" });
      setFieldErrors({});
      setMessage("Stock in saved");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-lg border border-blue-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">Stock In (insert only)</h2>
        <form onSubmit={onSubmit} className="space-y-2">
          <select
            className={inputClass("sparePartId")}
            value={form.sparePartId}
            onChange={(e) => setField("sparePartId", e.target.value)}
          >
            <option value="">Spare part</option>
            {parts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {p.category}
              </option>
            ))}
          </select>
          {fieldErrors.sparePartId && <p className="text-xs text-red-600">{fieldErrors.sparePartId}</p>}
          <input
            type="number"
            className={inputClass("stockInQuantity")}
            placeholder="Quantity in"
            min="1"
            value={form.stockInQuantity}
            onChange={(e) => setField("stockInQuantity", e.target.value)}
          />
          {fieldErrors.stockInQuantity && (
            <p className="text-xs text-red-600">{fieldErrors.stockInQuantity}</p>
          )}
          <input
            type="date"
            className={inputClass("stockInDate")}
            value={form.stockInDate}
            onChange={(e) => setField("stockInDate", e.target.value)}
          />
          {fieldErrors.stockInDate && <p className="text-xs text-red-600">{fieldErrors.stockInDate}</p>}
          <button
            type="submit"
            className="w-full rounded bg-blue-700 py-2 text-white hover:bg-blue-800"
          >
            Save
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">History (read)</h2>
        <div className="max-h-96 overflow-auto text-sm">
          {rows.map((r) => (
            <div key={r._id} className="border-b border-slate-100 py-2">
              {r.sparePart?.name} +{r.stockInQuantity} @ {new Date(r.stockInDate).toLocaleDateString()}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StockInPage;
