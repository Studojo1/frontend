// TodayTab: the ten-second answer to "what happened and what needs me".
// REFERENCE TAB built by the foundation; owned by Group 2 from here on.
// Patterns to copy: read state with useB2C() and derive.ts (never store
// derived numbers), change it only with dispatch(action), ask the agent
// with useAgent() (start a flow, or open it with a context chip), label
// every number Sample or Simulated, and keep each card plain and quick.
import { motion } from "framer-motion";
import { FiArrowRight, FiCoffee, FiCreditCard, FiInbox, FiMessageCircle, FiPhoneCall } from "react-icons/fi";
import type { ReactNode } from "react";
import { briefDelta, fuel, liveRun, snapshot, visibleReplies } from "../core/derive";
import { chipFor, useAgent } from "../core/engine";
import { COPY } from "../config";
import { useB2C, useMission } from "../core/store";
import { dayDate } from "../data";
import { useMotionPresets } from "../motion";
import type { B2Action, ContextChip } from "../types";
import { AnimatedNumber, Badge, Button, Card, cx, IconButton, SectionHeader, SkillChip } from "../ui";
import { ComingUp, DraftMission, MissionSoFar, PausedCard, TodaysSending, TopUpCard } from "./today-parts";

export function TodayTab() {
  const { s } = useB2C();
  const m = useMission();
  if (m.total === 0) return <DraftMission />;
  const snap = snapshot(s);
  return (
    <div className="space-y-6">
      {s.gmail.paused || m.status === "paused" ? <PausedCard /> : null}
      <BriefCard />
      <NeedsYou />
      {snap.allSent ? <TopUpCard /> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <TodaysSending />
        <MissionSoFar />
      </div>
      <ComingUp />
    </div>
  );
}

// ── Brief card ──────────────────────────────────────────────────────────────

function BriefCard() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const d = briefDelta(s);
  const f = fuel(s);
  const starved = f.left === 0 && f.waiting > 0;
  const run = liveRun(s) ?? [...s.runs].reverse().find((r) => r.missionId === s.env && r.flowId === "F1");
  const skills = run ? Array.from(new Set(run.steps.map((st) => st.skill))) : [];
  return (
    <Card tone="purple" shadow="lg" as="section" aria-labelledby="today-brief" className="relative overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="today-brief" className="font-satoshi text-[11px] font-bold uppercase tracking-[0.14em] text-studojo-purple-strong">
          Since yesterday · {dayDate(s.day).label}
        </h2>
        <Badge kind="simulated" />
      </div>
      <p className="mt-2 font-clash text-xl font-semibold leading-snug text-studojo-ink sm:text-2xl">
        <AnimatedNumber value={d.sent} /> first emails sent, <AnimatedNumber value={d.replies} /> new {d.replies === 1 ? "reply" : "replies"},{" "}
        <AnimatedNumber value={d.opens} /> page opens.
        {d.drafts > 0 ? (
          <>
            {" "}
            <button type="button" onClick={() => dispatch({ type: "SET_TAB", tab: "approvals" })} className="rounded-md text-studojo-purple-strong underline decoration-2 underline-offset-4">
              {starved ? `${d.drafts} ${d.drafts === 1 ? "draft" : "drafts"} waiting for credits.` : `${d.drafts} ${d.drafts === 1 ? "draft needs" : "drafts need"} you.`}
            </button>
          </>
        ) : null}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {run ? (
          <>
            <span className="font-satoshi text-sm text-studojo-muted">{run.status === "running" ? "Senpai is on it:" : "Senpai's morning run:"}</span>
            {skills.map((k) => (
              <SkillChip key={k} skill={k} />
            ))}
          </>
        ) : null}
        <div className="flex-1" />
        <Button variant="secondary" size="sm" iconRight={<FiArrowRight />} onClick={() => agent.open({ seg: "chat", focus: false })}>
          See steps
        </Button>
      </div>
    </Card>
  );
}

// ── Needs you ───────────────────────────────────────────────────────────────

interface NeedItem {
  id: string;
  icon: ReactNode;
  tone: "purple" | "pink" | "green" | "orange";
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  ask?: ContextChip;
}

/** Card titles the spec words exactly, by SIM_REPLIES id. */
const TITLE: Record<string, string> = { "rp-2": "Kitebase call on Thursday", "rp-3": "Northstar passed your page on" };
/** Simulated day of each booked call (Kitebase: Thursday 15 Oct is Day 10). */
const CALL_DAY: Record<string, number> = { "rp-2": 10 };

