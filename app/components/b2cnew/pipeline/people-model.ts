// Pure helpers for the People tab: saved views, filtering, the "+N more"
// count and a person's thread timeline. Deterministic; call them in render.
// Owned by Group 2.
import { STAGE_ORDER, snapshot, type PersonView } from "../core/derive";
import type { AppState, Stage } from "../types";

export type ViewId = "needs" | "opened" | "nudged";

/** Local filter state. Senpai's filter (s.peopleFilter) sits on top of it. */
export type PeopleFilter = { kind: "all" } | { kind: "stage"; stage: Stage } | { kind: "view"; id: ViewId };

export const VIEWS: { id: ViewId; label: string; empty: string }[] = [
  { id: "needs", label: "Needs you", empty: "Nothing waiting on you here. Senpai flags the next thing on Today." },
  { id: "opened", label: "Opened my page", empty: "Nobody has opened your page yet. It travels in follow-ups from Day 4." },
  { id: "nudged", label: "No reply after the nudge", empty: "Nobody yet. Last nudges go out 9 days after the first email." },
];

/** Something for the student to do on this person right now. */
export function needsYou(s: AppState, v: PersonView): boolean {
  if (v.pendingDraft) return true;
  const st = s.replies.find((r) => r.personId === v.p.id);
  if (!v.reply || !st) return false;
  if (st.tag === "Question") return !st.savedToGmail;
  if (st.tag === "Positive") return !st.outcome;
  return false;
}

/** Every email in the thread went (first, follow-up, nudge) and nothing came back. */
export function nudgedNoReply(s: AppState, v: PersonView): boolean {
  const f = v.p.firstDay;
  return f !== undefined && !v.reply && s.day >= f + 9 && v.stage !== "closed";
}

export function inView(s: AppState, v: PersonView, id: ViewId): boolean {
  if (id === "needs") return needsYou(s, v);
  if (id === "opened") return v.pageOpened;
  return nudgedNoReply(s, v);
}

/** Applies Senpai's filter (wins), then the local filter, then the search text. */
export function applyFilter(s: AppState, all: PersonView[], f: PeopleFilter, q: string): PersonView[] {
  let out = all;
  if (s.peopleFilter) {
    const ids = new Set(s.peopleFilter.ids);
    out = out.filter((v) => ids.has(v.p.id));
  } else if (f.kind === "stage") out = out.filter((v) => v.stage === f.stage);
  else if (f.kind === "view") out = out.filter((v) => inView(s, v, f.id));
  const needle = q.trim().toLowerCase();
  if (needle) {
    out = out.filter((v) => `${v.p.first} ${v.p.last} ${v.p.company} ${v.p.title} ${v.p.city}`.toLowerCase().includes(needle));
  }
  return out;
}

/** List groups by what needs you: people who answered first, then drafts waiting, then the rest. */
const NEED_ORDER: Stage[] = ["replied", "interview", "offer", "matched", "approved", "contacted", "later", "closed"];

/** Groups in need order, best fit first inside each. Empty groups are left out. */
export function groupByStage(list: PersonView[]): { stage: Stage; people: PersonView[] }[] {
  return NEED_ORDER.map((stage) => ({ stage, people: list.filter((v) => v.stage === stage).sort((a, b) => b.p.fit - a.p.fit) })).filter(
    (g) => g.people.length > 0,
  );
}

export function stageCounts(all: PersonView[]): Record<Stage, number> {
  const out = Object.fromEntries(STAGE_ORDER.map((st) => [st, 0])) as Record<Stage, number>;
  for (const v of all) out[v.stage]++;
  return out;
}

/** First emails sent that have no named row here: "+ 157 more already contacted (Sample)". */
export function moreContacted(s: AppState, all: PersonView[]): number {
  const shown = all.filter((v) => v.p.firstDay !== undefined && v.p.firstDay <= s.day).length;
  return Math.max(0, snapshot(s).sent - shown);
}

// ── Thread timeline ─────────────────────────────────────────────────────────

export type ThreadStatus = "done" | "next" | "later" | "off" | "waiting";

