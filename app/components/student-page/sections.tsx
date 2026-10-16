// The student page's sections, top to bottom: identity, Looking for,
// Highlights, About, Experience / Projects / Education, Awards and Skills.
// Every component takes a slice of the view model; nothing here decides data.
import { forwardRef, Fragment, useId, useState, type CSSProperties } from "react";
import {
  Chevron,
  Controls,
  EmailButton,
  ItemLi,
  ItemLists,
  MoreToggle,
  Rich,
  Section,
  SourcePanel,
  SummaryMark,
  TextToggle,
  useDisclosure,
} from "./atoms";
import type { AboutView, AwardsView, EntryView, FigColView, HighlightView, LookingView, ProfileView, SkillGroupView, StintSectionView } from "./profile-view";

const NAME_SIZE = {
  m: "text-[34px] leading-[1.08] md:text-[54px] md:leading-[1.02]",
  l: "text-[30px] leading-[1.1] md:text-[46px] md:leading-[1.05]",
  xl: "text-[26px] leading-[1.12] md:text-[40px] md:leading-[1.08]",
} as const;

/** Who this is: the name (the page's one typographic moment), headline, study line, the claims summary and the photo. */
export const Identity = forwardRef<HTMLElement, { v: ProfileView }>(function Identity({ v }, ref) {
  const dot = (
    <span aria-hidden="true" className="px-1.5 text-neutral-400">
      {"\u00b7"}
    </span>
  );
  const when = [v.classOf ? `Class of ${v.classOf}` : "", v.city].filter(Boolean);
  const hasStudy = !!(v.degree || v.college);
  return (
    <header id="intro" ref={ref} className="pb-8 pt-4 md:grid md:grid-cols-[144px_minmax(0,1fr)] md:gap-x-8 md:pb-12 md:pt-14">
      <div className="hidden md:block">
        {v.photo ? (
          <img src={v.photo} alt={`Photo of ${v.name}`} className="h-20 w-20 rounded-full object-cover ring-1 ring-black/5" />
        ) : (
          <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 font-newsreader text-[26px] tracking-[0.04em] text-neutral-600">
            {v.initials}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-start gap-4">
          <h1 id="name" className={`sp-name min-w-0 flex-1 font-newsreader font-[440] tracking-[-0.015em] text-studojo-ink ${NAME_SIZE[v.nameSize]}`}>
            {v.name}
          </h1>
          {v.photo && <img src={v.photo} alt={`Photo of ${v.name}`} className="mt-1 h-14 w-14 flex-none rounded-full object-cover ring-1 ring-black/5 md:hidden" />}
        </div>
        {v.headline && (
          <p className="mt-3 max-w-[34em] text-[16px] leading-[1.5] text-neutral-700 md:text-[18px]">
            <Rich text={v.headline} />
          </p>
        )}
        {(hasStudy || when.length > 0) && (
          <div className="mt-3 text-[14.5px] leading-[1.55] md:mt-5">
            {hasStudy && (
              <p className="text-neutral-700">
                {v.degree && v.college ? (
                  <>
                    <span className="inline-block max-w-full">
                      <Rich text={v.degree} />,
                    </span>{" "}
                    <span className="inline-block max-w-full">
                      <Rich text={v.college} />
                    </span>
                  </>
                ) : (
                  <span className="inline-block max-w-full">
                    <Rich text={v.degree || v.college} />
                  </span>
                )}
              </p>
            )}
            {when.length > 0 && (
              <p className="text-neutral-500">
                {when.map((w, i) => (
                  <Fragment key={w}>
                    {i > 0 && dot}
                    <span className="inline-block max-w-full">
                      <Rich text={w} />
                    </span>
                  </Fragment>
                ))}
              </p>
            )}
          </div>
        )}
        {v.proof ? (
          <p className="mt-3 text-[14px] leading-5 md:mt-5">
            <a href="#sources" className="group -my-3 inline-flex items-start gap-2 py-3 text-studojo-ink sm:-my-1 sm:py-1">
              <span className="mt-0.5">
                <SummaryMark all={v.proof.all} />
              </span>
              <span>
                <span className="underline decoration-neutral-300 underline-offset-4 transition-colors group-hover:decoration-neutral-600">{v.proof.text}</span>
                {v.updated && (
                  <>
                    <span className="sr-only">. </span>
                    <span className="mt-1 block text-[13px] text-neutral-500 sm:ml-2 sm:mt-0 sm:inline">
                      <span aria-hidden="true" className="mr-2 hidden text-neutral-400 sm:inline">
                        {"\u00b7"}
                      </span>
                      Updated {v.updated}
                    </span>
                  </>
                )}
              </span>
            </a>
          </p>
        ) : (
          v.updated && <p className="mt-5 text-[13px] text-neutral-500">Updated {v.updated}</p>
        )}
        <p className="sp-print-only mt-3 text-[12px] text-neutral-500">{v.url}</p>
        {v.email && (
          <div className="sp-no-print mt-6 hidden flex-wrap gap-2 sm:flex">
            <EmailButton email={v.email} first={v.first} place="intro" />
          </div>
        )}
      </div>
    </header>
  );
});

/** What they are looking for: the role, one sentence for type and start, then Company, Location (every city) and Remote. */
export function LookingFor({ looking }: { looking: LookingView }) {
  return (
    <Section id="looking" label="Looking for" labelTop={looking.main ? 7 : 4}>
      {looking.main && (
        <p className="text-[20px] font-medium leading-7 text-studojo-ink">
          <Rich text={looking.main} />
        </p>
      )}
      {looking.sub && (
        <p className="text-[15px] leading-6 text-neutral-600">
          <Rich text={looking.sub} />
        </p>
      )}
      {looking.rows.length > 0 && (
        <dl className={`${looking.main || looking.sub ? "mt-3 " : ""}grid grid-cols-[76px_minmax(0,1fr)] gap-x-4 gap-y-1 text-[15px] leading-6 md:grid-cols-[84px_minmax(0,1fr)]`}>
          {looking.rows.map((r) => (
            <Fragment key={r.k}>
              <dt className="text-[14px] text-neutral-500">{r.k}</dt>
              <dd className="text-neutral-800">
                <Rich text={r.v} />
              </dd>
            </Fragment>
          ))}
        </dl>
      )}
    </Section>
  );
}

const ROW_HINT =
  "sp-hint mt-1 flex items-center gap-1.5 text-[13px] font-medium leading-5 text-neutral-500 transition-colors group-hover:text-studojo-purple-strong group-aria-expanded:text-studojo-purple-strong";

// The figure column comes from the view (figCol) as CSS variables on the list; Tailwind only sees whole class strings, so the three layouts are a static map.
const FIG_ROW = {
  none: "grid-cols-[var(--fw)_minmax(0,1fr)] items-baseline gap-x-3 md:grid-cols-[var(--fwd)_minmax(0,1fr)] md:gap-x-5",
  phone: "grid-cols-[minmax(0,1fr)] sm:grid-cols-[var(--fw)_minmax(0,1fr)] sm:items-baseline sm:gap-x-3 md:grid-cols-[var(--fwd)_minmax(0,1fr)] md:gap-x-5",
  all: "grid-cols-[minmax(0,1fr)]",
} as const;
const FIG_INDENT = { none: "ml-[var(--fi)] md:ml-[var(--fid)]", phone: "sm:ml-[var(--fi)] md:ml-[var(--fid)]", all: "" } as const;
const FIG_WRAP = { none: "whitespace-nowrap", phone: "[overflow-wrap:anywhere] sm:whitespace-nowrap", all: "[overflow-wrap:anywhere]" } as const;

function HighlightRow({ h, stack }: { h: HighlightView; stack: FigColView["stack"] }) {
  const d = useDisclosure();
  const grid = `grid w-full py-3 text-left ${FIG_ROW[stack]}`;
  const cells = (
    <>
      <span className={`sp-fig ${FIG_WRAP[stack]} font-newsreader text-[26px] font-[450] leading-8 tracking-[-0.01em] text-studojo-ink md:text-[30px]`}>{h.value}</span>
      <span className="min-w-0">
        <span className="block text-[15px] leading-6 text-neutral-700">
          <Rich text={h.label} />
        </span>
        {h.ref && (
          <span className={ROW_HINT}>
            {h.ref.label}
            <Chevron />
          </span>
        )}
      </span>
    </>
  );
  if (!h.ref) {
    return (
      <li>
        <div className={grid}>{cells}</div>
      </li>
    );
  }
  return (
    <li>
      <button type="button" data-row="" aria-expanded={d.open} aria-controls={d.id} onClick={d.toggle} className={`group ${grid}`}>
        {cells}
      </button>
      <SourcePanel id={d.id} open={d.open} lines={h.ref.lines} className={`mb-3 ${FIG_INDENT[stack]}`} />
    </li>
  );
}

/** The numbers, each a row that opens to the resume line it came from. */
export function Highlights({ items, col }: { items: HighlightView[]; col: FigColView }) {
  const vars = { "--fw": `${col.phone}px`, "--fwd": `${col.desktop}px`, "--fi": `${col.phone + 12}px`, "--fid": `${col.desktop + 20}px` } as CSSProperties;
  return (
    <Section id="highlights" label="Highlights" labelTop={13}>
      <ul role="list" className="-my-3" style={vars}>
        {items.map((h) => (
          <HighlightRow key={`${h.value}|${h.label}`} h={h} stack={col.stack} />
        ))}
      </ul>
    </Section>
  );
}

/** The student's own words: About, then their answers (in the serif italic, as quotes). */
export function About({ about }: { about: AboutView }) {
  return (
    <Section id="about" label="About" labelTop={6}>
      {about.text && (
        <p className="max-w-[36em] text-[16px] leading-[1.7] text-neutral-700">
          <Rich text={about.text} />
        </p>
      )}
      {about.prompts.map((q, i) => (
        <figure key={i} className={about.text || i ? "mt-8" : ""}>
          {q.q && (
            <figcaption className="text-[13px] font-medium text-neutral-500">
              <Rich text={q.q} />
            </figcaption>
          )}
          <blockquote className="mt-1.5 max-w-[34em] font-newsreader text-[19px] italic leading-[1.55] text-neutral-800">
            <Rich text={q.a} />
          </blockquote>
        </figure>
      ))}
    </Section>
  );
}

function Entry({ e, index }: { e: EntryView; index: number }) {
  const src = useDisclosure();
  const more = useDisclosure();
  const moreId = `${more.id}-more`;
  const sub = [e.org, e.place].filter(Boolean).join(" \u00b7 ");
  const when = [e.dates, e.span].filter(Boolean).join(" \u00b7 ");
  const what = [e.title, e.org].filter(Boolean).join(", ");
  const hidden = e.body.length - e.shown;
  return (
    <article className={index ? "mt-8 md:mt-9" : ""}>
      <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8">
        <h3 className="text-[16px] font-medium leading-6 text-studojo-ink">
          <Rich text={e.title} />
        </h3>
        <p className="hidden whitespace-nowrap text-right text-[13.5px] leading-6 tabular-nums text-neutral-600 sm:block">{e.dates}</p>
        {sub ? (
          <p className="text-[15px] leading-6 text-neutral-600">
            <Rich text={sub} />
          </p>
        ) : e.sub ? (
          <p className="text-[15px] leading-6 text-neutral-600">
            <Rich text={e.sub} />
          </p>
        ) : (
          <span />
        )}
        <p className="hidden whitespace-nowrap text-right text-[13px] leading-6 tabular-nums text-neutral-500 sm:block">{e.span}</p>
        {sub && e.sub && (
          <p className="text-[15px] leading-6 text-neutral-600">
            <Rich text={e.sub} />
          </p>
        )}
      </div>
      {when && <p className="text-[13.5px] leading-6 tabular-nums text-neutral-600 sm:hidden">{when}</p>}
      {e.note && (
        <p className="mt-2.5 max-w-[34em] text-[15px] leading-[1.65] text-neutral-700">
          <Rich text={e.note} />
        </p>
      )}
      {e.body.length > 0 && (
        <div className="mt-2.5">
          <ItemLists items={e.body} shown={e.shown} moreId={moreId} moreOpen={more.open} />
        </div>
      )}
      <Controls>
        {[
          hidden > 0 && <MoreToggle key="more" count={hidden} open={more.open} controls={moreId} onClick={more.toggle} what={what} />,
          e.ref && (
            <TextToggle key="src" open={src.open} controls={src.id} onClick={src.toggle}>
              <span className="sr-only">Show </span>
              {e.ref.label}
              <span className="sr-only"> for {what}</span>
            </TextToggle>
          ),
        ]}
      </Controls>
      {e.ref && <SourcePanel id={src.id} open={src.open} lines={e.ref.lines} />}
    </article>
  );
}

function Pool({ pool, label }: { pool: NonNullable<StintSectionView["pool"]>; label: string }) {
  const more = useDisclosure();
  const moreId = `${more.id}-more`;
  const hidden = pool.items.length - pool.shown;
  return (
    <>
      <p className="mb-3 text-[13px] font-medium text-neutral-600">{pool.caption}</p>
      <ItemLists items={pool.items} shown={pool.shown} moreId={moreId} moreOpen={more.open} />
      <Controls>{[hidden > 0 && <MoreToggle key="more" count={hidden} open={more.open} controls={moreId} onClick={more.toggle} what={label} />]}</Controls>
    </>
  );
}

/** Experience, Projects or Education: entries drawn as a CV, then what the resume says that could not be tied to an entry. */
export function StintSection({ section }: { section: StintSectionView }) {
  return (
    <Section id={section.kind} label={section.label} labelTop={section.entries.length ? 5 : 3}>
      {section.entries.map((e, i) => (
        <Entry key={e.key} e={e} index={i} />
      ))}
      {section.pool && (
        <div className={section.entries.length ? "mt-10 border-t border-neutral-100 pt-7" : ""}>
          <Pool pool={section.pool} label={section.label} />
        </div>
      )}
    </Section>
  );
}

/** Awards (or Activities): resume lines nothing else on the page uses, grouped under the resume's own headings. */
export function Awards({ awards }: { awards: AwardsView }) {
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
    <Section id="awards" label={awards.label} labelTop={3}>
      {blocks.map((b, i) => (
        <div key={b.restId} className={i ? "mt-6" : ""}>
          {b.caption && <p className="mb-3 text-[13px] font-medium text-neutral-600">{b.caption}</p>}
          {b.head.length > 0 && (
            <ul role="list" className="sp-dots max-w-[35em] space-y-1.5">
              {b.head.map((o, k) => (
                <ItemLi key={k} item={o} />
              ))}
            </ul>
          )}
          {b.rest.length > 0 && (
            <ul id={b.restId} role="list" data-more-list="" hidden={!moreOpen} className="sp-dots mt-1.5 max-w-[35em] space-y-1.5">
              {b.rest.map((o, k) => (
                <ItemLi key={k} item={o} />
              ))}
            </ul>
          )}
        </div>
      ))}
      <Controls>
        {[
          hidden > 0 && restIds && <MoreToggle key="more" count={hidden} open={moreOpen} controls={restIds} onClick={() => setMoreOpen((o) => !o)} what={awards.label} />,
          awards.ref && (
            <TextToggle key="src" open={src.open} controls={src.id} onClick={src.toggle}>
              <span className="sr-only">Show </span>
              {awards.ref.label}
              <span className="sr-only"> for {awards.label}</span>
            </TextToggle>
          ),
        ]}
      </Controls>
      {awards.ref && <SourcePanel id={src.id} open={src.open} lines={awards.ref.lines} />}
    </Section>
  );
}

function SkillRow({ g, solo }: { g: SkillGroupView; solo: boolean }) {
  const d = useDisclosure();
  const grid = solo ? "grid w-full grid-cols-[minmax(0,1fr)] py-3 text-left" : "grid w-full grid-cols-[minmax(0,1fr)] gap-x-6 py-3 text-left sm:grid-cols-[150px_minmax(0,1fr)]";
  const cells = (
    <>
      {!solo && (
        <span className="text-[13.5px] leading-6 text-neutral-600 sm:leading-7">
          <Rich text={g.where} />
        </span>
      )}
      <span className="min-w-0">
        {/* Each skill and its comma is one inline-block: lines break between skills, and only a skill wider than the whole line wraps inside its box. */}
        <span className="block text-[15px] leading-7 text-studojo-ink">
          {g.names.map((n, i) => (
            <Fragment key={n}>
              <span data-skill="" className="inline-block max-w-full">{`${n}${i < g.names.length - 1 || g.more ? "," : ""}`}</span>{" "}
            </Fragment>
          ))}
          {g.more > 0 && (
            <span data-skill="" className="inline-block max-w-full text-neutral-600">
              and {g.more} more
            </span>
          )}
        </span>
        {g.ref && (
          <span className={ROW_HINT}>
            {g.ref.label}
            <Chevron />
          </span>
        )}
      </span>
    </>
  );
  if (!g.ref) {
    return (
      <li>
        <div className={grid}>{cells}</div>
      </li>
    );
  }
  return (
    <li>
      <button type="button" data-row="" aria-expanded={d.open} aria-controls={d.id} onClick={d.toggle} className={`group ${grid}`}>
        {cells}
      </button>
      <SourcePanel id={d.id} open={d.open} lines={g.ref.lines} className={solo ? "mb-3" : "mb-3 sm:ml-[174px]"} />
    </li>
  );
}

/** Skills, grouped by where they show up (an employer or project), else "Listed on the resume". */
export function Skills({ groups }: { groups: SkillGroupView[] }) {
  const solo = groups.length === 1 && groups[0].where === "Listed on the resume";
  return (
    <Section id="skills" label="Skills" labelTop={11}>
      <ul role="list" className="-my-3">
        {groups.map((g) => (
          <SkillRow key={g.where} g={g} solo={solo} />
        ))}
      </ul>
    </Section>
  );
}
