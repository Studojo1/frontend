// HOMEPAGE V3 (27 and 28 Oct 2026, on studojo.pro 29 Oct): the studojo.pro homepage (components/home-v3) with Stu,
// live, in place. It sits beside HOMEPAGE V2 (components/home-v2, app/lib/home-v2.test.mjs), kept unchanged as the undo;
// _index.tsx picks V3 when the server's HOME_V3 is "1" (deploy-staging.yml, from the repository variable HOME_V3).
// What it guards: the page's order and its only starts; that the live Stu is /b2cnew/join's own first step (the same
// line, the same recording, the same sign-up links with the visit's keys kept) and never asks for a resume before
// sign-up; signed in, the desk; no dashes; the purple disc only behind ?stu=circle; and that studojo.com cannot
// change (the B2C homepage only behind the host gate, every rule of its CSS under .hv2).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../components/home-v3/", import.meta.url);
const read = (f) => readFileSync(new URL(f, dir), "utf8");
const files = readdirSync(dir).filter((f) => /\.(tsx?|css)$/.test(f));
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

// ---------- 1. the page, in order ----------
const home = read("HomeV3.tsx");
const css = code(read("home-v3.css"));
// HOMEPAGE V3 (27 Oct 2026, the owner: "the copy is terrible, the small fonts are not legible, it is too long"):
// five sections instead of eleven; 28 Oct, four (the free and safe tiles went: "why is this section even there").
const ORDER = ["Page", "CallTakeover", "HomeHeader", "Hero", "HowItWorks", "WhyEmail", "Proof", "Faq", "HomeFooter", "Floating"];
const at = ORDER.map((t) => home.indexOf(`<${t} />`));
assert.ok(at.every((i, k) => i > 0 && (k === 0 || i > at[k - 1])), `in order: ${ORDER.join(", ")}`);
assert.ok(home.indexOf("<AgentProvider>") < home.indexOf("<Page />"), "one agent for the whole page");
const SECTIONS = { HowItWorks: "how", WhyEmail: "why", Proof: "proof", Faq: "faq" };
for (const [c, id] of Object.entries(SECTIONS)) {
  const src = read(`${c}.tsx`);
  assert.match(src, new RegExp(`<section className="hv-sec hv3-sec" id="${id}" aria-labelledby="${id}-h">`), `${c} is #${id}`);
  // every section's title is an h2 of the one size (hv3-h2), named for the section
  assert.match(src, new RegExp(`<h2 className="hv3-h2" id="${id}-h">`), `${c}: its title`);
  // no per-section call to action (owner): only the hero, the floating agent and the footer start
  assert.doesNotMatch(src, /StartLink|data-start|hv-btn-start|\/b2cnew/, `${c}: no button of its own`);
}
const starts = {};
for (const f of files.filter((f) => f.endsWith(".tsx"))) {
  for (const m of read(f).matchAll(/<StartLink\b[^>]*?place="([\w-]+)"/g)) (starts[f] ??= []).push(m[1]);
}
assert.deepEqual(starts, { "Floating.tsx": ["side", "bar-stu", "bar"], "Hero.tsx": ["hero-stu", "hero"], "HomeFooter.tsx": ["footer"] }, "the only starts");

