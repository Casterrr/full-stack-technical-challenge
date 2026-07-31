import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDados,
  fetchFiltros,
  fetchIndicadores,
  fetchRanking,
  fetchSeries,
  uploadCsv,
} from "@/api/client";
import {
  queryKeys,
  type DadosParams,
  type IndicadoresParams,
  type QuebraParams,
  type RankingParams,
  type SeriesParams,
} from "@/api/queryKeys";

export function useFiltrosQuery() {
  return useQuery({
    queryKey: queryKeys.filtros(),
    queryFn: fetchFiltros,
  });
}

export function useIndicadoresQuery(params: IndicadoresParams) {
  return useQuery({
    queryKey: queryKeys.indicadores(params),
    queryFn: () => fetchIndicadores(params),
  });
}

export function useSeriesQuery(
  params: SeriesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.series(params),
    queryFn: () => fetchSeries(params),
    enabled: options?.enabled ?? Boolean(params.variavel),
  });
}

export function useRankingQuery(
  params: RankingParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.ranking(params),
    queryFn: () => fetchRanking(params),
    enabled: options?.enabled ?? Boolean(params.variavel && params.ano),
  });
}

export function useDadosQuery(params: DadosParams) {
  return useQuery({
    queryKey: queryKeys.dados(params),
    queryFn: () => fetchDados(params),
  });
}

export function useQuebraQuery(
  params: QuebraParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.quebra(params),
    queryFn: async () => {
      const results = await Promise.all(
        params.categorias.map(async (categoria) => {
          const series = await fetchSeries({
            variavel: params.variavel,
            municipio: params.municipio,
            rede:
              params.quebraDimensao === "rede"
                ? categoria
                : params.rede || undefined,
            etapa:
              params.quebraDimensao === "etapa"
                ? categoria
                : params.etapa || undefined,
          });
          const ponto = series.serie.find((s) => s.ano === params.rankingAno);
          return {
            categoria,
            valor: ponto?.valor ?? null,
          };
        }),
      );

      return results.filter((r) => r.valor !== null) as Array<{
        categoria: string;
        valor: number;
      }>;
    },
    enabled:
      options?.enabled ??
      Boolean(
        params.variavel &&
          params.rankingAno &&
          params.categorias.length > 0,
      ),
  });
}

/** Upload invalida todo o cache da API para o dashboard refletir os novos dados. */
export function useUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadCsv(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}
