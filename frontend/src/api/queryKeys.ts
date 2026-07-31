import type {
  DadosResponse,
  FiltrosResponse,
  IndicadoresResponse,
  RankingResponse,
  SeriesResponse,
  UploadResult,
} from "./types";

export type IndicadoresParams = {
  municipio?: string[];
  anoInicio?: number;
  anoFim?: number;
  ano?: number;
  rede?: string;
  etapa?: string;
};

export type SeriesParams = {
  variavel: string;
  municipio?: string[];
  rede?: string;
  etapa?: string;
  anoInicio?: number;
  anoFim?: number;
};

export type RankingParams = {
  variavel: string;
  ano: number;
  rede?: string;
  etapa?: string;
  limite?: number;
};

export type DadosParams = {
  municipio?: string[];
  anoInicio?: number;
  anoFim?: number;
  ano?: number;
  rede?: string;
  etapa?: string;
  fonte?: string;
  variavel?: string;
  pagina?: number;
  tamanho?: number;
};

export type QuebraParams = {
  quebraDimensao: "rede" | "etapa";
  categorias: string[];
  variavel: string;
  rankingAno: number;
  municipio?: string[];
  rede?: string;
  etapa?: string;
};

/** Factory de query keys — cache compartilhado e invalidação previsível. */
export const queryKeys = {
  all: ["api"] as const,
  filtros: () => [...queryKeys.all, "filtros"] as const,
  indicadores: (params: IndicadoresParams) =>
    [...queryKeys.all, "indicadores", params] as const,
  series: (params: SeriesParams) =>
    [...queryKeys.all, "series", params] as const,
  ranking: (params: RankingParams) =>
    [...queryKeys.all, "ranking", params] as const,
  dados: (params: DadosParams) => [...queryKeys.all, "dados", params] as const,
  quebra: (params: QuebraParams) =>
    [...queryKeys.all, "quebra", params] as const,
};

export type {
  DadosResponse,
  FiltrosResponse,
  IndicadoresResponse,
  RankingResponse,
  SeriesResponse,
  UploadResult,
};
