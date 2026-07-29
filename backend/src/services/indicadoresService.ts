import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { PERCENTUAL_VARIAVEIS } from "../schemas/constants.js";
import type { IndicadoresQuery } from "../schemas/queryParams.js";
import { buildWhere } from "./filtrosService.js";

function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

function sqlWhereFragments(filters: {
  municipio?: string[];
  anoInicio?: number;
  anoFim?: number;
  ano?: number;
  rede?: string;
  etapa?: string;
}): Prisma.Sql[] {
  const parts: Prisma.Sql[] = [];

  if (filters.municipio && filters.municipio.length > 0) {
    parts.push(
      Prisma.sql`(t.co_mun IN (${Prisma.join(filters.municipio)}) OR t.no_mun IN (${Prisma.join(filters.municipio)}))`,
    );
  }

  if (filters.ano !== undefined) {
    parts.push(Prisma.sql`t.ano = ${filters.ano}`);
  } else {
    if (filters.anoInicio !== undefined) {
      parts.push(Prisma.sql`t.ano >= ${filters.anoInicio}`);
    }
    if (filters.anoFim !== undefined) {
      parts.push(Prisma.sql`t.ano <= ${filters.anoFim}`);
    }
  }

  if (filters.rede) {
    parts.push(Prisma.sql`t.ensino_rede = ${filters.rede}`);
  }

  if (filters.etapa) {
    parts.push(Prisma.sql`t.ensino_tipo = ${filters.etapa}`);
  }

  return parts;
}

async function sumVariavel(
  where: Prisma.EducacaoRegistroWhereInput,
  variavel: string,
): Promise<number | null> {
  const result = await prisma.educacaoRegistro.aggregate({
    where: { ...where, variavel },
    _sum: { valor: true },
    _count: { _all: true },
  });

  if (result._count._all === 0) return null;
  return toNumber(result._sum.valor);
}

async function weightedAverage(filters: {
  municipio?: string[];
  anoInicio?: number;
  anoFim?: number;
  ano?: number;
  rede?: string;
  etapa?: string;
  taxaVariavel: string;
}): Promise<number | null> {
  const parts = sqlWhereFragments(filters);
  parts.push(Prisma.sql`t.variavel = ${filters.taxaVariavel}`);

  const whereSql = Prisma.sql`WHERE ${Prisma.join(parts, " AND ")}`;

  const rows = await prisma.$queryRaw<
    Array<{ media: Prisma.Decimal | null; com_peso: bigint; sem_peso: bigint }>
  >`
    SELECT
      CASE
        WHEN COALESCE(SUM(m.valor), 0) > 0
          THEN SUM(t.valor * m.valor) / SUM(m.valor)
        WHEN COUNT(t.id) FILTER (WHERE m.valor IS NULL) > 0
          THEN AVG(t.valor) FILTER (WHERE m.valor IS NULL)
        ELSE NULL
      END AS media,
      COUNT(t.id) FILTER (WHERE m.valor IS NOT NULL) AS com_peso,
      COUNT(t.id) FILTER (WHERE m.valor IS NULL) AS sem_peso
    FROM educacao_registros t
    LEFT JOIN educacao_registros m
      ON m.co_mun = t.co_mun
      AND m.ano = t.ano
      AND m.ensino_rede = t.ensino_rede
      AND m.ensino_tipo = t.ensino_tipo
      AND m.variavel = 'Matrícula'
    ${whereSql}
  `;

  const media = rows[0]?.media;
  if (media === null || media === undefined) return null;
  return Number(media);
}

async function yearOverYearVariation(
  where: Prisma.EducacaoRegistroWhereInput,
  variavel: string,
): Promise<{ de: number; para: number; percentual: number } | null> {
  const anos = await prisma.educacaoRegistro.findMany({
    where: { ...where, variavel },
    distinct: ["ano"],
    select: { ano: true },
    orderBy: { ano: "asc" },
  });

  if (anos.length < 2) return null;

  const primeiro = anos[0].ano;
  const ultimo = anos[anos.length - 1].ano;

  const [sumPrimeiro, sumUltimo] = await Promise.all([
    sumVariavel({ ...where, ano: primeiro }, variavel),
    sumVariavel({ ...where, ano: ultimo }, variavel),
  ]);

  if (sumPrimeiro === null || sumUltimo === null || sumPrimeiro === 0) {
    return null;
  }

  return {
    de: primeiro,
    para: ultimo,
    percentual: ((sumUltimo - sumPrimeiro) / sumPrimeiro) * 100,
  };
}

export async function getIndicadores(query: IndicadoresQuery) {
  const filterBase = {
    municipio: query.municipio,
    anoInicio: query.anoInicio ?? query.ano,
    anoFim: query.anoFim ?? query.ano,
    rede: query.rede,
    etapa: query.etapa,
  };

  const where = buildWhere(filterBase);
  const totalRegistros = await prisma.educacaoRegistro.count({ where });

  if (totalRegistros === 0) {
    return {
      semDados: true as const,
      mensagem: "Sem dado no período / recorte selecionado",
      totalMatriculas: null,
      totalEscolasOfertas: null,
      taxaAprovacao: null,
      taxaAbandono: null,
      variacaoMatriculas: null,
      meta: {
        rede: query.rede ?? null,
        etapa: query.etapa ?? null,
        observacaoEscolas:
          "Card de escolas representa ofertas de ensino (soma por etapa), não o total físico de escolas.",
        observacaoPercentuais:
          "Taxas usam média ponderada por matrículas quando possível.",
      },
    };
  }

  const [
    totalMatriculas,
    totalEscolasOfertas,
    taxaAprovacao,
    taxaAbandono,
    variacaoMatriculas,
  ] = await Promise.all([
    sumVariavel(where, "Matrícula"),
    sumVariavel(where, "Escolas"),
    weightedAverage({ ...filterBase, taxaVariavel: "Taxa de Aprovação" }),
    weightedAverage({ ...filterBase, taxaVariavel: "Taxa de Abandono" }),
    yearOverYearVariation(where, "Matrícula"),
  ]);

  return {
    semDados: false as const,
    totalMatriculas,
    totalEscolasOfertas,
    taxaAprovacao,
    taxaAbandono,
    variacaoMatriculas,
    meta: {
      rede: query.rede ?? null,
      etapa: query.etapa ?? null,
      observacaoEscolas:
        "Card de escolas representa ofertas de ensino (soma por etapa), não o total físico de escolas.",
      observacaoPercentuais:
        "Taxas usam média ponderada por matrículas quando possível.",
      percentualVariaveis: [...PERCENTUAL_VARIAVEIS],
    },
  };
}
