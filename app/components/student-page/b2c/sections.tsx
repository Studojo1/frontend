// PROFILE-V2 (27 Oct 2026): the student page's sections in the site's look, for studojo.pro only (b2c/profile.css).
// The same structure, words and data as the classic sections (../sections.tsx, kept for studojo.com): the lilac hero
// (who they are, the floating "{first} is looking for" card, the resume-check strip), Highlights, About, Experience /
// Projects / Education, Awards and Skills. Every component takes a slice of the view model; nothing here decides data.
import { forwardRef, Fragment, useId, useState } from "react";
import { Icon, Rich, Seal, useDisclosure } from "../atoms";
import type { AboutView, AwardsView, EntryView, HighlightView, LookingView, ProfileView, SkillGroupView, StintSectionView } from "../profile-view";
import { Card, CopyLinkButton, EmailButton, ItemLi, ItemLists, Meter, MoreButton, Section, SourceButton, SourcePanel } from "./atoms";

function Avatar({ v }: { v: ProfileView }) {
  if (v.photo) return <img src={v.photo} alt={`Photo of ${v.name}`} className="pv-photo" />;
  return (
    <div aria-hidden="true" className="pv-initials">
      {v.initials}
    </div>
  );
}

const ROW_LABEL: Record<LookingView["rows"][number]["k"], (v: string) => string> = {
  Company: () => "Companies",
  Location: (v) => (v.includes(", ") ? "Cities" : "City"),
  Remote: () => "Remote",
};

/** What they are looking for, as the white card floating in the hero. Email (when allowed) is the page's one action. */
function LookingCard({ looking, first, email }: { looking: LookingView; first: string; email: string | null }) {
  return (
    <aside aria-labelledby="looking-h" className="pv-look">
      <div className="pv-look-head">
        <h2 id="looking-h" className="pv-kicker">
          {first} is looking for
        </h2>
        {looking.main && (
          <p className="pv-look-main">
            <Rich text={looking.main} />
          </p>
        )}
        {looking.sub && (
          <p className="pv-look-sub">
            <Rich text={looking.sub} />
          </p>
        )}
      </div>
      {looking.rows.length > 0 && (
        <dl>
          {looking.rows.map((r) => (
            <div key={r.k}>
              <dt>{ROW_LABEL[r.k](r.v)}</dt>
              <dd>
                <Rich text={r.v} />
              </dd>
            </div>
          ))}
        </dl>
      )}
      {email ? (
        <div className="sp-no-print pv-look-act">
          <EmailButton email={email} first={first} size="wide" />
        </div>
      ) : (
        <div className="pv-look-end" />
      )}
    </aside>
  );
}

const NAME_CLASS = { m: "pv-name pv-name-m", l: "pv-name pv-name-l", xl: "pv-name pv-name-xl" } as const;

