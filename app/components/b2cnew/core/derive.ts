// Derived values for /b2cnew. Pure functions of AppState: call them in
// render (or through the hooks in core/store.tsx). Deterministic.
// Shared file: owned by the foundation.
import { GIVEN_BACK, TABS } from "../config";
import { DAILY_SEND_CAP, simReplyFor, simulateCampaign, type CampaignSnapshot, type SimReply } from "../data";
import type { AppState, ContextChip, Draft, Mission, MissionId, Person, ReplyState, Run, Stage, TabId } from "../types";

export const missionOf = (s: AppState, id: MissionId = s.env): Mission =>
  s.missions.find((m) => m.id === id) ?? s.missions[0];

/** Today's daily send cap on the ramp. */
export const capFor = (day: number) => DAILY_SEND_CAP[Math.max(0, Math.min(day, DAILY_SEND_CAP.length - 1))];

/**
 * First emails out of a pack by the end of `day`. Approved drafts take their
 * credit from the same pack, so the pack's own plan only sends what is left
 * after them: plan + approved never passes the total. An approved draft
 * counts as sent once its slot day has come. All Simulated.
 */
export function packSends(total: number, drafts: Draft[], id: MissionId, day: number) {
  const approved = drafts.filter((d) => d.missionId === id && d.kind === "first" && d.status === "approved");
  const gone = approved.filter((d) => d.slotDay !== undefined && d.slotDay <= day).length;
  const plan = Math.max(0, Math.min(simulateCampaign(total, day).sent, total - approved.length));
  return { plan, gone, sent: plan + gone, reserved: approved.length - gone, approved: approved.length };
}

/** The simulated campaign for a mission on the current day. All numbers are Simulated. */
export function snapshot(s: AppState, id: MissionId = s.env, day: number = s.day): CampaignSnapshot {
  const m = missionOf(s, id);
  const snap = simulateCampaign(m.total, day);
  const pack = packSends(m.total, s.drafts, id, day);
  // Replies only count for people in this mission.
  const ids = new Set(s.people.filter((p) => p.missionId === id).map((p) => p.id));
  return {
    ...snap,
    sent: pack.sent,
    // The pack is used up: everything is sent or approved and on its way.
    allSent: m.total > 0 && pack.plan + pack.approved >= m.total,
    replies: snap.replies.filter((r) => ids.has(r.matchId)),
  };
}

export interface Fuel {
  total: number;
  sent: number;
  /** Approved first emails waiting for their slot. */
  reserved: number;
  left: number;
  /** Failed sends whose credit came back (Sample). */
  givenBack: number;
  /** First-email drafts still waiting for you. Each needs a credit to approve. */
  waiting: number;
}

export function fuel(s: AppState, id: MissionId = s.env): Fuel {
  const m = missionOf(s, id);
  const pack = packSends(m.total, s.drafts, id, s.day);
  const left = Math.max(0, m.total - pack.sent - pack.reserved);
  const waiting = s.drafts.filter((d) => d.missionId === id && d.kind === "first" && d.status === "pending").length;
  return { total: m.total, sent: pack.sent, reserved: pack.reserved, left, givenBack: m.total > 0 ? GIVEN_BACK : 0, waiting };
}

/** Approving this draft now would need a credit the pack does not have. Follow-ups are free. */
export const needsCredit = (s: AppState, d: Draft) => d.kind === "first" && fuel(s, d.missionId).left <= 0;

/** The reply from this person if it has arrived by the current day. */
export function replyFor(s: AppState, p: Person): { sim: SimReply; state: ReplyState } | undefined {
  const sim = simReplyFor(p.id);
  if (!sim) return undefined;
  const snap = snapshot(s, p.missionId);
  if (!snap.replies.some((r) => r.id === sim.id)) return undefined;
  const state = s.replies.find((r) => r.id === sim.id);
  return state ? { sim, state } : undefined;
}

/** Replies visible on the current day in a mission, newest first. */
export function visibleReplies(s: AppState, id: MissionId = s.env) {
  return snapshot(s, id)
    .replies.map((sim) => {
      const state = s.replies.find((r) => r.id === sim.id);
      const person = s.people.find((p) => p.id === sim.matchId);
      return state && person ? { sim, state, person } : null;
    })
    .filter((x): x is { sim: SimReply; state: ReplyState; person: Person } => !!x)
    .sort((a, b) => b.sim.day - a.sim.day);
}

/**
 * The stage a person shows on the current day. Stored stages Later, Closed,
 * Interview and Offer always win; otherwise a visible reply makes them
 * Replied, a first email on or before today makes them Contacted, and a
 * first email after today (the day was stepped back) shows as Approved.
 */
export function stageOf(s: AppState, p: Person): Stage {
  if (p.stage === "later" || p.stage === "closed" || p.stage === "interview" || p.stage === "offer") return p.stage;
  if (replyFor(s, p)) return "replied";
  const first = p.firstDay ?? approvedFirst(s, p)?.slotDay;
  if (first !== undefined) return first <= s.day ? "contacted" : "approved";
  if (approvedFirst(s, p)) return "approved";
  return p.stage;
}

const approvedFirst = (s: AppState, p: Person) => s.drafts.find((d) => d.personId === p.id && d.kind === "first" && d.status === "approved");

export interface PersonView {
  p: Person;
  stage: Stage;
  reply?: SimReply;
  /** Opened the page from a follow-up on or before today. */
  pageOpened: boolean;
  /** "Follow-up, Day 4" and the like. */
  lastTouch: string;
  /** "Last nudge Day 9", "Approve the first email" and the like. */
  next: string;
  pendingDraft?: Draft;
}

