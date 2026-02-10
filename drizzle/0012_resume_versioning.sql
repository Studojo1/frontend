--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "template_id" text DEFAULT 'modern' NOT NULL;--> statement-breakpoint
CREATE TABLE "resume_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"resume_data" jsonb NOT NULL,
	"template_id" text,
	"change_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "resume_versions_resume_id_version_unique" UNIQUE("resume_id","version")
);
--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resume_versions_resume_id_idx" ON "resume_versions" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_versions_version_idx" ON "resume_versions" USING btree ("resume_id","version" DESC);--> statement-breakpoint
CREATE INDEX "resume_versions_created_at_idx" ON "resume_versions" USING btree ("created_at" DESC);

