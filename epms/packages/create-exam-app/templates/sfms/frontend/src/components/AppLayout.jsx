import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/payments', label: 'Payments' },
  { to: '/reports', label: 'Reports' },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-56 shrink-0 bg-sfms-ink text-white md:min-h-screen flex flex-col">
        <div className="p-5 border-b border-white/10">
          <p className="font-display font-bold text-lg tracking-tight">SFMS</p>
          <p className="text-xs text-teal-200/90 mt-0.5">School fee management</p>
        </div>
        <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-white/10 hidden md:block">
          <p className="text-xs text-slate-400 truncate" title={user?.email}>
            {user?.name}
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 w-full text-left text-sm text-teal-300 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        <header className="flex justify-between items-center mb-6 md:hidden">
          <span className="font-display font-semibold text-sfms-ink">SFMS</span>
          <button type="button" onClick={logout} className="text-sm text-teal-700 font-medium">
            Log out
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
