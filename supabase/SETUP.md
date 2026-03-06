# Setup Supabase — MESSS Dashboard

Guia passo-a-passo para configurar o Supabase para o projeto.

## 1. Criar projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New Project** → escolha org → nome: `messs-dashboard`
3. Região: **South America (São Paulo)** — `sa-east-1`
4. Gere e **salve a senha do banco** em lugar seguro
5. Aguarde o projeto ser provisionado (~2min)

## 2. Copiar credenciais

No dashboard do projeto → **Settings** → **API**:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
```

Em **Settings** → **Database** → **Connection string** → **URI**:

```env
# Pooler (para o app — PgBouncer)
DATABASE_URL="postgresql://postgres.xxxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct (para migrations — sem pooler)
DIRECT_URL="postgresql://postgres.xxxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

Cole tudo no `.env.local`.

## 3. Criar tabelas (Drizzle push)

```bash
# Gera as migrations
npm run db:generate

# Aplica direto no banco (dev)
npm run db:push
```

Isso cria todas as tabelas definidas em `src/lib/db/schema.ts`.

## 4. Executar SQL de setup

No Supabase Dashboard → **SQL Editor** → **New query**:

1. Cole o conteúdo de `supabase/setup.sql`
2. Execute

Isso cria:
- Trigger `on_auth_user_created` → auto-cria profile
- Trigger `on_auth_user_deleted` → limpa profile
- Funções helper: `get_user_role()`, `get_user_org_id()`, `user_has_client_access()`, `user_has_brand_access()`
- RLS policies em todas as tabelas

## 5. Rodar seed

```bash
npm run db:seed
```

Isso popula: 1 org, 1 client, 3 brands, 3 audits, 7 snapshots, 33 findings, 26 recommendations.

## 6. Configurar Auth

No Supabase Dashboard → **Authentication** → **Providers**:

### Email (Magic Link)
- Ativar **Email** provider (já vem ativado)
- Em **Email Templates** → **Magic Link**, customizar com branding MESSS se quiser
- Em **URL Configuration**:
  - Site URL: `http://localhost:3000` (dev) ou `https://seu-dominio.vercel.app` (prod)
  - Redirect URLs: adicionar ambos

### Desativar signup público (opcional)
Se quiser que apenas admins criem contas:
- **Authentication** → **Settings** → desmarcar **Enable sign up**
- Criar users manualmente via **Authentication** → **Users** → **Add user**

## 7. Criar primeiro admin

1. Crie um user via Supabase Auth dashboard ou via magic link no app
2. No **SQL Editor**, rode:

```sql
-- Substitua pelo email real e org_id do seed
UPDATE public.profiles
SET role = 'admin',
    organization_id = (SELECT id FROM public.organizations WHERE slug = 'messs')
WHERE email = 'seu@email.com';

-- Vincular admin a todos os clients
INSERT INTO public.profile_clients (profile_id, client_id)
SELECT p.id, c.id
FROM public.profiles p
CROSS JOIN public.clients c
WHERE p.email = 'seu@email.com';
```

## 8. Criar user cliente (Galderma)

```sql
-- Após o user da Galderma se registrar via magic link:
UPDATE public.profiles
SET role = 'client'
WHERE email = 'contato@galderma.com';

-- Vincular ao client Galderma apenas
INSERT INTO public.profile_clients (profile_id, client_id)
SELECT p.id, c.id
FROM public.profiles p
JOIN public.clients c ON c.slug = 'galderma-br'
WHERE p.email = 'contato@galderma.com';
```

Com RLS ativo, esse user só verá dados das brands vinculadas ao client Galderma.

## 9. Testar RLS

No **SQL Editor**, simule uma query como um user específico:

```sql
-- Testar como user anônimo (deve retornar vazio)
SET request.jwt.claims = '{"role": "anon"}';
SELECT * FROM public.brands;
-- Resultado: 0 rows ✓

-- Resetar
RESET request.jwt.claims;
```

## 10. Deploy Vercel

1. Push do repo para GitHub
2. Import no [vercel.com/new](https://vercel.com/new)
3. Adicionar env vars no Vercel dashboard
4. Em **Settings** → **Cron Jobs**, verificar que os crons do `vercel.json` aparecem
5. Gerar `CRON_SECRET` e adicionar como env var:

```bash
openssl rand -base64 32
```

## Checklist

- [ ] Projeto Supabase criado (sa-east-1)
- [ ] `.env.local` preenchido com todas as credenciais
- [ ] `npm run db:push` executado sem erros
- [ ] `supabase/setup.sql` executado no SQL Editor
- [ ] `npm run db:seed` executado com sucesso
- [ ] Email Auth ativo com Magic Link
- [ ] Primeiro admin criado e promovido
- [ ] RLS testado
- [ ] Deploy Vercel com env vars
- [ ] Cron jobs visíveis no Vercel dashboard
