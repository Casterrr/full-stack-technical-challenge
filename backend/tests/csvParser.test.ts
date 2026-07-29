import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { AppError } from "../src/lib/errors.js";
import { validateAndParseRow } from "../src/schemas/csvRow.js";
import { parseCsvStream, validateCsvHeaders } from "../src/services/csvParser.js";

describe("validateCsvHeaders", () => {
  it("aceita o cabeçalho esperado", () => {
    expect(() =>
      validateCsvHeaders([
        "co_mun",
        "no_mun",
        "ano",
        "fonte",
        "variavel",
        "ensino_rede",
        "ensino_tipo",
        "valor",
      ]),
    ).not.toThrow();
  });

  it("rejeita coluna renomeada", () => {
    expect(() =>
      validateCsvHeaders([
        "co_mun",
        "nome_municipio",
        "ano",
        "fonte",
        "variavel",
        "ensino_rede",
        "ensino_tipo",
        "valor",
      ]),
    ).toThrow(AppError);
  });

  it("remove BOM do cabeçalho", () => {
    expect(() =>
      validateCsvHeaders([
        "\uFEFFco_mun",
        "no_mun",
        "ano",
        "fonte",
        "variavel",
        "ensino_rede",
        "ensino_tipo",
        "valor",
      ]),
    ).not.toThrow();
  });
});

describe("validateAndParseRow", () => {
  const base = {
    co_mun: "2704302",
    no_mun: "Maceió",
    ano: "2023",
    fonte: "censo_escolar",
    variavel: "Matrícula",
    ensino_rede: "Total",
    ensino_tipo: "Ensino Fundamental",
    valor: "109026.0",
  };

  it("parseia linha válida preservando acento e co_mun como string", () => {
    const result = validateAndParseRow(base, 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.coMun).toBe("2704302");
      expect(result.data.noMun).toBe("Maceió");
      expect(result.data.valor).toBe(109026);
    }
  });

  it("rejeita valor não numérico", () => {
    const result = validateAndParseRow({ ...base, valor: "abc" }, 3);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection.motivo).toMatch(/não numérico/);
    }
  });

  it("rejeita ano fora da faixa", () => {
    const result = validateAndParseRow({ ...base, ano: "1999" }, 4);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection.motivo).toMatch(/fora da faixa/);
    }
  });

  it("rejeita campo vazio", () => {
    const result = validateAndParseRow({ ...base, no_mun: "  " }, 5);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection.motivo).toMatch(/no_mun vazio/);
    }
  });
});

describe("parseCsvStream", () => {
  it("importa linhas válidas e rejeita linhas defeituosas sem abortar", async () => {
    const csv = [
      "co_mun,no_mun,ano,fonte,variavel,ensino_rede,ensino_tipo,valor",
      "2704302,Maceió,2023,censo_escolar,Matrícula,Total,Ensino Fundamental,109026.0",
      "2704302,Maceió,1990,censo_escolar,Matrícula,Total,Ensino Fundamental,10",
      "2704302,Maceió,2023,censo_escolar,Matrícula,Total,Ensino Fundamental,abc",
      "2700300,Arapiraca,2023,censo_escolar,Matrícula,Total,Ensino Fundamental,5000",
    ].join("\n");

    const result = await parseCsvStream(Buffer.from(csv, "utf-8"));

    expect(result.linhasLidas).toBe(4);
    expect(result.linhasValidas).toHaveLength(2);
    expect(result.linhasRejeitadas).toBe(2);
    expect(result.erros).toHaveLength(2);
  });

  it("aceita cabeçalho certo com zero linhas de dados", async () => {
    const csv =
      "co_mun,no_mun,ano,fonte,variavel,ensino_rede,ensino_tipo,valor\n";
    const result = await parseCsvStream(Buffer.from(csv, "utf-8"));
    expect(result.linhasLidas).toBe(0);
    expect(result.linhasValidas).toHaveLength(0);
  });

  it("rejeita CSV com coluna renomeada", async () => {
    const csv = [
      "co_mun,nome,ano,fonte,variavel,ensino_rede,ensino_tipo,valor",
      "2704302,Maceió,2023,censo_escolar,Matrícula,Total,Ensino Fundamental,1",
    ].join("\n");

    await expect(parseCsvStream(Buffer.from(csv, "utf-8"))).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("rejeita conteúdo que não é CSV de educação", async () => {
    const txt = "isto nao e um csv de educacao\nlinha2\n";
    await expect(
      parseCsvStream(Readable.from([txt])),
    ).rejects.toBeInstanceOf(AppError);
  });
});
