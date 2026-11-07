// LEAD-LATE (7 Nov 2026, the owner on Events Manager: Lead 6.1 of 10, "help"; Meta's own breakdown showed every key a
// signed-out click can carry already at 87 to 100%: ip, user agent, fbp, the visitor id, fbc). A Lead is a join or start
// click made before any account exists, so its server copy had no email, phone or name. 38% of the visitors who click
// sign up in the same browser, half within a minute, nine in ten within two. So a signed-out Lead's server copy now
// waits here, in this server's memory, and goes out with the account that visitor made after the click (career_agent
// .career_user_source by visitor id, signed up no earlier than a minute before the click): email, name, phone and the
// phone's country (withAccount), with the click's own time and event_id, so Meta still keeps one of the pair. It goes as
// soon as that account has a verified phone, else after LEAD_HOLD_MS with what there is (the account's email and name,
// or nothing more than before). A signed-in click is sent at once, as before (api.meta-event.tsx).
//
// In memory: one web pod's queue is its own, so two pods never send one Lead twice; a pod that stops sends what it
// holds first (SIGTERM, flushHeldLeads). Never throws.
import { sendMetaEvent, withAccount, type MetaUserData } from "./meta-capi.server";
import { oncePool } from "./tracking-once.server";

/** The longest a Lead waits for its sign-up. */
export const LEAD_HOLD_MS = 10 * 60_000;
/** How often the queue is looked at. */
export const LEAD_TICK_MS = 60_000;
/** An account counts when it signed up after the click, or at most this long before it (the clocks of two servers). */
const SIGNUP_SLACK_MS = 60_000;
/** More held than this (a flood): the oldest goes at once, as it is. */
export const LEAD_QUEUE_CAP = 5_000;

const LEAD = "Lead";

export type HeldLead = {
  eventId: string;
  /** When the click was reported (ms): the event_time Meta gets. */
  at: number;
  sourceUrl: string | null;
  /** What the click's request carried (metaUserDataFromRequest, fbc filled). */
  user: MetaUserData;
  visitorId: string;
};

export type LeadAccount = {
  id: string;
  email: string | null;
  name: string | null;
  /** The verified phone, international form; null when none is verified yet. */
  phone: string | null;
  signedUpAt: number;
};

export type LeadDeps = {
  /** The account each visitor id made, the latest one. */
  accounts: (visitorIds: string[]) => Promise<Map<string, LeadAccount>>;
  send: typeof sendMetaEvent;
  now: () => number;
};

const realDeps: LeadDeps = {
  accounts: async (visitorIds) => {
    const out = new Map<string, LeadAccount>();
    const p = oncePool();
    if (!p || visitorIds.length === 0) return out;
    const r = await p.query<{ visitor_id: string; id: string; email: string | null; name: string | null; phone: string | null; signed_up_at: Date | null }>(
      `SELECT s.visitor_id, u.id, u.email, u.name, p.phone, s.signed_up_at
       FROM career_agent.career_user_source s
       JOIN "user" u ON u.id = s.user_id
       LEFT JOIN career_agent.career_phones p ON p.user_id = u.id AND p.verified_at IS NOT NULL
       WHERE s.visitor_id = ANY($1::text[])
       ORDER BY s.signed_up_at`,
      [visitorIds],
    );
    for (const row of r.rows) {
      out.set(row.visitor_id, { id: row.id, email: row.email, name: row.name, phone: row.phone, signedUpAt: row.signed_up_at ? new Date(row.signed_up_at).getTime() : 0 });
    }
    return out;
  },
  send: sendMetaEvent,
  now: () => Date.now(),
};

let deps: LeadDeps = realDeps;
let held: HeldLead[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let hooked = false;

/** Tests: fake accounts, sender and clock (null puts the real ones back), and an empty queue. */
export function setLeadDeps(d: Partial<LeadDeps> | null): void {
  deps = d ? { ...realDeps, ...d } : realDeps;
  held = [];
}

/** How many Leads are waiting (tests). */
export function heldLeadCount(): number {
  return held.length;
}

/** The account a Lead may carry: one the visitor made after the click (SIGNUP_SLACK_MS). Pure. */
export function accountForLead(lead: HeldLead, account: LeadAccount | undefined): LeadAccount | null {
  return account && account.signedUpAt >= lead.at - SIGNUP_SLACK_MS ? account : null;
}

function sendLead(lead: HeldLead, account: LeadAccount | null): Promise<unknown> {
  const user = account ? withAccount(lead.user, { id: account.id, email: account.email, name: account.name, phoneNumber: account.phone }) : lead.user;
  return deps.send({ eventName: LEAD, eventId: lead.eventId, eventSourceUrl: lead.sourceUrl, user, eventTime: lead.at }).catch(() => undefined);
}

/**
 * Send what is ready: a Lead whose visitor's account has a verified phone, and every Lead held LEAD_HOLD_MS (all of them
 * with `all`, when this server stops). The rest wait for the next tick. Never throws.
 */
export async function sendReadyLeads(all = false): Promise<number> {
  if (held.length === 0) return 0;
  // Taken out while the accounts are read, so a Lead held meanwhile is kept, not overwritten.
  const batch = held;
  held = [];
  let accounts = new Map<string, LeadAccount>();
  try {
    accounts = await deps.accounts([...new Set(batch.map((l) => l.visitorId))]);
  } catch {
    // no database: a Lead still goes when its time is up, as it is
  }
  const now = deps.now();
  const ready: [HeldLead, LeadAccount | null][] = [];
  const waiting: HeldLead[] = [];
  for (const lead of batch) {
    const account = accountForLead(lead, accounts.get(lead.visitorId));
    if (all || account?.phone || now - lead.at >= LEAD_HOLD_MS) ready.push([lead, account]);
    else waiting.push(lead);
  }
  held = [...waiting, ...held];
  await Promise.all(ready.map(([lead, account]) => sendLead(lead, account)));
  if (held.length === 0 && timer) {
    clearInterval(timer);
    timer = null;
  }
  return ready.length;
}

/** SIGTERM: send every Lead still held before the process ends. */
export function flushHeldLeads(): Promise<number> {
  return sendReadyLeads(true);
}

/** Hold a signed-out Lead's server copy (api.meta-event.tsx). Never throws. */
export function holdLead(lead: HeldLead): void {
  try {
    if (held.length >= LEAD_QUEUE_CAP) {
      const oldest = held.shift();
      if (oldest) void sendLead(oldest, null);
    }
    held.push(lead);
    if (!timer) {
      timer = setInterval(() => void sendReadyLeads(), LEAD_TICK_MS);
      timer.unref?.();
    }
    if (!hooked) {
      hooked = true;
      process.once("SIGTERM", () => void flushHeldLeads());
    }
  } catch {
    // analytics never fails a request
  }
}
