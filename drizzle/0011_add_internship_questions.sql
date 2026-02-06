--> statement-breakpoint
CREATE TABLE "question_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_tags_tag_name_unique" UNIQUE("tag_name")
);
--> statement-breakpoint
CREATE TABLE "internship_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internship_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" text NOT NULL,
	"options" jsonb,
	"required" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"tag_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_question_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"response" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_question_responses_user_id_question_id_unique" UNIQUE("user_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "question_tag_mappings" (
	"question_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "question_tag_mappings_question_id_tag_id_unique" UNIQUE("question_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "internship_questions" ADD CONSTRAINT "internship_questions_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_questions" ADD CONSTRAINT "internship_questions_tag_id_question_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."question_tags"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_responses" ADD CONSTRAINT "user_question_responses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_responses" ADD CONSTRAINT "user_question_responses_question_id_internship_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."internship_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_tag_mappings" ADD CONSTRAINT "question_tag_mappings_question_id_internship_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."internship_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_tag_mappings" ADD CONSTRAINT "question_tag_mappings_tag_id_question_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."question_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "question_tags_tag_name_idx" ON "question_tags" USING btree ("tag_name");--> statement-breakpoint
CREATE INDEX "internship_questions_internship_id_idx" ON "internship_questions" USING btree ("internship_id");--> statement-breakpoint
CREATE INDEX "internship_questions_tag_id_idx" ON "internship_questions" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "internship_questions_order_idx" ON "internship_questions" USING btree ("internship_id","order");--> statement-breakpoint
CREATE INDEX "user_question_responses_user_id_idx" ON "user_question_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_question_responses_question_id_idx" ON "user_question_responses" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "question_tag_mappings_question_id_idx" ON "question_tag_mappings" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "question_tag_mappings_tag_id_idx" ON "question_tag_mappings" USING btree ("tag_id");

