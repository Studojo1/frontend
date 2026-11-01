// A student's rows in the product's own schema (career-agent, Studojo1/career-agent, schema career_agent in the same
// Postgres), for "Delete my account" and "Download my data" (RELAUNCH, 2 Nov 2026). Before the relaunch both went
// through job-outreach-svc, which is being removed.
//
// Which tables, and in which order, is read from the catalog each time, the same way career-agent's own start over
// does it (app/lib/test-reset.server.ts there, planReset): every career_* table in the schema with a user_id column,
// and the career_* tables without one whose rows hang off those rows by a foreign key (a sequence's steps, a thread's
// messages). The difference: start over keeps some tables (credits, the connected inbox); deleting an account keeps
// none. A table comes before every table it points at, so no cascade and no "set null" has to fire.
//
// Pure, for tests (app/lib/career-data.test.mjs). The queries are in career-data.server.ts.

/** The product's schema. Locally, with no such schema, nothing is read or deleted there. */
export const CAREER_SCHEMA = "career_agent";

/** One foreign key, as the catalog gives it. */
export interface CatalogFk {
  child: string;
  /** The child's column (null for a key over several columns). */
  childCol: string | null;
  /** The parent's bare name. */
  parentName: string;
  parentCol: string | null;
}

export interface Catalog {
  /** The schema the tables are in (CAREER_SCHEMA), or null when it does not exist. */
  schema: string | null;
  /** Its career_* tables with a user_id column. */
  userTables: readonly string[];
  /** Every foreign key from a table in that schema to a table in that schema. */
  fks: readonly CatalogFk[];
}

export interface ChildPlan {
  table: string;
  /** Its keys to the person's tables: a row is theirs when any of them points at one of their rows. */
  links: { col: string; parent: string; parentCol: string }[];
}

export type Step = { kind: "own"; table: string } | ({ kind: "child" } & ChildPlan);

export interface Plan {
  /** Every table, each before every table it points at (the order to delete in). */
  steps: Step[];
  /** Keys this plan cannot follow (several columns) and cycles. The delete still runs in one transaction: if the
   * database refuses, nothing is deleted. */
  problems: string[];
}

/** An identifier, quoted for SQL. */
export const ident = (name: string): string => `"${name.replace(/"/g, '""')}"`;

/** A table in the schema, quoted for SQL. */
export const qualified = (schema: string, table: string): string => `${ident(schema)}.${ident(table)}`;

/**
 * Payment records stay (the owner, 2 Nov 2026: tax law asks for about 6 years): a table with a user_id whose name says
 * payment, refund, invoice or receipt (payment_orders, payment_refunds, ...) or a credit order (career_credit_orders).
 * Pure.
 */
export function isPaymentTable(name: string): boolean {
  return /(^|_)(payments?|refunds?|invoices?|receipts?)(_|$)/.test(name) || /(^|_)credit_orders$/.test(name);
}

/** What a user row becomes when the account had payments: no name, no address that reaches them, no phone. Pure. */
export function anonymisedEmail(userId: string): string {
  return `deleted-${userId}@deleted.studojo.com`;
}

/** The "user" columns cleared, with the value each gets (only those the table has are set). */
export const ANONYMISE: Readonly<Record<string, string>> = Object.freeze({
  email: "$email",
  name: "''",
  image: "NULL",
  phone_number: "NULL",
  phone_number_verified: "false",
  email_verified: "false",
  two_factor_enabled: "false",
  last_login_method: "NULL",
  updated_at: "now()",
});

/** Which tables hold the person's rows, and the order to delete them in, from the catalog. `keep`: tables never
 * touched (payment records). Pure. */
export function planUserData(cat: Catalog, keep: ReadonlySet<string> = new Set()): Plan {
  if (!cat.schema) return { steps: [], problems: [] };
  const own = cat.userTables.filter((t) => t.startsWith("career_") && !keep.has(t));
  const ownSet = new Set(own);
  const problems: string[] = [];
  const childMap = new Map<string, ChildPlan>();
  for (const fk of cat.fks) {
    if (!ownSet.has(fk.parentName) || ownSet.has(fk.child) || !fk.child.startsWith("career_")) continue;
    if (!fk.childCol || !fk.parentCol) {
      problems.push(`${fk.child} points at ${fk.parentName} with a key of several columns`);
      continue;
    }
    const c = childMap.get(fk.child) ?? { table: fk.child, links: [] };
    c.links.push({ col: fk.childCol, parent: fk.parentName, parentCol: fk.parentCol });
    childMap.set(fk.child, c);
  }
  const inSet = (t: string) => ownSet.has(t) || childMap.has(t);
  // A kept table pointing at rows that go: the database decides (cascade would take a kept row, which the delete
  // checks for and refuses).
  for (const fk of cat.fks) {
    if (keep.has(fk.child) && inSet(fk.parentName)) problems.push(`${fk.child} (kept) points at ${fk.parentName}`);
  }
  const nodes = [...own, ...childMap.keys()].sort();
  const points = new Map<string, Set<string>>(nodes.map((t) => [t, new Set<string>()]));
  for (const fk of cat.fks) {
    if (inSet(fk.child) && inSet(fk.parentName) && fk.child !== fk.parentName) points.get(fk.child)!.add(fk.parentName);
  }
  const parentsFirst: string[] = [];
  const state = new Map<string, 1 | 2>();
  const visit = (t: string, path: string[]): void => {
    const s = state.get(t);
    if (s === 2) return;
    if (s === 1) {
      problems.push(`a cycle of keys: ${[...path, t].join(" -> ")}`);
      return;
    }
    state.set(t, 1);
    for (const p of [...points.get(t)!].sort()) visit(p, [...path, t]);
    state.set(t, 2);
    parentsFirst.push(t);
  };
  for (const t of nodes) visit(t, []);
  const steps: Step[] = parentsFirst
    .reverse()
    .map((t) => (ownSet.has(t) ? { kind: "own" as const, table: t } : { kind: "child" as const, ...childMap.get(t)! }));
  return { steps, problems };
}

/** How a step's rows are the person's: their user_id, or (a child) a key to one of their rows. `param` is the user id. */
export function stepWhere(schema: string, st: Step, alias: string, param = "$1"): string {
  if (st.kind === "own") return `${alias}.user_id = ${param}`;
  return st.links
    .map((l) => `${alias}.${ident(l.col)} IN (SELECT ${ident(l.parentCol)} FROM ${qualified(schema, l.parent)} WHERE user_id = ${param})`)
    .join(" OR ");
}

/** The auth rows deleted with the account, in this order, then the user row itself (or, with payments, its
 * anonymised copy). Each only when the table exists. */
export const AUTH_TABLES: readonly string[] = Object.freeze(["session", "account", "user_profile", "two_factor", "passkey"]);

/** Columns of the product's tables that never leave in an export, on top of app/lib/account-export.ts isSecretKey:
 * a channel link code (career_channel_codes.code) works as a short-lived password. */
export const CAREER_SECRET_COLUMNS: ReadonlySet<string> = new Set(["code"]);
