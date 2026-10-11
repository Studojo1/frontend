/**
 * The swipe brain behind /start: an adaptive deck that learns who the student
 * is from which real roles they keep or pass.
 *
 * Every role is described by its traits (kind of work, specialty, what the
 * day-to-day task is, industry, staying vs moving, pay, length, startup vs
 * big company, whether it uses their skills). Each swipe updates a Beta estimate per trait value, weighted by
 * how decisive it was (a "love", a fast swipe). The next card is never
 * pre-set: early cards spread across kinds of work; after that each card is a
 * deliberate probe that holds what they like fixed and changes one thing
 * ("would you move for this?", "does pay matter?") or tests the trait we know
 * least about. Quick this-or-that questions are mixed in; their answers seed
 * the beliefs and retire the probes they settle. A surprise ("not this one",
 * when we were sure) gets one "what put you off?", a love gets "what did
 * it?", and when an answer and the swipes disagree the deck asks once which
 * is right. It stops when it is confident, then says what it learned in
 * plain words, with evidence, and ranks the roles they haven't seen.
 *
 * Pure functions: the page and the tests share every rule.
 */

import { clusterOf, parseStipend, type Cluster } from "./swipe-prefs";

export type BrainRole = {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string | null;
  stipend: string;
  duration: string;
  slug: string;
  cluster: Cluster;
  monthly: number | null;
  focus: string;
  months: number | null;
  big: boolean;
  skills: string[];
  /** What the day-to-day work is: from the listing, or the typical work for this specialty. */
  task: string;
  /** True when `task` is the typical work for the specialty, not from the listing. */
  typical: boolean;
  /** The kind of task: building, numbers, people… */
  does: string;
  /** Industry, or "other" when we can't tell. */
  domain: string;
};

export type Verdict = "like" | "pass" | "love";
/** Role facts that are only shown on a card when that card is testing them. */
export type Shown = "place" | "company" | "length" | "domain";
/**
 * One decision. `shows` lists the facts that were visible on the card; the
 * brain learns location, company type and length only from cards that showed
 * them (undefined means everything was shown, as in older callers and tests).
 */
export type Swipe = { id: string; verdict: Verdict; ms: number; shows?: Shown[] };
const SHOWN_DIMS: Record<Shown, Dim[]> = { place: ["place", "city"], company: ["company"], length: ["length"], domain: ["domain"] };
// Always on the card: the title, specialty, what the work is, whether it uses their skills.
const ALWAYS: Dim[] = ["cluster", "focus", "does", "fit"];
const visibleDims = (s: Swipe): Set<Dim> =>
  new Set<Dim>(s.shows ? [...ALWAYS, ...s.shows.flatMap((x) => SHOWN_DIMS[x])] : (Object.keys(SHOWN_DIMS).flatMap((x) => SHOWN_DIMS[x as Shown]) as Dim[]).concat([...ALWAYS, "pay"]));
export type Ctx = { homeCity: string | null; skills: string[] };

export type Dim = "cluster" | "focus" | "does" | "domain" | "place" | "city" | "pay" | "length" | "company" | "fit";
// Pay is not shown on role cards (stipends in listings mislead), so it carries no
// weight here: pay is learned only from the direct questions below.
const DIM_WEIGHT: Record<Dim, number> = { cluster: 1.4, focus: 0.6, does: 0.7, domain: 0.6, place: 0.9, city: 0.5, pay: 0, length: 0.4, company: 0.5, fit: 0.6 };

// ── Role features ────────────────────────────────────────────────────────────

const FOCUS: [string, RegExp][] = [
  ["Data science", /data scien|machine learning|\bml\b|\bai\b/i],
  ["Product analytics", /product analy/i],
  ["Business analytics", /business analy|\bbi\b|business intelligence/i],
  ["Data analytics", /data analy|analytics/i],
  ["Research", /research/i],
  ["Product management", /product manag|\bapm\b/i],
  ["Frontend", /front[- ]?end|ui developer|react/i],
  ["Backend", /back[- ]?end|\bsde\b|software/i],
  ["UI/UX", /ui|ux|product design/i],
  ["Growth", /growth|performance/i],
  ["Brand", /brand|social media|content market/i],
  ["Investment banking", /investment bank|\bib\b|m&a/i],
  ["Finance", /financ|account|treasury/i],
  ["Strategy", /strategy|consult/i],
  ["Sales & BD", /sales|business develop|partnership/i],
  ["Operations", /operations|supply chain|logistics/i],
  ["People", /\bhr\b|talent|recruit|people/i],
  ["Writing", /writ|content|copy|editor/i],
];
export function focusOf(title: string): string {
  for (const [f, re] of FOCUS) if (re.test(title)) return f;
  return clusterOf(title);
}

// The kind of task, across kinds of work: a growth analyst and a data analyst
// both work with numbers; sales and HR both work with people.
const DOES: [string, RegExp][] = [
  ["build", /developer|software develop|web develop|app develop|engineer|\bsde\b|software|front[- ]?end|back[- ]?end|full[- ]?stack|\bcode|coding|programm/i],
  ["design", /design|\bui\b|\bux\b|visual|illustrat/i],
  ["research", /research|survey|insight|interview/i],
  ["numbers", /analy|data|\bsql\b|\bbi\b|dashboard|metric|model|financ|valuation|account|treasury|fp&a/i],
  ["words", /writ|content|copy|editor|social media|brand|storytell/i],
  ["people", /sales|business develop|partnership|client|customer|\bhr\b|recruit|talent|community|account manag/i],
  ["process", /operations|\bops\b|supply chain|logistics|program|coordinat|dark store/i],
  ["strategy", /strategy|consult|product manag|\bapm\b/i],
];
export const DOES_LABEL: Record<string, string> = {
  build: "building things", design: "designing", research: "research", numbers: "working with numbers and data",
  words: "writing and storytelling", people: "working with people", process: "running operations", strategy: "solving business problems",
};
export function doesOf(title: string, text = ""): string {
  for (const [d, re] of DOES) if (re.test(title)) return d;
  for (const [d, re] of DOES) if (re.test(text)) return d;
  return "other";
}

// Industry, from the company we know or words in the listing.
const DOMAIN: [string, RegExp][] = [
  ["Fintech", /razorpay|\bcred\b|zerodha|groww|jupiter|phonepe|paytm|revolut|avendus|kotak|hdfc|icici|goldman|jp ?morgan|morgan stanley|\bciti|barclays|fintech|payments?|banking|trading|lending|insurance|invest/i],
  ["Food & delivery", /swiggy|zomato|chai point|dunzo|food|restaurant/i],
  ["E-commerce & retail", /flipkart|meesho|myntra|zepto|blinkit|amazon|nykaa|lenskart|\bboat\b|d2c|e-?commerce|retail|marketplace|quick commerce/i],
  ["Mobility", /\bola\b|uber|careem|grab|rapido|mobility|ride[- ]?hail/i],
  ["Software & SaaS", /atlassian|postman|freshworks|google|microsoft|salesforce|saas|b2b software|developer tools|cloud/i],
  ["Education", /unacademy|byju|upgrad|edtech|education|learning platform/i],
  ["Consulting & research", /bain|bcg|mckinsey|deloitte|kpmg|pwc|\bey\b|kantar|tracxn|fractal|consult|market research/i],
  ["Media & entertainment", /\bmedia\b|entertainment|gaming|music|\bott\b|publishing|film/i],
  ["Health", /health|pharma|medical|hospital|fitness|wellness/i],
  ["Home services", /urban company|home services/i],
];
export function domainOf(company: string, text = ""): string {
  for (const [d, re] of DOMAIN) if (re.test(company)) return d;
  for (const [d, re] of DOMAIN) if (re.test(text)) return d;
  return "other";
}