function NeedsYou() {
  const { s, dispatch } = useB2C();
  const agent = useAgent();
  const m = useMotionPresets();
  const go = (...actions: B2Action[]) => () => actions.forEach(dispatch);
  const items: NeedItem[] = [];
  // Drafts to approve live in the brief's headline link. Only an empty pack earns its own card.
  const f = fuel(s);
  if (f.left === 0 && f.waiting > 0) {
    items.push({ id: "drafts", icon: <FiCreditCard />, tone: "orange", title: `${f.waiting} ${f.waiting === 1 ? "draft" : "drafts"} waiting for credits`,
      body: "Your pack is used up. Top up to approve them, or skip the ones you do not want. Skipping is free.", cta: "Top up", onClick: go({ type: "SHEET", sheet: "wallet" }) });
  }
  const replies = visibleReplies(s);
  const rank = { Question: 0, Positive: 1, "Not now": 2 } as const;
  for (const r of [...replies].sort((a, b) => rank[a.state.tag] - rank[b.state.tag])) {
    const { sim, state, person: p } = r;
    const chip = chipFor.reply(state, `${p.first}, ${p.company}`);
    if (state.tag === "Question" && !state.savedToGmail) {
      items.push({ id: sim.id, icon: <FiMessageCircle />, tone: "pink", title: `${p.first} at ${p.company} asked a question`, body: `"${sim.text}"`, cta: "Answer", ask: chip,
        onClick: go({ type: "SET_TAB", tab: "replies" }, { type: "FOCUS", item: chip }) });
    } else if (state.tag === "Positive" && !state.outcome && CALL_DAY[sim.id] !== undefined && s.day > CALL_DAY[sim.id]) {
      // The call date has passed: ask how it went instead of offering prep.
      const prep = s.preps.find((x) => x.personId === p.id);
      if (!prep?.outcome) {
        items.push({ id: sim.id, icon: <FiPhoneCall />, tone: "green", title: `How did the ${p.company} call go?`, body: `Log it: next round, offer or no next step. ${COPY.noFee.replace("Yours. ", "")}`,
          cta: "Log outcome", ask: chip, onClick: prep ? go({ type: "SET_TAB", tab: "prep" }) : go({ type: "SET_TAB", tab: "replies" }, { type: "FOCUS", item: chip }) });
      }
    } else if (state.tag === "Positive" && !state.outcome) {
      const prep = s.preps.find((x) => x.personId === p.id);
      items.push({ id: sim.id, icon: <FiPhoneCall />, tone: "green", title: TITLE[sim.id] ?? `${p.company} wants to talk`, body: prep ? `Prep pack ready. ${prep.when} (Simulated).` : `"${sim.text}"`,
        cta: prep ? "Open prep" : "Make a prep pack", ask: chip,
        onClick: prep ? go({ type: "SET_TAB", tab: "prep" }) : () => { agent.open({ focus: false }); agent.start("F4", { personId: p.id, replyId: sim.id }); } });
    } else if (state.tag === "Not now" && state.draft && !state.savedToGmail) {
      items.push({ id: sim.id, icon: <FiInbox />, tone: "orange", title: TITLE[sim.id] ?? `${p.first} at ${p.company} said not now`, body: "A thank-you draft is ready. You send it from Gmail.", cta: "See draft", ask: chip,
        onClick: go({ type: "SET_TAB", tab: "replies" }, { type: "FOCUS", item: chip }) });
    }
  }
  const shown = items.slice(0, 4);
  return (
    <section aria-labelledby="today-needs">
      <SectionHeader id="today-needs" title="Needs you" kicker={shown.length ? `${shown.length} thing${shown.length === 1 ? "" : "s"}` : undefined} />
      {shown.length ? (
        <motion.ul variants={m.list} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
          {shown.map((it) => (
            <motion.li key={it.id} variants={m.item}>
              <NeedCard it={it} onAsk={it.ask ? () => agent.open({ attach: it.ask }) : undefined} />
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <Card shadow="none" className="flex items-center gap-3 border-dashed">
          <FiCoffee aria-hidden className="text-xl" />
          <p className="font-satoshi text-sm text-studojo-muted">Nothing needs you right now. Senpai will flag the next thing here.</p>
        </Card>
      )}
    </section>
  );
}

const NEED_TONE = { purple: "bg-studojo-purple-bg text-studojo-purple-strong", pink: "bg-studojo-pink-bg text-[#be185d]", green: "bg-studojo-green-bg text-[#047857]", orange: "bg-studojo-orange-bg text-[#92400e]" };

function NeedCard({ it, onAsk }: { it: NeedItem; onAsk?: () => void }) {
  return (
    <Card pad="sm" shadow="sm" className="flex h-full items-start gap-3">
      <span aria-hidden className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-studojo-ink text-lg", NEED_TONE[it.tone])}>{it.icon}</span>
      <div className="min-w-0 flex-1">
        <h3 className="font-satoshi text-base font-bold leading-snug">{it.title}</h3>
        <p className="mt-0.5 line-clamp-2 font-satoshi text-sm text-studojo-muted">{it.body}</p>
        <div className="mt-2 flex items-center gap-1">
          <Button size="sm" variant="secondary" onClick={it.onClick} className="min-h-10">
            {it.cta}
          </Button>
          {onAsk ? <IconButton label={`Ask Senpai about: ${it.title}`} icon={<FiMessageCircle />} size="sm" onClick={onAsk} /> : null}
        </div>
      </div>
    </Card>
  );
}
