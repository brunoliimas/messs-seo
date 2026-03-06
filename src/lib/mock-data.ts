// ============================================================================
// Mock data para desenvolvimento — espelha exatamente o seed.ts
// Usar enquanto o Supabase não estiver conectado
// Quando conectar, substituir imports por queries ao DB
// ============================================================================

import type { BrandSummary } from "@/types";
import type { Finding, Recommendation } from "@/lib/db/schema";

// ── Brand Summaries (Overview page) ──

export const MOCK_BRANDS: BrandSummary[] = [
  {
    id: "cetaphil",
    name: "Cetaphil",
    slug: "cetaphil",
    domain: "cetaphil.com.br",
    platform: "Salesforce Commerce Cloud (Demandware)",
    color: "#8021de",
    gradient: "linear-gradient(135deg, #681bb5, #8021de)",
    scores: {
      cwv: { letter: "B", numeric: 83 },
      seo: { letter: "B+", numeric: 87 },
      aeo: { letter: "D", numeric: 63 },
      llm: { letter: "D+", numeric: 67 },
    },
    findingCounts: { critical: 3, warning: 4, good: 4 },
  },
  {
    id: "dermotivin",
    name: "Dermotivin",
    slug: "dermotivin",
    domain: "dermotivin.com.br",
    platform: "Drupal CMS",
    color: "#be12b3",
    gradient: "linear-gradient(135deg, #a6109c, #be12b3)",
    scores: {
      cwv: { letter: "A-", numeric: 90 },
      seo: { letter: "C+", numeric: 77 },
      aeo: { letter: "D+", numeric: 67 },
      llm: { letter: "F", numeric: 40 },
    },
    findingCounts: { critical: 4, warning: 2, good: 4 },
  },
  {
    id: "alastin",
    name: "ALASTIN Skincare",
    slug: "alastin",
    domain: "alastin.com.br",
    platform: "Magento / Adobe Commerce",
    color: "#4124b2",
    gradient: "linear-gradient(135deg, #411c87, #4124b2)",
    scores: {
      cwv: { letter: "D", numeric: 63 },
      seo: { letter: "C-", numeric: 70 },
      aeo: { letter: "D-", numeric: 60 },
      llm: { letter: "D+", numeric: 67 },
    },
    findingCounts: { critical: 4, warning: 4, good: 4 },
  },
];

// ── Snapshots por marca ──

export interface MockSnapshot {
  source: string;
  strategy: string;
  isOrigin: boolean;
  date: string;
  metrics: Record<string, { value: number | null; rating: string | null }>;
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  labMetrics?: Record<string, number>;
}

export const MOCK_SNAPSHOTS: Record<string, MockSnapshot[]> = {
  cetaphil: [
    {
      source: "crux",
      strategy: "mobile",
      isOrigin: false,
      date: "2026-02-24",
      metrics: {
        lcp: { value: 1900, rating: "good" },
        inp: { value: 145, rating: "good" },
        cls: { value: 0.05, rating: "good" },
        ttfb: { value: 1000, rating: "needs-improvement" },
      },
    },
    {
      source: "crux",
      strategy: "desktop",
      isOrigin: false,
      date: "2026-02-24",
      metrics: {
        lcp: { value: 1400, rating: "good" },
        inp: { value: 58, rating: "good" },
        cls: { value: 0.02, rating: "good" },
        ttfb: { value: 900, rating: "needs-improvement" },
      },
    },
    {
      source: "crux",
      strategy: "desktop",
      isOrigin: true,
      date: "2026-02-24",
      metrics: {
        cls: { value: 0.18, rating: "poor" },
      },
    },
  ],
  dermotivin: [
    {
      source: "crux",
      strategy: "mobile",
      isOrigin: false,
      date: "2026-02-24",
      metrics: {
        lcp: { value: 1700, rating: "good" },
        inp: { value: 105, rating: "good" },
        cls: { value: 0.05, rating: "good" },
        ttfb: { value: 500, rating: "good" },
      },
    },
    {
      source: "crux",
      strategy: "desktop",
      isOrigin: false,
      date: "2026-02-24",
      metrics: {
        lcp: { value: 1100, rating: "good" },
        inp: { value: 48, rating: "good" },
        cls: { value: 0.01, rating: "good" },
        ttfb: { value: 300, rating: "good" },
      },
    },
  ],
  alastin: [
    {
      source: "lighthouse",
      strategy: "desktop",
      isOrigin: false,
      date: "2026-03-01",
      metrics: {
        fcp: { value: 500, rating: "good" },
        lcp: { value: 2000, rating: "good" },
        cls: { value: 0.096, rating: "good" },
        ttfb: { value: 420, rating: "good" },
      },
      lighthouse: {
        performance: 63,
        accessibility: 77,
        bestPractices: 96,
        seo: 92,
      },
      labMetrics: {
        tbt: 400,
        si: 3400,
        tti: 5400,
      },
    },
  ],
};

