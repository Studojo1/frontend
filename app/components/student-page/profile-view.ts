/**
 * profileView(): the student page's every data rule, in one pure function.
 * Profile in (what the mapper sends, messy parts included), a plain view model
 * out, with every string cleaned, redacted and decided, so the components only
 * lay it out. It never throws: missing keys, nulls and empty arrays all give an
 * empty section, never "undefined".
 *
 * Ported from the reference build of the "Editorial CV" design (template.html,
 * block "profileView"); the rules are written up in its SPEC.md section 4.
 * Unit tests: ./profile-view.test.mjs.
 */
import {
  capFirst,
  clean,
  entryMode,
  fmtNum,
  isBullet,
  lineRef,
  midSentence,
  norm,
  readsLikeSentence,
  redact,
  txt,
  type EntryMode,
} from "~/lib/student-page-text";
import type { Profile } from "./types";

/** One quoted resume line. n is its 1-based position in the resume; ctx marks a dimmed neighbour shown for context. */
export type LineView = { id: string; n: number; text: string; strong: boolean; ctx: boolean };
/** A citation: "Resume lines 30 to 33" (label), "Lines 30 to 33" (short), and the lines to quote when it opens. */
export type Ref = { ids: string[]; label: string; short: string; lines: LineView[] };
/** A list item; head is a run-in head ("Push-Pull Marketing") or "". */
export type Item = { head: string; text: string; strong: boolean };
export type EntryView = {
  key: string;
  mode: Exclude<EntryMode, "loose">;
  title: string;
  org: string;
  place: string;
  sub: string;
  dates: string;
  span: string;
  note: string;
  body: Item[];
  shown: number;
  ref: Ref | null;
};
export type StintSectionView = {
  kind: "experience" | "projects" | "education";
  label: "Experience" | "Projects" | "Education";
  entries: EntryView[];
  pool: { caption: "Also on the resume" | "From the resume"; items: Item[]; shown: number } | null;
};
export type ClaimView = { n: number; text: string; matched: boolean; ref: Ref | null };
export type ProofView = { matched: number; total: number; all: boolean; text: string };
export type LookingView = { main: string; sub: string; rows: { k: "Company" | "Location" | "Remote"; v: string }[] };
export type HighlightView = { value: string; label: string; ref: Ref | null };
/** The highlight figure column in px below and from 768px; "phone": figures above their labels below 640px, "all": always above. */
export type FigColView = { phone: number; desktop: number; stack: "none" | "phone" | "all" };
export type AboutView = { text: string; prompts: { q: string; a: string }[] };
export type AwardsView = { label: "Awards" | "Activities"; groups: { caption: string; items: Item[] }[]; count: number; shown: number; ref: Ref | null };
export type SkillGroupView = { where: string; names: string[]; more: number; ref: Ref | null };
export type SourcesView = { groups: { label: string; claims: ClaimView[] }[] };
export type ProfileView = {
  name: string;
  first: string;
  poss: string;
  initials: string;
  nameSize: "m" | "l" | "xl";
  photo: string | null;
  headline: string;
  degree: string;
  college: string;
  classOf: string;
  city: string;
  email: string | null;
  url: string;
  shareUrl: string;
  updated: string;
  proof: ProofView | null;
  looking: LookingView | null;
  highlights: HighlightView[];
  figCol: FigColView;
  about: AboutView | null;
  stints: StintSectionView[];
  awards: AwardsView | null;
  skills: SkillGroupView[];
  sources: SourcesView | null;
};

type RLine = { id: string; section: string; raw: string; strong: boolean; n: number };
type Merged = { text: string; n: number; last: number; strong: boolean };

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const CONNECTOR = /(?:,|\b(?:to|and|or|of|the|for|with|in|on|a|an|by|from|at|as|&))$/i;
const endsSentence = (t: string) => /[.!?:;)\]]$/.test(t);
/** A resume header line with contact details (raw, or already redacted on the server): never shown, cited or used as context. */
const contactHeader = (l: RLine) => /\[(?:personal|contact) details hidden\]/.test(l.raw) || (l.section === "header" && /@|\d{5}|\[(?:email|phone) hidden\]/.test(l.raw));
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FILLER =
  /\b(class|of|to|and|the|in|at|present|now|current|ongoing|cgpa|gpa|grade|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\b/g;
const DATE_RANGE =
  /\(?(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s+)?(?:19|20)\d{2}\s*(?:-|to|until|till)\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s+)?(?:19|20)\d{2}|Present|Now|Current|Ongoing)\)?/gi;
