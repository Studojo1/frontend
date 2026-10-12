// Details drawer for one match: fit, why them, the company, and any outreach.
import { Link } from "react-router";
import { FiEdit3, FiMessageCircle, FiX } from "react-icons/fi";
import { deskPath } from "~/lib/desk/nav";
import type { MatchDetail } from "~/lib/desk/types";
import { getMatch } from "~/lib/desk/api";
import { Button, clean, cx, Drawer, ErrorBox, FOCUS_RING, Loading } from "./kit";
import { ask, useLive } from "./live";
import type { useMatchActions } from "./match-actions";
import { CompanyBlock, OutreachLinks, PersonFacts, PersonHeader, WhyBlock } from "./match-detail";

type Acts = ReturnType<typeof useMatchActions>;

export function PersonDrawer({ leadId, onClose, acts }: { leadId: number | null; onClose: () => void; acts: Acts }) {
  return (
    <Drawer open={leadId != null} onClose={onClose} title="Details">
      {leadId != null ? <Body key={leadId} leadId={leadId} acts={acts} onClose={onClose} /> : null}
    </Drawer>
  );
}

function Body({ leadId, acts, onClose }: { leadId: number; acts: Acts; onClose: () => void }) {
  const d = useLive<MatchDetail>(`match:${leadId}`, () => getMatch(leadId));
  if (d.error) return <ErrorBox error={d.error} onRetry={d.reload} />;
  if (!d.data) return <Loading label="Loading details" rows={4} />;
  const m = d.data;
  const name = clean(m.name);
  const busy = acts.pending.has(m.lead_id);
  const live = m.outreach_id ?? m.outreach[0]?.id ?? null;

  return (
    <div className="space-y-6">
      <PersonHeader m={m} />
      <div className="flex flex-wrap gap-2">
        {m.state === "new" ? (
          <Button variant="primary" icon={<FiEdit3 />} busy={busy} onClick={() => void acts.write([m.lead_id])}>
            Write to {name.split(" ")[0] || name}
          </Button>
        ) : live ? (
          <Link to={deskPath({ to: "outreach", id: live, filter: null })} onClick={onClose} className={cx("inline-flex min-h-10 items-center rounded-xl border-2 border-studojo-ink bg-studojo-purple-strong px-3 font-satoshi text-sm font-bold text-white shadow-[3px_3px_0_0_#191a23]", FOCUS_RING)}>
            Open the email
          </Link>
        ) : null}
        {m.state === "new" || m.state === "drafted" ? (
          <Button icon={<FiX />} disabled={busy} onClick={() => void acts.pass(m.lead_id, m.name)}>
            Pass
          </Button>
        ) : null}
        <Button variant="ghost" icon={<FiMessageCircle />} onClick={() => ask(`Tell me about ${name} at ${clean(m.company) || "their company"} and why they fit me.`, { kind: "lead", id: m.lead_id })}>
          Ask about them
        </Button>
      </div>
      {acts.notice ? <p role="status" className="font-satoshi text-sm text-studojo-muted">{acts.notice.text}</p> : null}
      <WhyBlock why={m.why} fallback={m.reason} />
      <div>
        <h3 className="mb-2 font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">Person</h3>
        <PersonFacts d={m} />
      </div>
      <div>
        <h3 className="mb-2 font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">Company</h3>
        <CompanyBlock facts={m.company_facts} company={m.company} />
      </div>
      {m.outreach.length ? (
        <div>
          <h3 className="mb-2 font-satoshi text-xs font-bold uppercase tracking-wide text-studojo-muted">Outreach</h3>
          <OutreachLinks rows={m.outreach} />
        </div>
      ) : null}
    </div>
  );
}
