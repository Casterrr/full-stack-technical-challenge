import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense, type ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { ApiError } from "@/api/client";
import { ErrorState } from "@/components/States";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SectionErrorFallback({
  error,
  resetErrorBoundary,
  title,
}: FallbackProps & { title?: string }) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Erro inesperado nesta seção";

  return (
    <Card>
      {title ? (
        <CardHeader className="border-b">
          <CardTitle className="font-heading text-lg">{title}</CardTitle>
          <CardDescription>
            Esta seção falhou de forma isolada — o restante do dashboard segue
            disponível.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={title ? "pt-(--card-spacing)" : undefined}>
        <ErrorState message={message} onRetry={resetErrorBoundary} />
      </CardContent>
    </Card>
  );
}

/**
 * Isola loading (Suspense + skeleton) e erro (Error Boundary) por seção.
 * Integra com TanStack Query via QueryErrorResetBoundary.
 */
export function QuerySection({
  children,
  fallback,
  title,
}: {
  children: ReactNode;
  fallback: ReactNode;
  title?: string;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={(props) => (
            <SectionErrorFallback {...props} title={title} />
          )}
        >
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
