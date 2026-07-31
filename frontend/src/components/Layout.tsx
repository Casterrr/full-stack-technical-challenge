import { NavLink, Outlet } from "react-router-dom";
import {
  HeaderFiltersDesktop,
  HeaderFiltersMobile,
} from "@/components/HeaderFilters";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/90 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-heading text-xl font-semibold tracking-tight text-primary sm:text-2xl">
              Educação Alagoas
            </p>
            <p className="text-sm text-muted-foreground">
              Upload de CSV e dashboard de indicadores educacionais
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderFiltersMobile />
            <nav className="flex gap-1" aria-label="Principal">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    buttonVariants({
                      variant: isActive ? "default" : "ghost",
                      size: "sm",
                    }),
                  )
                }
              >
                Upload
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cn(
                    buttonVariants({
                      variant: isActive ? "default" : "ghost",
                      size: "sm",
                    }),
                  )
                }
              >
                Dashboard
              </NavLink>
            </nav>
          </div>
        </div>
        <HeaderFiltersDesktop />
      </header>
      <main className="mx-auto max-w-10/12 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
