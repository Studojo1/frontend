-- Clean migration: Delete all companies and recreate from internships
-- This ensures a single canonical company per name, properly linked to internships
-- This migration is idempotent - it checks if it has already run

DO $$
DECLARE
    company_count INTEGER;
BEGIN
    -- Check if migration has already run (if we have exactly one company per unique name from internships)
    SELECT COUNT(*) INTO company_count
    FROM (
        SELECT DISTINCT company_name
        FROM internships
        WHERE company_name IS NOT NULL 
          AND company_name != ''
          AND company_name != 'null'
    ) unique_names;
    
    SELECT COUNT(*) INTO company_count
    FROM companies
    WHERE is_deleted = false;
    
    -- Only run if we have duplicates or mismatches
    IF company_count > (
        SELECT COUNT(DISTINCT company_name)
        FROM internships
        WHERE company_name IS NOT NULL 
          AND company_name != ''
          AND company_name != 'null'
    ) OR EXISTS (
        SELECT 1 FROM internships i
        WHERE i.company_id IS NULL
          AND i.company_name IS NOT NULL
          AND i.company_name != ''
          AND i.company_name != 'null'
    ) THEN
        -- Step 1: Unlink all internships (set company_id to NULL) to avoid foreign key constraint violations
        UPDATE internships SET company_id = NULL;

        -- Step 2: Delete all existing companies (cascade will handle company_users)
        DELETE FROM companies;

        -- Step 3: Create companies from unique company names in internships
        -- Use a simple GROUP BY to ensure only one company per name
        INSERT INTO companies (id, name, created_at, updated_at, is_deleted)
        SELECT 
            gen_random_uuid() as id,
            company_name as name,
            MIN(created_at) as created_at,
            MAX(updated_at) as updated_at,
            false as is_deleted
        FROM internships
        WHERE company_name IS NOT NULL 
          AND company_name != ''
          AND company_name != 'null'
        GROUP BY company_name
        ORDER BY MIN(created_at);

        -- Step 4: Link all internships to their corresponding companies
        UPDATE internships i
        SET company_id = c.id
        FROM companies c
        WHERE i.company_name = c.name
          AND i.company_id IS NULL;
    END IF;
END $$;

