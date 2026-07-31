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
import {
  useFiltrosSuspenseQuery,
  useQuebraSuspenseQuery,
} from "@/hooks/useApiQueries";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "@/lib/format";
import { EmptyState, Panel } from "./States";

const REDES_FOLHA = new Set([
  "Estadual",
  "Municipal",
  "Federal",
  "Privada",
  "Não se aplica",
]);

const ETAPAS_BASICAS = new Set([
  "Educação Infantil",
  "Ensino Fundamental",
  "Ensino Médio",
  "Educação de Jovens e Adultos (EJA)",
  "Educação Profissional",
  "Pessoas de 15 anos ou mais de idade",
]);

export function BreakdownChart() {
  const {
    municipios,
    variavel,
    rede,
    etapa,
    rankingAno,
    quebraDimensao,
  } = useDebouncedFilters();

  const titulo =
    quebraDimensao === "rede"
      ? "Quebra por rede de ensino"
      : "Quebra por etapa de ensino";

  if (!rankingAno) {
    return (
      <Panel title={titulo} subtitle="Selecione o ano do ranking / quebra">
        <EmptyState
          title="Ano não selecionado"
          description="Escolha o ano do ranking / quebra nos filtros."
        />
      </Panel>
    );
  }

  return (
    <BreakdownChartContent
      municipios={municipios}
      variavel={variavel}
      rede={rede}
      etapa={etapa}
      rankingAno={rankingAno}
      quebraDimensao={quebraDimensao}
      titulo={titulo}
    />
  );
}

function BreakdownChartContent({
  municipios,
  variavel,
  rede,
  etapa,
  rankingAno,
  quebraDimensao,
  titulo,
}: {
  municipios: string[];
  variavel: string;
  rede: string;
  etapa: string;
  rankingAno: number;
  quebraDimensao: "rede" | "etapa";
  titulo: string;
}) {
  const isPercent = PERCENTUAL_VARIAVEIS.has(variavel);
  const { data: filtros } = useFiltrosSuspenseQuery();

  const categorias =
    quebraDimensao === "rede"
      ? filtros.redes.filter((r) => REDES_FOLHA.has(r))
      : filtros.etapas.filter((e) => ETAPAS_BASICAS.has(e));

  const chartConfig = {
    valor: {
      label: variavel,
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  if (categorias.length === 0) {
    return (
      <Panel
        title={titulo}
        subtitle={`“${variavel}” em ${rankingAno}`}
      >
        <EmptyState
          title="Sem categorias"
          description="Não há categorias disponíveis para esta quebra."
        />
      </Panel>
    );
  }

  return (
    <BreakdownBars
      chartConfig={chartConfig}
      titulo={titulo}
      variavel={variavel}
      rankingAno={rankingAno}
      quebraDimensao={quebraDimensao}
      isPercent={isPercent}
      params={{
        quebraDimensao,
        categorias,
        variavel,
        rankingAno,
        municipio: municipios.length > 0 ? municipios : undefined,
        rede: rede || undefined,
        etapa: etapa || undefined,
      }}
    />
  );
}

function BreakdownBars({
  chartConfig,
  titulo,
  variavel,
  rankingAno,
  quebraDimensao,
  isPercent,
  params,
}: {
  chartConfig: ChartConfig;
  titulo: string;
  variavel: string;
  rankingAno: number;
  quebraDimensao: "rede" | "etapa";
  isPercent: boolean;
  params: {
    quebraDimensao: "rede" | "etapa";
    categorias: string[];
    variavel: string;
    rankingAno: number;
    municipio?: string[];
    rede?: string;
    etapa?: string;
  };
}) {
  const { data } = useQuebraSuspenseQuery(params);

  if (data.length === 0) {
    return (
      <Panel
        title={titulo}
        subtitle={`“${variavel}” em ${rankingAno} (Total/Pública omitidas na quebra por rede)`}
      >
        <EmptyState
          title="Sem dado no período"
          description="Nenhuma categoria retornou valor para este recorte."
        />
      </Panel>
    );
  }

  return (
    <Panel
      title={titulo}
      subtitle={`“${variavel}” em ${rankingAno} (Total/Pública omitidas na quebra por rede)`}
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 12, left: 12, bottom: 64 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="categoria"
            interval={0}
            angle={-25}
            textAnchor="end"
            height={70}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            label={{
              value:
                quebraDimensao === "rede"
                  ? "Rede de ensino"
                  : "Etapa de ensino",
              position: "insideBottom",
              offset: -8,
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
              value: variavel,
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
          <ChartLegend
            verticalAlign="top"
            content={<ChartLegendContent verticalAlign="top" />}
          />
          <Bar dataKey="valor" fill="var(--color-valor)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}
