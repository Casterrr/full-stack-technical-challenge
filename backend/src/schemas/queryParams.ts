import { z } from "zod";
import { DEFAULT_REDE } from "./constants.js";

const optionalString = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (Array.isArray(value)) return value;
    if (value.trim() === "" || value === "todos") return undefined;
    return value.includes(",")
      ? value.split(",").map((v) => v.trim()).filter(Boolean)
      : [value];
  });

const optionalSingle = z
  .string()
  .optional()
  .transform((value) => {
    if (!value || value.trim() === "" || value === "todos") return undefined;
    return value;
  });

/** Rede com default Total (evita soma hierárquica ingênua). */
const redeComDefault = z
  .string()
  .optional()
  .transform((value) => {
    if (!value || value.trim() === "" || value === "todos") return DEFAULT_REDE;
    return value;
  });

export const filtrosQuerySchema = z.object({}).passthrough();

export const indicadoresQuerySchema = z.object({
  municipio: optionalString,
  anoInicio: z.coerce.number().int().optional(),
  anoFim: z.coerce.number().int().optional(),
  ano: z.coerce.number().int().optional(),
  rede: redeComDefault,
  etapa: optionalSingle,
});

export const seriesQuerySchema = z.object({
  variavel: z.string().min(1, "variavel é obrigatória"),
  municipio: optionalString,
  rede: redeComDefault,
  etapa: optionalSingle,
  anoInicio: z.coerce.number().int().optional(),
  anoFim: z.coerce.number().int().optional(),
});

export const rankingQuerySchema = z.object({
  variavel: z.string().min(1, "variavel é obrigatória"),
  ano: z.coerce.number().int({ message: "ano é obrigatório" }),
  rede: redeComDefault,
  etapa: optionalSingle,
  limite: z.coerce.number().int().positive().max(200).default(20),
});

export const dadosQuerySchema = z.object({
  municipio: optionalString,
  anoInicio: z.coerce.number().int().optional(),
  anoFim: z.coerce.number().int().optional(),
  ano: z.coerce.number().int().optional(),
  rede: optionalSingle,
  etapa: optionalSingle,
  fonte: optionalSingle,
  variavel: optionalSingle,
  pagina: z.coerce.number().int().positive().default(1),
  tamanho: z.coerce.number().int().positive().max(200).default(50),
});

export type IndicadoresQuery = z.infer<typeof indicadoresQuerySchema>;
export type SeriesQuery = z.infer<typeof seriesQuerySchema>;
export type RankingQuery = z.infer<typeof rankingQuerySchema>;
export type DadosQuery = z.infer<typeof dadosQuerySchema>;
