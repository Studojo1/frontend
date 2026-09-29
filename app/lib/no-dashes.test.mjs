// A codebase-wide guard against em and en dashes.
//
// Studojo copy never uses them: they read as AI-written. The rule already sat
// in CLAUDE.md and in the report skill, and still 1,400 of them shipped, so
// now it is enforced. Every file under app/ is scanned, comments included,
// because copy gets pasted out of comments and prompts get primed by them.
//
// Need the character for real (a regex, a sanitizer, a parser)? Write the
// escape instead of the literal: \u2014 for the em dash, \u2013 for the en
// dash. Behaviour is identical and this guard stays quiet.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|jsx|mjs|json|css|html|md)$/.test(e)) files.push(p);
  }
})(ROOT);

const DASH = /[\u2013\u2014]|&[mn]dash;|&#821[12];|&#x201[34];/i;

let bad = 0;
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (!DASH.test(line)) return;
    bad++;
    const rel = f.replace(ROOT, "app/");
    console.log(`  FAIL ${rel}:${i + 1}\n       ${line.trim().slice(0, 110)}`);
  });
}

console.log(`\nscanned ${files.length} files`);
if (bad) {
  console.log(
    `${bad} line(s) with an em or en dash. Rewrite with a comma, colon, period or parentheses; ` +
      `use a plain hyphen for ranges (12-18); write \\u2014 / \\u2013 where code needs the character.`,
  );
  process.exit(1);
}
console.log("no em or en dashes anywhere under app/");
