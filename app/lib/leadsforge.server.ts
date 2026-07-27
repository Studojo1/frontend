// LeadsForge client — verified contract (api.leadsforge.ai/public/v1).
//  - Auth: raw API key in Authorization header, NO "Bearer" prefix.
//  - Enrichment is async: POST a job, poll the job, fetch results.
//  - Billed only on a verified result; misses are free.
// The key lives in LEADSFORGE_API_KEY. When unset, isConfigured() is false and
// the engine returns a clean 503 rather than pretending.
const BASE = "https://api.leadsforge.ai/public/v1";

function key(): string {
  return process.env.LEADSFORGE_API_KEY || "";
}
export function isConfigured(): boolean {
  return !!key();
}

function headers(idem?: string): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: key(),
    "Content-Type": "application/json",
  };
  if (idem) h["Idempotency-Key"] = idem;
  return h;
}

export type LfPerson = {
  externalID: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  linkedinURL?: string;
};

export async function balance(): Promise<number | null> {
  if (!isConfigured()) return null;
  try {
    const r = await fetch(`${BASE}/balance`, { headers: headers() });
    if (!r.ok) return null;
    const j: any = await r.json();
    return Number(j.availableCredits ?? j.available_credits ?? 0);
  } catch {
    return null;
  }
}

export type Channel = "emails" | "phones";

export async function submitJob(
  channel: Channel,
  people: LfPerson[],
  reqId: string,
): Promise<string | null> {
  const r = await fetch(`${BASE}/enrichment/${channel}`, {
    method: "POST",
    headers: headers(`${reqId}:${channel}`),
    body: JSON.stringify({ clientRequestID: reqId, people }),
  });
  if (!r.ok) return null;
  const j: any = await r.json();
  return j.jobID ?? j.jobId ?? null;
}

/** One-shot job-completion check (used by bulk polling). */
export async function jobDone(jobID: string): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/enrichment/jobs/${jobID}`, { headers: headers() });
    if (!r.ok) return false;
    const j: any = await r.json();
    return j.status === "completed";
  } catch {
    return false;
  }
}

/** Merge job results into an externalID -> {email?, phone?} map. */
export function collect(map: Record<string, LfResult>, channel: Channel, items: any[]): void {
  for (const item of items) {
    if (item.status !== "succeeded") continue;
    const id = String(item.externalID ?? "");
    const p = item.payload ?? {};
    map[id] = map[id] || {};
    if (channel === "emails" && p.email) map[id].email = String(p.email);
    if (channel === "phones" && (p.phoneNumber || p.phone))
      map[id].phone = String(p.phoneNumber ?? p.phone);
  }
}

async function awaitJob(jobID: string, budgetMs: number): Promise<boolean> {
  const deadline = performance.now() + budgetMs;
  let delay = 700;
  while (performance.now() < deadline) {
    await new Promise((res) => setTimeout(res, delay));
    try {
      const r = await fetch(`${BASE}/enrichment/jobs/${jobID}`, { headers: headers() });
      if (r.ok) {
        const j: any = await r.json();
        if (j.status === "completed") return true;
      }
    } catch {
      /* keep polling until budget */
    }
    delay = Math.min(delay + 400, 2500);
  }
  return false;
}

export async function jobResults(jobID: string): Promise<any[]> {
  const out: any[] = [];
  let offset = 0;
  for (let page = 0; page < 20; page++) {
    const r = await fetch(`${BASE}/enrichment/jobs/${jobID}/results?limit=100&offset=${offset}`, {
      headers: headers(),
    });
    if (!r.ok) break;
    const j: any = await r.json();
    const items: any[] = j.results ?? j.data ?? [];
    out.push(...items);
    if (items.length < 100) break;
    offset += 100;
  }
  return out;
}

export type LfResult = { email?: string; phone?: string };

/**
 * Enrich people for the requested channels within a time budget. Returns a map
 * of externalID -> { email?, phone? }. Channels run concurrently; each is
 * awaited only up to budgetMs so a single call stays bounded.
 */
export async function enrich(
  people: LfPerson[],
  want: { email?: boolean; phone?: boolean },
  reqId: string,
  budgetMs = 14000,
): Promise<Record<string, LfResult>> {
  const map: Record<string, LfResult> = {};
  if (!isConfigured() || people.length === 0) return map;

  const channels: Channel[] = [];
  if (want.email) channels.push("emails");
  if (want.phone) channels.push("phones");

  await Promise.all(
    channels.map(async (channel) => {
      const jobID = await submitJob(channel, people, reqId);
      if (!jobID) return;
      const done = await awaitJob(jobID, budgetMs);
      if (!done) return; // still running -> treat as a miss for this sync call
      collect(map, channel, await jobResults(jobID));
    }),
  );
  return map;
}
