// "I can't do that": calls, applying for you, other sites, messages outside
// Gmail and sending replies. Senpai says so plainly and offers what it can
// do instead. No run, nothing changes in the workspace.
import { pendingDrafts } from "../../core/derive";
import type { FlowCtx, FlowSpec } from "../../core/flow-types";
import type { AppState, QuickChip } from "../../types";
import { personIn, replyVisible } from "./helpers";

type Kind = "call" | "apply" | "elsewhere" | "message" | "reply";

const ASK = String.raw`\b(can|could|would|will) you (please )?`;
const PATTERNS: Record<Kind, RegExp[]> = {
  call: [
    new RegExp(`${ASK}(call|phone|ring|dial)\\b`),
    /^(please )?(call|phone|ring|dial)\b/,
    /\b(call|phone|ring|dial)\b[^.?!]*\b(for me|on my behalf)\b/,
    /\b(join|take|attend) the call (for me|on my behalf)\b/,
  ],
  apply: [
    /\bapply\b[^.?!]*\b(for me|on my behalf)\b/,
    new RegExp(`${ASK}apply\\b`),
    /\bauto[- ]?apply\b/,
    /\bsubmit (my|an|the) application\b/,
  ],
  elsewhere: [/\blinked ?in\b/, /\binmail\b/],
  message: [/\bwhats ?app\b/, /\b(text|sms|dm) (him|her|them|[a-z]+ for me)\b/, /\bsend (him|her|them) a (text|dm|message)\b/],
  reply: [
    /\b(reply|respond|answer)\b[^.?!]*\b(for me|on my behalf)\b/,
    /\bsend (the|a|my|this|that) (reply|answer)\b/,
    /\bauto[- ]?reply\b/,
  ],
};

function kindOf(text: string | undefined): Kind {
  const t = (text ?? "").toLowerCase();
  for (const k of Object.keys(PATTERNS) as Kind[]) if (PATTERNS[k].some((re) => re.test(t))) return k;
  return "reply";
}

/** What Senpai can do instead, only where it would work right now. */
function instead(s: AppState, ctx: FlowCtx, kind: Kind): QuickChip[] {
  const out: QuickChip[] = [];
  const jan = ctx.missionId === "jan27";
  if (jan && (kind === "call" || kind === "reply" || kind === "message") && replyVisible(s, "jan27", "rp-2")) {
    out.push({ label: "Say yes to Kitebase and prep me", flow: "F4", tone: "primary" });
  }
  if (jan && (kind === "reply" || kind === "message") && replyVisible(s, "jan27", "rp-1")) out.push({ label: "Answer Karan", flow: "F3" });
  if (kind === "call" && s.preps.length) out.push({ label: "Practise 3 questions", flow: "F12" });
  if ((kind === "apply" || kind === "elsewhere") && pendingDrafts(s, ctx.missionId).length) out.push({ label: "Review drafts", flow: "F2", tone: "primary" });
  if ((kind === "apply" || kind === "elsewhere") && jan) out.push({ label: "Find 10 more like Kitebase", flow: "F6" });
  // The person you named comes first.
  if (ctx.input.personId === "paperplane") out.sort((a, b) => (a.flow === "F3" ? -1 : b.flow === "F3" ? 1 : 0));
  return out.slice(0, 3);
}

function line(s: AppState, ctx: FlowCtx, kind: Kind): string {
  const p = personIn(s, ctx.input.personId);
  const who = p ? p.first : "them";
  switch (kind) {
    case "call":
      return `I can't call anyone or join a call. I can draft a reply to ${who} for your Gmail drafts and get you ready for the call.`;
    case "apply":
      return "I don't apply to jobs for you. I find the person who hires, draft a short email from your own Gmail, and nothing goes until you approve it.";
    case "elsewhere":
      return "I only work through your own Gmail. I don't message anyone on other sites, and I never sign in anywhere as you.";
    case "message":
      return `I can't message ${who} outside your Gmail. I can draft an email or a reply, and you decide if it goes.`;
    default:
      return `I never send replies. I draft one${p ? ` to ${p.first}` : ""}, you put it in your Gmail drafts and send it yourself.`;
  }
}

export const FCANT: FlowSpec = {
  id: "cant",
  title: "Something Senpai does not do",
  triggers: { phrases: Object.values(PATTERNS).flat() },
  steps: () => [],
  done: (s, ctx) => {
    const kind = kindOf(ctx.text);
    const chips = instead(s, ctx, kind);
    return [{ kind: "senpai", text: line(s, ctx, kind), chips: chips.length ? chips : undefined }];
  },
};
