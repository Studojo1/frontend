// Today tab sections: today's sending, mission so far, coming up, and the
// paused, all-sent and draft-mission states. Part of the REFERENCE TAB;
// owned by Group 2 from here on.
import type { ReactNode } from "react";
import { FiCalendar, FiClock, FiEye, FiPause, FiPhoneCall, FiSend, FiZap } from "react-icons/fi";
import { COPY, GIVEN_BACK } from "../config";
import { capFor, fuel, noReplyYet, peopleIn, snapshot } from "../core/derive";
import { useAgent } from "../core/engine";
import { useB2C, useMission } from "../core/store";
import { dayDate, formatINR, PACK_RULES, PACKS, SEND_PACE, sentByDay, TOP_UP } from "../data";
import { targetSummary } from "../shell/mission-header";
import { AnimatedNumber, Avatar, Badge, Button, Card, SectionHeader, SimNote } from "../ui";
import { SlotBar } from "./today-slots";

// ── Today's sending ─────────────────────────────────────────────────────────

export function TodaysSending() {
  const { s } = useB2C();
  const m = useMission();
  const cap = capFor(s.day);
  const now = snapshot(s);
  const held = s.gmail.paused || m.status === "paused";
  const sentToday = held ? 0 : now.sent - snapshot(s, s.env, s.day - 1).sent;
  const failed = sentToday > 0 ? GIVEN_BACK : 0;
  return (
    <section aria-labelledby="today-sending">
      <SectionHeader id="today-sending" title="Today's sending" kicker={`Cap ${cap} today`} />
      <Card pad="sm" shadow="sm">
        <SlotBar cap={cap} used={sentToday} failed={failed} held={held} />
        <p className="mt-3 font-satoshi text-sm text-studojo-ink">
          {held ? (
            <>Held. {s.gmail.paused ? COPY.paused : "This mission is paused. Nothing goes out from it until you resume."}</>
          ) : now.allSent && sentToday === 0 ? (
            <>All {m.total} first emails are out. Follow-ups keep going on schedule.</>
          ) : (
            <>
              <b>{sentToday}</b> of today's {cap} sent from {s.gmail.address}, {SEND_PACE}.
            </>
          )}
        </p>
        {failed ? (
          <p className="mt-1 font-satoshi text-sm text-[#047857]">
            {failed} sends failed, {failed} credits given back. <SimNote kind="sample" className="ml-1" />
          </p>
        ) : null}
      </Card>
    </section>
  );
}

// ── Mission so far ──────────────────────────────────────────────────────────

export function MissionSoFar() {
  const { s } = useB2C();
  const agent = useAgent();
  const snap = snapshot(s);
  const stats = [
    { label: "First emails", value: snap.sent },
    { label: "Follow-ups", value: snap.followUps },
    { label: "Page opens", value: snap.pageOpens },
    { label: "Replies", value: snap.replies.length },
  ];
  return (
    <section aria-labelledby="today-sofar">
      <SectionHeader id="today-sofar" title="Mission so far" action={<Badge kind="simulated" />} />
      <Card pad="sm" shadow="sm">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="rounded-xl bg-studojo-surface-muted px-3 py-2">
              <dt className="font-satoshi text-xs text-studojo-muted">{st.label}</dt>
              <dd className="font-clash text-2xl font-semibold">
                <AnimatedNumber value={st.value} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 font-satoshi text-sm text-studojo-ink">
          No reply yet from <b>{noReplyYet(s)}</b>. Follow-ups are still scheduled. {PACK_RULES.noGuarantee}
        </p>
        {snap.pageOpens > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<FiEye />}
            className="-ml-2 mt-1"
            onClick={() => {
              agent.open({ focus: false });
              agent.start("F10");
            }}
          >
            Who opened my page?
          </Button>
        ) : null}
      </Card>
    </section>
  );
}

// ── Coming up ───────────────────────────────────────────────────────────────

