// LinkedIn scraper — Voyager API (authenticated JSON) + public API fallback
//
// Ban prevention layers:
//   1. Residential proxy via Bright Data (routes through real home IPs)
//   2. Real CSRF token extracted from stored session cookies
//   3. Full cookie jar (li_at + JSESSIONID + bcookie + lidc)
//   4. Matching User-Agent from the session that created li_at
//   5. Jitter delays between requests
//   6. Rate-limit detection — throws LINKEDIN_RATE_LIMIT on 429/999

import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { userLinkedinSessions } from "../../auth-schema";
import { buildProxy } from "~/lib/proxy.server";

// ── Public types ──────────────────────────────────────────────────────────────

export interface JobResult {
  jobId: string;
  company: string;
  roleTitle: string;
  location: string;
  platform: "linkedin";
  applyUrl: string;
  isEasyApply: boolean;
  jobDescription: string;
  postedAt?: string;
}

export interface PersonResult {
  profileUrl: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  publicIdentifier: string;
}

// ── Session helpers ───────────────────────────────────────────────────────────

interface LinkedInSession {
  liAt: string;
  jsessionId: string;   // real CSRF token from session
  cookieJar: string;    // full cookie string to send
  userAgent: string;
  proxyCountry: string;
  proxyCity: string;
  userId: string;
  hasRealCsrf: boolean; // false = fallback JSESSIONID — Voyager will 400
}

async function getLinkedInSession(userId: string): Promise<LinkedInSession | null> {
  const [row] = await db
    .select({
      liAtEncrypted: userLinkedinSessions.liAtEncrypted,
      cookiesEncrypted: (userLinkedinSessions as any).cookiesEncrypted,
      userAgent: userLinkedinSessions.userAgent,
      proxyCountry: userLinkedinSessions.proxyCountry,
      proxyCity: userLinkedinSessions.proxyCity,
    })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, userId))
    .limit(1);

  if (!row?.liAtEncrypted) return null;

  const { decrypt } = await import("~/lib/encrypt.server");
  const liAt = await decrypt(row.liAtEncrypted).catch(() => null);
  if (!liAt) return null;

  // Decrypt full cookie jar if captured, otherwise reconstruct minimal set
  let fullCookies = "";
  if (row.cookiesEncrypted) {
    fullCookies = await decrypt(row.cookiesEncrypted).catch(() => "");
  }

  // Extract real JSESSIONID from the cookie jar if available
  // JSESSIONID value IS the CSRF token — format: "ajax:XXXXXXXXXXXXXXXXXX"
  const jsessionMatch = fullCookies.match(/JSESSIONID="?(ajax:[^";,\s]+)"?/i);
  const hasRealCsrf = !!jsessionMatch;
  const jsessionId = jsessionMatch?.[1] ?? generateFallbackJsessionId();

  // Build a clean cookie string — include all known LinkedIn session cookies
  const cookieJar = fullCookies
    ? normalizeCookieJar(fullCookies, liAt, jsessionId)
    : buildMinimalCookieJar(liAt, jsessionId);

  const ua = row.userAgent
    ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  return {
    liAt,
    jsessionId,
    cookieJar,
    userAgent: ua,
    proxyCountry: row.proxyCountry ?? "IN",
    proxyCity: row.proxyCity ?? "bangalore",
    userId,
    hasRealCsrf,
  };
}

// Build the minimal viable cookie set when we only have li_at
function buildMinimalCookieJar(liAt: string, jsessionId: string): string {
  // These are the cookies LinkedIn checks most strictly
  return [
    `li_at=${liAt}`,
    `JSESSIONID="${jsessionId}"`,
    `bcookie="v=2&${crypto.randomUUID()}"`,   // browser fingerprint — random but present
    `bscookie="v=1&${Date.now().toString(36)}"`,
    `li_gc=MTsxOzE3MDA0NTYwMDA7MjsM`,        // consent cookie (static value is fine)
  ].join("; ");
}

