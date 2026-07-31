import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUpIcon } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ApiError, uploadCsv } from "@/api/client";
import type { UploadResult } from "@/api/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatNumber } from "@/lib/format";

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Importar CSV
        </h1>
        <p className="mt-2 text-muted-foreground">
          Envie o arquivo de educação (UTF-8, separador vírgula). O parsing
          ocorre no servidor. Uma nova importação{" "}
          <strong className="text-foreground">substitui</strong> os dados
          anteriores.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquivo</CardTitle>
          <CardDescription>
            Aceita apenas <code>.csv</code>. Com ~145 mil linhas o processamento
            pode levar alguns segundos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="upload-form" onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Selecionar arquivo</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={onFileChange}
                disabled={mutation.isPending}
              />
            </div>

            {file ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{file.name}</Badge>
                <span>{formatNumber(file.size)} bytes</span>
              </div>
            ) : null}

            {validationError ? (
              <Alert variant="destructive">
                <AlertTitle>Validação</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            ) : null}

            {apiError ? (
              <Alert variant="destructive">
                <AlertTitle>Erro da API</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Campo multipart: <code>file</code>
          </p>
          <Button
            type="submit"
            form="upload-form"
            disabled={mutation.isPending || !file}
          >
            {mutation.isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Processando…
              </>
            ) : (
              <>
                <FileUpIcon data-icon="inline-start" />
                Enviar e importar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result ? (
        <Card className="ring-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Importação concluída</CardTitle>
            <CardDescription>
              Resumo devolvido pelo backend após o processamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Linhas lidas" value={formatNumber(result.linhasLidas)} />
              <Stat
                label="Importadas"
                value={formatNumber(result.linhasImportadas)}
                tone="primary"
              />
              <Stat
                label="Rejeitadas"
                value={formatNumber(result.linhasRejeitadas)}
                tone="accent"
              />
            </div>

            {result.erros.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Motivos das rejeições ({result.erros.length})
                </p>
                <Separator />
                <ul className="max-h-48 overflow-auto rounded-lg border text-sm">
                  {result.erros.map((erro) => (
                    <li
                      key={`${erro.linha}-${erro.motivo}`}
                      className="border-b px-3 py-2 last:border-b-0"
                    >
                      <span className="font-medium">Linha {erro.linha}:</span>{" "}
                      {erro.motivo}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard">Ir para o dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "primary" | "accent";
}) {
  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={
          tone === "primary"
            ? "mt-1 font-heading text-2xl font-semibold tabular-nums text-primary"
            : tone === "accent"
              ? "mt-1 font-heading text-2xl font-semibold tabular-nums text-chart-2"
              : "mt-1 font-heading text-2xl font-semibold tabular-nums"
        }
      >
        {value}
      </p>
    </div>
  );
}
