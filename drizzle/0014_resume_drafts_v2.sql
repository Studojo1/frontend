--> statement-breakpoint
-- Resume Drafts v2: Section-based resume storage
-- Separate from legacy resumes table for clean migration
CREATE TABLE "resume_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"template_id" text DEFAULT 'modern' NOT NULL,
	"sections" jsonb NOT NULL, -- Section-based structure
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_drafts" ADD CONSTRAINT "resume_drafts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resume_drafts_user_id_idx" ON "resume_drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resume_drafts_updated_at_idx" ON "resume_drafts" USING btree ("updated_at" DESC);--> statement-breakpoint
CREATE INDEX "resume_drafts_is_archived_idx" ON "resume_drafts" USING btree ("is_archived");

