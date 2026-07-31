import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PERCENTUAL_VARIAVEIS, type DadosResponse } from "@/api/types";
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
import { useDadosSuspenseQuery } from "@/hooks/useApiQueries";
import { useDebouncedFilters } from "@/hooks/useDebouncedFilters";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { filtersToQuery, useFiltersStore } from "@/store/filters";
import { EmptyState, InlineUpdating, Panel } from "./States";

type DadosItem = DadosResponse["itens"][number];

const columns: ColumnDef<DadosItem>[] = [
  {
    accessorKey: "noMun",
    header: "Município",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: "ano",
    header: "Ano",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{getValue<number>()}</span>
    ),
  },
  {
    accessorKey: "variavel",
    header: "Variável",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: "ensinoRede",
    header: "Rede",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: "ensinoTipo",
    header: "Etapa",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: "valor",
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row, getValue }) => {
      const valor = getValue<number>();
      const isPercent = PERCENTUAL_VARIAVEIS.has(row.original.variavel);
      return (
        <div className="text-right font-medium tabular-nums">
          {isPercent ? formatPercent(valor) : formatNumber(valor)}
        </div>
      );
    },
  },
];

export function DataTable() {
  const filters = useDebouncedFilters();
  const setPagina = useFiltersStore((s) => s.setPagina);
  const setTamanho = useFiltersStore((s) => s.setTamanho);
  const base = filtersToQuery(filters);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isFetching } = useDadosSuspenseQuery({
    ...base,
    variavel: filters.variavel || undefined,
    pagina: filters.pagina,
    tamanho: filters.tamanho,
  });

  const pageCount = Math.max(1, Math.ceil(data.total / data.tamanho));

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(0, filters.pagina - 1),
      pageSize: filters.tamanho,
    }),
    [filters.pagina, filters.tamanho],
  );

  function onPaginationChange(updater: Updater<PaginationState>) {
    const next =
      typeof updater === "function" ? updater(pagination) : updater;
    if (next.pageSize !== filters.tamanho) {
      setTamanho(next.pageSize);
      return;
    }
    if (next.pageIndex !== pagination.pageIndex) {
      setPagina(next.pageIndex + 1);
    }
  }

  const table = useReactTable({
    data: data.itens,
    columns,
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount,
    rowCount: data.total,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.id),
  });

  return (
    <Panel
      title="Tabela de dados"
      subtitle="Paginação no servidor — só o recorte atual"
      action={isFetching ? <InlineUpdating /> : null}
    >
      {data.semDados || data.total === 0 ? (
        <EmptyState
          title="Sem dado no período"
          description={
            data.mensagem ?? "Nenhuma linha para o recorte selecionado."
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder ? null : canSort ? (
                            <button
                              type="button"
                              className={cn(
                                "inline-flex items-center gap-1.5 hover:text-foreground",
                                sorted && "text-foreground",
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {sorted === "asc" ? (
                                <ArrowUpIcon className="size-3.5" />
                              ) : sorted === "desc" ? (
                                <ArrowDownIcon className="size-3.5" />
                              ) : (
                                <ChevronsUpDownIcon className="size-3.5 opacity-40" />
                              )}
                            </button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              {formatNumber(data.total)} registro(s) · página{" "}
              {table.getState().pagination.pageIndex + 1} de {pageCount}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tamanho</span>
                <NativeSelect
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
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
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                    >
                      Anterior
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                    >
                      Próxima
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
