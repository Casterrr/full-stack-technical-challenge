import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ApiError, fetchSeries } from "../api/client";
import { PERCENTUAL_VARIAVEIS } from "../api/types";
import { useDebouncedFilters } from "../hooks/useDebouncedFilters";
import { formatDecimal, formatNumber, formatPercent } from "../lib/format";
import { filtersToQuery } from "../store/filters";
import { EmptyState, ErrorState, LoadingState, Panel } from "./States";

export function SeriesChart() {
  const filters = useDebouncedFilters();
  const base = filtersToQuery(filters);
  const isPercent = PERCENTUAL_VARIAVEIS.has(filters.variavel);

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
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.serie}
              margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e0db" />
              <XAxis
                dataKey="ano"
                tick={{ fill: "#4a5c57", fontSize: 12 }}
                label={{
                  value: "Ano",
                  position: "insideBottom",
                  offset: -2,
                  fill: "#4a5c57",
                }}
              />
              <YAxis
                tick={{ fill: "#4a5c57", fontSize: 12 }}
                tickFormatter={(v: number) =>
                  isPercent ? formatPercent(v, 1) : formatNumber(v)
                }
                width={72}
              />
              <Tooltip
                formatter={(value) => {
                  const num = Number(value);
                  return [
                    isPercent ? formatPercent(num) : formatDecimal(num, 0),
                    filters.variavel,
                  ];
                }}
                labelFormatter={(label) => `Ano ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                name={filters.variavel}
                stroke="#0f5c4c"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
          {data.meta?.agregacao ? (
            <p className="mt-2 text-xs text-ink-muted">
              Agregação: {data.meta.agregacao.replaceAll("_", " ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}
