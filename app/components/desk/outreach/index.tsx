// The outreach page (?tab=outreach&id=d_88): one person and the email to them.
// The shell puts the assistant beside it on this person's own thread
// (scope "outreach:<id>"); this side shows sub-tabs Email, Person, Company.
import { useState } from "react";
import { Link } from "react-router";
import { FiArrowLeft } from "react-icons/fi";
import { getMatch, getOutreach } from "~/lib/desk/api";
import { deskPath } from "~/lib/desk/nav";
import { OUTREACH_ID_RE, type MatchDetail, type OutreachDetail } from "~/lib/desk/types";
import { clean, cx, Empty, ErrorBox, errorCode, FOCUS_RING, Initials, Loading } from "../tabs/kit";
import { usePageContext, usePoll, useLive } from "../tabs/live";
import { CompanyBlock, OutreachLinks, PersonFacts, PersonHeader, WhyBlock } from "../tabs/match-detail";
import { StatusPill } from "../tabs/status";
import { EmailPane } from "./email";

type Sub = "email" | "person" | "company";
const SUBS: { id: Sub; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "person", label: "Person" },
  { id: "company", label: "Company" },
];

const BACK = cx("inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2 font-satoshi text-sm font-bold text-studojo-ink hover:bg-studojo-surface-muted", FOCUS_RING);

export function OutreachPage({ id }: { id: string }) {
  if (!OUTREACH_ID_RE.test(id)) return <Missing />;
  return <Page id={id} />;
}

function Missing() {
  return (
    <Empty
      title="This email is not in your outreach"
      body="It may have been discarded, or the link is wrong."
      action={<Link to={deskPath("home")} className={BACK}>Back to Home</Link>}
    />
  );
}

function Page({ id }: { id: string }) {
  const d = useLive<OutreachDetail>(`outreach:${id}`, () => getOutreach(id));
  const [sub, setSub] = useState<Sub>("email");
  const data = d.data;
  usePageContext({ route: "outreach", outreach_id: id, lead_id: data?.lead.id ?? null });
  // A draft still being written fills in on its own.
  usePoll(!!data && (data.busy || data.server_status === "drafting"), d.reload, 3000);

  if (d.error) {
    return errorCode(d.error) === "not_found" ? <Missing /> : <ErrorBox error={d.error} onRetry={d.reload} />;
  }
  if (!data) return <Loading label="Opening the email" rows={4} />;

  const name = clean(data.lead.name);
  return (
    <div className="space-y-5">
      <Link to={deskPath("home")} className={BACK}>
        <FiArrowLeft aria-hidden /> All outreach
      </Link>
      <header className="flex flex-wrap items-start gap-3">
        <Initials name={data.lead.name} className="h-12 w-12 text-base" />
        <div className="min-w-0 flex-1">
          <h1 className="font-clash text-2xl font-semibold text-studojo-ink sm:text-3xl">{name}</h1>
          <p className="font-satoshi text-sm text-studojo-muted">{[clean(data.lead.title), clean(data.lead.company)].filter(Boolean).join(" at ")}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-col sm:items-end sm:gap-1">
          <StatusPill word={data.status_word} busy={data.busy} />
          {/* An approved draft's banner below says what approval means. */}
          {data.server_status === "approved" ? null : (
            <span className="min-w-0 font-satoshi text-xs text-studojo-muted sm:max-w-[16rem] sm:text-right">{clean(data.note)}</span>
          )}
        </div>
      </header>

      <div role="tablist" aria-label="About this outreach" className="flex gap-1 border-b-2 border-studojo-ink/15">
        {SUBS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`otab-${s.id}`}
            aria-selected={sub === s.id}
            aria-controls={`opanel-${s.id}`}
            tabIndex={sub === s.id ? 0 : -1}
            onClick={() => setSub(s.id)}
            onKeyDown={(e) => {
              const i = SUBS.findIndex((x) => x.id === sub);
              const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? SUBS.length - 1 : null;
              if (next === null) return;
              e.preventDefault();
              const to = SUBS[(next + SUBS.length) % SUBS.length].id;
              setSub(to);
              document.getElementById(`otab-${to}`)?.focus();
            }}
            className={cx(
              "-mb-[2px] min-h-11 rounded-t-xl border-2 px-4 font-satoshi text-sm font-bold",
              sub === s.id ? "border-studojo-ink border-b-white bg-white text-studojo-ink" : "border-transparent text-studojo-muted hover:text-studojo-ink",
              FOCUS_RING,
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`opanel-${sub}`} aria-labelledby={`otab-${sub}`}>
        {sub === "email" ? <EmailPane d={data} /> : <About leadId={data.lead.id} sub={sub} currentId={id} />}
      </div>
    </div>
  );
}

function About({ leadId, sub, currentId }: { leadId: number; sub: "person" | "company"; currentId: string }) {
  const m = useLive<MatchDetail>(`match:${leadId}`, () => getMatch(leadId));
  if (m.error) {
    return errorCode(m.error) === "not_found" ? (
      <p className="font-satoshi text-sm text-studojo-muted">This person is no longer in your matches, so there is nothing more to show.</p>
    ) : (
      <ErrorBox error={m.error} onRetry={m.reload} />
    );
  }
  if (!m.data) return <Loading label="Loading details" rows={3} />;
  const d = m.data;
  if (sub === "company") return <CompanyBlock facts={d.company_facts} company={d.company} />;
  const others = d.outreach.filter((r) => r.id !== currentId);
  return (
    <div className="space-y-5">
      <PersonHeader m={d} />
      <WhyBlock why={d.why} fallback={d.reason} />
      <PersonFacts d={d} />
      {others.length ? (
        <div>
          <h3 className="mb-2 font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">Other outreach to {clean(d.name)}</h3>
          <OutreachLinks rows={others} />
        </div>
      ) : null}
    </div>
  );
}
