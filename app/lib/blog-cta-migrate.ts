import { fixBlogClaims } from "../components/site-b2c/blog/blog-b2c";
import { RETIRED_PRODUCT_PHRASES, stuVia } from "../components/site-b2c/stu-cta";

// CTA-NEW (4 Nov 2026): the blog body migration's pure part (scripts/cta-new-blog-migrate.ts runs it on the rows).
// Rewrites only CTA text and links inside a post's HTML; everything else in the post stays byte for byte.
// Tests: app/lib/cta-new.test.mjs.

/** The copy of every blog_posts row taken in the same transaction, before any row changes. */
export const BACKUP_TABLE = "blog_posts_backup_20261104";

/** The token a hand rewrite writes where the post's start link goes. */
export const START_TOKEN = "{START}";

/** One hand rewrite: in post `slug`, the exact HTML `old` (after the claims fix) becomes `new`. */
export interface Rewrite {
  slug: string;
  old: string;
  new: string;
  note?: string;
}

/** The post's no-script start link: the platform's /join, via=blog-<slug>, how=voice (as HTML, & escaped). */
export function blogStartLink(origin: string, slug: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/join?via=${encodeURIComponent(stuVia("blog", slug))}&amp;how=voice`;
}

/** An anchor to the post's start link, marked for the page (blog-b2c.ts processBlogHtmlB2c). */
export function startAnchor(href: string, text: string): string {
  return `<a href="${href}" data-stu-start="">${text}</a>`;
}

const OLD_LINK =
  /<a\b[^>]*\bhref\s*=\s*["'](?:(?:https?:\/\/(?:www\.)?studojo\.com)?\/outreach(?:[/?#][^"']*)?|https?:\/\/(?:jobs?\.studojo\.com|jobstudojo\.com)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
const OLD_HOST_TEXT = /\b(?:jobs?\.studojo\.com|JobStudojo\.com)\b/gi;
const PLACEHOLDER = /<div\b[^>]*data-studojo-cta="outreach"[^>]*>[\s\S]*?<\/div>/gi;

/** The retired product's setup line ("Setup takes about 2 minutes: upload your resume"): the new product starts with
 * one short call with Stu (the resume is asked for in the call). Each form found in the posts, most specific first. */
const SETUP_FIXES: readonly [RegExp, string][] = [
  [/Setup takes about (?:2|two) minutes: (?:you )?upload your resume and the rest is handled\./g, "You start with one short call with Stu, and Stu handles the rest."],
  [/Setup takes about (?:2|two) minutes: (?:you )?upload your resume(,? and )Studojo/g, "You start with one short call with Stu$1Studojo"],
  [/Setup takes about (?:2|two) minutes: (?:you )?upload your resume\./g, "You start with one short call with Stu."],
  [/Setup takes about (?:2|two) minutes, and it finds/g, "You start with one short call with Stu, and Stu finds"],
  [/you upload your resume, and setup takes about (?:2|two) minutes\./g, "you share your resume, in one short call with Stu."],
  [/You upload your resume, (?:which takes about (?:2|two) minutes|setup takes about (?:2|two) minutes), and /g, "You start with one short call with Stu, and "],
  [/You upload your resume, Studojo finds/g, "You start with one short call with Stu, and Studojo finds"],
  [/: upload your resume, and Studojo identifies/g, ": start one short call with Stu, and Studojo identifies"],
  [/>(\s*)About (?:2|two) minutes: upload your resume(\s*)</g, ">$1One short call with Stu$2<"],
];

/** What is left in a post that sells a retired product: old links, old host names, old claims. Empty when clean. */
export function retiredLeft(html: string): string[] {
  const out: string[] = [];
  const re = /href\s*=\s*["']([^"']*)["']/gi;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const h = m[1];
    if (/^(?:https?:\/\/(?:www\.)?studojo\.com)?\/(?:outreach|dojos|cc|resumes?|assignments|revision|autoapply|internships|rsb)(?:[/?#]|$)/i.test(h)) out.push(`link ${h}`);
    if (/^https?:\/\/(?:jobs?\.studojo\.com|jobstudojo\.com|partners\.studojo\.com)/i.test(h)) out.push(`link ${h}`);
  }
  if (/data-studojo-cta="outreach"/i.test(html)) out.push("outreach placeholder");
  const text = html.replace(/<[^>]+>/g, " ");
  for (const p of RETIRED_PRODUCT_PHRASES) {
    const m = p.exec(text);
    if (m) out.push(`phrase "${m[0]}"`);
  }
  if (/8,500\+ students/i.test(text)) out.push("old count 8,500+");
  return out;
}

/** The HTML blocks (paragraph, list item, heading, cell, quote) that still need a hand rewrite. For the extract step. */
export function blocksNeedingRewrite(html: string): string[] {
  const out: string[] = [];
  const re = /<(p|li|h[1-6]|td|th|blockquote)\b[^>]*>[\s\S]*?<\/\1>/gi;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const b = m[0];
    if (retiredLeft(b).length) out.push(b);
  }
  return out;
}

export interface MigrateResult {
  content: string;
  applied: Rewrite[];
  counts: { claims: number; setup: number; placeholders: number; rewrites: number; fallbackLinks: number; fallbackText: number };
  diffs: { before: string; after: string }[];
}

/** One post's content, migrated. Pure and idempotent (a migrated post comes back unchanged). */
export function migratePost(content: string, slug: string, origin: string, rewrites: readonly Rewrite[]): MigrateResult {
  const counts = { claims: 0, setup: 0, placeholders: 0, rewrites: 0, fallbackLinks: 0, fallbackText: 0 };
  const applied: Rewrite[] = [];
  const diffs: { before: string; after: string }[] = [];
  const start = blogStartLink(origin, slug);
  if (!content) return { content, applied, counts, diffs };

  // 1. the claims the page already rewrites as it renders
  let out = fixBlogClaims(content);
  if (out !== content) counts.claims = 1;

  // 2. the editor's placeholders
  out = out.replace(PLACEHOLDER, () => {
    counts.placeholders++;
    return `<div data-studojo-cta="stu"></div>`;
  });

  // 3. the hand rewrites for this post
  for (const w of rewrites) {
    if (w.slug !== slug || !w.old || !out.includes(w.old)) continue;
    const next = w.new.split(START_TOKEN).join(start);
    out = out.split(w.old).join(next);
    applied.push(w);
    counts.rewrites++;
    diffs.push({ before: w.old, after: next });
  }

  // 3b. the old setup line wherever a hand rewrite left it
  for (const [re, to] of SETUP_FIXES) {
    out = out.replace(re, (...m) => {
      counts.setup++;
      return to.replace(/\$(\d)/g, (_x, d: string) => String(m[Number(d)] ?? ""));
    });
  }

  // 4. any link still left to the retired pages, and the old job board's name as plain text
  out = out.replace(OLD_LINK, (_m, text: string) => {
    counts.fallbackLinks++;
    const plain = text.replace(/<[^>]+>/g, "").trim();
    const words = /^(?:https?:\/\/)?(?:www\.)?(?:jobs?\.)?studojo\.com(?:\/\S*)?$|^JobStudojo\.com$/i.test(plain) ? "Stu, Studojo's career agent" : text;
    return startAnchor(start, words);
  });
  out = out.replace(OLD_HOST_TEXT, () => {
    counts.fallbackText++;
    return "Stu, Studojo's career agent";
  });

  return { content: out, applied, counts, diffs };
}
