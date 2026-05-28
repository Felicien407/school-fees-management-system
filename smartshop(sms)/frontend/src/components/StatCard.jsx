function StatCard({ title, value }) {
  return (
    <div className="rounded-lg border border-brand-700 bg-brand-800 p-4 shadow-lg">
      <p className="text-sm text-brand-100">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default StatCard;
