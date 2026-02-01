CREATE TABLE "career_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"city" text NOT NULL,
	"institution_name" text NOT NULL,
	"current_year" text NOT NULL,
	"course" text NOT NULL,
	"areas_of_interest" jsonb NOT NULL,
	"form_data" jsonb,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"internship_id" uuid NOT NULL,
	"application_ids" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"expires_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "dissertation_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"dissertation_title" text NOT NULL,
	"data_type" text NOT NULL,
	"current_stage" text NOT NULL,
	"additional_notes" text,
	"form_data" jsonb,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internship_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internship_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"resume_id" uuid NOT NULL,
	"resume_snapshot" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"company_token" text,
	"forwarded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internship_applications_internship_id_user_id_unique" UNIQUE("internship_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"company_name" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"location" text NOT NULL,
	"duration" text NOT NULL,
	"stipend" text NOT NULL,
	"application_deadline" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"slug" text NOT NULL,
	"created_by" text NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"application_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internships_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "company_tokens" ADD CONSTRAINT "company_tokens_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_tokens" ADD CONSTRAINT "company_tokens_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "career_applications_email_idx" ON "career_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "career_applications_phone_idx" ON "career_applications" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "career_applications_created_idx" ON "career_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "career_applications_payment_status_idx" ON "career_applications" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "company_tokens_token_idx" ON "company_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "dissertation_submissions_email_idx" ON "dissertation_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "dissertation_submissions_phone_idx" ON "dissertation_submissions" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "dissertation_submissions_created_idx" ON "dissertation_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dissertation_submissions_payment_status_idx" ON "dissertation_submissions" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "internship_applications_internship_status_idx" ON "internship_applications" USING btree ("internship_id","status");--> statement-breakpoint
CREATE INDEX "internship_applications_user_idx" ON "internship_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "internships_slug_idx" ON "internships" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "internships_status_created_idx" ON "internships" USING btree ("status","created_at");