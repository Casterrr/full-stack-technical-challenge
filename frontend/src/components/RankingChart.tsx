import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ApiError, fetchRanking } from "../api/client";
import { PERCENTUAL_VARIAVEIS } from "../api/types";
import { useDebouncedFilters } from "../hooks/useDebouncedFilters";
import { formatDecimal, formatNumber, formatPercent } from "../lib/format";
import { EmptyState, ErrorState, LoadingState, Panel } from "./States";

export function RankingChart() {
  const { variavel, rede, etapa, rankingAno } = useDebouncedFilters();
  const isPercent = PERCENTUAL_VARIAVEIS.has(variavel);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["ranking", variavel, rankingAno, rede, etapa],
    queryFn: () =>
      fetchRanking({
        variavel,
        ano: rankingAno!,
        rede,
        etapa: etapa || undefined,
        limite: 15,
      }),
    enabled: Boolean(variavel && rankingAno),
  });

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
            data?.mensagem ??
            "Nenhum município com valor para este recorte."
          }
        />
      ) : null}
      {data && !data.semDados && data.ranking.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.ranking}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e0db" />
              <XAxis
                type="number"
                tick={{ fill: "#4a5c57", fontSize: 12 }}
                tickFormatter={(v: number) =>
                  isPercent ? formatPercent(v, 1) : formatNumber(v)
                }
              />
              <YAxis
                type="category"
                dataKey="municipio"
                width={120}
                tick={{ fill: "#4a5c57", fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => {
                  const num = Number(value);
                  return [
                    isPercent ? formatPercent(num) : formatDecimal(num, 0),
                    variavel,
                  ];
                }}
              />
              <Legend />
              <Bar
                dataKey="valor"
                name={variavel}
                fill="#0f5c4c"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </Panel>
  );
}
