// ============================================================================
// MESSS × Galderma Digital Audit Dashboard
// Seed Script — Dados reais das 3 marcas Galderma Brasil
// ============================================================================
// Executar: npm run db:seed (requer tsx instalado)
// Dados baseados nas auditorias reais de Fev/Mar 2026
// ============================================================================

import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";
import postgres from "postgres";
import { createId } from "@paralleldrive/cuid2";
import {
  organizations,
  clients,
  brands,
  audits,
  snapshots,
  findings,
  recommendations,
  LETTER_TO_NUMERIC,
} from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Copy .env.local.example to .env.local");
}

const connection = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(connection);

// ── IDs runtime (reaproveita registros existentes por slug) ──
const ids: {
  org: string;
  client: string;
  cetaphil: string;
  galdermaaesthetics: string;
  dermotivin: string;
  alastin: string;
  auditCetaphil: string;
  auditGaldermaAesthetics: string;
  auditDermotivin: string;
  auditAlastin: string;
} = {
  org: "",
  client: "",
  cetaphil: "",
  galdermaaesthetics: "",
  dermotivin: "",
  alastin: "",
  auditCetaphil: createId(),
  auditGaldermaAesthetics: createId(),
  auditDermotivin: createId(),
  auditAlastin: createId(),
};

async function getOrgIdBySlug(slug: string): Promise<string | null> {
  const rows = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function getClientIdBySlug(slug: string): Promise<string | null> {
  const rows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.slug, slug))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function getBrandIdByClientAndSlug(params: {
  clientId: string;
  slug: string;
}): Promise<string | null> {
  const rows = await db
    .select({ id: brands.id })
    .from(brands)
    .where(and(eq(brands.clientId, params.clientId), eq(brands.slug, params.slug)))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function seed() {
  console.log("🌱 Iniciando seed...\n");

  // ═══════════════════════════════════════════════
  // 1. ORGANIZAÇÃO
  // ═══════════════════════════════════════════════
  console.log("📦 Garantindo organização MESSS...");
  ids.org = (await getOrgIdBySlug("messs")) ?? createId();
  await db
    .insert(organizations)
    .values({
      id: ids.org,
      name: "MESSS",
      slug: "messs",
      logoUrl: null,
    })
    .onConflictDoNothing();
  ids.org = (await getOrgIdBySlug("messs")) ?? ids.org;

  // ═══════════════════════════════════════════════
  // 2. CLIENTE
  // ═══════════════════════════════════════════════
  console.log("📦 Garantindo cliente Galderma Brasil...");
  ids.client = (await getClientIdBySlug("galderma-br")) ?? createId();
  await db
    .insert(clients)
    .values({
      id: ids.client,
      name: "Galderma Brasil",
      slug: "galderma-br",
      organizationId: ids.org,
    })
    .onConflictDoNothing();
  ids.client = (await getClientIdBySlug("galderma-br")) ?? ids.client;

  // ═══════════════════════════════════════════════
  // 3. MARCAS
  // ═══════════════════════════════════════════════
  console.log("📦 Garantindo 4 marcas...");
  ids.cetaphil = (await getBrandIdByClientAndSlug({ clientId: ids.client, slug: "cetaphil" })) ?? createId();
  ids.galdermaaesthetics = (await getBrandIdByClientAndSlug({ clientId: ids.client, slug: "galdermaaesthetics" })) ?? createId();
  ids.dermotivin = (await getBrandIdByClientAndSlug({ clientId: ids.client, slug: "dermotivin" })) ?? createId();
  ids.alastin = (await getBrandIdByClientAndSlug({ clientId: ids.client, slug: "alastin" })) ?? createId();

  await db.insert(brands).values([
    {
      id: ids.cetaphil,
      name: "Cetaphil",
      domain: "cetaphil.com.br",
      slug: "cetaphil",
      clientId: ids.client,
      platform: "Salesforce Commerce Cloud (Demandware)",
      color: "#8021de",
      gradient: "linear-gradient(135deg, #681bb5, #8021de)",
    },
    {
      id: ids.galdermaaesthetics,
      name: "Galderma Aesthetics Brasil",
      domain: "galdermaaesthetics.com.br",
      slug: "galdermaaesthetics",
      clientId: ids.client,
      platform: "Site institucional",
      color: "#0ea5e9",
      gradient: "linear-gradient(135deg, #0284c7, #0ea5e9)",
    },
    {
      id: ids.dermotivin,
      name: "Dermotivin",
      domain: "dermotivin.com.br",
      slug: "dermotivin",
      clientId: ids.client,
      platform: "Drupal CMS",
      color: "#be12b3",
      gradient: "linear-gradient(135deg, #a6109c, #be12b3)",
    },
    {
      id: ids.alastin,
      name: "Alastin Skincare",
      domain: "alastin.com.br",
      slug: "alastin",
      clientId: ids.client,
      platform: "Magento / Adobe Commerce",
      color: "#4124b2",
      gradient: "linear-gradient(135deg, #411c87, #4124b2)",
    },
  ]).onConflictDoNothing();

  // Recarregar IDs (caso já existiam)
  ids.cetaphil =
    (await getBrandIdByClientAndSlug({ clientId: ids.client, slug: "cetaphil" })) ??
    ids.cetaphil;
  ids.galdermaaesthetics =
    (await getBrandIdByClientAndSlug({
      clientId: ids.client,
      slug: "galdermaaesthetics",
    })) ?? ids.galdermaaesthetics;
  ids.dermotivin =
    (await getBrandIdByClientAndSlug({ clientId: ids.client, slug: "dermotivin" })) ??
    ids.dermotivin;
  ids.alastin =
    (await getBrandIdByClientAndSlug({ clientId: ids.client, slug: "alastin" })) ??
    ids.alastin;

  // ═══════════════════════════════════════════════
  // 4. AUDITORIAS (scores normalizados)
  // ═══════════════════════════════════════════════
  console.log("📊 Criando auditorias com scores...");
  const auditDate = new Date("2026-03-01T00:00:00Z");

  await db.insert(audits).values([
    {
      id: ids.auditCetaphil,
      brandId: ids.cetaphil,
      date: auditDate,
      type: "full",
      cwvScore: "B",
      seoScore: "B+",
      aeoScore: "D",
      llmScore: "D+",
      cwvNumeric: LETTER_TO_NUMERIC["B"],
      seoNumeric: LETTER_TO_NUMERIC["B+"],
      aeoNumeric: LETTER_TO_NUMERIC["D"],
      llmNumeric: LETTER_TO_NUMERIC["D+"],
      notes: "Auditoria completa — CrUX com dados mobile e desktop. Desktop Origin tem CLS reprovado (0.18).",
    },
    {
      id: ids.auditGaldermaAesthetics,
      brandId: ids.galdermaaesthetics,
      date: auditDate,
      type: "full",
      cwvScore: "B+",
      seoScore: "B",
      aeoScore: "D+",
      llmScore: "D",
      cwvNumeric: LETTER_TO_NUMERIC["B+"],
      seoNumeric: LETTER_TO_NUMERIC["B"],
      aeoNumeric: LETTER_TO_NUMERIC["D+"],
      llmNumeric: LETTER_TO_NUMERIC["D"],
      notes:
        "Auditoria completa — galdermaaesthetics.com.br. Bom desempenho técnico com CrUX disponível; oportunidades em dados estruturados (Schema) e otimização para IAs generativas.",
    },
    {
      id: ids.auditDermotivin,
      brandId: ids.dermotivin,
      date: auditDate,
      type: "full",
      cwvScore: "A-",
      seoScore: "C+",
      aeoScore: "D+",
      llmScore: "F",
      cwvNumeric: LETTER_TO_NUMERIC["A-"],
      seoNumeric: LETTER_TO_NUMERIC["C+"],
      aeoNumeric: LETTER_TO_NUMERIC["D+"],
      llmNumeric: LETTER_TO_NUMERIC["F"],
      notes: "CWV excelente mas LLM F — Drupal renderiza 100% client-side, crawlers de IA não conseguem ler nenhum conteúdo.",
    },
    {
      id: ids.auditAlastin,
      brandId: ids.alastin,
      date: auditDate,
      type: "full",
      cwvScore: "D",
      seoScore: "C-",
      aeoScore: "D-",
      llmScore: "D+",
      cwvNumeric: LETTER_TO_NUMERIC["D"],
      seoNumeric: LETTER_TO_NUMERIC["C-"],
      aeoNumeric: LETTER_TO_NUMERIC["D-"],
      llmNumeric: LETTER_TO_NUMERIC["D+"],
      notes: "Sem dados CrUX (tráfego insuficiente). Lighthouse lab data only. Performance 63, muitos problemas de acessibilidade e peso de JS.",
    },
  ]);

  // ═══════════════════════════════════════════════
  // 5. SNAPSHOTS (CrUX + Lighthouse)
  // ═══════════════════════════════════════════════
  console.log("📈 Criando snapshots CrUX e Lighthouse...");

  const cruxPeriod = new Date("2026-02-24T00:00:00Z"); // Fim do período CrUX 28/01-24/02

  await db.insert(snapshots).values([
    // ── CETAPHIL ──
    // CrUX Mobile
    {
      id: createId(),
      brandId: ids.cetaphil,
      date: cruxPeriod,
      source: "crux",
      strategy: "mobile",
      url: "https://cetaphil.com.br",
      isOrigin: false,
      lcpValue: 1900,
      lcpRating: "good",
      inpValue: 145,
      inpRating: "good",
      clsValue: 0.05,
      clsRating: "good",
      ttfbValue: 1000,
      ttfbRating: "needs-improvement",
    },
    // CrUX Desktop URL
    {
      id: createId(),
      brandId: ids.cetaphil,
      date: cruxPeriod,
      source: "crux",
      strategy: "desktop",
      url: "https://cetaphil.com.br",
      isOrigin: false,
      lcpValue: 1400,
      lcpRating: "good",
      inpValue: 58,
      inpRating: "good",
      clsValue: 0.02,
      clsRating: "good",
      ttfbValue: 900,
      ttfbRating: "needs-improvement",
    },
    // CrUX Desktop Origin (CLS reprovado)
    {
      id: createId(),
      brandId: ids.cetaphil,
      date: cruxPeriod,
      source: "crux",
      strategy: "desktop",
      url: "https://cetaphil.com.br",
      isOrigin: true,
      clsValue: 0.18,
      clsRating: "poor", // 56% good, threshold 75%
    },

    // ── GALDERMA AESTHETICS ──
    // CrUX Mobile (URL)
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      date: new Date("2026-03-02T00:00:00Z"),
      source: "crux",
      strategy: "mobile",
      url: "https://galdermaaesthetics.com.br",
      isOrigin: false,
      lcpValue: 2100,
      lcpRating: "good",
      inpValue: 160,
      inpRating: "good",
      clsValue: 0.06,
      clsRating: "good",
      ttfbValue: 950,
      ttfbRating: "needs-improvement",
    },
    // Lighthouse Lab Data Desktop
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      date: new Date("2026-03-01T00:00:00Z"),
      source: "lighthouse",
      strategy: "desktop",
      url: "https://galdermaaesthetics.com.br",
      isOrigin: false,
      performanceScore: 78,
      accessibilityScore: 85,
      bestPracticesScore: 96,
      seoScore: 90,
      fcpValue: 900,
      lcpValue: 2800,
      tbtValue: 180,
      clsValue: 0.04,
      speedIndex: 2600,
      ttiValue: 3200,
      ttfbValue: 600,
    },

    // ── DERMOTIVIN ──
    // CrUX Mobile
    {
      id: createId(),
      brandId: ids.dermotivin,
      date: cruxPeriod,
      source: "crux",
      strategy: "mobile",
      url: "https://dermotivin.com.br",
      isOrigin: false,
      lcpValue: 1700,
      lcpRating: "good",
      inpValue: 105,
      inpRating: "good",
      clsValue: 0.05,
      clsRating: "good",
      ttfbValue: 500,
      ttfbRating: "good",
    },
    // CrUX Desktop
    {
      id: createId(),
      brandId: ids.dermotivin,
      date: cruxPeriod,
      source: "crux",
      strategy: "desktop",
      url: "https://dermotivin.com.br",
      isOrigin: false,
      lcpValue: 1100,
      lcpRating: "good",
      inpValue: 48,
      inpRating: "good",
      clsValue: 0.01,
      clsRating: "good",
      ttfbValue: 300,
      ttfbRating: "good",
    },

    // ── ALASTIN ──
    // Lighthouse Lab Data Desktop (sem CrUX — tráfego insuficiente)
    {
      id: createId(),
      brandId: ids.alastin,
      date: new Date("2026-03-01T00:00:00Z"),
      source: "lighthouse",
      strategy: "desktop",
      url: "https://alastin.com.br",
      isOrigin: false,
      performanceScore: 63,
      accessibilityScore: 77,
      bestPracticesScore: 96,
      seoScore: 92,
      fcpValue: 500,
      lcpValue: 2000,
      tbtValue: 400,
      clsValue: 0.096,
      speedIndex: 3400,
      ttiValue: 5400,
      ttfbValue: 420,
      // Payload data
      totalByteWeight: 2_500_000, // ~2.4MB total
      unusedJsBytes: 1_003_000, // 1003KB JS
    },
  ]);

  // ═══════════════════════════════════════════════
  // 6. FINDINGS
  // ═══════════════════════════════════════════════
  console.log("🔍 Criando findings...");

  // ── CETAPHIL — 11 findings (3 critical, 4 warn, 4 good) ──
  await db.insert(findings).values([
    // Critical (3)
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "critical",
      category: "cwv",
      text: "CLS Desktop Origin reprovado: 0.18 (apenas 56% dos usuários com boa experiência, threshold é 75%). Imagens de produto e banners no domínio inteiro causam layout shift.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "critical",
      category: "aeo",
      text: "Nenhum conteúdo answer-first. Páginas de produto não respondem diretamente a perguntas frequentes (ex: 'Cetaphil é bom para pele oleosa?'). Zero chance de Featured Snippet.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "critical",
      category: "llm",
      text: "robots.txt bloqueia GPTBot, ClaudeBot e PerplexityBot. IAs generativas não conseguem citar o site como fonte. Perda total de visibilidade em buscas por IA.",
    },
    // Warning (4)
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "warning",
      category: "cwv",
      text: "TTFB mobile 1.0s e desktop 0.9s — acima do threshold ideal (800ms). Salesforce Commerce Cloud tem latência alta de servidor para requisições no Brasil.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "warning",
      category: "seo",
      text: "Schema markup incompleto: apenas Organization implementado. Faltam Product, FAQ, BreadcrumbList e Review — essenciais para rich results em skincare.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "warning",
      category: "seo",
      text: "Meta descriptions genéricas em páginas de produto. Muitas duplicadas com texto padrão da plataforma SFCC, reduzindo CTR orgânico.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "warning",
      category: "aeo",
      text: "FAQ section existe em algumas páginas mas não está marcada com schema FAQPage. Google não exibe como rich result e IAs não identificam como Q&A.",
    },
    // Good (4)
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "good",
      category: "cwv",
      text: "Core Web Vitals mobile aprovados: LCP 1.9s ✓, INP 145ms ✓, CLS 0.05 ✓. Boa experiência do usuário em dispositivos móveis.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "good",
      category: "cwv",
      text: "CWV desktop URL aprovados: LCP 1.4s ✓, INP 58ms ✓, CLS 0.02 ✓. Homepage performa bem em desktop.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "good",
      category: "seo",
      text: "SSR ativo via Salesforce Commerce Cloud. Conteúdo renderizado no servidor — crawlers conseguem ler HTML completo sem executar JavaScript.",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      type: "good",
      category: "seo",
      text: "Sitemap.xml e robots.txt bem configurados (exceto bloqueio de bots IA). Hierarquia de URLs limpa e indexação consistente.",
    },
  ]);

  // ── GALDERMA AESTHETICS — 9 findings (4 critical, 3 warn, 2 good) ──
  await db.insert(findings).values([
    // Critical (4)
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "critical",
      category: "aeo",
      text: "Ausência de dados estruturados (JSON-LD) para FAQ/HowTo/MedicalEntity. Baixa chance de Featured Snippets e baixa legibilidade para IAs generativas.",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "critical",
      category: "llm",
      text: "Conteúdo não otimizado para LLMs: falta de seções answer-first e estrutura semântica inconsistente. IAs têm dificuldade de extrair respostas e citar o domínio.",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "critical",
      category: "seo",
      text: "Cobertura informacional limitada para dúvidas e intenções topo de funil. Oportunidade de ampliar tráfego orgânico com clusters por procedimento/produto.",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "critical",
      category: "cwv",
      text: "LCP com tendência a needs-improvement em algumas páginas (especialmente desktop). Otimização de imagens hero e priorização de recursos pode reduzir o p75.",
    },
    // Warning (3)
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "warning",
      category: "seo",
      text: "Titles e descriptions com oportunidades de melhoria para CTR: incluir benefício + procedimento/indicação, evitando padrões repetidos.",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "warning",
      category: "aeo",
      text: "FAQ existente (quando presente) não está marcada com schema FAQPage; Google e IA não reconhecem o conteúdo como Q&A.",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "warning",
      category: "performance",
      text: "Recursos render-blocking em páginas de campanha podem atrasar FCP e impactar LCP em conexões móveis.",
    },
    // Good (2)
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "good",
      category: "cwv",
      text: "CrUX disponível com dados mobile e desktop — base sólida para acompanhar evolução semanal e medir impacto de otimizações.",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      type: "good",
      category: "seo",
      text: "Conteúdo científico com referências clínicas fortalece E-E-A-T, especialmente em estética injetável.",
    },
  ]);

  // ── DERMOTIVIN — 10 findings (4 critical, 2 warn, 4 good) ──
  await db.insert(findings).values([
    // Critical (4)
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "critical",
      category: "llm",
      text: "BLOQUEIO TOTAL para crawlers de IA. Drupal renderiza 100% via client-side JavaScript. GPTBot, ClaudeBot e PerplexityBot recebem HTML vazio — zero conteúdo indexável por LLMs.",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "critical",
      category: "seo",
      text: "Client-Side Rendering (CSR) compromete SEO. Googlebot consegue renderizar JS, mas o processo é lento e nem todo conteúdo dinâmico é capturado. Risco de indexação incompleta.",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "critical",
      category: "aeo",
      text: "Sem dados estruturados (Schema Markup). Nenhum schema Organization, Product ou FAQ implementado. Google não gera rich results e IAs não conseguem classificar o conteúdo.",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "critical",
      category: "seo",
      text: "Conteúdo de texto mínimo nas páginas. Drupal carrega produtos via API JSON e renderiza no browser — o HTML fonte tem apenas skeleton/loading states.",
    },
    // Warning (2)
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "warning",
      category: "seo",
      text: "Meta tags geradas dinamicamente via JS. Crawlers que não executam JavaScript (incluindo todos os bots de IA) veem títulos e descriptions genéricos ou vazios.",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "warning",
      category: "aeo",
      text: "Nenhum conteúdo educacional ou editorial. Site é puramente catalógo de produtos sem artigos, guias ou FAQ — não compete para queries informacionais.",
    },
    // Good (4)
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "good",
      category: "cwv",
      text: "Core Web Vitals EXCELENTES em todas as métricas. Mobile: LCP 1.7s ✓, INP 105ms ✓, CLS 0.05 ✓, TTFB 0.5s ✓. Melhor CWV entre as 3 marcas.",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "good",
      category: "cwv",
      text: "Desktop CWV perfeitos: LCP 1.1s ✓, INP 48ms ✓, CLS 0.01 ✓, TTFB 0.3s ✓. Todos os indicadores verdes, zero reprovações.",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "good",
      category: "performance",
      text: "Infraestrutura otimizada. CDN bem configurado com TTFB 0.3s desktop — o mais rápido entre as 3 marcas. Servidor responde rápido.",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      type: "good",
      category: "performance",
      text: "Assets otimizados: imagens com lazy loading, CSS/JS minificados. Apesar do CSR, a aplicação JavaScript é bem construída e leve.",
    },
  ]);

  // ── ALASTIN — 12 findings (4 critical, 4 warn, 4 good) ──
  await db.insert(findings).values([
    // Critical (4)
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "critical",
      category: "performance",
      text: "JavaScript total: 1.003KB — mais da metade não utilizado na página inicial. Bundles Magento pesados com módulos desnecessários bloqueando interatividade (TBT 400ms).",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "critical",
      category: "performance",
      text: "Imagens totalizam 746KB sem otimização adequada. Formatos antigos (JPEG/PNG) sem conversão para WebP/AVIF. Sem dimensões explícitas, contribuindo para CLS 0.096.",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "critical",
      category: "a11y",
      text: "Contraste insuficiente em 14 elementos de texto. Ratio abaixo de 4.5:1 em links e labels — viola WCAG 2.1 AA. Impacta usabilidade e score de acessibilidade (77).",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "critical",
      category: "cwv",
      text: "Sem dados CrUX — tráfego insuficiente (<1.000 visitas/mês). Google não tem dados de campo para ranqueamento. Métricas dependem apenas de lab data (Lighthouse).",
    },
    // Warning (4)
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "warning",
      category: "performance",
      text: "Recursos render-blocking: 250ms de bloqueio por CSS e JS no head. Scripts síncronos impedem o First Contentful Paint de iniciar mais cedo.",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "warning",
      category: "a11y",
      text: "Atributos ARIA incorretos em 6 componentes interativos. Roles e states não correspondem ao comportamento real — confunde screen readers.",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "warning",
      category: "a11y",
      text: "Hierarquia de headings quebrada: salta de H1 para H3 em múltiplas páginas. H2 ausente prejudica navegação por screen reader e SEO semântico.",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "warning",
      category: "seo",
      text: "Links sem texto descritivo: 8 instâncias de 'clique aqui' e 'saiba mais'. Prejudica acessibilidade e indexação — Google precisa de anchor text relevante.",
    },
    // Good (4)
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "good",
      category: "seo",
      text: "SSR ativo via Magento. HTML renderizado no servidor com conteúdo completo — crawlers de busca e IA conseguem ler todo o conteúdo sem executar JS.",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "good",
      category: "seo",
      text: "Lighthouse SEO score 92 — meta tags bem configuradas, canonical URLs corretas, sitemap válido. Base sólida para otimização on-page.",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "good",
      category: "performance",
      text: "Best Practices score 96 — HTTPS ativo, sem erros de console, APIs modernas. Infraestrutura Magento bem mantida do ponto de vista de segurança.",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      type: "good",
      category: "performance",
      text: "FCP 0.5s — primeiro conteúdo aparece rápido. Servidor responde bem (TTFB 420ms) apesar do peso total da página. CDN funcionando.",
    },
  ]);

  // ═══════════════════════════════════════════════
  // 7. RECOMENDAÇÕES
  // ═══════════════════════════════════════════════
  console.log("💡 Criando recomendações...");

  // ── CETAPHIL — 8 recomendações ──
  await db.insert(recommendations).values([
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "critical",
      category: "cwv",
      text: "Corrigir CLS Desktop Origin: adicionar width/height explícitos em todas as imagens de produto e banners. Reservar espaço para web fonts com font-display: swap e size-adjust.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "critical",
      category: "llm",
      text: "Desbloquear crawlers de IA no robots.txt: permitir GPTBot, ClaudeBot, PerplexityBot e Bytespider. Sem isso, a marca é invisível para 100% das buscas por IA generativa.",
      timeline: "1 dia",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "high",
      category: "aeo",
      text: "Implementar conteúdo answer-first nas top 20 páginas de produto. Primeira frase deve responder diretamente à pergunta mais comum sobre cada produto.",
      timeline: "2-4 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "high",
      category: "seo",
      text: "Implementar schema markup completo: Product (com offers, reviews), FAQ, BreadcrumbList em todas as páginas de produto. Habilita rich results no Google.",
      timeline: "2-4 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "high",
      category: "seo",
      text: "Reescrever meta descriptions únicas para cada página de produto. Incluir benefício principal + CTA. Evitar texto padrão SFCC duplicado.",
      timeline: "2-4 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "medium",
      category: "aeo",
      text: "Marcar FAQs existentes com schema FAQPage. Google exibirá como rich result expandível e IAs citarão como fonte confiável.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "medium",
      category: "cwv",
      text: "Investigar e reduzir TTFB: considerar CDN com edge caching no Brasil (Cloudflare/Fastly) para diminuir latência do SFCC.",
      timeline: "4-8 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.cetaphil,
      auditId: ids.auditCetaphil,
      priority: "low",
      category: "aeo",
      text: "Criar hub de conteúdo educacional: artigos sobre rotina de skincare, ingredientes, tipos de pele. Posiciona a marca para queries informacionais e aumenta citabilidade por IA.",
      timeline: "4-12 sem",
      status: "pending",
    },
  ]);

  // ── GALDERMA AESTHETICS — 4 recomendações ──
  await db.insert(recommendations).values([
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      priority: "critical",
      category: "aeo",
      text: "Implementar schema markup (JSON-LD): FAQPage, HowTo (quando aplicável), Organization e BreadcrumbList. Facilita rich results e extração por IA.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      priority: "critical",
      category: "llm",
      text: "Criar páginas answer-first para as 30 principais dúvidas (indicações, duração, pós-procedimento). Resposta direta no topo + seção detalhada com fontes.",
      timeline: "4-8 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      priority: "high",
      category: "cwv",
      text: "Otimizar LCP: imagens hero em AVIF/WebP, preload da imagem principal e redução de render-blocking no head.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.galdermaaesthetics,
      auditId: ids.auditGaldermaAesthetics,
      priority: "high",
      category: "seo",
      text: "Expandir cobertura informacional: glossário de termos e clusters de conteúdo por procedimento/produto para capturar topo de funil.",
      timeline: "4-12 sem",
      status: "pending",
    },
  ]);

  // ── DERMOTIVIN — 7 recomendações ──
  await db.insert(recommendations).values([
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      priority: "critical",
      category: "llm",
      text: "Migrar de CSR para SSR/SSG. Opções: (1) habilitar Server-Side Rendering no Drupal, (2) usar Drupal como headless CMS com Next.js no frontend, (3) implementar pre-rendering/ISR. Sem isso, a marca continua invisível para 100% dos LLMs.",
      timeline: "8-16 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      priority: "critical",
      category: "seo",
      text: "Implementar pre-rendering como solução imediata enquanto SSR não estiver pronto. Serviços como Prerender.io ou Rendertron podem servir HTML estático para crawlers.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      priority: "critical",
      category: "seo",
      text: "Implementar dados estruturados (JSON-LD): Organization, Product, BreadcrumbList. Atualmente zero schema markup — Google não gera nenhum rich result.",
      timeline: "2-4 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      priority: "high",
      category: "seo",
      text: "Garantir que meta tags (title, description, canonical) sejam renderizadas no HTML inicial do servidor, não injetadas via JS. Essencial para indexação correta.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      priority: "high",
      category: "aeo",
      text: "Criar seção de FAQ em cada categoria de produto com perguntas reais dos consumidores. Marcar com schema FAQPage para competir em Featured Snippets.",
      timeline: "4-8 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      priority: "medium",
      category: "aeo",
      text: "Produzir conteúdo editorial: guias de cuidado com a pele, comparativos de ingredientes, rotinas recomendadas. Aumenta autoridade e citabilidade.",
      timeline: "4-12 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.dermotivin,
      auditId: ids.auditDermotivin,
      priority: "low",
      category: "llm",
      text: "Após implementar SSR, permitir crawlers de IA no robots.txt e criar content hub otimizado para citação por LLMs (answer-first, schema, E-E-A-T).",
      timeline: "12-16 sem",
      status: "pending",
    },
  ]);

  // ── ALASTIN — 11 recomendações ──
  await db.insert(recommendations).values([
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "critical",
      category: "performance",
      text: "Reduzir JavaScript: auditar e remover módulos Magento não utilizados. Code-split bundles por rota. Meta: reduzir de 1.003KB para <400KB. Impacto direto no TBT (400ms → <200ms).",
      timeline: "4-8 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "critical",
      category: "performance",
      text: "Otimizar imagens: converter para WebP/AVIF, implementar responsive images com srcset, adicionar width/height em todas as <img>. Reduzir de 746KB para <200KB.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "critical",
      category: "a11y",
      text: "Corrigir contraste de texto: ajustar cores de links e labels para ratio mínimo 4.5:1 (WCAG AA). 14 elementos reprovados — maioria são CTAs e preços.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "high",
      category: "performance",
      text: "Eliminar render-blocking resources: mover CSS não-crítico para async, defer scripts no <head>. Reduzir bloqueio de 250ms para <50ms.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "high",
      category: "a11y",
      text: "Corrigir atributos ARIA em 6 componentes: verificar roles, states e properties. Garantir que componentes interativos (dropdowns, modais, tabs) são navigáveis por teclado.",
      timeline: "2-4 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "high",
      category: "a11y",
      text: "Corrigir hierarquia de headings: garantir progressão H1 → H2 → H3 sem pular níveis. Cada página deve ter exatamente um H1 com keyword principal.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "high",
      category: "seo",
      text: "Substituir links genéricos ('clique aqui', 'saiba mais') por anchor text descritivo com keywords relevantes. 8 instâncias identificadas.",
      timeline: "1-2 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "medium",
      category: "seo",
      text: "Implementar schema markup: Product (com offers), Organization, BreadcrumbList. Magento tem extensões que facilitam a implementação de JSON-LD.",
      timeline: "2-4 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "medium",
      category: "aeo",
      text: "Criar FAQ sections com schema FAQPage em cada página de produto. Focar nas perguntas mais buscadas sobre ALASTIN e procedimentos estéticos.",
      timeline: "2-4 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "medium",
      category: "cwv",
      text: "Aumentar tráfego para habilitar dados CrUX: mínimo ~1.000 visitas/mês. Combinar SEO técnico com estratégia de conteúdo e divulgação para atingir threshold do Chrome.",
      timeline: "8-16 sem",
      status: "pending",
    },
    {
      id: createId(),
      brandId: ids.alastin,
      auditId: ids.auditAlastin,
      priority: "low",
      category: "llm",
      text: "Após otimizações de performance e conteúdo, verificar se crawlers de IA estão liberados no robots.txt. ALASTIN tem SSR ativo — potencial de citabilidade é alto se o conteúdo for otimizado.",
      timeline: "4-8 sem",
      status: "pending",
    },
  ]);

  // ═══════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════
  console.log("\n✅ Seed completo!");
  console.log("   • 1 organização (MESSS)");
  console.log("   • 1 cliente (Galderma Brasil)");
  console.log("   • 3 marcas (Cetaphil, Dermotivin, ALASTIN)");
  console.log("   • 3 auditorias com scores normalizados");
  console.log("   • 7 snapshots (CrUX + Lighthouse)");
  console.log("   • 33 findings (11 + 10 + 12)");
  console.log("   • 26 recomendações (8 + 7 + 11)");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
