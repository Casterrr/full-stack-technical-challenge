import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? undefined,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Parâmetros inválidos",
      details: err.flatten(),
    });
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "LIMIT_FILE_SIZE"
  ) {
    res.status(400).json({
      error: "Arquivo muito grande. Limite: 50 MB.",
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: "Erro interno do servidor",
  });
}
