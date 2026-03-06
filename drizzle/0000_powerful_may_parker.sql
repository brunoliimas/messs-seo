CREATE TABLE "audits" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"cwv_score" text,
	"seo_score" text,
	"aeo_score" text,
	"llm_score" text,
	"cwv_numeric" integer,
	"seo_numeric" integer,
	"aeo_numeric" integer,
	"llm_numeric" integer,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"slug" text NOT NULL,
	"client_id" text NOT NULL,
	"platform" text,
	"color" text,
	"gradient" text,
	"logo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "findings" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"audit_id" text,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"text" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profile_clients" (
	"profile_id" uuid NOT NULL,
	"client_id" text NOT NULL,
	CONSTRAINT "profile_clients_profile_id_client_id_pk" PRIMARY KEY("profile_id","client_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'client' NOT NULL,
	"organization_id" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"audit_id" text,
	"priority" text NOT NULL,
	"text" text NOT NULL,
	"timeline" text,
	"category" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text NOT NULL,
	"strategy" text NOT NULL,
	"url" text NOT NULL,
	"is_origin" boolean DEFAULT false NOT NULL,
	"performance_score" real,
	"accessibility_score" real,
	"best_practices_score" real,
	"seo_score" real,
	"lcp_value" real,
	"lcp_rating" text,
	"inp_value" real,
	"inp_rating" text,
	"cls_value" real,
	"cls_rating" text,
	"ttfb_value" real,
	"ttfb_rating" text,
	"fcp_value" real,
	"fcp_rating" text,
	"tbt_value" real,
	"speed_index" real,
	"tti_value" real,
	"max_fid_value" real,
	"total_byte_weight" real,
	"unused_js_bytes" real,
	"unused_css_bytes" real,
	"raw_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_clients" ADD CONSTRAINT "profile_clients_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_clients" ADD CONSTRAINT "profile_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_brand_date_idx" ON "audits" USING btree ("brand_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_client_slug_idx" ON "brands" USING btree ("client_id","slug");--> statement-breakpoint
CREATE INDEX "finding_brand_idx" ON "findings" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "finding_type_idx" ON "findings" USING btree ("type");--> statement-breakpoint
CREATE INDEX "rec_brand_idx" ON "recommendations" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "rec_priority_idx" ON "recommendations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "rec_status_idx" ON "recommendations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "snapshot_brand_date_idx" ON "snapshots" USING btree ("brand_id","date");--> statement-breakpoint
CREATE INDEX "snapshot_brand_source_idx" ON "snapshots" USING btree ("brand_id","source","strategy");