import { Prisma } from "@prisma/client";
import type { Readable } from "node:stream";
import { prisma } from "../lib/prisma.js";
import type { ParsedCsvRow, RowRejection } from "../schemas/csvRow.js";
import { parseCsvStream } from "./csvParser.js";

const BATCH_SIZE = 2000;

export interface ImportResult {
  linhasLidas: number;
  linhasImportadas: number;
  linhasRejeitadas: number;
  erros: RowRejection[];
}

async function insertBatch(rows: ParsedCsvRow[]): Promise<void> {
  if (rows.length === 0) return;

  await prisma.educacaoRegistro.createMany({
    data: rows.map((row) => ({
      coMun: row.coMun,
      noMun: row.noMun,
      ano: row.ano,
      fonte: row.fonte,
      variavel: row.variavel,
      ensinoRede: row.ensinoRede,
      ensinoTipo: row.ensinoTipo,
      valor: new Prisma.Decimal(row.valor),
    })),
  });
}

export async function importCsv(
  input: Readable | Buffer,
): Promise<ImportResult> {
  const parsed = await parseCsvStream(input);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      'TRUNCATE TABLE "educacao_registros" RESTART IDENTITY',
    );
  });

  for (let i = 0; i < parsed.linhasValidas.length; i += BATCH_SIZE) {
    const batch = parsed.linhasValidas.slice(i, i + BATCH_SIZE);
    await insertBatch(batch);
  }

  return {
    linhasLidas: parsed.linhasLidas,
    linhasImportadas: parsed.linhasValidas.length,
    linhasRejeitadas: parsed.linhasRejeitadas,
    erros: parsed.erros,
  };
}
