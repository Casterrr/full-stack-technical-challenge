import { parse } from "csv-parse";
import type { Readable } from "node:stream";
import { AppError } from "../lib/errors.js";
import { EXPECTED_CSV_HEADERS } from "../schemas/constants.js";
import {
  type ParsedCsvRow,
  type RowRejection,
  validateAndParseRow,
} from "../schemas/csvRow.js";

export interface ParseCsvResult {
  linhasLidas: number;
  linhasValidas: ParsedCsvRow[];
  linhasRejeitadas: number;
  erros: RowRejection[];
}

function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim();
}

export function validateCsvHeaders(headers: string[]): void {
  const normalized = headers.map(normalizeHeader);

  if (normalized.length === 0) {
    throw new AppError(400, "Arquivo sem cabeçalho CSV válido");
  }

  const expected = [...EXPECTED_CSV_HEADERS];
  const missing = expected.filter((h) => !normalized.includes(h));
  const unexpected = normalized.filter(
    (h) => !expected.includes(h as (typeof EXPECTED_CSV_HEADERS)[number]),
  );

  if (missing.length > 0 || unexpected.length > 0) {
    const parts: string[] = [];
    if (missing.length > 0) {
      parts.push(`colunas ausentes: ${missing.join(", ")}`);
    }
    if (unexpected.length > 0) {
      parts.push(`colunas inesperadas: ${unexpected.join(", ")}`);
    }
    throw new AppError(
      400,
      `Cabeçalho CSV inválido (${parts.join("; ")}). Esperado: ${expected.join(",")}`,
    );
  }

  for (let i = 0; i < expected.length; i++) {
    if (normalized[i] !== expected[i]) {
      throw new AppError(
        400,
        `Cabeçalho CSV fora da ordem esperada. Na posição ${i + 1} esperava "${expected[i]}", recebeu "${normalized[i]}"`,
      );
    }
  }
}

export async function parseCsvStream(
  input: Readable | Buffer,
  options?: { maxErros?: number },
): Promise<ParseCsvResult> {
  const maxErros = options?.maxErros ?? 500;
  const linhasValidas: ParsedCsvRow[] = [];
  const erros: RowRejection[] = [];
  let linhasLidas = 0;
  let linhasRejeitadas = 0;
  let headersValidated = false;

  const parser = parse({
    columns: (headers: string[]) => {
      const normalized = headers.map(normalizeHeader);
      validateCsvHeaders(normalized);
      headersValidated = true;
      return normalized;
    },
    bom: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: false,
    delimiter: ",",
  });

  const consume = new Promise<ParseCsvResult>((resolve, reject) => {
    parser.on("readable", () => {
      let record: Record<string, string> | null;
      while ((record = parser.read() as Record<string, string> | null) !== null) {
        linhasLidas += 1;
        const lineNumber = linhasLidas + 1; // +1 pelo cabeçalho
        const result = validateAndParseRow(record, lineNumber);
        if (result.ok) {
          linhasValidas.push(result.data);
        } else {
          linhasRejeitadas += 1;
          if (erros.length < maxErros) {
            erros.push(result.rejection);
          }
        }
      }
    });

    parser.on("error", (err: Error) => {
      if (err instanceof AppError) {
        reject(err);
        return;
      }
      if (err.message.includes("Invalid Record Length")) {
        reject(
          new AppError(
            400,
            "Arquivo CSV malformado: número de colunas inconsistente entre as linhas",
          ),
        );
        return;
      }
      // csv-parse envelopa exceções do callback `columns` em Error genérico
      if (err.message.includes("Cabeçalho CSV")) {
        reject(new AppError(400, err.message));
        return;
      }
      reject(new AppError(400, `Falha ao ler CSV: ${err.message}`));
    });

    parser.on("end", () => {
      if (!headersValidated) {
        reject(new AppError(400, "Arquivo sem cabeçalho CSV válido"));
        return;
      }
      resolve({
        linhasLidas,
        linhasValidas,
        linhasRejeitadas,
        erros,
      });
    });
  });

  if (Buffer.isBuffer(input)) {
    parser.write(input);
    parser.end();
  } else {
    input.pipe(parser);
  }

  return consume;
}
