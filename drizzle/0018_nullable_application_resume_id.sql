-- Allow internship applications to be submitted without a saved resume (e.g. direct PDF upload)
ALTER TABLE internship_applications ALTER COLUMN resume_id DROP NOT NULL;
ALTER TABLE internship_applications DROP CONSTRAINT IF EXISTS internship_applications_resume_id_resumes_id_fk;
ALTER TABLE internship_applications ADD CONSTRAINT internship_applications_resume_id_resumes_id_fk
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;