export interface ThreadItem {
  id: string;
  kind: "draft" | "first" | "follow" | "opened" | "reply" | "nudge" | "outcome" | "snooze";
  label: string;
  /** "Day 4" and the like. */
  when?: string;
  detail?: string;
  status: ThreadStatus;
}

/** What happened and what is scheduled with this person, oldest first. All Simulated. */
export function threadOf(s: AppState, v: PersonView): ThreadItem[] {
  const out: ThreadItem[] = [];
  const { p } = v;
  const f = p.firstDay;
  const stopped = v.stage === "closed" || v.stage === "later";
  const approved = s.drafts.find((d) => d.personId === p.id && d.kind === "first" && d.status === "approved");
  if (f === undefined) {
    if (v.pendingDraft) {
      out.push({ id: "draft", kind: "draft", label: "First email drafted", detail: `"${v.pendingDraft.subject}"`, status: "waiting", when: "Waiting for you" });
    } else if (approved) {
      out.push({ id: "first", kind: "first", label: "First email approved", detail: `"${approved.subject}"`, status: "next", when: `Goes Day ${approved.slotDay ?? s.day + 1}` });
    } else {
      out.push({ id: "draft", kind: "draft", label: stopped ? "No email drafted" : "Not drafted yet", status: "off" });
    }
    if (v.stage === "later" && p.snoozeUntil) out.push({ id: "snooze", kind: "snooze", label: "Snoozed", when: p.snoozeUntil, status: "later" });
    return out;
  }
  const at = (d: number): ThreadStatus => (d <= s.day ? "done" : "later");
  const reply = v.reply;
  const replyDay = reply?.day;
  // Emails stop once they reply, or when the person is closed or snoozed.
  const cut = (d: number) => (replyDay !== undefined && d > replyDay) || (stopped && d > s.day);
  out.push({ id: "first", kind: "first", label: "First email", when: `Day ${f}`, status: at(f) });
  const follow = f + 4;
  out.push({
    id: "follow",
    kind: "follow",
    label: s.page.live ? "Follow-up with your page" : "Follow-up, without the link",
    when: `Day ${follow}`,
    status: cut(follow) ? "off" : follow <= s.day ? "done" : follow === s.day + 1 ? "next" : "later",
    detail: cut(follow) ? "Not sent: the thread stopped" : undefined,
  });
  if (v.pageOpened && p.pageOpenedDay !== undefined) {
    out.push({ id: "opened", kind: "opened", label: "Opened your page", when: `Day ${p.pageOpenedDay}`, status: "done" });
  }
  if (reply) {
    const tag = s.replies.find((r) => r.id === reply.id)?.tag ?? reply.tag;
    out.push({ id: "reply", kind: "reply", label: `Replied: ${tag}`, when: `Day ${reply.day}`, detail: `"${reply.text}"`, status: "done" });
  }
  const nudge = f + 9;
  out.push({
    id: "nudge",
    kind: "nudge",
    label: "Last nudge, then the thread stops",
    when: `Day ${nudge}`,
    status: cut(nudge) ? "off" : nudge <= s.day ? "done" : nudge === s.day + 1 ? "next" : "later",
    detail: cut(nudge) ? "Not sent: the thread stopped" : undefined,
  });
  if (v.stage === "interview" || v.stage === "offer") {
    out.push({ id: "outcome", kind: "outcome", label: v.stage === "offer" ? "You got an offer" : "You got an interview", status: "done" });
  }
  if (v.stage === "later" && p.snoozeUntil) out.push({ id: "snooze", kind: "snooze", label: "Snoozed: write again", when: p.snoozeUntil, status: "later" });
  return out.sort((a, b) => dayNum(a) - dayNum(b));
}

const dayNum = (t: ThreadItem) => {
  const m = t.when?.match(/^Day (\d+)/);
  if (m) return Number(m[1]);
  return t.kind === "draft" ? -1 : 99;
};

/** Months a student can snooze someone to. Fixed labels, never read from the clock. */
export const SNOOZE_OPTIONS = ["Dec 2026", "Jan 2027", "Mar 2027", "Apr 2027"];

/** Was the first email already sent (so Swap makes no sense)? */
export const alreadyContacted = (s: AppState, v: PersonView) => v.p.firstDay !== undefined && v.p.firstDay <= s.day;
