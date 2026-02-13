--> statement-breakpoint
-- Migration: Convert legacy resumes to resume_drafts v2 format
-- This script migrates existing resumes to the new section-based draft format

-- Migrate resumes to resume_drafts
INSERT INTO "resume_drafts" (
    "id",
    "user_id",
    "name",
    "template_id",
    "sections",
    "version",
    "created_at",
    "updated_at",
    "is_archived"
)
SELECT
    r.id,
    r.user_id,
    r.name,
    COALESCE(r.template_id, 'modern') as template_id,
    -- Convert legacy resume_data JSON to sections format
    -- This is a simplified conversion - full conversion handled in application code
    (
        SELECT jsonb_agg(section)
        FROM (
            SELECT jsonb_build_object(
            'id', 'contact-' || r.id,
            'type', 'contact',
            'order', 0,
            'content', jsonb_build_object(
                'contact', COALESCE(r.resume_data->'contact_info', '{}'::jsonb)
            )
            ) as section
            WHERE TRUE
            UNION ALL
            SELECT jsonb_build_object(
                    'id', 'summary-' || r.id,
                    'type', 'summary',
                    'order', 1,
                    'content', jsonb_build_object(
                        'summary', r.resume_data->>'summary'
                    )
                )
            WHERE r.resume_data->'summary' IS NOT NULL
            UNION ALL
            SELECT jsonb_build_object(
                    'id', 'experience-' || r.id,
                    'type', 'experience',
                    'order', 2,
                    'content', jsonb_build_object(
                        'experience', r.resume_data->'work_experiences'
                    )
                )
            WHERE r.resume_data->'work_experiences' IS NOT NULL AND jsonb_array_length(r.resume_data->'work_experiences') > 0
            UNION ALL
            SELECT jsonb_build_object(
                    'id', 'education-' || r.id,
                    'type', 'education',
                    'order', 3,
                    'content', jsonb_build_object(
                        'education', r.resume_data->'educations'
                    )
                )
            WHERE r.resume_data->'educations' IS NOT NULL AND jsonb_array_length(r.resume_data->'educations') > 0
            UNION ALL
            SELECT jsonb_build_object(
                    'id', 'skills-' || r.id,
                    'type', 'skills',
                    'order', 4,
                    'content', jsonb_build_object(
                        'skills', r.resume_data->'skills'
                    )
                )
            WHERE r.resume_data->'skills' IS NOT NULL AND jsonb_array_length(r.resume_data->'skills') > 0
            UNION ALL
            SELECT jsonb_build_object(
                    'id', 'projects-' || r.id,
                    'type', 'projects',
                    'order', 5,
                    'content', jsonb_build_object(
                        'projects', r.resume_data->'projects'
                    )
                )
            WHERE r.resume_data->'projects' IS NOT NULL AND jsonb_array_length(r.resume_data->'projects') > 0
            UNION ALL
            SELECT jsonb_build_object(
                    'id', 'certifications-' || r.id,
                    'type', 'certifications',
                    'order', 6,
                    'content', jsonb_build_object(
                        'certifications', r.resume_data->'certifications'
                    )
                )
            WHERE r.resume_data->'certifications' IS NOT NULL AND jsonb_array_length(r.resume_data->'certifications') > 0
        ) sections
    ) as sections,
    COALESCE(r.version, 1) as version,
    r.created_at,
    COALESCE(r.updated_at, r.created_at) as updated_at,
    false as is_archived
FROM "resumes" r
WHERE NOT EXISTS (
    SELECT 1 FROM "resume_drafts" rd WHERE rd.id = r.id
)
ON CONFLICT (id) DO NOTHING;

-- Migrate resume_versions to reference resume_drafts (if they don't already)
-- Note: resume_versions table uses resume_id which can reference either resumes or resume_drafts
-- Since we're using the same IDs, existing versions will continue to work

