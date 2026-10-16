// The student page's sections, top to bottom: the hero (who they are, what
// they are looking for and how their claims held up against their resume),
// Highlights, About, Experience / Projects / Education, Awards and Skills.
// Every component takes a slice of the view model; nothing here decides data.
import { forwardRef, Fragment, useId, useState } from "react";
import { Card, EmailButton, Icon, ItemLi, ItemLists, Meter, MoreButton, Rich, Seal, Section, SourceButton, SourcePanel, useDisclosure } from "./atoms";
import type { AboutView, AwardsView, EntryView, HighlightView, LookingView, ProfileView, SkillGroupView, StintSectionView } from "./profile-view";

const NAME_SIZE = {
  m: "text-[34px] leading-[1.04] sm:text-[50px] sm:leading-[1.02]",
  l: "text-[30px] leading-[1.06] sm:text-[44px] sm:leading-[1.04]",
  xl: "text-[26px] leading-[1.1] sm:text-[38px] sm:leading-[1.06]",
} as const;

function Avatar({ v }: { v: ProfileView }) {
  if (v.photo) {
    return <img src={v.photo} alt={`Photo of ${v.name}`} className="h-16 w-16 rounded-[18px] object-cover shadow-[0_12px_28px_-14px_rgba(76,29,149,0.55)] ring-4 ring-white sm:h-[92px] sm:w-[92px] sm:rounded-[26px]" />;
  }
  return (
    <div aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-[18px] bg-gradient-to-br from-lilac-200 to-lilac-50 shadow-[0_12px_28px_-16px_rgba(76,29,149,0.45)] ring-4 ring-white sm:h-[92px] sm:w-[92px] sm:rounded-[26px]">
      <span className="font-clash text-[24px] font-medium tracking-[-0.02em] text-studojo-purple-strong sm:text-[32px]">{v.initials}</span>
    </div>
  );
}

const ROW_LABEL: Record<LookingView["rows"][number]["k"], (v: string) => string> = {
  Company: () => "Companies",
  Location: (v) => (v.includes(", ") ? "Cities" : "City"),
  Remote: () => "Remote",
};

/** What they are looking for, as the white card floating in the hero. */
function LookingCard({ looking, first, email }: { looking: LookingView; first: string; email: string | null }) {
  return (
    <aside aria-labelledby="looking-h" className="mt-6 overflow-hidden rounded-[22px] border border-white bg-white shadow-lilac-card sm:mt-8 lg:mt-0">
      <div className="px-5 pb-4 pt-5 sm:px-6">
        <h2 id="looking-h" className="text-[13px] font-medium text-studojo-purple-strong">
          {first} is looking for
        </h2>
        {looking.main && (
          <p className="mt-1.5 text-balance text-[21px] font-bold leading-tight tracking-[-0.01em] text-studojo-ink">
            <Rich text={looking.main} />
          </p>
        )}
        {looking.sub && (
          <p className="mt-1 text-[15px] leading-snug text-neutral-700">
            <Rich text={looking.sub} />
          </p>
        )}
      </div>
      {looking.rows.length > 0 && (
        <dl className="mx-5 divide-y divide-lilac-line border-t border-lilac-line sm:mx-6">
          {looking.rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 py-3">
              <dt className="text-[13.5px] leading-snug text-neutral-600">{ROW_LABEL[r.k](r.v)}</dt>
              <dd className="text-[14.5px] leading-snug text-studojo-ink">
                <Rich text={r.v} />
              </dd>
            </div>
          ))}
        </dl>
      )}
      {email ? (
        <div className="sp-no-print px-5 pb-5 pt-2 sm:px-6">
          <EmailButton email={email} first={first} size="wide" />
        </div>
      ) : (
        <div className="h-2" />
      )}
    </aside>
  );
}

