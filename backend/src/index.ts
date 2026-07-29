import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

async function main() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`API rodando em http://localhost:${env.PORT}`);
    console.log(`Swagger em http://localhost:${env.PORT}/api/docs`);
  });
}

main().catch(async (error) => {
  console.error("Falha ao iniciar a API", error);
  await prisma.$disconnect();
  process.exit(1);
});
