-- Phase 1: Server-side AutoApply v2 schema
-- New tables: user_linkedin_sessions, job_queue, outreach_contacts, outreach_campaigns, system_events
-- Extend autoapply_configs with new columns

-- LinkedIn session + fingerprint per user
CREATE TABLE "user_linkedin_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "li_at_encrypted" text NOT NULL,
  "user_agent" text,
  "locale" text DEFAULT 'en-US',
  "timezone" text DEFAULT 'Asia/Kolkata',
  "proxy_country" text DEFAULT 'IN',
  "proxy_city" text DEFAULT 'bangalore',
  "proxy_session" text,
  "cookie_refreshed_at" timestamp DEFAULT now(),
  "is_active" boolean DEFAULT true NOT NULL,
  "warmup_day" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_linkedin_sessions_user_unique" UNIQUE ("user_id")
);
CREATE INDEX "user_linkedin_sessions_user_id_idx" ON "user_linkedin_sessions" ("user_id");

-- Server-discovered jobs queued for automated application
CREATE TABLE "job_queue" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "company" text NOT NULL,
  "role_title" text NOT NULL,
  "location" text DEFAULT '',
  "platform" text NOT NULL,
  "apply_url" text NOT NULL,
  "job_description" text DEFAULT '',
  "match_score" integer,
  "prescreened_answers" jsonb,
  "status" text NOT NULL DEFAULT 'pending',
  "error" text,
  "applied_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "job_queue_user_id_idx" ON "job_queue" ("user_id");
CREATE INDEX "job_queue_status_idx" ON "job_queue" ("status");
CREATE INDEX "job_queue_user_status_idx" ON "job_queue" ("user_id", "status");

-- LinkedIn contacts for outreach sequences
CREATE TABLE "outreach_contacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "linkedin_url" text NOT NULL,
  "name" text,
  "title" text,
  "company" text,
  "recent_post_snippet" text,
  "mutual_connection" text,
  "sequence_step" integer DEFAULT 0 NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "acceptance_rate_at_send" real,
  "connected_at" timestamp,
  "last_action_at" timestamp,
  "replied" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "outreach_contacts_user_url_unique" UNIQUE ("user_id", "linkedin_url")
);
CREATE INDEX "outreach_contacts_user_id_idx" ON "outreach_contacts" ("user_id");
CREATE INDEX "outreach_contacts_status_idx" ON "outreach_contacts" ("status");

-- Outreach campaign definitions
CREATE TABLE "outreach_campaigns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "target_titles" jsonb DEFAULT '[]' NOT NULL,
  "target_companies" jsonb DEFAULT '[]' NOT NULL,
  "connection_note" text,
  "message_template" text,
  "follow_up_template" text,
  "status" text NOT NULL DEFAULT 'active',
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "outreach_campaigns_user_id_idx" ON "outreach_campaigns" ("user_id");

-- Fleet-wide system events for sweep detection
CREATE TABLE "system_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_type" text NOT NULL,
  "user_id" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "system_events_type_created_idx" ON "system_events" ("event_type", "created_at");
CREATE INDEX "system_events_created_idx" ON "system_events" ("created_at");

-- Extend autoapply_configs with new fields
ALTER TABLE "autoapply_configs"
  ADD COLUMN IF NOT EXISTS "prescreen_answers" jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "company_prefs" jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "excluded_companies" jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "resume_url" text,
  ADD COLUMN IF NOT EXISTS "schedule_start_hour" integer DEFAULT 9,
  ADD COLUMN IF NOT EXISTS "schedule_end_hour" integer DEFAULT 20,
  ADD COLUMN IF NOT EXISTS "warmup_day" integer DEFAULT 0;
