// The seed state: what the server renders and what Reset returns to.
// Simulated Day 6 (Sunday 11 Oct 2026) of Riya's jan27 mission, the morning
// run already done. Deterministic. Shared file: owned by the foundation.
import { DEFAULT_DAY, DEFAULT_ENV, DEFAULT_TAB } from "../config";
import {
  EXTRA_PEOPLE,
  FT27_MATCH_IDS,
  FT27_QUIZ,
  GMAIL_SAMPLE_ADDRESS,
  JAN27_MATCH_IDS,
  makeDraft,
  MATCH_EVIDENCE,
  MATCH_HISTORY,
  MATCHES,
  MEMORY_SEED,
  PROFILE_DRAFT,
  rankMatches,
  REPLY_DRAFTS,
  RIYA_QUIZ,
  SIM_REPLIES,
  SURNAMES,
  type ExtraPerson,
  type Match,
} from "../data";
import type { AppState, ChatMsg, LogEntry, Mission, MissionId, Person, QuizAnswers, ReplyState, Run } from "../types";
import { f1Steps, F1_RUN_TITLE } from "./flows-core";

export const SEED_RUN_ID = "run-F1-d6";
/** The 12 people whose first emails the Day 6 morning run drafted. */
const SEED_PENDING_IDS = EXTRA_PEOPLE.filter((x) => x.group === "pending").map((x) => x.id);

export const SEED_MISSIONS: Mission[] = [
  {
    id: "jan27",
    name: "Jan 2027 internship · Product engineering",
    short: "Jan 2027 internship",
    accent: "purple",
    status: "running",
    target: RIYA_QUIZ,
    pack: "standard",
    toppedUp: false,
    total: 200,
    notch: 2,
    approvals: 14,
    lens: ["c-proj-1", "c-proj-1-stack", "c-exp", "c-degree", "c-proj-2", "c-dash", "c-skills", "c-lead"],
    fitFloor: 75,
    neverContact: [],
  },
  {
    id: "ft27",
    name: "Full-time 2027 · Data and growth",
    short: "Full-time 2027",
    accent: "teal",
    status: "draft",
    target: FT27_QUIZ,
    pack: null,
    toppedUp: false,
    total: 0,
    notch: 1,
    approvals: 0,
    lens: ["c-proj-2", "c-dash", "c-exp", "c-degree", "c-proj-1", "c-proj-1-stack", "c-skills", "c-lead"],
    fitFloor: 75,
    neverContact: [],
  },
];

function fromMatch(m: Match, missionId: MissionId, quiz: QuizAnswers): Person {
  const fit = rankMatches(quiz).find((r) => r.id === m.id)?.fit ?? m.baseFit;
  const h = missionId === "jan27" ? MATCH_HISTORY[m.id] : undefined;
  return {
    id: m.id,
    missionId,
    matchId: m.id,
    first: m.manager.first,
    last: SURNAMES[m.manager.first] ?? m.manager.maskedLast,
    title: m.manager.title,
    company: m.company,
    hook: m.hook,
    sector: m.sector,
    city: m.cityLabel,
    stageLabel: m.stageLabel,
    fit,
    why: m.why,
    evidence: MATCH_EVIDENCE[m.id] ?? [],
    stage: h ? "contacted" : "matched",
    address: "verified",
    firstDay: h?.firstDay,
    pageOpenedDay: h?.pageOpenedDay,
    source: "match",
    hiringFor: m.hiringFor,
  };
}

/** A Person from an EXTRA_PEOPLE row (jan27). F6 uses this for the held ten. */
export function fromExtra(x: ExtraPerson, source: Person["source"] = "extra"): Person {
  return {
    id: x.id,
    missionId: "jan27",
    first: x.first,
    last: x.last,
    title: x.title,
    company: x.company,
    hook: x.hook,
    sector: x.sector,
    city: x.city,
    stageLabel: x.stageLabel,
    fit: x.fit,
    why: x.why,
    evidence: x.evidence,
    stage: x.group === "contacted" ? "contacted" : "matched",
    address: "verified",
    firstDay: x.firstDay,
    pageOpenedDay: x.pageOpenedDay,
    source,
    hiringFor: x.hiringFor,
  };
}

function seedPeople(): Person[] {
  const byId = (ids: string[]) => ids.map((id) => MATCHES.find((m) => m.id === id)).filter((m): m is Match => !!m);
  return [
    ...byId(JAN27_MATCH_IDS).map((m) => fromMatch(m, "jan27", RIYA_QUIZ)),
    ...EXTRA_PEOPLE.filter((x) => x.group !== "held").map((x) => fromExtra(x)),
    ...byId(FT27_MATCH_IDS).map((m) => fromMatch(m, "ft27", FT27_QUIZ)),
  ];
}

