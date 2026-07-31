import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { queryClient } from "@/api/queryClient";
import { Layout } from "@/components/Layout";
import { ErrorState } from "@/components/States";
import { DashboardPage } from "@/pages/DashboardPage";
import { UploadPage } from "@/pages/UploadPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
            <ErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Erro inesperado na aplicação"
              }
              onRetry={resetErrorBoundary}
            />
          </div>
        )}
      >
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<UploadPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
