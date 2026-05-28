function FormCard({ title, children }) {
  return (
    <section className="rounded-lg border border-brand-700 bg-brand-800 p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default FormCard;
