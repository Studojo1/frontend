// Job discovery worker — fetches matching jobs from multiple sources
// Called every 6h per active user via BullMQ scheduler

import { eq, and, sql } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyConfigs, userLinkedinSessions, jobQueue } from "../../auth-schema";
import { prescreenJob } from "./prescreen";

const JSEARCH_KEY = process.env.JSEARCH_RAPIDAPI_KEY ?? "";

// ── Main discovery entry point ────────────────────────────────────────────────

export async function discoverJobsForUser(userId: string) {
  const [config] = await db
    .select()
    .from(autoapplyConfigs)
    .where(and(eq(autoapplyConfigs.userId, userId), eq(autoapplyConfigs.status, "active")))
    .limit(1);

  if (!config) return;

  const roles = config.roles as string[];
  const locations = config.locations as string[];
  const platforms = config.platforms as string[];

  console.log(`[discovery] User ${userId}: roles=${roles.join(",")}, locations=${locations.join(",")}`);

  const discovered: JobListing[] = [];

  // Run all sources in parallel
  const promises: Promise<JobListing[]>[] = [];

  for (const role of roles.slice(0, 3)) {
    for (const location of locations.slice(0, 3)) {
      if (platforms.includes("linkedin")) {
        promises.push(fetchLinkedInJobs(role, location).catch(() => []));
      }
      if (JSEARCH_KEY) {
        promises.push(fetchJSearchJobs(role, location).catch(() => []));
      }
      if (platforms.includes("internshala") && location.toLowerCase().includes("india")) {
        promises.push(fetchInternshalaJobs(role).catch(() => []));
      }
      if (platforms.includes("naukri") && location.toLowerCase().includes("india")) {
        promises.push(fetchNaukriJobs(role).catch(() => []));
      }
    }
  }

  const results = await Promise.all(promises);
  for (const batch of results) discovered.push(...batch);

  // Deduplicate by applyUrl
  const seen = new Set<string>();
  const unique = discovered.filter((j) => {
    if (seen.has(j.applyUrl)) return false;
    seen.add(j.applyUrl);
    return true;
  });

  // Check which URLs are already queued to avoid re-queuing
  const existingRows = await db
    .select({ applyUrl: jobQueue.applyUrl })
    .from(jobQueue)
    .where(eq(jobQueue.userId, userId));
  const existingUrls = new Set(existingRows.map((r) => r.applyUrl));

  const fresh = unique.filter((j) => !existingUrls.has(j.applyUrl));

  if (fresh.length === 0) {
    console.log(`[discovery] User ${userId}: no new jobs`);
    return;
  }

  // Score each job against CV + prescreen
  const cvText = config.cvText;
  let queued = 0;

  for (const job of fresh.slice(0, 30)) {
    const score = await scoreJob(job, roles, cvText);
    if (score < 60) continue;

    const prescreenedAnswers = await prescreenJob(cvText, job.jobDescription ?? "").catch(() => ({}));

    await db.insert(jobQueue).values({
      userId,
      company: job.company,
      roleTitle: job.roleTitle,
      location: job.location ?? "",
      platform: job.platform,
      applyUrl: job.applyUrl,
      jobDescription: job.jobDescription ?? "",
      matchScore: score,
      prescreenedAnswers,
      status: "pending",
    });
    queued++;
  }

  console.log(`[discovery] User ${userId}: queued ${queued} new jobs (${fresh.length} candidates, ${unique.length} unique)`);
}

// ── LinkedIn public jobs API ──────────────────────────────────────────────────

