import { create } from "zustand";

export interface DashboardFilters {
  municipios: string[];
  anoInicio: number | null;
  anoFim: number | null;
  rede: string;
  etapa: string;
  variavel: string;
  rankingAno: number | null;
  quebraDimensao: "rede" | "etapa";
  pagina: number;
  tamanho: number;
}

interface FiltersState extends DashboardFilters {
  setMunicipios: (municipios: string[]) => void;
  setAnoInicio: (ano: number | null) => void;
  setAnoFim: (ano: number | null) => void;
  setRede: (rede: string) => void;
  setEtapa: (etapa: string) => void;
  setVariavel: (variavel: string) => void;
  setRankingAno: (ano: number | null) => void;
  setQuebraDimensao: (dimensao: "rede" | "etapa") => void;
  setPagina: (pagina: number) => void;
  setTamanho: (tamanho: number) => void;
  hydrateFromFiltros: (anos: number[], redes: string[], variaveis: string[]) => void;
}

const DEFAULT_REDE = "Total";
const DEFAULT_VARIAVEL = "Matrícula";

const VARIAVEIS_DEMOGRAFICAS = new Set([
  "Pessoas Alfabetizadas",
  "Pessoas Total",
  "Taxa de Alfabetização",
  "Taxa de Analfabetismo",
]);

const REDE_DEMOGRAFICA = "Não se aplica";
const ETAPA_DEMOGRAFICA = "Pessoas de 15 anos ou mais de idade";

export const useFiltersStore = create<FiltersState>((set, get) => ({
  municipios: [],
  anoInicio: null,
  anoFim: null,
  rede: DEFAULT_REDE,
  etapa: "",
  variavel: DEFAULT_VARIAVEL,
  rankingAno: null,
  quebraDimensao: "rede",
  pagina: 1,
  tamanho: 10,

  setMunicipios: (municipios) => set({ municipios, pagina: 1 }),
  setAnoInicio: (anoInicio) => set({ anoInicio, pagina: 1 }),
  setAnoFim: (anoFim) => set({ anoFim, pagina: 1 }),
  setRede: (rede) => set({ rede, pagina: 1 }),
  setEtapa: (etapa) => set({ etapa, pagina: 1 }),
  setVariavel: (variavel) => {
    if (VARIAVEIS_DEMOGRAFICAS.has(variavel)) {
      set({
        variavel,
        rede: REDE_DEMOGRAFICA,
        etapa: ETAPA_DEMOGRAFICA,
        pagina: 1,
      });
      return;
    }

    const current = get();
    set({
      variavel,
      rede:
        current.rede === REDE_DEMOGRAFICA ? DEFAULT_REDE : current.rede,
      etapa:
        current.etapa === ETAPA_DEMOGRAFICA ? "" : current.etapa,
      pagina: 1,
    });
  },
  setRankingAno: (rankingAno) => set({ rankingAno }),
  setQuebraDimensao: (quebraDimensao) => set({ quebraDimensao }),
  setPagina: (pagina) => set({ pagina }),
  setTamanho: (tamanho) => set({ tamanho, pagina: 1 }),

  hydrateFromFiltros: (anos, redes, variaveis) => {
    const current = get();
    const latestYear = anos.length > 0 ? anos[anos.length - 1] : null;
    const firstYear = anos.length > 0 ? anos[0] : null;

    set({
      anoInicio: current.anoInicio ?? firstYear,
      anoFim: current.anoFim ?? latestYear,
      rankingAno: current.rankingAno ?? latestYear,
      rede: redes.includes(current.rede)
        ? current.rede
        : redes.includes(DEFAULT_REDE)
          ? DEFAULT_REDE
          : (redes[0] ?? DEFAULT_REDE),
      variavel: variaveis.includes(current.variavel)
        ? current.variavel
        : variaveis.includes(DEFAULT_VARIAVEL)
          ? DEFAULT_VARIAVEL
          : (variaveis[0] ?? DEFAULT_VARIAVEL),
    });
  },
}));

export function filtersToQuery(filters: DashboardFilters) {
  return {
    municipio: filters.municipios.length > 0 ? filters.municipios : undefined,
    anoInicio: filters.anoInicio ?? undefined,
    anoFim: filters.anoFim ?? undefined,
    rede: filters.rede || undefined,
    etapa: filters.etapa || undefined,
  };
}
