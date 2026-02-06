-- Migration script to extract company names from internships and create company records
-- This script:
-- 1. Creates companies from unique company_name values in internships
-- 2. Links internships to companies via company_id
-- 3. Makes company_id NOT NULL after migration

-- Step 1: Create companies from unique company names
INSERT INTO "companies" ("name", "created_at", "updated_at")
SELECT DISTINCT 
    "company_name" as "name",
    MIN("created_at") as "created_at",
    MAX("updated_at") as "updated_at"
FROM "internships"
WHERE "company_name" IS NOT NULL AND "company_name" != ''
GROUP BY "company_name"
ON CONFLICT DO NOTHING;

-- Step 2: Link internships to companies
UPDATE "internships" i
SET "company_id" = c."id"
FROM "companies" c
WHERE i."company_name" = c."name"
AND i."company_id" IS NULL;

-- Step 3: Make company_id NOT NULL (after verifying all internships are linked)
-- Note: This will fail if there are any NULL company_id values
-- Run this only after verifying the migration was successful
-- ALTER TABLE "internships" ALTER COLUMN "company_id" SET NOT NULL;

