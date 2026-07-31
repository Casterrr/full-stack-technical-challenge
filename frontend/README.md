# Frontend — Educação Alagoas

React + TypeScript + Vite + Tailwind CSS + **shadcn/ui**. Consome a API em `backend/`.

## Como rodar

### Pré-requisitos

- Node.js 20+
- Backend rodando em http://localhost:3333

### Instalação

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abra http://localhost:5173

O Vite faz proxy de `/api` para `http://localhost:3333`.

### Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + build |
| `npm run preview` | Preview do build |

## UI (shadcn)

Componentes em `src/components/ui/`:

- Button, Card, Input, Label, Native Select
- Alert, Badge, Empty, Skeleton, Spinner, Separator
- Table, Pagination
- **Chart** (`ChartContainer`, `ChartTooltip`, `ChartLegend`) sobre Recharts

Tema unificado via tokens CSS (`--primary`, `--chart-*`, etc.) em `src/index.css`.

### Suspense e Error Boundaries

- Seções do dashboard usam `useSuspenseQuery` + `<Suspense>` com **Skeleton** do shadcn
- Cada bloco (cards, gráficos, tabela) tem `ErrorBoundary` isolado via `QuerySection` + `QueryErrorResetBoundary` (TanStack Query)
- Falha em um gráfico não derruba o restante da página


## Telas

1. **Upload** (`/`) — CSV com loading, resumo e erros
2. **Dashboard** (`/dashboard`) — filtros, cards, 3 gráficos shadcn/Recharts, tabela paginada

## Decisões

- Filtros em Zustand; queries com React Query + debounce 350 ms
- Rede padrão: `Total`
- Quebra por rede usa só redes folha (sem Total/Pública)
- Números e percentuais em pt-BR