export function ComingUp() {
  const { s } = useB2C();
  const m = useMission();
  const tomorrow = s.day + 1;
  const held = s.gmail.paused || m.status === "paused";
  const follows = sentByDay(m.total, tomorrow - 4) - sentByDay(m.total, tomorrow - 5);
  const nudges = sentByDay(m.total, tomorrow - 9) - sentByDay(m.total, tomorrow - 10);
  const approved = s.drafts.filter((d) => d.missionId === s.env && d.status === "approved" && (d.slotDay ?? 0) > s.day);
  const items: { id: string; icon: ReactNode; text: string; when: string }[] = [];
  if (!held && follows > 0) items.push({ id: "f", icon: <FiSend />, text: `${follows} follow-ups ${s.page.live ? "carrying your page" : "without the link"}`, when: `Day ${tomorrow}` });
  if (!held && nudges > 0) items.push({ id: "n", icon: <FiSend />, text: `${nudges} last nudges, then those threads stop`, when: `Day ${tomorrow}` });
  if (approved.length) items.push({ id: "a", icon: <FiClock />, text: `${approved.length} emails you approved`, when: `From Day ${Math.min(...approved.map((d) => d.slotDay ?? tomorrow))}` });
  for (const p of s.preps) {
    const who = s.people.find((x) => x.id === p.personId);
    if (who?.missionId === s.env) items.push({ id: p.id, icon: <FiPhoneCall />, text: `Call with ${who.first}, ${who.company}`, when: `${p.when} (Simulated)` });
  }
  for (const v of peopleIn(s).filter((x) => x.stage === "later" && x.p.snoozeUntil)) {
    items.push({ id: v.p.id, icon: <FiCalendar />, text: `Write to ${v.p.first} at ${v.p.company}`, when: v.p.snoozeUntil ?? "" });
  }
  for (const r of s.replies.filter((x) => x.remindOn)) {
    const who = s.people.find((x) => x.id === r.personId);
    if (who?.missionId === s.env) items.push({ id: r.id, icon: <FiClock />, text: `Reminder: ${who.first} at ${who.company}`, when: r.remindOn ?? "" });
  }
  return (
    <section aria-labelledby="today-coming">
      <SectionHeader id="today-coming" title="Coming up" kicker={`From ${dayDate(tomorrow).label}`} />
      {items.length ? (
        <ul className="divide-y-2 divide-studojo-ink/10 rounded-2xl border-2 border-studojo-ink bg-white">
          {items.map((it) => (
            <li key={it.id} className="flex min-h-12 items-center gap-3 px-3 py-2 font-satoshi text-sm">
              <span aria-hidden className="text-studojo-muted">{it.icon}</span>
              <span className="min-w-0 flex-1">{it.text}</span>
              <span className="shrink-0 text-xs font-bold text-studojo-muted">{it.when}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-satoshi text-sm text-studojo-muted">Nothing scheduled yet.</p>
      )}
    </section>
  );
}

// ── States ──────────────────────────────────────────────────────────────────

export function PausedCard() {
  const { s, dispatch } = useB2C();
  const m = useMission();
  if (!s.gmail.paused && m.status === "paused") {
    return (
      <Card tone="orange" pad="sm" shadow="sm" role="status" className="flex items-center gap-3">
        <FiPause aria-hidden className="shrink-0 text-xl" />
        <p className="min-w-0 flex-1 font-satoshi text-sm font-bold">This mission is paused. Nothing goes out from it until you resume. Replies still land.</p>
        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "UPDATE_MISSION", id: m.id, patch: { status: "running" }, note: "Resumed this mission" })}>
          Resume
        </Button>
      </Card>
    );
  }
  return (
    <Card tone="orange" pad="sm" shadow="sm" role="status" className="flex items-center gap-3">
      <FiPause aria-hidden className="shrink-0 text-xl" />
      <p className="min-w-0 flex-1 font-satoshi text-sm font-bold">{s.gmail.connected ? COPY.paused : "Gmail is disconnected. Nothing sends until you connect again."}</p>
      <Button size="sm" variant="secondary" onClick={() => dispatch(s.gmail.connected ? { type: "PAUSE_SENDING", paused: false } : { type: "CONNECT_GMAIL" })}>
        {s.gmail.connected ? "Resume" : "Connect"}
      </Button>
    </Card>
  );
}

export function TopUpCard() {
  const { s } = useB2C();
  const agent = useAgent();
  const f = fuel(s);
  return (
    <Card tone="yellow" shadow="md" as="section" aria-labelledby="today-topup">
      <h2 id="today-topup" className="font-clash text-xl font-semibold">All {f.total} first emails are out</h2>
      <p className="mt-1 font-satoshi text-sm text-studojo-ink">
        Follow-ups and last nudges keep going. Want more? {formatINR(TOP_UP.price)} for {TOP_UP.outreaches} more, to people already matched. {PACK_RULES.oneTime}
      </p>
      <Button
        className="mt-3"
        icon={<FiZap />}
        onClick={() => {
          agent.open({ focus: false });
          agent.start("F13");
        }}
      >
        Top up with Senpai
      </Button>
    </Card>
  );
}

export function DraftMission() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMission();
  const starter = PACKS.find((p) => p.id === "starter");
  const people = peopleIn(s).slice(0, 4);
  return (
    <div className="space-y-6">
      <Card tone="white" shadow="lg" as="section" aria-labelledby="today-draft">
        <p className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-muted">Draft mission</p>
        <h2 id="today-draft" className="mt-1 font-clash text-2xl font-semibold">Nothing sent here yet</h2>
        <p className="mt-1 font-satoshi text-sm text-studojo-muted">{targetSummary(m)}</p>
        <p className="mt-3 font-satoshi text-sm">
          Fund it to start: {starter ? `${starter.name} ${formatINR(starter.price)} for ${starter.outreaches}` : "a pack"}, or move unspent credits from another mission. {PACK_RULES.oneTime}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              agent.open({ focus: false });
              agent.start("F14");
            }}
          >
            Set it up with Senpai
          </Button>
          <Button variant="secondary" onClick={() => dispatch({ type: "SHEET", sheet: "wallet" })}>
            See packs
          </Button>
        </div>
      </Card>
      {people.length ? (
        <section aria-labelledby="today-draft-people">
          <SectionHeader id="today-draft-people" title="Already matched" action={<Badge kind="sample" />} />
          <ul className="grid gap-2 sm:grid-cols-2">
            {people.map((v) => (
              <li key={v.p.id} className="flex items-center gap-3 rounded-2xl border-2 border-studojo-ink bg-white p-3">
                <Avatar first={v.p.first} last={v.p.last} size="sm" />
                <span className="min-w-0 flex-1 font-satoshi text-sm">
                  <b>{v.p.first} {v.p.last}</b>, {v.p.title}
                  <span className="block truncate text-studojo-muted">{v.p.company} · {v.p.city}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
