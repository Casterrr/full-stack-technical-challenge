import { FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiltersFields } from "@/components/FiltersFields";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiltrosQuery } from "@/hooks/useApiQueries";
import { useFiltersStore } from "@/store/filters";

function useDashboardFiltros() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const hydrateFromFiltros = useFiltersStore((s) => s.hydrateFromFiltros);
  const query = useFiltrosQuery(isDashboard);

  useEffect(() => {
    if (!query.data) return;
    hydrateFromFiltros(query.data.anos, query.data.redes, query.data.variaveis);
  }, [query.data, hydrateFromFiltros]);

  const hasData =
    Boolean(query.data) &&
    query.data!.municipios.length > 0 &&
    query.data!.anos.length > 0;

  return { isDashboard, hasData, ...query };
}

/** Botão + sheet de filtros — fica na linha do nav (só mobile). */
export function HeaderFiltersMobile() {
  const location = useLocation();
  const { isDashboard, hasData, data, isLoading, isError } =
    useDashboardFiltros();
  const municipios = useFiltersStore((s) => s.municipios);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!isDashboard || isError) return null;

  if (isLoading) {
    return <Skeleton className="size-7 lg:hidden" />;
  }

  if (!hasData || !data) return null;

  const activeCount = municipios.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Abrir filtros"
          className="relative lg:hidden"
        >
          <FilterIcon />
          {activeCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {activeCount > 9 ? "9+" : activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="border-b px-4 py-3 text-left">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Afetam cards, gráficos e tabela. Rede padrão: Total.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto overscroll-contain px-4 py-4">
          <FiltersFields
            options={data}
            idPrefix="mobile-filtro"
            layout="stack"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Faixa de filtros no header — só desktop. */
export function HeaderFiltersDesktop() {
  const { isDashboard, hasData, data, isLoading, isError } =
    useDashboardFiltros();

  if (!isDashboard || isError) return null;

  if (isLoading) {
    return (
      <div className="hidden lg:block">
        <Separator />
        <div className="px-4 py-3 sm:px-6">
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!hasData || !data) return null;

  return (
    <div className="hidden lg:block">
      <Separator />
      <div className="px-4 sm:px-6 flex gap-1 items-center mt-2">
      <p className="text-md font-medium tracking-wide uppercase">Filtros</p>
          <p className="text-xs text-muted-foreground">
            Afetam cards, gráficos e tabela. Rede padrão: Total.
          </p>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <FiltersFields options={data} idPrefix="header-filtro" />
      </div>
    </div>
  );
}
