import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
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

export function useFiltrosSuspenseQuery() {
  return useSuspenseQuery({
    queryKey: queryKeys.filtros(),
    queryFn: fetchFiltros,
  });
}

export function useIndicadoresSuspenseQuery(params: IndicadoresParams) {
  return useSuspenseQuery({
    queryKey: queryKeys.indicadores(params),
    queryFn: () => fetchIndicadores(params),
  });
}

export function useSeriesSuspenseQuery(params: SeriesParams) {
  return useSuspenseQuery({
    queryKey: queryKeys.series(params),
    queryFn: () => fetchSeries(params),
  });
}

export function useRankingSuspenseQuery(params: RankingParams) {
  return useSuspenseQuery({
    queryKey: queryKeys.ranking(params),
    queryFn: () => fetchRanking(params),
  });
}

export function useDadosSuspenseQuery(params: DadosParams) {
  return useSuspenseQuery({
    queryKey: queryKeys.dados(params),
    queryFn: () => fetchDados(params),
  });
}

export function useQuebraSuspenseQuery(params: QuebraParams) {
  return useSuspenseQuery({
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
