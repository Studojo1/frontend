// CTA-NEW (4 Nov 2026, the owner: "on the blogs change the cta to the new product and rewrite all cta's for the new
// product"). Rewrites the old-product CTAs and links inside blog post bodies (public.blog_posts.content) to the new
// product, Stu. Only CTA text and links change: never a title, slug, date, excerpt or any other column.
//
// What it does to each post's content, in order (app/lib/blog-cta-migrate.ts, pure and tested):
//   1. the old product claims the post page already rewrites as it renders (blog-b2c.ts fixBlogClaims: the old
//      counts, "a one-time payment, not a subscription", "people sourced from 20,000+ databases"), now in the row
//   2. the editor's CTA placeholders (<div data-studojo-cta="outreach">) become <div data-studojo-cta="stu"></div>,
//      which the post page draws as the Stu card
//   3. the hand-written rewrites in scripts/cta-new-blog-rewrites.json: each CTA sentence or block that sold the
//      retired Outreach page or the old job board, rewritten for that post's topic
//   4. any link still left to /outreach or the old job board points at the post's start link, the platform's
//      /join?via=blog-<slug>&how=voice, marked data-stu-start (the page swaps in the visit's own start link)
// and then checks that no retired link or product claim is left.
//
// Usage (Node 22; posts.json is the output of the SELECT in --help):
//   npx tsx scripts/cta-new-blog-migrate.ts dry-run <posts.json> <staging|prod> [--samples 5]
//   npx tsx scripts/cta-new-blog-migrate.ts sql <posts.json> <staging|prod> > migrate.sql
// The SQL copies every row to blog_posts_backup_20261104 (CREATE TABLE AS) and updates only changed rows, each guarded
// by md5(content) so a post edited since the dump is left alone, all in one transaction.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { BACKUP_TABLE, migratePost, retiredLeft, type Rewrite } from "../app/lib/blog-cta-migrate";

const ORIGIN = { staging: "https://platform.studojo.pro", prod: "https://platform.studojo.com" } as const;

type Post = { id: string; slug: string; title: string; content: string };

function usage(): never {
  console.error(`usage: cta-new-blog-migrate.ts <dry-run|sql> <posts.json> <staging|prod> [--samples N]
posts.json: select json_agg(json_build_object('id',id,'slug',slug,'title',title,'content',content)) from blog_posts;`);
  process.exit(2);
}

const [mode, file, env] = process.argv.slice(2);
if (!mode || !file || (env !== "staging" && env !== "prod") || !["dry-run", "sql"].includes(mode)) usage();
const samplesAt = process.argv.indexOf("--samples");
const samples = samplesAt > 0 ? Number(process.argv[samplesAt + 1]) || 5 : 5;

const posts: Post[] = JSON.parse(readFileSync(file, "utf8"));
const rewrites: Rewrite[] = JSON.parse(readFileSync(new URL("./cta-new-blog-rewrites.json", import.meta.url), "utf8"));
const origin = ORIGIN[env];

const results = posts.map((p) => ({ post: p, ...migratePost(p.content, p.slug, origin, rewrites) }));
const changed = results.filter((r) => r.content !== r.post.content);
const left = results.filter((r) => retiredLeft(r.content).length > 0);
const unused = rewrites.filter((w) => !results.some((r) => r.applied.includes(w)));

function md5(s: string): string {
  return createHash("md5").update(s, "utf8").digest("hex");
}

function sqlText(s: string): string {
  // dollar quoting with a tag the content cannot contain
  let tag = "cta";
  while (s.includes(`$${tag}$`)) tag += "x";
  return `$${tag}$${s}$${tag}$`;
}

if (mode === "sql") {
  if (left.length) {
    console.error(`refusing: ${left.length} posts still carry retired links or claims: ${left.map((r) => r.post.slug).join(", ")}`);
    process.exit(1);
  }
  const out: string[] = [];
  out.push("\\set ON_ERROR_STOP on");
  out.push("BEGIN;");
  out.push(`CREATE TABLE ${BACKUP_TABLE} AS SELECT * FROM blog_posts;`);
  out.push(`SELECT count(*) AS backed_up FROM ${BACKUP_TABLE};`);
  out.push("CREATE TEMP TABLE cta_new_changed (id uuid) ON COMMIT DROP;");
  for (const r of changed) {
    out.push(
      `WITH u AS (UPDATE blog_posts SET content = ${sqlText(r.content)} WHERE id = '${r.post.id}' AND md5(content) = '${md5(r.post.content)}' RETURNING id) INSERT INTO cta_new_changed SELECT id FROM u;`,
    );
  }
  out.push("SELECT count(*) AS rows_changed FROM cta_new_changed;");
  out.push(`DO $chk$ BEGIN IF (SELECT count(*) FROM cta_new_changed) <> ${changed.length} THEN RAISE EXCEPTION 'expected ${changed.length} rows changed, got %', (SELECT count(*) FROM cta_new_changed); END IF; END $chk$;`);
  out.push("COMMIT;");
  process.stdout.write(out.join("\n") + "\n");
  console.error(`sql: ${changed.length} of ${posts.length} posts change; backup table ${BACKUP_TABLE}`);
  process.exit(0);
}

// dry-run: counts, then a diff of the changed blocks for N sample posts
console.log(`env ${env}, origin ${origin}`);
console.log(`posts ${posts.length}, changed ${changed.length}, still carrying retired links or claims ${left.length}`);
console.log(`hand rewrites ${rewrites.length}, applied ${rewrites.length - unused.length}, unused ${unused.length}`);
for (const r of left) console.log(`  LEFT ${r.post.slug}: ${retiredLeft(r.content).join(" | ")}`);
for (const w of unused) console.log(`  UNUSED rewrite for ${w.slug}: ${w.old.slice(0, 120)}`);
const steps = { claims: 0, setup: 0, placeholders: 0, rewrites: 0, fallbackLinks: 0, fallbackText: 0 };
for (const r of results) for (const k of Object.keys(steps) as (keyof typeof steps)[]) steps[k] += r.counts[k];
console.log(`changes by step: ${JSON.stringify(steps)}`);

const pick = changed.filter((r) => r.counts.rewrites > 0).slice(0, samples);
for (const r of pick) {
  console.log(`\n==== ${r.post.slug}  (${r.post.title})`);
  for (const d of r.diffs) {
    console.log(`- ${d.before}`);
    console.log(`+ ${d.after}`);
    console.log("");
  }
}