// ── Findings por marca ──

type MockFinding = Pick<Finding, "type" | "category" | "text" | "resolved">;

export const MOCK_FINDINGS: Record<string, MockFinding[]> = {
  cetaphil: [
    { type: "critical", category: "cwv", text: "CLS Desktop Origin reprovado: 0.18 (apenas 56% dos usuários com boa experiência, threshold é 75%). Imagens de produto e banners no domínio inteiro causam layout shift.", resolved: false },
    { type: "critical", category: "aeo", text: "Nenhum conteúdo answer-first. Páginas de produto não respondem diretamente a perguntas frequentes (ex: 'Cetaphil é bom para pele oleosa?'). Zero chance de Featured Snippet.", resolved: false },
    { type: "critical", category: "llm", text: "robots.txt bloqueia GPTBot, ClaudeBot e PerplexityBot. IAs generativas não conseguem citar o site como fonte. Perda total de visibilidade em buscas por IA.", resolved: false },
    { type: "warning", category: "cwv", text: "TTFB mobile 1.0s e desktop 0.9s — acima do threshold ideal (800ms). Salesforce Commerce Cloud tem latência alta de servidor para requisições no Brasil.", resolved: false },
    { type: "warning", category: "seo", text: "Schema markup incompleto: apenas Organization implementado. Faltam Product, FAQ, BreadcrumbList e Review — essenciais para rich results em skincare.", resolved: false },
    { type: "warning", category: "seo", text: "Meta descriptions genéricas em páginas de produto. Muitas duplicadas com texto padrão da plataforma SFCC, reduzindo CTR orgânico.", resolved: false },
    { type: "warning", category: "aeo", text: "FAQ section existe em algumas páginas mas não está marcada com schema FAQPage. Google não exibe como rich result e IAs não identificam como Q&A.", resolved: false },
    { type: "good", category: "cwv", text: "Core Web Vitals mobile aprovados: LCP 1.9s ✓, INP 145ms ✓, CLS 0.05 ✓. Boa experiência do usuário em dispositivos móveis.", resolved: false },
    { type: "good", category: "cwv", text: "CWV desktop URL aprovados: LCP 1.4s ✓, INP 58ms ✓, CLS 0.02 ✓. Homepage performa bem em desktop.", resolved: false },
    { type: "good", category: "seo", text: "SSR ativo via Salesforce Commerce Cloud. Conteúdo renderizado no servidor — crawlers conseguem ler HTML completo sem executar JavaScript.", resolved: false },
    { type: "good", category: "seo", text: "Sitemap.xml e robots.txt bem configurados (exceto bloqueio de bots IA). Hierarquia de URLs limpa e indexação consistente.", resolved: false },
  ],
  dermotivin: [
    { type: "critical", category: "llm", text: "BLOQUEIO TOTAL para crawlers de IA. Drupal renderiza 100% via client-side JavaScript. GPTBot, ClaudeBot e PerplexityBot recebem HTML vazio — zero conteúdo indexável por LLMs.", resolved: false },
    { type: "critical", category: "seo", text: "Client-Side Rendering (CSR) compromete SEO. Googlebot consegue renderizar JS, mas o processo é lento e nem todo conteúdo dinâmico é capturado. Risco de indexação incompleta.", resolved: false },
    { type: "critical", category: "aeo", text: "Sem dados estruturados (Schema Markup). Nenhum schema Organization, Product ou FAQ implementado. Google não gera rich results e IAs não conseguem classificar o conteúdo.", resolved: false },
    { type: "critical", category: "seo", text: "Conteúdo de texto mínimo nas páginas. Drupal carrega produtos via API JSON e renderiza no browser — o HTML fonte tem apenas skeleton/loading states.", resolved: false },
    { type: "warning", category: "seo", text: "Meta tags geradas dinamicamente via JS. Crawlers que não executam JavaScript (incluindo todos os bots de IA) veem títulos e descriptions genéricos ou vazios.", resolved: false },
    { type: "warning", category: "aeo", text: "Nenhum conteúdo educacional ou editorial. Site é puramente catálogo de produtos sem artigos, guias ou FAQ — não compete para queries informacionais.", resolved: false },
    { type: "good", category: "cwv", text: "Core Web Vitals EXCELENTES em todas as métricas. Mobile: LCP 1.7s ✓, INP 105ms ✓, CLS 0.05 ✓, TTFB 0.5s ✓. Melhor CWV entre as 3 marcas.", resolved: false },
    { type: "good", category: "cwv", text: "Desktop CWV perfeitos: LCP 1.1s ✓, INP 48ms ✓, CLS 0.01 ✓, TTFB 0.3s ✓. Todos os indicadores verdes, zero reprovações.", resolved: false },
    { type: "good", category: "performance", text: "Infraestrutura otimizada. CDN bem configurado com TTFB 0.3s desktop — o mais rápido entre as 3 marcas. Servidor responde rápido.", resolved: false },
    { type: "good", category: "performance", text: "Assets otimizados: imagens com lazy loading, CSS/JS minificados. Apesar do CSR, a aplicação JavaScript é bem construída e leve.", resolved: false },
  ],
  alastin: [
    { type: "critical", category: "performance", text: "JavaScript total: 1.003KB — mais da metade não utilizado na página inicial. Bundles Magento pesados com módulos desnecessários bloqueando interatividade (TBT 400ms).", resolved: false },
    { type: "critical", category: "performance", text: "Imagens totalizam 746KB sem otimização adequada. Formatos antigos (JPEG/PNG) sem conversão para WebP/AVIF. Sem dimensões explícitas, contribuindo para CLS 0.096.", resolved: false },
    { type: "critical", category: "a11y", text: "Contraste insuficiente em 14 elementos de texto. Ratio abaixo de 4.5:1 em links e labels — viola WCAG 2.1 AA. Impacta usabilidade e score de acessibilidade (77).", resolved: false },
    { type: "critical", category: "cwv", text: "Sem dados CrUX — tráfego insuficiente (<1.000 visitas/mês). Google não tem dados de campo para ranqueamento. Métricas dependem apenas de lab data (Lighthouse).", resolved: false },
    { type: "warning", category: "performance", text: "Recursos render-blocking: 250ms de bloqueio por CSS e JS no head. Scripts síncronos impedem o First Contentful Paint de iniciar mais cedo.", resolved: false },
    { type: "warning", category: "a11y", text: "Atributos ARIA incorretos em 6 componentes interativos. Roles e states não correspondem ao comportamento real — confunde screen readers.", resolved: false },
    { type: "warning", category: "a11y", text: "Hierarquia de headings quebrada: salta de H1 para H3 em múltiplas páginas. H2 ausente prejudica navegação por screen reader e SEO semântico.", resolved: false },
    { type: "warning", category: "seo", text: "Links sem texto descritivo: 8 instâncias de 'clique aqui' e 'saiba mais'. Prejudica acessibilidade e indexação — Google precisa de anchor text relevante.", resolved: false },
    { type: "good", category: "seo", text: "SSR ativo via Magento. HTML renderizado no servidor com conteúdo completo — crawlers de busca e IA conseguem ler todo o conteúdo sem executar JS.", resolved: false },
    { type: "good", category: "seo", text: "Lighthouse SEO score 92 — meta tags bem configuradas, canonical URLs corretas, sitemap válido. Base sólida para otimização on-page.", resolved: false },
    { type: "good", category: "performance", text: "Best Practices score 96 — HTTPS ativo, sem erros de console, APIs modernas. Infraestrutura Magento bem mantida do ponto de vista de segurança.", resolved: false },
    { type: "good", category: "performance", text: "FCP 0.5s — primeiro conteúdo aparece rápido. Servidor responde bem (TTFB 420ms) apesar do peso total da página. CDN funcionando.", resolved: false },
  ],
};

