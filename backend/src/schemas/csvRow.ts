import { z } from "zod";
import { ANO_MAX, ANO_MIN, EXPECTED_CSV_HEADERS } from "./constants.js";

export type CsvHeader = (typeof EXPECTED_CSV_HEADERS)[number];

export const csvRowRawSchema = z.object({
  co_mun: z.string(),
  no_mun: z.string(),
  ano: z.string(),
  fonte: z.string(),
  variavel: z.string(),
  ensino_rede: z.string(),
  ensino_tipo: z.string(),
  valor: z.string(),
});

export type CsvRowRaw = z.infer<typeof csvRowRawSchema>;

export interface ParsedCsvRow {
  coMun: string;
  noMun: string;
  ano: number;
  fonte: string;
  variavel: string;
  ensinoRede: string;
  ensinoTipo: string;
  valor: number;
}

export interface RowRejection {
  linha: number;
  motivo: string;
}

function isBlank(value: string | undefined | null): boolean {
  return value === undefined || value === null || value.trim() === "";
}

export function validateAndParseRow(
  raw: Record<string, string>,
  lineNumber: number,
): { ok: true; data: ParsedCsvRow } | { ok: false; rejection: RowRejection } {
  for (const header of EXPECTED_CSV_HEADERS) {
    if (!(header in raw)) {
      return {
        ok: false,
        rejection: {
          linha: lineNumber,
          motivo: `Coluna ausente: ${header}`,
        },
      };
    }
  }

  const coMun = raw.co_mun?.trim() ?? "";
  const noMun = raw.no_mun?.trim() ?? "";
  const anoStr = raw.ano?.trim() ?? "";
  const fonte = raw.fonte?.trim() ?? "";
  const variavel = raw.variavel?.trim() ?? "";
  const ensinoRede = raw.ensino_rede?.trim() ?? "";
  const ensinoTipo = raw.ensino_tipo?.trim() ?? "";
  const valorStr = raw.valor?.trim() ?? "";

  if (isBlank(coMun)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "co_mun vazio" },
    };
  }

  if (!/^\d{7}$/.test(coMun)) {
    return {
      ok: false,
      rejection: {
        linha: lineNumber,
        motivo: `co_mun inválido (esperado 7 dígitos): ${coMun}`,
      },
    };
  }

  if (isBlank(noMun)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "no_mun vazio" },
    };
  }

  if (isBlank(anoStr)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "ano vazio" },
    };
  }

  const ano = Number(anoStr);
  if (!Number.isInteger(ano) || Number.isNaN(ano)) {
    return {
      ok: false,
      rejection: {
        linha: lineNumber,
        motivo: `ano não é inteiro: ${anoStr}`,
      },
    };
  }

  if (ano < ANO_MIN || ano > ANO_MAX) {
    return {
      ok: false,
      rejection: {
        linha: lineNumber,
        motivo: `ano fora da faixa ${ANO_MIN}-${ANO_MAX}: ${ano}`,
      },
    };
  }

  if (isBlank(fonte)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "fonte vazia" },
    };
  }

  if (isBlank(variavel)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "variavel vazia" },
    };
  }

  if (isBlank(ensinoRede)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "ensino_rede vazio" },
    };
  }

  if (isBlank(ensinoTipo)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "ensino_tipo vazio" },
    };
  }

  if (isBlank(valorStr)) {
    return {
      ok: false,
      rejection: { linha: lineNumber, motivo: "valor vazio" },
    };
  }

  const valor = Number(valorStr);
  if (Number.isNaN(valor)) {
    return {
      ok: false,
      rejection: {
        linha: lineNumber,
        motivo: `valor não numérico: ${valorStr}`,
      },
    };
  }

  return {
    ok: true,
    data: {
      coMun,
      noMun,
      ano,
      fonte,
      variavel,
      ensinoRede,
      ensinoTipo,
      valor,
    },
  };
}
