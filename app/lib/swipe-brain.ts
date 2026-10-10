/**
 * The swipe brain behind /start: an adaptive deck that learns who the student
 * is from which real roles they keep or pass.
 *
 * Every role is described by seven traits (kind of work, specialty, staying
 * vs moving, pay, length, startup vs big company, whether it uses their
 * skills). Each swipe updates a Beta estimate per trait value, weighted by
 * how decisive it was (a "love", a fast swipe). The next card is never
 * pre-set: early cards spread across kinds of work; after that each card is a
 * deliberate probe that holds what they like fixed and changes one thing
 * ("would you move for this?", "does pay matter?") or tests the trait we know
 * least about. It stops when it is confident, then says what it learned in
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
};

export type Verdict = "like" | "pass" | "love";
/** Role facts that are only shown on a card when that card is testing them. */
export type Shown = "place" | "company" | "length";
/**
 * One decision. `shows` lists the facts that were visible on the card; the
 * brain learns location, company type and length only from cards that showed
 * them (undefined means everything was shown, as in older callers and tests).
 */
export type Swipe = { id: string; verdict: Verdict; ms: number; shows?: Shown[] };
const SHOWN_DIMS: Record<Shown, Dim[]> = { place: ["place", "city"], company: ["company"], length: ["length"] };
const visibleDims = (s: Swipe): Set<Dim> =>
  new Set<Dim>(s.shows ? ["cluster", "focus", "fit", ...s.shows.flatMap((x) => SHOWN_DIMS[x])] : (Object.keys(SHOWN_DIMS).flatMap((x) => SHOWN_DIMS[x as Shown]) as Dim[]).concat(["cluster", "focus", "fit", "pay"]));
export type Ctx = { homeCity: string | null; skills: string[] };

export type Dim = "cluster" | "focus" | "place" | "city" | "pay" | "length" | "company" | "fit";
// Pay is not shown on role cards (stipends in listings mislead), so it carries no
// weight here: pay is learned only from the direct questions below.
const DIM_WEIGHT: Record<Dim, number> = { cluster: 1.4, focus: 0.6, place: 0.9, city: 0.5, pay: 0, length: 0.4, company: 0.5, fit: 0.6 };

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
  };
}

