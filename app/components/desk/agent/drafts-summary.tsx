// Several drafts from one turn ("Write to my top 5") as one card: the chat
// says where they are and lists who they are to; the workspace is where they
// are read and approved. Each row reads the same `outreach:{id}` resource the
// table and the outreach page use, so its pill moves when they change.
import { Link } from "react-router";
import { FiArrowRight } from "react-icons/fi";
import { deskPath } from "~/lib/desk/nav";
import type { OutreachId } from "~/lib/desk/types";
import { labelFor, StatusPill } from "../tabs/status";
import { CardShell, cx, FOCUS_RING, Kicker, PRESS, Spinner } from "./bits";
import { useDraft } from "./draft-card";

function Row({ id, scope }: { id: OutreachId; scope: string }) {
  const { d, res } = useDraft(id, scope);
  if (!d) {
    return (
      <li className="flex min-h-10 items-center gap-2 py-1.5 font-satoshi text-sm text-studojo-muted">
        {res.error ? "This email is no longer in your outreach." : (
          <>
            <Spinner /> Loading
          </>
        )}
      </li>
    );
  }
  return (
    <li className="py-1">
      <Link to={deskPath({ to: "outreach", id: d.id, filter: null })} className={cx("flex min-h-10 items-center gap-2 rounded-lg px-1 hover:bg-studojo-purple-bg", FOCUS_RING)}>
        <span className="min-w-0 flex-1 truncate font-satoshi text-sm font-bold text-studojo-ink">
          {d.lead.name}
          {d.lead.company ? <span className="font-normal text-studojo-muted">, {d.lead.company}</span> : null}
        </span>
        <StatusPill word={d.status_word} busy={d.busy} />
        <span className="sr-only">Open</span>
        <FiArrowRight aria-hidden className="shrink-0 text-studojo-purple-strong" />
      </Link>
    </li>
  );
}

export function DraftsSummary({ ids, scope }: { ids: OutreachId[]; scope: string }) {
  const n = ids.length;
  const where = `${n} drafts are in Home under ${labelFor("needs_you")}.`;
  return (
    <CardShell label={`${n} drafts`}>
      <Kicker>{n} drafts</Kicker>
      <p className="mt-1 font-satoshi text-sm text-studojo-ink">
        <Link to={deskPath({ to: "home", id: null, filter: "needs_you" })} className={cx("rounded underline underline-offset-2", FOCUS_RING)}>
          {where}
        </Link>
      </p>
      <ul className="mt-1 divide-y-2 divide-dashed divide-studojo-ink/10">
        {ids.map((id) => (
          <Row key={id} id={id} scope={scope} />
        ))}
      </ul>
      <Link
        to={deskPath({ to: "outreach", id: ids[0], filter: null })}
        className={cx(
          "mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-studojo-ink bg-studojo-purple-strong px-3 font-satoshi text-[13px] font-bold text-white shadow-[2px_2px_0_0_#191a23]",
          PRESS,
          FOCUS_RING,
        )}
      >
        Review the first one <FiArrowRight aria-hidden />
      </Link>
    </CardShell>
  );
}
