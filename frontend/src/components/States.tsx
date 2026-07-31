import { AlertCircleIcon, InboxIcon, LoaderCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-32 items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-4" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  title = "Sem dado no período",
  description = "O recorte selecionado não retornou registros. Ajuste os filtros ou importe um CSV.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Empty className="border border-dashed border-border bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Erro ao carregar</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="w-fit">
            Tentar de novo
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="font-heading text-lg">{title}</CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="pt-(--card-spacing)">{children}</CardContent>
    </Card>
  );
}

export function InlineUpdating() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <LoaderCircleIcon className="size-3.5 animate-spin" />
      Atualizando…
    </span>
  );
}
