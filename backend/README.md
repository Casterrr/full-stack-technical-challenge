# Backend — Educação Alagoas

API REST (Node.js + Express + TypeScript + Prisma + PostgreSQL) para upload de CSV e agregações do dashboard.

## Como rodar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### 1. Subir o banco

```bash
cd backend
docker compose up -d
```

### 2. Configurar ambiente

```bash
cp .env.example .env
```

### 3. Instalar e migrar

```bash
npm install
npx prisma migrate dev --name init
```

### 4. Rodar a API

```bash
npm run dev
```

- Health: http://localhost:3333/api/health  
- Swagger: http://localhost:3333/api/docs  

### Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | API com hot reload |
| `npm run build` / `npm start` | Build e produção |
| `npm test` | Testes do parser CSV |
| `npm run parse:sample` | Parseia a amostra sem gravar no banco |
| `npm run lint` | `tsc --noEmit` |

## Decisões de dados

- **Reimportação:** substitui (TRUNCATE + insert em lote).
- **Hierarquia de redes:** filtro exclusivo; default `Total` em indicadores/séries/ranking.
- **Escolas:** somatório por etapa = ofertas de ensino (não total físico).
- **Percentuais:** média ponderada por matrículas.
- **Ausência ≠ zero:** anos sem linha não entram na série como 0.
- **Combinações inválidas:** API recusa recortes incompatíveis (ex.: taxa de abandono em Educação Infantil; alfabetização com rede diferente de “Não se aplica”) com mensagem explícita.

## Endpoints

- `POST /api/upload` — multipart field `file`
- `GET /api/filtros`
- `GET /api/indicadores`
- `GET /api/series?variavel=`
- `GET /api/ranking?variavel=&ano=`
- `GET /api/dados?pagina=&tamanho=`
