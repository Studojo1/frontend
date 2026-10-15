// Copied from Studojo1/outreach-flow (app/components/profile-ideas/v2/body-sections.tsx), which
// drafts the page in its onboarding flow; keep the two in step.
// The main column of the v2 profile body, in the onboarding's language:
// Looking for, the numbers, the timelines, skills, prompt answers and the
// proof list. Every claim, number and entry can open its exact resume lines.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FiCheck, FiChevronDown, FiFileText, FiGlobe, FiLinkedin } from "react-icons/fi";
import { Badge, Button, Card, Chip, cx, FOCUS_RING, PRESS, type CardTone } from "./ui";
import { CLAIM_SECTION_LABEL, type Profile, type Stint } from "./types";
import { Kicker, MARK, Mark, OrgTile, ResumeLines, Reveal, Rise, Span, type KickerTone } from "./body-ui";

export function Section({
  kicker,
  kickerTone = "purple",
  title,
  sub,
  children,
  id,
  reduced,
}: {
  kicker: ReactNode;
  kickerTone?: KickerTone;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  id: string;
  reduced: boolean;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-32 pt-14 sm:pt-20">
      <header className="mb-5 sm:mb-7">
        <Kicker tone={kickerTone}>{kicker}</Kicker>
        <h2 id={id} className="mt-3 font-clash text-[1.875rem] font-semibold leading-[1.08] text-studojo-ink [word-spacing:0.06em] sm:text-[2.5rem]" style={{ textWrap: "balance" }}>
          {title}
        </h2>
        {sub && <p className="mt-2.5 max-w-[56ch] font-satoshi text-base text-studojo-muted sm:text-lg">{sub}</p>}
      </header>
      <Rise reduced={reduced}>{children}</Rise>
    </section>
  );
}

/** A dashed ink rule, as inside the onboarding's cards. */
const Dashed = ({ className }: { className?: string }) => <hr aria-hidden className={cx("border-0 border-t-2 border-dashed border-studojo-ink/25", className)} />;

/* ── Looking for ─────────────────────────────────────────────────────────── */

