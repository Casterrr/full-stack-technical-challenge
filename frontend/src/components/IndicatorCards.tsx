import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIndicadoresSuspenseQuery } from "@/hooks/useApiQueries";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import {
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from "@/lib/format";
import { filtersToQuery } from "@/store/filters";
import { EmptyState, Panel } from "./States";

export function IndicatorCards() {
  const filters = useDebouncedFilters();
  const queryParams = filtersToQuery(filters);
  const { data } = useIndicadoresSuspenseQuery(queryParams);

  if (data.semDados) {
    return (
      <Panel title="Indicadores do recorte">
        <EmptyState
          title="Sem dado no período"
          description={
            data.mensagem ??
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
      
      {data.meta.avisos && data.meta.avisos.length > 0 ? (
        <>
          <p className="mt-3 text-xs font-medium tracking-wide uppercase bg-yellow-200">Avisos:</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {data.meta.avisos.join(" · ")}
          </p>
        </>
      ) : null}
    </Panel>
  );
}
