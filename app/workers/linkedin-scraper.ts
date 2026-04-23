// LinkedIn scraper — two modes:
//   scrapeJobs(userId?, role, location) → JobResult[]
//   scrapePeople(userId, company, titleKeyword) → PersonResult[]
//
// Uses LinkedIn Voyager API (authenticated JSON) when a userId with li_at is
// available, falls back to the public guest jobs API otherwise.
// No browser / Patchright needed — just fetch with the right cookies + headers.

import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { userLinkedinSessions } from "../../auth-schema";

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
  recentActivity?: string;
}

// ── Session helpers ───────────────────────────────────────────────────────────

async function getLinkedInSession(userId: string): Promise<{ liAt: string; userAgent: string } | null> {
  const [row] = await db
    .select({ liAtEncrypted: userLinkedinSessions.liAtEncrypted, userAgent: userLinkedinSessions.userAgent })
    .from(userLinkedinSessions)
    .where(eq(userLinkedinSessions.userId, userId))
    .limit(1);

  if (!row?.liAtEncrypted) return null;

  const { decrypt } = await import("~/lib/encrypt.server");
  const liAt = await decrypt(row.liAtEncrypted).catch(() => null);
  if (!liAt) return null;

  return {
    liAt,
    userAgent: row.userAgent ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };
}

// Headers for Voyager API calls
function voyagerHeaders(liAt: string, userAgent: string): Record<string, string> {
  return {
    "User-Agent": userAgent,
    "Cookie": `li_at=${liAt}; JSESSIONID="ajax:0000000000000000000"`,
    "csrf-token": "ajax:0000000000000000000",
    "x-li-lang": "en_US",
    "x-li-track": JSON.stringify({ clientVersion: "1.13.17148", osName: "web", timezoneOffset: 5.5 }),
    "x-restli-protocol-version": "2.0.0",
    "Accept": "application/vnd.linkedin.normalized+json+2.1",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.linkedin.com/",
  };
}

// Jitter delay to avoid burst rate limiting
const jitter = (min = 800, max = 2000) =>
  new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

// ── Jobs: authenticated Voyager search ───────────────────────────────────────

async function searchJobsVoyager(
  liAt: string,
  userAgent: string,
  role: string,
  location: string,
  start = 0,
): Promise<JobResult[]> {
  const keywords = encodeURIComponent(role);
  const loc = encodeURIComponent(location);

  // Voyager job search endpoint — returns JSON with job cards
  const url = [
    "https://www.linkedin.com/voyager/api/jobs/jobPostings",
    `?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebFullJobPosting-14`,
    `&count=25`,
    `&start=${start}`,
    `&q=search`,
    `&keywords=${keywords}`,
    `&locationFallback=${loc}`,
    `&filters=List(timePostedRange-r604800)`,   // past week
  ].join("");

  const res = await fetch(url, {
    headers: voyagerHeaders(liAt, userAgent),
    signal: AbortSignal.timeout(15_000),
  });

  if (res.status === 429 || res.status === 999) {
    throw new Error(`LINKEDIN_RATE_LIMIT:${res.status}`);
  }
  if (!res.ok) return [];

  const data = await res.json() as any;
  const elements = data?.elements ?? data?.data?.elements ?? [];

  return elements.slice(0, 25).map((el: any) => {
    const jv = el?.jobPostingResolutionResult ?? el;
    const id = jv?.jobPostingId ?? jv?.entityUrn?.split(":").pop() ?? "";
    const company = jv?.companyDetails?.company?.name
      ?? jv?.companyDetails?.companyName
      ?? jv?.formattedLocation ?? "Unknown";
    const title = jv?.title ?? "";
    const loc2 = jv?.formattedLocation ?? location;
    const isEasyApply = !!(jv?.applyMethod?.easyApplyUrl || jv?.applyMethod?.com_linkedin_voyager_jobs_OffsiteApply === undefined);
    const applyUrl = jv?.applyMethod?.easyApplyUrl
      ?? `https://www.linkedin.com/jobs/view/${id}`;

    // Job description is in jv.description.text
    const desc = jv?.description?.text ?? "";

    return {
      jobId: id,
      company: typeof company === "string" ? company : company?.name ?? "Unknown",
      roleTitle: title,
      location: loc2,
      platform: "linkedin" as const,
      applyUrl,
      isEasyApply,
      jobDescription: desc.slice(0, 3000),
      postedAt: jv?.listedAt ? new Date(jv.listedAt).toISOString() : undefined,
    };
  }).filter((j: JobResult) => j.jobId && j.roleTitle);
}

// ── Jobs: public guest API (no auth fallback) ─────────────────────────────────

