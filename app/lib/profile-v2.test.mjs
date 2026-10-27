// PROFILE-V2 (27 Oct 2026): a student's public page (/profile/:slug) wears the site's look on B2C hosts only
// (components/student-page/b2c). These checks hold the line:
// 1. studojo.com is untouched: the route draws the classic page off B2C hosts, and the classic page's code (its
//    components and its block of app.css) is byte for byte what staging 988c062 had.
// 2. The B2C page keeps the owner's structure of 16 Oct and its words: the lilac hero, "{first} is looking for", the
//    resume-check strip ("N of M claims matched", never "verified"), highlight tiles with source chips, section
//    cards, skill pills, the proof report last; the site header and footer; every CSS rule under
//    html[data-sv2="profile"]; no boarding pass, no serif CV, no Stu on a purple circle.
// 3. Privacy: no email or phone number reaches the loader's data unless the student allowed contact (then only their
//    sign-in email, read on the server); every resume string is scrubbed.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

const APP = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, APP), "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

// ---------- 1. studojo.com: the classic page, unchanged ----------
const { sv2PageFor } = await import("../components/site-b2c/site-links.ts");
assert.equal(sv2PageFor("/profile/riya-menon"), "profile", "the root marks the page (B2C hosts only)");
assert.equal(sv2PageFor("/profile"), null, "the old signed-in account page keeps its look");
assert.equal(sv2PageFor("/profile/riya-menon/photo"), null);

const route = read("routes/profile_.$slug.tsx");
assert.match(route, /\n  const b2c = useSiteB2c\(\);\n  if \(b2c\) return <StudentPageB2c p=\{d\.profile\} \/>;\n  return <StudentPage p=\{d\.profile\} \/>;\n\}/, "the B2C page only behind the host gate");
assert.match(route, /^import \{ useSiteB2c \} from "~\/components\/site-b2c\/host";$/m);
// The route minus the gate lines is the route as it was.
const classicRoute = route
  .split("\n")
  .filter((l) => {
    const t = l.trim();
    if (t === "") return false;
    if (/^import .* from "~\/components\/(site-b2c\/host|student-page\/b2c\/page)";$/.test(t)) return false;
    if (/^\/\/ SITE-V2\b/.test(t)) return false;
    if (t === "const b2c = useSiteB2c();" || t === "if (b2c) return <StudentPageB2c p={d.profile} />;") return false;
    return true;
  })
  .join("\n");
assert.equal(sha(classicRoute), "dd3d7d93112376ca", "routes/profile_.$slug.tsx: the studojo.com code changed");
// The classic page's components, byte for byte as on staging 988c062.
const PINNED = {
  "components/student-page/page.tsx": "2679ee7591636810",
  "components/student-page/atoms.tsx": "60350c1f52abe699",
  "components/student-page/sections.tsx": "a9aee3a3b63b04d8",
  "components/student-page/sources.tsx": "522ff3b395adb6ef",
  "components/student-page/bar.tsx": "bd583c62804080f1",
  "routes/profile_.$slug_.photo.tsx": "2850a4b97790d25a",
};
for (const [f, want] of Object.entries(PINNED)) assert.equal(sha(read(f)), want, `${f}: the studojo.com page changed`);
// ...and its block of app.css (the lilac wash, the bar's states, print).
const appCss = read("app.css");
const a = appCss.indexOf("/* ---------------------------------------------------------------------------\n * Student page (/profile/:slug");
const endMark = "box-shadow: none !important; }\n}";
assert.ok(a > 0, "app.css: the student page block");
assert.equal(sha(appCss.slice(a, appCss.indexOf(endMark, a) + endMark.length)), "7717972fd79a8fba", "app.css: the studojo.com page's styles changed");

// ---------- 2. the B2C page ----------
const dir = new URL("components/student-page/b2c/", APP);
const files = readdirSync(dir);
assert.deepEqual(files.sort(), ["atoms.tsx", "page.tsx", "profile.css", "sections.tsx", "sources.tsx"]);
const src = Object.fromEntries(files.map((f) => [f, readFileSync(new URL(f, dir), "utf8")]));
const tsx = ["page.tsx", "sections.tsx", "sources.tsx", "atoms.tsx"].map((f) => src[f]).join("\n");
const page = code(src["page.tsx"]);

