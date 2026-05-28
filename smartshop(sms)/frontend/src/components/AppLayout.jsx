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
    <div className="min-h-screen bg-brand-900 text-white">
      <header className="border-b border-brand-700 bg-brand-800/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <h1 className="text-xl font-bold">SmartShop LTD</h1>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm ${
                    isActive ? "bg-white text-brand-900" : "bg-brand-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
