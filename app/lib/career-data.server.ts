// "Delete my account" and "Download my data" without job-outreach-svc (RELAUNCH, 2 Nov 2026). The plan (which
// tables, which order) is app/lib/career-data.ts; this file runs it.
//
// Delete, in ONE transaction: the student's rows in the product's schema (career_agent), in the plan's order; then
// their auth rows (session, account, user_profile); then the "user" row. Nothing here names a table of the old
// products. The "user" row's own foreign keys decide the rest: a table that declared ON DELETE CASCADE loses that
// user's rows with it (as every career_* table and the auth tables do), and a table that declared RESTRICT stops the
// delete, which then rolls back whole, nothing deleted (AccountDeleteBlocked; the page asks them to write to us).
//
// Export: the same rows, read in one read-only snapshot, with every secret column dropped.
import type { PoolClient } from "pg";
import { pool } from "~/lib/db";
import {
  AUTH_TABLES,
  CAREER_SCHEMA,
  ident,
  planUserData,
  qualified,
  stepWhere,
  type Catalog,
} from "~/lib/career-data";

type Queryable = Pick<PoolClient, "query">;

/** The product's schema, its career_* tables with a user_id, and the keys between its tables. */
export async function readCareerCatalog(c: Queryable, schema = CAREER_SCHEMA): Promise<Catalog> {
  const has = await c.query<{ ok: boolean }>("SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = $1) AS ok", [schema]);
  if (!has.rows[0]?.ok) return { schema: null, userTables: [], fks: [] };
  const tables = await c.query<{ name: string }>(
    `SELECT cl.relname AS name FROM pg_class cl JOIN pg_namespace n ON n.oid = cl.relnamespace
      WHERE n.nspname = $1 AND cl.relkind IN ('r', 'p') AND NOT cl.relispartition AND cl.relname LIKE 'career\\_%'
        AND EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = cl.oid AND a.attname = 'user_id' AND a.attnum > 0 AND NOT a.attisdropped)
      ORDER BY 1`,
    [schema],
  );
  const fks = await c.query<{ child: string; child_col: string | null; parent_name: string; parent_col: string | null }>(
    `SELECT cl.relname AS child,
            CASE WHEN array_length(con.conkey, 1) = 1 THEN ca.attname END AS child_col,
            pl.relname AS parent_name,
            CASE WHEN array_length(con.confkey, 1) = 1 THEN pa.attname END AS parent_col
       FROM pg_constraint con
       JOIN pg_class cl ON cl.oid = con.conrelid JOIN pg_namespace cn ON cn.oid = cl.relnamespace
       JOIN pg_class pl ON pl.oid = con.confrelid JOIN pg_namespace pn ON pn.oid = pl.relnamespace
       LEFT JOIN pg_attribute ca ON ca.attrelid = con.conrelid AND ca.attnum = con.conkey[1]
       LEFT JOIN pg_attribute pa ON pa.attrelid = con.confrelid AND pa.attnum = con.confkey[1]
      WHERE con.contype = 'f' AND cn.nspname = $1 AND pn.nspname = $1
      ORDER BY 1, 2, 3`,
    [schema],
  );
  return {
    schema,
    userTables: tables.rows.map((r) => r.name),
    fks: fks.rows.map((r) => ({ child: r.child, childCol: r.child_col, parentName: r.parent_name, parentCol: r.parent_col })),
  };
}

/** The delete stopped: a table outside this plan still holds a row that keeps the user (a RESTRICT key). Nothing changed. */
export class AccountDeleteBlocked extends Error {
  constructor(readonly detail: string) {
    super("Your account could not be deleted automatically. Nothing was deleted.");
  }
}

export interface DeleteDone {
  /** Rows deleted in the product's schema, by table. */
  career: Record<string, number>;
  /** Auth rows deleted, by table ("user" is 1). */
  auth: Record<string, number>;
}

/** Deletes the account, in one transaction. userId: the signed-in person, never one from a request body. */
export async function deleteAccount(userId: string): Promise<DeleteDone> {
  if (!userId) throw new Error("no user");
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query("SET LOCAL lock_timeout = '10s'");
    await c.query("SET LOCAL statement_timeout = '120s'");
    const cat = await readCareerCatalog(c);
    const plan = planUserData(cat);
    if (plan.problems.length) console.warn(`[account-delete] plan notes: ${plan.problems.join("; ").slice(0, 400)}`);
    const career: Record<string, number> = {};
    if (cat.schema) {
      for (const st of plan.steps) {
        const r = await c.query(`DELETE FROM ${qualified(cat.schema, st.table)} AS t WHERE ${stepWhere(cat.schema, st, "t")}`, [userId]);
        career[st.table] = r.rowCount ?? 0;
      }
    }
    const auth: Record<string, number> = {};
    for (const t of AUTH_TABLES) {
      const r = await c.query(`DELETE FROM ${ident(t)} WHERE user_id = $1`, [userId]);
      auth[t] = r.rowCount ?? 0;
    }
    const u = await c.query(`DELETE FROM "user" WHERE id = $1`, [userId]);
    auth.user = u.rowCount ?? 0;
    await c.query("COMMIT");
    const n = Object.values(career).reduce((a, b) => a + b, 0);
    console.log(`[account-delete] ${userId}: ${n} product rows in ${Object.values(career).filter((x) => x > 0).length} tables, user ${auth.user}`);
    return { career, auth };
  } catch (e) {
    await c.query("ROLLBACK").catch(() => undefined);
    const err = e as { code?: string; table?: string; constraint?: string };
    if (err?.code === "23503") {
      console.error(`[account-delete] ${userId} blocked by ${err.table ?? "?"} (${err.constraint ?? "?"}); rolled back`);
      throw new AccountDeleteBlocked(`${err.table ?? ""} ${err.constraint ?? ""}`.trim());
    }
    throw e;
  } finally {
    c.release();
  }
}

/** The student's rows in the product's schema, by table, from one read-only snapshot. Secrets are dropped by the caller. */
export async function exportCareerData(userId: string): Promise<Record<string, unknown[]>> {
  if (!userId) throw new Error("no user");
  const c = await pool.connect();
  try {
    await c.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await c.query("SET LOCAL statement_timeout = '60s'");
    const cat = await readCareerCatalog(c);
    const out: Record<string, unknown[]> = {};
    if (cat.schema) {
      const plan = planUserData(cat);
      // Parents first reads more naturally in the file; the order does not matter for reads.
      for (const st of [...plan.steps].reverse()) {
        const r = await c.query<{ rows: string }>(
          `SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)::text AS rows FROM ${qualified(cat.schema, st.table)} AS t WHERE ${stepWhere(cat.schema, st, "t")}`,
          [userId],
        );
        const rows = JSON.parse(r.rows[0]?.rows ?? "[]") as unknown[];
        if (rows.length) out[st.table] = rows;
      }
    }
    await c.query("COMMIT");
    return out;
  } catch (e) {
    await c.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    c.release();
  }
}
