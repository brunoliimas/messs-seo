# MESSS × Galderma Digital Audit Dashboard

Plataforma de acompanhamento **SEO / AEO / LLM Parsers** em tempo real.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilização | Tailwind CSS v4 (`@theme` tokens) |
| ORM | Drizzle ORM + postgres-js |
| Banco | Supabase PostgreSQL |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Gráficos | Recharts + SVG custom |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Validação | Zod |
| Deploy | Vercel |

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais Supabase

# 3. Gerar migrations e aplicar no banco
npm run db:generate
npm run db:push

# 4. Seed com dados das 3 marcas
npm run db:seed

# 5. Rodar em dev
npm run dev
```

## Estrutura

```
src/
├── app/              # Pages (App Router)
│   ├── (auth)/       # Login
│   ├── (dashboard)/  # Dashboard pages
│   └── api/          # API Routes
├── components/       # Componentes compartilhados
│   ├── charts/       # ScoreRing, Recharts wrappers
│   ├── layout/       # Sidebar, Header, ThemeToggle
│   └── shared/       # MetricCard, FindingBadge, etc.
├── lib/
│   ├── db/           # Drizzle schema + client
│   ├── supabase/     # Auth clients (browser + server)
│   ├── collectors/   # PageSpeed + CrUX API
│   ├── constants/    # Thresholds, glossário, brands
│   └── utils/        # Formatters, ratings
├── styles/           # globals.css (@theme MESSS)
└── types/            # TypeScript types
```

## Fases

- [x] **Fase 1** — MVP: Setup, design system, pages com mock data
- [ ] **Fase 2** — Coleta automática (PageSpeed, CrUX, Cron)
- [ ] **Fase 3** — Relatórios PDF, export, notificações
- [ ] **Fase 4** — Multi-tenant, Search Console, white-label
