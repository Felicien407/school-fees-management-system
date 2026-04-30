import { Link, NavLink, Outlet } from "react-router-dom";

const navCls = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium border border-transparent ${
    isActive ? "bg-lms-accent text-lms-paper border-lms-accent" : "text-lms-paper/90 hover:bg-lms-panel"
  }`;

export default function AppLayout({ onLogout, username, role }) {
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-lms-dark">
      <header className="border-b border-lms-panel bg-lms-panel">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight text-lms-paper">
            Library Management System
          </Link>
          <div className="text-sm text-lms-paper/80">
            {username} · <span className="text-lms-accent">{role}</span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 border-t border-lms-dark px-4 py-2 no-print">
          <NavLink to="/" end className={navCls}>
            Dashboard
          </NavLink>
          {isAdmin && (
            <NavLink to="/students" className={navCls}>
              Students
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/books" className={navCls}>
              Books
            </NavLink>
          )}
          <NavLink to="/borrow" className={navCls}>
            Borrow
          </NavLink>
          <NavLink to="/return" className={navCls}>
            Return
          </NavLink>
          <NavLink to="/search" className={navCls}>
            Search
          </NavLink>
          <NavLink to="/reports" className={navCls}>
            Reports
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="ml-auto border border-lms-accent bg-lms-dark px-3 py-2 text-sm font-medium text-lms-accent hover:bg-lms-accent hover:text-lms-paper"
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
