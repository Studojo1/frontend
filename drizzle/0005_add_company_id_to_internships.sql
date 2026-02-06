ALTER TABLE "internships" ADD COLUMN "company_id" uuid;
--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "internships_company_id_idx" ON "internships" USING btree ("company_id");
--> statement-breakpoint
ALTER TABLE "company_tokens" ADD COLUMN "partner_user_id" uuid;
--> statement-breakpoint
ALTER TABLE "company_tokens" ADD CONSTRAINT "company_tokens_partner_user_id_company_users_id_fk" FOREIGN KEY ("partner_user_id") REFERENCES "public"."company_users"("id") ON DELETE set null ON UPDATE no action;

