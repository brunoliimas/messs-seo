CREATE TABLE "aeo_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"question" text NOT NULL,
	"link" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"answer_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_entities" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"extract" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword_suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"keyword" text NOT NULL,
	"suggestion" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reddit_mentions" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"title" text NOT NULL,
	"subreddit" text NOT NULL,
	"url" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"num_comments" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_console_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"query" text DEFAULT '' NOT NULL,
	"page" text DEFAULT '' NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"ctr" real DEFAULT 0 NOT NULL,
	"position" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aeo_questions" ADD CONSTRAINT "aeo_questions_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_entities" ADD CONSTRAINT "brand_entities_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_suggestions" ADD CONSTRAINT "keyword_suggestions_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reddit_mentions" ADD CONSTRAINT "reddit_mentions_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_console_snapshots" ADD CONSTRAINT "search_console_snapshots_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aeo_brand_created_idx" ON "aeo_questions" USING btree ("brand_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "aeo_brand_link_uq" ON "aeo_questions" USING btree ("brand_id","link");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_brand_uq" ON "brand_entities" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "kw_brand_keyword_idx" ON "keyword_suggestions" USING btree ("brand_id","keyword");--> statement-breakpoint
CREATE UNIQUE INDEX "kw_brand_keyword_suggestion_uq" ON "keyword_suggestions" USING btree ("brand_id","keyword","suggestion");--> statement-breakpoint
CREATE INDEX "reddit_brand_created_idx" ON "reddit_mentions" USING btree ("brand_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reddit_brand_url_uq" ON "reddit_mentions" USING btree ("brand_id","url");--> statement-breakpoint
CREATE INDEX "sc_brand_date_idx" ON "search_console_snapshots" USING btree ("brand_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "sc_brand_date_query_page_uq" ON "search_console_snapshots" USING btree ("brand_id","date","query","page");