/** Build a BrainRole from a raw internship row. */
export function toBrainRole(
  r: { id: string; title: string; company: string; location: string; stipend: string; duration: string; slug: string; requirements?: string | null; description?: string | null },
  city: string | null,
  skillsIn: (text: string) => string[],
): BrainRole {
  return {
    id: r.id, title: r.title, company: r.company, location: r.location, city, stipend: r.stipend, duration: r.duration, slug: r.slug,
    cluster: clusterOf(r.title), monthly: parseStipend(r.stipend), focus: focusOf(r.title), months: monthsOf(r.duration),
    big: isBig(r.company), skills: skillsIn(`${r.title}\n${r.requirements ?? ""}\n${r.description ?? ""}`).slice(0, 8),
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

export function believe(pool: BrainRole[], swipes: Swipe[], ctx: Ctx): Belief {
  const byId = new Map(pool.map((r) => [r.id, r]));
  const belief = Object.fromEntries((Object.keys(DIM_WEIGHT) as Dim[]).map((d) => [d, new Map<string, Beta>()])) as Belief;
  for (const s of swipes) {
    const r = byId.get(s.id);
    if (!r) continue;
    const w = weightOf(s);
    const f = features(r, ctx);
    const seenDims = visibleDims(s);
    const dims = (Object.keys(f) as Dim[]).filter((d) => seenDims.has(d));
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
};

export function nextCard(pool: BrainRole[], swipes: Swipe[], ctx: Ctx, usedProbes: string[] = [], opts: DeckOpts = {}): CardPick | null {
  const extra = opts.extra ?? 0;
  const shown = new Set(swipes.map((s) => s.id));
  const byId = new Map(pool.map((r) => [r.id, r]));
  const history = swipes.map((s) => byId.get(s.id)).filter((r): r is BrainRole => !!r);
  const lastCompany = history[history.length - 1]?.company.toLowerCase();
  const seenCompanies = new Set(history.map((r) => r.company.toLowerCase()));
  const left = pool.filter((r) => !shown.has(r.id) && !(opts.noMove && r.city && ctx.homeCity && r.city !== ctx.homeCity));
  if (!left.length || swipes.length >= MAX_SWIPES + extra) return null;
  const belief = believe(pool, swipes, ctx);
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
  const lead = [...belief.cluster.entries()].filter(([, b]) => seen(b) >= 1 && mean(b) > 0.55).sort((a, b) => mean(b[1]) - mean(a[1]))[0]?.[0] as Cluster | undefined;
  const used = new Set(usedProbes);
  const probes: { id: string; match: (r: BrainRole) => boolean; reason: (r: BrainRole) => string }[] = lead
    ? [
        ...(opts.noMove ? [] : [{ id: "relocate", match: (r: BrainRole) => r.cluster === lead && f(r).place === "move", reason: (r: BrainRole) => `Would you move to ${r.city} for ${lead}?` }]),
        { id: "company", match: (r) => r.cluster === lead && liked.length > 0 && f(r).company !== f(liked[liked.length - 1]).company, reason: (r) => (r.big ? "A big name this time. Does that pull you?" : "A smaller company this time. Startup or big name?") },
        { id: "adjacent", match: (r) => (ADJACENT[lead] ?? []).includes(r.cluster) && !liked.some((l) => l.cluster === r.cluster), reason: (r) => `Next door to ${lead}: ${r.cluster}. Open to it?` },
        { id: "length", match: (r) => r.cluster === lead && liked.length > 0 && f(r).length !== f(liked[liked.length - 1]).length && f(r).length !== "unknown", reason: (r) => (f(r).length === "short" ? "A short one. Would a 2-3 month internship work?" : "A long one. Up for 6 months?") },
        { id: "remote", match: (r) => f(r).place === "remote" && (r.cluster === lead || (ADJACENT[lead] ?? []).includes(r.cluster)), reason: () => "This one's remote. Does that appeal?" },
        { id: "stretch", match: (r) => f(r).fit === "stretch" && r.cluster !== lead, reason: (r) => `A stretch beyond your resume: ${r.cluster}.` },
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
    for (const d of ["cluster", "place", "company", "length", "fit"] as Dim[]) g += DIM_WEIGHT[d] / (1 + seen(belief[d].get(x[d])));
    const p = predict(r, belief, ctx);
    return g * (0.4 + p) - (seenCompanies.has(r.company.toLowerCase()) ? 0.5 : 0);
  };
  const pick = [...cand].sort((a, b) => gain(b) - gain(a))[0];
  const x = f(pick);
  // Never the same kind of check more than twice: once a trait has had two
  // check cards it is settled as far as the deck is concerned.
  const uses = (d: string) => usedProbes.filter((p) => p === `gain:${d}`).length;
  const open = (["place", "company", "length"] as Dim[]).filter((d) => uses(d) < 2 && !(d === "place" && opts.noMove));
  const least = open.sort((a, b) => seen(belief[a].get(x[a])) - seen(belief[b].get(x[b])))[0] ?? "fit";
  const why: Record<string, string> = {
    place: x.place === "home" ? `Checking: ${/^[AEIOU]/.test(pick.cluster) ? "an" : "a"} ${pick.cluster} role near you.` : x.place === "remote" ? "Checking: how you feel about remote." : `Checking: would you move to ${pick.city}?`,
    company: pick.big ? "Checking: big names vs smaller companies." : "Checking: smaller companies vs big names.",
    length: "Checking: how long you want to intern.",
    fit: "Checking: another one close to what you kept.",
  };
  return { role: pick, probe: `gain:${least}`, reason: why[least], shows: showsFor(`gain:${least}`) };
}

// ── What we learned ──────────────────────────────────────────────────────────

export type Insight = { kind: "work" | "place" | "pay" | "length" | "company" | "fit" | "speed" | "avoid" | "values" | "plan"; text: string; evidence: string };

const LABEL: Record<Dim, string> = { cluster: "kind of work", focus: "specialty", place: "location", city: "city", pay: "pay", length: "length", company: "company type", fit: "using your skills" };

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
  best: { role: BrainRole; match: number }[];
  fitCount: number;
};

export function learn(pool: BrainRole[], swipes: Swipe[], ctx: Ctx, answers: Answers = {}): Learned {
  const byId = new Map(pool.map((r) => [r.id, r]));
  const belief = believe(pool, swipes, ctx);
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
    if (focuses.length) insights.push({ kind: "work", text: `Especially ${focuses.slice(0, 2).map((x) => (/[A-Z]{2}/.test(x) ? x : x.toLowerCase())).join(" and ")}.`, evidence: kept.filter((x) => focuses.includes(x.r.focus)).map((x) => x.r.title).slice(0, 2).join(", ") });
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
  if (longK >= 2 && shortP >= 1 && !shortK) insights.push({ kind: "length", text: "You want a longer internship, around 6 months.", evidence: `kept ${longK} long ones, passed ${shortP} short` });
  else if (shortK >= 2 && longP >= 1 && !longK) insights.push({ kind: "length", text: "You'd rather keep it short, 2 to 3 months.", evidence: `kept ${shortK} short ones` });

  // Company type.
  const big = belief.company.get("big"), small = belief.company.get("startup");
  let companyStage: Learned["companyStage"] = null;
  // Raw keep rates, not just the model: both sides need real evidence.
  const rate = (v: string) => { const n = count(rows, "company", v); return n ? count(kept, "company", v) / n : 0; };
  const gap = rate("big") - rate("startup");
  if (seen(big) >= 2 && seen(small) >= 2 && Math.abs(gap) >= 0.3 && count(kept, "company", gap > 0 ? "big" : "startup") >= 2) {
    if (gap > 0) { companyStage = "Big company"; insights.push({ kind: "company", text: "Big names pull you.", evidence: `kept ${count(kept, "company", "big")} of ${count(rows, "company", "big")} at large companies` }); }
    else { companyStage = "Growing startup"; insights.push({ kind: "company", text: "You lean towards startups.", evidence: `kept ${count(kept, "company", "startup")} of ${count(rows, "company", "startup")} at smaller companies` }); }
  }

  // Using their skills.
  const stretchK = kept.filter((x) => x.f.fit === "stretch");
  if (stretchK.length) insights.push({ kind: "fit", text: "You're open to a stretch beyond your resume.", evidence: `kept ${stretchK[0].r.title}` });
  else if (count(passed, "fit", "stretch") >= 2 && count(kept, "fit", "fit") >= 1) insights.push({ kind: "fit", text: "You stick to roles that use your skills.", evidence: `passed ${count(passed, "fit", "stretch")} that didn't` });

  // Speed: the kind of work they said yes to fastest.
  const fast = new Map<string, number[]>();
  for (const x of kept) fast.set(x.r.cluster, [...(fast.get(x.r.cluster) ?? []), x.s.ms]);
  const fastest = [...fast.entries()].map(([c, ms]) => ({ c, avg: ms.reduce((a, b) => a + b, 0) / ms.length })).sort((a, b) => a.avg - b.avg)[0];
  if (fastest && fastest.avg < 2500 && kept.length >= 2) insights.push({ kind: "speed", text: `You said yes fastest to ${fastest.c} roles.`, evidence: `about ${(fastest.avg / 1000).toFixed(1)}s each, a strong signal` });

  // Quick this-or-that cards.
  const q = quickFindings(answers, ctx);
  insights.push(...q.insights);
  if (!companyStage && q.companyStage) companyStage = q.companyStage;
  minMonthly = q.minMonthly;

  const matters = importance(belief).filter((x) => x.spread >= 0.2).map((x) => LABEL[x.dim]);
  const unseen = pool.filter((r) => !swipes.some((s) => s.id === r.id));
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
  { id: "brand_work", kind: "quick", label: "what matters more", question: "Which matters more to you?", left: "A famous company name on my resume", right: "The work I'd actually be doing" },
  { id: "mentor", kind: "quick", label: "how you learn", question: "You learn best…", left: "Figuring things out myself", right: "With a mentor checking in" },
  { id: "outcome", kind: "quick", label: "the goal", question: "What do you want out of this internship?", left: "A full-time offer at the end", right: "Experience, then something new", either: "Either is fine" },
  { id: "length", kind: "quick", label: "length", question: "How long would you intern?", left: "2 to 3 months", right: "6 months or more", either: "Depends on the role", when: (_a, l) => !l?.insights.some((i) => i.kind === "length") },
];

function quickFindings(a: Answers, ctx: Ctx) {
  const insights: Insight[] = [];
  let companyStage: Learned["companyStage"] = null, workMode: string | null = null, startWhen: string | null = null;
  const citiesYes: string[] = [], citiesNo: string[] = [], dreamCompanies: string[] = [];
  const said = (id: string, l: string, r: string, e = "either") => (a[id] === "left" ? l : a[id] === "right" ? r : e);
  if (a.stage) {
    companyStage = a.stage === "left" ? "Big company" : a.stage === "right" ? "Early-stage startup" : "No preference";
    if (a.stage !== "either") insights.push({ kind: "company", text: a.stage === "left" ? "You want structure and a known name." : "You want ownership, even if it's chaotic.", evidence: `picked "${said("stage", "a big company", "an early startup")}"` });
  }
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
  if (follow) { const { when: _w, followUp: _f, ...q } = follow; return q; }
  const general = due.find((q) => !q.followUp);
  if (city && (cityTurn || !general)) {
    return { id: `city:${city[0]}`, kind: "city", label: "where you'd work", question: `Would you move to ${city[0]}?`, left: "No, not for now", right: "Yes, I'd move", city: city[0], count: city[1] };
  }
  // Dream companies: ask about the companies behind roles they kept, a few at most.
  const keptCos = [...new Set(swipes.filter((s) => s.verdict !== "pass").map((s) => byId.get(s.id)?.company).filter(Boolean) as string[])];
  const dreamAsked = Object.keys(answers).filter((k) => k.startsWith("dream:")).length;
  const dream = keptCos.find((c) => !(`dream:${c}` in answers));
  if (dream && dreamAsked < 3 && asked % 4 === 3) {
    return { id: `dream:${dream}`, kind: "dream", label: "dream companies", question: `Is ${dream} a dream company for you?`, left: "Not really", right: "Yes, I'd love to work there" };
  }
  if (general) { const { when: _w, followUp: _f, ...q } = general; return q; }
  if (dream && dreamAsked < 3) return { id: `dream:${dream}`, kind: "dream", label: "dream companies", question: `Is ${dream} a dream company for you?`, left: "Not really", right: "Yes, I'd love to work there" };
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
  const isFollow = !!q0 && QUICK.some((x) => x.id === q0.id && x.followUp);
  const gap = swipes.length >= 8 ? 1 : 2;
  if (q0 && (isFollow || (!lastWasQuick && rolesSinceQuick >= gap && swipes.length >= 2))) return { kind: "quick", quick: q0 };
  const pick = nextCard(pool, swipes, ctx, usedProbes, { noMove: answers.move_any === "left", extra });
  if (pick) return { kind: "role", pick };
  const q = nextQuick(pool, swipes, answers, ctx);
  return q ? { kind: "quick", quick: q } : null;
}
