// F7 (make this warmer or shorter), F8 (a rule like "no Hyderabad") and F9
// (a punchier headline). Every edit is a proposal: a diff or a memory card
// you approve. Nothing unbacked gets written.
import { pendingDrafts } from "../../core/derive";
import type { FlowCtx, FlowSpec } from "../../core/flow-types";
import type { AppState, ChatBody, Draft, MemoryItem } from "../../types";
import {
  andList,
  cityIn,
  personIn,
  plural,
  RULE_CITY_PREFIX,
  RULE_NEVER_PREFIX,
  ruleTargets,
  shorter,
  warmer,
} from "./helpers";

// ── F7: rewrite a draft ─────────────────────────────────────────────────────

function draftFor(s: AppState, ctx: FlowCtx): Draft | undefined {
  const pending = pendingDrafts(s, ctx.missionId);
  return (
    pending.find((d) => d.id === ctx.input.draftId) ??
    pending.find((d) => d.personId === ctx.input.personId) ??
    pending[0]
  );
}
const isShorter = (ctx: FlowCtx) => /short|trim|tighter|cut it/i.test(ctx.text ?? "") || ctx.input.choice === "shorter";

export const F7: FlowSpec = {
  id: "F7",
  title: (_s, ctx) => (isShorter(ctx) ? "Make this draft shorter" : "Make this draft warmer"),
  triggers: { phrases: ["warmer", "rewrite", "shorter", "friendlier", "less stiff", "make it warm", "tighter"], chip: "Make this warmer" },
  available: (s, ctx) => (draftFor(s, ctx) ? true : "Nothing waiting to rewrite. Open a draft in Approvals and ask again."),
  steps: (s, ctx) => {
    const d = draftFor(s, ctx);
    const p = personIn(s, d?.personId);
    return [
      { skill: "write", label: "Read the draft", detail: p ? `To ${p.first}, ${p.company}` : undefined, ms: 600 },
      {
        skill: "write",
        label: isShorter(ctx) ? "Trimmed it, kept every fact" : "Rewrote the opener, kept every fact",
        detail: "Waiting for you",
        ms: 1200,
        effect: (fx, now) => {
          const cur = draftFor(now, ctx);
          const person = personIn(now, cur?.personId);
          if (!cur || !person) return;
          const after = isShorter(ctx) ? shorter(cur) : warmer(cur, person);
          fx.dispatch({ type: "PROPOSE_DIFF", id: cur.id, after });
          fx.dispatch({ type: "FOCUS", item: { kind: "draft", id: cur.id, label: `Draft to ${person.first}, ${person.company}` } });
        },
      },
    ];
  },
  done: (s, ctx) => {
    const d = draftFor(s, ctx);
    if (!d) return [];
    return [
      { kind: "senpai", text: "Same facts, new words. Use the rewrite or keep yours; the draft in Approvals shows the same diff." },
      { kind: "diff", target: "draft", refId: d.id },
    ];
  },
  result: (s, ctx) => {
    const d = draftFor(s, ctx);
    return d ? { label: "Rewrite in Approvals", tab: "approvals", ids: [d.personId] } : undefined;
  },
};

// ── F8: a rule ──────────────────────────────────────────────────────────────

/** The rule this request proposes, or undefined when nothing is named. */
export function ruleFor(s: AppState, ctx: FlowCtx): MemoryItem | undefined {
  const city = cityIn(ctx.text) ?? (typeof ctx.input.value === "string" ? cityIn(ctx.input.value) : undefined);
  const source = { kind: "chat" as const, label: `Chat on Day ${s.day}` };
  if (city) {
    return { id: `${RULE_CITY_PREFIX}${city.id}`, kind: "rule", text: `No ${city.label} roles`, scope: ctx.missionId, source, proof: "your-word", useInEmails: false };
  }
  const p = personIn(s, ctx.input.personId);
  if (p) {
    return { id: `${RULE_NEVER_PREFIX}${p.id}`, kind: "rule", text: `Never email ${p.first} at ${p.company}`, scope: ctx.missionId, source, proof: "your-word", useInEmails: false };
  }
  return undefined;
}

