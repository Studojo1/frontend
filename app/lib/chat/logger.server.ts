import db from "~/lib/db";
import { sql } from "drizzle-orm";

let tableCreated = false;

async function ensureTable() {
  if (tableCreated) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS support_chat_logs (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_message TEXT NOT NULL,
      bot_response TEXT NOT NULL,
      source TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0,
      intent_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // Backfill columns on pre-existing tables (CREATE IF NOT EXISTS won't add them).
  await db.execute(sql`ALTER TABLE support_chat_logs ADD COLUMN IF NOT EXISTS ip_address TEXT`);
  await db.execute(sql`ALTER TABLE support_chat_logs ADD COLUMN IF NOT EXISTS user_agent TEXT`);
  // Index for admin queries
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_support_chat_logs_created_at ON support_chat_logs (created_at DESC)
  `);
  tableCreated = true;
}

export async function logChatInteraction(params: {
  sessionId: string;
  userMessage: string;
  botResponse: string;
  source: string;
  confidence: number;
  intentId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    await ensureTable();
    await db.execute(sql`
      INSERT INTO support_chat_logs (session_id, user_message, bot_response, source, confidence, intent_id, ip_address, user_agent)
      VALUES (
        ${params.sessionId},
        ${params.userMessage},
        ${params.botResponse},
        ${params.source},
        ${params.confidence},
        ${params.intentId || null},
        ${params.ipAddress || null},
        ${params.userAgent || null}
      )
    `);
  } catch (error) {
    console.error("[chat-logger] Failed to log interaction:", error);
  }
}

export async function getChatLogs(limit = 100, offset = 0) {
  await ensureTable();
  const rows = await db.execute(sql`
    SELECT id, session_id, user_message, bot_response, source, confidence, intent_id, ip_address, user_agent, created_at
    FROM support_chat_logs
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return rows.rows;
}

export async function getChatLogStats() {
  await ensureTable();
  const result = await db.execute(sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE source = 'nlp') AS nlp_count,
      COUNT(*) FILTER (WHERE source = 'llm') AS llm_count,
      COUNT(*) FILTER (WHERE source = 'escalation') AS escalation_count,
      COUNT(DISTINCT session_id) AS unique_sessions,
      AVG(confidence) AS avg_confidence
    FROM support_chat_logs
    WHERE created_at > NOW() - INTERVAL '30 days'
  `);
  return result.rows[0];
}
