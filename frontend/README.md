# Frontend — Educação Alagoas

React + TypeScript + Vite + Tailwind CSS. Consome a API em `backend/`.

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

## Telas

1. **Upload** — envia CSV (`multipart/form-data`), mostra loading, resumo e erros 400
2. **Dashboard** — filtros globais, cards, 3 gráficos (série, ranking, quebra), tabela paginada

## Decisões de UI / dados

- Filtros em Zustand; queries com React Query + debounce 350 ms
- Rede padrão alinhada ao backend: `Total`
- Quebra por rede usa só redes folha (sem Total/Pública)
- Números e percentuais em pt-BR
- Estados de loading / vazio / erro em cada bloco
