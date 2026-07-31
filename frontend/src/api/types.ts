export interface MunicipioFiltro {
  coMun: string;
  noMun: string;
}

export interface FiltrosResponse {
  municipios: MunicipioFiltro[];
  anos: number[];
  redes: string[];
  etapas: string[];
  variaveis: string[];
}

export interface UploadResult {
  linhasLidas: number;
  linhasImportadas: number;
  linhasRejeitadas: number;
  erros: Array<{ linha: number; motivo: string }>;
}

export interface IndicadoresResponse {
  semDados: boolean;
  mensagem?: string;
  totalMatriculas: number | null;
  totalEscolasOfertas: number | null;
  taxaAprovacao: number | null;
  taxaAbandono: number | null;
  variacaoMatriculas: {
    de: number;
    para: number;
    percentual: number;
  } | null;
  meta: {
    rede: string | null;
    etapa: string | null;
    observacaoEscolas: string;
    observacaoPercentuais: string;
    avisos?: string[];
  };
}

export interface SeriesResponse {
  semDados: boolean;
  mensagem?: string;
  serie: Array<{ ano: number; valor: number }>;
  meta?: { agregacao: string };
}

export interface RankingResponse {
  semDados: boolean;
  mensagem?: string;
  ranking: Array<{ coMun: string; municipio: string; valor: number }>;
  meta?: { agregacao: string };
}

export interface DadosResponse {
  semDados: boolean;
  mensagem?: string;
  itens: Array<{
    id: number;
    coMun: string;
    noMun: string;
    ano: number;
    fonte: string;
    variavel: string;
    ensinoRede: string;
    ensinoTipo: string;
    valor: number;
  }>;
  total: number;
  pagina: number;
  tamanho: number;
}

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}

export const PERCENTUAL_VARIAVEIS = new Set([
  "Taxa de Aprovação",
  "Taxa de Reprovação",
  "Taxa de Abandono",
  "Taxa de Alfabetização",
  "Taxa de Analfabetismo",
]);