// the site header and the compact footer, the stylesheet linked by this component only
assert.match(page, /<SiteHeader \/>/);
assert.match(page, /<SiteFooter compact \/>/, "the compact footer: on someone's page the one purple pill is Email");
assert.match(page, /<link rel="stylesheet" href=\{profileCss\} precedence="default" \/>/);
assert.match(page, /import profileCss from "\.\/profile\.css\?url";/, "linked by URL, never bundled into the route's CSS");
for (const f of readdirSync(new URL("routes/", APP))) assert.doesNotMatch(readFileSync(new URL(`routes/${f}`, APP), "utf8"), /student-page\/b2c\/profile\.css/, `routes/${f} links the B2C page's CSS`);
// the structure, in order: hero, highlights, about, the section cards, awards, skills, proof last
const ORDER = ["<Hero ", "<Highlights ", "<About ", "<StintSection ", "<Awards ", "<Skills ", "<Proof "];
const at = ORDER.map((t) => page.indexOf(t));
assert.ok(at.every((i, k) => i > 0 && (k === 0 || i > at[k - 1])), `in order: ${ORDER.join(" ")}`);
assert.ok(page.indexOf("<SiteHeader />") < page.indexOf("<main") && page.indexOf("</main>") < page.indexOf("<SiteFooter"), "header, page, footer");
// the data rules are the classic ones: one view model, nothing decided here
assert.match(page, /const v = useMemo\(\(\) => profileView\(p\), \[p\]\);/);
assert.doesNotMatch(tsx, /student-page\.server|scrubContacts|fetch\(/, "no data read in the components");
// the words: the same as the classic page's
const classicText = ["sections.tsx", "sources.tsx", "atoms.tsx"].map((f) => read(`components/student-page/${f}`)).join("\n");
for (const s of [
  "is looking for", "Resume-checked profile", "Checked against the resume", "claims", "matched to {v.poss} resume", "See the proof", "Updated {v.updated}",
  "Numbers from ${poss} resume. Open a source to see the line.", "In ${poss} own words", "Also under ${label} on ${poss} resume", "As written on ${poss} resume",
  "Listed on {poss} resume", "Grouped by where ${first} used them", "and {g.more} more", "No matching line", "Open all", "Close all", "From {poss} resume",
  "Show fewer", "Show ${count} more", "Copy link", "Copied", "Copy failed", "Email {first}", "Studying", "College", "Class of", "Based in", "Companies", "Cities",
  "not a background or employment check", "contact details are never shown",
]) {
  assert.ok(classicText.includes(s), `the classic page says "${s}"`);
  assert.ok(tsx.includes(s), `the B2C page says "${s}"`);
}
// honest proof wording: never "verified"; the filled seal and green bar only at 100%
assert.doesNotMatch(code(tsx), /verif/i, "never \"verified\"");
assert.match(src["sections.tsx"], /<Seal all=\{v\.proof\.all\} size=\{46\} \/>/);
assert.match(src["sources.tsx"], /<Seal all=\{proof\.all\} size=\{52\} \/>/);
assert.match(src["atoms.tsx"], /i < matched \? "pv-on" : undefined/, "one green segment per matched claim");
// what the owner turned down stays out: the boarding pass, the serif editorial CV, initial tiles from junk text
assert.doesNotMatch(tsx + src["profile.css"], /boarding|ticket|Newsreader|(?<!sans-)serif|Clash Display|font-clash/i);
assert.match(src["sections.tsx"], /initialsOf\(org \|\| title\)/, "initials from an entry the mapper trusts, as before");
// no Stu on a purple circle anywhere on the page
assert.doesNotMatch(tsx, /StuHead|stu\/head-|#6e4b8e/);
// every rule under html[data-sv2="profile"]
const css = src["profile.css"].replace(/\/\*[\s\S]*?\*\//g, "");
{
  let buf = "";
  const stack = [];
  let n = 0;
  for (const ch of css) {
    if (ch === "{") {
      const head = buf.trim();
      buf = "";
      if (head.startsWith("@media") || head.startsWith("@supports")) { stack.push("group"); continue; }
      assert.ok(!head.startsWith("@"), `profile.css: ${head}`);
      let depth = 0, cur = "";
      const parts = [];
      for (const c of head) {
        if (c === "(" || c === "[") depth++;
        if (c === ")" || c === "]") depth--;
        if (c === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += c;
      }
      parts.push(cur);
      for (const s of parts) assert.match(s.trim(), /^html\[data-sv2="profile"\] ([a-z]+)?\.(pv|sv)/, `profile.css: unscoped selector "${s.trim()}"`);
      n += parts.length;
      stack.push("rule");
    } else if (ch === "}") {
      stack.pop();
      buf = "";
    } else buf += ch;
  }
  assert.ok(n > 150, `profile.css: ${n} selectors`);
}
// the purple pill is Email's alone; Copy link and Open all are white
for (const f of ["page.tsx", "sections.tsx", "sources.tsx"]) assert.doesNotMatch(src[f], /pv-btn\b/, `${f}: a purple pill that is not Email`);
const emailFn = src["atoms.tsx"].slice(src["atoms.tsx"].indexOf("export function EmailButton("));
assert.equal((src["atoms.tsx"].match(/pv-btn\b/g) ?? []).length, (emailFn.match(/pv-btn\b/g) ?? []).length, "atoms.tsx: only Email is a purple pill");

// ---------- 3. privacy ----------
// The loader reads the email only when the student allowed contact, and sends nothing else that could carry one.
assert.match(route, /const email = found\.page\.visibility\.contact === true \? await studentEmail\(found\.userId\) : null;/);
assert.match(route, /return \{ profile, search: !!found\.page\.visibility\.search, origin, hasPhoto: !!profile\.photo \};/);
assert.match(read("lib/student-page.server.ts"), /return scrubContacts\(repair\(profile,/, "the mapper scrubs every string it returns");
{
  const { toProfile } = await import("./student-page.server.ts");
  const lines = [
    { id: "h1", section: "header", text: "Asha Nair" },
    { id: "h2", section: "header", text: "asha.nair@example.com | +91 98450 12345 | linkedin.com/in/asha" },
    { id: "h3", section: "header", text: "Economics student who writes about markets. Reach me at asha.nair+jobs@example.co.in" },
    { id: "e1", section: "experience", text: "Research Intern, Example Capital (Jun 2025 - Aug 2025)" },
    { id: "e2", section: "experience", text: "Built a pricing model; call 080 4123 4567 for references" },
    { id: "x1", section: "extra", text: "WhatsApp: 98765 43210" },
    { id: "s1", section: "skills", text: "Excel, Python, write to asha@example.org" },
  ];
  const claims = [
    { id: "c1", section: "experience", text: "Built a pricing model; call 080 4123 4567 for references", evidence: ["e2"] },
    { id: "c2", section: "intro", text: "Economics student. Mail asha.nair@example.com", evidence: ["h3"] },
  ];
  const talent = {
    prefs: { titles: ["Analyst, reach me on 9845012345"], cities: ["Bengaluru"] },
    chat: { proud: "My model is on asha.nair@example.com, ask me. Or +91 98450 12345." },
    page: { slug: "asha-nair", meta: "Bengaluru", headline: "Analyst at heart. asha.nair@example.com", about: "Call +91-98450-12345 any time.", claims, lines, visibility: { link: true, search: false, managers: false, adult: true }, approvedAt: "2026-10-20T00:00:00Z" },
  };
  const p = toProfile({ fullName: "Asha Nair", college: "Example College", course: "BA Economics", yearOfStudy: "2026", talent }, { origin: "https://studojo.pro", email: null, now: new Date("2026-10-27T00:00:00Z") });
  const all = JSON.stringify(p);
  assert.ok(!/@example\.|asha@|98450|12345|4123|43210|9845012345/.test(all), `a contact detail reached the page data: ${all.match(/[^"]*(@example\.|98450|4123|43210)[^"]*/)?.[0]}`);
  assert.equal(p.email, null, "no email unless the student allowed contact");
  // allowed: the sign-in email the server read, and only in the email field
  const q = toProfile({ fullName: "Asha Nair", college: "", course: "", yearOfStudy: "", talent }, { origin: "https://studojo.pro", email: "asha.signin@example.com", now: new Date("2026-10-27T00:00:00Z") });
  assert.equal(q.email, "asha.signin@example.com");
  assert.equal(JSON.stringify({ ...q, email: null }).includes("@example."), false, "the email only in its own field");
}

console.log("profile-v2: ok");
