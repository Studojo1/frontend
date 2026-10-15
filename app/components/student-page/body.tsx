// Copied from Studojo1/outreach-flow (app/components/profile-ideas/v2/body.tsx), which
// drafts the page in its onboarding flow; keep the two in step.
// Shared page shell for the v2 profile ideas, in the onboarding's language: the
// flow's top bar (wordmark, ink rule), the idea's hero, then a two-column body
// on the dotted lilac ground (main column + sticky profile card on desktop; a
// sticky bottom bar on phone) and a dark footer band.
import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { FiCheck, FiMapPin } from "react-icons/fi";
import { Badge, Card } from "./ui";
import type { HeroProps, Org, Profile } from "./types";
import { CopyLink, DOTS, DOTS_DARK, EmailPill, joinDot, Kicker, LinesContext, MARK, Mark, OrgTile, Portrait, Wordmark } from "./body-ui";
import { LookingFor, Numbers, Prompts, Proof, Skills, Timeline } from "./body-sections";

/**
 * Height of whatever sticky bar sits just above this page (the route's idea
 * switcher here; nothing in production), so our own sticky bits stack under it.
 */
function useStackTop() {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  useEffect(() => {
    const prev = ref.current?.previousElementSibling as HTMLElement | null;
    if (!prev) return;
    const pos = getComputedStyle(prev).position;
    if (pos !== "sticky" && pos !== "fixed") return;
    const ro = new ResizeObserver(() => setTop(Math.round(prev.getBoundingClientRect().height)));
    ro.observe(prev);
    return () => ro.disconnect();
  }, []);
  return { ref, top };
}

/** Top bar height: h-14 plus its 2px ink rule. */
const BAR = 58;

/** What they want, in one line: "Data analyst intern · Jun 2027", or "" when they did not say. */
const lookingLine = (p: Profile) => joinDot(p.target.role.replace("Software engineering", "SWE"), p.target.start);

/** The org tile on the profile card: the featured one, else their latest role or project. */
/** The org on the card: from the resume only (a role read from LinkedIn carries source "linkedin"). */
const cardOrg = (p: Profile): Org | undefined =>
  p.feature?.org ?? p.experience.find((s) => !(s as { source?: string }).source)?.org ?? p.projects[0]?.org;

export default function ProfileBody<P extends Profile>({ p, reduced, Hero }: { p: P; reduced: boolean; Hero: ComponentType<HeroProps<P>> }) {
  const { ref, top } = useStackTop();
  const vars = { ...DOTS, "--pv2-top": `${top}px` } as CSSProperties;
  return (
    <LinesContext.Provider value={p.lines}>
    <div ref={ref} style={vars} className="relative font-satoshi text-studojo-ink antialiased [overflow-x:clip]">
      <style>{`@keyframes pv2-pop{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:none}}`}</style>

      <TopBar p={p} reduced={reduced} />

      <Hero p={p} reduced={reduced} />

      <Seam p={p} />

      <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-28 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-x-16">
        <div className="mx-auto w-full max-w-[720px] lg:mx-0">
          <LookingFor p={p} reduced={reduced} />
          <Numbers p={p} reduced={reduced} />
          <Timeline
            title={<Mark color={MARK.pink}>Experience</Mark>}
            kicker={`Work · ${p.experience.length}`}
            id="pv2-exp"
            noun="experience"
            items={p.experience}
            reduced={reduced}
            tone="pink"
          />
          <Timeline
            title={<Mark color={MARK.yellow}>Projects</Mark>}
            kicker={`Things ${p.first} built · ${p.projects.length}`}
            id="pv2-proj"
            noun="project"
            items={p.projects}
            reduced={reduced}
            tone="yellow"
          />
          <Timeline title={<Mark color={MARK.green}>Education</Mark>} kicker="Study" id="pv2-edu" noun="school" items={p.education} reduced={reduced} tone="green" />
          <Skills p={p} reduced={reduced} />
          <Prompts p={p} reduced={reduced} />
          <Proof p={p} reduced={reduced} />
        </div>
        <aside className="hidden lg:block" aria-label={`${p.name}, at a glance`}>
          <div className="sticky pt-2" style={{ top: `calc(var(--pv2-top) + ${BAR + 24}px)` }}>
            <ProfileCard p={p} reduced={reduced} />
          </div>
        </aside>
      </div>

      <PhoneBar p={p} />
      <Footer p={p} reduced={reduced} />
    </div>
    </LinesContext.Provider>
  );
}