async function fetchLinkedInJobs(role: string, location: string): Promise<JobListing[]> {
  const keywords = encodeURIComponent(role);
  const loc = encodeURIComponent(location);
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keywords}&location=${loc}&f_TPR=r604800&start=0`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return [];
  const html = await res.text();

  // Parse job cards from HTML
  const jobs: JobListing[] = [];
  const cardPattern = /<div class="base-card[^"]*"[^>]*data-entity-urn="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;

  // Simpler approach: parse JSON-LD or use regex to extract job info
  const titlePattern = /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/g;
  const companyPattern = /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/g;
  const locationPattern = /<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
  const linkPattern = /href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"?]+)/g;

  const titles: string[] = [];
  const companies: string[] = [];
  const locations: string[] = [];
  const links: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = titlePattern.exec(html)) !== null) titles.push(stripHtml(m[1]));
  while ((m = companyPattern.exec(html)) !== null) companies.push(stripHtml(m[1]));
  while ((m = locationPattern.exec(html)) !== null) locations.push(stripHtml(m[1]));
  while ((m = linkPattern.exec(html)) !== null) links.push(m[1]);

  const count = Math.min(titles.length, companies.length, links.length, 25);
  for (let i = 0; i < count; i++) {
    jobs.push({
      company: companies[i] ?? "Unknown",
      roleTitle: titles[i] ?? role,
      location: locations[i] ?? location,
      platform: "linkedin",
      applyUrl: links[i] ?? "",
      jobDescription: "",
    });
  }

  return jobs.filter((j) => j.applyUrl);
}

// ── JSearch (RapidAPI Google Jobs aggregator) ─────────────────────────────────

async function fetchJSearchJobs(role: string, location: string): Promise<JobListing[]> {
  const query = encodeURIComponent(`${role} in ${location}`);
  const url = `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=1&date_posted=week`;

  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": JSEARCH_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return [];
  const data = (await res.json()) as any;

  return (data.data ?? []).slice(0, 20).map((j: any) => ({
    company: j.employer_name ?? "Unknown",
    roleTitle: j.job_title ?? role,
    location: `${j.job_city ?? ""} ${j.job_country ?? ""}`.trim(),
    platform: "indeed",
    applyUrl: j.job_apply_link ?? j.job_google_link ?? "",
    jobDescription: j.job_description?.slice(0, 2000) ?? "",
  })).filter((j: JobListing) => j.applyUrl);
}

// ── Internshala scraper ───────────────────────────────────────────────────────

async function fetchInternshalaJobs(role: string): Promise<JobListing[]> {
  const keyword = role.toLowerCase().replace(/\s+/g, "-");
  const url = `https://internshala.com/internships/${keyword}-internship/`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return [];
  const html = await res.text();
  const jobs: JobListing[] = [];

  // Extract internship cards
  const cardPattern = /data-internship_id="(\d+)"[\s\S]*?<h3[^>]*class="heading_4_5[^"]*"[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<h4[^>]*class="company-name[^"]*"[^>]*>([\s\S]*?)<\/h4>/g;
  let m: RegExpExecArray | null;

  while ((m = cardPattern.exec(html)) !== null) {
    const id = m[1];
    const title = stripHtml(m[2]);
    const company = stripHtml(m[3]);
    if (id && title) {
      jobs.push({
        company,
        roleTitle: title,
        location: "India",
        platform: "internshala",
        applyUrl: `https://internshala.com/internship/detail/${id}`,
        jobDescription: "",
      });
    }
    if (jobs.length >= 15) break;
  }

  return jobs;
}

// ── Naukri scraper ────────────────────────────────────────────────────────────

async function fetchNaukriJobs(role: string): Promise<JobListing[]> {
  const keyword = encodeURIComponent(role);
  const url = `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_keyword&searchType=adv&keyword=${keyword}&jobAge=7&src=jobsearchDesk`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "appid": "109",
      "systemid": "109",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return [];

  const data = (await res.json()) as any;
  const results = data?.jobDetails ?? [];

  return results.slice(0, 20).map((j: any) => ({
    company: j.companyName ?? "Unknown",
    roleTitle: j.title ?? role,
    location: (j.placeholders?.find((p: any) => p.type === "location")?.label ?? "India"),
    platform: "naukri",
    applyUrl: j.jobUrl ?? `https://www.naukri.com/job-listings-${j.jobId}`,
    jobDescription: j.jobDescription?.slice(0, 2000) ?? "",
  })).filter((j: JobListing) => j.applyUrl);
}

// ── AI match scoring ──────────────────────────────────────────────────────────

async function scoreJob(job: JobListing, targetRoles: string[], cvText: string): Promise<number> {
  // Fast heuristic — no API call needed for basic scoring
  let score = 50;

  const title = job.roleTitle.toLowerCase();
  for (const role of targetRoles) {
    const roleWords = role.toLowerCase().split(/\s+/);
    const matches = roleWords.filter((w) => title.includes(w)).length;
    if (matches > 0) score += matches * 15;
  }

  // Penalize very short descriptions
  if (job.jobDescription && job.jobDescription.length < 200) score -= 10;

  // Boost for Easy Apply keywords in job description
  if (job.platform === "linkedin") score += 10;

  return Math.min(100, Math.max(0, score));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export interface JobListing {
  company: string;
  roleTitle: string;
  location?: string;
  platform: string;
  applyUrl: string;
  jobDescription?: string;
}
