// Result cards a tool streams under the reply (contract section 6): matches,
// one match, outreach, status, profile, memory; plus the confirmation ticket.
// Real data only: everything shown comes from the card the server sent.
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { FiArrowRight, FiCheck, FiEdit3, FiX } from "react-icons/fi";
import { deskPath } from "~/lib/desk/nav";
import { stripDashes } from "~/lib/strip-dashes";
import type { Card, Confirmation, MatchCard, NavigateTarget, StatusWord, Why } from "~/lib/desk/types";
import { STATUS_WORDS } from "~/lib/desk/types";
import { CardShell, ChipButton, cx, FOCUS_RING, Kicker, PlainText } from "./bits";
import { isBusy, serverDate } from "./live";
import { confirm, send } from "./runner";
import { useSlot } from "./use-agent";
import { labelFor, MatchStatePill, noteFor, StatusPill } from "../tabs/status";

function GoLink({ to, children }: { to: NavigateTarget; children: ReactNode }) {
  return (
    <Link
      to={deskPath(to)}
      className={cx("inline-flex min-h-9 items-center gap-1 font-satoshi text-[13px] font-bold text-studojo-purple-strong underline underline-offset-2", FOCUS_RING)}
    >
      {children} <FiArrowRight aria-hidden />
    </Link>
  );
}

const nav = (to: NavigateTarget["to"], id: string | null = null, filter: string | null = null): NavigateTarget => ({ to, id, filter });

function Score({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <span title={`Fit ${value} out of 100`} className="inline-flex min-w-9 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-studojo-ink bg-studojo-purple-bg px-1 py-0.5 font-satoshi text-sm font-bold leading-none tabular-nums text-studojo-purple-strong">
      <span className="sr-only">Fit </span>
      {value}
      <span aria-hidden className="mt-0.5 block text-[9px] uppercase tracking-wide">fit</span>
    </span>
  );
}

