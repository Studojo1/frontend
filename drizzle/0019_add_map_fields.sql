-- Add geo + meta fields to companies for the internship map feature
ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "city" text,
  ADD COLUMN IF NOT EXISTS "country" text,
  ADD COLUMN IF NOT EXISTS "market" text,
  ADD COLUMN IF NOT EXISTS "lat" double precision,
  ADD COLUMN IF NOT EXISTS "lng" double precision,
  ADD COLUMN IF NOT EXISTS "logo_url" text,
  ADD COLUMN IF NOT EXISTS "sector" text,
  ADD COLUMN IF NOT EXISTS "stage" text,
  ADD COLUMN IF NOT EXISTS "niche_score" integer DEFAULT 3;

-- Add work mode + niche score to internships
ALTER TABLE "internships"
  ADD COLUMN IF NOT EXISTS "work_mode" text DEFAULT 'onsite',
  ADD COLUMN IF NOT EXISTS "niche_score" integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "source_platform" text;

-- Index for map queries
CREATE INDEX IF NOT EXISTS "companies_market_idx" ON "companies" USING btree ("market");
CREATE INDEX IF NOT EXISTS "companies_lat_lng_idx" ON "companies" USING btree ("lat", "lng");
CREATE INDEX IF NOT EXISTS "internships_work_mode_idx" ON "internships" USING btree ("work_mode");
