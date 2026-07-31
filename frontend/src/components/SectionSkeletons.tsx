import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "./States";

export function FiltersSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="pt-(--card-spacing)">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function IndicatorCardsSkeleton() {
  return (
    <Panel title="Indicadores do recorte" subtitle="Calculando indicadores…">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} size="sm" className="bg-muted/30 shadow-none">
            <CardHeader className="space-y-3 pb-0">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent className="pt-2">
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

export function ChartSkeleton({
  title,
  subtitle,
  heightClass = "h-72",
}: {
  title: string;
  subtitle?: string;
  heightClass?: string;
}) {
  return (
    <Panel title={title} subtitle={subtitle ?? "Carregando gráfico…"}>
      <div className={`flex ${heightClass} w-full flex-col justify-end gap-2`}>
        <div className="flex flex-1 items-end gap-2 px-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full rounded-t-md"
              style={{ height: `${35 + ((i * 17) % 55)}%` }}
            />
          ))}
        </div>
        <Skeleton className="h-3 w-40 self-center" />
      </div>
    </Panel>
  );
}

export function TableSkeleton() {
  return (
    <Panel title="Tabela de dados" subtitle="Carregando registros…">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-6 gap-2 border-b bg-muted/40 px-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-6 gap-2 border-b px-3 py-3 last:border-b-0"
            >
              {Array.from({ length: 6 }).map((_, col) => (
                <Skeleton key={col} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </Panel>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  );
}
