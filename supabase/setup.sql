-- ============================================================================
-- MESSS × Galderma Digital Audit Dashboard
-- Supabase SQL Setup
-- ============================================================================
-- Executar no SQL Editor do Supabase Dashboard (supabase.com/dashboard)
-- Ordem: 1. Trigger de auth → 2. RLS policies
-- ============================================================================


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TRIGGER: Criar profile automaticamente quando user se registra
-- ═══════════════════════════════════════════════════════════════════════════

-- Função que cria o profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'role', 'client')
  );
  RETURN new;
END;
$$;

-- Trigger que dispara após insert em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função que limpa profile quando user é deletado
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = old.id;
  RETURN old;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deleted();


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. HELPER FUNCTIONS para RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- Retorna o role do user autenticado
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Retorna o organization_id do user autenticado
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Verifica se o user tem acesso a um client específico
CREATE OR REPLACE FUNCTION public.user_has_client_access(target_client_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    -- Admin/analyst da org vê todos os clients da org
    SELECT 1 FROM public.profiles p
    JOIN public.clients c ON c.organization_id = p.organization_id
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'analyst')
      AND c.id = target_client_id

    UNION

    -- Client role vê apenas os clients vinculados via profile_clients
    SELECT 1 FROM public.profile_clients pc
    WHERE pc.profile_id = auth.uid()
      AND pc.client_id = target_client_id
  );
$$;

-- Verifica se o user tem acesso a uma brand (via client)
CREATE OR REPLACE FUNCTION public.user_has_brand_access(target_brand_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.brands b
    WHERE b.id = target_brand_id
      AND public.user_has_client_access(b.client_id)
  );
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ENABLE RLS em todas as tabelas
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_console_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeo_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_entities ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- ── ORGANIZATIONS ──
-- Admin/analyst da org pode ver sua org
CREATE POLICY "org_select" ON public.organizations
  FOR SELECT USING (
    id = public.get_user_org_id()
    OR public.get_user_role() = 'admin'
  );

-- Apenas admin pode inserir/atualizar orgs
CREATE POLICY "org_insert" ON public.organizations
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "org_update" ON public.organizations
  FOR UPDATE USING (public.get_user_role() = 'admin');


-- ── CLIENTS ──
-- User vê clients que tem acesso
CREATE POLICY "client_select" ON public.clients
  FOR SELECT USING (
    public.user_has_client_access(id)
  );

-- Admin pode criar/editar clients da sua org
CREATE POLICY "client_insert" ON public.clients
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'admin'
    AND organization_id = public.get_user_org_id()
  );

CREATE POLICY "client_update" ON public.clients
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    AND organization_id = public.get_user_org_id()
  );


-- ── BRANDS ──
-- User vê brands dos clients que tem acesso
CREATE POLICY "brand_select" ON public.brands
  FOR SELECT USING (
    public.user_has_client_access(client_id)
  );

-- Admin pode criar/editar brands
CREATE POLICY "brand_insert" ON public.brands
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_client_access(client_id)
  );

CREATE POLICY "brand_update" ON public.brands
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_client_access(client_id)
  );


-- ── PROFILES ──
-- User vê seu próprio profile
-- Admin vê profiles da sua org
CREATE POLICY "profile_select" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR (
      public.get_user_role() = 'admin'
      AND organization_id = public.get_user_org_id()
    )
  );

-- User pode editar seu próprio profile (nome, avatar)
CREATE POLICY "profile_update_self" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Não pode alterar o próprio role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Admin pode editar profiles da org (incluindo role)
CREATE POLICY "profile_update_admin" ON public.profiles
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    AND organization_id = public.get_user_org_id()
  );


-- ── PROFILE_CLIENTS (vinculação user ↔ client) ──
CREATE POLICY "profile_clients_select" ON public.profile_clients
  FOR SELECT USING (
    profile_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "profile_clients_manage" ON public.profile_clients
  FOR ALL USING (public.get_user_role() = 'admin');


-- ── AUDITS ──
CREATE POLICY "audit_select" ON public.audits
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "audit_insert" ON public.audits
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

CREATE POLICY "audit_update" ON public.audits
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── SNAPSHOTS ──
CREATE POLICY "snapshot_select" ON public.snapshots
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "snapshot_insert" ON public.snapshots
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── FINDINGS ──
CREATE POLICY "finding_select" ON public.findings
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "finding_insert" ON public.findings
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

CREATE POLICY "finding_update" ON public.findings
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── RECOMMENDATIONS ──
CREATE POLICY "rec_select" ON public.recommendations
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "rec_insert" ON public.recommendations
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

-- Analyst e admin podem atualizar status
CREATE POLICY "rec_update" ON public.recommendations
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── SEARCH CONSOLE SNAPSHOTS ──
CREATE POLICY "sc_select" ON public.search_console_snapshots
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

-- Escrita apenas por admin/analyst (ou via service_role/cron, que bypassa RLS)
CREATE POLICY "sc_insert" ON public.search_console_snapshots
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

CREATE POLICY "sc_update" ON public.search_console_snapshots
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── KEYWORD SUGGESTIONS ──
CREATE POLICY "kw_select" ON public.keyword_suggestions
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "kw_insert" ON public.keyword_suggestions
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

CREATE POLICY "kw_update" ON public.keyword_suggestions
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── REDDIT MENTIONS ──
CREATE POLICY "reddit_select" ON public.reddit_mentions
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "reddit_insert" ON public.reddit_mentions
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

CREATE POLICY "reddit_update" ON public.reddit_mentions
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── AEO QUESTIONS ──
CREATE POLICY "aeo_select" ON public.aeo_questions
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "aeo_insert" ON public.aeo_questions
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

CREATE POLICY "aeo_update" ON public.aeo_questions
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ── BRAND ENTITIES ──
CREATE POLICY "entity_select" ON public.brand_entities
  FOR SELECT USING (
    public.user_has_brand_access(brand_id)
  );

CREATE POLICY "entity_insert" ON public.brand_entities
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );

CREATE POLICY "entity_update" ON public.brand_entities
  FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'analyst')
    AND public.user_has_brand_access(brand_id)
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. SERVICE ROLE BYPASS
-- ═══════════════════════════════════════════════════════════════════════════
-- As API routes de coleta (cron jobs) usam a service_role key do Supabase,
-- que automaticamente bypassa RLS. Não precisa de policy especial.
-- O cron endpoint valida via CRON_SECRET no header.


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════
-- Supabase já configura os grants automaticamente para authenticated e anon.
-- Se necessário, rodar manualmente:

-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. SEED DO PRIMEIRO ADMIN
-- ═══════════════════════════════════════════════════════════════════════════
-- Após criar o primeiro user via Supabase Auth (dashboard ou magic link),
-- promover para admin manualmente:
--
-- UPDATE public.profiles
-- SET role = 'admin', organization_id = '<org_id_do_seed>'
-- WHERE email = 'seu@email.com';
--
-- Vincular o admin a todos os clients:
--
-- INSERT INTO public.profile_clients (profile_id, client_id)
-- SELECT p.id, c.id
-- FROM public.profiles p
-- CROSS JOIN public.clients c
-- WHERE p.email = 'seu@email.com';