export const F8: FlowSpec = {
  id: "F8",
  title: (s, ctx) => `Propose a rule: ${ruleFor(s, ctx)?.text ?? "what to avoid"}`,
  triggers: {
    phrases: [
      "don't email",
      "dont email",
      "do not email",
      "never email",
      "stop emailing",
      /\b(no|not|never|avoid|skip)( in)? (hyderabad|chennai|mumbai|pune|bengaluru|bangalore|delhi|kolkata)\b/,
    ],
  },
  available: (s, ctx) => {
    const rule = ruleFor(s, ctx);
    if (!rule) return "Tell me what to avoid, for example \"no Hyderabad\" or \"don't email Cobalt Cloud\".";
    if (s.memory.some((m) => m.id === rule.id)) return `You already have that rule: ${rule.text}. It is in Memory.`;
    return true;
  },
  steps: (s, ctx) => {
    const rule = ruleFor(s, ctx);
    if (!rule) return [];
    return [
      { skill: "write", label: "Proposed a rule", detail: rule.text, ms: 800 },
      {
        skill: "scout",
        label: "Rechecked the queue",
        detail: (now) => {
          const n = ruleTargets(now, rule).length;
          return n ? `${plural(n, "person", "people")} would move to Closed` : "Nobody in the queue is affected";
        },
        ms: 1000,
        effect: (fx, now) => fx.highlight(ruleTargets(now, rule).map((p) => p.id), "scanning"),
      },
    ];
  },
  done: (s, ctx) => {
    const rule = ruleFor(s, ctx);
    if (!rule) return [];
    const targets = ruleTargets(s, rule);
    const out: ChatBody[] = [
      {
        kind: "senpai",
        text: targets.length
          ? `Here is the rule. Save it and I move ${andList(targets.map((p) => p.company))} to Closed and drop their unsent emails. Not now changes nothing.`
          : "Here is the rule. Save it and I check every new match against it. Nobody in the queue changes.",
      },
      { kind: "memory", item: rule, status: "proposed" },
    ];
    return out;
  },
};

// ── F9: a punchier headline ─────────────────────────────────────────────────

const HEADLINES = [
  "Final-year CSE student whose campus app 1,200 students use",
  "Final-year CSE student who shipped Splitkart to 1,200 students in one semester",
];
const BUZZ = ["ai expert", "expert", "rockstar", "ninja", "guru", "10x", "world-class", "visionary", "thought leader"];
const BUZZ_LABEL: Record<string, string> = { "ai expert": "AI expert", "10x": "10x engineer" };
const buzzIn = (ctx: FlowCtx) => BUZZ.find((b) => (ctx.text ?? "").toLowerCase().includes(b));
const nextHeadline = (s: AppState) => HEADLINES.find((h) => h !== s.page.headline) ?? HEADLINES[0];

export const F9: FlowSpec = {
  id: "F9",
  title: "Make your headline punchier",
  triggers: { phrases: ["headline", "punchier", "ai expert", "my page title", "bio", "tagline"], chip: "Make my headline punchier" },
  steps: (s, ctx) => {
    const buzz = buzzIn(ctx);
    const proposal = nextHeadline(s);
    return [
      {
        skill: "coach",
        label: "Drafted a headline with a number",
        detail: "1,200 students",
        ms: 1100,
        effect: (fx) => {
          fx.dispatch({ type: "SET_PAGE", patch: { pendingHeadline: proposal }, note: "Proposed a new headline. Waiting for you", by: "senpai" });
          fx.dispatch({ type: "SET_TAB", tab: "page" });
        },
      },
      {
        skill: "coach",
        label: "Evidence check",
        detail: buzz ? `"${buzz}" has no backing line. Left out` : "Backed by your Splitkart line",
        ms: 800,
      },
    ];
  },
  done: (s, ctx) => {
    const buzz = buzzIn(ctx);
    const out: ChatBody[] = [];
    if (buzz) {
      out.push({
        kind: "senpai",
        text: `Nothing on your resume backs "${BUZZ_LABEL[buzz] ?? buzz}", so it stays off. I led with Splitkart's 1,200 users instead.`,
      });
    }
    out.push({ kind: "diff", target: "page", refId: "headline" });
    out.push({ kind: "senpai", text: "Approve it here or in Page. Until then your page keeps the old headline." });
    return out;
  },
  result: () => ({ label: "Headline diff in Page", tab: "page", ids: [] }),
};
