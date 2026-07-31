import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { PERCENTUAL_VARIAVEIS } from "@/api/types";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useSeriesSuspenseQuery } from "@/hooks/useApiQueries";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "@/lib/format";
import { filtersToQuery } from "@/store/filters";
import { EmptyState, Panel } from "./States";

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

  const { data } = useSeriesSuspenseQuery({
    variavel: filters.variavel,
    ...base,
  });

  if (data.semDados || data.serie.length === 0) {
    return (
      <Panel
        title="Série temporal"
        subtitle={`Evolução de “${filters.variavel}” ao longo dos anos`}
      >
        <EmptyState
          title="Sem dado no período"
          description={
            data.mensagem ??
            "Não há pontos na série para este recorte. Ausência não é preenchida com zero."
          }
        />
      </Panel>
    );
  }

  return (
    <Panel
      title="Série temporal"
      subtitle={`Evolução de “${filters.variavel}” ao longo dos anos`}
    >
      <div className="space-y-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <LineChart
            accessibilityLayer
            data={data.serie}
            margin={{ top: 8, right: 12, left: 12, bottom: 28 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="ano"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{
                value: "Ano",
                position: "insideBottom",
                offset: -16,
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={72}
              tickFormatter={(v: number) =>
                isPercent ? formatPercent(v, 1) : formatNumber(v)
              }
              label={{
                value: filters.variavel,
                angle: -90,
                position: "insideLeft",
                offset: 4,
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
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
    </Panel>
  );
}
