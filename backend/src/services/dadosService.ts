import { prisma } from "../lib/prisma.js";
import type { DadosQuery } from "../schemas/queryParams.js";
import { buildWhere } from "./filtrosService.js";

export async function getDados(query: DadosQuery) {
  const where = buildWhere({
    municipio: query.municipio,
    anoInicio: query.anoInicio ?? query.ano,
    anoFim: query.anoFim ?? query.ano,
    rede: query.rede,
    etapa: query.etapa,
    fonte: query.fonte,
    variavel: query.variavel,
  });

  const skip = (query.pagina - 1) * query.tamanho;

  const [total, itens] = await Promise.all([
    prisma.educacaoRegistro.count({ where }),
    prisma.educacaoRegistro.findMany({
      where,
      skip,
      take: query.tamanho,
      orderBy: [{ ano: "desc" }, { noMun: "asc" }, { variavel: "asc" }],
      select: {
        id: true,
        coMun: true,
        noMun: true,
        ano: true,
        fonte: true,
        variavel: true,
        ensinoRede: true,
        ensinoTipo: true,
        valor: true,
      },
    }),
  ]);

  if (total === 0) {
    return {
      semDados: true as const,
      mensagem: "Sem dado no período / recorte selecionado",
      itens: [],
      total: 0,
      pagina: query.pagina,
      tamanho: query.tamanho,
    };
  }

  return {
    semDados: false as const,
    itens: itens.map((item) => ({
      ...item,
      valor: Number(item.valor),
    })),
    total,
    pagina: query.pagina,
    tamanho: query.tamanho,
  };
}
