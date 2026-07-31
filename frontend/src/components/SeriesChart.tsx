import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ApiError, fetchSeries } from "@/api/client";
import { PERCENTUAL_VARIAVEIS } from "@/api/types";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "@/lib/format";
import { filtersToQuery } from "@/store/filters";
import { EmptyState, ErrorState, LoadingState, Panel } from "./States";

export function SeriesChart() {
  const filters = useDebouncedFilters();
  const base = filtersToQuery(filters);
  const isPercent = PERCENTUAL_VARIAVEIS.has(filters.variavel);

  const chartConfig = {
    valor: {
      label: filters.variavel,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["series", filters.variavel, base],
    queryFn: () =>
      fetchSeries({
        variavel: filters.variavel,
        ...base,
      }),
    enabled: Boolean(filters.variavel),
  });

  return (
    <Panel
      title="Série temporal"
      subtitle={`Evolução de “${filters.variavel}” ao longo dos anos`}
    >
      {isLoading ? <LoadingState label="Carregando série…" /> : null}
      {isError ? (
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "Falha ao buscar série"
          }
          onRetry={() => void refetch()}
        />
      ) : null}
      {data?.semDados || (data && data.serie.length === 0) ? (
        <EmptyState
          title="Sem dado no período"
          description={
            data?.mensagem ??
            "Não há pontos na série para este recorte. Ausência não é preenchida com zero."
          }
        />
      ) : null}
      {data && !data.semDados && data.serie.length > 0 ? (
        <div className="space-y-2">
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <LineChart
              accessibilityLayer
              data={data.serie}
              margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="ano"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v: number) =>
                  isPercent ? formatPercent(v, 1) : formatNumber(v)
                }
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
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--color-valor)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
          {data.meta?.agregacao ? (
            <p className="text-xs text-muted-foreground">
              Agregação: {data.meta.agregacao.replaceAll("_", " ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}