// ── Recomendações por marca ──

type MockRecommendation = Pick<
  Recommendation,
  "priority" | "category" | "text" | "timeline" | "status"
>;

export const MOCK_RECOMMENDATIONS: Record<string, MockRecommendation[]> = {
  cetaphil: [
    { priority: "critical", category: "cwv", text: "Corrigir CLS Desktop Origin: adicionar width/height explícitos em todas as imagens de produto e banners. Reservar espaço para web fonts com font-display: swap e size-adjust.", timeline: "1-2 sem", status: "pending" },
    { priority: "critical", category: "llm", text: "Desbloquear crawlers de IA no robots.txt: permitir GPTBot, ClaudeBot, PerplexityBot e Bytespider. Sem isso, a marca é invisível para 100% das buscas por IA generativa.", timeline: "1 dia", status: "pending" },
    { priority: "high", category: "aeo", text: "Implementar conteúdo answer-first nas top 20 páginas de produto. Primeira frase deve responder diretamente à pergunta mais comum sobre cada produto.", timeline: "2-4 sem", status: "pending" },
    { priority: "high", category: "seo", text: "Implementar schema markup completo: Product (com offers, reviews), FAQ, BreadcrumbList em todas as páginas de produto. Habilita rich results no Google.", timeline: "2-4 sem", status: "pending" },
    { priority: "high", category: "seo", text: "Reescrever meta descriptions únicas para cada página de produto. Incluir benefício principal + CTA. Evitar texto padrão SFCC duplicado.", timeline: "2-4 sem", status: "pending" },
    { priority: "medium", category: "aeo", text: "Marcar FAQs existentes com schema FAQPage. Google exibirá como rich result expandível e IAs citarão como fonte confiável.", timeline: "1-2 sem", status: "pending" },
    { priority: "medium", category: "cwv", text: "Investigar e reduzir TTFB: considerar CDN com edge caching no Brasil (Cloudflare/Fastly) para diminuir latência do SFCC.", timeline: "4-8 sem", status: "pending" },
    { priority: "low", category: "aeo", text: "Criar hub de conteúdo educacional: artigos sobre rotina de skincare, ingredientes, tipos de pele. Posiciona a marca para queries informacionais e aumenta citabilidade por IA.", timeline: "4-12 sem", status: "pending" },
  ],
  dermotivin: [
    { priority: "critical", category: "llm", text: "Migrar de CSR para SSR/SSG. Opções: (1) habilitar Server-Side Rendering no Drupal, (2) usar Drupal como headless CMS com Next.js no frontend, (3) implementar pre-rendering/ISR. Sem isso, a marca continua invisível para 100% dos LLMs.", timeline: "8-16 sem", status: "pending" },
    { priority: "critical", category: "seo", text: "Implementar pre-rendering como solução imediata enquanto SSR não estiver pronto. Serviços como Prerender.io ou Rendertron podem servir HTML estático para crawlers.", timeline: "1-2 sem", status: "pending" },
    { priority: "critical", category: "seo", text: "Implementar dados estruturados (JSON-LD): Organization, Product, BreadcrumbList. Atualmente zero schema markup — Google não gera nenhum rich result.", timeline: "2-4 sem", status: "pending" },
    { priority: "high", category: "seo", text: "Garantir que meta tags (title, description, canonical) sejam renderizadas no HTML inicial do servidor, não injetadas via JS. Essencial para indexação correta.", timeline: "1-2 sem", status: "pending" },
    { priority: "high", category: "aeo", text: "Criar seção de FAQ em cada categoria de produto com perguntas reais dos consumidores. Marcar com schema FAQPage para competir em Featured Snippets.", timeline: "4-8 sem", status: "pending" },
    { priority: "medium", category: "aeo", text: "Produzir conteúdo editorial: guias de cuidado com a pele, comparativos de ingredientes, rotinas recomendadas. Aumenta autoridade e citabilidade.", timeline: "4-12 sem", status: "pending" },
    { priority: "low", category: "llm", text: "Após implementar SSR, permitir crawlers de IA no robots.txt e criar content hub otimizado para citação por LLMs (answer-first, schema, E-E-A-T).", timeline: "12-16 sem", status: "pending" },
  ],
  alastin: [
    { priority: "critical", category: "performance", text: "Reduzir JavaScript: auditar e remover módulos Magento não utilizados. Code-split bundles por rota. Meta: reduzir de 1.003KB para <400KB. Impacto direto no TBT (400ms → <200ms).", timeline: "4-8 sem", status: "pending" },
    { priority: "critical", category: "performance", text: "Otimizar imagens: converter para WebP/AVIF, implementar responsive images com srcset, adicionar width/height em todas as <img>. Reduzir de 746KB para <200KB.", timeline: "1-2 sem", status: "pending" },
    { priority: "critical", category: "a11y", text: "Corrigir contraste de texto: ajustar cores de links e labels para ratio mínimo 4.5:1 (WCAG AA). 14 elementos reprovados — maioria são CTAs e preços.", timeline: "1-2 sem", status: "pending" },
    { priority: "high", category: "performance", text: "Eliminar render-blocking resources: mover CSS não-crítico para async, defer scripts no <head>. Reduzir bloqueio de 250ms para <50ms.", timeline: "1-2 sem", status: "pending" },
    { priority: "high", category: "a11y", text: "Corrigir atributos ARIA em 6 componentes: verificar roles, states e properties. Garantir que componentes interativos (dropdowns, modais, tabs) são navigáveis por teclado.", timeline: "2-4 sem", status: "pending" },
    { priority: "high", category: "a11y", text: "Corrigir hierarquia de headings: garantir progressão H1 → H2 → H3 sem pular níveis. Cada página deve ter exatamente um H1 com keyword principal.", timeline: "1-2 sem", status: "pending" },
    { priority: "high", category: "seo", text: "Substituir links genéricos ('clique aqui', 'saiba mais') por anchor text descritivo com keywords relevantes. 8 instâncias identificadas.", timeline: "1-2 sem", status: "pending" },
    { priority: "medium", category: "seo", text: "Implementar schema markup: Product (com offers), Organization, BreadcrumbList. Magento tem extensões que facilitam a implementação de JSON-LD.", timeline: "2-4 sem", status: "pending" },
    { priority: "medium", category: "aeo", text: "Criar FAQ sections com schema FAQPage em cada página de produto. Focar nas perguntas mais buscadas sobre ALASTIN e procedimentos estéticos.", timeline: "2-4 sem", status: "pending" },
    { priority: "medium", category: "cwv", text: "Aumentar tráfego para habilitar dados CrUX: mínimo ~1.000 visitas/mês. Combinar SEO técnico com estratégia de conteúdo e divulgação para atingir threshold do Chrome.", timeline: "8-16 sem", status: "pending" },
    { priority: "low", category: "llm", text: "Após otimizações de performance e conteúdo, verificar se crawlers de IA estão liberados no robots.txt. ALASTIN tem SSR ativo — potencial de citabilidade é alto se o conteúdo for otimizado.", timeline: "4-8 sem", status: "pending" },
  ],
};

