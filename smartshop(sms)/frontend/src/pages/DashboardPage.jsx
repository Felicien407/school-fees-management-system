import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import api from "../services/api";

function DashboardPage() {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_customers: 0,
    total_sales: 0,
    total_revenue: 0,
  });

  useEffect(() => {
    api.get("/reports/dashboard").then((res) => setSummary(res.data));
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Dashboard Summary</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={summary.total_products} />
        <StatCard title="Total Customers" value={summary.total_customers} />
        <StatCard title="Total Sales" value={summary.total_sales} />
        <StatCard title="Revenue" value={`RWF ${Number(summary.total_revenue).toFixed(2)}`} />
      </div>
    </div>
  );
}

export default DashboardPage;
