// ============================================================================
// MESSS × Galderma Digital Audit Dashboard
// Drizzle ORM Schema — PostgreSQL (Supabase)
// ============================================================================
// Decisões arquiteturais:
// - Supabase Auth gerencia users → auth.users (não criamos tabela de users)
// - profiles sincroniza com auth.users via trigger no Supabase
// - Scores normalizados em colunas tipadas (queryable, indexável)
// - cuid2 para IDs de aplicação
// - Timestamps com timezone
// ============================================================================

import { relations } from "drizzle-orm";
import {
  pgTable,
  pgSchema,
  text,
  boolean,
  integer,
  real,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─────────────────────────────────────────────
// Referência ao schema auth do Supabase
// (não criamos essa tabela, só referenciamos)
// ─────────────────────────────────────────────
const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// ═══════════════════════════════════════════════
// MULTI-TENANT
// ═══════════════════════════════════════════════

export const organizations = pgTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(), // "MESSS"
  slug: text("slug").notNull().unique(), // "messs"
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(), // "Galderma Brasil"
  slug: text("slug").notNull().unique(), // "galderma-br"
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const brands = pgTable(
  "brands",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(), // "Cetaphil"
    domain: text("domain").notNull(), // "cetaphil.com.br"
    slug: text("slug").notNull(), // "cetaphil"
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    platform: text("platform"), // "Salesforce Commerce Cloud"
    color: text("color"), // "#8021de"
    gradient: text("gradient"), // "linear-gradient(...)"
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("brand_client_slug_idx").on(table.clientId, table.slug)]
);

// ═══════════════════════════════════════════════
// USER PROFILES (sincronizado com Supabase Auth)
// ═══════════════════════════════════════════════
// Um trigger no Supabase cria o profile automaticamente
// quando um user se registra via auth.users
//
// CREATE OR REPLACE FUNCTION public.handle_new_user()
// RETURNS trigger AS $$
// BEGIN
//   INSERT INTO public.profiles (id, email, role)
//   VALUES (new.id, new.email, 'client');
//   RETURN new;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
//
// CREATE TRIGGER on_auth_user_created
//   AFTER INSERT ON auth.users
//   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("client"), // "admin" | "analyst" | "client"
  organizationId: text("organization_id").references(() => organizations.id),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relação many-to-many: quais clientes um user pode ver
export const profileClients = pgTable(
  "profile_clients",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.clientId] })]
);

// ═══════════════════════════════════════════════
// DADOS DE AUDITORIA
// ═══════════════════════════════════════════════

export const audits = pgTable(
  "audits",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    type: text("type").notNull(), // "full" | "monthly" | "snapshot"

    // ── Scores normalizados (letra) ──
    cwvScore: text("cwv_score"), // "B", "A-", "D+"
    seoScore: text("seo_score"),
    aeoScore: text("aeo_score"),
    llmScore: text("llm_score"),

    // ── Scores numéricos (para rings e queries) ──
    cwvNumeric: integer("cwv_numeric"), // 83
    seoNumeric: integer("seo_numeric"), // 87
    aeoNumeric: integer("aeo_numeric"), // 63
    llmNumeric: integer("llm_numeric"), // 67

    notes: text("notes"),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_brand_date_idx").on(table.brandId, table.date),
  ]
);

export const snapshots = pgTable(
  "snapshots",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    source: text("source").notNull(), // "pagespeed" | "crux" | "manual" | "lighthouse"
    strategy: text("strategy").notNull(), // "mobile" | "desktop"
    url: text("url").notNull(), // URL analisada
    isOrigin: boolean("is_origin").notNull().default(false),

    // ── Lighthouse Scores (0-100) ──
    performanceScore: real("performance_score"),
    accessibilityScore: real("accessibility_score"),
    bestPracticesScore: real("best_practices_score"),
    seoScore: real("seo_score"),

    // ── Core Web Vitals (Field Data - CrUX) ──
    lcpValue: real("lcp_value"), // ms
    lcpRating: text("lcp_rating"), // "good" | "needs-improvement" | "poor"
    inpValue: real("inp_value"),
    inpRating: text("inp_rating"),
    clsValue: real("cls_value"),
    clsRating: text("cls_rating"),
    ttfbValue: real("ttfb_value"),
    ttfbRating: text("ttfb_rating"),
    fcpValue: real("fcp_value"),
    fcpRating: text("fcp_rating"),

    // ── Lab Metrics (Lighthouse) ──
    tbtValue: real("tbt_value"), // Total Blocking Time (ms)
    speedIndex: real("speed_index"), // Speed Index (ms)
    ttiValue: real("tti_value"), // Time to Interactive (ms)
    maxFidValue: real("max_fid_value"), // Max Potential FID (ms)

    // ── Payload ──
    totalByteWeight: real("total_byte_weight"), // bytes
    unusedJsBytes: real("unused_js_bytes"),
    unusedCssBytes: real("unused_css_bytes"),

    // ── Raw JSON (resposta completa da API) ──
    rawData: jsonb("raw_data"),
  },
  (table) => [
    index("snapshot_brand_date_idx").on(table.brandId, table.date),
    index("snapshot_brand_source_idx").on(
      table.brandId,
      table.source,
      table.strategy
    ),
  ]
);