export function personView(s: AppState, p: Person): PersonView {
  const stage = stageOf(s, p);
  const r = replyFor(s, p);
  const pendingDraft = s.drafts.find((d) => d.personId === p.id && d.status === "pending");
  // An approved first email counts from its send day, like the seeded history.
  const f = p.firstDay ?? approvedFirst(s, p)?.slotDay;
  let lastTouch = "Not contacted";
  let next = pendingDraft ? (needsCredit(s, pendingDraft) ? "Draft waiting for credits" : "Draft waiting") : "";
  if (f !== undefined && f <= s.day) {
    const since = s.day - f;
    lastTouch = since >= 9 ? `Last nudge, Day ${f + 9}` : since >= 4 ? `Follow-up, Day ${f + 4}` : `First email, Day ${f}`;
    next = since < 4 ? `Follow-up Day ${f + 4}` : since < 9 ? `Last nudge Day ${f + 9}` : "No more emails";
  } else if (f !== undefined) {
    lastTouch = "Approved";
    next = `First email Day ${f}`;
  }
  if (r) {
    lastTouch = `Replied, Day ${r.sim.day}`;
    next = r.state.tag === "Not now" ? "Nothing to do" : "Answer in Replies";
  }
  if (stage === "later") next = p.snoozeUntil ? `Write again ${p.snoozeUntil}` : "Snoozed";
  if (stage === "closed") next = "";
  return {
    p,
    stage,
    reply: r?.sim,
    pageOpened: p.pageOpenedDay !== undefined && p.pageOpenedDay <= s.day,
    lastTouch,
    next,
    pendingDraft,
  };
}

/** Everyone in a mission with their stage on the current day. */
export function peopleIn(s: AppState, id: MissionId = s.env): PersonView[] {
  return s.people.filter((p) => p.missionId === id).map((p) => personView(s, p));
}

export const STAGE_ORDER: Stage[] = ["matched", "approved", "contacted", "replied", "interview", "offer", "later", "closed"];

export function peopleByStage(s: AppState, id: MissionId = s.env): Record<Stage, PersonView[]> {
  const out = Object.fromEntries(STAGE_ORDER.map((st) => [st, [] as PersonView[]])) as Record<Stage, PersonView[]>;
  for (const v of peopleIn(s, id)) out[v.stage].push(v);
  for (const st of STAGE_ORDER) out[st].sort((a, b) => b.p.fit - a.p.fit);
  return out;
}

export const pendingDrafts = (s: AppState, id: MissionId = s.env): Draft[] =>
  s.drafts.filter((d) => d.missionId === id && d.status === "pending");

/** Counts for the tab strip. null hides the count. */
export function tabCounts(s: AppState, id: MissionId = s.env): Record<TabId, number | null> {
  const people = peopleIn(s, id).filter((v) => v.stage !== "closed").length;
  return {
    today: null,
    people,
    approvals: pendingDrafts(s, id).length,
    replies: visibleReplies(s, id).length,
    page: null,
    prep: s.preps.filter((p) => s.people.some((x) => x.id === p.personId && x.missionId === id)).length || null,
  };
}

/** Unseen replies in a mission (the dot on Replies). */
export const unseenReplies = (s: AppState, id: MissionId = s.env) => visibleReplies(s, id).filter((r) => !r.state.seen).length;

/** Since yesterday: what the brief card says. All Simulated. */
export function briefDelta(s: AppState, id: MissionId = s.env) {
  const now = snapshot(s, id);
  const prev = snapshot(s, id, s.day - 1);
  const newReplies = now.replies.filter((r) => !prev.replies.some((p) => p.id === r.id));
  return {
    sent: now.sent - prev.sent,
    replies: newReplies.length,
    newReplies,
    opens: Math.max(0, now.pageOpens - prev.pageOpens),
    drafts: pendingDrafts(s, id).length,
  };
}

/** First emails sent with no reply yet: the honest line. */
export const noReplyYet = (s: AppState, id: MissionId = s.env) => {
  const snap = snapshot(s, id);
  return Math.max(0, snap.sent - snap.replies.length);
};

/** The run in progress in a mission, if any. */
export const liveRun = (s: AppState, id: MissionId = s.env): Run | undefined =>
  s.runs.find((r) => r.missionId === id && r.status === "running");

/** The chips the composer shows: mission, tab, focus, then anything attached. */
export function composerContext(s: AppState): ContextChip[] {
  const m = missionOf(s);
  const tab = TABS.find((t) => t.id === s.tab);
  const chips: ContextChip[] = [
    { kind: "mission", id: m.id, label: m.short },
    { kind: "tab", id: s.tab, label: tab?.label ?? s.tab },
  ];
  for (const c of [s.focus, ...s.composer.context]) {
    if (c && !chips.some((x) => x.kind === c.kind && x.id === c.id)) chips.push(c);
  }
  return chips;
}

/** Person by id. */
export const personById = (s: AppState, id: string | null | undefined) => (id ? s.people.find((p) => p.id === id) : undefined);
/** Draft by id. */
export const draftById = (s: AppState, id: string | null | undefined) => (id ? s.drafts.find((d) => d.id === id) : undefined);
/** Under 18: the page stays private and notch 3 is out of reach. */
export const isMinor = (s: AppState) => !s.page.visibility.adult;
