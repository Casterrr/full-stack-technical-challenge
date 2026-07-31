import type { ReactNode } from "react";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-32 items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-paper-elevated/60 px-4 py-8 text-ink-muted"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block size-4 animate-spin rounded-full border-2 border-brand border-r-transparent"
        aria-hidden
      />
      <span>{label}</span>
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
    <div className="rounded-lg border border-line bg-warning-soft px-4 py-6 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
    </div>
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
    <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-6 text-center">
      <p className="font-medium text-danger">Erro ao carregar</p>
      <p className="mt-1 text-sm text-ink-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Tentar de novo
        </button>
      ) : null}
    </div>
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
    <section className="rounded-xl border border-line bg-paper-elevated p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
