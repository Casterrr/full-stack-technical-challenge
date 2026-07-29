export const EXPECTED_CSV_HEADERS = [
  "co_mun",
  "no_mun",
  "ano",
  "fonte",
  "variavel",
  "ensino_rede",
  "ensino_tipo",
  "valor",
] as const;

export const FONTES = [
  "censo_escolar",
  "indicadores_rendimento",
  "censo_demografico",
] as const;

export const REDES = [
  "Estadual",
  "Municipal",
  "Federal",
  "Privada",
  "Pública",
  "Total",
  "Não se aplica",
] as const;

export const ANO_MIN = 2007;
export const ANO_MAX = 2025;

export const DEFAULT_REDE = "Total";

export const PERCENTUAL_VARIAVEIS = new Set([
  "Taxa de Aprovação",
  "Taxa de Reprovação",
  "Taxa de Abandono",
  "Taxa de Alfabetização",
  "Taxa de Analfabetismo",
]);

export const CONTAGEM_VARIAVEIS = new Set([
  "Escolas",
  "Matrícula",
  "Pessoas Alfabetizadas",
  "Pessoas Total",
]);