/** The hero: the student, what they want, and a strip with how their claims held up against their resume. */
export const Hero = forwardRef<HTMLElement, { v: ProfileView }>(function Hero({ v }, ref) {
  const facts = (
    [
      ["Studying", v.degree],
      ["College", v.college],
      ["Class of", v.classOf],
      ["Based in", v.city],
    ] as const
  ).filter(([, x]) => x);
  const when = [v.classOf ? `Class of ${v.classOf}` : "", v.city].filter(Boolean);
  return (
    <section id="intro" ref={ref} aria-label="Profile" className="sp-wash rounded-[28px] border border-lilac-200/80 px-5 pb-5 pt-6 sm:rounded-[32px] sm:p-8 lg:p-10">
      <div className={v.looking ? "lg:grid lg:grid-cols-[minmax(0,1fr)_356px] lg:items-start lg:gap-12" : ""}>
        <div className="min-w-0">
          <Avatar v={v} />
          <h1 className={`mt-5 text-balance font-clash font-medium tracking-[-0.02em] text-studojo-ink sm:mt-6 ${NAME_SIZE[v.nameSize]}`}>{v.name}</h1>
          {v.headline && (
            <p className="mt-3 max-w-[38ch] text-pretty text-[17px] leading-snug text-neutral-700 sm:text-[20px]">
              <Rich text={v.headline} />
            </p>
          )}
          {/* Phones: two quiet lines with icons. From 640px: the labelled facts. */}
          {(v.degree || v.college || when.length > 0) && (
            <div className="mt-4 flex flex-col gap-1.5 text-[14.5px] text-neutral-600 sm:hidden">
              {(v.degree || v.college) && (
                <p className="flex min-w-0 items-start gap-2">
                  <Icon name="cap" size={17} className="mt-[1px]" />
                  <span>
                    <Rich text={[v.degree, v.college].filter(Boolean).join(", ")} />
                  </span>
                </p>
              )}
              {when.length > 0 && (
                <p className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {v.classOf && (
                    <span className="flex items-start gap-2">
                      <Icon name="calendar" size={16} className="mt-[1px]" />
                      Class of {v.classOf}
                    </span>
                  )}
                  {v.city && (
                    <span className="flex items-start gap-2">
                      <Icon name="pin" size={16} className="mt-[1px]" />
                      <Rich text={v.city} />
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
          {facts.length > 0 && (
            <dl className="mt-7 hidden grid-cols-2 gap-x-10 gap-y-5 border-t border-lilac-200 pt-6 sm:grid">
              {facts.map(([k, x]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-600">{k}</dt>
                  <dd className="mt-1 text-[15.5px] font-medium leading-snug text-studojo-ink">
                    <Rich text={x} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="sp-print-only mt-3 text-[12px] text-neutral-600">{v.url}</p>
        </div>
        {v.looking && <LookingCard looking={v.looking} first={v.first} email={v.email} />}
      </div>
      {v.proof ? (
        <a href="#proof" className="group mt-6 flex items-center gap-4 rounded-[20px] border border-white/80 bg-white/75 px-4 py-3.5 shadow-lilac-soft backdrop-blur-sm transition-colors hover:bg-white sm:mt-8 sm:gap-5 sm:px-5 sm:py-4">
          <Seal all={v.proof.all} size={46} />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-tight text-studojo-ink">{v.proof.all ? "Resume-checked profile" : "Checked against the resume"}</span>
            <span className="mt-1 block text-[13.5px] leading-snug text-neutral-600">
              <span className="font-semibold text-studojo-ink">
                {v.proof.matched} of {v.proof.total} claims
              </span>{" "}
              matched to {v.poss} resume
              {v.updated && (
                <>
                  <span aria-hidden="true" className="px-1.5 text-neutral-400">
                    {"·"}
                  </span>
                  <span className="whitespace-nowrap">Updated {v.updated}</span>
                </>
              )}
            </span>
            <span className="mt-2.5 block max-w-[360px]">
              <Meter matched={v.proof.matched} total={v.proof.total} />
            </span>
          </span>
          <span className="hidden items-center gap-1 whitespace-nowrap text-[14px] font-medium text-studojo-purple-strong sm:inline-flex">
            See the proof
            <Icon name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>
      ) : (
        v.updated && <p className="mt-6 text-[13px] text-neutral-600">Updated {v.updated}</p>
      )}
    </section>
  );
});

function HighlightTile({ h, stacked, poss }: { h: HighlightView; stacked: boolean; poss: string }) {
  const d = useDisclosure();
  // A row on phones (figure beside its label) unless a long figure needs the whole width; a tile from 640px.
  const shape = stacked ? "flex flex-col" : "grid grid-cols-[minmax(80px,max-content)_minmax(0,1fr)] items-baseline gap-x-4 sm:flex sm:flex-col sm:items-stretch";
  return (
    <div className={`${shape} rounded-[20px] border border-lilac-200/70 bg-lilac-50 p-4 sm:p-5`}>
      <p className="sp-tnum font-clash text-[26px] font-medium leading-none tracking-[-0.02em] text-studojo-purple-strong [overflow-wrap:anywhere] sm:text-[32px]">{h.value}</p>
      <div className={`flex min-w-0 flex-1 flex-col ${stacked ? "mt-2.5" : "sm:mt-3"}`}>
        <p className="text-pretty text-[14.5px] leading-snug text-neutral-700">
          <Rich text={h.label} />
        </p>
        {h.ref && (
          <div className="mt-auto pt-2.5">
            <SourceButton open={d.open} controls={d.id} onClick={d.toggle} label={h.ref.label} context={`${h.value} ${h.label}`} />
          </div>
        )}
      </div>
      {h.ref && (
        <div className="col-span-2 min-w-0">
          <SourcePanel id={d.id} open={d.open} lines={h.ref.lines} poss={poss} />
        </div>
      )}
    </div>
  );
}

const TILE_COLS = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" } as const;

/** The numbers, as lilac tiles; each opens to the resume line it came from. */
export function Highlights({ items, stacked, poss }: { items: HighlightView[]; stacked: boolean; poss: string }) {
  const cols = TILE_COLS[Math.min(4, Math.max(1, items.length)) as 1 | 2 | 3 | 4];
  return (
    <Section id="highlights" title="Highlights" sub={`Numbers from ${poss} resume. Open a source to see the line.`}>
      <div className={`grid gap-3 ${cols}`}>
        {items.map((h) => (
          <HighlightTile key={`${h.value}|${h.label}`} h={h} stacked={stacked} poss={poss} />
        ))}
      </div>
    </Section>
  );
}

/** The student's own words: About, then their answers in lilac cards. */
export function About({ about, poss }: { about: AboutView; poss: string }) {
  return (
    <Section id="about" title="About" sub={`In ${poss} own words`}>
      {about.text && (
        <p className="max-w-[66ch] text-pretty text-[17px] leading-[1.7] text-neutral-700">
          <Rich text={about.text} />
        </p>
      )}
      {about.prompts.length > 0 && (
        <div className={`grid gap-3 ${about.text ? "mt-6" : ""} ${about.prompts.length > 1 ? "md:grid-cols-2" : ""}`}>
          {about.prompts.map((q, i) => (
            <figure key={i} className="rounded-[20px] border border-lilac-200/70 bg-lilac-50 px-5 py-5 sm:px-6">
              {q.q && (
                <figcaption className="text-[13px] font-medium text-studojo-purple-strong">
                  <Rich text={q.q} />
                </figcaption>
              )}
              <blockquote className="mt-2 max-w-[66ch] text-pretty text-[16.5px] leading-relaxed text-studojo-ink">
                <Rich text={q.a} />
              </blockquote>
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}

const SMALL_WORDS = new Set(["of", "and", "the", "in", "at", "for", "to", "a", "an", "on", "&"]);
/** "Mariana AI" to "MA", "Fitmedik" to "F": from a real org name only (entries the mapper trusts), never from resume sentences. */
const initialsOf = (name: string) =>
  name
    .replace(/\(.*?\)/g, "")
    .split(/[\s,]+/)
    .filter((w) => w && !SMALL_WORDS.has(w.toLowerCase()) && /[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase())
    .join("");

function EntryMark({ kind, org, title }: { kind: StintSectionView["kind"]; org: string; title: string }) {
  const base = "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lilac-100 text-studojo-purple-strong ring-1 ring-inset ring-lilac-200 sm:h-11 sm:w-11";
  if (kind === "education") {
    return (
      <span aria-hidden="true" className={base}>
        <Icon name="cap" size={20} />
      </span>
    );
  }
  const text = initialsOf(org || title) || "\u2022";
  return (
    <span aria-hidden="true" className={`${base} font-clash text-[15px] font-medium tracking-[-0.01em]`}>
      {text}
    </span>
  );
}

function Entry({ e, kind, poss }: { e: EntryView; kind: StintSectionView["kind"]; poss: string }) {
  const src = useDisclosure();
  const more = useDisclosure();
  const moreId = `${more.id}-more`;
  const what = [e.title, e.org].filter(Boolean).join(", ");
  const sub = [e.org, e.place].filter(Boolean);
  const when = [e.dates, e.span].filter(Boolean).join(" · ");
  const hidden = e.body.length - e.shown;
  return (
    <li className="px-5 py-5 sm:px-6">
      <article className="flex gap-4">
        <EntryMark kind={kind} org={e.org} title={e.title} />
        <div className="min-w-0 flex-1">
        <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold leading-snug text-studojo-ink">
              <Rich text={e.title} />
            </h3>
            {sub.length > 0 && (
              <p className="mt-0.5 flex flex-wrap gap-x-1.5 text-[15px] leading-snug text-neutral-600">
                {sub.map((x, i) => (
                  <Fragment key={i}>
                    {i > 0 && (
                      <span aria-hidden="true" className="text-neutral-400">
                        {"·"}
                      </span>
                    )}
                    <span className={i === 0 ? "font-medium text-neutral-700" : ""}>
                      <Rich text={x} />
                    </span>
                  </Fragment>
                ))}
              </p>
            )}
            {e.sub && (
              <p className="mt-0.5 text-[15px] leading-snug text-neutral-600">
                <Rich text={e.sub} />
              </p>
            )}
          </div>
          {when && <p className="sp-tnum mt-1 shrink-0 text-[14px] text-neutral-600 sm:mt-0 sm:text-right">{when}</p>}
        </div>
        {e.note && (
          <p className="mt-2.5 max-w-[64ch] text-pretty text-[15px] leading-relaxed text-neutral-700">
            <Rich text={e.note} />
          </p>
        )}
        {e.body.length > 0 && (
          <div className="mt-3">
            <ItemLists items={e.body} shown={e.shown} moreId={moreId} moreOpen={more.open} />
          </div>
        )}
        {(hidden > 0 || e.ref) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5">
            {hidden > 0 && <MoreButton count={hidden} open={more.open} controls={moreId} onClick={more.toggle} what={what} />}
            {e.ref && <SourceButton open={src.open} controls={src.id} onClick={src.toggle} label={e.ref.label} context={what} />}
          </div>
        )}
        {e.ref && <SourcePanel id={src.id} open={src.open} lines={e.ref.lines} poss={poss} />}
        </div>
      </article>
    </li>
  );
}

function Pool({ pool, label, poss, under }: { pool: NonNullable<StintSectionView["pool"]>; label: string; poss: string; under: boolean }) {
  const more = useDisclosure();
  const moreId = `${more.id}-more`;
  const hidden = pool.items.length - pool.shown;
  return (
    <div className={`${under ? "border-t border-lilac-line bg-lilac-50/50 " : ""}px-5 py-5 sm:px-6`}>
      <p className="mb-3.5 flex items-center gap-2 text-[13px] font-medium text-neutral-600">
        <Icon name="file" size={15} />
        {under ? `Also under ${label} on ${poss} resume` : `As written on ${poss} resume`}
      </p>
      <ItemLists items={pool.items} shown={pool.shown} moreId={moreId} moreOpen={more.open} />
      {hidden > 0 && (
        <div className="mt-3">
          <MoreButton count={hidden} open={more.open} controls={moreId} onClick={more.toggle} what={label} />
        </div>
      )}
    </div>
  );
}

/** Experience, Projects or Education: a white card of entries, then what the resume says that could not be tied to an entry. */
export function StintSection({ section, poss }: { section: StintSectionView; poss: string }) {
  return (
    <Section id={section.kind} title={section.label}>
      <Card>
        {section.entries.length > 0 && (
          <ul role="list" className="divide-y divide-lilac-line">
            {section.entries.map((e) => (
              <Entry key={e.key} e={e} kind={section.kind} poss={poss} />
            ))}
          </ul>
        )}
        {section.pool && <Pool pool={section.pool} label={section.label} poss={poss} under={section.entries.length > 0} />}
      </Card>
    </Section>
  );
}

/** Awards (or Activities): resume lines nothing else on the page uses, grouped under the resume's own headings. */
export function Awards({ awards, poss }: { awards: AwardsView; poss: string }) {
  const base = useId();
  const src = useDisclosure();
  const [moreOpen, setMoreOpen] = useState(false);
  let left = awards.shown;
  const blocks = awards.groups.map((g, i) => {
    const head = g.items.slice(0, Math.max(0, left));
    const rest = g.items.slice(head.length);
    left -= head.length;
    return { caption: g.caption, head, rest, restId: `${base}-more-${i}` };
  });
  const restIds = blocks.filter((b) => b.rest.length).map((b) => b.restId).join(" ");
  const hidden = awards.count - awards.shown;
  return (
    <Section id="awards" title={awards.label}>
      <Card className="px-5 py-5 sm:px-6">
        {blocks.map((b, i) => (
          <div key={b.restId} className={i ? "mt-6" : ""}>
            {b.caption && <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.06em] text-neutral-600">{b.caption}</p>}
            {b.head.length > 0 && (
              <ul role="list" className="space-y-2.5">
                {b.head.map((o, k) => (
                  <ItemLi key={k} item={o} />
                ))}
              </ul>
            )}
            {b.rest.length > 0 && (
              <ul id={b.restId} role="list" data-more-list="" hidden={!moreOpen} className="mt-2.5 space-y-2.5">
                {b.rest.map((o, k) => (
                  <ItemLi key={k} item={o} />
                ))}
              </ul>
            )}
          </div>
        ))}
        {(hidden > 0 || awards.ref) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-5">
            {hidden > 0 && restIds && <MoreButton count={hidden} open={moreOpen} controls={restIds} onClick={() => setMoreOpen((o) => !o)} what={awards.label} />}
            {awards.ref && <SourceButton open={src.open} controls={src.id} onClick={src.toggle} label={awards.ref.label} context={awards.label} />}
          </div>
        )}
        {awards.ref && <SourcePanel id={src.id} open={src.open} lines={awards.ref.lines} poss={poss} />}
      </Card>
    </Section>
  );
}

function SkillGroup({ g, solo, poss }: { g: SkillGroupView; solo: boolean; poss: string }) {
  const d = useDisclosure();
  const pills = (
    <div className="flex flex-wrap items-center gap-2">
      <ul role="list" className="contents">
        {g.names.map((n) => (
          <li key={n} data-skill="" className="inline-flex min-h-8 max-w-full items-center rounded-full bg-lilac-100 px-3 py-1 text-[14px] font-medium leading-tight text-studojo-ink">
            {n}
          </li>
        ))}
        {g.more > 0 && (
          <li data-skill="" className="inline-flex min-h-8 items-center px-1 text-[14px] text-neutral-600">
            and {g.more} more
          </li>
        )}
      </ul>
      {g.ref && (
        <span className="pl-1">
          <SourceButton open={d.open} controls={d.id} onClick={d.toggle} label={g.ref.label} context={`skills, ${g.where}`} />
        </span>
      )}
    </div>
  );
  const panel = g.ref ? <SourcePanel id={d.id} open={d.open} lines={g.ref.lines} poss={poss} /> : null;
  if (solo) {
    return (
      <li className="px-5 py-5 sm:px-6">
        <p className="mb-3 text-[13px] font-medium text-neutral-600">Listed on {poss} resume</p>
        {pills}
        {panel}
      </li>
    );
  }
  return (
    <li className="grid gap-2.5 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6 sm:px-6">
      <p className="text-[14px] font-medium text-studojo-ink sm:pt-1.5">
        <Rich text={g.where} />
      </p>
      <div className="min-w-0">
        {pills}
        {panel}
      </div>
    </li>
  );
}

/** Skills as pills, grouped by where they show up (an employer or project), else "Listed on the resume". */
export function Skills({ groups, first, poss }: { groups: SkillGroupView[]; first: string; poss: string }) {
  const solo = groups.length === 1 && groups[0].where === "Listed on the resume";
  const named = groups.some((g) => g.where !== "Listed on the resume");
  return (
    <Section id="skills" title="Skills" sub={named ? `Grouped by where ${first} used them` : undefined}>
      <Card>
        <ul role="list" className="divide-y divide-lilac-line">
          {groups.map((g) => (
            <SkillGroup key={g.where} g={g} solo={solo} poss={poss} />
          ))}
        </ul>
      </Card>
    </Section>
  );
}
