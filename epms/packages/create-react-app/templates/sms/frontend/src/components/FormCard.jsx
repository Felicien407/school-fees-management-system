function FormCard({ title, children }) {
  return (
    <section className="border border-brand-100 bg-white p-5 shadow-sm md:p-6">
      <h2 className="mb-4 border-l-4 border-accent-500 pl-3 text-lg font-semibold text-brand-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default FormCard;
