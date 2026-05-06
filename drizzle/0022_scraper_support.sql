-- Allow scraped internships to have no created_by (system-inserted rows)
ALTER TABLE "internships" ALTER COLUMN "created_by" DROP NOT NULL;

-- Track the original listing URL so we can deduplicate and link back
ALTER TABLE "internships" ADD COLUMN IF NOT EXISTS "source_url" text;

-- Flag rows inserted by the scraper for easy filtering / auditing
ALTER TABLE "internships" ADD COLUMN IF NOT EXISTS "is_scraped" boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS "internships_is_scraped_idx" ON "internships" USING btree ("is_scraped");