function TopBar({ p, reduced }: { p: Profile; reduced: boolean }) {
  return (
    <header className="sticky z-40 border-b-2 border-studojo-ink bg-white/95 backdrop-blur" style={{ top: "var(--pv2-top)" }}>
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <a href="/" aria-label="Studojo" className="flex min-h-11 shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-studojo-purple/40">
          <Wordmark />
        </a>
        <div className="flex-1" />
        <CopyLink p={p} reduced={reduced} variant="icon" className="h-10 w-10 lg:hidden" />
        <span className="hidden items-center gap-2 lg:flex">
          <CopyLink p={p} reduced={reduced} variant="ghost" size="sm" label="Copy link" />
          <EmailPill p={p} size="sm" className="min-h-10" />
        </span>
      </div>
    </header>
  );
}

/** Where the hero hands over to the body: a dashed rule with a pill, like the intro's connectors. */
function Seam({ p }: { p: Profile }) {
  return (
    <div aria-hidden className="mx-auto max-w-[1200px] px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="h-0 flex-1 border-t-2 border-dashed border-studojo-ink/35" />
        <span className="rounded-full border-2 border-studojo-ink bg-white px-3.5 py-1.5 shadow-[2px_2px_0_0_#191a23]">
          <Kicker>{p.first}, in full</Kicker>
        </span>
        <span className="h-0 flex-1 border-t-2 border-dashed border-studojo-ink/35" />
      </div>
    </div>
  );
}

function ProfileCard({ p, reduced }: { p: Profile; reduced: boolean }) {
  const t = p.target;
  const org = cardOrg(p);
  const place = joinDot(p.city, p.classOf && `Class of ${p.classOf}`);
  return (
    <Card shadow="lg" pad="none" className="p-4 xl:p-5">
      <div className="relative">
        <div className="aspect-[4/3] -rotate-[1.5deg] overflow-hidden rounded-xl border-2 border-studojo-ink shadow-brutal [@media(max-height:860px)]:aspect-[16/9]">
          <Portrait p={p} />
        </div>
        {org && (
          <div className="absolute -bottom-5 right-3 rotate-6">
            <OrgTile org={org} size={56} />
          </div>
        )}
      </div>
      <h2 className="mt-5 pr-16 font-clash text-[1.75rem] font-semibold leading-[1.1]">{p.name}</h2>
      <p className="mt-2 font-satoshi text-[15px] font-medium leading-[1.45] text-studojo-ink" style={{ textWrap: "pretty" }}>
        {p.headline}
      </p>
      {place && (
        <p className="mt-2 flex items-center gap-1.5 font-satoshi text-sm text-studojo-muted">
          <FiMapPin className="h-4 w-4" aria-hidden />
          {place}
        </p>
      )}

      {(t.role || t.cities.length > 0 || t.remote) && (
      <div className="mt-4 border-t-2 border-dashed border-studojo-ink/25 pt-3.5">
        <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-purple-strong">Looking for</p>
        {t.role && (
          <p className="mt-1 font-satoshi text-[15px] font-bold leading-[1.4]">
            {joinDot(t.role, t.start)}
          </p>
        )}
        {(t.cities.length > 0 || t.remote) && (
        <p className="mt-2 flex flex-wrap items-center gap-1.5">
          {t.cities.map((c) => (
            <span key={c.code} title={c.label} className="rounded-md border-2 border-studojo-ink bg-studojo-purple-bg px-1.5 font-satoshi text-[11px] font-bold leading-5 tracking-[0.06em]">
              {c.code}
            </span>
          ))}
          {t.remote && <span className="px-0.5 font-satoshi text-xs font-medium text-studojo-muted">{t.cities.length ? "+ remote" : "Remote"}</span>}
        </p>
        )}
      </div>
      )}

      <div className="mt-4 grid gap-2.5">
        <EmailPill p={p} className="w-full" />
        <CopyLink p={p} reduced={reduced} variant="ghost" className="w-full" />
      </div>
    </Card>
  );
}

