-- Link existing internships to companies based on company_name
-- This ensures all internships have a valid company_id pointing to the companies table

-- Update internships that have a company_name but no company_id or invalid company_id
UPDATE internships i
SET company_id = (
  SELECT DISTINCT ON (c.name) c.id
  FROM companies c
  WHERE c.name = i.company_name
    AND c.is_deleted = false
  ORDER BY c.name, c.created_at DESC
  LIMIT 1
)
WHERE i.company_id IS NULL
  AND i.company_name IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM companies c
    WHERE c.name = i.company_name
      AND c.is_deleted = false
  );

-- For internships with company_id that points to deleted companies, try to find a replacement
UPDATE internships i
SET company_id = (
  SELECT DISTINCT ON (c.name) c.id
  FROM companies c
  WHERE c.name = i.company_name
    AND c.is_deleted = false
  ORDER BY c.name, c.created_at DESC
  LIMIT 1
)
WHERE i.company_id IS NOT NULL
  AND i.company_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM companies c
    WHERE c.id = i.company_id
      AND c.is_deleted = false
  )
  AND EXISTS (
    SELECT 1
    FROM companies c
    WHERE c.name = i.company_name
      AND c.is_deleted = false
  );

