// Guards the mobile foundations that were measured sound, so they stay sound.
//
// The mobile audit found no horizontal scroll, a correct viewport meta, and
// pinch zoom left enabled. That is the one part of the product we did not have
// to fix, and it is exactly the kind of thing a well-meaning "stop the layout
// jumping on iOS" commit quietly undoes. This fails the moment it does.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|html)$/.test(e) && !/\.test\./.test(e)) files.push(p);
  }
})(ROOT);

// Comments explain the bug; they must not be mistaken for the bug. Strip line
// comments only: a greedy /* ... */ pass eats JSX like `{/* ... */}` along with
// everything between two unrelated comment markers, which silently swallowed the
// viewport <meta> in root.tsx and made this whole guard a no-op.
const strip = (t) => t.replace(/^\s*\/\/.*$/gm, "");

const OFFENDERS = [
  {
    re: /user-scalable\s*=\s*(no|0)/i,
    why: "user-scalable=no blocks pinch zoom — a WCAG 1.4.4 failure, and the thing people do when text is too small to read",
  },
  {
    // maximum-scale=1 is the same lockout wearing a different hat: iOS Safari
    // honours it by refusing to zoom past the initial scale.
    re: /maximum-scale\s*=\s*1(\.0)?\b/i,
    why: "maximum-scale=1 also prevents zoom on iOS Safari",
  },
];

// Real JSX puts <input, its type and its className on separate lines, so this
// one cannot be a line scan -- matching per line is why an earlier version of
// this rule never fired. Match the whole element across newlines instead.
// <textarea> and <select> zoom exactly like <input>, and a textarea is where
// someone types a message -- the case this guard originally missed, found only
// when a user reported the screen zooming while they typed. An <input> with no
// type attribute defaults to text, so it counts too.
const INPUT_RE = /<(?:textarea|select)\b[^>]*?\btext-(?:xs|sm)\b[^>]*>|<input\b(?![^>]*type=["'](?:checkbox|radio|hidden|submit|button|range|color|file)["'])[^>]*?\btext-(?:xs|sm)\b[^>]*>/gs;
const INPUT_WHY =
  "text field under 16px — iOS Safari force-zooms on focus and never zooms back";

let bad = 0, scanned = 0;
for (const f of files) {
  const src = strip(readFileSync(f, "utf8"));
  scanned++;
  const rel = f.replace(ROOT, "app/");
  for (const line of src.split("\n")) {
    for (const o of OFFENDERS) {
      if (o.re.test(line)) {
        bad++;
        console.log(`  FAIL ${rel}\n       ${line.trim().slice(0, 110)}\n       ${o.why}`);
      }
    }
  }
  // Whole-file pass for the elements that span lines.
  for (const hit of src.match(INPUT_RE) || []) {
    bad++;
    console.log(`  FAIL ${rel}\n       ${hit.replace(/\s+/g, " ").trim().slice(0, 110)}\n       ${INPUT_WHY}`);
  }
}

// The viewport meta has to exist and be the right one, not merely not-wrong.
const root = readFileSync(join(ROOT, "root.tsx"), "utf8");
const meta = root.match(/<meta\s+name="viewport"\s+content="([^"]*)"/);
if (!meta) {
  console.log("  FAIL app/root.tsx\n       no viewport meta at all — every page renders at desktop width on a phone");
  bad++;
} else if (!/width=device-width/.test(meta[1])) {
  console.log(`  FAIL app/root.tsx\n       viewport is "${meta[1]}"\n       without width=device-width the page renders at 980px and is scaled down`);
  bad++;
}

console.log(`\nscanned ${scanned} files`);
if (bad) {
  console.log(`${bad} occurrence(s). See the mobile audit: zoom and the 16px input floor are load-bearing.`);
  process.exit(1);
}
console.log("mobile foundations intact — zoom enabled, viewport correct, no sub-16px inputs");
