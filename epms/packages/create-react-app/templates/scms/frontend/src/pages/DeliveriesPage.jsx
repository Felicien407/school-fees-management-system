import { useEffect, useState } from "react";
import api from "../api/client.js";

const DELIVERY_STATUSES = ["Pending", "Delivered", "Failed"];

const emptyForm = {
  deliveryCode: "",
  deliveryDate: "",
  quantityDelivered: "",
  deliveryStatus: "",
  shipmentNumber: "",
};

const validateDelivery = (form, shipments) => {
  const errors = {};
  if (!form.deliveryCode.trim()) errors.deliveryCode = "Delivery code is required.";
  if (!form.deliveryDate) errors.deliveryDate = "Delivery date is required.";
  if (form.quantityDelivered === "" || Number.isNaN(Number(form.quantityDelivered))) {
    errors.quantityDelivered = "Quantity delivered is required.";
  } else if (Number(form.quantityDelivered) < 0) {
    errors.quantityDelivered = "Quantity cannot be negative.";
  }
  if (!form.deliveryStatus) errors.deliveryStatus = "Select delivery status.";
  else if (!DELIVERY_STATUSES.includes(form.deliveryStatus)) {
    errors.deliveryStatus = "Select a valid status from the list.";
  }
  if (!form.shipmentNumber) errors.shipmentNumber = "Select a shipment from the list.";
  else if (!shipments.some((s) => s.shipment_number === form.shipmentNumber)) {
    errors.shipmentNumber = "Selected shipment is not valid.";
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

export default function DeliveriesPage() {
  const [form, setForm] = useState(emptyForm);
  const [shipments, setShipments] = useState([]);
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDeliveries = async () => {
    try {
      const { data } = await api.get("/deliveries");
      setRows(data);
    } catch {
      setError("Failed to load delivery records.");
    }
  };

  const loadShipments = async () => {
    try {
      const { data } = await api.get("/shipments");
      setShipments(data);
    } catch {
      setError("Failed to load shipments.");
    }
  };

  useEffect(() => {
    loadDeliveries();
    loadShipments();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateDelivery(form, shipments);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    try {
      if (editId) {
        await api.put(`/deliveries/${editId}`, form);
        setMessage("Delivery updated.");
      } else {
        await api.post("/deliveries", form);
        setMessage("Delivery added.");
      }
      setForm(emptyForm);
      setFieldErrors({});
      setEditId(null);
      loadDeliveries();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  const startEdit = (row) => {
    setEditId(row.delivery_code);
    setFieldErrors({});
    setForm({
      deliveryCode: row.delivery_code ?? "",
      deliveryDate: formatDateTimeLocal(row.delivery_date),
      quantityDelivered: String(row.quantity_delivered ?? ""),
      deliveryStatus: row.delivery_status ?? "",
      shipmentNumber: row.shipment_number ?? "",
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/deliveries/${id}`);
      loadDeliveries();
    } catch {
      setError("Delete failed.");
    }
  };

  const shipmentLabel = (number) => {
    const s = shipments.find((x) => x.shipment_number === number);
    return s ? `${s.shipment_number} — ${s.destination}` : number;
  };

  const inputClass = (key) =>
    `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : "border-line"}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Deliveries</h2>
        <p className="text-muted text-sm">Manage deliveries — select shipment and status from the list</p>
      </div>
      {shipments.length === 0 && (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Add at least one shipment before recording deliveries.
        </p>
      )}
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Delivery Code</span>
          <input
            className={inputClass("deliveryCode")}
            value={form.deliveryCode}
            onChange={(e) => setField("deliveryCode", e.target.value)}
            disabled={!!editId}
          />
          {fieldErrors.deliveryCode && <p className="text-red-600 text-xs mt-1">{fieldErrors.deliveryCode}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Delivery Date</span>
          <input
            type="datetime-local"
            className={inputClass("deliveryDate")}
            value={form.deliveryDate}
            onChange={(e) => setField("deliveryDate", e.target.value)}
          />
          {fieldErrors.deliveryDate && <p className="text-red-600 text-xs mt-1">{fieldErrors.deliveryDate}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Quantity Delivered</span>
          <input
            type="number"
            min="0"
            className={inputClass("quantityDelivered")}
            value={form.quantityDelivered}
            onChange={(e) => setField("quantityDelivered", e.target.value)}
          />
          {fieldErrors.quantityDelivered && <p className="text-red-600 text-xs mt-1">{fieldErrors.quantityDelivered}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Delivery Status</span>
          <select
            className={inputClass("deliveryStatus")}
            value={form.deliveryStatus}
            onChange={(e) => setField("deliveryStatus", e.target.value)}
          >
            <option value="">Select status</option>
            {DELIVERY_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {fieldErrors.deliveryStatus && <p className="text-red-600 text-xs mt-1">{fieldErrors.deliveryStatus}</p>}
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-medium text-ink">Shipment</span>
          <select
            className={inputClass("shipmentNumber")}
            value={form.shipmentNumber}
            onChange={(e) => setField("shipmentNumber", e.target.value)}
            disabled={shipments.length === 0}
          >
            <option value="">Select shipment</option>
            {shipments.map((s) => (
              <option key={s.shipment_number} value={s.shipment_number}>
                {s.shipment_number} — {s.destination} ({s.shipment_status})
              </option>
            ))}
          </select>
          {fieldErrors.shipmentNumber && <p className="text-red-600 text-xs mt-1">{fieldErrors.shipmentNumber}</p>}
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button
            type="submit"
            disabled={shipments.length === 0}
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
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Shipment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.delivery_code} className="border-t border-line">
                <td className="px-4 py-3">{row.delivery_code}</td>
                <td className="px-4 py-3">{String(row.delivery_date ?? "").slice(0, 16)}</td>
                <td className="px-4 py-3">{row.quantity_delivered}</td>
                <td className="px-4 py-3">{row.delivery_status}</td>
                <td className="px-4 py-3">{shipmentLabel(row.shipment_number)}</td>
                <td className="px-4 py-3 space-x-2">
                  <button type="button" onClick={() => startEdit(row)} className="text-accent font-medium">Edit</button>
                  <button type="button" onClick={() => remove(row.delivery_code)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