async function searchJobsPublic(role: string, location: string): Promise<JobResult[]> {
  const keywords = encodeURIComponent(role);
  const loc = encodeURIComponent(location);

  // f_AL=true = Easy Apply only, f_TPR=r604800 = past week
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keywords}&location=${loc}&f_AL=true&f_TPR=r604800&start=0`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return [];
  const html = await res.text();

  const titles: string[] = [];
  const companies: string[] = [];
  const locations: string[] = [];
  const links: string[] = [];
  const jobIds: string[] = [];

  const titleRe = /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/g;
  const companyRe = /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/g;
  const locationRe = /<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
  const linkRe = /href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"?]+)/g;
  const idRe = /data-entity-urn="urn:li:jobPosting:(\d+)"/g;

  let m: RegExpExecArray | null;
  while ((m = titleRe.exec(html)) !== null) titles.push(cleanText(m[1]));
  while ((m = companyRe.exec(html)) !== null) companies.push(cleanText(m[1]));
  while ((m = locationRe.exec(html)) !== null) locations.push(cleanText(m[1]));
  while ((m = linkRe.exec(html)) !== null) links.push(m[1]);
  while ((m = idRe.exec(html)) !== null) jobIds.push(m[1]);

  const count = Math.min(titles.length, companies.length, links.length, 25);
  const results: JobResult[] = [];

  for (let i = 0; i < count; i++) {
    results.push({
      jobId: jobIds[i] ?? links[i]?.split("/").pop()?.split("?")[0] ?? `pub_${i}`,
      company: companies[i] ?? "Unknown",
      roleTitle: titles[i] ?? role,
      location: locations[i] ?? location,
      platform: "linkedin",
      applyUrl: links[i] ?? "",
      isEasyApply: true, // f_AL=true filter means Easy Apply only
      jobDescription: "",
    });
  }

  return results.filter((j) => j.applyUrl);
}

// ── Job detail: fetch full description ───────────────────────────────────────

export async function getJobDescription(userId: string, jobId: string): Promise<string> {
  const session = await getLinkedInSession(userId);
  if (!session) return "";

  await jitter(500, 1200);

  const url = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebFullJobPosting-14`;

  const res = await fetch(url, {
    headers: voyagerHeaders(session.liAt, session.userAgent),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return "";

  const data = await res.json() as any;
  const desc = data?.description?.text ?? data?.data?.description?.text ?? "";
  return desc.slice(0, 5000);
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

  // Try authenticated Voyager API first — returns descriptions inline
  if (userId) {
    const session = await getLinkedInSession(userId);
    if (session) {
      try {
        results = await searchJobsVoyager(session.liAt, session.userAgent, role, location);
        usedAuth = true;
        console.log(`[linkedin] Voyager search: ${results.length} jobs for "${role}" in "${location}"`);
      } catch (err: any) {
        if (err.message?.startsWith("LINKEDIN_RATE_LIMIT")) throw err;
        console.warn(`[linkedin] Voyager failed, falling back to public API: ${err.message}`);
      }
    }
  }

  // Fallback to public API
  if (!usedAuth) {
    results = await searchJobsPublic(role, location);
    console.log(`[linkedin] Public API: ${results.length} jobs for "${role}" in "${location}"`);
  }

  results = results.slice(0, limit);

  // Optionally fetch full descriptions for public API results (no inline desc)
  if (fetchDescriptions && userId && !usedAuth) {
    for (const job of results) {
      if (job.jobId && !job.jobDescription) {
        await jitter(600, 1400);
        job.jobDescription = await getJobDescription(userId, job.jobId).catch(() => "");
      }
    }
  }

  return results;
}

// ── People search (hiring managers) ──────────────────────────────────────────

export async function scrapePeopleAtCompany(
  userId: string,
  companyName: string,
  titleKeyword: string,
  limit = 10,
): Promise<PersonResult[]> {
  const session = await getLinkedInSession(userId);
  if (!session) {
    console.warn("[linkedin] No session for people search");
    return [];
  }

  await jitter(800, 1800);

  // Combined keyword search — LinkedIn people search
  const keywords = encodeURIComponent(`${titleKeyword} ${companyName}`);
  const url = [
    "https://www.linkedin.com/voyager/api/search/blended",
    `?count=${limit}`,
    `&filters=List(resultType-PEOPLE)`,
    `&keywords=${keywords}`,
    `&origin=GLOBAL_SEARCH_HEADER`,
    `&q=all`,
    `&start=0`,
  ].join("");

  const res = await fetch(url, {
    headers: voyagerHeaders(session.liAt, session.userAgent),
    signal: AbortSignal.timeout(15_000),
  });

  if (res.status === 429 || res.status === 999) {
    throw new Error(`LINKEDIN_RATE_LIMIT:${res.status}`);
  }
  if (!res.ok) {
    console.warn(`[linkedin] People search failed: ${res.status}`);
    return [];
  }

  const data = await res.json() as any;

  // Voyager returns results nested inside elements[].elements[]
  const hits: any[] = [];
  for (const cluster of data?.elements ?? []) {
    for (const el of cluster?.elements ?? []) {
      hits.push(el);
    }
  }

  console.log(`[linkedin] People search: ${hits.length} results for "${titleKeyword}" at "${companyName}"`);

  const results: PersonResult[] = [];

  for (const hit of hits.slice(0, limit)) {
    const profile = hit?.targetUrn
      ? await getPersonProfile(session.liAt, session.userAgent, hit.targetUrn).catch(() => null)
      : null;

    const name = hit?.title?.text ?? profile?.name ?? "";
    const headline = hit?.primarySubtitle?.text ?? profile?.headline ?? "";
    const loc = hit?.secondarySubtitle?.text ?? profile?.location ?? "";
    const publicId = hit?.navigationUrl?.split("/in/")?.[1]?.split("?")?.[0] ?? "";
    const profileUrl = publicId ? `https://www.linkedin.com/in/${publicId}` : "";

    if (!name || !profileUrl) continue;

    // Infer company from headline (e.g. "Engineering Manager at Stripe")
    const companyFromHeadline = headline.includes(" at ")
      ? headline.split(" at ").pop()?.split(" |")?.[0]?.trim() ?? companyName
      : companyName;

    results.push({
      profileUrl,
      name,
      headline,
      company: companyFromHeadline,
      location: loc,
      publicIdentifier: publicId,
    });

    await jitter(300, 700);
  }

  return results;
}

// Mini profile fetch — used to enrich people search results
async function getPersonProfile(
  liAt: string,
  userAgent: string,
  profileUrn: string,
): Promise<{ name: string; headline: string; location: string } | null> {
  const publicId = profileUrn.split(":").pop();
  if (!publicId) return null;

  const url = `https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${publicId}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-93`;

  const res = await fetch(url, {
    headers: voyagerHeaders(liAt, userAgent),
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) return null;

  const data = await res.json() as any;
  const profile = data?.elements?.[0];
  if (!profile) return null;

  return {
    name: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim(),
    headline: profile.headline ?? "",
    location: profile.locationName ?? "",
  };
}

// ── LinkedIn people search by keyword (no company filter) ────────────────────
// Used by outreach campaigns targeting title keywords across companies

export async function scrapePeopleByKeyword(
  userId: string,
  keyword: string,
  limit = 20,
): Promise<PersonResult[]> {
  const session = await getLinkedInSession(userId);
  if (!session) return [];

  await jitter(800, 1800);

  const kw = encodeURIComponent(keyword);
  const url = [
    "https://www.linkedin.com/voyager/api/search/blended",
    `?count=${limit}`,
    `&filters=List(resultType-PEOPLE,network-F|S)`, // 1st + 2nd degree only
    `&keywords=${kw}`,
    `&origin=GLOBAL_SEARCH_HEADER`,
    `&q=all`,
    `&start=0`,
  ].join("");

  const res = await fetch(url, {
    headers: voyagerHeaders(session.liAt, session.userAgent),
    signal: AbortSignal.timeout(15_000),
  });

  if (res.status === 429 || res.status === 999) {
    throw new Error(`LINKEDIN_RATE_LIMIT:${res.status}`);
  }
  if (!res.ok) return [];

  const data = await res.json() as any;

  const hits: any[] = [];
  for (const cluster of data?.elements ?? []) {
    for (const el of cluster?.elements ?? []) hits.push(el);
  }

  return hits.slice(0, limit).map((hit: any) => {
    const publicId = hit?.navigationUrl?.split("/in/")?.[1]?.split("?")?.[0] ?? "";
    return {
      profileUrl: publicId ? `https://www.linkedin.com/in/${publicId}` : "",
      name: hit?.title?.text ?? "",
      headline: hit?.primarySubtitle?.text ?? "",
      company: hit?.primarySubtitle?.text?.split(" at ")?.[1]?.split(" |")?.[0] ?? "",
      location: hit?.secondarySubtitle?.text ?? "",
      publicIdentifier: publicId,
    };
  }).filter((p: PersonResult) => p.name && p.profileUrl);
}

// ── Check inbox for new replies ───────────────────────────────────────────────
// Used by outreach-worker to detect when a contact has replied to a message

export async function checkInboxForReplies(
  userId: string,
  contactProfileUrls: string[],
): Promise<Set<string>> {
  const session = await getLinkedInSession(userId);
  if (!session) return new Set();

  const url = "https://www.linkedin.com/voyager/api/messaging/conversations?keyVersion=LEGACY_INBOX&q=conversations&start=0&count=20";

  const res = await fetch(url, {
    headers: voyagerHeaders(session.liAt, session.userAgent),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return new Set();

  const data = await res.json() as any;
  const conversations: any[] = data?.elements ?? [];

  const repliedUrls = new Set<string>();

  for (const conv of conversations) {
    // Check if conversation has unread messages from the other party
    const lastActivity = conv?.lastActivityAt;
    const unreadCount = conv?.unreadCount ?? 0;

    if (unreadCount === 0) continue;

    // Get participant profile URLs
    const participants: string[] = conv?.participants?.map((p: any) =>
      p?.com_linkedin_voyager_messaging_MessagingMember?.miniProfile?.publicIdentifier ?? ""
    ).filter(Boolean) ?? [];

    for (const pid of participants) {
      const profileUrl = `https://www.linkedin.com/in/${pid}`;
      if (contactProfileUrls.includes(profileUrl)) {
        repliedUrls.add(profileUrl);
      }
    }
  }

  return repliedUrls;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
