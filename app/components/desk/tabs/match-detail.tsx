// Read-only blocks about a person and their company, shared by the People
// drawer and the outreach page's Person and Company sub-tabs.
import { Link } from "react-router";
import { FiExternalLink } from "react-icons/fi";
import { deskPath } from "~/lib/desk/nav";
import type { CompanyFacts, MatchCard, MatchDetail, OutreachRow, Why } from "~/lib/desk/types";
import { clean, cx, FOCUS_RING, Pill, Score } from "./kit";
import { MatchStatePill, StatusPill } from "./status";

const SIGNAL: Record<string, string> = { high: "Strong signal", medium: "Good signal", low: "Light signal" };

export function PersonHeader({ m }: { m: MatchCard }) {
  return (
    <div className="flex items-start gap-3">
      <Score value={m.score} strong={m.strong} className="h-14 min-w-14 text-xl" />
      <div className="min-w-0 flex-1">
        <p className="font-clash text-xl font-semibold text-studojo-ink">{clean(m.name)}</p>
        <p className="font-satoshi text-sm text-studojo-ink">{[clean(m.title), clean(m.company)].filter(Boolean).join(" at ")}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <MatchStatePill state={m.state} outreachId={m.outreach_id} />
          {m.city ? <Pill tone="white">{clean(m.city)}</Pill> : null}
          {m.strong ? <Pill tone="green">Strong match</Pill> : null}
          <Pill tone={m.has_address ? "white" : "muted"}>{m.has_address ? "Address on file" : "No address yet"}</Pill>
        </div>
      </div>
    </div>
  );
}

export function WhyBlock({ why, fallback }: { why: Why | null; fallback?: string | null }) {
  const headline = clean(why?.headline) || clean(fallback);
  const bullets = (why?.bullets ?? []).map((b) => clean(b)).filter(Boolean);
  if (!headline && !bullets.length) {
    return <p className="font-satoshi text-sm text-studojo-muted">No fit notes for this person yet.</p>;
  }
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-purple-strong">Why them</h3>
        {why?.signal_strength ? <Pill tone="white">{SIGNAL[why.signal_strength] ?? why.signal_strength}</Pill> : null}
      </div>
      {headline ? <p className="mt-2 font-satoshi text-base font-bold text-studojo-ink">{headline}</p> : null}
      {bullets.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 font-satoshi text-sm text-studojo-ink">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PersonFacts({ d }: { d: MatchDetail }) {
  const rows: [string, string | null][] = [
    ["Company", clean(d.company)],
    ["Industry", clean(d.industry)],
    ["Company size", clean(d.company_size)],
    ["City", clean(d.city)],
  ];
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 font-satoshi text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-studojo-muted">{k}</dt>
              <dd className="text-studojo-ink">{v}</dd>
            </div>
          ))}
      </dl>
      {d.linkedin_url && /^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(d.linkedin_url) ? (
        <a href={d.linkedin_url} target="_blank" rel="noopener noreferrer" className={cx("inline-flex items-center gap-1 rounded-lg font-satoshi text-sm font-bold text-studojo-purple-strong underline-offset-4 hover:underline", FOCUS_RING)}>
          LinkedIn profile <FiExternalLink aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

export function CompanyBlock({ facts, company }: { facts: CompanyFacts | null; company: string | null }) {
  if (!facts) {
    return <p className="font-satoshi text-sm text-studojo-muted">No company research for {clean(company) || "this company"} yet.</p>;
  }
  const rows: [string, string | null][] = [
    ["What they build", clean(facts.what_they_build)],
    ["Main market", clean(facts.primary_market)],
    ["Recent news", clean(facts.recent_momentum)],
    ["Hiring", clean(facts.hiring_signal)],
  ];
  const tech = facts.core_tech.map((t) => clean(t)).filter(Boolean);
  return (
    <div className="space-y-4">
      {facts.summary ? <p className="font-satoshi text-base text-studojo-ink">{clean(facts.summary)}</p> : null}
      <dl className="space-y-3">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt className="font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">{k}</dt>
              <dd className="mt-0.5 font-satoshi text-sm text-studojo-ink">{v}</dd>
            </div>
          ))}
      </dl>
      {tech.length ? (
        <div>
          <p className="font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">Tech</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <Pill key={t} tone="white" className="normal-case tracking-normal">{t}</Pill>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OutreachLinks({ rows }: { rows: OutreachRow[] }) {
  if (!rows.length) return null;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id}>
          <Link to={deskPath({ to: "outreach", id: r.id, filter: null })} className={cx("flex items-center gap-2 rounded-xl border-2 border-studojo-ink bg-white px-3 py-2 hover:bg-studojo-purple-bg", FOCUS_RING)}>
            <StatusPill word={r.status_word} busy={r.busy} />
            <span className="min-w-0 flex-1 truncate font-satoshi text-sm">{clean(r.subject) || clean(r.note)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
