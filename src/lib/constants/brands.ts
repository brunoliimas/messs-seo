// ============================================================================
// Dados estáticos das marcas Galderma
// Usado no seed e como fallback visual
// ============================================================================

export interface BrandConfig {
  name: string;
  slug: string;
  domain: string;
  platform: string;
  color: string;
  gradient: string;
}

export const GALDERMA_BRANDS: BrandConfig[] = [
  {
    name: "Cetaphil",
    slug: "cetaphil",
    domain: "cetaphil.com.br",
    platform: "Salesforce Commerce Cloud (Demandware)",
    color: "#8021de",
    gradient: "linear-gradient(135deg, #681bb5, #8021de)",
  },
  {
    name: "Dermotivin",
    slug: "dermotivin",
    domain: "dermotivin.com.br",
    platform: "Drupal CMS",
    color: "#be12b3",
    gradient: "linear-gradient(135deg, #a6109c, #be12b3)",
  },
  {
    name: "ALASTIN Skincare",
    slug: "alastin",
    domain: "alastin.com.br",
    platform: "Magento / Adobe Commerce",
    color: "#4124b2",
    gradient: "linear-gradient(135deg, #411c87, #4124b2)",
  },
];
