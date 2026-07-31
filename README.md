# Desafio Técnico Full-Stack — Educação Alagoas

Aplicação web que recebe um CSV de dados educacionais por upload, processa no backend e alimenta um dashboard com filtros, indicadores, gráficos e tabela.

**Prazo de entrega:** 02/08/2026, 23h59 (Maceió)

## O que é o projeto

Esta aplicação importa dados públicos de educação municipal de Alagoas (formato longo CSV), valida e persiste no PostgreSQL e expõe agregações via API REST. O frontend consome só endpoints agregados/paginados — nunca baixa as 145 mil linhas para filtrar no navegador.

O foco da avaliação é o tratamento correto dos dados reais (hierarquia de redes, percentuais ponderados, ausência ≠ zero), não a quantidade de telas. A amostra `educacao_alagoas_amostra.csv` serve para desenvolver; na correção sobe a base completa (~145k linhas).

## Stack

| Camada   | Tecnologia |
|----------|------------|
| Backend  | Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, Multer, Vitest, Swagger |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, TanStack Table, Zustand, Recharts |
| Infra    | Docker Compose (Postgres), GitHub Actions (CI backend e frontend) |

## Como rodar do zero

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Variáveis de ambiente

Arquivos versionados: `backend/.env.example` e `frontend/.env.example`.

**Backend** (`backend/.env`):

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `DATABASE_URL` | `postgresql://educacao:educacao@localhost:5432/educacao_alagoas?schema=public` | Conexão Prisma/Postgres |
| `PORT` | `3333` | Porta da API |
| `NODE_ENV` | `development` | Ambiente |

**Frontend** (`frontend/.env`):

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `VITE_API_URL` | _(vazio)_ | Em dev, deixe vazio para o proxy do Vite (`/api` → `localhost:3333`). Em produção, URL pública da API. |

### Backend

```bash
cd backend
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

- API: http://localhost:3333
- Swagger: http://localhost:3333/api/docs
- Health: http://localhost:3333/api/health

### Frontend

Com o backend ativo:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abra http://localhost:5173 (proxy `/api` → `localhost:3333`).

Detalhes extras: [`backend/README.md`](backend/README.md) e [`frontend/README.md`](frontend/README.md).

## Decisões de tratamento dos dados

Estas decisões estão implementadas no backend e refletidas no dashboard:

1. **Hierarquia de `ensino_rede`**  
   `Total = Pública + Privada` e `Pública = Estadual + Municipal + Federal`. Somar todas as redes conta o aluno várias vezes.  
   **Critério:** filtro exclusivo; default `Total` em indicadores, séries e ranking. O dashboard nunca soma redes hierárquicas juntas no mesmo card.

2. **Escolas × etapas**  
   Somar `Escolas` por etapa conta ofertas, não o número físico de escolas.  
   **Critério:** o card é rotulado como “ofertas de ensino”, com observação na meta da API.

3. **Percentuais (agregação)**  
   Não se somam. Agregação entre municípios usa **média ponderada por matrículas** (quando há matrícula na mesma dimensão). Documentado na UI e no README do backend.

4. **Reimportação**  
   Um novo upload **substitui** o dataset anterior (`TRUNCATE` + insert em lote). Documentado na tela de upload e aqui.

5. **Valores ausentes (ausência ≠ zero)**  
   Ano/município sem linha não entra na série como `0`. A API devolve `semDados` / omite o ponto; a UI mostra “Sem dado no período”.

6. **Combinações inválidas**  
   Taxas de rendimento só fazem sentido em Ensino Fundamental e Médio. Variáveis demográficas (alfabetização) usam `Não se aplica` / recorte populacional. A API recusa recortes incompatíveis com mensagem explícita em vez de gráfico enganoso.

## O que ficou de fora (e por quê)

| Item | Motivo |
|------|--------|
| Deploy público (Vercel/Render) | Tempo priorizado no núcleo (upload + agregação correta). Pode ser feito depois. |
| Mapas coropléticos / escolas INEP | Enriquecimento opcional; a app precisa funcionar só com o CSV. |
| Streaming ponta a ponta / `COPY` | Parse em stream + insert em lote; Multer ainda usa buffer em memória (ok para ~13 MB). |
| Validação rígida Aprovação+Reprovação+Abandono=100% na importação | Usamos a relação como sanidade nos números de conferência; não rejeitamos linhas por arredondamento. |
| CI com Postgres real | CI roda lint, testes do parser e build; endpoints não sobem banco no Actions. |

## Estrutura

```
.
├── backend/          # API REST + Prisma + testes do parser
├── frontend/         # SPA React (upload + dashboard)
├── .github/workflows/
├── educacao_alagoas_amostra.csv
└── REQUISITOS.md
```

## Endpoints principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/upload` | Upload CSV (`multipart`, campo `file`) |
| `GET` | `/api/filtros` | Municípios, anos, redes, etapas, variáveis |
| `GET` | `/api/indicadores` | Cards agregados |
| `GET` | `/api/series` | Série temporal |
| `GET` | `/api/ranking` | Ranking por município |
| `GET` | `/api/dados` | Tabela paginada no servidor |

## Deploy

Sem deploy público

## Conferência (amostra)

Números usados para validar o processamento: 3.534 linhas, 10 municípios, Maceió 2023 Matrícula EF Total = **109.026**, taxa de aprovação ponderada EF 2023 Total ≈ **96,16%**.
