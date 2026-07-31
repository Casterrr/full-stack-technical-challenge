import { useQuery } from "@tanstack/react-query";
import { ApiError, fetchDados } from "@/api/client";
import { PERCENTUAL_VARIAVEIS } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "@/lib/format";
import { filtersToQuery, useFiltersStore } from "@/store/filters";
import {
  EmptyState,
  ErrorState,
  InlineUpdating,
  LoadingState,
  Panel,
} from "./States";

export function DataTable() {
  const filters = useDebouncedFilters();
  const setPagina = useFiltersStore((s) => s.setPagina);
  const setTamanho = useFiltersStore((s) => s.setTamanho);
  const base = filtersToQuery(filters);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "dados",
      base,
      filters.variavel,
      filters.pagina,
      filters.tamanho,
    ],
    queryFn: () =>
      fetchDados({
        ...base,
        variavel: filters.variavel || undefined,
        pagina: filters.pagina,
        tamanho: filters.tamanho,
      }),
  });

  const totalPaginas = data
    ? Math.max(1, Math.ceil(data.total / data.tamanho))
    : 1;

  return (
    <Panel
      title="Tabela de dados"
      subtitle="Paginação no servidor — só o recorte atual"
      action={isFetching && !isLoading ? <InlineUpdating /> : null}
    >
      {isLoading ? <LoadingState label="Carregando tabela…" /> : null}
      {isError ? (
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "Falha ao buscar dados"
          }
          onRetry={() => void refetch()}
        />
      ) : null}
      {data?.semDados || (data && data.total === 0) ? (
        <EmptyState
          title="Sem dado no período"
          description={
            data?.mensagem ?? "Nenhuma linha para o recorte selecionado."
          }
        />
      ) : null}

      {data && !data.semDados && data.total > 0 ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Município</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Variável</TableHead>
                  <TableHead>Rede</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.itens.map((item) => {
                  const isPercent = PERCENTUAL_VARIAVEIS.has(item.variavel);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.noMun}</TableCell>
                      <TableCell className="tabular-nums">{item.ano}</TableCell>
                      <TableCell>{item.variavel}</TableCell>
                      <TableCell>{item.ensinoRede}</TableCell>
                      <TableCell>{item.ensinoTipo}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {isPercent
                          ? formatPercent(item.valor)
                          : formatNumber(item.valor)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              {formatNumber(data.total)} registro(s) · página {data.pagina} de{" "}
              {totalPaginas}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tamanho</span>
                <NativeSelect
                  value={filters.tamanho}
                  onChange={(e) => setTamanho(Number(e.target.value))}
                  className="w-20"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <NativeSelectOption key={n} value={n}>
                      {n}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={filters.pagina <= 1}
                      onClick={() => setPagina(filters.pagina - 1)}
                    >
                      Anterior
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={filters.pagina >= totalPaginas}
                      onClick={() => setPagina(filters.pagina + 1)}
                    >
                      Próxima
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
