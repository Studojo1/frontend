/**
 * Preferences from swipes, for /start.
 *
 * Instead of asking ten questions, /start shows real roles and learns from
 * which ones a student keeps: the kind of work (cluster), the cities and the
 * stipend floor. Pure functions so the live "N roles match" counter and the
 * saved preferences come from the same rules.
 */

export type DeckRole = {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string | null;
  stipend: string;
  duration: string;
  slug: string;
  cluster: Cluster;
  /** Monthly stipend in rupees when the text states one. */
  monthly: number | null;
};

export type Cluster =
  | "Analytics"
  | "Product"
  | "Engineering"
  | "Design"
  | "Marketing"
  | "Finance"
  | "Operations"
  | "Sales"
  | "Consulting"
  | "Content"
  | "HR"
  | "Other";

const RULES: [Cluster, RegExp][] = [
  ["Analytics", /\b(data|analy[ts]|business intelligence|\bbi\b|insight|research analyst)/i],
  ["Product", /\bproduct\b|\bpm\b/i],
  ["Design", /\b(design|ui|ux|graphic|visual|motion|illustrat)/i],
  ["Engineering", /\b(engineer|developer|software|sde|frontend|backend|full[- ]?stack|devops|\bml\b|machine learning|ai\b|android|ios|web dev)/i],
  ["Finance", /\b(financ|account|investment|equity|audit|tax|treasury|credit|banking|\bca\b)/i],
  ["Consulting", /\b(consult|strategy|strategic)/i],
  ["Marketing", /\b(marketing|growth|seo|brand|social media|performance|community|pr\b)/i],
  ["Sales", /\b(sales|business development|\bbd\b|partnership|account executive)/i],
  ["Content", /\b(content|writer|writing|copy|editor|journalis|video)/i],
  ["HR", /\b(hr|human resources|talent acquisition|recruit|people)/i],
  ["Operations", /\b(operations|ops\b|supply chain|logistics|program|project coordinator)/i],
];

export function clusterOf(title: string): Cluster {
  for (const [c, re] of RULES) if (re.test(title)) return c;
  return "Other";
}

/**
 * Monthly stipend in rupees from text like "₹25,000/month", "₹40k", "15-20k",
 * "6 LPA". Ranges use the lower end. Unpaid, unknown or foreign currency: null.
 */
export function parseStipend(text: string): number | null {
  const t = (text ?? "").toLowerCase().replace(/,/g, "");
  if (!t || /unpaid|^\s*0\s*$|not disclosed|performance/.test(t)) return null;
  if (/\$|usd|aed|£|€|s\$|sgd/.test(t)) return null;
  // "15-20k": the unit after a range applies to both ends.
  const range = t.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*\d+(?:\.\d+)?\s*(k|lpa|lakh|l\b)?/);
  const m = range ?? t.match(/(\d+(?:\.\d+)?)\s*(k|lpa|lakh|l\b)?/);
  if (!m) return null;
  let n = Number(m[1]);
  const unit = m[2];
  if (unit === "k") n *= 1000;
  else if (unit === "lpa" || unit === "lakh" || unit === "l") n = (n * 100000) / 12;
  if (n < 500 || n > 500000) return null;
  return Math.round(n);
}

export type SwipePrefs = {
  /** Kinds of work, most liked first. */
  clusters: Cluster[];
  /** Kinds of work passed at least twice and never liked. */
  avoid: Cluster[];
  /** Cities from liked roles, most liked first. */
  cities: string[];
  /** Lowest stipend among liked paid roles, rounded down to ₹5k. */
  minMonthly: number | null;
  /** Liked titles, for target roles. */
  titles: string[];
};

function ranked<T extends string>(items: T[]): T[] {
  const n = new Map<T, number>();
  for (const i of items) n.set(i, (n.get(i) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export function inferPrefs(liked: DeckRole[], passed: DeckRole[]): SwipePrefs {
  const likedClusters = new Set(liked.map((r) => r.cluster));
  const passCounts = new Map<Cluster, number>();
  for (const r of passed) passCounts.set(r.cluster, (passCounts.get(r.cluster) ?? 0) + 1);
  const paid = liked.map((r) => r.monthly).filter((n): n is number => n !== null);
  return {
    clusters: ranked(liked.map((r) => r.cluster)).filter((c) => c !== "Other"),
    avoid: [...passCounts.entries()].filter(([c, n]) => n >= 2 && !likedClusters.has(c)).map(([c]) => c),
    cities: ranked(liked.map((r) => r.city).filter((c): c is string => !!c)),
    minMonthly: paid.length ? Math.floor(Math.min(...paid) / 5000) * 5000 : null,
    titles: [...new Set(liked.map((r) => r.title))].slice(0, 6),
  };
}

/** Open roles that fit the preferences so far. With no signal yet, everything fits. */
export function matches(pool: Pick<DeckRole, "cluster" | "city" | "monthly">[], p: SwipePrefs): number {
  return pool.filter((r) => {
    if (p.avoid.includes(r.cluster)) return false;
    if (p.clusters.length && !p.clusters.includes(r.cluster)) return false;
    if (p.cities.length && r.city && !p.cities.includes(r.city)) return false;
    if (p.minMonthly && r.monthly !== null && r.monthly < p.minMonthly) return false;
    return true;
  }).length;
}

/**
 * Pick a deck that teaches us the most: spread across clusters and cities,
 * nudged towards what the resume suggests, but never only that.
 */
export function pickDeck<T extends DeckRole>(pool: T[], hints: string[], size = 12): T[] {
  const hint = hints.join(" ").toLowerCase();
  const score = (r: T) =>
    (hint && r.title.toLowerCase().split(/\W+/).some((w) => w.length > 3 && hint.includes(w)) ? 2 : 0) +
    (r.monthly ? 1 : 0);
  const byCluster = new Map<Cluster, T[]>();
  for (const r of [...pool].sort((a, b) => score(b) - score(a))) {
    const list = byCluster.get(r.cluster) ?? [];
    list.push(r);
    byCluster.set(r.cluster, list);
  }
  // Round-robin across clusters, best-hinted clusters first, one company once.
  const order = [...byCluster.entries()].sort((a, b) => score(b[1][0]) - score(a[1][0]));
  const out: T[] = [];
  const companies = new Set<string>();
  for (let round = 0; out.length < size && round < 20; round++) {
    let added = false;
    for (const [, list] of order) {
      const next = list.find((r) => !out.includes(r) && !companies.has(r.company.toLowerCase()));
      if (!next) continue;
      out.push(next);
      companies.add(next.company.toLowerCase());
      added = true;
      if (out.length === size) break;
    }
    if (!added) break;
  }
  return out;
}