// ---------- 2. the copy that must stay true ----------
const all = files.filter((f) => f.endsWith(".tsx")).map(read).join("\n");
const text = code(all).replace(/&apos;/g, "'");
for (const must of [
  "Find jobs that fit you.",
  "Reach the person",
  "who's hiring",
  "Tell Stu, our AI career agent, what you're looking for.",
  "Every day, Stu checks company career sites and job boards for new roles",
  "Usually that's the hiring manager or a recruiter",
  "It goes out from your own inbox, and Stu follows up if they don't reply.",
  "Popular postings get hundreds of applicants.",
  "Replies are never guaranteed.",
  "Talking to Stu is free, and so are your top matches every day.",
  "You pay to see every match Stu finds, and emailing the people who are hiring uses credits.",
  "One credit is one verified email of the right person. No email found, no credit used.",
  "Stu, your career agent",
]) assert.ok(text.includes(must), `copy: ${must}`);
// The hero's four cards are what Stu does, in order (owner 28 Oct: "animations that have functionality"), not
// stand-alone figures like "86% match".
assert.match(read("Hero.tsx"), /const STEPS = \["Learns what you want", "Finds jobs that fit you", "Finds who's hiring", "Reaches out for you"\] as const;/, "the hero's four steps");
// 30 Oct 2026, the owner after watching a real user: "email is just a channel". The page leads with reaching the
// person who's hiring; email is named in how it works (step 4) and the questions, never in the hero, why or proof.
for (const f of ["Hero.tsx", "WhyEmail.tsx", "Proof.tsx"]) {
  assert.doesNotMatch(code(read(f)), /\bemail/i, `${f}: leads with reaching the person, not email`);
}
assert.doesNotMatch(code(read("Hero.tsx")), /86% match|New roles daily/, "no stand-alone figures around Stu");
// No call length and no "talk or type" above the questions (owner 28 Oct: "why is 10 minutes required? Not
// required"); the call's details are answered in the questions.
for (const f of ["Hero.tsx", "HowItWorks.tsx", "WhyEmail.tsx", "Proof.tsx", "HomeFooter.tsx"]) {
  assert.doesNotMatch(code(read(f)), /\b10 minutes|10-minute|ten minutes|talk or type/i, `${f}: the call's length`);
}
// Proof (owner 28 Oct): what our data covers, read from our own databases on 27 Oct 2026 and rounded down (Proof.tsx
// keeps the definitions); no sign-up count and no footnotes under the numbers.
for (const [n, label] of [["1,800,000+", "job postings in our data"], ["7,700+", "job boards and company career sites checked every day"], ["8,300+", "companies where we've found hiring managers"]]) {
  assert.ok(text.includes(`<b>${n}</b><span>${label}</span>`), `proof: ${n} ${label}`);
}
assert.doesNotMatch(code(read("Proof.tsx")), /signed up|as of September|not guaranteed/i, "proof: no sign-ups, no footnotes");
assert.doesNotMatch(text, /linkedin/i, "LinkedIn is not named as a source");
// The owner's pricing (28 Oct 2026): the top matches each day are free; every match and emailing are paid. The
// homepage says so without a price or an amount.
assert.doesNotMatch(text, /every job match|everything up to the email is free/i, "not every match is free");
assert.doesNotMatch(text, /\u20b9|\$\s?\d|\bRs\.?\s?\d|\b(INR|USD)\b|per month|\/mo\b/i, "no price on the homepage");
assert.doesNotMatch(text, /testimonial|<blockquote|<q>|&ldquo;|\u201c/i, "no quotes or testimonials");
assert.doesNotMatch(text, /ai job agent/i, "Stu is \"Stu, your career agent\"");
// Anyone can use Stu, not only students (owner 28 Oct): the copy never speaks to or about students.
assert.doesNotMatch(text, /\bstudents?\b/i, "the copy is for anyone, not students");

// ---------- 3. no em or en dashes anywhere in the homepage ----------
for (const f of files) assert.doesNotMatch(read(f), /[\u2013\u2014]|&[mn]dash;/, `${f}: an em or en dash`);

