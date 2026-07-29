import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export function buildWhere(filters: {
  municipio?: string[];
  anoInicio?: number;
  anoFim?: number;
  ano?: number;
  rede?: string;
  etapa?: string;
  fonte?: string;
  variavel?: string;
}): Prisma.EducacaoRegistroWhereInput {
  const where: Prisma.EducacaoRegistroWhereInput = {};

  if (filters.municipio && filters.municipio.length > 0) {
    where.OR = [
      { coMun: { in: filters.municipio } },
      { noMun: { in: filters.municipio } },
    ];
  }

  if (filters.ano !== undefined) {
    where.ano = filters.ano;
  } else if (
    filters.anoInicio !== undefined ||
    filters.anoFim !== undefined
  ) {
    where.ano = {};
    if (filters.anoInicio !== undefined) {
      where.ano.gte = filters.anoInicio;
    }
    if (filters.anoFim !== undefined) {
      where.ano.lte = filters.anoFim;
    }
  }

  if (filters.rede) {
    where.ensinoRede = filters.rede;
  }

  if (filters.etapa) {
    where.ensinoTipo = filters.etapa;
  }

  if (filters.fonte) {
    where.fonte = filters.fonte;
  }

  if (filters.variavel) {
    where.variavel = filters.variavel;
  }

  return where;
}

export async function getFiltros() {
  const [municipios, anos, redes, etapas, variaveis] = await Promise.all([
    prisma.educacaoRegistro.findMany({
      distinct: ["coMun", "noMun"],
      select: { coMun: true, noMun: true },
      orderBy: { noMun: "asc" },
    }),
    prisma.educacaoRegistro.findMany({
      distinct: ["ano"],
      select: { ano: true },
      orderBy: { ano: "asc" },
    }),
    prisma.educacaoRegistro.findMany({
      distinct: ["ensinoRede"],
      select: { ensinoRede: true },
      orderBy: { ensinoRede: "asc" },
    }),
    prisma.educacaoRegistro.findMany({
      distinct: ["ensinoTipo"],
      select: { ensinoTipo: true },
      orderBy: { ensinoTipo: "asc" },
    }),
    prisma.educacaoRegistro.findMany({
      distinct: ["variavel"],
      select: { variavel: true },
      orderBy: { variavel: "asc" },
    }),
  ]);

  return {
    municipios: municipios.map((m) => ({
      coMun: m.coMun,
      noMun: m.noMun,
    })),
    anos: anos.map((a) => a.ano),
    redes: redes.map((r) => r.ensinoRede),
    etapas: etapas.map((e) => e.ensinoTipo),
    variaveis: variaveis.map((v) => v.variavel),
  };
}
