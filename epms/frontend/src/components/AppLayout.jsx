import { Link, NavLink, Outlet } from "react-router-dom";

function AppLayout({ onLogout, username }) {
  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-blue-700 text-white" : "text-blue-900 hover:bg-blue-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/employee" className="text-lg font-bold text-blue-900">
            Employee Payroll Management System
          </Link>
          <div className="text-sm text-slate-600">Logged in as: {username}</div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-4">
          <NavLink to="/employee" className={linkClass}>
            Employee
          </NavLink>
          <NavLink to="/department" className={linkClass}>
            Department
          </NavLink>
          <NavLink to="/salary" className={linkClass}>
            Salary
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            Reports
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="ml-auto rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
