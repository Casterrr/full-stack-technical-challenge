import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { PERCENTUAL_VARIAVEIS } from "../schemas/constants.js";
import type { RankingQuery } from "../schemas/queryParams.js";
import { checkDimensionCompatibility } from "./compatibility.js";

export async function getRanking(query: RankingQuery) {
  const compatibility = checkDimensionCompatibility({
    variavel: query.variavel,
    rede: query.rede,
    etapa: query.etapa,
  });

  if (!compatibility.ok) {
    return {
      semDados: true as const,
      mensagem: compatibility.mensagem,
      ranking: [] as Array<{ coMun: string; municipio: string; valor: number }>,
    };
  }

  const isPercentual = PERCENTUAL_VARIAVEIS.has(query.variavel);
  const parts: Prisma.Sql[] = [
    Prisma.sql`t.variavel = ${query.variavel}`,
    Prisma.sql`t.ano = ${query.ano}`,
  ];

  if (query.municipio && query.municipio.length > 0) {
    parts.push(
      Prisma.sql`(t.co_mun IN (${Prisma.join(query.municipio)}) OR t.no_mun IN (${Prisma.join(query.municipio)}))`,
    );
  }

  if (query.rede) {
    parts.push(Prisma.sql`t.ensino_rede = ${query.rede}`);
  }

  if (query.etapa) {
    parts.push(Prisma.sql`t.ensino_tipo = ${query.etapa}`);
  }

  const whereSql = Prisma.sql`WHERE ${Prisma.join(parts, " AND ")}`;

  if (isPercentual) {
    const rows = await prisma.$queryRaw<
      Array<{
        co_mun: string;
        no_mun: string;
        valor: Prisma.Decimal | null;
      }>
    >`
      SELECT
        t.co_mun,
        t.no_mun,
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
      GROUP BY t.co_mun, t.no_mun
      HAVING CASE
        WHEN COALESCE(SUM(m.valor), 0) > 0
          THEN SUM(t.valor * m.valor) / SUM(m.valor)
        ELSE AVG(t.valor)
      END IS NOT NULL
      ORDER BY valor DESC NULLS LAST
      LIMIT ${query.limite}
    `;

    if (rows.length === 0) {
      return {
        semDados: true as const,
        mensagem: "Sem dado no período / recorte selecionado",
        ranking: [] as Array<{ coMun: string; municipio: string; valor: number }>,
      };
    }

    return {
      semDados: false as const,
      ranking: rows.map((r) => ({
        coMun: r.co_mun,
        municipio: r.no_mun,
        valor: Number(r.valor),
      })),
      meta: { agregacao: "media_ponderada_por_matriculas" },
    };
  }

  const rows = await prisma.$queryRaw<
    Array<{
      co_mun: string;
      no_mun: string;
      valor: Prisma.Decimal | null;
    }>
  >`
    SELECT t.co_mun, t.no_mun, SUM(t.valor) AS valor
    FROM educacao_registros t
    ${whereSql}
    GROUP BY t.co_mun, t.no_mun
    ORDER BY valor DESC NULLS LAST
    LIMIT ${query.limite}
  `;

  if (rows.length === 0) {
    return {
      semDados: true as const,
      mensagem: "Sem dado no período / recorte selecionado",
      ranking: [] as Array<{ coMun: string; municipio: string; valor: number }>,
    };
  }

  return {
    semDados: false as const,
    ranking: rows.map((r) => ({
      coMun: r.co_mun,
      municipio: r.no_mun,
      valor: Number(r.valor),
    })),
    meta: { agregacao: "soma" },
  };
}
