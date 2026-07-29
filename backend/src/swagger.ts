import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Educação Alagoas API",
    version: "1.0.0",
    description:
      "API para upload de CSV e agregações do dashboard de educação de Alagoas.",
  },
  servers: [{ url: "http://localhost:3333" }],
  paths: {
    "/api/health": {
      get: {
        summary: "Healthcheck",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/upload": {
      post: {
        summary: "Upload de CSV (substitui dados anteriores)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
                required: ["file"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Importação concluída",
          },
          "400": {
            description: "Arquivo inválido",
          },
        },
      },
    },
    "/api/filtros": {
      get: {
        summary: "Valores distintos para filtros",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/indicadores": {
      get: {
        summary: "Cards agregados do recorte",
        parameters: [
          { name: "municipio", in: "query", schema: { type: "string" } },
          { name: "anoInicio", in: "query", schema: { type: "integer" } },
          { name: "anoFim", in: "query", schema: { type: "integer" } },
          { name: "rede", in: "query", schema: { type: "string" } },
          { name: "etapa", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/series": {
      get: {
        summary: "Série temporal de uma variável",
        parameters: [
          {
            name: "variavel",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          { name: "municipio", in: "query", schema: { type: "string" } },
          { name: "rede", in: "query", schema: { type: "string" } },
          { name: "etapa", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/ranking": {
      get: {
        summary: "Ranking de municípios",
        parameters: [
          {
            name: "variavel",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "ano",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
          { name: "rede", in: "query", schema: { type: "string" } },
          { name: "etapa", in: "query", schema: { type: "string" } },
          { name: "limite", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/dados": {
      get: {
        summary: "Tabela paginada",
        parameters: [
          { name: "pagina", in: "query", schema: { type: "integer" } },
          { name: "tamanho", in: "query", schema: { type: "integer" } },
          { name: "municipio", in: "query", schema: { type: "string" } },
          { name: "variavel", in: "query", schema: { type: "string" } },
          { name: "rede", in: "query", schema: { type: "string" } },
          { name: "etapa", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
}
