import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ApiError, fetchFiltros } from "../api/client";
import { BreakdownChart } from "../components/BreakdownChart";
import { DataTable } from "../components/DataTable";
import { FiltersBar } from "../components/FiltersBar";
import { IndicatorCards } from "../components/IndicatorCards";
import { RankingChart } from "../components/RankingChart";
import { SeriesChart } from "../components/SeriesChart";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { useFiltersStore } from "../store/filters";

export function DashboardPage() {
  const hydrateFromFiltros = useFiltersStore((s) => s.hydrateFromFiltros);

  const filtrosQuery = useQuery({
    queryKey: ["filtros"],
    queryFn: fetchFiltros,
  });

  useEffect(() => {
    if (filtrosQuery.data) {
      hydrateFromFiltros(
        filtrosQuery.data.anos,
        filtrosQuery.data.redes,
        filtrosQuery.data.variaveis,
      );
    }
  }, [filtrosQuery.data, hydrateFromFiltros]);

  if (filtrosQuery.isLoading) {
    return <LoadingState label="Carregando filtros…" />;
  }

  if (filtrosQuery.isError) {
    return (
      <ErrorState
        message={
          filtrosQuery.error instanceof ApiError
            ? filtrosQuery.error.message
            : "Não foi possível carregar os filtros"
        }
        onRetry={() => void filtrosQuery.refetch()}
      />
    );
  }

  const data = filtrosQuery.data;
  const vazios =
    !data || data.municipios.length === 0 || data.anos.length === 0;

  if (vazios) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
        <EmptyState
          title="Nenhum dado importado"
          description="Faça o upload de um CSV válido para alimentar o dashboard."
        />
        <Link
          to="/"
          className="inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Ir para upload
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-ink-muted">
            Indicadores agregados no servidor. Números em pt-BR.
          </p>
        </div>
        <Link
          to="/"
          className="rounded-lg border border-line bg-paper-elevated px-3 py-2 text-sm font-medium text-brand hover:bg-brand-soft"
        >
          Novo upload
        </Link>
      </div>

      <FiltersBar options={data} />
      <IndicatorCards />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SeriesChart />
        <RankingChart />
      </div>
      <BreakdownChart />
      <DataTable />
    </div>
  );
}
