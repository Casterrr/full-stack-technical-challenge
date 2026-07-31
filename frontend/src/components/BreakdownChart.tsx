import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ApiError, fetchFiltros, fetchSeries } from "@/api/client";
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
import { EmptyState, ErrorState, LoadingState, Panel } from "./States";

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
  const isPercent = PERCENTUAL_VARIAVEIS.has(variavel);

  const chartConfig = {
    valor: {
      label: variavel,
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const filtrosQuery = useQuery({
    queryKey: ["filtros"],
    queryFn: fetchFiltros,
  });

  const categorias =
    quebraDimensao === "rede"
      ? (filtrosQuery.data?.redes ?? []).filter((r) => REDES_FOLHA.has(r))
      : (filtrosQuery.data?.etapas ?? []).filter((e) => ETAPAS_BASICAS.has(e));

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "quebra",
      quebraDimensao,
      categorias,
      variavel,
      rankingAno,
      municipios,
      rede,
      etapa,
    ],
    queryFn: async () => {
      const results = await Promise.all(
        categorias.map(async (categoria) => {
          const series = await fetchSeries({
            variavel,
            municipio: municipios.length > 0 ? municipios : undefined,
            rede: quebraDimensao === "rede" ? categoria : rede || undefined,
            etapa: quebraDimensao === "etapa" ? categoria : etapa || undefined,
          });
          const ponto = series.serie.find((s) => s.ano === rankingAno);
          return {
            categoria,
            valor: ponto?.valor ?? null,
          };
        }),
      );

      return results.filter((r) => r.valor !== null) as Array<{
        categoria: string;
        valor: number;
      }>;
    },
    enabled: Boolean(
      filtrosQuery.data && variavel && rankingAno && categorias.length > 0,
    ),
  });

  const titulo =
    quebraDimensao === "rede"
      ? "Quebra por rede de ensino"
      : "Quebra por etapa de ensino";

  return (
    <Panel
      title={titulo}
      subtitle={
        rankingAno
          ? `“${variavel}” em ${rankingAno} (Total/Pública omitidas na quebra por rede)`
          : "Selecione o ano do ranking / quebra"
      }
    >
      {!rankingAno ? (
        <EmptyState
          title="Ano não selecionado"
          description="Escolha o ano do ranking / quebra nos filtros."
        />
      ) : null}
      {rankingAno && (isLoading || filtrosQuery.isLoading) ? (
        <LoadingState label="Carregando quebra…" />
      ) : null}
      {isError || filtrosQuery.isError ? (
        <ErrorState
          message={
            error instanceof ApiError
              ? error.message
              : filtrosQuery.error instanceof ApiError
                ? filtrosQuery.error.message
                : "Falha ao buscar quebra"
          }
          onRetry={() => {
            void filtrosQuery.refetch();
            void refetch();
          }}
        />
      ) : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="Sem dado no período"
          description="Nenhuma categoria retornou valor para este recorte."
        />
      ) : null}
      {data && data.length > 0 ? (
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 8, right: 12, left: 4, bottom: 48 }}
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
            <Bar dataKey="valor" fill="var(--color-valor)" radius={4} />
          </BarChart>
        </ChartContainer>
      ) : null}
    </Panel>
  );
}
