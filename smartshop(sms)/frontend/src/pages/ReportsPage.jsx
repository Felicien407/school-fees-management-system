import { useState } from "react";
import api from "../services/api";

function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    startDate: "",
    endDate: "",
    customerName: "",
  });

  const fetchDaily = async () => {
    const { data } = await api.get("/reports/daily-sales", { params: { date: filters.date } });
    setRows(data);
  };

  const fetchMonthly = async () => {
    const { data } = await api.get("/reports/monthly-sales", {
      params: { startDate: filters.startDate, endDate: filters.endDate },
    });
    setRows(data);
  };

  const fetchStock = async () => {
    const { data } = await api.get("/reports/product-stock");
    setRows(data);
  };

  const fetchCustomerPurchases = async () => {
    const { data } = await api.get("/reports/customer-purchases", {
      params: { customerName: filters.customerName },
    });
    setRows(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reports & Analytics</h2>
      <section className="grid gap-3 rounded-lg border border-brand-700 bg-brand-800 p-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm">Daily Date</label>
          <input
            type="date"
            className="w-full rounded border border-brand-600 bg-brand-900 p-2"
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
          <button onClick={fetchDaily} className="mt-2 w-full rounded bg-white p-2 text-brand-900">
            Daily Sales
          </button>
        </div>
        <div>
          <label className="mb-1 block text-sm">Start - End</label>
          <input
            type="date"
            className="mb-2 w-full rounded border border-brand-600 bg-brand-900 p-2"
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <input
            type="date"
            className="w-full rounded border border-brand-600 bg-brand-900 p-2"
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <button
            onClick={fetchMonthly}
            className="mt-2 w-full rounded bg-white p-2 text-brand-900"
          >
            Monthly Sales
          </button>
        </div>
        <div>
          <label className="mb-1 block text-sm">Customer Name</label>
          <input
            className="w-full rounded border border-brand-600 bg-brand-900 p-2 text-white"
            placeholder="Enter customer name"
            onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
          />
          <button
            onClick={fetchCustomerPurchases}
            className="mt-2 w-full rounded bg-white p-2 text-brand-900"
          >
            Customer Purchases
          </button>
        </div>
        <div className="flex items-end">
          <button onClick={fetchStock} className="w-full rounded bg-white p-2 text-brand-900">
            Product Stock Report
          </button>
        </div>
      </section>
      <section className="rounded-lg border border-brand-700 bg-brand-800 p-4">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {rows[0] &&
                  Object.keys(rows[0]).map((key) => (
                    <th key={key} className="pb-2">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-t border-brand-700">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="py-2">
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