/** The hero: the student, what they want, and a strip with how their claims held up against their resume. */
export const Hero = forwardRef<HTMLElement, { v: ProfileView; onStatus: (s: string) => void }>(function Hero({ v, onStatus }, ref) {
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
    <>
      {/* The page's own address and Copy link, above the card (the site header holds the top of the page). */}
      <div className="pv-crumb">
        <p className="pv-kicker" title={v.url}>
          {v.url}
        </p>
        <CopyLinkButton url={v.shareUrl} onStatus={onStatus} className="pv-copy" />
      </div>
      <section id="intro" ref={ref} aria-label="Profile" className="pv-hero">
        <div className={v.looking ? "pv-hero-grid pv-with-look" : "pv-hero-grid"}>
          <div className="pv-hero-main">
            <Avatar v={v} />
            <h1 className={NAME_CLASS[v.nameSize]}>{v.name}</h1>
            {v.headline && (
              <p className="pv-headline">
                <Rich text={v.headline} />
              </p>
            )}
            {/* Phones: two quiet lines with icons. From 640px: the labelled facts. */}
            {(v.degree || v.college || when.length > 0) && (
              <div className="pv-facts-m">
                {(v.degree || v.college) && (
                  <p>
                    <span>
                      <Icon name="cap" size={17} />
                      <span>
                        <Rich text={[v.degree, v.college].filter(Boolean).join(", ")} />
                      </span>
                    </span>
                  </p>
                )}
                {when.length > 0 && (
                  <p>
                    {v.classOf && (
                      <span>
                        <Icon name="calendar" size={16} />
                        Class of {v.classOf}
                      </span>
                    )}
                    {v.city && (
                      <span>
                        <Icon name="pin" size={16} />
                        <Rich text={v.city} />
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
            {facts.length > 0 && (
              <dl className="pv-facts">
                {facts.map(([k, x]) => (
                  <div key={k}>
                    <dt className="pv-label">{k}</dt>
                    <dd>
                      <Rich text={x} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {v.looking && <LookingCard looking={v.looking} first={v.first} email={v.email} />}
        </div>
        {v.proof ? (
          <a href="#proof" className="pv-check">
            <Seal all={v.proof.all} size={46} />
            <span className="pv-check-text">
              <span className="pv-check-title">{v.proof.all ? "Resume-checked profile" : "Checked against the resume"}</span>
              <span className="pv-check-line">
                <b>
                  {v.proof.matched} of {v.proof.total} claims
                </b>{" "}
                matched to {v.poss} resume
                {v.updated && (
                  <>
                    <span aria-hidden="true" className="pv-dot">
                      {"·"}
                    </span>
                    <span className="pv-nowrap">Updated {v.updated}</span>
                  </>
                )}
              </span>
              <span className="pv-check-meter">
                <Meter matched={v.proof.matched} total={v.proof.total} />
              </span>
            </span>
            <span className="pv-go">
              See the proof
              <Icon name="arrow" size={14} />
            </span>
          </a>
        ) : (
          v.updated && <p className="pv-updated pv-mono">Updated {v.updated}</p>
        )}
      </section>
    </>
  );
});

function HighlightTile({ h, stacked, poss }: { h: HighlightView; stacked: boolean; poss: string }) {
  const d = useDisclosure();
  // A row on phones (figure beside its label) unless a long figure needs the whole width; a tile from 640px.
  return (
    <div className={stacked ? "pv-tile pv-stacked" : "pv-tile"}>
      <p className="pv-fig">{h.value}</p>
      <div className="pv-tile-body">
        <p className="pv-tile-label">
          <Rich text={h.label} />
        </p>
        {h.ref && (
          <div className="pv-tile-src">
            <SourceButton open={d.open} controls={d.id} onClick={d.toggle} label={h.ref.label} context={`${h.value} ${h.label}`} />
          </div>
        )}
      </div>
      {h.ref && (
        <div className="pv-tile-panel">
          <SourcePanel id={d.id} open={d.open} lines={h.ref.lines} poss={poss} />
        </div>
      )}
    </div>
  );
}

/** The numbers, as lilac tiles; each opens to the resume line it came from. */
export function Highlights({ items, stacked, poss }: { items: HighlightView[]; stacked: boolean; poss: string }) {
  const cols = Math.min(4, Math.max(1, items.length));
  return (
    <Section id="highlights" title="Highlights" sub={`Numbers from ${poss} resume. Open a source to see the line.`}>
      <div className={`pv-tiles pv-c${cols}`}>
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
        <p className="pv-about">
          <Rich text={about.text} />
        </p>
      )}
      {about.prompts.length > 0 && (
        <div className={about.prompts.length > 1 ? "pv-prompts pv-two" : "pv-prompts"}>
          {about.prompts.map((q, i) => (
            <figure key={i} className="pv-prompt">
              {q.q && (
                <figcaption>
                  <Rich text={q.q} />
                </figcaption>
              )}
              <blockquote>
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
  if (kind === "education") {
    return (
      <span aria-hidden="true" className="pv-mark">
        <Icon name="cap" size={20} />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="pv-mark">
      {initialsOf(org || title) || "•"}
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
    <li className="pv-entry">
      <article>
        <EntryMark kind={kind} org={e.org} title={e.title} />
        <div className="pv-entry-body">
          <div className="pv-entry-top">
            <div>
              <h3>
                <Rich text={e.title} />
              </h3>
              {sub.length > 0 && (
                <p className="pv-org">
                  {sub.map((x, i) => (
                    <Fragment key={i}>
                      {i > 0 && <i aria-hidden="true">{"·"}</i>}
                      {i === 0 ? (
                        <b>
                          <Rich text={x} />
                        </b>
                      ) : (
                        <span>
                          <Rich text={x} />
                        </span>
                      )}
                    </Fragment>
                  ))}
                </p>
              )}
              {e.sub && (
                <p className="pv-esub">
                  <Rich text={e.sub} />
                </p>
              )}
            </div>
            {when && <p className="pv-when">{when}</p>}
          </div>
          {e.note && (
            <p className="pv-note">
              <Rich text={e.note} />
            </p>
          )}
          {e.body.length > 0 && (
            <div className="pv-entry-list">
              <ItemLists items={e.body} shown={e.shown} moreId={moreId} moreOpen={more.open} />
            </div>
          )}
          {(hidden > 0 || e.ref) && (
            <div className="pv-acts">
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
    <div className={under ? "pv-pool pv-under" : "pv-pool"}>
      <p className="pv-pool-cap">
        <Icon name="file" size={15} />
        {under ? `Also under ${label} on ${poss} resume` : `As written on ${poss} resume`}
      </p>
      <ItemLists items={pool.items} shown={pool.shown} moreId={moreId} moreOpen={more.open} />
      {hidden > 0 && (
        <div className="pv-acts">
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
          <ul role="list" className="pv-list pv-rows">
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
      <Card className="pv-pad">
        {blocks.map((b) => (
          <div key={b.restId} className="pv-block">
            {b.caption && <p className="pv-label pv-group-cap">{b.caption}</p>}
            {b.head.length > 0 && (
              <ul role="list" className="pv-items">
                {b.head.map((o, k) => (
                  <ItemLi key={k} item={o} />
                ))}
              </ul>
            )}
            {b.rest.length > 0 && (
              <ul id={b.restId} role="list" data-more-list="" hidden={!moreOpen} className="pv-items">
                {b.rest.map((o, k) => (
                  <ItemLi key={k} item={o} />
                ))}
              </ul>
            )}
          </div>
        ))}
        {(hidden > 0 || awards.ref) && (
          <div className="pv-acts">
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
    <div className="pv-pills">
      <ul role="list">
        {g.names.map((n) => (
          <li key={n} data-skill="" className="pv-pill">
            {n}
          </li>
        ))}
        {g.more > 0 && (
          <li data-skill="" className="pv-pill-more">
            and {g.more} more
          </li>
        )}
      </ul>
      {g.ref && <SourceButton open={d.open} controls={d.id} onClick={d.toggle} label={g.ref.label} context={`skills, ${g.where}`} />}
    </div>
  );
  const panel = g.ref ? <SourcePanel id={d.id} open={d.open} lines={g.ref.lines} poss={poss} /> : null;
  if (solo) {
    return (
      <li className="pv-skill pv-solo">
        <p className="pv-skill-solo">Listed on {poss} resume</p>
        {pills}
        {panel}
      </li>
    );
  }
  return (
    <li className="pv-skill">
      <p className="pv-skill-where">
        <Rich text={g.where} />
      </p>
      <div>
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
        <ul role="list" className="pv-list pv-rows">
          {groups.map((g) => (
            <SkillGroup key={g.where} g={g} solo={solo} poss={poss} />
          ))}
        </ul>
      </Card>
    </Section>
  );
}