// ── Helpers ──

export function getMockBrand(slug: string): BrandSummary | undefined {
  return MOCK_BRANDS.find((b) => b.slug === slug);
}

export function getMockFindings(slug: string): MockFinding[] {
  return MOCK_FINDINGS[slug] ?? [];
}

export function getMockRecommendations(slug: string): MockRecommendation[] {
  return MOCK_RECOMMENDATIONS[slug] ?? [];
}

export function getMockSnapshots(slug: string): MockSnapshot[] {
  return MOCK_SNAPSHOTS[slug] ?? [];
}

// ── Timeline data (evolução mensal — Out 2025 a Mar 2026) ──

export interface TimelinePoint {
  date: string; // "2025-10"
  label: string; // "Out/25"
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  tbt: number | null;
  si: number | null;
  tti: number | null;
  performanceScore: number | null;
  accessibilityScore: number | null;
  seoScore: number | null;
}

export const MOCK_TIMELINE: Record<string, TimelinePoint[]> = {
  cetaphil: [
    { date: "2025-10", label: "Out/25", lcp: 2800, inp: 210, cls: 0.12, ttfb: 1200, fcp: 2100, tbt: 350, si: 4200, tti: 6100, performanceScore: 58, accessibilityScore: 82, seoScore: 78 },
    { date: "2025-11", label: "Nov/25", lcp: 2500, inp: 195, cls: 0.10, ttfb: 1150, fcp: 1900, tbt: 310, si: 3900, tti: 5600, performanceScore: 64, accessibilityScore: 83, seoScore: 80 },
    { date: "2025-12", label: "Dez/25", lcp: 2300, inp: 178, cls: 0.08, ttfb: 1100, fcp: 1800, tbt: 280, si: 3600, tti: 5200, performanceScore: 70, accessibilityScore: 84, seoScore: 83 },
    { date: "2026-01", label: "Jan/26", lcp: 2100, inp: 160, cls: 0.07, ttfb: 1050, fcp: 1700, tbt: 250, si: 3400, tti: 4900, performanceScore: 74, accessibilityScore: 85, seoScore: 85 },
    { date: "2026-02", label: "Fev/26", lcp: 1900, inp: 145, cls: 0.05, ttfb: 1000, fcp: 1600, tbt: 220, si: 3200, tti: 4600, performanceScore: 78, accessibilityScore: 86, seoScore: 87 },
    { date: "2026-03", label: "Mar/26", lcp: 1900, inp: 145, cls: 0.05, ttfb: 1000, fcp: 1550, tbt: 210, si: 3100, tti: 4500, performanceScore: 80, accessibilityScore: 86, seoScore: 88 },
  ],
  dermotivin: [
    { date: "2025-10", label: "Out/25", lcp: 2200, inp: 150, cls: 0.08, ttfb: 650, fcp: 1800, tbt: 180, si: 3100, tti: 4200, performanceScore: 76, accessibilityScore: 70, seoScore: 62 },
    { date: "2025-11", label: "Nov/25", lcp: 2000, inp: 135, cls: 0.07, ttfb: 600, fcp: 1650, tbt: 160, si: 2900, tti: 3900, performanceScore: 80, accessibilityScore: 71, seoScore: 65 },
    { date: "2025-12", label: "Dez/25", lcp: 1900, inp: 125, cls: 0.06, ttfb: 560, fcp: 1550, tbt: 140, si: 2700, tti: 3600, performanceScore: 84, accessibilityScore: 72, seoScore: 68 },
    { date: "2026-01", label: "Jan/26", lcp: 1800, inp: 115, cls: 0.06, ttfb: 530, fcp: 1450, tbt: 120, si: 2500, tti: 3400, performanceScore: 87, accessibilityScore: 73, seoScore: 72 },
    { date: "2026-02", label: "Fev/26", lcp: 1700, inp: 105, cls: 0.05, ttfb: 500, fcp: 1350, tbt: 100, si: 2400, tti: 3200, performanceScore: 90, accessibilityScore: 74, seoScore: 75 },
    { date: "2026-03", label: "Mar/26", lcp: 1700, inp: 105, cls: 0.05, ttfb: 500, fcp: 1300, tbt: 95, si: 2350, tti: 3100, performanceScore: 91, accessibilityScore: 74, seoScore: 77 },
  ],
  alastin: [
    { date: "2025-10", label: "Out/25", lcp: 3200, inp: null, cls: 0.15, ttfb: 550, fcp: 700, tbt: 520, si: 4500, tti: 7200, performanceScore: 45, accessibilityScore: 65, seoScore: 84 },
    { date: "2025-11", label: "Nov/25", lcp: 3000, inp: null, cls: 0.14, ttfb: 530, fcp: 650, tbt: 500, si: 4200, tti: 6800, performanceScore: 49, accessibilityScore: 68, seoScore: 86 },
    { date: "2025-12", label: "Dez/25", lcp: 2700, inp: null, cls: 0.12, ttfb: 500, fcp: 600, tbt: 470, si: 3900, tti: 6400, performanceScore: 54, accessibilityScore: 70, seoScore: 88 },
    { date: "2026-01", label: "Jan/26", lcp: 2400, inp: null, cls: 0.11, ttfb: 470, fcp: 560, tbt: 440, si: 3700, tti: 6000, performanceScore: 58, accessibilityScore: 73, seoScore: 90 },
    { date: "2026-02", label: "Fev/26", lcp: 2200, inp: null, cls: 0.10, ttfb: 440, fcp: 520, tbt: 420, si: 3500, tti: 5700, performanceScore: 61, accessibilityScore: 75, seoScore: 91 },
    { date: "2026-03", label: "Mar/26", lcp: 2000, inp: null, cls: 0.096, ttfb: 420, fcp: 500, tbt: 400, si: 3400, tti: 5400, performanceScore: 63, accessibilityScore: 77, seoScore: 92 },
  ],
};

export function getMockTimeline(slug: string): TimelinePoint[] {
  return MOCK_TIMELINE[slug] ?? [];
}