export function LookingFor({ p, reduced }: { p: Profile; reduced: boolean }) {
  const t = p.target;
  const hasPlaces = t.cities.length > 0 || t.remote;
  if (!t.role && !hasPlaces) return null;
  const sub = [t.type && `${/^[aeiou]/i.test(t.type) ? "An" : "A"} ${t.type.toLowerCase()}`, t.stage && `ideally at ${t.stage.toLowerCase()}`].filter(Boolean).join(", ");
  return (
    <section aria-labelledby="pv2-looking" className="pt-2">
      <Rise reduced={reduced}>
        <Card tone="purple" shadow="lg" pad="lg" className="relative">
          <Kicker>{p.first} is looking for</Kicker>
          <h2 id="pv2-looking" className="mt-3.5 font-clash text-[2rem] font-semibold leading-[1.08] text-studojo-ink [word-spacing:0.06em] sm:text-[2.875rem]" style={{ textWrap: "balance" }}>
            {t.role ? (
              <>
                <Mark color={MARK.yellow}>{t.role}</Mark>
                {t.start ? `, from ${t.start}.` : "."}
              </>
            ) : (
              <>
                Work in <Mark color={MARK.yellow}>{t.cities.length ? t.cities.map((c) => c.label).join(", ") : "a remote team"}</Mark>.
              </>
            )}
          </h2>
          {sub && (
            <p className="mt-3 font-satoshi text-base text-studojo-muted sm:text-lg" style={{ textWrap: "pretty" }}>
              {sub}.
            </p>
          )}
          {hasPlaces && (
            <>
          <Dashed className="my-5 sm:my-6" />
          <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">{t.cities.length ? "Cities" : "Where"}</p>
          <ul className="mt-2.5 flex flex-wrap gap-2" aria-label="Cities">
            {t.cities.map((c) => (
              <li key={c.code} className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-studojo-ink bg-white py-1 pl-1 pr-3.5 font-satoshi text-sm font-bold text-studojo-ink shadow-[2px_2px_0_0_#191a23]">
                <span className="rounded-full bg-studojo-ink px-2 py-[3px] text-[10.5px] tracking-[0.08em] text-white">{c.code}</span>
                {c.label}
              </li>
            ))}
            {t.remote && (
              <li className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-dashed border-studojo-ink/60 bg-white/70 px-3.5 font-satoshi text-sm font-bold text-studojo-ink">
                <FiGlobe className="h-3.5 w-3.5" aria-hidden />
                {t.cities.length ? "or remote" : "Remote"}
              </li>
            )}
          </ul>
            </>
          )}
        </Card>
      </Rise>
    </section>
  );
}

/* ── By the numbers ──────────────────────────────────────────────────────── */

/** Popover edge per cell: 2 columns on phone, 4 from sm up; keep it inside the column. */
const POP_SIDE = [
  "left-0",
  "right-0 sm:right-auto sm:left-0 lg:left-auto lg:right-0 xl:right-auto xl:left-0",
  "left-0 sm:left-auto sm:right-0 lg:right-auto lg:left-0 xl:left-auto xl:right-0",
  "right-0",
];

const TILE_TONE = [
  { bg: "bg-studojo-purple-bg", text: "text-studojo-purple-strong" },
  { bg: "bg-studojo-pink-bg", text: "text-[#be185d]" },
  { bg: "bg-studojo-orange-bg", text: "text-[#b45309]" },
  { bg: "bg-studojo-green-bg", text: "text-[#047857]" },
];

export function Numbers({ p, reduced }: { p: Profile; reduced: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const open = hover ?? pinned;
  useEffect(() => {
    if (pinned === null) return;
    const off = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setPinned(null);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setPinned(null);
    document.addEventListener("pointerdown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [pinned]);
  if (!p.numbers.length) return null;
  return (
    <Section
      kicker="Straight from the resume"
      title={
        <>
          By the <Mark color={MARK.lilac}>numbers</Mark>
        </>
      }
      id="pv2-numbers"
      sub="Hover or tap a number to see the resume line it came from."
      reduced={reduced}
    >
      <div ref={wrap} className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {p.numbers.map((n, i) => {
          const on = open === i;
          const tone = TILE_TONE[i % TILE_TONE.length];
          return (
            <div key={n.label} className="relative" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <button
                type="button"
                aria-expanded={on}
                aria-describedby={on ? `pv2-num-${i}` : undefined}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => setPinned(pinned === i ? null : i)}
                className={cx(
                  "flex h-full w-full flex-col rounded-2xl border-2 border-studojo-ink p-3.5 text-left sm:p-4",
                  tone.bg,
                  PRESS,
                  FOCUS_RING,
                  on ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_0_#191a23]" : "shadow-brutal",
                )}
              >
                <span className={cx("font-satoshi text-[11px] font-bold uppercase tracking-[0.12em]", tone.text)}>0{i + 1}</span>
                <span className="mt-1.5 block font-clash text-[2.25rem] font-semibold leading-none tracking-[-0.01em] text-studojo-ink tabular-nums sm:text-[2.5rem]">{n.value}</span>
                <span className="mt-2 block flex-1 font-satoshi text-sm font-medium leading-snug text-studojo-ink" style={{ textWrap: "balance" }}>
                  {n.label}
                </span>
                <span className={cx("mt-3 inline-flex items-center gap-1 font-satoshi text-[11px] font-bold uppercase tracking-[0.08em]", tone.text)}>
                  <FiFileText aria-hidden className="h-3 w-3" />
                  {on ? "Resume line" : "Source"}
                </span>
              </button>
              {on && (
                <div
                  id={`pv2-num-${i}`}
                  role="tooltip"
                  className={`absolute top-full z-20 mt-3 w-[min(300px,calc(100vw-40px))] ${POP_SIDE[i % 4]}`}
                  style={{ animation: reduced ? undefined : "pv2-pop .2s cubic-bezier(.34,1.56,.64,1)" }}
                >
                  <div className="overflow-hidden rounded-xl border-2 border-studojo-ink bg-white shadow-brutal">
                    <ResumeLines ids={n.evidence} stacked />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── Timelines ───────────────────────────────────────────────────────────── */

function Entry({ s, last, reduced }: { s: Stint; last: boolean; reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className="relative grid grid-cols-[44px_1fr] gap-x-4 sm:grid-cols-[52px_1fr] sm:gap-x-5">
      <div className="relative flex flex-col items-center">
        <OrgTile org={s.org} size={52} className="hidden sm:grid" />
        <OrgTile org={s.org} size={44} className="sm:hidden" />
        {!last && <span aria-hidden className="mt-3 w-0 flex-1 border-l-2 border-dashed border-studojo-ink/45" />}
      </div>
      <div className={cx("min-w-0", last ? "pb-1" : "pb-9")}>
        <h3 className="pt-0.5 font-clash text-xl font-semibold leading-[1.2] text-studojo-ink sm:text-[1.375rem]" style={{ textWrap: "balance" }}>
          {s.title}
        </h3>
        {!s.hideOrg && <p className="mt-0.5 font-satoshi text-base font-medium text-studojo-ink">{s.org.name}</p>}
        {s.from && s.to && s.span ? (
          <div className="mt-3">
            <Span from={s.from} span={s.span} to={s.to} />
          </div>
        ) : s.from || s.to ? (
          <p className="mt-2 font-satoshi text-sm font-medium text-studojo-muted tabular-nums">{[s.from, s.to].filter(Boolean).join(" to ")}</p>
        ) : null}
        {s.place && <p className="mt-2 font-satoshi text-sm text-studojo-muted">{s.place}</p>}
        {s.note && (
          <p className="mt-3 max-w-[56ch] font-satoshi text-base leading-[1.6] text-studojo-ink" style={{ textWrap: "pretty" }}>
            {s.note}
          </p>
        )}
        {(s as Stint & { source?: string }).source === "linkedin" ? (
          // Not on the resume: read from the student's own LinkedIn, and said so.
          <p className="mt-3.5 inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-studojo-ink/30 bg-white px-3 font-satoshi text-xs font-bold text-studojo-ink">
            <FiLinkedin aria-hidden className="h-3.5 w-3.5 text-[#0a66c2]" />
            From LinkedIn
          </p>
        ) : (
          <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={id}
            className={cx(
              "mt-3.5 inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-studojo-ink px-3 font-satoshi text-xs font-bold text-studojo-ink",
              PRESS,
              FOCUS_RING,
              open ? "bg-studojo-ink text-white shadow-none" : "bg-white shadow-[2px_2px_0_0_#191a23] hover:bg-studojo-purple-bg active:shadow-none",
            )}
          >
            <FiFileText aria-hidden className="h-3.5 w-3.5" />
            {open ? "Hide resume lines" : "Resume lines"}
            <FiChevronDown aria-hidden className={cx("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} />
          </button>
          <Reveal open={open} reduced={reduced} id={id}>
            <div className="pt-3.5">
              <ResumeLines ids={s.evidence} />
            </div>
          </Reveal>
          </>
        )}
      </div>
    </li>
  );
}

export function Timeline({
  title,
  kicker,
  items,
  noun,
  reduced,
  id,
  tone,
}: {
  title: ReactNode;
  kicker: ReactNode;
  items: Stint[];
  noun: string;
  reduced: boolean;
  id: string;
  tone: CardTone;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 2);
  const more = items.length - 2;
  if (!items.length) return null;
  return (
    <Section title={title} kicker={kicker} id={id} reduced={reduced}>
      <Card tone={tone} shadow="lg" pad="lg">
        <ol>
          {shown.map((s, i) => (
            <Entry key={s.id} s={s} last={i === shown.length - 1} reduced={reduced} />
          ))}
        </ol>
        {more > 0 && (
          <>
            <Dashed className="mb-4 mt-6" />
            <Button variant="secondary" size="sm" onClick={() => setAll(!all)} aria-expanded={all} icon={<FiChevronDown className={cx("transition-transform", all && "rotate-180")} />}>
              {all ? "Show fewer" : `Show ${more} more ${more === 1 ? noun : `${noun}s`}`}
            </Button>
          </>
        )}
      </Card>
    </Section>
  );
}

/* ── Skills ──────────────────────────────────────────────────────────────── */

export function Skills({ p, reduced }: { p: Profile; reduced: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  const stints = [...p.experience, ...p.projects];
  const groups: { where: string; skills: Profile["skills"] }[] = [];
  for (const s of p.skills) {
    const g = groups.find((x) => x.where === s.where);
    if (g) g.skills.push(s);
    else groups.push({ where: s.where, skills: [s] });
  }
  const orgFor = (where: string) => {
    const own = p.skills.find((s) => s.where === where && s.org)?.org;
    if (own) return own;
    const w = where.split(" ")[0];
    return stints.find((s) => s.title.startsWith(w) || s.org.name.includes(w))?.org;
  };
  if (!p.skills.length) return null;
  return (
    <Section
      kicker="Each next to where it was used"
      kickerTone="orange"
      title={
        <>
          {p.first}’s <Mark color={MARK.yellow}>stack</Mark>
        </>
      }
      id="pv2-skills"
      sub="Tap a skill to see the resume line behind it."
      reduced={reduced}
    >
      <Card tone="white" shadow="lg" pad="none" className="overflow-hidden">
        <ul className="divide-y-2 divide-dashed divide-studojo-ink/15">
          {groups.map((g) => {
            const org = orgFor(g.where);
            const resume = g.where === "Resume";
            const open = g.skills.find((s) => s.name === sel);
            return (
              <li key={g.where} className={cx("px-4 py-4 sm:px-6 sm:py-5", resume && "bg-studojo-surface-muted/60")}>
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {org ? (
                    <OrgTile org={org} size={40} />
                  ) : (
                    <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-studojo-ink bg-white shadow-[2px_2px_0_0_#191a23]">
                      <FiFileText />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">{resume ? "Listed on the resume" : "Used at"}</p>
                    <p className="font-clash text-lg font-semibold leading-tight text-studojo-ink">{resume ? "Also knows" : g.where}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {g.skills.map((s) => (
                        <Chip key={s.name} tone="you" selected={sel === s.name} onClick={() => setSel(sel === s.name ? null : s.name)} aria-controls={`pv2-skill-${s.name}`}>
                          {s.name}
                        </Chip>
                      ))}
                    </div>
                    <Reveal open={!!open} reduced={reduced} id={open ? `pv2-skill-${open.name}` : undefined}>
                      {open && (
                        <div className="pt-3.5">
                          <ResumeLines ids={open.evidence} title={`${open.name}, from the resume`} />
                        </div>
                      )}
                    </Reveal>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </Section>
  );
}

/* ── Prompt answers ──────────────────────────────────────────────────────── */

/** Highlight the answer's opening phrase: up to the first full stop or comma. */
function leadSplit(a: string): [string, string] {
  const m = a.match(/^[^.,]{3,60}[.,]/);
  return m ? [m[0], a.slice(m[0].length)] : ["", a];
}

const PROMPT_LOOK: { tone: CardTone; kicker: KickerTone; mark: string; tilt: string }[] = [
  { tone: "white", kicker: "pink", mark: MARK.pink, tilt: "lg:-rotate-1" },
  { tone: "white", kicker: "green", mark: MARK.green, tilt: "lg:rotate-1" },
];

export function Prompts({ p, reduced }: { p: Profile; reduced: boolean }) {
  if (!p.prompts.length) return null;
  return (
    <section aria-label={`In ${p.first}’s words`} className="space-y-8 pt-14 sm:space-y-10 sm:pt-20">
      {p.prompts.map((q, i) => {
        const look = PROMPT_LOOK[i % PROMPT_LOOK.length];
        const [lead, rest] = leadSplit(q.a);
        return (
          <Rise key={q.q} reduced={reduced} className={look.tilt}>
            <Card tone={look.tone} shadow="lg" pad="lg" className="relative">
              <span aria-hidden className="absolute -top-5 right-5 grid h-11 w-11 place-items-center rounded-full border-2 border-studojo-ink bg-studojo-yellow-bg font-clash text-3xl font-bold leading-none shadow-[2px_2px_0_0_#191a23] sm:right-7">
                <span className="mt-3">“</span>
              </span>
              <Kicker tone={look.kicker}>{q.q}</Kicker>
              <p className="mt-4 font-clash text-[1.625rem] font-semibold leading-[1.22] text-studojo-ink [word-spacing:0.04em] sm:text-[2.125rem]" style={{ textWrap: "pretty" }}>
                {lead && <Mark color={look.mark}>{lead}</Mark>}
                {rest}
              </p>
            </Card>
          </Rise>
        );
      })}
    </section>
  );
}

/* ── Proof ───────────────────────────────────────────────────────────────── */

function Claim({ c, reduced }: { c: Profile["claims"][number]; reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={id}
        className={cx("group grid min-h-12 w-full grid-cols-[22px_1fr_auto] items-start gap-x-3 px-4 py-3.5 text-left hover:bg-studojo-purple-bg sm:px-5", FOCUS_RING, open && "bg-studojo-purple-bg")}
      >
        <span aria-hidden className="mt-[1px] grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-studojo-ink bg-studojo-green text-studojo-ink">
          <FiCheck className="h-3 w-3" strokeWidth={4} />
        </span>
        <span className="font-satoshi text-base leading-[1.45] text-studojo-ink" style={{ textWrap: "pretty" }}>
          {c.text}
        </span>
        <span className="flex items-center gap-2 pt-[2px]">
          <span className="hidden font-satoshi text-[11px] font-bold uppercase tracking-[0.1em] text-studojo-muted sm:inline">{CLAIM_SECTION_LABEL[c.section as keyof typeof CLAIM_SECTION_LABEL] ?? ""}</span>
          <FiChevronDown className={cx("h-4 w-4 text-studojo-ink transition-transform duration-300", open && "rotate-180")} aria-hidden />
        </span>
      </button>
      <Reveal open={open} reduced={reduced} id={id}>
        <div className="bg-studojo-purple-bg px-4 pb-4 pl-[50px] sm:px-5 sm:pl-[54px]">
          <ResumeLines ids={c.evidence} />
        </div>
      </Reveal>
    </li>
  );
}

export function Proof({ p, reduced }: { p: Profile; reduced: boolean }) {
  const n = p.claims.length;
  if (!n) return null;
  return (
    <Section
      kicker="Proof"
      kickerTone="green"
      title={
        <>
          Checked against <Mark color={MARK.green}>{p.first}’s resume</Mark>
        </>
      }
      id="pv2-proof"
      sub={`Every claim on this page was read from ${p.first}’s resume. Open one to see the exact lines.`}
      reduced={reduced}
    >
      <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal-lg">
        <div className="flex items-center justify-between gap-3 rounded-t-[14px] border-b-2 border-studojo-ink bg-studojo-ink px-4 py-3 text-white sm:px-5">
          <span className="font-clash text-lg font-semibold">Claims</span>
          <Badge kind="success" icon={<FiCheck strokeWidth={4} />} className="border-white">
            {n} of {n} matched
          </Badge>
        </div>
        <ul className="divide-y-2 divide-dashed divide-studojo-ink/15">
          {p.claims.map((c) => (
            <Claim key={c.id} c={c} reduced={reduced} />
          ))}
        </ul>
        <p className="rounded-b-[14px] border-t-2 border-dashed border-studojo-ink bg-studojo-purple-bg px-4 py-2.5 font-satoshi text-xs text-studojo-muted tabular-nums sm:px-5">
          {n} of {n} claims matched to a line on {p.first}’s resume.
        </p>
      </div>
    </Section>
  );
}

