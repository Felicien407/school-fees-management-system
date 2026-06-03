import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiError } from "../api/client.js";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard")
      .then(({ data }) => setStats(data))
      .catch((err) => setError(getApiError(err, "Failed to load dashboard.")));
  }, []);

  const cards = [
    { label: "Total Employees", value: stats?.employees ?? "—", to: "/employees", tone: "bg-orange-50 text-orange-900" },
    { label: "On Leave", value: stats?.onLeaveEmployees ?? "—", to: "/reports", tone: "bg-amber-50 text-amber-900" },
    { label: "Departments", value: stats?.departments ?? "—", to: "/departments", tone: "bg-yellow-50 text-yellow-900" },
    { label: "Positions", value: stats?.positions ?? "—", to: "/positions", tone: "bg-stone-50 text-stone-900" },
    { label: "User Accounts", value: stats?.users ?? "—", to: "/users", tone: "bg-red-50 text-red-900" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Dashboard</h2>
        <p className="text-muted text-sm">Overview of human resource data</p>
      </div>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`rounded-xl p-5 border border-line shadow-sm hover:shadow-md transition ${c.tone}`}
          >
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-line p-6">
        <h3 className="font-semibold text-ink">Quick start</h3>
        <ol className="mt-3 text-sm text-muted space-y-2 list-decimal list-inside">
          <li>Add departments and positions first</li>
          <li>Add employees and assign department & position (HR admin)</li>
          <li>Create user accounts linked to employees</li>
          <li>Generate reports from the Reports menu</li>
        </ol>
      </div>
    </div>
  );
}
