-- Optional columns for scraper tracking.
-- The scraper works without these (it omits them from INSERT).
-- Apply when convenient to enable source tracking and filtering.
ALTER TABLE "internships" ADD COLUMN IF NOT EXISTS "source_url" text;
ALTER TABLE "internships" ADD COLUMN IF NOT EXISTS "is_scraped" boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS "internships_is_scraped_idx" ON "internships" USING btree ("is_scraped");