// When a listing doesn't say what the work is, the typical work for its specialty.
const TYPICAL: Record<string, string> = {
  "Data science": "Build and test models on real data, then explain what they found.",
  "Product analytics": "Dig into how people use the product and tell the team what to change.",
  "Business analytics": "Turn business data into dashboards and answers for managers.",
  "Data analytics": "Pull data with SQL or Excel and turn it into clear answers.",
  Research: "Research markets and companies and write up what you find.",
  "Product management": "Work out what to build next with designers and engineers, and keep it on track.",
  Frontend: "Build the screens people use, in code.",
  Backend: "Write the code and services that run behind the product.",
  "UI/UX": "Design screens and flows, and test them with real users.",
  Growth: "Run experiments to bring in and keep users, and measure what worked.",
  Brand: "Plan and make posts, campaigns and content for the brand.",
  "Investment banking": "Build financial models and pitch decks for deals.",
  Finance: "Work on budgets, numbers and reports with the finance team.",
  Strategy: "Break down a business problem, analyse it and present a recommendation.",
  "Sales & BD": "Find and talk to potential clients and partners, and close deals.",
  Operations: "Keep day-to-day operations running and fix what slows them down.",
  People: "Help hire people and look after the team.",
  Writing: "Write articles, scripts or copy, and edit them until they land.",
};
/** One sentence of what the work is: the listing's own words when it has enough of them. */
export function taskOf(focus: string, cluster: string, description = ""): { task: string; typical: boolean } {
  const text = description.replace(/\s+/g, " ").trim();
  const first = text.split(/(?<=[.!?])\s+|\s*[•\n]\s*/).map((x) => x.replace(/^(about the role|responsibilities|what you('|’)ll do)\s*:?\s*/i, "").trim()).find((x) => x.length >= 30);
  if (first) return { task: first.length > 140 ? `${first.slice(0, 137).replace(/\s+\S*$/, "")}…` : first, typical: false };
  return { task: TYPICAL[focus] ?? TYPICAL[cluster] ?? `Hands-on ${cluster.toLowerCase()} work with the team.`, typical: true };
}

export function monthsOf(duration: string): number | null {
  const m = (duration ?? "").toLowerCase().match(/(\d+(?:\.\d+)?)\s*(month|mo|week|wk)/);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2].startsWith("w") ? Math.max(1, Math.round(n / 4)) : n;
}

// Large, well-known employers (India and global). Everything else reads as a startup / smaller company.
const BIG = /\b(google|microsoft|amazon|apple|meta|atlassian|adobe|salesforce|oracle|ibm|accenture|deloitte|kpmg|pwc|ey|ernst|mckinsey|bain|bcg|boston consulting|goldman|jp ?morgan|morgan stanley|citi|hsbc|barclays|tcs|infosys|wipro|hcl|tech mahindra|flipkart|swiggy|zomato|ola|paytm|phonepe|myntra|freshworks|byju|unacademy|reliance|tata|mahindra|hdfc|icici|axis|kotak|uber|airbnb|netflix|spotify|walmart|unilever|hul|p&g|procter|nestle|loreal|samsung|intel|nvidia|cisco|careem|grab|avendus|fractal|lenskart|nykaa|meesho|razorpay|cred|zerodha|groww|urban company|postman|boat)\b/i;
export function isBig(company: string): boolean {
  return BIG.test(company);
}

const CLUSTER_SKILLS: Partial<Record<Cluster, string[]>> = {
  Analytics: ["sql", "excel", "python", "tableau", "power bi", "statistics", "r", "looker", "data analysis"],
  Product: ["sql", "figma", "a/b testing", "excel", "product management", "mixpanel"],
  Engineering: ["python", "java", "javascript", "typescript", "react", "node.js", "c++", "go", "sql", "git"],
  Design: ["figma", "photoshop", "illustrator", "canva", "ui/ux"],
  Marketing: ["seo", "google analytics", "social media", "canva", "content writing", "digital marketing", "excel"],
  Finance: ["excel", "financial modelling", "financial modeling", "valuation", "accounting"],
  Consulting: ["excel", "market research", "public speaking", "powerpoint"],
  Content: ["content writing", "copywriting", "canva", "seo"],
};

/** Resume skills this role would use. */
export function skillHits(role: Pick<BrainRole, "cluster" | "skills">, skills: string[]): string[] {
  const want = new Set([...(CLUSTER_SKILLS[role.cluster] ?? []), ...role.skills.map((s) => s.toLowerCase())]);
  return skills.filter((s) => want.has(s.toLowerCase())).slice(0, 3);
}

export function features(r: BrainRole, ctx: Ctx): Record<Dim, string> {
  return {
    cluster: r.cluster,
    focus: r.focus,
    place: !r.city ? "remote" : ctx.homeCity && r.city === ctx.homeCity ? "home" : "move",
    city: r.city ?? "Remote",
    pay: r.monthly === null ? "unstated" : r.monthly < 15000 ? "low" : r.monthly < 35000 ? "mid" : "high",
    length: r.months === null ? "unknown" : r.months <= 3 ? "short" : "long",
    company: r.big ? "big" : "startup",
    fit: skillHits(r, ctx.skills).length ? "fit" : "stretch",
    does: r.does,
    domain: r.domain,
  };
}

/** Build a BrainRole from a raw internship row. */
export function toBrainRole(
  r: { id: string; title: string; company: string; location: string; stipend: string; duration: string; slug: string; requirements?: string | null; description?: string | null },
  city: string | null,
  skillsIn: (text: string) => string[],
): BrainRole {
  const cluster = clusterOf(r.title), focus = focusOf(r.title);
  const text = `${r.description ?? ""}\n${r.requirements ?? ""}`;
  return {
    id: r.id, title: r.title, company: r.company, location: r.location, city, stipend: r.stipend, duration: r.duration, slug: r.slug,
    cluster, monthly: parseStipend(r.stipend), focus, months: monthsOf(r.duration),
    big: isBig(r.company), skills: skillsIn(`${r.title}\n${text}`).slice(0, 8),
    ...taskOf(focus, cluster, r.description ?? ""),
    does: doesOf(`${r.title} ${focus}`, text), domain: domainOf(r.company, text),
  };
}

// ── Belief state ─────────────────────────────────────────────────────────────

type Beta = { a: number; b: number };
export type Belief = Record<Dim, Map<string, Beta>>;

export function weightOf(s: Swipe): number {
  const base = s.verdict === "love" ? 2 : 1;
  const speed = s.ms < 1500 ? 1.3 : s.ms > 6000 ? 0.7 : 1;
  return base * speed;
}

/** The company-type answer that stands: a "which is it?" check overrides the first answer. */
function stageAnswer(a: Answers): Side | undefined {
  return a["check:company"] ?? a.stage;
}
function lengthAnswer(a: Answers): Side | undefined {
  return a["check:length"] ?? a.length;
}

/**
 * What they told us, as a head start on the beliefs: an answer counts like a
 * couple of decisive swipes, so the swipes can still overrule it.
 */
function seed(belief: Belief, a: Answers) {
  const add = (d: Dim, v: string, yes: number, no = 0) => {
    const cur = belief[d].get(v) ?? { a: 1, b: 1 };
    cur.a += yes; cur.b += no;
    belief[d].set(v, cur);
  };
  const stage = stageAnswer(a);
  if (stage === "left") { add("company", "big", 2); add("company", "startup", 0, 1); }
  if (stage === "right") { add("company", "startup", 2); add("company", "big", 0, 1); }
  if (a.mode === "right") add("place", "remote", 2);
  if (a.mode === "left") add("place", "remote", 0, 1);
  const len = lengthAnswer(a);
  if (len === "left") { add("length", "short", 2); add("length", "long", 0, 1); }
  if (len === "right") { add("length", "long", 2); add("length", "short", 0, 1); }
  if (a.move_any === "left") add("place", "move", 0, 3);
  if (a.move_any === "right") add("place", "move", 2);
  for (const [k, v] of Object.entries(a)) {
    if (!k.startsWith("city:")) continue;
    if (v === "right") add("city", k.slice(5), 2);
    if (v === "left") add("city", k.slice(5), 0, 2);
  }
}

// What a "why" answer says a decision was about.
const WORK_DIMS: Dim[] = ["cluster", "focus", "does", "fit"];
const COMPANY_DIMS: Dim[] = ["company", "domain"];

export function believe(pool: BrainRole[], swipes: Swipe[], ctx: Ctx, answers: Answers = {}): Belief {
  const byId = new Map(pool.map((r) => [r.id, r]));
  const belief = Object.fromEntries((Object.keys(DIM_WEIGHT) as Dim[]).map((d) => [d, new Map<string, Beta>()])) as Belief;
  seed(belief, answers);
  for (const s of swipes) {
    const r = byId.get(s.id);
    if (!r) continue;
    // "What put you off?" / "What did it?": the decision was about the work, or
    // the company, or (for "just this one") not much at all. "The company"
    // shields the work from blame; company type and industry still only count
    // when the card showed them.
    const off = answers[`why:${s.id}`], wow = answers[`wow:${s.id}`];
    const why = off ?? (wow === "either" ? undefined : wow);
    const w = weightOf(s) * (off === "either" ? 0.3 : 1);
    const f = features(r, ctx);
    const seenDims = visibleDims(s);
    const about = why === "left" ? WORK_DIMS : why === "right" ? COMPANY_DIMS : null;
    // An unknown industry or kind of task teaches nothing.
    const dims = (Object.keys(f) as Dim[]).filter((d) => seenDims.has(d) && f[d] !== "other" && (!about || about.includes(d)));
    // A pass is blamed mostly on traits we already know they dislike (moving,
    // low pay…), so one known deal-breaker doesn't sink everything else on the card.
    const dislike = dims.map((d) => 1 - mean(belief[d].get(f[d])));
    const avg = dislike.reduce((a, b) => a + b, 0) / dims.length;
    dims.forEach((d, i) => {
      const cur = belief[d].get(f[d]) ?? { a: 1, b: 1 };
      if (s.verdict === "pass") cur.b += w * Math.max(0.3, Math.min(1.6, dislike[i] / avg));
      else cur.a += w;
      belief[d].set(f[d], cur);
    });
  }
  return belief;
}

const mean = (x: Beta | undefined) => (x ? x.a / (x.a + x.b) : 0.5);
const seen = (x: Beta | undefined) => (x ? x.a + x.b - 2 : 0);
const logit = (p: number) => Math.log(p / (1 - p));

/** Probability they'd keep this role, from what they've kept and passed. */
export function predict(r: BrainRole, belief: Belief, ctx: Ctx): number {
  const f = features(r, ctx);
  let z = 0;
  for (const d of Object.keys(f) as Dim[]) z += DIM_WEIGHT[d] * logit(mean(belief[d].get(f[d])));
  return 1 / (1 + Math.exp(-z));
}

/** How much each trait separates what they keep from what they pass (0-1). */
export function importance(belief: Belief): { dim: Dim; spread: number }[] {
  return (["cluster", "place", "pay", "company", "length", "fit"] as Dim[])
    .map((d) => {
      const vals = [...belief[d].values()].filter((x) => seen(x) >= 1).map(mean);
      return { dim: d, spread: vals.length >= 2 ? Math.max(...vals) - Math.min(...vals) : 0 };
    })
    .sort((a, b) => b.spread - a.spread);
}

/** How sure we are about the traits that matter most, 0-1. */
export function confidence(belief: Belief, swipes: Swipe[]): number {
  const n = swipes.reduce((s, x) => s + weightOf(x), 0);
  const decided = (d: Dim) => {
    const vals = [...belief[d].values()];
    const strong = vals.some((x) => seen(x) >= 2 && (mean(x) >= 0.72 || mean(x) <= 0.28));
    const flat = vals.filter((x) => seen(x) >= 2).length >= 2 && Math.max(...vals.map(mean)) - Math.min(...vals.map(mean)) < 0.15;
    return strong || flat;
  };
  const c = Math.min(0.55, n * 0.05) + (decided("cluster") ? 0.18 : 0) + (decided("place") ? 0.12 : 0) + (decided("pay") ? 0.1 : 0) + (decided("company") ? 0.05 : 0);
  return Math.min(0.98, c);
}

// ── Choosing the next card ───────────────────────────────────────────────────

export type CardPick = { role: BrainRole; probe: string; reason: string; shows: Shown[] };

/** Which role facts a card shows: only the one its probe is about. */
function showsFor(probe: string): Shown[] {
  if (probe === "relocate" || probe === "remote" || probe === "gain:place" || probe === "retest:place") return ["place"];
  if (probe === "company" || probe === "gain:company" || probe === "retest:company") return ["company"];
  if (probe === "length" || probe === "gain:length") return ["length"];
  if (probe === "industry" || probe === "gain:domain") return ["domain"];
  return [];
}

const ADJACENT: Partial<Record<Cluster, Cluster[]>> = {
  Analytics: ["Product", "Finance", "Consulting"],
  Product: ["Analytics", "Design", "Engineering"],
  Engineering: ["Product", "Analytics"],
  Design: ["Product", "Marketing"],
  Marketing: ["Content", "Sales", "Product"],
  Finance: ["Consulting", "Analytics"],
  Consulting: ["Finance", "Analytics", "Operations"],
  Sales: ["Marketing", "Operations"],
  Content: ["Marketing", "Design"],
  Operations: ["Consulting", "Analytics"],
  HR: ["Operations"],
};

export const MIN_SWIPES = 14;
export const MAX_SWIPES = 22;

/** The next card to show, or null when we've learned enough (or run out). */
export type DeckOpts = {
  /** They said they won't move: no roles that need moving, no relocation probes. */
  noMove?: boolean;
  /** "Doesn't look like you? Continue": extra role cards beyond the usual stop. */
  extra?: number;
  /** Quick answers so far: they seed the beliefs and retire the probes they settle. */
  answers?: Answers;
};

export function nextCard(pool: BrainRole[], swipes: Swipe[], ctx: Ctx, usedProbes: string[] = [], opts: DeckOpts = {}): CardPick | null {
  const extra = opts.extra ?? 0;
  const answers = opts.answers ?? {};
  // A question they've answered doesn't come back as a card.
  const settled = {
    company: !!stageAnswer(answers) && stageAnswer(answers) !== "either",
    length: !!lengthAnswer(answers) && lengthAnswer(answers) !== "either",
    remote: !!answers.mode,
  };
  const shown = new Set(swipes.map((s) => s.id));
  const byId = new Map(pool.map((r) => [r.id, r]));
  const history = swipes.map((s) => byId.get(s.id)).filter((r): r is BrainRole => !!r);
  const lastCompany = history[history.length - 1]?.company.toLowerCase();
  const seenCompanies = new Set(history.map((r) => r.company.toLowerCase()));
  const left = pool.filter((r) => !shown.has(r.id) && !(opts.noMove && r.city && ctx.homeCity && r.city !== ctx.homeCity));
  if (!left.length || swipes.length >= MAX_SWIPES + extra) return null;
  const belief = believe(pool, swipes, ctx, answers);
  if (swipes.length >= MIN_SWIPES + extra && confidence(belief, swipes) >= 0.92) return null;

  const fresh = left.filter((r) => r.company.toLowerCase() !== lastCompany);
  const cand = fresh.length ? fresh : left;
  const f = (r: BrainRole) => features(r, ctx);
  const likedIds = new Set(swipes.filter((s) => s.verdict !== "pass").map((s) => s.id));
  const liked = history.filter((r) => likedIds.has(r.id));
  const n = swipes.length;

  // 1. Open with the role their resume fits best, near home: an easy yes builds trust.
  if (n === 0) {
    const first = [...cand].sort((a, b) => score0(b) - score0(a))[0];
    return { role: first, probe: "open", reason: `Starting with what your resume points to: ${first.cluster}.`, shows: [] };
  }
  function score0(r: BrainRole) {
    const x = f(r);
    return skillHits(r, ctx.skills).length * 1.5 + (x.place === "home" ? 1 : 0) - (seenCompanies.has(r.company.toLowerCase()) ? 1 : 0);
  }

  // 2. Spread across kinds of work until we've seen four.
  const seenClusters = new Set(history.map((r) => r.cluster));
  if (n < 4) {
    const other = cand.filter((r) => !seenClusters.has(r.cluster));
    if (other.length) {
      const pick = [...other].sort((a, b) => skillHits(b, ctx.skills).length - skillHits(a, ctx.skills).length)[0];
      return { role: pick, probe: `explore:${pick.cluster}`, reason: `Exploring: is ${pick.cluster} for you?`, shows: [] };
    }
  }

  // 3a. One pass on the kind of work their resume points to isn't a verdict:
  // show it once more with the thing most likely to have put them off changed.
  const resumeCluster = [...pool].sort((a, b) => skillHits(b, ctx.skills).length - skillHits(a, ctx.skills).length)[0]?.cluster;
  const rc = resumeCluster ? belief.cluster.get(resumeCluster) : undefined;
  if (resumeCluster && rc && rc.a === 1 && rc.b > 1 && rc.b < 3 && !usedProbes.includes(`retest:${resumeCluster}`)) {
    const before = history.find((r) => r.cluster === resumeCluster)!;
    const fb = f(before);
    const alt = cand.filter((r) => r.cluster === resumeCluster && (f(r).place !== fb.place || f(r).company !== fb.company));
    if (alt.length) {
      const pick = alt.sort((a, b) => predict(b, belief, ctx) - predict(a, belief, ctx))[0];
      const fp = f(pick);
      const change = fp.place !== fb.place ? (fp.place === "home" ? "this one's near you" : fp.place === "remote" ? "this one's remote" : `this one's in ${pick.city}`) : pick.big ? "this one's a big company" : "this one's a startup";
      return { role: pick, probe: `retest:${resumeCluster}`, reason: `Giving ${resumeCluster} another look: ${change}.`, shows: showsFor(fp.place !== fb.place ? "retest:place" : "retest:company") };
    }
  }

  // 3b. Probes around what they like: change one thing, keep the rest like
  // what they kept, so the answer is about that one thing.
  const ref = liked[liked.length - 1];
  const likeness = (r: BrainRole) => {
    if (!ref) return 0;
    const a = f(r), b = f(ref);
    return (["fit", "length", "company"] as Dim[]).filter((d) => a[d] === b[d]).length;
  };
  const seenFocus = new Set(history.map((r) => r.focus));
  const seenDomains = new Set(history.map((r) => r.domain));
  const lead = [...belief.cluster.entries()].filter(([, b]) => seen(b) >= 1 && mean(b) > 0.55).sort((a, b) => mean(b[1]) - mean(a[1]))[0]?.[0] as Cluster | undefined;
  const used = new Set(usedProbes);
  const probes: { id: string; match: (r: BrainRole) => boolean; reason: (r: BrainRole) => string }[] = lead
    ? [
        ...(opts.noMove ? [] : [{ id: "relocate", match: (r: BrainRole) => r.cluster === lead && f(r).place === "move", reason: (r: BrainRole) => `Would you move to ${r.city} for ${lead}?` }]),
        { id: "specialty", match: (r: BrainRole) => r.cluster === lead && r.focus !== lead && !seenFocus.has(r.focus), reason: (r: BrainRole) => `Inside ${lead}: ${/[A-Z]{2}/.test(r.focus) ? r.focus : r.focus.toLowerCase()} this time.` },
        ...(settled.company ? [] : [{ id: "company", match: (r: BrainRole) => r.cluster === lead && liked.length > 0 && f(r).company !== f(liked[liked.length - 1]).company, reason: (r: BrainRole) => (r.big ? "A big name this time. Does that pull you?" : "A smaller company this time. Startup or big name?") }]),
        { id: "industry", match: (r) => r.cluster === lead && r.domain !== "other" && !seenDomains.has(r.domain) && liked.some((l) => l.domain !== "other"), reason: (r) => `${lead}, but in ${r.domain.toLowerCase()}. Does the industry matter to you?` },
        { id: "adjacent", match: (r) => (ADJACENT[lead] ?? []).includes(r.cluster) && !liked.some((l) => l.cluster === r.cluster), reason: (r) => `Next door to ${lead}: ${r.cluster}. Open to it?` },
        ...(settled.length ? [] : [{ id: "length", match: (r: BrainRole) => r.cluster === lead && liked.length > 0 && f(r).length !== f(liked[liked.length - 1]).length && f(r).length !== "unknown", reason: (r: BrainRole) => (f(r).length === "short" ? "A short one. Would a 2-3 month internship work?" : "A long one. Up for 6 months?") }]),
        ...(settled.remote ? [] : [{ id: "remote", match: (r: BrainRole) => f(r).place === "remote" && (r.cluster === lead || (ADJACENT[lead] ?? []).includes(r.cluster)), reason: () => "This one's remote. Does that appeal?" }]),
        { id: "stretch", match: (r) => f(r).fit === "stretch" && r.cluster !== lead, reason: (r) => `A stretch beyond your resume: ${r.cluster}.` },
        // A second specialty once the first round of probes is done.
        { id: "specialty2", match: (r) => r.cluster === lead && r.focus !== lead && !seenFocus.has(r.focus), reason: (r) => `One more kind of ${lead}: ${/[A-Z]{2}/.test(r.focus) ? r.focus : r.focus.toLowerCase()}.` },
      ]
    : [];
  for (const p of probes) {
    if (used.has(p.id)) continue;
    const hits = cand.filter(p.match);
    if (hits.length) {
      const pick = hits.sort((a, b) => likeness(b) - likeness(a) || predict(b, belief, ctx) - predict(a, belief, ctx))[0];
      return { role: pick, probe: p.id, reason: p.reason(pick), shows: showsFor(p.id) };
    }
  }

  // 4. Three passes in a row: show something we expect them to like.
  const lastThree = swipes.slice(-3);
  if (lastThree.length === 3 && lastThree.every((s) => s.verdict === "pass")) {
    const pick = [...cand].sort((a, b) => predict(b, belief, ctx) - predict(a, belief, ctx))[0];
    return { role: pick, probe: "confirm", reason: "Based on what you kept, this should fit.", shows: [] };
  }

  // 5. Otherwise the card that teaches us most: uncertain traits, likely enough to be worth asking.
  const gain = (r: BrainRole) => {
    const x = f(r);
    let g = 0;
    for (const d of ["cluster", "does", "place", "company", "length", "domain", "fit"] as Dim[]) if (x[d] !== "other") g += DIM_WEIGHT[d] / (1 + seen(belief[d].get(x[d])));
    const p = predict(r, belief, ctx);
    return g * (0.4 + p) - (seenCompanies.has(r.company.toLowerCase()) ? 0.5 : 0);
  };
  const pick = [...cand].sort((a, b) => gain(b) - gain(a))[0];
  const x = f(pick);
  // Never the same kind of check more than twice: once a trait has had two
  // check cards it is settled as far as the deck is concerned.
  const uses = (d: string) => usedProbes.filter((p) => p === `gain:${d}`).length;
  const open = (["place", "company", "length", "domain"] as Dim[]).filter((d) => uses(d) < 2 && !(d === "place" && opts.noMove) && !(d === "company" && settled.company) && !(d === "length" && settled.length) && !(d === "domain" && x.domain === "other"));
  const least = open.sort((a, b) => seen(belief[a].get(x[a])) - seen(belief[b].get(x[b])))[0] ?? "fit";
  const why: Record<string, string> = {
    place: x.place === "home" ? `Checking: ${/^[AEIOU]/.test(pick.cluster) ? "an" : "a"} ${pick.cluster} role near you.` : x.place === "remote" ? "Checking: how you feel about remote." : `Checking: would you move to ${pick.city}?`,
    company: pick.big ? "Checking: big names vs smaller companies." : "Checking: smaller companies vs big names.",
    length: "Checking: how long you want to intern.",
    domain: `Checking: does ${x.domain.toLowerCase()} interest you?`,
    fit: "Checking: another one close to what you kept.",
  };
  return { role: pick, probe: `gain:${least}`, reason: why[least], shows: showsFor(`gain:${least}`) };
}

// ── What we learned ──────────────────────────────────────────────────────────

export type Insight = { kind: "work" | "place" | "pay" | "length" | "company" | "fit" | "speed" | "avoid" | "values" | "plan"; text: string; evidence: string };

const LABEL: Record<Dim, string> = { cluster: "kind of work", focus: "specialty", does: "kind of task", domain: "industry", place: "location", city: "city", pay: "pay", length: "length", company: "company type", fit: "using your skills" };

export type Learned = {
  insights: Insight[];
  /** Traits in the order they drive decisions. */
  matters: string[];
  clusters: string[];
  avoid: string[];
  cities: string[];
  minMonthly: number | null;
  titles: string[];
  companyStage: "Big company" | "Growing startup" | "Early-stage startup" | "No preference" | null;
  /** From the quick cards, in the words the /app chat uses, so it can skip those questions. */
  workMode: string | null;
  startWhen: string | null;
  dreamCompanies: string[];
  /** Industries they keep choosing, strongest first. */
  domains: string[];
  /** The kinds of task they keep choosing, e.g. "working with numbers and data". */
  workStyle: string[];
  best: { role: BrainRole; match: number }[];
  fitCount: number;
};

export function learn(pool: BrainRole[], swipes: Swipe[], ctx: Ctx, answers: Answers = {}): Learned {
  const byId = new Map(pool.map((r) => [r.id, r]));
  const belief = believe(pool, swipes, ctx, answers);
  const rows = swipes.map((s) => ({ s, r: byId.get(s.id)!, f: features(byId.get(s.id)!, ctx), vis: visibleDims(s) })).filter((x) => x.r);
  const kept = rows.filter((x) => x.s.verdict !== "pass");
  const passed = rows.filter((x) => x.s.verdict === "pass");
  // Location, company type and length count only on cards that showed them.
  const count = (list: typeof rows, d: Dim, v: string) => list.filter((x) => x.vis.has(d) && x.f[d] === v).length;
  const insights: Insight[] = [];

  // Kind of work.
  const clusters = [...belief.cluster.entries()].filter(([, b]) => seen(b) >= 1 && mean(b) > 0.55).sort((a, b) => mean(b[1]) - mean(a[1])).map(([c]) => c);
  if (clusters.length) {
    const top = clusters[0];
    const shown = count(rows, "cluster", top), keptN = count(kept, "cluster", top);
    const loved = kept.some((x) => x.s.verdict === "love" && x.r.cluster === top);
    insights.push({ kind: "work", text: `You're drawn to ${clusters.slice(0, 2).join(" and ")}${loved ? ", and you loved one" : ""}.`, evidence: `kept ${keptN} of ${shown} ${top} roles` });
    const focuses = [...new Set(kept.filter((x) => x.r.cluster === top).map((x) => x.r.focus))].filter((f) => f !== top);
    if (focuses.length) insights.push({ kind: "work", text: `Especially ${focuses.slice(0, 2).map((x) => (/[A-Z]{2}/.test(x) ? x : x.toLowerCase())).join(" and ")}.`, evidence: [...new Set(kept.filter((x) => focuses.includes(x.r.focus)).map((x) => `${x.r.title} at ${x.r.company}`))].slice(0, 2).join(", ") });
  }
  const avoid = [...belief.cluster.entries()].filter(([c, b]) => b.b - 1 >= 1.5 && b.a - 1 === 0 && !clusters.includes(c)).map(([c]) => c);
  if (avoid.length) insights.push({ kind: "avoid", text: `Not for you: ${avoid.slice(0, 3).join(", ")}.`, evidence: `passed every one` });

  // Location.
  // Judge moving only on roles they'd otherwise take (their kind of work, a stated
  // stipend), so a pass for low pay isn't read as "won't move".
  const fair = (x: (typeof rows)[number]) => (!clusters.length || clusters.includes(x.r.cluster)) && x.f.pay !== "low" && x.f.pay !== "unstated";
  const movedKept = kept.filter((x) => x.vis.has("place") && x.f.place === "move"), movedPassed = passed.filter((x) => x.vis.has("place") && x.f.place === "move" && fair(x));
  const homeKept = kept.filter((x) => x.vis.has("place") && x.f.place === "home");
  // When they answered "would you move at all?", that answer speaks for itself.
  if (!answers.move_any) {
    if (movedKept.length) insights.push({ kind: "place", text: "You'd move for the right role.", evidence: `kept roles in ${[...new Set(movedKept.map((x) => x.r.city))].slice(0, 3).join(", ")}` });
    else if (movedPassed.length >= 2 && homeKept.length) insights.push({ kind: "place", text: `You'd rather stay in ${ctx.homeCity}.`, evidence: `passed ${movedPassed.length} roles that meant moving` });
  }
  if (count(kept, "place", "remote")) insights.push({ kind: "place", text: "Open to remote work.", evidence: "kept a remote role" });

  // Pay comes only from the direct questions (stipends aren't shown on cards).
  let minMonthly: number | null = null;

  // Length.
  const longK = count(kept, "length", "long"), shortK = count(kept, "length", "short"), longP = count(passed, "length", "long"), shortP = count(passed, "length", "short");
  if (lengthAnswer(answers)) { /* their answer speaks for itself (quick findings) */ }
  else if (longK >= 2 && shortP >= 1 && !shortK) insights.push({ kind: "length", text: "You want a longer internship, around 6 months.", evidence: `kept ${longK} long ones, passed ${shortP} short` });
  else if (shortK >= 2 && longP >= 1 && !longK) insights.push({ kind: "length", text: "You'd rather keep it short, 2 to 3 months.", evidence: `kept ${shortK} short ones` });

  // Company type.
  const big = belief.company.get("big"), small = belief.company.get("startup");
  let companyStage: Learned["companyStage"] = null;
  // Raw keep rates, not just the model: both sides need real evidence.
  const rate = (v: string) => { const n = count(rows, "company", v); return n ? count(kept, "company", v) / n : 0; };
  const gap = rate("big") - rate("startup");
  if (!stageAnswer(answers) && seen(big) >= 2 && seen(small) >= 2 && Math.abs(gap) >= 0.3 && count(kept, "company", gap > 0 ? "big" : "startup") >= 2) {
    if (gap > 0) { companyStage = "Big company"; insights.push({ kind: "company", text: "Big names pull you.", evidence: `kept ${count(kept, "company", "big")} of ${count(rows, "company", "big")} at large companies` }); }
    else { companyStage = "Growing startup"; insights.push({ kind: "company", text: "You lean towards startups.", evidence: `kept ${count(kept, "company", "startup")} of ${count(rows, "company", "startup")} at smaller companies` }); }
  }

  // Using their skills.
  const stretchK = kept.filter((x) => x.f.fit === "stretch");
  if (stretchK.length) insights.push({ kind: "fit", text: "You're open to a stretch beyond your resume.", evidence: `kept ${stretchK[0].r.title}` });
  else if (count(passed, "fit", "stretch") >= 2 && count(kept, "fit", "fit") >= 1) insights.push({ kind: "fit", text: "You stick to roles that use your skills.", evidence: `passed ${count(passed, "fit", "stretch")} that didn't` });

  // The kind of task, across kinds of work: what they keep vs what they pass.
  const doesRate = new Map<string, { k: number; n: number }>();
  for (const x of rows) {
    if (x.f.does === "other" || answers[`why:${x.s.id}`] === "right" || answers[`why:${x.s.id}`] === "either") continue;
    const c = doesRate.get(x.f.does) ?? { k: 0, n: 0 };
    c.n++; if (x.s.verdict !== "pass") c.k++;
    doesRate.set(x.f.does, c);
  }
  const doesRanked = [...doesRate.entries()].filter(([, c]) => c.n >= 2).map(([d, c]) => ({ d, rate: c.k / c.n, ...c })).sort((a, b) => b.rate - a.rate || b.k - a.k);
  const doesTop = doesRanked[0], doesLow = doesRanked[doesRanked.length - 1];
  const workStyle = doesRanked.filter((x) => x.rate >= 0.6 && x.k >= 2).map((x) => DOES_LABEL[x.d]);
  if (doesTop && doesTop.rate >= 0.6 && doesTop.k >= 2) {
    const low = doesLow && doesLow !== doesTop && doesLow.rate <= 0.25 ? doesLow : null;
    insights.push({ kind: "work", text: `You're happiest ${DOES_LABEL[doesTop.d]}${low ? `, less so ${DOES_LABEL[low.d]}` : ""}.`, evidence: `kept ${doesTop.k} of ${doesTop.n} roles like that${low ? `, passed ${low.n - low.k} of ${low.n} ${DOES_LABEL[low.d]}` : ""}` });
  }

  // Industry: only from cards that showed it, or companies they kept.
  const domRate = new Map<string, { k: number; n: number; cos: string[] }>();
  for (const x of rows) {
    if (x.f.domain === "other" || !x.vis.has("domain")) continue;
    const c = domRate.get(x.f.domain) ?? { k: 0, n: 0, cos: [] };
    c.n++; if (x.s.verdict !== "pass") { c.k++; c.cos.push(x.r.company); }
    domRate.set(x.f.domain, c);
  }
  const domains = [...domRate.entries()].filter(([, c]) => c.k >= 2 && c.k / c.n >= 0.6).sort((a, b) => b[1].k - a[1].k).map(([d]) => d);
  if (domains.length) {
    const c = domRate.get(domains[0])!;
    insights.push({ kind: "company", text: `${domains[0]} pulls you${domains[1] ? `, and ${domains[1].toLowerCase()}` : ""}.`, evidence: `kept ${[...new Set(c.cos)].slice(0, 3).join(", ")}` });
  }

  // "What put you off?": the work, or the company.
  const offCompany = rows.filter((x) => answers[`why:${x.s.id}`] === "right");
  const offWork = rows.filter((x) => answers[`why:${x.s.id}`] === "left");
  if (offCompany.length) insights.push({ kind: "fit", text: `${offCompany.length > 1 ? "Some companies" : `${offCompany[0].r.company}`} put you off, not the work: ${[...new Set(offCompany.map((x) => x.r.cluster))].join(" and ")} is still in.`, evidence: `passed ${offCompany.map((x) => x.r.title).slice(0, 2).join(", ")} for the company` });
  if (offWork.length && !offCompany.length) insights.push({ kind: "avoid", text: `${offWork.map((x) => x.r.title.replace(/\s*intern(ship)?$/i, "")).slice(0, 2).join(" and ")}: not the work for you.`, evidence: "you said it was the work itself" });

  // Speed: the kind of work they said yes to fastest.
  const fast = new Map<string, number[]>();
  for (const x of kept) fast.set(x.r.cluster, [...(fast.get(x.r.cluster) ?? []), x.s.ms]);
  const fastest = [...fast.entries()].map(([c, ms]) => ({ c, avg: ms.reduce((a, b) => a + b, 0) / ms.length })).sort((a, b) => a.avg - b.avg)[0];
  if (fastest && fastest.avg < 2500 && kept.length >= 2) insights.push({ kind: "speed", text: `You said yes fastest to ${fastest.c} roles.`, evidence: `about ${(fastest.avg / 1000).toFixed(1)}s each, a strong signal` });

  // Quick this-or-that cards.
  const q = quickFindings(answers, ctx, byId);
  insights.push(...q.insights);
  if (!companyStage && q.companyStage) companyStage = q.companyStage;
  minMonthly = q.minMonthly;

  const matters = importance(belief).filter((x) => x.spread >= 0.2).map((x) => LABEL[x.dim]);
  // Best matches never break a hard no: a city they turned down, moving when
  // they won't, work they always pass, a company that put them off, a stipend
  // below their floor.
  const offCos = new Set(offCompany.map((x) => x.r.company.toLowerCase()));
  const unseen = pool.filter((r) => !swipes.some((s) => s.id === r.id) && !avoid.includes(r.cluster) && !offCos.has(r.company.toLowerCase())
    && !(r.city && q.citiesNo.includes(r.city)) && !(q.noMove && r.city && ctx.homeCity && r.city !== ctx.homeCity)
    && !(minMonthly && r.monthly !== null && r.monthly < minMonthly) && !(answers.mode === "left" && !r.city));
  const scored = unseen.map((role) => ({ role, match: predict(role, belief, ctx) })).sort((a, b) => b.match - a.match);
  // Cities: where kept roles are, plus "yes, I'd move there" cards, minus "no" cards.
  const cities = [...new Set([...kept.filter((x) => x.vis.has("place")).map((x) => x.r.city).filter((c): c is string => !!c), ...q.citiesYes])].filter((c) => !q.citiesNo.includes(c) && !(q.noMove && c !== ctx.homeCity));
  if (ctx.homeCity && !cities.includes(ctx.homeCity) && !q.citiesNo.includes(ctx.homeCity) && !(movedPassed.length === 0 && movedKept.length > 0 && homeKept.length === 0)) cities.unshift(ctx.homeCity);

  return {
    insights,
    matters,
    clusters,
    avoid,
    cities,
    minMonthly,
    titles: [...new Set(kept.map((x) => x.r.title))].slice(0, 6),
    companyStage,
    workMode: q.workMode,
    startWhen: q.startWhen,
    dreamCompanies: q.dreamCompanies,
    domains,
    workStyle,
    best: scored.slice(0, 3),
    fitCount: pool.filter((r) => predict(r, belief, ctx) >= 0.5).length,
  };
}


// ── Quick this-or-that cards ─────────────────────────────────────────────────
//
// Mixed into the deck between role cards to learn what roles alone can't
// show: how they want to work, when they can start, what they value. Left
// and right are the two options (↑ means "either is fine"); city cards ask
// "would you move to X?" for places with open roles they haven't judged yet.

export type Side = "left" | "right" | "either";
export type Answers = Record<string, Side>;
export type Quick = {
  id: string;
  kind: "quick" | "city" | "dream";
  label: string;
  question: string;
  left: string;
  right: string;
  either?: string;
  city?: string;
  count?: number;
  /** Asked straight after the answer or swipe that opened it. */
  follow?: boolean;
};

type Ask = Quick & {
  /** Only ask when this holds (follow-ups). */
  when?: (a: Answers, l: Learned | null, ctx: Ctx) => boolean;
  /** Follow-ups jump the queue so the conversation stays on topic. */
  followUp?: boolean;
};

const QUICK: Ask[] = [
  // Follow-ups first: asked right after the answer that opened them.
  { id: "move_any", kind: "quick", label: "moving", question: "Are you open to moving cities at all?", left: "No, I'd rather stay", right: "Yes, for the right role", either: "It depends on the role", followUp: true,
    when: (a) => Object.entries(a).some(([k, v]) => k.startsWith("city:") && v === "left") },
  { id: "pay_floor", kind: "quick", label: "stipend", question: "What's the least you'd take a month?", left: "₹15k is fine", right: "At least ₹30k", either: "Somewhere in between", followUp: true,
    when: (a) => a.pay_matters === "right" },
  { id: "learn_pay", kind: "quick", label: "a trade-off", question: "Then which offer would you take?", left: "₹40k a month, routine work", right: "₹15k a month, building with the founders", followUp: true,
    when: (a) => a.pay_matters === "either" },
  // The rest, once each.
  { id: "stage", kind: "quick", label: "what kind of place", question: "Where would you rather start?", left: "A big company: structure, a known name", right: "An early startup: more ownership, more chaos", either: "No preference", when: (_a, l) => !l?.companyStage },
  { id: "pay_matters", kind: "quick", label: "stipend", question: "Does the stipend decide it for you?", left: "No, the work matters more", right: "Yes, it has to pay well", either: "It depends on the role" },
  { id: "mode", kind: "quick", label: "how you work", question: "Where do you want to work from?", left: "In the office, with the team", right: "Remote, from anywhere", either: "Hybrid works best" },
  { id: "start", kind: "quick", label: "timing", question: "When could you start?", left: "Right away", right: "In a few months", either: "Just exploring for now" },
  { id: "brand_work", kind: "quick", when: (a) => stageAnswer(a) !== "left" && stageAnswer(a) !== "right", label: "what matters more", question: "Which matters more to you?", left: "A famous company name on my resume", right: "The work I'd actually be doing" },
  { id: "mentor", kind: "quick", label: "how you learn", question: "You learn best…", left: "Figuring things out myself", right: "With a mentor checking in" },
  { id: "outcome", kind: "quick", label: "the goal", question: "What do you want out of this internship?", left: "A full-time offer at the end", right: "Experience, then something new", either: "Either is fine" },
  { id: "length", kind: "quick", label: "length", question: "How long would you intern?", left: "2 to 3 months", right: "6 months or more", either: "Depends on the role", when: (_a, l) => !l?.insights.some((i) => i.kind === "length") },
];

function quickFindings(a: Answers, ctx: Ctx, byId: Map<string, BrainRole> = new Map()) {
  const insights: Insight[] = [];
  let companyStage: Learned["companyStage"] = null, workMode: string | null = null, startWhen: string | null = null;
  const citiesYes: string[] = [], citiesNo: string[] = [], dreamCompanies: string[] = [];
  const said = (id: string, l: string, r: string, e = "either") => (a[id] === "left" ? l : a[id] === "right" ? r : e);
  const stage = stageAnswer(a);
  if (stage) {
    companyStage = stage === "left" ? "Big company" : stage === "right" ? "Early-stage startup" : "No preference";
    if (a["check:company"]) insights.push({ kind: "company", text: stage === "left" ? "Big names win you over, whatever you said at first." : stage === "right" ? "Startups it is, even though big names caught your eye." : "Company size doesn't decide it for you.", evidence: `said ${a.stage === "right" ? "startups" : "big companies"} first, then your swipes leaned the other way` });
    else if (stage !== "either") insights.push({ kind: "company", text: stage === "left" ? "You want structure and a known name." : "You want ownership, even if it's chaotic.", evidence: `picked "${said("stage", "a big company", "an early startup")}"` });
  }
  const len = lengthAnswer(a);
  if (len && len !== "either") insights.push({ kind: "length", text: len === "left" ? "You'd rather keep it short, 2 to 3 months." : "You want a longer internship, 6 months or more.", evidence: a["check:length"] ? "your swipes made you think again" : "you said so" });
  let minMonthly: number | null = null;
  if (a.pay_matters === "left") insights.push({ kind: "pay", text: "The work matters more to you than the stipend.", evidence: "you said so" });
  if (a.pay_matters === "right") {
    minMonthly = a.pay_floor === "right" ? 30000 : a.pay_floor === "either" ? 20000 : a.pay_floor === "left" ? 15000 : null;
    insights.push({ kind: "pay", text: "Pay matters to you.", evidence: minMonthly ? `at least ₹${minMonthly / 1000}k a month` : "you said so" });
  }
  if (a.pay_matters === "either") insights.push({ kind: "pay", text: "Pay depends on the role for you.", evidence: "you said it depends" });
  if (a.learn_pay && a.learn_pay !== "either") insights.push({ kind: "values", text: a.learn_pay === "right" ? "You'd take learning over a bigger stipend." : "A stronger stipend beats a scrappy setup for you.", evidence: `picked ${said("learn_pay", "₹40k routine work", "₹15k with the founders")}` });
  if (a.mode) {
    workMode = a.mode === "left" ? "In the office" : a.mode === "right" ? "Remote" : "Hybrid";
    insights.push({ kind: "plan", text: a.mode === "left" ? "You want to be in the office with the team." : a.mode === "right" ? "You'd rather work remotely." : "Hybrid suits you best.", evidence: "from your this-or-that" });
  }
  if (a.start) {
    startWhen = a.start === "left" ? "Right away" : a.start === "right" ? "Next semester" : "Just exploring";
    insights.push({ kind: "plan", text: a.start === "left" ? "You can start right away." : a.start === "right" ? "You're planning for a few months out." : "You're exploring for now, no rush.", evidence: "from your this-or-that" });
  }
  if (a.brand_work && a.brand_work !== "either") insights.push({ kind: "values", text: a.brand_work === "right" ? "The work matters more to you than the logo." : "A known company name matters to you.", evidence: `picked ${said("brand_work", "the company name", "the work itself")}` });
  if (a.mentor && a.mentor !== "either") insights.push({ kind: "values", text: a.mentor === "right" ? "You want a mentor, not to be thrown in the deep end." : "You like figuring things out on your own.", evidence: "from your this-or-that" });
  if (a.outcome && a.outcome !== "either") insights.push({ kind: "plan", text: a.outcome === "left" ? "You're after a full-time offer." : "You want the experience, then to move on.", evidence: "from your this-or-that" });
  for (const [id, side] of Object.entries(a)) {
    if (!id.startsWith("city:")) continue;
    const c = id.slice(5);
    if (side === "right") citiesYes.push(c);
    if (side === "left") citiesNo.push(c);
  }
  for (const [id, side] of Object.entries(a)) if (id.startsWith("dream:") && side === "right") dreamCompanies.push(id.slice(6));
  // "You loved it. What did it?" "The company": that's a dream company too.
  for (const [id, side] of Object.entries(a)) {
    const co = id.startsWith("wow:") && side === "right" ? byId.get(id.slice(4))?.company : undefined;
    if (co && !dreamCompanies.includes(co)) dreamCompanies.push(co);
  }
  if (dreamCompanies.length) insights.push({ kind: "values", text: `Dream companies: ${dreamCompanies.slice(0, 3).join(", ")}.`, evidence: "you said yes when we asked" });
  if (citiesYes.length) insights.push({ kind: "place", text: `You'd move to ${citiesYes.slice(0, 3).join(", ")}.`, evidence: "said yes when we asked" });
  const noMove = a.move_any === "left";
  if (a.move_any) insights.push({ kind: "place", text: noMove ? `You'd rather stay${ctx.homeCity ? ` in ${ctx.homeCity}` : ""}.` : a.move_any === "right" ? "You'd move for the right role." : "Moving depends on the role for you.", evidence: citiesNo.length ? `said no to ${citiesNo[0]}, then ${noMove ? "no to moving at all" : a.move_any === "right" ? "yes to moving in general" : "it depends"}` : "you said so" });
  return { insights, companyStage, workMode, startWhen, citiesYes, citiesNo, dreamCompanies, minMonthly, noMove };
}

/** The next quick card worth asking, or null. */
export function nextQuick(pool: BrainRole[], swipes: Swipe[], answers: Answers, ctx: Ctx): Quick | null {
  const learned = swipes.length ? learn(pool, swipes, ctx, answers) : null;
  // City cards: busy places they haven't judged through a kept role or a card.
  const byId = new Map(pool.map((r) => [r.id, r]));
  const judged = new Set(swipes.filter((s) => s.verdict !== "pass").map((s) => byId.get(s.id)?.city).filter(Boolean) as string[]);
  const counts = new Map<string, number>();
  for (const r of pool) if (r.city && r.city !== ctx.homeCity) counts.set(r.city, (counts.get(r.city) ?? 0) + 1);
  // Cities: one at a time. A "no" opens "would you move at all?" and ends city
  // questions; a "yes" allows one more city, never more than two.
  const cityAnswers = Object.entries(answers).filter(([k]) => k.startsWith("city:"));
  const cityDone = !!answers.move_any || cityAnswers.some(([, v]) => v === "left") || cityAnswers.length >= 2;
  const city = cityDone ? undefined : [...counts.entries()].filter(([c, n]) => n >= 2 && !judged.has(c) && !(`city:${c}` in answers)).sort((a, b) => b[1] - a[1])[0];
  const asked = Object.keys(answers).length;
  const cityTurn = asked % 3 === 2; // every third quick card is a city
  const due = QUICK.filter((q) => !(q.id in answers) && (q.when ? q.when(answers, learned, ctx) : true));
  const follow = due.find((q) => q.followUp);
  if (follow) { const { when: _w, followUp: _f, ...q } = follow; return { ...q, follow: true }; }
  const reaction = reactionCheck(pool, swipes, answers, ctx);
  if (reaction) return reaction;
  const clash = clashCheck(pool, swipes, answers);
  if (clash) return clash;
  const general = due.find((q) => !q.followUp);
  if (city && (cityTurn || !general)) {
    return { id: `city:${city[0]}`, kind: "city", label: "where you'd work", question: `Would you move to ${city[0]}?`, left: "No, not for now", right: "Yes, I'd move", city: city[0], count: city[1] };
  }
  // Dream companies: ask about the companies behind roles they kept, a few at most.
  const keptCos = [...new Set(swipes.filter((s) => s.verdict !== "pass").map((s) => byId.get(s.id)?.company).filter(Boolean) as string[])];
  const dreamAsked = Object.keys(answers).filter((k) => k.startsWith("dream:")).length;
  const offCos = new Set(swipes.filter((x) => answers[`why:${x.id}`] === "right").map((x) => byId.get(x.id)?.company));
  const dreamAlready = new Set(Object.entries(answers).filter(([k, v]) => k.startsWith("wow:") && v === "right").map(([k]) => byId.get(k.slice(4))?.company));
  const dream = keptCos.find((c) => !(`dream:${c}` in answers) && !dreamAlready.has(c) && !offCos.has(c));
  if (dream && dreamAsked < 3 && asked % 4 === 3) {
    return { id: `dream:${dream}`, kind: "dream", label: "dream companies", question: `Is ${dream} a dream company for you?`, left: "Not really", right: "Yes, I'd love to work there" };
  }
  if (general) { const { when: _w, followUp: _f, ...q } = general; return q; }
  if (dream && dreamAsked < 3) return { id: `dream:${dream}`, kind: "dream", label: "dream companies", question: `Is ${dream} a dream company for you?`, left: "Not really", right: "Yes, I'd love to work there" };
  return null;
}

/**
 * Straight after a surprising swipe: a pass on a role we were sure about gets
 * "what put you off?" (twice at most), a love gets "what did it?" (once).
 */
function reactionCheck(pool: BrainRole[], swipes: Swipe[], answers: Answers, ctx: Ctx): Quick | null {
  const last = swipes[swipes.length - 1];
  const r = last && pool.find((x) => x.id === last.id);
  if (!last || !r || swipes.length < 4) return null;
  const asked = (pre: string) => Object.keys(answers).filter((k) => k.startsWith(pre)).length;
  const name = `${r.title.replace(/\s*intern(ship)?$/i, "")} at ${r.company}`;
  if (last.verdict === "love" && !(`wow:${r.id}` in answers) && asked("wow:") < 1) {
    return { id: `wow:${r.id}`, kind: "quick", label: "you loved that one", question: `You loved ${name}. What did it?`, left: "The work itself", right: `${r.company} itself`, either: "Both", follow: true };
  }
  if (last.verdict === "pass" && !(`why:${r.id}` in answers) && asked("why:") < 2) {
    // A surprise: their kind of work is already a yes, and we expected a keep.
    const before = believe(pool, swipes.slice(0, -1), ctx, answers);
    const work = before.cluster.get(r.cluster);
    if (work && seen(work) >= 1 && mean(work) >= 0.6 && predict(r, before, ctx) >= 0.65) {
      return { id: `why:${r.id}`, kind: "quick", label: "help us read that", question: `${name} looked like your kind of role. What put you off?`, left: "The work itself", right: `${r.company} as a company`, either: "Just not this one", follow: true };
    }
  }
  return null;
}

/**
 * When an answer and the swipes disagree ("early startup", then three big
 * names kept), ask once which is right. The answer replaces the first one.
 */
function clashCheck(pool: BrainRole[], swipes: Swipe[], answers: Answers): Quick | null {
  const byId = new Map(pool.map((r) => [r.id, r]));
  const kept = swipes.filter((x) => x.verdict !== "pass");
  const keptShowing = (fact: Shown, test: (r: BrainRole) => boolean) =>
    kept.filter((x) => (!x.shows || x.shows.includes(fact)) && byId.get(x.id) && test(byId.get(x.id)!)).map((x) => byId.get(x.id)!);
  if ((answers.stage === "left" || answers.stage === "right") && !("check:company" in answers)) {
    const big = keptShowing("company", (r) => r.big), small = keptShowing("company", (r) => !r.big);
    const [other, none] = answers.stage === "right" ? [big, small] : [small, big];
    if (other.length >= 2 && none.length === 0) {
      return { id: "check:company", kind: "quick", label: "which is it?", question: `You said ${answers.stage === "right" ? "an early startup" : "a big company"}, but you kept ${other.slice(0, 2).map((r) => r.company).join(" and ")}. Which is closer?`, left: "Big names, actually", right: "Startups, still", either: "Size doesn't matter to me", follow: true };
    }
  }
  if ((answers.length === "left" || answers.length === "right") && !("check:length" in answers)) {
    const long = keptShowing("length", (r) => (r.months ?? 0) > 3), short = keptShowing("length", (r) => r.months !== null && r.months <= 3);
    const [other, none] = answers.length === "left" ? [long, short] : [short, long];
    if (other.length >= 2 && none.length === 0) {
      return { id: "check:length", kind: "quick", label: "which is it?", question: `You said ${answers.length === "left" ? "2 to 3 months" : "6 months or more"}, but you kept ${other.length} ${answers.length === "left" ? "longer" : "shorter"} ones. Which is closer?`, left: "2 to 3 months", right: "6 months or more", either: "Depends on the role", follow: true };
    }
  }
  return null;
}

export type Item = { kind: "role"; pick: CardPick } | { kind: "quick"; quick: Quick };

/**
 * The deck: role cards, with a quick card after every two of them, until
 * both the roles and the quick questions have nothing left to teach.
 */
export function nextItem(pool: BrainRole[], swipes: Swipe[], answers: Answers, ctx: Ctx, usedProbes: string[], lastWasQuick: boolean, rolesSinceQuick: number, extra = 0): Item | null {
  // A follow-up comes straight after the answer that opened it ("no" to Mumbai →
  // "would you move at all?"); otherwise a question after every two roles, then
  // after every role, so questions are spread through the deck.
  const q0 = nextQuick(pool, swipes, answers, ctx);
  const isFollow = !!q0?.follow;
  const gap = swipes.length >= 8 ? 1 : 2;
  if (q0 && (isFollow || (!lastWasQuick && rolesSinceQuick >= gap && swipes.length >= 2))) return { kind: "quick", quick: q0 };
  const pick = nextCard(pool, swipes, ctx, usedProbes, { noMove: answers.move_any === "left", extra, answers });
  if (pick) return { kind: "role", pick };
  const q = nextQuick(pool, swipes, answers, ctx);
  return q ? { kind: "quick", quick: q } : null;
}