export const findings = pgTable(
  "findings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    auditId: text("audit_id").references(() => audits.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull(), // "critical" | "warning" | "good"
    category: text("category").notNull(), // "cwv" | "seo" | "aeo" | "llm" | "a11y" | "performance"
    text: text("text").notNull(),
    resolved: boolean("resolved").notNull().default(false),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("finding_brand_idx").on(table.brandId),
    index("finding_type_idx").on(table.type),
  ]
);

export const recommendations = pgTable(
  "recommendations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    auditId: text("audit_id").references(() => audits.id, {
      onDelete: "set null",
    }),
    priority: text("priority").notNull(), // "critical" | "high" | "medium" | "low"
    text: text("text").notNull(),
    timeline: text("timeline"), // "1-2 sem", "4-12 sem"
    category: text("category").notNull(), // "cwv" | "seo" | "aeo" | "llm" | "performance" | "a11y"
    status: text("status").notNull().default("pending"), // "pending" | "in_progress" | "done" | "wont_fix"
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("rec_brand_idx").on(table.brandId),
    index("rec_priority_idx").on(table.priority),
    index("rec_status_idx").on(table.status),
  ]
);

// ═══════════════════════════════════════════════
// RELATIONS (Drizzle query builder)
// ═══════════════════════════════════════════════

export const organizationsRelations = relations(organizations, ({ many }) => ({
  clients: many(clients),
  profiles: many(profiles),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  brands: many(brands),
  profileClients: many(profileClients),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  client: one(clients, {
    fields: [brands.clientId],
    references: [clients.id],
  }),
  audits: many(audits),
  snapshots: many(snapshots),
  findings: many(findings),
  recommendations: many(recommendations),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [profiles.organizationId],
    references: [organizations.id],
  }),
  profileClients: many(profileClients),
}));

export const profileClientsRelations = relations(
  profileClients,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [profileClients.profileId],
      references: [profiles.id],
    }),
    client: one(clients, {
      fields: [profileClients.clientId],
      references: [clients.id],
    }),
  })
);

export const auditsRelations = relations(audits, ({ one, many }) => ({
  brand: one(brands, {
    fields: [audits.brandId],
    references: [brands.id],
  }),
  createdByProfile: one(profiles, {
    fields: [audits.createdBy],
    references: [profiles.id],
  }),
  findings: many(findings),
  recommendations: many(recommendations),
}));

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  brand: one(brands, {
    fields: [snapshots.brandId],
    references: [brands.id],
  }),
}));

export const findingsRelations = relations(findings, ({ one }) => ({
  brand: one(brands, {
    fields: [findings.brandId],
    references: [brands.id],
  }),
  audit: one(audits, {
    fields: [findings.auditId],
    references: [audits.id],
  }),
}));

export const recommendationsRelations = relations(
  recommendations,
  ({ one }) => ({
    brand: one(brands, {
      fields: [recommendations.brandId],
      references: [brands.id],
    }),
    audit: one(audits, {
      fields: [recommendations.auditId],
      references: [audits.id],
    }),
  })
);

// ═══════════════════════════════════════════════
// TIPOS INFERIDOS (para usar no app)
// ═══════════════════════════════════════════════

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Audit = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;

export type Snapshot = typeof snapshots.$inferSelect;
export type NewSnapshot = typeof snapshots.$inferInsert;

export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;

export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;

// ═══════════════════════════════════════════════
// ENUMS (type-safe no app, não no banco)
// ═══════════════════════════════════════════════
// Optamos por text + Zod validation em vez de pgEnum
// porque é mais flexível para adicionar valores sem migration

export const ROLES = ["admin", "analyst", "client"] as const;
export type Role = (typeof ROLES)[number];

export const AUDIT_TYPES = ["full", "monthly", "snapshot"] as const;
export type AuditType = (typeof AUDIT_TYPES)[number];

export const FINDING_TYPES = ["critical", "warning", "good"] as const;
export type FindingType = (typeof FINDING_TYPES)[number];

export const CATEGORIES = [
  "cwv",
  "seo",
  "aeo",
  "llm",
  "a11y",
  "performance",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const REC_STATUSES = [
  "pending",
  "in_progress",
  "done",
  "wont_fix",
] as const;
export type RecStatus = (typeof REC_STATUSES)[number];

export const SNAPSHOT_SOURCES = [
  "pagespeed",
  "crux",
  "manual",
  "lighthouse",
] as const;
export type SnapshotSource = (typeof SNAPSHOT_SOURCES)[number];

export const STRATEGIES = ["mobile", "desktop"] as const;
export type Strategy = (typeof STRATEGIES)[number];

export const RATINGS = ["good", "needs-improvement", "poor"] as const;
export type Rating = (typeof RATINGS)[number];

// ═══════════════════════════════════════════════
// SCORE MAP (letter ↔ numeric)
// ═══════════════════════════════════════════════

export const LETTER_TO_NUMERIC: Record<string, number> = {
  "A+": 97, A: 93, "A-": 90,
  "B+": 87, B: 83, "B-": 80,
  "C+": 77, C: 73, "C-": 70,
  "D+": 67, D: 63, "D-": 60,
  F: 40,
};

export const NUMERIC_TO_LETTER = Object.fromEntries(
  Object.entries(LETTER_TO_NUMERIC).map(([k, v]) => [v, k])
);
