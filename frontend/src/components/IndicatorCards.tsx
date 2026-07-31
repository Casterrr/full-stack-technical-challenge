import { useQuery } from "@tanstack/react-query";
import { ApiError, fetchIndicadores } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import {
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from "@/lib/format";
import { filtersToQuery } from "@/store/filters";
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
      subtitle="Cards agregados no servidor para o filtro atual"
      action={
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">Rede: {data.meta.rede ?? "—"}</Badge>
          {data.meta.etapa ? (
            <Badge variant="outline">Etapa: {data.meta.etapa}</Badge>
          ) : null}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} size="sm" className="bg-muted/30 shadow-none">
            <CardHeader className="pb-0">
              <CardDescription className="text-xs font-medium tracking-wide uppercase">
                {card.label}
              </CardDescription>
              <CardTitle className="font-heading text-2xl tabular-nums">
                {card.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-snug text-muted-foreground">
                {card.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Panel>
  );
}
