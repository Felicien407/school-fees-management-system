import { useEffect, useState } from "react";
import api from "../services/api";

function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    startDate: "",
    endDate: "",
    customerId: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/customers").then(({ data }) => setCustomers(data)).catch(() => {});
  }, []);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const fetchDaily = async () => {
    setMessage("");
    if (!filters.date) {
      setFieldErrors({ date: "Please select a date for daily sales report." });
      return;
    }
    setFieldErrors({});
    const { data } = await api.get("/reports/daily-sales", { params: { date: filters.date } });
    setRows(data);
    if (!data.length) setMessage("No data found for selected daily date.");
  };

  const fetchMonthly = async () => {
    setMessage("");
    const errors = {};
    if (!filters.startDate) errors.startDate = "Start date is required.";
    if (!filters.endDate) errors.endDate = "End date is required.";
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      errors.endDate = "End date cannot be before start date.";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    const { data } = await api.get("/reports/monthly-sales", {
      params: { startDate: filters.startDate, endDate: filters.endDate },
    });
    setRows(data);
    if (!data.length) setMessage("No data found for selected monthly range.");
  };

  const fetchStock = async () => {
    setFieldErrors({});
    setMessage("");
    const { data } = await api.get("/reports/product-stock");
    setRows(data);
    if (!data.length) setMessage("No stock report data found.");
  };

  const fetchCustomerPurchases = async () => {
    setMessage("");
    if (!filters.customerId) {
      setFieldErrors({ customerId: "Please select a customer from the list." });
      return;
    }
    const customer = customers.find((c) => String(c.customer_id) === String(filters.customerId));
    if (!customer) {
      setFieldErrors({ customerId: "Selected customer is not valid." });
      return;
    }
    setFieldErrors({});
    const { data } = await api.get("/reports/customer-purchases", {
      params: { customerName: customer.full_name },
    });
    setRows(data);
    if (!data.length) setMessage("No purchases found for that customer.");
  };

  const inputClass = (key) =>
    `w-full border bg-white p-2 text-brand-900 ${fieldErrors[key] ? "border-red-500" : "border-brand-100"}`;

  return (
    <div className="space-y-6">
      <section className="border border-brand-100 bg-linear-to-r from-brand-900 to-brand-800 px-5 py-6 text-white shadow-sm md:px-6">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="mt-1 text-sm text-brand-100">
          Generate daily, monthly, customer, and stock reports.
        </p>
      </section>

      <section className="grid gap-4 border border-brand-100 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4 md:p-6">
        <div className="space-y-2 border border-brand-100 p-3">
          <label className="mb-1 block text-sm">Daily Date</label>
          <input
            type="date"
            className={inputClass("date")}
            value={filters.date}
            onChange={(e) => setFilter("date", e.target.value)}
          />
          <button
            onClick={fetchDaily}
            className="mt-2 w-full border border-brand-900 bg-brand-900 p-2 text-sm font-semibold text-white"
          >
            Daily Sales
          </button>
          {fieldErrors.date && <p className="mt-2 text-sm text-red-600">{fieldErrors.date}</p>}
        </div>
        <div className="space-y-2 border border-brand-100 p-3">
          <label className="mb-1 block text-sm">Start - End</label>
          <input
            type="date"
            className={`mb-2 ${inputClass("startDate")}`}
            value={filters.startDate}
            onChange={(e) => setFilter("startDate", e.target.value)}
          />
          {fieldErrors.startDate && <p className="text-sm text-red-600">{fieldErrors.startDate}</p>}
          <input
            type="date"
            className={inputClass("endDate")}
            value={filters.endDate}
            onChange={(e) => setFilter("endDate", e.target.value)}
          />
          {fieldErrors.endDate && <p className="text-sm text-red-600">{fieldErrors.endDate}</p>}
          <button
            onClick={fetchMonthly}
            className="mt-2 w-full border border-brand-900 bg-brand-900 p-2 text-sm font-semibold text-white"
          >
            Monthly Sales
          </button>
        </div>
        <div className="space-y-2 border border-brand-100 p-3">
          <label className="mb-1 block text-sm">Customer</label>
          <select
            className={inputClass("customerId")}
            value={filters.customerId}
            onChange={(e) => setFilter("customerId", e.target.value)}
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.full_name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchCustomerPurchases}
            className="mt-2 w-full border border-brand-900 bg-brand-900 p-2 text-sm font-semibold text-white"
          >
            Customer Purchases
          </button>
          {fieldErrors.customerId && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.customerId}</p>
          )}
        </div>
        <div className="flex items-end border border-brand-100 p-3">
          <button
            onClick={fetchStock}
            className="w-full border border-brand-900 bg-brand-900 p-2 text-sm font-semibold text-white"
          >
            Product Stock Report
          </button>
        </div>
      </section>
      {message && <p className="text-sm text-brand-800">{message}</p>}
      <section className="border border-brand-100 bg-white p-5 shadow-sm md:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-brand-900">
            <thead>
              <tr className="bg-brand-900 text-left text-white">
                {rows[0] &&
                  Object.keys(rows[0]).map((key) => (
                    <th key={key} className="px-3 py-3 font-semibold">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-brand-50"} border-t border-brand-100`}
                >
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-3 py-2.5">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ReportsPage;
