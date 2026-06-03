import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/customers", label: "Customers" },
  { to: "/sales", label: "Sales" },
  { to: "/reports", label: "Reports" },
];

function AppLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("smartshop_user");
    localStorage.removeItem("smartshop_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900 md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b-4 border-accent-500 bg-brand-800 text-white md:min-h-screen md:border-b-0 md:border-r-4 md:border-r-accent-500">
        <div className="flex items-center justify-between px-4 py-4 md:px-5 md:py-6">
          <div>
            <h1 className="text-lg font-bold tracking-wide md:text-xl">SMS</h1>
            <p className="text-xs text-brand-200">Sales Management System</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="border border-red-500 bg-red-500 px-2 py-1 text-xs font-semibold text-white md:hidden"
          >
            Logout
          </button>
        </div>
        <nav className="grid gap-2 px-4 pb-5 md:px-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `border px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "border-accent-500 bg-accent-500 text-brand-900"
                    : "border-brand-700 bg-brand-900/40 text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 pb-6 md:block">
          <button
            type="button"
            onClick={logout}
            className="w-full border border-red-500 bg-red-500 px-3 py-2 text-sm font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="w-full px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
