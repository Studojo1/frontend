-- One talent store per student, shared by every product instead of each one
-- asking again: what /start read from the resume and the student confirmed,
-- and the preferences learned from the role swipes. Shape:
-- {"resume": {...}, "prefs": {...}, "sources": {"college": "resume", ...}, "updatedAt": "..."}
-- NULL means the student has not been through /start.
ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "talent" jsonb;