// Preserve all cookies from a captured full cookie jar, ensuring key ones are present
function normalizeCookieJar(raw: string, liAt: string, jsessionId: string): string {
  const cookies = new Map<string, string>();

  // Parse raw cookie string
  for (const part of raw.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    cookies.set(name, val);
  }

  // Always override with freshly decrypted li_at
  cookies.set("li_at", liAt);
  if (!cookies.has("JSESSIONID")) cookies.set("JSESSIONID", `"${jsessionId}"`);

  return Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}

// Fallback JSESSIONID that at least looks valid (won't pass deep validation
// but works for light scraping before LinkedIn verifies the session)
function generateFallbackJsessionId(): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map((b) => b.toString(10).padStart(3, "0"))
    .join("")
    .slice(0, 19);
  return `ajax:${rand}`;
}

// ── Voyager headers ───────────────────────────────────────────────────────────

function voyagerHeaders(session: LinkedInSession): Record<string, string> {
  return {
    "User-Agent": session.userAgent,
    "Cookie": session.cookieJar,
    "csrf-token": session.jsessionId,           // must match JSESSIONID cookie
    "x-li-lang": "en_US",
    "x-li-track": JSON.stringify({
      clientVersion: "1.13.17148",
      mpVersion: "1.13.17148",
      osName: "web",
      timezoneOffset: 5.5,
      timezone: "Asia/Kolkata",
      appInstance: crypto.randomUUID().slice(0, 8),
    }),
    "x-restli-protocol-version": "2.0.0",
    "x-li-page-instance": `urn:li:page:d_flagship3_search_srp_jobs;${crypto.randomUUID()}`,
    "Accept": "application/vnd.linkedin.normalized+json+2.1",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.linkedin.com/jobs/search/",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
  };
}

// ── Direct fetch for Voyager API calls ───────────────────────────────────────
// Voyager calls are authenticated with li_at + CSRF — LinkedIn already knows
// who's calling, so datacenter IP adds no meaningful detection risk for reads.
// Residential proxy is critical for BROWSER automation (Patchright) but
// Bun's fetch() proxy auth (407) doesn't reliably work with Decodo.

async function proxyFetch(
  url: string,
  options: RequestInit,
  _session: LinkedInSession,
): Promise<Response> {
  return fetch(url, options);
}

// Jitter delay — human-like gaps between requests
const jitter = (min = 800, max = 2500) =>
  new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)));

// ── Jobs: authenticated Voyager search ───────────────────────────────────────

