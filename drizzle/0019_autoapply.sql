CREATE TABLE "autoapply_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "cv_text" text NOT NULL,
  "roles" jsonb NOT NULL DEFAULT '[]',
  "locations" jsonb NOT NULL DEFAULT '[]',
  "platforms" jsonb NOT NULL DEFAULT '[]',
  "work_type" text NOT NULL DEFAULT 'any',
  "daily_limit" integer NOT NULL DEFAULT 20,
  "status" text NOT NULL DEFAULT 'active',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "autoapply_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "config_id" uuid NOT NULL REFERENCES "autoapply_configs"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "company" text NOT NULL,
  "role_title" text NOT NULL,
  "location" text NOT NULL DEFAULT '',
  "platform" text NOT NULL DEFAULT '',
  "apply_url" text NOT NULL DEFAULT '',
  "match_score" integer,
  "status" text NOT NULL DEFAULT 'queued',
  "applied_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "autoapply_configs_user_id_idx" ON "autoapply_configs" ("user_id");
CREATE UNIQUE INDEX "autoapply_configs_user_unique" ON "autoapply_configs" ("user_id");
CREATE INDEX "autoapply_jobs_user_id_idx" ON "autoapply_jobs" ("user_id");
CREATE INDEX "autoapply_jobs_config_id_idx" ON "autoapply_jobs" ("config_id");
CREATE INDEX "autoapply_jobs_status_idx" ON "autoapply_jobs" ("status");
