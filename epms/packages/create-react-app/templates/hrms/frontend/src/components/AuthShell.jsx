export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">HRMS</h1>
          <p className="text-sm text-muted mt-1">Human Resource Management System</p>
        </div>
        <div className="bg-white border border-border rounded-md p-6">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-muted mt-1 mb-4">{subtitle}</p>}
          {!subtitle && <div className="mb-4" />}
          {children}
        </div>
      </div>
    </div>
  );
}