/** Phone and tablet: the card becomes a bar pinned to the bottom, resting above the footer. */
function PhoneBar({ p }: { p: Profile }) {
  return (
    <div className="sticky bottom-0 z-40 border-t-2 border-studojo-ink bg-white/95 backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="mx-auto flex max-w-[720px] items-center gap-3 px-4 py-2.5 sm:px-6">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 border-studojo-ink">
          <Portrait p={p} size="thumb" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-clash text-[17px] font-semibold leading-tight">{p.name}</p>
          <p className="mt-0.5 truncate font-satoshi text-[13px] leading-tight text-studojo-muted">
            {lookingLine(p) || p.headline}
          </p>
        </div>
        {p.email ? <EmailPill p={p} size="sm" className="shrink-0" /> : <CopyLink p={p} reduced={false} variant="icon" className="shrink-0" />}
      </div>
    </div>
  );
}

function Footer({ p, reduced }: { p: Profile; reduced: boolean }) {
  return (
    <footer className="relative overflow-hidden border-t-2 border-studojo-ink bg-studojo-ink text-white">
      <div aria-hidden className="absolute inset-0" style={DOTS_DARK} />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-8 pt-16 sm:px-6 sm:pt-20 lg:pt-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:gap-16">
          <div>
            <Kicker tone="light">{p.target.role ? [p.target.role, p.target.start && `from ${p.target.start}`].filter(Boolean).join(", ") : `${p.name} on Studojo`}</Kicker>
            <h2 className="mt-4 font-clash text-[3.25rem] font-semibold leading-[0.98] [word-spacing:0.04em] sm:text-[5rem] lg:text-[5.75rem]" style={{ textWrap: "balance" }}>
              Get to {p.first} <Mark color={MARK.purple}>first.</Mark>
            </h2>
            <p className="mt-5 max-w-[46ch] font-satoshi text-base text-white/70 sm:text-lg">{footerLine(p)}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-4">
              <EmailPill p={p} size="lg" tone="light" />
              <CopyLink p={p} reduced={reduced} variant="onDark" size="lg" />
            </div>
          </div>
          <MiniStack p={p} />
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-white/20 pt-6 sm:mt-24">
          <span className="inline-flex items-center gap-2 font-satoshi text-sm text-white/60">
            Made with <Wordmark dark className="text-xl" />
          </span>
          <span className="inline-flex items-center gap-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
            <FiCheck aria-hidden strokeWidth={4} /> Every line checked against {p.first}’s resume
          </span>
        </div>
      </div>
    </footer>
  );
}

/** "Riya is looking for an internship, ideally at early-stage startups." Falls back to the headline. */
function footerLine(p: Profile) {
  const t = p.target;
  if (!t.type && !t.stage) return p.headline;
  const what = t.type ? `${/^[aeiou]/i.test(t.type) ? "an" : "a"} ${t.type.toLowerCase()}` : t.role ? `${/^[aeiou]/i.test(t.role) ? "an" : "a"} ${t.role.toLowerCase()} role` : "the right team";
  return `${p.first} is looking for ${what}${t.stage ? `, ideally at ${t.stage.toLowerCase()}` : ""}.`;
}

/** Desktop only: their card, tilted on a lilac card, like the intro's stack. */
function MiniStack({ p }: { p: Profile }) {
  return (
    <div aria-hidden className="relative mx-auto mt-14 hidden h-[230px] w-[320px] lg:mt-0 lg:block">
      <div className="absolute inset-x-4 top-4 h-[190px] rotate-[4deg] rounded-2xl border-2 border-white bg-studojo-purple" />
      <div className="absolute inset-x-0 top-0 -rotate-2 rounded-2xl border-2 border-studojo-ink bg-white p-4 text-studojo-ink shadow-[6px_6px_0_0_#8b5cf6]">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-studojo-ink">
            <Portrait p={p} size="thumb" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-clash text-xl font-semibold leading-tight">{p.name}</p>
            <p className="truncate font-satoshi text-xs text-studojo-muted">{joinDot(p.city, p.classOf && `Class of ${p.classOf}`) || p.college}</p>
          </div>
        </div>
        <div className="mt-3.5 border-t-2 border-dashed border-studojo-ink/20 pt-3">
          <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-purple-strong">{p.target.role ? "Looking for" : "Headline"}</p>
          <p className="mt-0.5 line-clamp-2 font-satoshi text-sm font-bold">{p.target.role || p.headline}</p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Badge kind="success" icon={<FiCheck strokeWidth={4} />}>
            Resume-checked
          </Badge>
          <span className="font-satoshi text-xs font-bold tabular-nums">{p.target.start}</span>
        </div>
      </div>
    </div>
  );
}
