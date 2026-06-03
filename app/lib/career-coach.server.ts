/**
 * Server-only helper to fetch a student's Career Coach summary by email.
 *
 * The coach backend is reachable on the same origin via the ingress rewrite
 * `/api/v1/cc/(.*)` -> the cc-backend service. We call it server-to-server with
 * the shared `x-studojo-internal` secret so the secret never reaches the browser.
 *
 * Pass the incoming request's origin so this works on both studojo.com and
 * studojo.pro without any hardcoded host.
 */
export type CareerSummary = {
  found: boolean;
  has_analysis?: boolean;
  chat_url?: string;
  name?: string | null;
  readiness_score?: number;
  level?: number;
  level_label?: string;
  target_role?: string | null;
  target_industry?: string | null;
  next_action?: string | null;
  cta_tool?: string | null;
  reply_probability?: number | null;
  resume_maker_ready?: boolean;
  score_history?: { date?: string; score?: number }[];
};

export async function getCareerSummary(
  email: string,
  origin: string,
): Promise<CareerSummary | null> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!email || !secret) return null;
  try {
    const url = `${origin.replace(/\/$/, "")}/api/v1/cc/public/career-summary?email=${encodeURIComponent(email)}`;
    const resp = await fetch(url, {
      headers: { "x-studojo-internal": secret },
      signal: AbortSignal.timeout(6000),
    });
    if (!resp.ok) return null;
    return (await resp.json()) as CareerSummary;
  } catch {
    // Coach summary is supplementary — never block the page on it.
    return null;
  }
}