const STOP = /^(current|present|now|ongoing|till date|to date|resume|skills?|others?|etc|misc|n\/a)$/i;
const SEC_WHERE: Record<string, string> = { experience: "From experience", projects: "From projects", education: "From education", extra: "From activities" };
const WIN = /\b(winner|won|win|runner[- ]?up|finalist|award|awarded|prize|medal|rank(ed)?|best|first place|scholar(ship)?|honou?r|top \d+)\b/i;
const SMALL = new Set(["and", "of", "the", "for", "in", "at", "to", "on", "with", "a", "an", "&"]);

// Upper-bound glyph widths in em of Newsreader (lining, tabular figures), measured at 26px and 30px.
const GLYPH_EM: Record<string, number> = { ",": 0.23, ".": 0.23, " ": 0.22, "/": 0.27, "-": 0.34, "+": 0.52, "\u2212": 0.52, "%": 0.78, $: 0.57, "\u20ac": 0.57, "\u00a3": 0.57, "\u20b9": 0.7, M: 0.98, W: 0.98, m: 0.84, w: 0.74 };
const figEm = (s: string) => [...s].reduce((w, c) => w + (GLYPH_EM[c] ?? (/\d/.test(c) ? 0.57 : /[a-z]/.test(c) ? 0.56 : 0.75)), 0);

const present = (d: string) => (/^(now|present|current|ongoing|till date|today)$/i.test(d) ? "Present" : d);
const restates = (text: string, parts: string[]) => {
  const n = norm(text);
  return parts.some((p) => p && p.length >= 4 && n.includes(p));
};
const contains = (big: string, small: string) => {
  const b = new Set(norm(big).split(" "));
  const s = norm(small).split(" ").filter(Boolean);
  return s.length > 0 && s.filter((w) => b.has(w)).length / s.length >= 0.8;
};
/** A line "adds nothing" when, once the entry's own fields, numbers and filler ("Class of", "CGPA", months) are taken out, fewer than three real words remain. */
function addsNothing(text: string, fields: string[]): boolean {
  let n = ` ${norm(text)} `;
  fields.map(norm).filter((q) => q.length >= 3).forEach((q) => {
    n = n.split(q).join(" ");
  });
  n = n.replace(/\b\d+\b/g, " ").replace(FILLER, " ");
  return n.split(/\s+/).filter((w) => w.length > 1).length < 3;
}
/** "Push-Pull Marketing- Created and executed..." reads with a run-in head ("Push-Pull" itself has no space after its hyphen, so it is not split). */
function item(o: { text: string; strong?: boolean }): Item {
  const t = fmtNum(redact(o.text));
  const m = /^([A-Z][^.;:!?]{2,46}?[A-Za-z)])-\s+(?=[A-Z])/.exec(t);
  return m ? { head: m[1], text: t.slice(m[0].length), strong: !!o.strong } : { head: "", text: t, strong: !!o.strong };
}

