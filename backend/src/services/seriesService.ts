import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { PERCENTUAL_VARIAVEIS } from "../schemas/constants.js";
import type { SeriesQuery } from "../schemas/queryParams.js";
import { checkDimensionCompatibility } from "./compatibility.js";

function sqlWhereFragments(filters: {
  municipio?: string[];
  rede?: string;
  etapa?: string;
  anoInicio?: number;
  anoFim?: number;
  variavel: string;
}): Prisma.Sql[] {
  const parts: Prisma.Sql[] = [Prisma.sql`t.variavel = ${filters.variavel}`];

  if (filters.municipio && filters.municipio.length > 0) {
    parts.push(
      Prisma.sql`(t.co_mun IN (${Prisma.join(filters.municipio)}) OR t.no_mun IN (${Prisma.join(filters.municipio)}))`,
    );
  }

  if (filters.rede) {
    parts.push(Prisma.sql`t.ensino_rede = ${filters.rede}`);
  }

  if (filters.etapa) {
    parts.push(Prisma.sql`t.ensino_tipo = ${filters.etapa}`);
  }

  if (filters.anoInicio !== undefined) {
    parts.push(Prisma.sql`t.ano >= ${filters.anoInicio}`);
  }

  if (filters.anoFim !== undefined) {
    parts.push(Prisma.sql`t.ano <= ${filters.anoFim}`);
  }

  return parts;
}

export async function getSeries(query: SeriesQuery) {
  const compatibility = checkDimensionCompatibility({
    variavel: query.variavel,
    rede: query.rede,
    etapa: query.etapa,
  });

  if (!compatibility.ok) {
    return {
      semDados: true as const,
      mensagem: compatibility.mensagem,
      serie: [] as Array<{ ano: number; valor: number }>,
    };
  }

  const isPercentual = PERCENTUAL_VARIAVEIS.has(query.variavel);
  const parts = sqlWhereFragments({
    municipio: query.municipio,
    rede: query.rede,
    etapa: query.etapa,
    anoInicio: query.anoInicio,
    anoFim: query.anoFim,
    variavel: query.variavel,
  });
  const whereSql = Prisma.sql`WHERE ${Prisma.join(parts, " AND ")}`;

  if (isPercentual) {
    const rows = await prisma.$queryRaw<
      Array<{ ano: number; valor: Prisma.Decimal | null }>
    >`
      SELECT
        t.ano,
        CASE
          WHEN COALESCE(SUM(m.valor), 0) > 0
            THEN SUM(t.valor * m.valor) / SUM(m.valor)
          ELSE AVG(t.valor)
        END AS valor
      FROM educacao_registros t
      LEFT JOIN educacao_registros m
        ON m.co_mun = t.co_mun
        AND m.ano = t.ano
        AND m.ensino_rede = t.ensino_rede
        AND m.ensino_tipo = t.ensino_tipo
        AND m.variavel = 'Matrícula'
      ${whereSql}
      GROUP BY t.ano
      ORDER BY t.ano ASC
    `;

    if (rows.length === 0) {
      return {
        semDados: true as const,
        mensagem: "Sem dado no período / recorte selecionado",
        serie: [] as Array<{ ano: number; valor: number }>,
      };
    }

    return {
      semDados: false as const,
      serie: rows
        .filter((r) => r.valor !== null)
        .map((r) => ({ ano: r.ano, valor: Number(r.valor) })),
      meta: { agregacao: "media_ponderada_por_matriculas" },
    };
  }

  const rows = await prisma.$queryRaw<
    Array<{ ano: number; valor: Prisma.Decimal | null }>
  >`
    SELECT t.ano, SUM(t.valor) AS valor
    FROM educacao_registros t
    ${whereSql}
    GROUP BY t.ano
    ORDER BY t.ano ASC
  `;

  if (rows.length === 0) {
    return {
      semDados: true as const,
      mensagem: "Sem dado no período / recorte selecionado",
      serie: [] as Array<{ ano: number; valor: number }>,
    };
  }

  return {
    semDados: false as const,
    serie: rows
      .filter((r) => r.valor !== null)
      .map((r) => ({ ano: r.ano, valor: Number(r.valor) })),
    meta: { agregacao: "soma" },
  };
}
