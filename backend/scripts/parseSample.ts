import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsvStream } from "../src/services/csvParser.js";

async function main() {
  const csvPath = resolve(
    process.cwd(),
    "..",
    "educacao_alagoas_amostra.csv",
  );
  const buffer = readFileSync(csvPath);
  const result = await parseCsvStream(buffer);

  console.log(
    JSON.stringify(
      {
        arquivo: csvPath,
        linhasLidas: result.linhasLidas,
        linhasValidas: result.linhasValidas.length,
        linhasRejeitadas: result.linhasRejeitadas,
        primeirosErros: result.erros.slice(0, 5),
        amostra: result.linhasValidas.slice(0, 2),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