async function searchJobsVoyager(
  session: LinkedInSession,
  role: string,
  location: string,
  start = 0,
): Promise<JobResult[]> {
  const url = [
    "https://www.linkedin.com/voyager/api/jobs/jobPostings",
    `?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebFullJobPosting-14`,
    `&count=25`,
    `&start=${start}`,
    `&q=search`,
    `&keywords=${encodeURIComponent(role)}`,
    `&locationFallback=${encodeURIComponent(location)}`,
    `&filters=List(timePostedRange-r604800)`,   // no easyApply-only — too restrictive for India
  ].join("");

  const res = await proxyFetch(url, {
    headers: voyagerHeaders(session),
    signal: AbortSignal.timeout(20_000),
  }, session);

  if (res.status === 429 || res.status === 999) throw new Error(`LINKEDIN_RATE_LIMIT:${res.status}`);
  if (!res.ok) {
    const snippet = await res.text().catch(() => "").then((t) => t.slice(0, 200));
    console.warn(`[linkedin] Voyager non-ok status=${res.status} for "${role}" / "${location}" body="${snippet}"`);
    // Throw so caller falls back to public API (usedAuth stays false)
    throw new Error(`LINKEDIN_VOYAGER_ERROR:${res.status}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    // LinkedIn returned non-JSON (e.g. redirect to login page) — session likely expired
    console.warn(`[linkedin] Voyager returned non-JSON for "${role}" / "${location}" — li_at may be expired`);
    throw new Error("LINKEDIN_AUTH_FAILED:session_expired");
  }

  const elements: any[] = data?.elements ?? data?.data?.elements ?? [];
  // Log first element structure so we can see what LinkedIn actually returns
  if (elements.length > 0) {
    const firstEl = elements[0];
    const firstJv = firstEl?.jobPostingResolutionResult ?? firstEl;
    console.log(`[linkedin] Voyager first element keys: ${Object.keys(firstEl ?? {}).join(", ")}`);
    console.log(`[linkedin] Voyager first jv keys: ${Object.keys(firstJv ?? {}).join(", ")}`);
    console.log(`[linkedin] Voyager first jv title=${firstJv?.title} id=${firstJv?.jobPostingId}`);
  } else {
    const topKeys = Object.keys(data ?? {}).join(", ");
    console.warn(`[linkedin] Voyager empty elements. Response keys: ${topKeys}`);
  }

  return elements.slice(0, 25).flatMap((el: any) => {
    const jv = el?.jobPostingResolutionResult ?? el;
    const id = String(jv?.jobPostingId ?? jv?.entityUrn?.split(":").pop() ?? "");
    const title = jv?.title ?? "";
    if (!id || !title) return [];

    const companyRaw = jv?.companyDetails?.company?.name
      ?? jv?.companyDetails?.companyName
      ?? "Unknown";
    const company = typeof companyRaw === "string" ? companyRaw : (companyRaw as any)?.name ?? "Unknown";
    const loc = jv?.formattedLocation ?? location;
    const isEasyApply = !!(jv?.applyMethod?.easyApplyUrl);
    const applyUrl = jv?.applyMethod?.easyApplyUrl ?? `https://www.linkedin.com/jobs/view/${id}`;
    const desc = (jv?.description?.text ?? "").slice(0, 3000);

    return [{
      jobId: id,
      company,
      roleTitle: title,
      location: loc,
      platform: "linkedin" as const,
      applyUrl,
      isEasyApply,
      jobDescription: desc,
      postedAt: jv?.listedAt ? new Date(jv.listedAt).toISOString() : undefined,
    }];
  });
}

// ── Jobs: public guest API (no auth fallback) ─────────────────────────────────

async function searchJobsPublic(
  role: string,
  location: string,
  _userId?: string,
): Promise<JobResult[]> {
  const url = [
    "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search",
    `?keywords=${encodeURIComponent(role)}`,
    `&location=${encodeURIComponent(location)}`,
    `&f_TPR=r604800`,   // past week (no Easy Apply filter — too restrictive for India)
    `&start=0`,
  ].join("");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const snippet = await res.text().catch(() => "").then((t) => t.slice(0, 200));
    console.warn(`[linkedin] Public API status=${res.status} for "${role}" / "${location}" snippet="${snippet}"`);
    return [];
  }
  const html = await res.text();
  console.log(`[linkedin] Public API status=200 html_len=${html.length} for "${role}" / "${location}"`);

  const titles: string[] = [];
  const companies: string[] = [];
  const locations: string[] = [];
  const links: string[] = [];
  const ids: string[] = [];

  let m: RegExpExecArray | null;
  const titleRe  = /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/g;
  const compRe   = /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/g;
  const locRe    = /<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
  const linkRe   = /href="(https:\/\/[a-z.-]*linkedin\.com\/jobs\/view\/[^"?&]+)/g;
  const idRe     = /data-entity-urn="urn:li:jobPosting:(\d+)"/g;

  while ((m = titleRe.exec(html))  !== null) titles.push(cleanText(m[1]));
  while ((m = compRe.exec(html))   !== null) companies.push(cleanText(m[1]));
  while ((m = locRe.exec(html))    !== null) locations.push(cleanText(m[1]));
  while ((m = linkRe.exec(html))   !== null) links.push(m[1]);
  while ((m = idRe.exec(html))     !== null) ids.push(m[1]);

  const count = Math.min(titles.length, companies.length, links.length, 25);
  const results: JobResult[] = [];
  for (let i = 0; i < count; i++) {
    results.push({
      jobId: ids[i] ?? links[i].split("/").pop()?.split("?")[0] ?? `pub_${i}`,
      company: companies[i] ?? "Unknown",
      roleTitle: titles[i] ?? role,
      location: locations[i] ?? location,
      platform: "linkedin",
      applyUrl: links[i],
      isEasyApply: true,
      jobDescription: "",
    });
  }
  return results;
}

