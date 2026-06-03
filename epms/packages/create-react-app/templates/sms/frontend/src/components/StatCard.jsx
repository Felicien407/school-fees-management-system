function StatCard({ title, value }) {
  return (
    <div className="border border-brand-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-brand-700">{title}</p>
      <p className="mt-2 text-2xl font-bold text-brand-900">{value}</p>
    </div>
  );
}

export default StatCard;
