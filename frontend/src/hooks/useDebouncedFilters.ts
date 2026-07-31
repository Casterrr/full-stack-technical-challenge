import { useFiltersStore, type DashboardFilters } from "../store/filters";
import { useDebouncedValue } from "./useDebouncedValue";

/** Snapshot debounced dos filtros — use nas queries da API. */
export function useDebouncedFilters(delayMs = 350): DashboardFilters {
  const municipios = useFiltersStore((s) => s.municipios);
  const anoInicio = useFiltersStore((s) => s.anoInicio);
  const anoFim = useFiltersStore((s) => s.anoFim);
  const rede = useFiltersStore((s) => s.rede);
  const etapa = useFiltersStore((s) => s.etapa);
  const variavel = useFiltersStore((s) => s.variavel);
  const rankingAno = useFiltersStore((s) => s.rankingAno);
  const quebraDimensao = useFiltersStore((s) => s.quebraDimensao);
  const pagina = useFiltersStore((s) => s.pagina);
  const tamanho = useFiltersStore((s) => s.tamanho);

  return useDebouncedValue(
    {
      municipios,
      anoInicio,
      anoFim,
      rede,
      etapa,
      variavel,
      rankingAno,
      quebraDimensao,
      pagina,
      tamanho,
    },
    delayMs,
  );
}