function WhyLines({ why }: { why: Why }) {
  if (!why.headline && !why.bullets.length) return null;
  return (
    <div className="mt-2 rounded-lg bg-studojo-surface-muted px-2 py-1.5">
      {why.headline ? <p className="font-satoshi text-sm font-bold text-studojo-ink">{stripDashes(why.headline)}</p> : null}
      {why.bullets.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 font-satoshi text-xs text-studojo-ink">
          {why.bullets.map((b, i) => (
            <li key={i}>{stripDashes(b)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MatchRow({ m, scope, busy }: { m: MatchCard; scope: string; busy: boolean }) {
  const first = m.name.split(" ")[0] || m.name;
  return (
    <li className="flex items-start gap-2 py-2">
      <Score value={m.score} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-satoshi text-sm font-bold text-studojo-ink">{m.name}</p>
        <p className="truncate font-satoshi text-xs text-studojo-muted">{[m.title, m.company, m.city].filter(Boolean).join(", ")}</p>
        {m.reason ? <p className="mt-0.5 line-clamp-2 font-satoshi text-xs text-studojo-ink">{stripDashes(m.reason)}</p> : null}
        {m.state !== "new" ? (
          <p className="mt-1">
            <MatchStatePill state={m.state} outreachId={m.outreach_id} />
          </p>
        ) : null}
      </div>
      {m.state === "new" ? (
        <ChipButton
          tone="soft"
          disabled={busy}
          onClick={() => send(scope, `Write an email to ${m.name}${m.company ? ` at ${m.company}` : ""}.`, { selected: [{ kind: "lead", id: m.lead_id }] })}
          aria-label={`Write to ${m.name}`}
        >
          Write to {first}
        </ChipButton>
      ) : null}
    </li>
  );
}

function MatchesView({ items, total, scope, busy }: { items: MatchCard[]; total: number; scope: string; busy: boolean }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 5);
  return (
    <CardShell label="Matches">
      <Kicker>{total === 1 ? "1 person" : `${total} people`}</Kicker>
      {items.length ? (
        <ul className="divide-y-2 divide-dashed divide-studojo-ink/10">
          {shown.map((m) => (
            <MatchRow key={m.lead_id} m={m} scope={scope} busy={busy} />
          ))}
        </ul>
      ) : (
        <p className="mt-1 font-satoshi text-sm text-studojo-muted">No one matched that.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {items.length > 5 && !all ? (
          <button type="button" onClick={() => setAll(true)} className={cx("min-h-9 rounded font-satoshi text-[13px] font-bold text-studojo-ink underline underline-offset-2", FOCUS_RING)}>
            Show {items.length - 5} more
          </button>
        ) : null}
        <GoLink to={nav("people")}>See everyone in People</GoLink>
      </div>
    </CardShell>
  );
}

function MemoryView({ text, action }: { text: string; action: "saved" | "removed" }) {
  return (
    <CardShell label="Memory" tone="purple">
      <Kicker>{action === "saved" ? "Saved to what I remember" : "Forgotten"}</Kicker>
      <p className={cx("mt-1 font-satoshi text-sm text-studojo-ink", action === "removed" && "line-through decoration-2")}>{stripDashes(text)}</p>
      <GoLink to={nav("settings")}>See it in Settings</GoLink>
    </CardShell>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="font-bold text-studojo-muted">{label}</dt>
      <dd className="min-w-0 text-studojo-ink">{value}</dd>
    </>
  );
}

export function CardView({ card, scope }: { card: Card; scope: string }) {
  const busy = isBusy(useSlot(scope).live);
  switch (card.kind) {
    case "matches":
      return <MatchesView items={card.items} total={card.total} scope={scope} busy={busy} />;
    case "match":
      return (
        <CardShell label={`Match: ${card.match.name}`}>
          <ul>
            <MatchRow m={card.match} scope={scope} busy={busy} />
          </ul>
          <WhyLines why={card.why} />
          <GoLink to={nav("people")}>Open People</GoLink>
        </CardShell>
      );
    case "outreach": {
      const words = STATUS_WORDS.filter((w) => card.counts[w] > 0);
      return (
        <CardShell label="Your outreach">
          <Kicker>Your outreach</Kicker>
          {words.length ? (
            <p className="mt-1 flex flex-wrap gap-1.5">
              {words.map((w: StatusWord) => (
                <Link
                  key={w}
                  to={deskPath(nav("home", null, w))}
                              className={cx("rounded-full border-2 border-studojo-ink bg-white px-2 py-0.5 font-satoshi text-xs font-bold text-studojo-ink hover:bg-studojo-purple-bg", FOCUS_RING)}
                >
                  {labelFor(w)} {card.counts[w]}
                </Link>
              ))}
            </p>
          ) : null}
          <ul className="mt-1 divide-y-2 divide-dashed divide-studojo-ink/10">
            {card.items.map((r) => (
              <li key={r.id} className="py-1.5">
                <Link to={deskPath(nav("outreach", r.id))} className={cx("block rounded-lg", FOCUS_RING)}>
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-satoshi text-sm font-bold text-studojo-ink">
                      {r.lead.name}
                      {r.lead.company ? <span className="font-normal text-studojo-muted">, {r.lead.company}</span> : null}
                    </span>
                    <span className="shrink-0">
                      <StatusPill word={r.status_word} busy={r.busy} />
                    </span>
                  </span>
                  {r.subject ? <span className="block truncate font-satoshi text-xs text-studojo-ink">{stripDashes(r.subject)}</span> : null}
                  <span className="block font-satoshi text-xs text-studojo-muted">{noteFor(r)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {!card.items.length ? <p className="font-satoshi text-sm text-studojo-muted">Nothing here yet.</p> : null}
        </CardShell>
      );
    }
    case "status": {
      const s = card.status;
      return (
        <CardShell label="Where things stand">
          <Kicker>Where things stand</Kicker>
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-satoshi text-xs">
            <Fact label="Matches" value={`${s.matches.total} people, ${s.matches.strong} strong, ${s.matches.new} not written to yet`} />
            <Fact label={labelFor("needs_you")} value={s.counts.needs_you} />
            <Fact label={labelFor("scheduled")} value={s.counts.scheduled} />
            <Fact label="Drafts today" value={`${s.limits.drafts_today} of ${s.limits.drafts_cap}`} />
            <Fact label="Credits" value={`${s.credits.available} left`} />
            <Fact label="Gmail" value={s.gmail.connected ? "Connected" : "Not connected"} />
          </dl>
        </CardShell>
      );
    }
    case "profile": {
      const p = card.profile;
      const notes = [p.notes.best_project, p.notes.outcome, p.notes.credential].filter(Boolean) as string[];
      return (
        <CardShell label="Your profile">
          <Kicker>Your profile</Kicker>
          <p className="mt-1 font-satoshi text-sm font-bold text-studojo-ink">{p.name}</p>
          {p.education ? <p className="font-satoshi text-xs text-studojo-muted">{p.education}</p> : null}
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-satoshi text-xs">
            {p.target_roles.length ? <Fact label="Roles" value={p.target_roles.join(", ")} /> : null}
            {p.locations.length ? <Fact label="Cities" value={p.locations.join(", ")} /> : null}
            {p.top_skills.length ? <Fact label="Skills" value={p.top_skills.slice(0, 6).join(", ")} /> : null}
          </dl>
          {notes.length ? <PlainText className="mt-1.5 text-xs" text={notes.join("\n")} /> : null}
          <GoLink to={nav("profile")}>Open Profile</GoLink>
        </CardShell>
      );
    }
    case "memory":
      return <MemoryView text={card.memory.text} action={card.action} />;
    default:
      return null;
  }
}

const TICKET_STATE: Record<Exclude<Confirmation["status"], "pending">, string> = {
  approved: "Done. Saved.",
  declined: "Cancelled. Nothing changed.",
  expired: "This request expired. Ask me again.",
  failed: "That change did not save. Ask me again.",
};

/** A prepared change that waits for the student: Confirm or Cancel, sent as a normal turn. */
export function ConfirmationCard({ c, scope }: { c: Confirmation; scope: string }) {
  const slot = useSlot(scope);
  const cur = slot.confirmations[c.id] ?? c;
  const lapsed = cur.status === "pending" && (serverDate(cur.expires_at)?.getTime() ?? 0) < Date.now();
  const status = lapsed ? "expired" : cur.status;
  const busy = isBusy(slot.live);
  return (
    <CardShell label="A change waiting for you" tone={status === "pending" ? "yellow" : "white"}>
      <p className="flex items-center gap-1.5 font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-[#92400e]">
        <FiEdit3 aria-hidden /> {status === "pending" ? "Needs your OK" : "Change"}
      </p>
      <PlainText className="mt-1" text={cur.summary} />
      {status === "pending" ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <ChipButton tone="primary" icon={<FiCheck />} disabled={busy} onClick={() => confirm(scope, cur.id, "approve")}>
            Confirm
          </ChipButton>
          <ChipButton icon={<FiX />} disabled={busy} onClick={() => confirm(scope, cur.id, "decline")}>
            Cancel
          </ChipButton>
        </div>
      ) : (
        <p className="mt-2 font-satoshi text-xs font-bold text-studojo-muted">{TICKET_STATE[status]}</p>
      )}
    </CardShell>
  );
}
