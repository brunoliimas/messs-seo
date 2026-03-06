// ============================================================================
// Glossário completo — 22 termos técnicos
// Descrições em português acessíveis para stakeholders de marketing
// ============================================================================

export interface GlossaryTerm {
  term: string;
  full: string;
  desc: string;
  category: "performance" | "seo" | "aeo" | "llm" | "general";
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "SEO",
    full: "Search Engine Optimization",
    desc: "Conjunto de técnicas para melhorar o posicionamento de um site nos resultados orgânicos de buscadores como Google.",
    category: "seo",
  },
  {
    term: "AEO",
    full: "Answer Engine Optimization",
    desc: "Otimização para mecanismos de resposta — como Google Featured Snippets, assistentes de voz e IAs generativas que respondem diretamente ao usuário.",
    category: "aeo",
  },
  {
    term: "LLM",
    full: "Large Language Model",
    desc: "Modelos de linguagem como ChatGPT, Claude, Gemini e Perplexity que buscam e citam fontes da web ao gerar respostas.",
    category: "llm",
  },
  {
    term: "CWV",
    full: "Core Web Vitals",
    desc: "Três métricas do Google que medem a experiência do usuário: velocidade de carregamento (LCP), interatividade (INP) e estabilidade visual (CLS).",
    category: "performance",
  },
  {
    term: "LCP",
    full: "Largest Contentful Paint",
    desc: "Tempo para o maior elemento visível (imagem ou texto) aparecer na tela. Bom: ≤2.5s. Impacta diretamente o ranking.",
    category: "performance",
  },
  {
    term: "INP",
    full: "Interaction to Next Paint",
    desc: "Tempo de resposta do site a interações do usuário (cliques, toques). Bom: ≤200ms. Substituiu o FID em março de 2024.",
    category: "performance",
  },
  {
    term: "CLS",
    full: "Cumulative Layout Shift",
    desc: "Mede quanto os elementos se movem inesperadamente na tela durante o carregamento. Bom: ≤0.1. Causado por imagens sem dimensões ou web fonts.",
    category: "performance",
  },
  {
    term: "FCP",
    full: "First Contentful Paint",
    desc: "Tempo até o primeiro conteúdo (texto ou imagem) aparecer. Indica quando o usuário começa a ver algo na tela.",
    category: "performance",
  },
  {
    term: "TBT",
    full: "Total Blocking Time",
    desc: "Tempo total em que a thread principal fica bloqueada por JavaScript entre FCP e TTI. Alto TBT = página travada, botões não respondem.",
    category: "performance",
  },
  {
    term: "TTI",
    full: "Time to Interactive",
    desc: "Momento em que a página se torna completamente interativa — botões respondem, formulários funcionam, scroll é suave.",
    category: "performance",
  },
  {
    term: "SI",
    full: "Speed Index",
    desc: "Velocidade com que o conteúdo visual é renderizado progressivamente. Quanto menor, melhor a percepção de velocidade pelo usuário.",
    category: "performance",
  },
  {
    term: "TTFB",
    full: "Time to First Byte",
    desc: "Tempo entre a requisição do navegador e o primeiro byte da resposta do servidor. Indica performance do servidor, CDN e backend.",
    category: "performance",
  },
  {
    term: "FID",
    full: "First Input Delay (Depreciado)",
    desc: "Tempo entre a primeira interação e a resposta do navegador. Substituído pelo INP em março de 2024 como métrica oficial do CWV.",
    category: "performance",
  },
  {
    term: "CrUX",
    full: "Chrome User Experience Report",
    desc: "Dados REAIS de performance coletados de usuários do Chrome nos últimos 28 dias. O Google usa esses dados para ranqueamento. Requer ~1.000+ visitas/mês para ter dados.",
    category: "performance",
  },
  {
    term: "JSON-LD",
    full: "JavaScript Object Notation for Linked Data",
    desc: "Formato recomendado pelo Google para adicionar dados estruturados ao HTML. Inserido como tag <script>, invisível ao usuário, legível por máquinas.",
    category: "seo",
  },
  {
    term: "Schema Markup",
    full: "Marcação de Dados Estruturados",
    desc: "Vocabulário padronizado (schema.org) que ajuda buscadores e IAs a entender o conteúdo: se é um produto, FAQ, organização, artigo, etc.",
    category: "seo",
  },
  {
    term: "SSR",
    full: "Server-Side Rendering",
    desc: "Técnica onde o HTML é gerado no servidor antes de chegar ao navegador. Essencial para que crawlers de IA (que não executam JavaScript) leiam o conteúdo.",
    category: "general",
  },
  {
    term: "CSR",
    full: "Client-Side Rendering",
    desc: "HTML é gerado no navegador via JavaScript. Crawlers de IA NÃO conseguem ler esse conteúdo. É o problema fatal da Dermotivin.",
    category: "general",
  },
  {
    term: "E-E-A-T",
    full: "Experience, Expertise, Authoritativeness, Trustworthiness",
    desc: "Critérios do Google para qualidade: experiência prática, expertise técnica, autoridade reconhecida no assunto e confiabilidade geral.",
    category: "seo",
  },
  {
    term: "Featured Snippet",
    full: "Trecho em Destaque",
    desc: "Caixa de resposta que aparece ACIMA do resultado #1 no Google. Responde diretamente à pergunta do usuário, extraindo conteúdo de um site.",
    category: "aeo",
  },
  {
    term: "Answer-First",
    full: "Resposta Primeiro",
    desc: "Formato de conteúdo onde a resposta aparece na primeira frase/parágrafo, antes de contextualização e detalhes — otimizado para IAs e snippets.",
    category: "aeo",
  },
  {
    term: "Crawlabilidade",
    full: "Capacidade de Rastreamento",
    desc: "Se os robôs de busca (Googlebot, GPTBot, ClaudeBot, PerplexityBot) conseguem acessar, ler e indexar o conteúdo do site.",
    category: "llm",
  },
  {
    term: "Citabilidade",
    full: "Capacidade de Citação por IA",
    desc: "Probabilidade de uma IA generativa citar o site como fonte ao responder uma pergunta. Depende de SSR, schema, conteúdo estruturado e autoridade.",
    category: "llm",
  },
  {
    term: "Zero-Click",
    full: "Busca Sem Clique",
    desc: "Quando o usuário obtém a resposta diretamente na página do Google (snippet, IA Overview) sem clicar em nenhum resultado. Em 2025, 69% das buscas são zero-click.",
    category: "aeo",
  },
  {
    term: "Knowledge Panel",
    full: "Painel de Conhecimento",
    desc: "Caixa informativa à direita dos resultados do Google com dados da entidade (empresa, pessoa, marca). Alimentado por schema Organization e fontes confiáveis.",
    category: "seo",
  },
  {
    term: "Rich Results",
    full: "Resultados Enriquecidos",
    desc: "Resultados de busca com elementos visuais extras (estrelas, preço, FAQ, receitas) gerados a partir de schema markup válido no site.",
    category: "seo",
  },
];
