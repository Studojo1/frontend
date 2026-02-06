-- Soft delete and branding fields for companies
-- Adds:
--  - is_deleted / deleted_at for archival
--  - logo_url / brand_color / support_email / portal_title for branding
--  - primary_user_id linking to company_users.id for primary login

ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "is_deleted" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamp,
  ADD COLUMN IF NOT EXISTS "logo_url" text,
  ADD COLUMN IF NOT EXISTS "brand_color" text,
  ADD COLUMN IF NOT EXISTS "support_email" text,
  ADD COLUMN IF NOT EXISTS "portal_title" text,
  ADD COLUMN IF NOT EXISTS "primary_user_id" uuid;

ALTER TABLE "companies"
  ADD CONSTRAINT IF NOT EXISTS "companies_primary_user_id_company_users_id_fk"
    FOREIGN KEY ("primary_user_id")
    REFERENCES "public"."company_users"("id")
    ON DELETE SET NULL
    ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS "companies_is_deleted_name_idx"
  ON "companies" USING btree ("is_deleted", "name");


