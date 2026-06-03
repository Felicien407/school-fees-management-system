import { useEffect, useState } from "react";
import api from "../api/client.js";

const emptyForm = {
  supplierCode: "",
  supplierName: "",
  telephone: "",
  address: "",
  email: "",
};

const validateSupplier = (form) => {
  const errors = {};
  if (!form.supplierCode.trim()) errors.supplierCode = "Supplier code is required.";
  if (!form.supplierName.trim()) errors.supplierName = "Supplier name is required.";
  if (!form.telephone.trim()) errors.telephone = "Telephone is required.";
  else if (!/^[0-9+\-\s]{7,15}$/.test(form.telephone.trim())) {
    errors.telephone = "Enter a valid phone number (7–15 digits).";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
};

export default function SuppliersPage() {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/suppliers");
      setRows(data);
    } catch {
      setError("Failed to load supplier records.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateSupplier(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await api.post("/suppliers", form);
      setMessage("Supplier added successfully.");
      setForm(emptyForm);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key) =>
    `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : "border-line"}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Suppliers</h2>
        <p className="text-muted text-sm">Add new supplier records</p>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Supplier Code</span>
          <input
            className={inputClass("supplierCode")}
            value={form.supplierCode}
            onChange={(e) => setField("supplierCode", e.target.value)}
          />
          {fieldErrors.supplierCode && <p className="text-red-600 text-xs mt-1">{fieldErrors.supplierCode}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Supplier Name</span>
          <input
            className={inputClass("supplierName")}
            value={form.supplierName}
            onChange={(e) => setField("supplierName", e.target.value)}
          />
          {fieldErrors.supplierName && <p className="text-red-600 text-xs mt-1">{fieldErrors.supplierName}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Telephone</span>
          <input
            className={inputClass("telephone")}
            value={form.telephone}
            onChange={(e) => setField("telephone", e.target.value)}
            placeholder="e.g. 0788123456"
          />
          {fieldErrors.telephone && <p className="text-red-600 text-xs mt-1">{fieldErrors.telephone}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Email</span>
          <input
            type="email"
            className={inputClass("email")}
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-medium text-ink">Address</span>
          <input
            className={inputClass("address")}
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
          />
          {fieldErrors.address && <p className="text-red-600 text-xs mt-1">{fieldErrors.address}</p>}
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold disabled:opacity-50">
            {loading ? "Saving..." : "Add Supplier"}
          </button>
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Telephone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.supplier_code} className="border-t border-line">
                <td className="px-4 py-3">{row.supplier_code}</td>
                <td className="px-4 py-3">{row.supplier_name}</td>
                <td className="px-4 py-3">{row.telephone}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
