import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BreakdownChart } from "@/components/BreakdownChart";
import { DataTable } from "@/components/DataTable";
import { IndicatorCards } from "@/components/IndicatorCards";
import { QuerySection } from "@/components/QuerySection";
import { RankingChart } from "@/components/RankingChart";
import {
  ChartSkeleton,
  DashboardHeaderSkeleton,
  IndicatorCardsSkeleton,
  TableSkeleton,
} from "@/components/SectionSkeletons";
import { SeriesChart } from "@/components/SeriesChart";
import { EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { useFiltrosSuspenseQuery } from "@/hooks/useApiQueries";
import { useFiltersStore } from "@/store/filters";

export function DashboardPage() {
  return (
    <QuerySection
      title="Dashboard"
      fallback={
        <div className="space-y-6">
          <DashboardHeaderSkeleton />
          <IndicatorCardsSkeleton />
        </div>
      }
    >
      <DashboardContent />
    </QuerySection>
  );
}

function DashboardContent() {
  const hydrateFromFiltros = useFiltersStore((s) => s.hydrateFromFiltros);
  const { data } = useFiltrosSuspenseQuery();

  useEffect(() => {
    hydrateFromFiltros(data.anos, data.redes, data.variaveis);
  }, [data, hydrateFromFiltros]);

  const vazios = data.municipios.length === 0 || data.anos.length === 0;

  if (vazios) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <EmptyState
          title="Nenhum dado importado"
          description="Faça o upload de um CSV válido para alimentar o dashboard."
        />
        <Button asChild>
          <Link to="/">Ir para upload</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Indicadores agregados no servidor. Números em pt-BR.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">Novo upload</Link>
        </Button>
      </div>

      <QuerySection
        title="Indicadores do recorte"
        fallback={<IndicatorCardsSkeleton />}
      >
        <IndicatorCards />
      </QuerySection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <QuerySection
          title="Série temporal"
          fallback={
            <ChartSkeleton
              title="Série temporal"
              subtitle="Carregando série…"
            />
          }
        >
          <SeriesChart />
        </QuerySection>

        <QuerySection
          title="Comparação entre municípios"
          fallback={
            <ChartSkeleton
              title="Comparação entre municípios"
              subtitle="Carregando ranking…"
              heightClass="h-80"
            />
          }
        >
          <RankingChart />
        </QuerySection>
      </div>

      <QuerySection
        title="Quebra dimensional"
        fallback={
          <ChartSkeleton
            title="Quebra por dimensão"
            subtitle="Carregando quebra…"
            heightClass="h-80"
          />
        }
      >
        <BreakdownChart />
      </QuerySection>

      <QuerySection title="Tabela de dados" fallback={<TableSkeleton />}>
        <DataTable />
      </QuerySection>
    </div>
  );
}
