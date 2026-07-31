import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ApiError, uploadCsv } from "../api/client";
import type { UploadResult } from "../api/types";
import { formatNumber } from "../lib/format";

const fileSchema = z
  .custom<File>((value) => value instanceof File, {
    message: "Selecione um arquivo .csv",
  })
  .refine((file) => file.name.toLowerCase().endsWith(".csv"), {
    message: "Apenas arquivos com extensão .csv são aceitos",
  })
  .refine((file) => file.size > 0, { message: "Arquivo vazio" });

export function UploadPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const mutation = useMutation({
    mutationFn: (selected: File) => uploadCsv(selected),
    onSuccess: async (data) => {
      setResult(data);
      await queryClient.invalidateQueries();
    },
  });

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setResult(null);
    setValidationError(null);
    mutation.reset();

    if (!selected) {
      setFile(null);
      return;
    }

    const parsed = fileSchema.safeParse(selected);
    if (!parsed.success) {
      setFile(null);
      setValidationError(parsed.error.issues[0]?.message ?? "Arquivo inválido");
      return;
    }

    setFile(parsed.data);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setResult(null);

    const parsed = fileSchema.safeParse(file);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? "Arquivo inválido");
      return;
    }

    mutation.mutate(parsed.data);
  }

  const apiError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Falha inesperada no upload"
        : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-ink">Importar CSV</h1>
      <p className="mt-2 text-ink-muted">
        Envie o arquivo de educação (UTF-8, separador vírgula). O parsing ocorre
        no servidor. Uma nova importação <strong>substitui</strong> os dados
        anteriores.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-5 rounded-xl border border-line bg-paper-elevated p-5 shadow-sm sm:p-6"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink">
            Arquivo .csv
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onFileChange}
            disabled={mutation.isPending}
            className="block w-full cursor-pointer rounded-lg border border-line bg-paper px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-hover disabled:opacity-60"
          />
        </label>

        {file ? (
          <p className="text-sm text-ink-muted">
            Selecionado: <span className="font-medium text-ink">{file.name}</span>{" "}
            ({formatNumber(file.size)} bytes)
          </p>
        ) : null}

        {validationError ? (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {validationError}
          </p>
        ) : null}

        {apiError ? (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {apiError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending || !file}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {mutation.isPending ? (
            <>
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-white border-r-transparent"
                aria-hidden
              />
              Processando no servidor…
            </>
          ) : (
            "Enviar e importar"
          )}
        </button>

        {mutation.isPending ? (
          <p className="text-sm text-ink-muted">
            Com ~145 mil linhas o processamento pode levar alguns segundos.
            Aguarde o resumo.
          </p>
        ) : null}
      </form>

      {result ? (
        <div className="mt-6 space-y-4 rounded-xl border border-brand/20 bg-brand-soft p-5">
          <h2 className="font-display text-lg font-semibold text-brand">
            Importação concluída
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-paper-elevated px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                Linhas lidas
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {formatNumber(result.linhasLidas)}
              </dd>
            </div>
            <div className="rounded-lg bg-paper-elevated px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                Importadas
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-brand">
                {formatNumber(result.linhasImportadas)}
              </dd>
            </div>
            <div className="rounded-lg bg-paper-elevated px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                Rejeitadas
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-accent">
                {formatNumber(result.linhasRejeitadas)}
              </dd>
            </div>
          </dl>

          {result.erros.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">
                Motivos das rejeições (até {result.erros.length})
              </p>
              <ul className="max-h-48 overflow-auto rounded-lg border border-line bg-paper-elevated text-sm">
                {result.erros.map((erro) => (
                  <li
                    key={`${erro.linha}-${erro.motivo}`}
                    className="border-b border-line px-3 py-2 last:border-b-0"
                  >
                    <span className="font-medium">Linha {erro.linha}:</span>{" "}
                    {erro.motivo}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            to="/dashboard"
            className="inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Ir para o dashboard
          </Link>
        </div>
      ) : null}
    </div>
  );
}