// ── Job detail: fetch full description ────────────────────────────────────────

export async function getJobDescription(userId: string, jobId: string): Promise<string> {
  const session = await getLinkedInSession(userId);
  if (!session) return "";
  await jitter(500, 1200);

  const url = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebFullJobPosting-14`;
  const res = await proxyFetch(url, {
    headers: voyagerHeaders(session),
    signal: AbortSignal.timeout(10_000),
  }, session);

  if (!res.ok) return "";
  const data = await res.json() as any;
  return (data?.description?.text ?? data?.data?.description?.text ?? "").slice(0, 5000);
}

// ── Main job scraping entry point ─────────────────────────────────────────────

export async function scrapeLinkedInJobs(
  userId: string | null,
  role: string,
  location: string,
  options: { fetchDescriptions?: boolean; limit?: number } = {},
): Promise<JobResult[]> {
  const { fetchDescriptions = false, limit = 25 } = options;
  let results: JobResult[] = [];
  let usedAuth = false;

  if (userId) {
    const session = await getLinkedInSession(userId);
    if (session?.hasRealCsrf) {
      try {
        results = await searchJobsVoyager(session, role, location);
        usedAuth = true;
        console.log(`[linkedin] Voyager: ${results.length} jobs for "${role}" / "${location}"`);
      } catch (err: any) {
        console.warn(`[linkedin] Voyager error (${err.message}) — falling back to public API`);
        if (err.message?.startsWith("LINKEDIN_RATE_LIMIT") || err.message?.startsWith("LINKEDIN_AUTH_FAILED")) throw err;
      }
    } else if (session && !session.hasRealCsrf) {
      console.log(`[linkedin] No real JSESSIONID for ${userId} — using public API`);
    }
  }

  if (!usedAuth) {
    results = await searchJobsPublic(role, location, userId ?? undefined);
    console.log(`[linkedin] Public API: ${results.length} jobs for "${role}" / "${location}"`);
  }

  results = results.slice(0, limit);

  // Optionally fetch full descriptions for public API results (no inline desc)
  if (fetchDescriptions && userId && !usedAuth) {
    for (const job of results) {
      if (job.jobId && !job.jobDescription) {
        await jitter(600, 1500);
        job.jobDescription = await getJobDescription(userId, job.jobId).catch(() => "");
      }
    }
  }

  return results;
}

// ── People search (hiring managers for outreach) ──────────────────────────────

export async function scrapePeopleAtCompany(
  userId: string,
  companyName: string,
  titleKeyword: string,
  limit = 10,
): Promise<PersonResult[]> {
  const session = await getLinkedInSession(userId);
  if (!session) return [];
  await jitter(800, 1800);

  const keywords = encodeURIComponent(`${titleKeyword} ${companyName}`);
  const url = [
    "https://www.linkedin.com/voyager/api/search/blended",
    `?count=${limit}`,
    `&filters=List(resultType-PEOPLE,network-F|S)`,   // 2nd-degree+ only
    `&keywords=${keywords}`,
    `&origin=GLOBAL_SEARCH_HEADER`,
    `&q=all`,
    `&start=0`,
  ].join("");

  const res = await proxyFetch(url, {
    headers: voyagerHeaders(session),
    signal: AbortSignal.timeout(15_000),
  }, session);

  if (res.status === 429 || res.status === 999) throw new Error(`LINKEDIN_RATE_LIMIT:${res.status}`);
  if (!res.ok) return [];

  const data = await res.json() as any;
  const hits: any[] = [];
  for (const cluster of data?.elements ?? []) {
    for (const el of cluster?.elements ?? []) hits.push(el);
  }

  console.log(`[linkedin] People search: ${hits.length} hits for "${titleKeyword}" at "${companyName}"`);

  return hits.slice(0, limit).flatMap((hit: any) => {
    const publicId = hit?.navigationUrl?.split("/in/")?.[1]?.split("?")?.[0] ?? "";
    const name = hit?.title?.text ?? "";
    if (!name || !publicId) return [];

    const headline = hit?.primarySubtitle?.text ?? "";
    const loc = hit?.secondarySubtitle?.text ?? "";
    const companyFromHeadline = headline.includes(" at ")
      ? headline.split(" at ").pop()?.split(" |")?.[0]?.trim() ?? companyName
      : companyName;

    return [{
      profileUrl: `https://www.linkedin.com/in/${publicId}`,
      name,
      headline,
      company: companyFromHeadline,
      location: loc,
      publicIdentifier: publicId,
    }];
  });
}

