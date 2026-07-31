const TAXAS_RENDIMENTO = new Set([
  "Taxa de Aprovação",
  "Taxa de Reprovação",
  "Taxa de Abandono",
]);

const ETAPAS_RENDIMENTO = new Set([
  "Ensino Fundamental",
  "Ensino Médio",
]);

const VARIAVEIS_DEMOGRAFICAS = new Set([
  "Pessoas Alfabetizadas",
  "Pessoas Total",
  "Taxa de Alfabetização",
  "Taxa de Analfabetismo",
]);

const REDE_DEMOGRAFICA = "Não se aplica";
const ETAPA_DEMOGRAFICA = "Pessoas de 15 anos ou mais de idade";

export interface CompatibilityInput {
  variavel?: string;
  rede?: string;
  etapa?: string;
}

export type CompatibilityResult =
  | { ok: true }
  | { ok: false; mensagem: string };

/**
 * Recusa recortes que misturam dimensões incompatíveis
 * (ex.: taxa de abandono em Educação Infantil; alfabetização com rede Total).
 */
export function checkDimensionCompatibility(
  input: CompatibilityInput,
): CompatibilityResult {
  const { variavel, rede, etapa } = input;

  if (!variavel) {
    return { ok: true };
  }

  if (TAXAS_RENDIMENTO.has(variavel) && etapa && !ETAPAS_RENDIMENTO.has(etapa)) {
    return {
      ok: false,
      mensagem: `${variavel} só existe para Ensino Fundamental e Ensino Médio. Etapa “${etapa}” não possui esse indicador.`,
    };
  }

  if (VARIAVEIS_DEMOGRAFICAS.has(variavel)) {
    if (rede && rede !== REDE_DEMOGRAFICA) {
      return {
        ok: false,
        mensagem: `“${variavel}” é indicador demográfico (IBGE) e usa ensino_rede = “${REDE_DEMOGRAFICA}”, não “${rede}”. Ajuste o filtro de rede.`,
      };
    }
    if (etapa && etapa !== ETAPA_DEMOGRAFICA) {
      return {
        ok: false,
        mensagem: `“${variavel}” usa ensino_tipo = “${ETAPA_DEMOGRAFICA}”, não “${etapa}”. Evite misturar com educação básica.`,
      };
    }
  }

  if (
    (variavel === "Matrícula" || variavel === "Escolas") &&
    rede === REDE_DEMOGRAFICA
  ) {
    return {
      ok: false,
      mensagem: `“${variavel}” não se aplica à rede “${REDE_DEMOGRAFICA}” (recorte demográfico).`,
    };
  }

  if (
    (variavel === "Matrícula" || variavel === "Escolas") &&
    etapa === ETAPA_DEMOGRAFICA
  ) {
    return {
      ok: false,
      mensagem: `“${variavel}” não se aplica à etapa demográfica “${ETAPA_DEMOGRAFICA}”.`,
    };
  }

  return { ok: true };
}
