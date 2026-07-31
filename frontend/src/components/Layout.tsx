import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand text-white"
      : "text-ink-muted hover:bg-brand-soft hover:text-brand",
  ].join(" ");

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper-elevated/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-brand sm:text-2xl">
              Educação Alagoas
            </p>
            <p className="text-sm text-ink-muted">
              Upload de CSV e dashboard de indicadores educacionais
            </p>
          </div>
          <nav className="flex gap-1" aria-label="Principal">
            <NavLink to="/" end className={linkClass}>
              Upload
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
