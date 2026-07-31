import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Educação Alagoas API",
    version: "1.0.0",
    description:
      "API para upload de CSV e agregações do dashboard de educação de Alagoas.\n\n" +
      "**Filtros comuns:** `municipio` aceita código IBGE (`2704302`), nome (`Maceió`) ou lista separada por vírgula. " +
      "Valores `todos` ou vazios são ignorados. Em indicadores/séries/ranking, `rede` omisso assume `Total` " +
      "(evita soma hierárquica entre redes).",
  },
  servers: [{ url: "http://localhost:3333", description: "Desenvolvimento local" }],
  tags: [
    { name: "Sistema", description: "Healthcheck e metadados" },
    { name: "Upload", description: "Importação de CSV" },
    { name: "Dashboard", description: "Endpoints consumidos pelo frontend" },
  ],
  components: {
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
        },
        required: ["status"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Parâmetros inválidos" },
          details: {
            description: "Detalhes opcionais (Zod flatten, rejeições etc.)",
            example: {
              formErrors: [],
              fieldErrors: { variavel: ["variavel é obrigatória"] },
            },
          },
        },
        required: ["error"],
      },
      ImportResult: {
        type: "object",
        properties: {
          linhasLidas: { type: "integer", example: 1250 },
          linhasImportadas: { type: "integer", example: 1248 },
          linhasRejeitadas: { type: "integer", example: 2 },
          erros: {
            type: "array",
            items: { $ref: "#/components/schemas/RowRejection" },
            example: [
              { linha: 42, motivo: "Ano fora do intervalo permitido (2007–2025)" },
              { linha: 87, motivo: "valor inválido" },
            ],
          },
        },
        required: [
          "linhasLidas",
          "linhasImportadas",
          "linhasRejeitadas",
          "erros",
        ],
      },
      RowRejection: {
        type: "object",
        properties: {
          linha: { type: "integer", example: 42 },
          motivo: {
            type: "string",
            example: "Ano fora do intervalo permitido (2007–2025)",
          },
        },
        required: ["linha", "motivo"],
      },
      MunicipioFiltro: {
        type: "object",
        properties: {
          coMun: { type: "string", example: "2704302" },
          noMun: { type: "string", example: "Maceió" },
        },
        required: ["coMun", "noMun"],
      },
      FiltrosResponse: {
        type: "object",
        properties: {
          municipios: {
            type: "array",
            items: { $ref: "#/components/schemas/MunicipioFiltro" },
            example: [
              { coMun: "2700300", noMun: "Arapiraca" },
              { coMun: "2704302", noMun: "Maceió" },
            ],
          },
          anos: {
            type: "array",
            items: { type: "integer" },
            example: [2019, 2020, 2021, 2022, 2023],
          },
          redes: {
            type: "array",
            items: { type: "string" },
            example: [
              "Estadual",
              "Federal",
              "Municipal",
              "Privada",
              "Pública",
              "Total",
            ],
          },
          etapas: {
            type: "array",
            items: { type: "string" },
            example: [
              "Educação Infantil",
              "Ensino Fundamental",
              "Ensino Médio",
              "Total",
            ],
          },
          variaveis: {
            type: "array",
            items: { type: "string" },
            example: [
              "Escolas",
              "Matrícula",
              "Taxa de Abandono",
              "Taxa de Aprovação",
              "Taxa de Reprovação",
            ],
          },
        },
        required: ["municipios", "anos", "redes", "etapas", "variaveis"],
      },
      VariacaoMatriculas: {
        type: "object",
        nullable: true,
        properties: {
          de: { type: "integer", example: 2019 },
          para: { type: "integer", example: 2023 },
          percentual: {
            type: "number",
            example: 4.82,
            description: "Variação percentual de matrículas entre o primeiro e o último ano do recorte",
          },
        },
        required: ["de", "para", "percentual"],
      },
      IndicadoresMeta: {
        type: "object",
        properties: {
          rede: { type: "string", nullable: true, example: "Total" },
          etapa: { type: "string", nullable: true, example: "Ensino Fundamental" },
          observacaoEscolas: {
            type: "string",
            example:
              "Card de escolas representa ofertas de ensino (soma por etapa), não o total físico de escolas.",
          },
          observacaoPercentuais: {
            type: "string",
            example:
              "Taxas usam média ponderada por matrículas quando possível.",
          },
          percentualVariaveis: {
            type: "array",
            items: { type: "string" },
            example: [
              "Taxa de Aprovação",
              "Taxa de Reprovação",
              "Taxa de Abandono",
              "Taxa de Alfabetização",
              "Taxa de Analfabetismo",
            ],
          },
        },
      },
      IndicadoresResponse: {
        type: "object",
        properties: {
          semDados: { type: "boolean", example: false },
          mensagem: {
            type: "string",
            example: "Sem dado no período / recorte selecionado",
          },
          totalMatriculas: { type: "number", nullable: true, example: 185432.0 },
          totalEscolasOfertas: { type: "number", nullable: true, example: 3120.0 },
          taxaAprovacao: { type: "number", nullable: true, example: 91.45 },
          taxaAbandono: { type: "number", nullable: true, example: 1.82 },
          variacaoMatriculas: { $ref: "#/components/schemas/VariacaoMatriculas" },
          meta: { $ref: "#/components/schemas/IndicadoresMeta" },
        },
        required: [
          "semDados",
          "totalMatriculas",
          "totalEscolasOfertas",
          "taxaAprovacao",
          "taxaAbandono",
          "variacaoMatriculas",
          "meta",
        ],
      },
      SeriePonto: {
        type: "object",
        properties: {
          ano: { type: "integer", example: 2021 },
          valor: { type: "number", example: 45210.0 },
        },
        required: ["ano", "valor"],
      },
      SeriesResponse: {
        type: "object",
        properties: {
          semDados: { type: "boolean", example: false },
          mensagem: {
            type: "string",
            example: "Sem dado no período / recorte selecionado",
          },
          serie: {
            type: "array",
            items: { $ref: "#/components/schemas/SeriePonto" },
            example: [
              { ano: 2019, valor: 43800 },
              { ano: 2020, valor: 44120 },
              { ano: 2021, valor: 45210 },
              { ano: 2022, valor: 46005 },
              { ano: 2023, valor: 46890 },
            ],
          },
          meta: {
            type: "object",
            properties: {
              agregacao: {
                type: "string",
                enum: ["soma", "media_ponderada_por_matriculas"],
                example: "soma",
              },
            },
          },
        },
        required: ["semDados", "serie"],
      },
      RankingItem: {
        type: "object",
        properties: {
          coMun: { type: "string", example: "2704302" },
          municipio: { type: "string", example: "Maceió" },
          valor: { type: "number", example: 98540.0 },
        },
        required: ["coMun", "municipio", "valor"],
      },
      RankingResponse: {
        type: "object",
        properties: {
          semDados: { type: "boolean", example: false },
          mensagem: {
            type: "string",
            example: "Sem dado no período / recorte selecionado",
          },
          ranking: {
            type: "array",
            items: { $ref: "#/components/schemas/RankingItem" },
            example: [
              { coMun: "2704302", municipio: "Maceió", valor: 98540 },
              { coMun: "2700300", municipio: "Arapiraca", valor: 42100 },
              { coMun: "2706703", municipio: "Penedo", valor: 12850 },
            ],
          },
          meta: {
            type: "object",
            properties: {
              agregacao: {
                type: "string",
                enum: ["soma", "media_ponderada_por_matriculas"],
                example: "soma",
              },
            },
          },
        },
        required: ["semDados", "ranking"],
      },
      DadoItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1024 },
          coMun: { type: "string", example: "2704302" },
          noMun: { type: "string", example: "Maceió" },
          ano: { type: "integer", example: 2023 },
          fonte: { type: "string", example: "censo_escolar" },
          variavel: { type: "string", example: "Matrícula" },
          ensinoRede: { type: "string", example: "Total" },
          ensinoTipo: { type: "string", example: "Ensino Fundamental" },
          valor: { type: "number", example: 98540.0 },
        },
        required: [
          "id",
          "coMun",
          "noMun",
          "ano",
          "fonte",
          "variavel",
          "ensinoRede",
          "ensinoTipo",
          "valor",
        ],
      },
      DadosResponse: {
        type: "object",
        properties: {
          semDados: { type: "boolean", example: false },
          mensagem: {
            type: "string",
            example: "Sem dado no período / recorte selecionado",
          },
          itens: {
            type: "array",
            items: { $ref: "#/components/schemas/DadoItem" },
          },
          total: { type: "integer", example: 240 },
          pagina: { type: "integer", example: 1 },
          tamanho: { type: "integer", example: 50 },
        },
        required: ["semDados", "itens", "total", "pagina", "tamanho"],
      },
    },
    parameters: {
      MunicipioQuery: {
        name: "municipio",
        in: "query",
        required: false,
        description:
          "Código IBGE, nome do município ou lista separada por vírgula. Use `todos` para ignorar.",
        schema: { type: "string" },
        examples: {
          porCodigo: {
            summary: "Por código IBGE",
            value: "2704302",
          },
          porNome: {
            summary: "Por nome",
            value: "Maceió",
          },
          multiplos: {
            summary: "Vários municípios",
            value: "Maceió,Arapiraca",
          },
        },
      },
      AnoInicioQuery: {
        name: "anoInicio",
        in: "query",
        required: false,
        description: "Ano inicial do intervalo (inclusive).",
        schema: { type: "integer", minimum: 2007, maximum: 2025 },
        example: 2019,
      },
      AnoFimQuery: {
        name: "anoFim",
        in: "query",
        required: false,
        description: "Ano final do intervalo (inclusive).",
        schema: { type: "integer", minimum: 2007, maximum: 2025 },
        example: 2023,
      },
      AnoQuery: {
        name: "ano",
        in: "query",
        required: false,
        description: "Ano único (atalho para anoInicio = anoFim).",
        schema: { type: "integer", minimum: 2007, maximum: 2025 },
        example: 2023,
      },
      RedeQuery: {
        name: "rede",
        in: "query",
        required: false,
        description:
          "Rede de ensino. Omitido ou `todos` → default `Total` (exceto em `/api/dados`).",
        schema: {
          type: "string",
          enum: [
            "Estadual",
            "Municipal",
            "Federal",
            "Privada",
            "Pública",
            "Total",
            "Não se aplica",
          ],
        },
        example: "Total",
      },
      EtapaQuery: {
        name: "etapa",
        in: "query",
        required: false,
        description: "Etapa/tipo de ensino (`ensino_tipo` no CSV).",
        schema: { type: "string" },
        example: "Ensino Fundamental",
      },
      VariavelObrigatoriaQuery: {
        name: "variavel",
        in: "query",
        required: true,
        description:
          "Variável a agregar. Contagens usam soma; taxas usam média ponderada por matrículas.",
        schema: { type: "string" },
        examples: {
          matricula: {
            summary: "Contagem (soma)",
            value: "Matrícula",
          },
          taxa: {
            summary: "Taxa (média ponderada)",
            value: "Taxa de Aprovação",
          },
        },
      },
      VariavelOpcionalQuery: {
        name: "variavel",
        in: "query",
        required: false,
        description: "Filtra por uma variável específica.",
        schema: { type: "string" },
        example: "Matrícula",
      },
      FonteQuery: {
        name: "fonte",
        in: "query",
        required: false,
        description: "Fonte dos dados no CSV.",
        schema: {
          type: "string",
          enum: [
            "censo_escolar",
            "indicadores_rendimento",
            "censo_demografico",
          ],
        },
        example: "censo_escolar",
      },
      AnoObrigatorioQuery: {
        name: "ano",
        in: "query",
        required: true,
        description: "Ano do ranking.",
        schema: { type: "integer", minimum: 2007, maximum: 2025 },
        example: 2023,
      },
      LimiteQuery: {
        name: "limite",
        in: "query",
        required: false,
        description: "Quantidade máxima de municípios no ranking (default 20, máx. 200).",
        schema: { type: "integer", minimum: 1, maximum: 200, default: 20 },
        example: 10,
      },
      PaginaQuery: {
        name: "pagina",
        in: "query",
        required: false,
        description: "Página (1-based). Default: 1.",
        schema: { type: "integer", minimum: 1, default: 1 },
        example: 1,
      },
      TamanhoQuery: {
        name: "tamanho",
        in: "query",
        required: false,
        description: "Itens por página (default 50, máx. 200).",
        schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
        example: 50,
      },
    },
    examples: {
      IndicadoresComDados: {
        summary: "Recorte com dados",
        value: {
          semDados: false,
          totalMatriculas: 185432,
          totalEscolasOfertas: 3120,
          taxaAprovacao: 91.45,
          taxaAbandono: 1.82,
          variacaoMatriculas: { de: 2019, para: 2023, percentual: 4.82 },
          meta: {
            rede: "Total",
            etapa: "Ensino Fundamental",
            observacaoEscolas:
              "Card de escolas representa ofertas de ensino (soma por etapa), não o total físico de escolas.",
            observacaoPercentuais:
              "Taxas usam média ponderada por matrículas quando possível.",
            percentualVariaveis: [
              "Taxa de Aprovação",
              "Taxa de Reprovação",
              "Taxa de Abandono",
              "Taxa de Alfabetização",
              "Taxa de Analfabetismo",
            ],
          },
        },
      },
      IndicadoresSemDados: {
        summary: "Sem dados no recorte",
        value: {
          semDados: true,
          mensagem: "Sem dado no período / recorte selecionado",
          totalMatriculas: null,
          totalEscolasOfertas: null,
          taxaAprovacao: null,
          taxaAbandono: null,
          variacaoMatriculas: null,
          meta: {
            rede: "Federal",
            etapa: null,
            observacaoEscolas:
              "Card de escolas representa ofertas de ensino (soma por etapa), não o total físico de escolas.",
            observacaoPercentuais:
              "Taxas usam média ponderada por matrículas quando possível.",
          },
        },
      },
      SeriesSoma: {
        summary: "Série de Matrícula (soma)",
        value: {
          semDados: false,
          serie: [
            { ano: 2019, valor: 43800 },
            { ano: 2020, valor: 44120 },
            { ano: 2021, valor: 45210 },
            { ano: 2022, valor: 46005 },
            { ano: 2023, valor: 46890 },
          ],
          meta: { agregacao: "soma" },
        },
      },
      SeriesMediaPonderada: {
        summary: "Série de Taxa de Aprovação (média ponderada)",
        value: {
          semDados: false,
          serie: [
            { ano: 2019, valor: 89.2 },
            { ano: 2020, valor: 90.1 },
            { ano: 2021, valor: 90.8 },
            { ano: 2022, valor: 91.2 },
            { ano: 2023, valor: 91.45 },
          ],
          meta: { agregacao: "media_ponderada_por_matriculas" },
        },
      },
      RankingExemplo: {
        summary: "Top municípios por matrícula",
        value: {
          semDados: false,
          ranking: [
            { coMun: "2704302", municipio: "Maceió", valor: 98540 },
            { coMun: "2700300", municipio: "Arapiraca", valor: 42100 },
            { coMun: "2706703", municipio: "Penedo", valor: 12850 },
          ],
          meta: { agregacao: "soma" },
        },
      },
      DadosExemplo: {
        summary: "Página de registros",
        value: {
          semDados: false,
          itens: [
            {
              id: 1024,
              coMun: "2704302",
              noMun: "Maceió",
              ano: 2023,
              fonte: "censo_escolar",
              variavel: "Matrícula",
              ensinoRede: "Total",
              ensinoTipo: "Ensino Fundamental",
              valor: 98540,
            },
            {
              id: 1025,
              coMun: "2700300",
              noMun: "Arapiraca",
              ano: 2023,
              fonte: "censo_escolar",
              variavel: "Matrícula",
              ensinoRede: "Total",
              ensinoTipo: "Ensino Fundamental",
              valor: 42100,
            },
          ],
          total: 240,
          pagina: 1,
          tamanho: 50,
        },
      },
      UploadSucesso: {
        summary: "Importação concluída",
        value: {
          linhasLidas: 1250,
          linhasImportadas: 1248,
          linhasRejeitadas: 2,
          erros: [
            {
              linha: 42,
              motivo: "Ano fora do intervalo permitido (2007–2025)",
            },
            { linha: 87, motivo: "valor inválido" },
          ],
        },
      },
      ErroArquivoAusente: {
        summary: "Arquivo não enviado",
        value: {
          error: "Arquivo não enviado. Use o campo multipart 'file'.",
        },
      },
      ErroArquivoInvalido: {
        summary: "Extensão inválida",
        value: {
          error: "Apenas arquivos .csv são aceitos",
        },
      },
      ErroValidacao: {
        summary: "Query inválida",
        value: {
          error: "Parâmetros inválidos",
          details: {
            formErrors: [],
            fieldErrors: {
              variavel: ["variavel é obrigatória"],
              ano: ["ano é obrigatório"],
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Sistema"],
        summary: "Healthcheck",
        description: "Verifica se a API está no ar.",
        responses: {
          "200": {
            description: "Serviço saudável",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: { status: "ok" },
              },
            },
          },
        },
      },
    },
    "/api/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload de CSV (substitui dados anteriores)",
        description:
          "Recebe um arquivo CSV via `multipart/form-data` no campo `file`.\n\n" +
          "**Colunas obrigatórias:** `co_mun`, `no_mun`, `ano`, `fonte`, `variavel`, " +
          "`ensino_rede`, `ensino_tipo`, `valor`.\n\n" +
          "A importação faz `TRUNCATE` da tabela e reinsere os registros válidos. " +
          "Linhas inválidas entram em `erros` sem abortar o lote.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Arquivo `.csv` (máx. 50 MB)",
                  },
                },
                required: ["file"],
              },
              encoding: {
                file: {
                  contentType: "text/csv",
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Importação concluída (pode haver linhas rejeitadas)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ImportResult" },
                examples: {
                  sucesso: { $ref: "#/components/examples/UploadSucesso" },
                },
              },
            },
          },
          "400": {
            description: "Arquivo ausente, vazio, extensão inválida ou CSV malformado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  ausente: { $ref: "#/components/examples/ErroArquivoAusente" },
                  extensao: { $ref: "#/components/examples/ErroArquivoInvalido" },
                  tamanho: {
                    summary: "Arquivo acima do limite",
                    value: { error: "Arquivo muito grande. Limite: 50 MB." },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/filtros": {
      get: {
        tags: ["Dashboard"],
        summary: "Valores distintos para filtros",
        description:
          "Retorna municípios, anos, redes, etapas e variáveis presentes nos dados importados — " +
          "usado para popular os selects do dashboard.",
        responses: {
          "200": {
            description: "Opções de filtro",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FiltrosResponse" },
                example: {
                  municipios: [
                    { coMun: "2700300", noMun: "Arapiraca" },
                    { coMun: "2704302", noMun: "Maceió" },
                  ],
                  anos: [2019, 2020, 2021, 2022, 2023],
                  redes: [
                    "Estadual",
                    "Federal",
                    "Municipal",
                    "Privada",
                    "Pública",
                    "Total",
                  ],
                  etapas: [
                    "Educação Infantil",
                    "Ensino Fundamental",
                    "Ensino Médio",
                    "Total",
                  ],
                  variaveis: [
                    "Escolas",
                    "Matrícula",
                    "Taxa de Abandono",
                    "Taxa de Aprovação",
                    "Taxa de Reprovação",
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/indicadores": {
      get: {
        tags: ["Dashboard"],
        summary: "Cards agregados do recorte",
        description:
          "Agrega matrículas, ofertas de escolas, taxas de aprovação/abandono e variação " +
          "ano a ano de matrículas para o recorte selecionado.",
        parameters: [
          { $ref: "#/components/parameters/MunicipioQuery" },
          { $ref: "#/components/parameters/AnoInicioQuery" },
          { $ref: "#/components/parameters/AnoFimQuery" },
          { $ref: "#/components/parameters/AnoQuery" },
          { $ref: "#/components/parameters/RedeQuery" },
          { $ref: "#/components/parameters/EtapaQuery" },
        ],
        responses: {
          "200": {
            description: "Indicadores do recorte (ou `semDados: true`)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IndicadoresResponse" },
                examples: {
                  comDados: { $ref: "#/components/examples/IndicadoresComDados" },
                  semDados: { $ref: "#/components/examples/IndicadoresSemDados" },
                },
              },
            },
          },
          "400": {
            description: "Parâmetros inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  validacao: { $ref: "#/components/examples/ErroValidacao" },
                },
              },
            },
          },
        },
      },
    },
    "/api/series": {
      get: {
        tags: ["Dashboard"],
        summary: "Série temporal de uma variável",
        description:
          "Retorna pontos `{ ano, valor }` agregados por ano. Contagens usam soma; " +
          "taxas usam média ponderada por matrículas.",
        parameters: [
          { $ref: "#/components/parameters/VariavelObrigatoriaQuery" },
          { $ref: "#/components/parameters/MunicipioQuery" },
          { $ref: "#/components/parameters/RedeQuery" },
          { $ref: "#/components/parameters/EtapaQuery" },
          { $ref: "#/components/parameters/AnoInicioQuery" },
          { $ref: "#/components/parameters/AnoFimQuery" },
        ],
        responses: {
          "200": {
            description: "Série temporal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SeriesResponse" },
                examples: {
                  soma: { $ref: "#/components/examples/SeriesSoma" },
                  mediaPonderada: {
                    $ref: "#/components/examples/SeriesMediaPonderada",
                  },
                  semDados: {
                    summary: "Sem dados",
                    value: {
                      semDados: true,
                      mensagem: "Sem dado no período / recorte selecionado",
                      serie: [],
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Parâmetros inválidos (ex.: `variavel` ausente)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  error: "Parâmetros inválidos",
                  details: {
                    formErrors: [],
                    fieldErrors: { variavel: ["variavel é obrigatória"] },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/ranking": {
      get: {
        tags: ["Dashboard"],
        summary: "Ranking de municípios",
        description:
          "Ordena municípios pela variável no ano informado (descendente). " +
          "`limite` controla quantos entram no resultado (default 20).",
        parameters: [
          { $ref: "#/components/parameters/VariavelObrigatoriaQuery" },
          { $ref: "#/components/parameters/AnoObrigatorioQuery" },
          { $ref: "#/components/parameters/MunicipioQuery" },
          { $ref: "#/components/parameters/RedeQuery" },
          { $ref: "#/components/parameters/EtapaQuery" },
          { $ref: "#/components/parameters/LimiteQuery" },
        ],
        responses: {
          "200": {
            description: "Ranking ordenado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RankingResponse" },
                examples: {
                  sucesso: { $ref: "#/components/examples/RankingExemplo" },
                  semDados: {
                    summary: "Sem dados",
                    value: {
                      semDados: true,
                      mensagem: "Sem dado no período / recorte selecionado",
                      ranking: [],
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Parâmetros inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  validacao: { $ref: "#/components/examples/ErroValidacao" },
                },
              },
            },
          },
        },
      },
    },
    "/api/dados": {
      get: {
        tags: ["Dashboard"],
        summary: "Tabela paginada",
        description:
          "Lista registros brutos com paginação e filtros opcionais. " +
          "Diferente dos demais endpoints, `rede` omisso não aplica default `Total`.",
        parameters: [
          { $ref: "#/components/parameters/PaginaQuery" },
          { $ref: "#/components/parameters/TamanhoQuery" },
          { $ref: "#/components/parameters/MunicipioQuery" },
          { $ref: "#/components/parameters/AnoInicioQuery" },
          { $ref: "#/components/parameters/AnoFimQuery" },
          { $ref: "#/components/parameters/AnoQuery" },
          {
            name: "rede",
            in: "query",
            required: false,
            description: "Rede de ensino (sem default — omitir = todas).",
            schema: {
              type: "string",
              enum: [
                "Estadual",
                "Municipal",
                "Federal",
                "Privada",
                "Pública",
                "Total",
                "Não se aplica",
              ],
            },
            example: "Municipal",
          },
          { $ref: "#/components/parameters/EtapaQuery" },
          { $ref: "#/components/parameters/FonteQuery" },
          { $ref: "#/components/parameters/VariavelOpcionalQuery" },
        ],
        responses: {
          "200": {
            description: "Página de registros",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DadosResponse" },
                examples: {
                  sucesso: { $ref: "#/components/examples/DadosExemplo" },
                  semDados: {
                    summary: "Sem dados",
                    value: {
                      semDados: true,
                      mensagem: "Sem dado no período / recorte selecionado",
                      itens: [],
                      total: 0,
                      pagina: 1,
                      tamanho: 50,
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Parâmetros inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  validacao: { $ref: "#/components/examples/ErroValidacao" },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "Educação Alagoas API",
      swaggerOptions: {
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true,
        showExamples: true,
        tryItOutEnabled: true,
      },
    }),
  );
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
}
