import { useQuery } from "@tanstack/react-query";
import { ApiError, fetchIndicadores } from "../api/client";
import { useDebouncedFilters } from "../hooks/useDebouncedFilters";
import {
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from "../lib/format";
import { filtersToQuery } from "../store/filters";
import { EmptyState, ErrorState, LoadingState, Panel } from "./States";

export function IndicatorCards() {
  const filters = useDebouncedFilters();
  const queryParams = filtersToQuery(filters);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["indicadores", queryParams],
    queryFn: () => fetchIndicadores(queryParams),
  });

  if (isLoading) {
    return (
      <Panel title="Indicadores do recorte">
        <LoadingState label="Calculando indicadores…" />
      </Panel>
    );
  }

  if (isError) {
    return (
      <Panel title="Indicadores do recorte">
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "Falha ao buscar cards"
          }
          onRetry={() => void refetch()}
        />
      </Panel>
    );
  }

  if (!data || data.semDados) {
    return (
      <Panel title="Indicadores do recorte">
        <EmptyState
          title="Sem dado no período"
          description={
            data?.mensagem ??
            "Nenhum indicador disponível para o recorte selecionado."
          }
        />
      </Panel>
    );
  }

  const cards = [
    {
      label: "Total de matrículas",
      value: formatNumber(data.totalMatriculas),
      hint: "Soma no recorte (rede exclusiva)",
    },
    {
      label: "Ofertas de ensino",
      value: formatNumber(data.totalEscolasOfertas),
      hint: data.meta.observacaoEscolas,
    },
    {
      label: "Taxa média de aprovação",
      value: formatPercent(data.taxaAprovacao),
      hint: "Média ponderada por matrículas",
    },
    {
      label: "Taxa de abandono",
      value: formatPercent(data.taxaAbandono),
      hint: "Média ponderada por matrículas",
    },
    {
      label: "Variação de matrículas",
      value: data.variacaoMatriculas
        ? formatSignedPercent(data.variacaoMatriculas.percentual)
        : "—",
      hint: data.variacaoMatriculas
        ? `${data.variacaoMatriculas.de} → ${data.variacaoMatriculas.para}`
        : "Requer ao menos dois anos no recorte",
    },
  ];

  return (
    <Panel
      title="Indicadores do recorte"
      subtitle={`Rede: ${data.meta.rede ?? "—"}${data.meta.etapa ? ` · Etapa: ${data.meta.etapa}` : ""}`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-lg border border-line bg-paper px-3 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {card.label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">
              {card.value}
            </p>
            <p className="mt-1 text-xs leading-snug text-ink-muted">{card.hint}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
