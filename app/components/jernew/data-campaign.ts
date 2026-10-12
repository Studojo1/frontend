// Send plan and the SIMULATED campaign for the launch and mission steps.
// Every figure here is simulated: label it "Simulated" wherever it shows.
// Shared file: owned by the foundation. Import it through ./data.

/** Mission control's time scrubber runs Day 0 to this day. */
export const MISSION_DAYS = 14;

/** Daily send cap: a slow ramp keeps a new sender's inbox healthy. */
export const DAILY_SEND_CAP = [10, 15, 20, 25, 30, 35, 40];

const capFor = (day: number) => DAILY_SEND_CAP[Math.min(day, DAILY_SEND_CAP.length - 1)];

/** How many first emails go out on each day until `total` are sent. */
export function sendPlan(total: number): { day: number; count: number }[] {
  const out: { day: number; count: number }[] = [];
  let left = total;
  for (let day = 0; left > 0 && day < 60; day++) {
    const count = Math.min(capFor(day), left);
    out.push({ day, count });
    left -= count;
  }
  return out;
}

/** First emails sent by the end of `day`. */
export function sentByDay(total: number, day: number): number {
  return sendPlan(total)
    .filter((d) => d.day <= day)
    .reduce((n, d) => n + d.count, 0);
}

export type ReplyTag = "Positive" | "Question" | "Not now";

export interface SimReply {
  id: string;
  /** Day the reply arrives on the scrubber. */
  day: number;
  /** Only arrives once at least this many emails have gone out. */
  minSent: number;
  /** A MATCHES id (fictional company). */
  matchId: string;
  tag: ReplyTag;
  text: string;
}

/** Simulated replies. Fictional senders; never present these as real. */
export const SIM_REPLIES: SimReply[] = [
  { id: "rp-1", day: 2, minSent: 20, matchId: "paperplane", tag: "Question",
    text: "Thanks Riya. Is this for an internship from January, or full-time after you graduate?" },
  { id: "rp-2", day: 4, minSent: 40, matchId: "kitebase", tag: "Positive",
    text: "Your expense tracker is neat. Free for a 20 minute call on Thursday?" },
  { id: "rp-3", day: 6, minSent: 50, matchId: "northstar", tag: "Not now",
    text: "No openings on my team this quarter, but I have passed your page to our data lead." },
  { id: "rp-4", day: 8, minSent: 120, matchId: "tandem", tag: "Not now",
    text: "Loved the canteen analysis. We are not taking interns until summer, but write to me again in April." },
  { id: "rp-5", day: 11, minSent: 180, matchId: "brightfold", tag: "Question",
    text: "Are you open to Hyderabad for the first three months?" },
  { id: "rp-6", day: 13, minSent: 300, matchId: "quillpay", tag: "Positive",
    text: "Sending you an invite for a first round. Does next Tuesday work?" },
];

export const REPLY_TAG_STYLE: Record<ReplyTag, string> = {
  Positive: "bg-studojo-green-bg text-[#047857]",
  Question: "bg-studojo-purple-bg text-studojo-purple-strong",
  "Not now": "bg-studojo-surface-muted text-studojo-muted",
};

export interface CampaignSnapshot {
  day: number;
  sent: number;
  followUps: number;
  pageOpens: number;
  replies: SimReply[];
  /** True once every first email in the pack has gone out. */
  allSent: boolean;
}

/**
 * The simulated state of a campaign on a given day. Deterministic: the same
 * pack and day always give the same numbers. `total` is the pack's outreaches
 * (0 for Free, which sends nothing).
 */
export function simulateCampaign(total: number, day: number): CampaignSnapshot {
  const sent = sentByDay(total, day);
  const followUps = sentByDay(total, day - 4);
  const pageOpens = Math.round(followUps * 0.31 + (total > 0 ? Math.min(day, 6) : 0));
  const replies = SIM_REPLIES.filter((r) => r.day <= day && sentByDay(total, r.day) >= r.minSent);
  return { day, sent, followUps, pageOpens, replies, allSent: total > 0 && sent >= total };
}
