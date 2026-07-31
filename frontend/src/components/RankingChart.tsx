import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ApiError } from "@/api/client";
import { PERCENTUAL_VARIAVEIS } from "@/api/types";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useRankingQuery } from "@/hooks/useApiQueries";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "@/lib/format";
import { EmptyState, ErrorState, LoadingState, Panel } from "./States";

export function RankingChart() {
  const { variavel, rede, etapa, rankingAno } = useDebouncedFilters();
  const isPercent = PERCENTUAL_VARIAVEIS.has(variavel);

  const chartConfig = {
    valor: {
      label: variavel,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const { data, isLoading, isError, error, refetch } = useRankingQuery(
    {
      variavel,
      ano: rankingAno ?? 0,
      rede,
      etapa: etapa || undefined,
      limite: 15,
    },
    { enabled: Boolean(variavel && rankingAno) },
  );

  return (
    <Panel
      title="Comparação entre municípios"
      subtitle={
        rankingAno
          ? `Ranking de “${variavel}” em ${rankingAno}`
          : "Selecione o ano do ranking"
      }
    >
      {!rankingAno ? (
        <EmptyState
          title="Ano não selecionado"
          description="Escolha o ano do ranking / quebra nos filtros."
        />
      ) : null}
      {rankingAno && isLoading ? (
        <LoadingState label="Carregando ranking…" />
      ) : null}
      {isError ? (
        <ErrorState
          message={
            error instanceof ApiError
              ? error.message
              : "Falha ao buscar ranking"
          }
          onRetry={() => void refetch()}
        />
      ) : null}
      {data?.semDados || (data && data.ranking.length === 0) ? (
        <EmptyState
          title="Sem dado no período"
          description={
            data?.mensagem ?? "Nenhum município com valor para este recorte."
          }
        />
      ) : null}
      {data && !data.semDados && data.ranking.length > 0 ? (
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <BarChart
            accessibilityLayer
            data={data.ranking}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                isPercent ? formatPercent(v, 1) : formatNumber(v)
              }
            />
            <YAxis
              type="category"
              dataKey="municipio"
              width={120}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    isPercent
                      ? formatPercent(Number(value))
                      : formatNumber(Number(value))
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="valor" fill="var(--color-valor)" radius={4} />
          </BarChart>
        </ChartContainer>
      ) : null}
    </Panel>
  );
}
