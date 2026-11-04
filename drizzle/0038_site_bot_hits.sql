-- 0038_site_bot_hits.sql: crawler page hits, one row per IST day, bot family and path group.
--
-- VISITORS (4 Nov 2026, the owner: "how many real users, how many crawlers and from what source"). Crawlers are
-- never written to career_agent.career_journey_events (journey.server.ts skips every isbot user agent), and the
-- ingress keeps no access log in Postgres, so nothing recorded them. The site now counts them here
-- (journey.server.ts countBotHit): a page render whose user agent isbot (or, on a landing page, a scripted
-- browser that isAutomatedRequest catches) adds to its row. No IP, no user agent, no visitor id: only the bot's
-- family name, the path group and a count. Read by the admin panel's Visitors page.
--
--   day         the IST calendar day of the hit
--   bot         the family (googlebot, bingbot, gptbot, claudebot, meta_externalagent, ahrefsbot, other_bot, ...)
--   path_group  home, blog, report, legal or other
--   hits        page renders that day
--
-- No BEGIN/COMMIT and no CONCURRENTLY: scripts/migrate.sh wraps each file in one transaction. deploy-web.yml runs no
-- migrations, so this is applied by hand (staging, then production after approval):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f drizzle/0038_site_bot_hits.sql
-- Idempotent. Until it exists the site skips the write quietly (42P01), checked again at most once a minute.

CREATE TABLE IF NOT EXISTS public.site_bot_hits (
    day         DATE        NOT NULL,
    bot         TEXT        NOT NULL,
    path_group  TEXT        NOT NULL,
    hits        INTEGER     NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (day, bot, path_group)
);
