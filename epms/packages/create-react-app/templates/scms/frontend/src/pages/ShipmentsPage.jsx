import { useEffect, useState } from "react";
import api from "../api/client.js";

const SHIPMENT_STATUSES = ["Pending", "In Transit", "Delivered", "Cancelled"];

const emptyForm = {
  shipmentNumber: "",
  shipmentDate: "",
  shipmentStatus: "",
  destination: "",
  supplierCode: "",
};

const validateShipment = (form, suppliers) => {
  const errors = {};
  if (!form.shipmentNumber.trim()) errors.shipmentNumber = "Shipment number is required.";
  if (!form.shipmentDate) errors.shipmentDate = "Shipment date is required.";
  if (!form.shipmentStatus) errors.shipmentStatus = "Select shipment status.";
  else if (!SHIPMENT_STATUSES.includes(form.shipmentStatus)) {
    errors.shipmentStatus = "Select a valid status from the list.";
  }
  if (!form.destination.trim()) errors.destination = "Destination is required.";
  if (!form.supplierCode) errors.supplierCode = "Select a supplier from the list.";
  else if (!suppliers.some((s) => s.supplier_code === form.supplierCode)) {
    errors.supplierCode = "Selected supplier is not valid.";
  }
  return errors;
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ShipmentsPage() {
  const [form, setForm] = useState(emptyForm);
  const [suppliers, setSuppliers] = useState([]);
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadShipments = async () => {
    try {
      const { data } = await api.get("/shipments");
      setRows(data);
    } catch {
      setError("Failed to load shipment records.");
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data } = await api.get("/suppliers");
      setSuppliers(data);
    } catch {
      setError("Failed to load suppliers.");
    }
  };

  useEffect(() => {
    loadShipments();
    loadSuppliers();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateShipment(form, suppliers);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      if (editId) {
        await api.put(`/shipments/${editId}`, form);
        setMessage("Shipment updated.");
      } else {
        await api.post("/shipments", form);
        setMessage("Shipment added.");
      }
      setForm(emptyForm);
      setFieldErrors({});
      setEditId(null);
      loadShipments();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  const startEdit = (row) => {
    setEditId(row.shipment_number);
    setFieldErrors({});
    setForm({
      shipmentNumber: row.shipment_number ?? "",
      shipmentDate: formatDateTimeLocal(row.shipment_date),
      shipmentStatus: row.shipment_status ?? "",
      destination: row.destination ?? "",
      supplierCode: row.supplier_code ?? "",
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/shipments/${id}`);
      loadShipments();
    } catch {
      setError("Delete failed.");
    }
  };

  const supplierLabel = (code) => {
    const s = suppliers.find((x) => x.supplier_code === code);
    return s ? `${s.supplier_name} (${code})` : code;
  };

  const inputClass = (key) =>
    `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : "border-line"}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Shipments</h2>
        <p className="text-muted text-sm">Manage shipments — select supplier and status from the list</p>
      </div>
      {suppliers.length === 0 && (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Add at least one supplier before creating shipments.
        </p>
      )}
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Shipment Number</span>
          <input
            className={inputClass("shipmentNumber")}
            value={form.shipmentNumber}
            onChange={(e) => setField("shipmentNumber", e.target.value)}
            disabled={!!editId}
          />
          {fieldErrors.shipmentNumber && <p className="text-red-600 text-xs mt-1">{fieldErrors.shipmentNumber}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Shipment Date</span>
          <input
            type="datetime-local"
            className={inputClass("shipmentDate")}
            value={form.shipmentDate}
            onChange={(e) => setField("shipmentDate", e.target.value)}
          />
          {fieldErrors.shipmentDate && <p className="text-red-600 text-xs mt-1">{fieldErrors.shipmentDate}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Status</span>
          <select
            className={inputClass("shipmentStatus")}
            value={form.shipmentStatus}
            onChange={(e) => setField("shipmentStatus", e.target.value)}
          >
            <option value="">Select status</option>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {fieldErrors.shipmentStatus && <p className="text-red-600 text-xs mt-1">{fieldErrors.shipmentStatus}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Destination</span>
          <input
            className={inputClass("destination")}
            value={form.destination}
            onChange={(e) => setField("destination", e.target.value)}
          />
          {fieldErrors.destination && <p className="text-red-600 text-xs mt-1">{fieldErrors.destination}</p>}
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-medium text-ink">Supplier</span>
          <select
            className={inputClass("supplierCode")}
            value={form.supplierCode}
            onChange={(e) => setField("supplierCode", e.target.value)}
            disabled={suppliers.length === 0}
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s.supplier_code} value={s.supplier_code}>
                {s.supplier_code} — {s.supplier_name}
              </option>
            ))}
          </select>
          {fieldErrors.supplierCode && <p className="text-red-600 text-xs mt-1">{fieldErrors.supplierCode}</p>}
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button
            type="submit"
            disabled={suppliers.length === 0}
            className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold disabled:opacity-50"
          >
            {editId ? "Update" : "Add"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setFieldErrors({});
                setForm(emptyForm);
              }}
              className="rounded-lg border border-line px-5 py-2"
            >
              Cancel
            </button>
          )}
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3 text-left">Number</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Destination</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.shipment_number} className="border-t border-line">
                <td className="px-4 py-3">{row.shipment_number}</td>
                <td className="px-4 py-3">{String(row.shipment_date ?? "").slice(0, 16)}</td>
                <td className="px-4 py-3">{row.shipment_status}</td>
                <td className="px-4 py-3">{row.destination}</td>
                <td className="px-4 py-3">{supplierLabel(row.supplier_code)}</td>
                <td className="px-4 py-3 space-x-2">
                  <button type="button" onClick={() => startEdit(row)} className="text-accent font-medium">Edit</button>
                  <button type="button" onClick={() => remove(row.shipment_number)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
