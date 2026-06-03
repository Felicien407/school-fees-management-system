import { useEffect, useState } from "react";
import { fetchStats } from "../api/dashboardApi";

const Card = ({ label, value }) => (
  <div className="border border-lms-panel bg-lms-panel p-4">
    <div className="text-xs uppercase tracking-wide text-lms-paper/60">{label}</div>
    <div className="mt-2 text-3xl font-bold text-lms-accent">{value}</div>
  </div>
);

export default function DashboardPage() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchStats()
      .then(({ data }) => setS(data))
      .catch((e) => setErr(e.response?.data?.message || "Failed to load stats"));
  }, []);

  if (err) {
    return <p className="text-lms-accent">{err}</p>;
  }
  if (!s) {
    return <p className="text-lms-paper/70">Loading…</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-lms-paper">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Book titles (records)" value={s.totalBookTitles} />
        <Card label="Copies in library" value={s.totalCopiesInLibrary} />
        <Card label="Students" value={s.totalStudents} />
        <Card label="Borrowed (active)" value={s.borrowedActive} />
        <Card label="Returned (all time)" value={s.returnedCount} />
        <Card label="Late returns (returned after due)" value={s.lateReturned} />
        <Card label="Overdue (not yet returned)" value={s.overdueActive} />
      </div>
    </div>
  );
}
