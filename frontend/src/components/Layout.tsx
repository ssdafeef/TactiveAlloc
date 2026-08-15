import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarPlus, Truck, ShieldAlert, KeyRound, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/book", icon: CalendarPlus, label: "New Booking" },
  { to: "/fleet", icon: Truck, label: "Fleet View" },
  { to: "/conflicts", icon: ShieldAlert, label: "Conflict Log" },
  { to: "/overrides", icon: KeyRound, label: "Overrides" },
];

export default function Layout({ role, theme, onToggleTheme, onLogout }: { role: string | null, theme: 'light' | 'dark', onToggleTheme: () => void, onLogout: () => void }) {
  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <aside className="w-72 border-r border-slate-200 bg-slate-900 text-slate-300 shadow-2xl shadow-slate-900/20 dark:border-slate-800">
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center font-bold text-xl text-white tracking-tight">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-industrial-500/15 text-industrial-400 animate-float-slow">▲</span>
            Tactive<span className="ml-1 text-slate-400 font-normal">Alloc</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-industrial-500/10 text-industrial-400 shadow-inner shadow-industrial-500/10"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center rounded-2xl bg-slate-800/70 p-3 shadow-lg shadow-slate-950/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-industrial-400 to-industrial-600 text-sm font-bold text-white uppercase shadow-md shadow-industrial-500/30">
              {role ? role.substring(0, 2) : 'US'}
            </div>
            <div className="ml-3 min-w-0">
              <p className="truncate text-sm font-semibold text-white capitalize">{role?.replace('_', ' ')}</p>
              <p className="text-xs text-slate-400">Active User</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/75 px-8 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/75">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Operations</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">Equipment & Plant Allocation</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-industrial-300 hover:text-industrial-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-industrial-500 dark:hover:text-industrial-400"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-soft-rise">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
