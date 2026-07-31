# Desafio Técnico Full-Stack — Educação Alagoas

Aplicação web que recebe um CSV de dados educacionais por upload, processa no backend e alimenta um dashboard com filtros, indicadores, gráficos e tabela.

**Prazo de entrega:** 02/08/2026, 23h59 (Maceió)

## Status

| Camada   | Situação | Detalhes |
|----------|----------|----------|
| Backend  | Feito    | API REST completa: upload, validação, agregações SQL e paginação |
| Frontend | Feito    | Upload + dashboard (filtros, cards, gráficos Recharts, tabela paginada) |

## Stack

| Camada   | Tecnologia |
|----------|------------|
| Backend  | Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, Multer, Vitest |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Query, Zustand, Recharts |
| Infra    | Docker Compose (Postgres), GitHub Actions (CI backend e frontend) |

## Estrutura do repositório

```
.
├── backend/                 # API REST
│   ├── prisma/
│   ├── src/
│   ├── tests/
│   └── README.md
├── frontend/                # SPA React
│   ├── src/
│   │   ├── api/             # Cliente HTTP tipado
│   │   ├── components/      # Filtros, cards, gráficos, tabela
│   │   ├── pages/           # Upload e Dashboard
│   │   └── store/           # Filtros (Zustand)
│   └── README.md
├── .github/workflows/       # CI backend e frontend
├── educacao_alagoas_amostra.csv
└── REQUISITOS.md
```

## Backend (concluído)

### O que já existe

- Upload multipart (`POST /api/upload`) com parse no servidor
- Validação de cabeçalho e tipos; arquivo inválido → **400** com mensagem específica
- Linhas inválidas não derrubam a importação (resumo com `erros[]`)
- **Reimportação:** substitui o dataset (`TRUNCATE` + insert em lote)
- Agregações no PostgreSQL (não envia 145k linhas ao browser):
  - filtros, indicadores (cards), séries temporais, ranking, dados paginados
- Média ponderada por matrículas para variáveis percentuais
- Swagger em `/api/docs`
- Testes Vitest do parser + CI (typecheck, test, build)

### Como rodar

Pré-requisitos: Node.js 20+, Docker.

```bash
cd backend
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

- Health: http://localhost:3333/api/health  
- Swagger: http://localhost:3333/api/docs  

Detalhes: [backend/README.md](./backend/README.md).

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/health` | Healthcheck |
| `POST` | `/api/upload` | Upload CSV (`multipart`, campo `file`) |
| `GET` | `/api/filtros` | Opções de município, ano, rede, etapa, variável |
| `GET` | `/api/indicadores` | Cards agregados |
| `GET` | `/api/series?variavel=` | Série temporal `[{ ano, valor }]` |
| `GET` | `/api/ranking?variavel=&ano=` | Ranking por município |
| `GET` | `/api/dados?pagina=&tamanho=` | Tabela paginada no servidor |

## Frontend (concluído)

### O que já existe

- Tela de **upload** com validação Zod, loading e resumo da importação
- **Dashboard** com filtros globais (Zustand + debounce)
- Cards de indicadores, série temporal, ranking e quebra (rede/etapa)
- Tabela com paginação no servidor
- Proxy Vite `/api` → `http://localhost:3333`
- CI (typecheck + build)

### Como rodar

Com o backend ativo:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abra http://localhost:5173

Detalhes: [frontend/README.md](./frontend/README.md).

## Dados

- Amostra: `educacao_alagoas_amostra.csv` (~3.5k linhas, 10 municípios)
- Avaliação: base completa (~145k linhas, 102 municípios, 2007–2025)

CSV em formato longo, UTF-8, separador vírgula:

```
co_mun,no_mun,ano,fonte,variavel,ensino_rede,ensino_tipo,valor
```