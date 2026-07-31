import type {
  DadosResponse,
  FiltrosResponse,
  IndicadoresResponse,
  RankingResponse,
  SeriesResponse,
  UploadResult,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = data as { error?: string; details?: unknown } | null;
    throw new ApiError(
      body?.error ?? `Erro HTTP ${response.status}`,
      response.status,
      body?.details,
    );
  }

  return data as T;
}

function toSearchParams(
  params: Record<string, string | number | string[] | undefined | null>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      search.set(key, value.join(","));
      continue;
    }
    search.set(key, String(value));
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchFiltros(): Promise<FiltrosResponse> {
  const response = await fetch(`${API_BASE}/api/filtros`);
  return parseJson(response);
}

export async function uploadCsv(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: form,
  });

  return parseJson(response);
}

export async function fetchIndicadores(params: {
  municipio?: string[];
  anoInicio?: number;
  anoFim?: number;
  ano?: number;
  rede?: string;
  etapa?: string;
}): Promise<IndicadoresResponse> {
  const response = await fetch(
    `${API_BASE}/api/indicadores${toSearchParams(params)}`,
  );
  return parseJson(response);
}

export async function fetchSeries(params: {
  variavel: string;
  municipio?: string[];
  rede?: string;
  etapa?: string;
  anoInicio?: number;
  anoFim?: number;
}): Promise<SeriesResponse> {
  const response = await fetch(
    `${API_BASE}/api/series${toSearchParams(params)}`,
  );
  return parseJson(response);
}

export async function fetchRanking(params: {
  variavel: string;
  ano: number;
  rede?: string;
  etapa?: string;
  limite?: number;
}): Promise<RankingResponse> {
  const response = await fetch(
    `${API_BASE}/api/ranking${toSearchParams(params)}`,
  );
  return parseJson(response);
}

export async function fetchDados(params: {
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
}): Promise<DadosResponse> {
  const response = await fetch(
    `${API_BASE}/api/dados${toSearchParams(params)}`,
  );
  return parseJson(response);
}
