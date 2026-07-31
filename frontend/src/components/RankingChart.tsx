import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PERCENTUAL_VARIAVEIS } from "@/api/types";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useRankingSuspenseQuery } from "@/hooks/useApiQueries";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "@/lib/format";
import { EmptyState, Panel } from "./States";

export function RankingChart() {
  const { municipios, variavel, rede, etapa, rankingAno } =
    useDebouncedFilters();

  if (!rankingAno) {
    return (
      <Panel
        title="Comparação entre municípios"
        subtitle="Selecione o ano do ranking"
      >
        <EmptyState
          title="Ano não selecionado"
          description="Escolha o ano do ranking / quebra nos filtros."
        />
      </Panel>
    );
  }

  return (
    <RankingChartContent
      municipios={municipios}
      variavel={variavel}
      rede={rede}
      etapa={etapa}
      rankingAno={rankingAno}
    />
  );
}

function RankingChartContent({
  municipios,
  variavel,
  rede,
  etapa,
  rankingAno,
}: {
  municipios: string[];
  variavel: string;
  rede: string;
  etapa: string;
  rankingAno: number;
}) {
  const isPercent = PERCENTUAL_VARIAVEIS.has(variavel);

  const chartConfig = {
    valor: {
      label: variavel,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const { data } = useRankingSuspenseQuery({
    variavel,
    ano: rankingAno,
    municipio: municipios.length > 0 ? municipios : undefined,
    rede,
    etapa: etapa || undefined,
    limite: 15,
  });

  if (data.semDados || data.ranking.length === 0) {
    return (
      <Panel
        title="Comparação entre municípios"
        subtitle={`Ranking de “${variavel}” em ${rankingAno}`}
      >
        <EmptyState
          title="Sem dado no período"
          description={
            data.mensagem ?? "Nenhum município com valor para este recorte."
          }
        />
      </Panel>
    );
  }

  return (
    <Panel
      title="Comparação entre municípios"
      subtitle={`Ranking de “${variavel}” em ${rankingAno}`}
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
        <BarChart
          accessibilityLayer
          data={data.ranking}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 28 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              isPercent ? formatPercent(v, 1) : formatNumber(v)
            }
            label={{
              value: variavel,
              position: "insideBottom",
              offset: -16,
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
          <YAxis
            type="category"
            dataKey="municipio"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            label={{
              value: "Município",
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
          <Bar dataKey="valor" fill="var(--color-valor)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}