export function profileView(input: Profile | null | undefined): ProfileView {
  const P = (input ?? {}) as Partial<Profile>;
  const LINES: RLine[] = arr<{ id?: unknown; section?: unknown; text?: unknown; strong?: unknown }>(P.lines)
    .filter((l) => l && l.id)
    .map((l, i) => ({ id: String(l.id), section: String(l.section || ""), raw: String(l.text || ""), strong: !!l.strong, n: i + 1 }));
  const BYID = new Map(LINES.map((l) => [l.id, l]));
  const lineV = (l: RLine, ctx: boolean): LineView => ({ id: l.id, n: l.n, text: txt(l.raw), strong: l.strong, ctx });

  function resolve(ids: unknown): RLine[] {
    const seen = new Set<string>();
    const out: RLine[] = [];
    for (const id of arr<string>(ids)) {
      const l = BYID.get(String(id));
      if (!l || l.section === "" || seen.has(l.id)) continue;
      seen.add(l.id);
      out.push(l);
    }
    return out.sort((a, b) => a.n - b.n);
  }
  /** A cited line that continues the previous one brings that line along, dimmed, so the proof reads whole. */
  const continues = (prev: RLine, cur: RLine) => /^[a-z]/.test(clean(cur.raw)) || (!endsSentence(clean(prev.raw)) && CONNECTOR.test(clean(prev.raw)));
  function withContext(ls: RLine[]): LineView[] {
    const ids = new Set(ls.map((l) => l.id));
    const out = new Map<string, LineView>();
    ls.forEach((l) => {
      let cur = l;
      for (let k = 0; k < 2; k++) {
        const prev = LINES[cur.n - 2];
        if (!prev || ids.has(prev.id) || (prev.section !== cur.section && cur.section !== "header" && prev.section !== "header")) break;
        if (!continues(prev, cur) || contactHeader(prev)) break;
        out.set(prev.id, lineV(prev, true));
        if (midSentence(clean(prev.raw)) || /[.!?]\s+[A-Z]/.test(clean(prev.raw))) break;
        cur = prev;
      }
      out.set(l.id, lineV(l, false));
      const next = LINES[l.n];
      const t = clean(l.raw);
      if (next && !ids.has(next.id) && !isBullet(next.raw) && !endsSentence(t) && (CONNECTOR.test(t) || /^[a-z]/.test(clean(next.raw)))) {
        out.set(next.id, lineV(next, true));
      }
    });
    return [...out.values()].sort((a, b) => a.n - b.n);
  }
  function refOf(ids: unknown): Ref | null {
    const ls = resolve(ids).filter((l) => !contactHeader(l));
    return ls.length ? { ids: ls.map((l) => l.id), label: lineRef(ls, true), short: lineRef(ls, false), lines: withContext(ls) } : null;
  }
  /** For lists from the resume: rejoin a line that was wrapped onto the next, drop repeats. */
  function mergeLines(ls: RLine[]): Merged[] {
    const out: Merged[] = [];
    ls.forEach((l) => {
      const t = clean(l.raw);
      if (!t) return;
      const prev = out[out.length - 1];
      if (prev && prev.last === l.n - 1 && !isBullet(l.raw) && (prev.text.endsWith(",") || /^[a-z]/.test(t) || (!endsSentence(prev.text) && CONNECTOR.test(prev.text)))) {
        prev.text += ` ${t}`;
        prev.last = l.n;
        return;
      }
      out.push({ text: t, n: l.n, last: l.n, strong: l.strong });
    });
    const seen = new Set<string>();
    return out.filter((o) => {
      const k = norm(o.text);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  // ---------------------------------------------------------------- identity
  const name = clean(P.name) || "Student";
  const first = clean(P.first) || name.split(" ")[0];
  const poss = /s$/i.test(first) ? `${first}\u2019` : `${first}\u2019s`;
  const words = name.split(" ");
  const longest = Math.max(...words.map((w) => w.length));
  const nameSize: ProfileView["nameSize"] = name.length > 40 || longest > 18 ? "xl" : name.length > 26 || longest > 14 ? "l" : "m";
  const initials = (clean(P.initials) || words.map((w) => w[0]).slice(0, 2).join("")).toUpperCase().slice(0, 2);
  const college = txt(P.college);
  const city = txt(P.city);
  const updated = (() => {
    // Fixed month names, never toLocaleDateString: ICU differs between Node and browsers ("Sep" vs "Sept") and would break hydration.
    const d = P.updated ? new Date(P.updated) : null;
    return d && !Number.isNaN(d.getTime()) ? `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}` : "";
  })();
  const url = clean(P.url).replace(/^https?:\/\//, "");

  // ---------------------------------------------------------------- claims (the summary needs them first)
  const claimsRaw = arr<{ text?: unknown; section?: unknown; evidence?: unknown }>(P.claims)
    .map((c, i) => ({ i, text: fmtNum(txt(c?.text)), section: String(c?.section || ""), ls: resolve(c?.evidence).filter((l) => !contactHeader(l)) }))
    .filter((c) => c.text);
  const matched = claimsRaw.filter((c) => c.ls.length).length;
  const total = claimsRaw.length;
  const proof: ProofView | null = total ? { matched, total, all: matched === total, text: `${matched} of ${total} claims matched to ${poss} resume` } : null;

  // ---------------------------------------------------------------- looking for
  const looking = ((): LookingView | null => {
    const t = (P.target ?? {}) as Partial<Profile["target"]>;
    const role = txt(t.role), type = txt(t.type), start = txt(t.start), stage = txt(t.stage);
    const dated = /\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(start);
    const startPhrase = (cap: boolean) => (!start ? "" : dated ? `${cap ? "Starting" : "starting"} ${start}` : cap ? capFirst(start) : start.charAt(0).toLowerCase() + start.slice(1));
    let main = role;
    let sub = "";
    if (role) sub = type ? capFirst(type) + (start ? `, ${startPhrase(false)}` : "") : startPhrase(true);
    else if (type) {
      main = capFirst(type);
      sub = startPhrase(true);
    } else if (start) main = startPhrase(true);
    const rows: LookingView["rows"] = [];
    if (stage) rows.push({ k: "Company", v: capFirst(stage) });
    const seen = new Set<string>();
    const places = arr<{ label?: unknown } | string>(t.cities)
      .map((c) => txt(typeof c === "string" ? c : c?.label))
      .filter((c) => {
        if (!c || seen.has(c.toLowerCase())) return false;
        seen.add(c.toLowerCase());
        return true;
      });
    if (places.length) rows.push({ k: "Location", v: places.join(", ") });
    if (t.remote === true) rows.push({ k: "Remote", v: "Open to remote work" });
    return main || rows.length ? { main, sub, rows } : null;
  })();

  // ---------------------------------------------------------------- highlights
  const highlights: HighlightView[] = arr<{ value?: unknown; label?: unknown; evidence?: unknown }>(P.numbers)
    .map((n) => {
      let value = clean(n?.value);
      const label = fmtNum(txt(n?.label)).replace(/[.;,]$/, "");
      // Headline the outcome: "from $100K to $250K" shows $250K.
      const ft = /\bfrom\s+(\S+?)\s+to\s+(\S+?)(?=[\s,;.]*$|[\s,;])/i.exec(label);
      if (ft && ft[1].replace(/,/g, "") === value.replace(/,/g, "")) value = ft[2].replace(/[.,;]$/, "");
      value = value.replace(/^([+\u2212-]?[$\u20b9\u20ac\u00a3]?)(\d{4,})/, (_m: string, a: string, d: string) => a + Number(d).toLocaleString("en-US"));
      return { value, label, ref: refOf(n?.evidence) };
    })
    .filter((n) => n.value && n.label && !/\b(by|of|to|for|with|and|the|a|an|in|on|at|from)$/i.test(n.label))
    .slice(0, 4);
  // The figure column fits the widest figure, so a long one never runs into its label. 92px and 112px stay
  // the minimum (short figures keep the usual grid); a figure too wide to sit beside its label on a 320px
  // phone ("1,00,000+", lakh and crore figures) goes above it below 640px, and a very long one always does.
  const widest = Math.max(0, ...highlights.map((h) => figEm(h.value)));
  const figPhone = Math.max(92, Math.ceil(widest * 26) + 6);
  const figDesk = Math.max(112, Math.ceil(widest * 30) + 8);
  const figCol: FigColView = { phone: figPhone, desktop: figDesk, stack: figDesk > 200 ? "all" : figPhone > 118 ? "phone" : "none" };

  // ---------------------------------------------------------------- about
  const aboutText = txt(P.about);
  const prompts = arr<{ q?: unknown; a?: unknown }>(P.prompts)
    .map((p) => ({ q: txt(p?.q), a: txt(p?.a) }))
    .filter((p) => p.a);
  const about: AboutView | null = aboutText || prompts.length ? { text: aboutText, prompts } : null;

  // ---------------------------------------------------------------- entries
  type Draft = { mode: EntryMode; ev: string[]; dates: string; span: string; to: string; from: string; title: string; org: string; place: string; sub: string; note: string; body: Item[] };
  const endKey = (v: Draft) => {
    if (v.to === "Present") return 99999;
    const y = /(\d{4})(?!.*\d{4})/.exec(v.to || v.from || "");
    return y ? Number(y[1]) : -1;
  };
  const usedIds = new Set<string>();

  function stintView(raw: unknown, kind: StintSectionView["kind"]): Draft {
    const st = (raw ?? {}) as Partial<Profile["experience"][number]> & { parse?: unknown };
    const title = txt(st.title);
    const orgRaw = st.org?.name ? st.org.name : "";
    const org = txt(orgRaw);
    const same = !!org && org.toLowerCase() === title.toLowerCase();
    const showOrg = !!org && !st.hideOrg && !same;
    const from = present(clean(st.from));
    const to = present(clean(st.to));
    const dates = from && to ? (from === to ? from : `${from} - ${to}`) : from || to;
    const mode: EntryMode = st.parse === "clean" || st.parse === "anchored" || st.parse === "loose" ? st.parse : entryMode(st);
    let span = kind === "education" ? "" : clean(st.span);
    const yrs = /(\d+)\s*yr/.exec(span);
    if (yrs && Number(yrs[1]) >= 10) span = "";
    const ev = arr<string>(st.evidence).map(String);
    const v: Draft = { mode, ev, from, to, dates, span, title: "", org: "", place: "", sub: "", note: "", body: [] };
    let body: Merged[] = [];
    if (mode === "clean") {
      Object.assign(v, { title, org: showOrg ? org : "", place: txt(st.place), note: fmtNum(txt(st.note)) });
      const parts = [norm(title), showOrg ? norm(org.split(",")[0]) : ""];
      if (!v.note) body = mergeLines(resolve(ev).filter((l) => l.section !== "header" && !restates(l.raw, parts) && !addsNothing(l.raw, [title, org, v.place])));
    } else if (mode === "anchored") {
      v.title = org;
      const head = resolve(ev)[0];
      const orgParts = org.split(",").map((s) => s.trim()).filter(Boolean);
      // What the heading line says beyond the org and its dates ("Commerce and Computer Science").
      if (head && !isBullet(head.raw) && norm(head.raw).includes(norm(orgParts[0]))) {
        let rest = clean(head.raw).replace(DATE_RANGE, " ");
        orgParts.forEach((p) => {
          rest = rest.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ");
        });
        rest = rest.replace(/\s*[|,\u00b7]\s*(?:[|,\u00b7]\s*)*/g, ", ").replace(/^[\s,|:;-]+|[\s,|:;-]+$/g, "").replace(/\s+/g, " ");
        if (rest.split(" ").filter((w) => /[A-Za-z]{2,}/.test(w)).length >= 2 && !readsLikeSentence(rest)) v.sub = txt(rest);
      }
      body = mergeLines(resolve(ev).filter((l) => l.section !== "header" && !restates(l.raw, [norm(orgParts[0] || org)]) && !addsNothing(l.raw, [org, v.sub])));
      // A demoted title is never dropped: it stays as the first line unless a line already says it.
      if (title && !body.some((o) => contains(o.text, title)) && !contains(org, title)) body.unshift({ text: title, n: 0, last: 0, strong: false });
    }
    v.body = body.map(item);
    return v;
  }

  function stintSection(kind: StintSectionView["kind"], label: StintSectionView["label"], list: unknown): StintSectionView | null {
    const views = arr<unknown>(list).map((s) => stintView(s, kind));
    const keys = new Set<string>();
    let drawn = views.filter((v) => {
      if (v.mode === "loose") return false;
      const k = `${v.title}|${v.org}`.toLowerCase();
      if (keys.has(k)) return false;
      keys.add(k);
      return true;
    });
    if (kind === "education") {
      drawn = drawn
        .map((v, i) => [v, i] as const)
        .sort((a, b) => endKey(b[0]) - endKey(a[0]) || a[1] - b[1])
        .map((x) => x[0]);
    }
    const used = new Set(drawn.flatMap((v) => v.ev));
    const looseIds = views.filter((v) => v.mode === "loose").flatMap((v) => v.ev);
    views.forEach((v) => v.ev.forEach((id) => usedIds.add(id)));
    const pool = mergeLines(resolve(looseIds).filter((l) => l.section !== "header" && !used.has(l.id))).map(item);
    if (!drawn.length && !pool.length) return null;
    const entries: EntryView[] = drawn.map((v, i) => ({
      key: `${kind}-${i}`,
      mode: v.mode === "anchored" ? "anchored" : "clean",
      title: v.title,
      org: v.org,
      place: v.place,
      sub: v.sub,
      dates: v.dates,
      span: v.span,
      note: v.note,
      body: v.body,
      shown: v.body.length >= 6 ? 4 : v.body.length,
      ref: refOf(v.ev),
    }));
    return {
      kind,
      label,
      entries,
      pool: pool.length ? { caption: drawn.length ? "Also on the resume" : "From the resume", items: pool, shown: pool.length >= 7 ? 5 : pool.length } : null,
    };
  }
  const stints = [
    stintSection("experience", "Experience", P.experience),
    stintSection("projects", "Projects", P.projects),
    stintSection("education", "Education", P.education),
  ].filter((s): s is StintSectionView => !!s);

  // ---------------------------------------------------------------- skills
  const skills = ((): SkillGroupView[] => {
    let list = arr<{ name?: unknown; where?: unknown; evidence?: unknown }>(P.skills)
      .map((s) => ({ name: txt(s?.name), where: String(s?.where ?? ""), ev: arr<string>(s?.evidence) }))
      .filter((s) => s.name && s.name.length <= 40 && !STOP.test(s.name))
      // A skill whose only line reads as its name is a sub-heading, unless the student checked the list.
      .filter((s) => P.skillsChecked === true || !resolve(s.ev).some((l) => clean(l.raw).toLowerCase() === s.name.toLowerCase()));
    const seen = new Set<string>();
    list = list.filter((s) => {
      const k = s.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const all = list.map((s) => s.name.toLowerCase());
    // A one-word skill a longer one already covers goes ("Partnerships" with "Strategic Partnerships").
    list = list.filter((s) => {
      const n = s.name.toLowerCase();
      if (P.skillsChecked === true || /\s/.test(n)) return true;
      return !all.some((m) => m !== n && m.split(/[\s/-]+/).some((w) => w === n || w === `${n}s` || w === `${n}es` || w === `${n}ing`));
    });
    if (!list.length) return [];
    const whereOf = (s: { where: string; ev: string[] }) => {
      const w = clean(s.where);
      if (w && w.toLowerCase() !== "resume" && !readsLikeSentence(s.where)) return { label: w, rank: 0 };
      const l = resolve(s.ev)[0];
      if (w.toLowerCase() !== "resume" && l && SEC_WHERE[l.section]) return { label: SEC_WHERE[l.section], rank: 1 };
      return { label: "Listed on the resume", rank: 2 };
    };
    const groups: { where: string; rank: number; names: string[]; ev: string[] }[] = [];
    const by = new Map<string, (typeof groups)[number]>();
    list.forEach((s) => {
      const w = whereOf(s);
      let g = by.get(w.label);
      if (!g) {
        g = { where: w.label, rank: w.rank, names: [], ev: [] };
        by.set(w.label, g);
        groups.push(g);
      }
      g.names.push(s.name);
      g.ev.push(...s.ev);
    });
    return groups
      .map((g, i) => [g, i] as const)
      .sort((a, b) => a[0].rank - b[0].rank || a[1] - b[1])
      .map(([g]) => ({ where: g.where, names: g.names.slice(0, 12), more: Math.max(0, g.names.length - 12), ref: refOf(g.ev) }));
  })();

  // ---------------------------------------------------------------- awards and activities
  // Lines in the resume's extra section that nothing else on the page uses
  // (competition wins, for example). A short ALL CAPS line is a heading, not an item.
  const awards = ((): AwardsView | null => {
    const cited = new Set(usedIds);
    for (const n of arr<{ evidence?: unknown }>(P.numbers)) arr<string>(n?.evidence).forEach((id) => cited.add(String(id)));
    for (const c of arr<{ evidence?: unknown }>(P.claims)) arr<string>(c?.evidence).forEach((id) => cited.add(String(id)));
    for (const s of arr<{ evidence?: unknown }>(P.skills)) arr<string>(s?.evidence).forEach((id) => cited.add(String(id)));
    const ls = LINES.filter((l) => l.section === "extra" && !cited.has(l.id) && clean(l.raw) && !contactHeader(l) && !/\[phone hidden\]/.test(l.raw));
    if (!ls.length) return null;
    const isHead = (l: RLine) => {
      const t = clean(l.raw);
      return !isBullet(l.raw) && t.length <= 48 && /[A-Z]{3}/.test(t) && !/[a-z]/.test(t) && t.split(" ").length <= 6;
    };
    const sentence = (t: string) => t.toLowerCase().split(" ").map((w, i) => (i === 0 ? capFirst(w) : SMALL.has(w) || w.length > 3 ? w : w.toUpperCase())).join(" ");
    const groups: { caption: string; ls: RLine[] }[] = [];
    let cur: { caption: string; ls: RLine[] } | null = null;
    ls.forEach((l) => {
      if (isHead(l)) {
        cur = { caption: sentence(clean(l.raw)), ls: [] };
        groups.push(cur);
        return;
      }
      if (!cur) {
        cur = { caption: "", ls: [] };
        groups.push(cur);
      }
      cur.ls.push(l);
    });
    const gs = groups.map((g) => ({ caption: g.caption, items: mergeLines(g.ls).map(item) })).filter((g) => g.items.length);
    if (!gs.length) return null;
    const items = gs.flatMap((g) => g.items);
    const wins = items.filter((o) => WIN.test(o.text)).length;
    const count = items.length;
    return {
      label: wins * 2 >= count ? "Awards" : "Activities",
      groups: gs,
      count,
      shown: count >= 7 ? 5 : count,
      ref: refOf(ls.map((l) => l.id)),
    };
  })();

  // ---------------------------------------------------------------- sources
  const extraName = awards ? awards.label : "Activities";
  const SECTION_NAME: Record<string, string> = { header: "Summary", experience: "Experience", projects: "Projects", education: "Education", skills: "Skills", extra: extraName };
  const CLAIM_NAME: Record<string, string> = { intro: "Summary", experience: "Experience", projects: "Projects", education: "Education", skills: "Skills", more: extraName };
  const sources = ((): SourcesView | null => {
    if (!claimsRaw.length) return null;
    const groups = new Map<string, { label: string; first: number; claims: typeof claimsRaw }>();
    claimsRaw.forEach((c) => {
      const label = c.ls.length ? SECTION_NAME[c.ls[0].section] || "Summary" : CLAIM_NAME[c.section] || "Summary";
      let g = groups.get(label);
      if (!g) {
        g = { label, first: Infinity, claims: [] };
        groups.set(label, g);
      }
      g.first = Math.min(g.first, c.ls.length ? c.ls[0].n : Infinity);
      g.claims.push(c);
    });
    let n = 0;
    return {
      groups: [...groups.values()]
        .map((g, i) => [g, i] as const)
        .sort((a, b) => a[0].first - b[0].first || a[1] - b[1])
        .map(([g]) => ({
          label: g.label,
          claims: [...g.claims]
            .sort((a, b) => (a.ls.length && b.ls.length ? a.ls[0].n - b.ls[0].n : a.ls.length ? -1 : b.ls.length ? 1 : a.i - b.i))
            .map((c) => ({
              n: ++n,
              text: c.text,
              matched: c.ls.length > 0,
              ref: c.ls.length ? { ids: c.ls.map((l) => l.id), label: lineRef(c.ls, true), short: lineRef(c.ls, false), lines: withContext(c.ls) } : null,
            })),
        })),
    };
  })();

  const photo = typeof P.photo === "string" && /^(data:image\/|https:\/\/)/.test(P.photo) ? P.photo : null;
  return {
    name,
    first,
    poss,
    initials,
    nameSize,
    photo,
    headline: txt(P.headline),
    degree: txt(P.degree),
    college,
    classOf: txt(P.classOf),
    city: city && !college.toLowerCase().includes(city.toLowerCase()) ? city : "",
    email: typeof P.email === "string" && P.email.includes("@") ? P.email.trim() : null,
    url,
    shareUrl: url ? `https://${url}` : "",
    updated,
    proof,
    looking,
    highlights,
    figCol,
    about,
    stints,
    awards,
    skills,
    sources,
  };
}