// ---------- 4. the live Stu is /join's own first step ----------
const { JOIN_LINE, JOIN_AUDIO, lineVersion, CARRY, carried, signInLink, homeSignIn, joinHref, DESK, saidAt, wordsOf } = await import("../components/home-v3/agent.ts");
// career-agent app/lib/voice/lines.ts LINES.join, word for word, and the address its recording is kept under
assert.equal(JOIN_LINE, "Hi! I'm Stu, your career agent at Studojo. I find the jobs that fit you, and get you in front of the people who hire. Let's start with a quick sign-up, so your account is ready.");
assert.equal(lineVersion(JOIN_LINE), "1uyttif");
assert.equal(JOIN_AUDIO, "/b2cnew/voice/say/join?v=1uyttif", "the same recording /join plays (spoken.ts clip)");
// career-agent app/lib/voice/sign-in-link.ts, its own test's vectors (tests/stu-embed.test.ts)
assert.deepEqual([...CARRY], ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "via", "how"]);
{
  const u = new URL(signInLink("?utm_source=ig&utm_medium=reel&gclid=abc&via=home&how=voice&email=x%40y.com"), "https://studojo.pro");
  assert.equal(u.pathname, "/auth");
  assert.equal(u.searchParams.get("redirect"), "/b2cnew/start?fresh&utm_source=ig&utm_medium=reel&gclid=abc&via=home&how=voice");
  assert.equal(u.searchParams.get("utm_source"), "ig");
  assert.equal(u.searchParams.get("email"), null, "nothing but the attribution keys");
}
assert.equal(signInLink(""), "/auth?redirect=%2Fb2cnew%2Fstart%3Ffresh");
assert.equal(carried(`?utm_term=${"x".repeat(300)}&utm_source=%20meta%20`), `utm_source=meta&utm_term=${"x".repeat(200)}`, "trimmed, 200 characters at most, in CARRY order");
// the homepage: what /join's loader builds for the /join address the homepage would have opened
assert.equal(joinHref("?utm_source=meta&gclid=g1&stu=circle"), "/b2cnew/join?utm_source=meta&gclid=g1&via=home&how=voice", "the review toggle never rides along");
assert.equal(homeSignIn(""), "/auth?redirect=%2Fb2cnew%2Fstart%3Ffresh%26via%3Dhome%26how%3Dvoice&via=home&how=voice");
{
  const link = homeSignIn("?utm_source=meta&utm_medium=paid&utm_campaign=oct&utm_content=reel2&utm_term=pm&gclid=g1&fbclid=f1&ref=x&via=ad&how=type&stu=circle");
  const u = new URL(link, "https://studojo.pro");
  assert.equal(u.pathname, "/auth");
  const next = new URL(u.searchParams.get("redirect"), "https://studojo.pro");
  assert.equal(next.pathname, "/b2cnew/start", "sign-up lands in the call");
  assert.ok(next.searchParams.has("fresh"));
  for (const [k, v] of [["utm_source", "meta"], ["utm_medium", "paid"], ["utm_campaign", "oct"], ["utm_content", "reel2"], ["utm_term", "pm"], ["gclid", "g1"], ["fbclid", "f1"], ["via", "home"], ["how", "voice"]]) {
    assert.equal(next.searchParams.get(k), v, `call keeps ${k}`);
    assert.equal(u.searchParams.get(k), v, `sign-in keeps ${k}`);
  }
  assert.equal(next.searchParams.get("ref"), null);
  assert.equal(next.searchParams.get("stu"), null);
}
assert.equal(DESK, "/b2cnew", "signed in: the desk");
assert.equal(saidAt(0.9, 1, 10, 170), 0);
assert.equal(saidAt(6, 1, 10, 170), 85);
assert.equal(saidAt(99, 1, 10, 170), 170);
assert.equal(wordsOf(JOIN_LINE).length, JOIN_LINE.split(" ").length);

