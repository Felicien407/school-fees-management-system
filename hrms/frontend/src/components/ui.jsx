export function PageHeader({ title, subtitle }) {
  return (
    <header className="mb-6 pb-4 border-b border-border">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </header>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-border rounded-md ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-page">
      <h3 className="font-semibold text-text">{title}</h3>
      {action}
    </div>
  );
}

export function Alert({ type = "info", children, className = "" }) {
  const styles = {
    info: "bg-white border-primary text-primary",
    warning: "bg-white border-primary text-text",
    success: "bg-white border-primary text-primary",
    error: "bg-white border-red-400 text-red-700",
  };
  return (
    <div className={`border rounded-md px-4 py-3 text-sm ${styles[type]} ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-white text-primary border border-primary hover:bg-page",
    ghost: "text-primary hover:bg-page",
    danger: "bg-white text-red-600 border border-red-300 hover:bg-red-50",
  };
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      {label && <span className="font-medium text-text">{label}</span>}
      <div className={label ? "mt-1" : ""}>{children}</div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </label>
  );
}

export function Input({ error, className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-primary ${error ? "border-red-400" : "border-border"} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-primary ${error ? "border-red-400" : "border-border"} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-page text-primary border border-border">
      {status}
    </span>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            active === tab.id ? "bg-primary text-white" : "text-primary hover:bg-page"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function DataTable({ columns, rows, rowKey, emptyMessage = "No records found." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-page">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-2 font-semibold text-primary">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey(row, i)} className="border-b border-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FormActions({ children }) {
  return <div className="flex flex-wrap items-center gap-2 pt-2">{children}</div>;
}

export function Message({ type, children }) {
  if (!children) return null;
  return (
    <span className={`text-sm ${type === "success" ? "text-primary" : "text-red-600"}`}>
      {children}
    </span>
  );
}
