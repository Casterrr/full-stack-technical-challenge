import { useQuery } from "@tanstack/react-query";
import { ApiError, fetchDados } from "../api/client";
import { PERCENTUAL_VARIAVEIS } from "../api/types";
import { useDebouncedFilters } from "../hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "../lib/format";
import { filtersToQuery, useFiltersStore } from "../store/filters";
import { EmptyState, ErrorState, LoadingState, Panel } from "./States";

export function DataTable() {
  const filters = useDebouncedFilters();
  const setPagina = useFiltersStore((s) => s.setPagina);
  const setTamanho = useFiltersStore((s) => s.setTamanho);
  const base = filtersToQuery(filters);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "dados",
      base,
      filters.variavel,
      filters.pagina,
      filters.tamanho,
    ],
    queryFn: () =>
      fetchDados({
        ...base,
        variavel: filters.variavel || undefined,
        pagina: filters.pagina,
        tamanho: filters.tamanho,
      }),
  });

  const totalPaginas = data
    ? Math.max(1, Math.ceil(data.total / data.tamanho))
    : 1;

  return (
    <Panel
      title="Tabela de dados"
      subtitle="Paginação no servidor — só o recorte atual"
      action={
        isFetching && !isLoading ? (
          <span className="text-xs text-ink-muted">Atualizando…</span>
        ) : null
      }
    >
      {isLoading ? <LoadingState label="Carregando tabela…" /> : null}
      {isError ? (
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "Falha ao buscar dados"
          }
          onRetry={() => void refetch()}
        />
      ) : null}
      {data?.semDados || (data && data.total === 0) ? (
        <EmptyState
          title="Sem dado no período"
          description={
            data?.mensagem ?? "Nenhuma linha para o recorte selecionado."
          }
        />
      ) : null}

      {data && !data.semDados && data.total > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <thead className="bg-brand-soft text-ink">
                <tr>
                  <th className="px-3 py-2 font-medium">Município</th>
                  <th className="px-3 py-2 font-medium">Ano</th>
                  <th className="px-3 py-2 font-medium">Variável</th>
                  <th className="px-3 py-2 font-medium">Rede</th>
                  <th className="px-3 py-2 font-medium">Etapa</th>
                  <th className="px-3 py-2 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-paper-elevated">
                {data.itens.map((item) => {
                  const isPercent = PERCENTUAL_VARIAVEIS.has(item.variavel);
                  return (
                    <tr key={item.id} className="hover:bg-paper">
                      <td className="px-3 py-2">{item.noMun}</td>
                      <td className="px-3 py-2 tabular-nums">{item.ano}</td>
                      <td className="px-3 py-2">{item.variavel}</td>
                      <td className="px-3 py-2">{item.ensinoRede}</td>
                      <td className="px-3 py-2">{item.ensinoTipo}</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">
                        {isPercent
                          ? formatPercent(item.valor)
                          : formatNumber(item.valor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {formatNumber(data.total)} registro(s) · página {data.pagina} de{" "}
              {totalPaginas}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2">
                <span className="text-ink-muted">Tamanho</span>
                <select
                  value={filters.tamanho}
                  onChange={(e) => setTamanho(Number(e.target.value))}
                  className="rounded-md border border-line bg-paper-elevated px-2 py-1"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={filters.pagina <= 1}
                onClick={() => setPagina(filters.pagina - 1)}
                className="rounded-md border border-line px-3 py-1.5 font-medium hover:bg-brand-soft disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={filters.pagina >= totalPaginas}
                onClick={() => setPagina(filters.pagina + 1)}
                className="rounded-md border border-line px-3 py-1.5 font-medium hover:bg-brand-soft disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      ) : null}
    </Panel>
  );
}