// the hook is spoken.ts's: resume raced with 300 ms, blocked shows the words, start at +0.05, 0.3 s ahead, the
// wall-clock deadline 1.5 s after the audio's end
const spoken = code(read("useSpoken.ts"));
assert.match(spoken, /Promise\.race\(\[c\.resume\(\)\.catch\(\(\) => undefined\), sleep\(300\)\]\)/);
assert.match(spoken, /if \(c\.state !== "running"\) \{\s*setAt\(all\);\s*return;/);
assert.match(spoken, /const t = c\.currentTime \+ 0\.05;/);
assert.match(spoken, /const READ_AHEAD_S = 0\.3;/);
assert.match(spoken, /\(end - c\.currentTime\) \* 1000 \+ 1500/);
assert.match(spoken, /fetch\(JOIN_AUDIO\)/);

// the order is /join's: the tap, her line, then the card; the card's two buttons both go to the sign-in link
const start = code(read("start.tsx"));
const begin = start.slice(start.indexOf("const begin = useCallback("), start.indexOf("const hush"));
assert.ok(begin.indexOf("unlockAudio()") < begin.indexOf('go("speaking")') && begin.indexOf('go("speaking")') < begin.indexOf("say()") && begin.indexOf("say()") < begin.indexOf('go("signup")'), "tap, line, card");
assert.match(start, /href=\{a\.href\}/, "every start is a real link (/b2cnew/join, or /b2cnew signed in)");
assert.match(start, /const href = signedIn \? DESK : joinHref\(search\);/);
assert.match(start, /onClick=\{\s*a\.signedIn\s*\?\s*undefined/, "signed in: a plain link to the desk, no new onboarding");
const card = code(read("JoinCard.tsx"));
assert.match(card, /<a className="hv-g" href=\{signIn\}/, "Continue with Google: the sign-in link");
assert.match(card, /window\.location\.href = signIn;/, "or with email: the same link, as /join");
for (const s of ["Create your account", "Free to start. Takes ten seconds.", "Continue with Google", "or with email", "Email address", "By continuing you agree to Studojo&apos;s Terms of Service and Privacy Policy.", "Backed by"]) assert.ok(card.includes(s), `card: ${s}`);
assert.match(code(read("Takeover.tsx")), /if \(!callOpen \|\| a\.signedIn\) return null;/, "no takeover for a signed-in visitor");

// ---------- 5. never a resume before sign-up ----------
// Nothing on the homepage takes a file or asks for the resume; the resume is asked for inside the call, after sign-up.
for (const f of files.filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))) {
  const src = code(read(f));
  assert.doesNotMatch(src, /type="file"|<input[^>]*accept=|FormData|upload/i, `${f}: takes a file`);
}
for (const f of ["start.tsx", "JoinCard.tsx", "Hero.tsx", "Takeover.tsx", "Floating.tsx", "useSpoken.ts"]) {
  assert.doesNotMatch(code(read(f)).replace(/"[^"]*not just your resume"/g, ""), /(?<!\.)\bresume\b(?!\s*\()/i, `${f}: mentions a resume in the agent's steps`);
}
// the only places in /b2cnew the agent leads: /join (no script), the call after sign-up, the desk, the recording
const b2cnew = new Set();
for (const f of files.filter((f) => /\.tsx?$/.test(f))) for (const m of code(read(f)).matchAll(/\/b2cnew(?:\/[\w-]+)*(?:\?[\w=&-]*)?/g)) b2cnew.add(m[0]);
for (const p of b2cnew) assert.match(p, /^\/b2cnew(\/join|\/start\?fresh|\/voice\/say\/join\?v=|\/start|)$/, `leads to ${p}`);

// ---------- 5b. the call takeover (owner, 27 Oct): every start opens it; the page locked under it ----------
// Every start opens the takeover, the history entry comes before the lock, Back, the x and Escape close it.
assert.match(start, /onClick=\{\s*a\.signedIn\s*\?\s*undefined\s*:\s*\(e\) => \{[\s\S]*?e\.preventDefault\(\);\s*a\.openCall\(e\.currentTarget\);/, "every start opens the takeover");
const openCall = start.slice(start.indexOf("const openCall = useCallback("), start.indexOf("const closeCall"));
assert.ok(openCall.indexOf("navigate({ pathname: location.pathname, search: location.search, hash: CALL_HASH }, { preventScrollReset: true })") > 0, "its own history entry, the page's scroll kept");
assert.ok(openCall.indexOf("navigate(") < openCall.indexOf("lockScroll(window)") && openCall.indexOf("lockScroll(window)") < openCall.indexOf("begin()"), "entry, lock, then Stu");
assert.match(start, /window\.addEventListener\("popstate", onPop\)/, "Back closes it");
assert.match(start, /const closeCall = useCallback\(\(\) => \{[\s\S]*?shut\(\);\s*if \(was\) navigate\(-1\);/, "the x steps back off its entry");
const takeover = code(read("Takeover.tsx"));
assert.match(takeover, /if \(e\.key === "Escape"\) closeCall\(\);/, "Escape closes it");
assert.match(takeover, /className="hv-call-x" aria-label="close" onClick=\{closeCall\}/, "the x closes it");
assert.match(takeover, /role="dialog" aria-modal="true"/);
assert.match(code(home), /inert=\{callOpen \|\| undefined\}/, "nothing behind it reachable");
// The same order and the same links inside: Stu's line, then the card (start.tsx begin, JoinCard as tested above).
assert.ok(takeover.indexOf("<Said />") < takeover.indexOf('{stage === "signup" && <JoinCard idPrefix="call" />}'), "her words, then the card");
// The scroll lock, run against a stand-in window: locked where it is, the body's own styles back, the same place.
{
  const { lockScroll, unlockScroll, CALL_HASH, CALL_FACTS_LEFT, CALL_FACTS_RIGHT } = await import("../components/home-v3/call-lock.ts");
  assert.equal(CALL_HASH, "#stu");
  const style = () => ({ position: "", top: "", left: "", right: "", width: "", overflow: "" });
  const win = { scrollY: 1234, scrolled: null, scrollTo(o) { this.scrolled = o; }, document: { body: { style: { ...style(), position: "relative" } }, documentElement: { style: style() } } };
  const lock = lockScroll(win);
  const b = win.document.body.style;
  assert.deepEqual([b.position, b.top, b.width, b.overflow, win.document.documentElement.style.overflow], ["fixed", "-1234px", "100%", "hidden", "hidden"], "locked: pinned where it was, nothing scrolls");
  win.scrollY = 0;
  unlockScroll(win, lock);
  assert.deepEqual([b.position, b.top, b.width, b.overflow, win.document.documentElement.style.overflow], ["relative", "", "", "", ""], "unlocked: the body's own styles back");
  assert.deepEqual(win.scrolled, { top: 1234, left: 0, behavior: "instant" }, "back at the same scroll position, at once");
  // Pranav's lobby facts (career-agent d596ce92 app/components/voice/Lobby.tsx), word for word, his icons
  assert.deepEqual(CALL_FACTS_LEFT.map((f) => [f.title, f.sub]), [["About 10 minutes", "One conversation with Stu"], ["Mostly about the role you want", "What you're after, and why"]]);
  assert.deepEqual(CALL_FACTS_RIGHT.map((f) => [f.title, f.sub]), [["Your resume handy", "As a PDF, you'll drop it in"], ["A quiet spot", "Headphones help"]]);
}
assert.match(takeover, /clock: LuClockIcon,\s*target: LuTargetIcon,\s*file: LuFileTextIcon,\s*volume: LuVolume2Icon,/, "his icons (lucide clock, target, file-text, volume-2)");
const icons = read("icons.tsx");
assert.match(icons, /export const LuClockIcon[\s\S]*?<circle cx="12" cy="12" r="10" \/>\s*<polyline points="12 6 12 12 16 14" \/>/);
assert.match(icons, /export const LuVolume2Icon[\s\S]*?<path d="M16 9a5 5 0 0 1 0 6" \/>/);
// no icon pack on the homepage: it would land in the route studojo.com shares
for (const f of files) assert.doesNotMatch(read(f), /from "react-icons/, `${f}: imports react-icons`);
// The tiles show from the first moment (outside the stage's conditions): two each side on a desktop, 2 by 2 below on a phone.
const body = takeover.slice(takeover.indexOf('<div className="hv-call-body">'));
for (const side of ["left", "right", "below"]) assert.match(body, new RegExp(`^        <CallFacts side="${side}" />$`, "m"), `the ${side} tiles, always`);
assert.match(css, /\.hv2 \.hv-cfacts-below \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/, "a 2 by 2 grid on a phone");
assert.match(css, /@media \(min-width: 1024px\) \{[\s\S]*?\.hv2 \.hv-cfacts-below \{ display: none; \}[\s\S]*?\.hv2 \.hv-cfacts-left, \.hv2 \.hv-cfacts-right \{ display: grid;/, "either side of Stu on a desktop");
assert.match(css, /\.hv2 \.hv-call \{ position: fixed; inset: 0; z-index: 90; height: 100vh; height: 100dvh;[^}]*overflow: hidden;/, "a full-screen layer");

// ---------- 6. Stu: the logo's head, the purple disc only behind ?stu=circle ----------
assert.match(home, /new URLSearchParams\(search\)\.get\("stu"\) === "circle"/);
assert.match(home, /className=\{`hv2 hv-page\$\{circle \? " hv-stu-circle" : ""\}`\}/);
assert.match(css, /\.hv2 \.hv-stu-art \.hv-disc, \.hv2 \.hv-stu-art \.hv-glow \{ display: none; \}/, "no disc, no glow by default");
for (const rule of css.match(/[^{}]+\{[^{}]*\}/g) ?? []) {
  const [sel, body] = [rule.slice(0, rule.indexOf("{")).trim(), rule.slice(rule.indexOf("{"))];
  if (/#6e4b8e/i.test(body) || (/display:\s*block/.test(body) && /\.hv-(disc|glow)\b/.test(sel))) {
    for (const part of sel.split(",")) assert.match(part.trim(), /^\.hv2\.hv-stu-circle /, `purple outside ?stu=circle: ${part.trim()}`);
  }
}
const art = code(read("StuArt.tsx"));
assert.match(art, /`\/stu\/agent\/head-\$\{f\}\.png`/, "the cleaned logo heads");
for (const f of ["laugh", "sparkle", "curious", "grin", "happy"]) assert.ok(readdirSync(new URL("../../public/stu/agent/", import.meta.url)).includes(`head-${f}.png`), `head-${f}.png`);

// ---------- 6b. signed in, "sign out" beside "my jobs" (owner, 27 Oct) ----------
// Someone on a shared device leaves this account from the homepage itself, with the site header's clean-up, and the
// homepage comes back signed out. Signed out there is no "sign out", only "sign in".
{
  const hdr = code(read("HomeHeader.tsx"));
  const signedInPart = hdr.slice(hdr.indexOf("{signedIn ? ("), hdr.indexOf(") : (", hdr.indexOf("{signedIn ? (")));
  const signedOutPart = hdr.slice(hdr.indexOf(") : (", hdr.indexOf("{signedIn ? (")), hdr.indexOf("</header>"));
  assert.match(signedInPart, /<a className="hv-signin" href=\{STU_HOME\}>\s*My jobs\s*<\/a>\s*<button type="button" className="hv-signout" onClick=\{signOut\}/, "sign out right after my jobs");
  assert.match(signedInPart, /\{leaving \? "Signing out" : "Sign out"\}/);
  assert.doesNotMatch(signedOutPart, /signOut|sign out/i, "signed out: no sign out");
  assert.match(signedOutPart, /<Link className="hv-signin" to=\{SIGN_IN\}>\s*Sign in\s*<\/Link>/);
  const out = hdr.slice(hdr.indexOf("const signOut = () => {"), hdr.indexOf("return (", hdr.indexOf("const signOut = () => {")));
  assert.match(out, /authClient\.signOut\(\{[\s\S]*?onSuccess: \(\) => \{\s*useOutreachStore\.getState\(\)\.resetFunnel\(\);\s*clearTokenCache\(\);\s*resetPostHog\(\);[\s\S]*?navigate\("\/"\);/, "the site header's clean-up, then the homepage");
  assert.match(code(read("../site-b2c/SiteHeader.tsx")), /useOutreachStore\.getState\(\)\.resetFunnel\(\);\s*clearTokenCache\(\);\s*resetPostHog\(\);\s*navigate\("\/"\);/, "the same steps as the site header");
  assert.match(css, /\.hv2 \.hv-signout \{/);
}

// ---------- 7. studojo.com cannot change ----------
// The homepage renders only behind the B2C host gate (b2c-home.test.mjs: never on studojo.com) and the HOME_V3 switch,
// with HOMEPAGE V2 in its place when the switch is off, and its CSS cannot reach any other page: every rule, each
// comma part, sits under .hv2, which only HomeV3 (or HomeV2, never both in one deployment) renders.
const index = readFileSync(new URL("../routes/_index.tsx", import.meta.url), "utf8");
assert.match(index, /^import \{ HomeV3 \} from "~\/components\/home-v3\/HomeV3";$/m);
assert.equal((index.match(/<HomeV3 \/>/g) ?? []).length, 1);
assert.match(index, /if \(b2cHome && homeV3\) return <HomeV3 \/>;\s*if \(b2cHome\) return <HomeV2 \/>;/, "V3 behind the host gate and the switch, V2 otherwise");
const b2cBranch = index.slice(index.indexOf("if (isB2cRequest(request)) {"), index.indexOf("\n  }\n", index.indexOf("if (isB2cRequest(request)) {")));
assert.match(b2cBranch, /homeV3: process\.env\.HOME_V3 === "1",/, "the switch is read on the server, in the B2C branch only");
// The undo knob: the staging deploy sets HOME_V3 from the repository variable, on by default; production never does.
const workflows = new URL("../../.github/workflows/", import.meta.url);
assert.match(readFileSync(new URL("deploy-staging.yml", workflows), "utf8"), /kubectl set env deployment\/\$\{\{ env\.APP_NAME \}\} -c \$\{\{ env\.APP_NAME \}\} -n \$\{\{ env\.NAMESPACE \}\} \\\n\s+HOME_V3="\$\{\{ vars\.HOME_V3 \|\| '1' \}\}"/);
assert.doesNotMatch(readFileSync(new URL("deploy.yml", workflows), "utf8"), /HOME_V3/, "studojo.com's deploy never sets HOME_V3");
for (const rule of css.replace(/@font-face\s*\{[^}]*\}/g, "").replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "").match(/(^|[{}])\s*([^{}@]+)\{/g) ?? []) {
  const sel = rule.replace(/^[{}]?\s*/, "").replace(/\{$/, "").trim();
  if (!sel) continue;
  for (const part of sel.split(",")) assert.match(part.trim(), /^\.hv2([\s.:#[]|$)/, `home-v3.css: unscoped selector "${part.trim()}"`);
}
for (const f of files.filter((f) => f.endsWith(".tsx") && f !== "HomeV3.tsx")) assert.doesNotMatch(read(f), /className="hv2[ "]/, `${f}: a second .hv2 root`);
assert.doesNotMatch(css, /@import|:root\b|(^|[\s,}])(html|body)\b/m, "nothing global");

console.log("home-v3: ok");