function seedReplies(): ReplyState[] {
  return SIM_REPLIES.map((r) => ({
    id: r.id,
    personId: r.matchId,
    tag: r.tag,
    savedToGmail: false,
    seen: r.day < DEFAULT_DAY,
    // The morning run drafted the Northstar thank-you.
    draft: r.id === "rp-3" ? REPLY_DRAFTS["rp-3"] : undefined,
  }));
}

function seedRun(): Run {
  return {
    id: SEED_RUN_ID,
    flowId: "F1",
    missionId: "jan27",
    title: F1_RUN_TITLE,
    day: DEFAULT_DAY,
    status: "done",
    steps: f1Steps(DEFAULT_DAY, 200, true).map((st) => ({ skill: st.skill, label: st.label, detail: typeof st.detail === "string" ? st.detail : undefined, status: "done" as const })),
    result: { label: "12 drafts in Approvals", tab: "approvals", ids: SEED_PENDING_IDS },
  };
}

function seedChat(): ChatMsg[] {
  const d = DEFAULT_DAY;
  return [
    { id: "c-j-1", missionId: "jan27", day: d, kind: "divider", text: "Sun 11 Oct · Day 6" },
    { id: "c-j-2", missionId: "jan27", day: d, kind: "run", runId: SEED_RUN_ID },
    { id: "c-j-3", missionId: "jan27", day: d, kind: "senpai",
      text: "Morning. 40 first emails went out yesterday, inside the cap. Northstar said not now, but Tara passed your page to their data lead. I drafted a thank-you that asks for the lead's name. It is in Replies, not sent." },
    { id: "c-j-4", missionId: "jan27", day: d, kind: "decision", text: "12 drafts ready. Nothing is sent until you approve. Review now?",
      actions: [{ label: "Review now", flow: "F2", tone: "primary" }, { label: "Later", tone: "plain" }],
      drafts: SEED_PENDING_IDS.map((id) => `d-first-${id}`) },
    { id: "c-f-1", missionId: "ft27", day: d, kind: "senpai",
      text: "This mission is a draft. Nothing sent here yet. Say the word and I will set it up: three quick questions, then I match people.",
      chips: [{ label: "Launch my data mission", flow: "F14", tone: "primary" }] },
  ];
}

function seedLog(): LogEntry[] {
  return [
    { id: "l-1", day: 5, actor: "you", missionId: "jan27", text: "Approved a run of 35 first emails (Batch)" },
    { id: "l-2", day: 5, actor: "gmail", missionId: "jan27", text: "Sent 35 first emails from you@gmail.com", skill: "send" },
    { id: "l-3", day: 6, actor: "gmail", missionId: "jan27", text: "Sent 40 first emails, inside the daily cap", skill: "send" },
    { id: "l-4", day: 6, actor: "senpai", missionId: "jan27", text: "Tagged Northstar Freight: Not now", skill: "inbox" },
    { id: "l-5", day: 6, actor: "senpai", missionId: "jan27", text: "Drafted 12 first emails. Waiting for you", skill: "write" },
  ];
}

/** A fresh copy of the seed state. Never mutate the result of a previous call. */
export function seedState(): AppState {
  return {
    ready: false,
    env: DEFAULT_ENV,
    tab: DEFAULT_TAB,
    day: DEFAULT_DAY,
    selected: null,
    focus: null,
    dock: { open: true, overlay: false, seg: "chat" },
    sheet: null,
    missions: SEED_MISSIONS.map((m) => ({ ...m })),
    people: seedPeople(),
    drafts: EXTRA_PEOPLE.filter((x) => x.group === "pending").map((x) =>
      makeDraft(fromExtra(x), "first", RIYA_QUIZ, { runId: SEED_RUN_ID }),
    ),
    replies: seedReplies(),
    preps: [],
    memory: MEMORY_SEED.map((m) => ({ ...m })),
    runs: [seedRun()],
    chat: seedChat(),
    log: seedLog(),
    page: {
      live: true,
      headline: PROFILE_DRAFT.headline,
      about: PROFILE_DRAFT.about,
      visibility: { link: true, search: false, managers: false, adult: true },
      claimText: {},
    },
    gmail: { connected: true, address: GMAIL_SAMPLE_ADDRESS, paused: false },
    firedEvents: [`F1:jan27:${DEFAULT_DAY}`],
    highlight: null,
    peopleFilter: null,
    composer: { context: [], draft: "" },
    toast: null,
    bump: null,
    approvalsView: "stack",
    seq: 100,
  };
}
