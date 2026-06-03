import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ADMIN_NAV, EMPLOYEE_NAV, isAdmin } from "../constants/permissions.js";

export default function AppLayout() {
  const { logout, user } = useAuth();
  const links = isAdmin(user) ? ADMIN_NAV : EMPLOYEE_NAV;
  const roleLabel = isAdmin(user) ? "HR Administrator" : "Employee";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-56 md:min-h-screen bg-primary text-white shrink-0 flex flex-col">
        <div className="px-4 py-5 border-b border-white/20">
          <h1 className="text-lg font-bold">HRMS</h1>
          <p className="text-xs text-white/80 mt-0.5">{roleLabel}</p>
        </div>
        <nav className="p-3 space-y-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm ${
                  isActive ? "bg-white text-primary font-semibold" : "text-white hover:bg-white/10"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 mt-auto border-t border-white/20">
          {user?.username && (
            <p className="text-xs text-white/80 px-3 mb-2 truncate">{user.username}</p>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="w-full text-left px-3 py-2 text-sm rounded-md text-white hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