// ── People search by keyword only ─────────────────────────────────────────────

export async function scrapePeopleByKeyword(
  userId: string,
  keyword: string,
  limit = 20,
): Promise<PersonResult[]> {
  const session = await getLinkedInSession(userId);
  if (!session) return [];
  await jitter(800, 1800);

  const url = [
    "https://www.linkedin.com/voyager/api/search/blended",
    `?count=${limit}`,
    `&filters=List(resultType-PEOPLE,network-F|S)`,
    `&keywords=${encodeURIComponent(keyword)}`,
    `&origin=GLOBAL_SEARCH_HEADER`,
    `&q=all`,
    `&start=0`,
  ].join("");

  const res = await proxyFetch(url, {
    headers: voyagerHeaders(session),
    signal: AbortSignal.timeout(15_000),
  }, session);

  if (res.status === 429 || res.status === 999) throw new Error(`LINKEDIN_RATE_LIMIT:${res.status}`);
  if (!res.ok) return [];

  const data = await res.json() as any;
  const hits: any[] = [];
  for (const cluster of data?.elements ?? []) {
    for (const el of cluster?.elements ?? []) hits.push(el);
  }

  return hits.slice(0, limit).flatMap((hit: any) => {
    const publicId = hit?.navigationUrl?.split("/in/")?.[1]?.split("?")?.[0] ?? "";
    const name = hit?.title?.text ?? "";
    if (!name || !publicId) return [];
    return [{
      profileUrl: `https://www.linkedin.com/in/${publicId}`,
      name,
      headline: hit?.primarySubtitle?.text ?? "",
      company: (hit?.primarySubtitle?.text ?? "").split(" at ")?.[1]?.split(" |")?.[0] ?? "",
      location: hit?.secondarySubtitle?.text ?? "",
      publicIdentifier: publicId,
    }];
  });
}

// ── Check inbox for replies ───────────────────────────────────────────────────

export async function checkInboxForReplies(
  userId: string,
  contactProfileUrls: string[],
): Promise<Set<string>> {
  const session = await getLinkedInSession(userId);
  if (!session) return new Set();

  const url = "https://www.linkedin.com/voyager/api/messaging/conversations?keyVersion=LEGACY_INBOX&q=conversations&start=0&count=20";
  const res = await proxyFetch(url, {
    headers: voyagerHeaders(session),
    signal: AbortSignal.timeout(10_000),
  }, session);

  if (!res.ok) return new Set();
  const data = await res.json() as any;

  const repliedUrls = new Set<string>();
  for (const conv of data?.elements ?? []) {
    if (!conv?.unreadCount) continue;
    for (const p of conv?.participants ?? []) {
      const pid = p?.com_linkedin_voyager_messaging_MessagingMember?.miniProfile?.publicIdentifier ?? "";
      const url2 = `https://www.linkedin.com/in/${pid}`;
      if (pid && contactProfileUrls.includes(url2)) repliedUrls.add(url2);
    }
  }
  return repliedUrls;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
