-- The application flow now stores the candidate's uploaded PDF directly and
-- no longer parses it into a JSON snapshot. resume_snapshot was originally
-- NOT NULL because every application had to have one; with the new flow the
-- snapshot is optional (and typically absent for new applications). Existing
-- rows are unaffected; the apply endpoint will simply omit the column on
-- inserts going forward.
ALTER TABLE "internship_applications" ALTER COLUMN "resume_snapshot" DROP NOT NULL;
