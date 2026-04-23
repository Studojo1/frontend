-- Add full cookie jar storage to user_linkedin_sessions
-- Storing the full cookie string (encrypted) gives the scraper a real JSESSIONID/CSRF token
-- and other cookies LinkedIn validates, reducing ban risk significantly.

ALTER TABLE "user_linkedin_sessions"
  ADD COLUMN IF NOT EXISTS "cookies_encrypted" text;
