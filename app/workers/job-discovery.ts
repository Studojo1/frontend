// Job discovery worker — fetches matching jobs from multiple sources
// Called every 6h per active user via BullMQ scheduler

import { eq, and } from "drizzle-orm";
import db from "~/lib/db";
import { autoapplyConfigs, userLinkedinSessions, jobQueue } from "../../auth-schema";
import { prescreenJob } from "./prescreen";
import { scrapeLinkedInJobs, type JobResult } from "./linkedin-scraper";

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
  const platforms = (config.platforms as string[]) ?? ["linkedin"];

  console.log(`[discovery] User ${userId}: roles=${roles.join(",")}, locations=${locations.join(",")}`);

  const discovered: JobResult[] = [];

  // Run all sources in parallel, one per role × location combination
  const promises: Promise<JobResult[]>[] = [];

  for (const role of roles.slice(0, 3)) {
    for (const location of locations.slice(0, 3)) {
      if (platforms.includes("linkedin")) {
        // Authenticated Voyager search (returns descriptions inline) with public fallback
        promises.push(
          scrapeLinkedInJobs(userId, role, location, { fetchDescriptions: false })
            .catch(() => [])
        );
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

  const batches = await Promise.all(promises);
  for (const batch of batches) {
    for (const j of batch) {
      // Normalise to internal JobResult shape
      discovered.push(j);
    }
  }

  // Deduplicate by applyUrl
  const seen = new Set<string>();
  const unique = discovered.filter((j) => {
    if (!j.applyUrl || seen.has(j.applyUrl)) return false;
    seen.add(j.applyUrl);
    return true;
  });

  // Skip URLs already in the queue
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

  const cvText = (config as any).cvText ?? "";
  let queued = 0;

  for (const job of fresh.slice(0, 30)) {
    const score = scoreJob(job, roles);
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

  console.log(`[discovery] User ${userId}: queued ${queued} new jobs (${fresh.length} fresh, ${unique.length} unique)`);
}

// ── JSearch (RapidAPI Google Jobs aggregator) ─────────────────────────────────

async function fetchJSearchJobs(role: string, location: string): Promise<JobResult[]> {
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
    jobId: j.job_id ?? "",
    company: j.employer_name ?? "Unknown",
    roleTitle: j.job_title ?? role,
    location: `${j.job_city ?? ""} ${j.job_country ?? ""}`.trim(),
    platform: "indeed" as const,
    applyUrl: j.job_apply_link ?? j.job_google_link ?? "",
    isEasyApply: false,
    jobDescription: j.job_description?.slice(0, 3000) ?? "",
  })).filter((j: JobResult) => j.applyUrl);
}

// ── Internshala scraper ───────────────────────────────────────────────────────

async function fetchInternshalaJobs(role: string): Promise<JobResult[]> {
  const keyword = role.toLowerCase().replace(/\s+/g, "-");
  const url = `https://internshala.com/internships/${keyword}-internship/`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return [];
  const html = await res.text();
  const jobs: JobResult[] = [];

  const cardRe = /data-internship_id="(\d+)"[\s\S]*?<h3[^>]*class="heading_4_5[^"]*"[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<h4[^>]*class="company-name[^"]*"[^>]*>([\s\S]*?)<\/h4>/g;
  let m: RegExpExecArray | null;

  while ((m = cardRe.exec(html)) !== null) {
    const id = m[1];
    const title = stripHtml(m[2]);
    const company = stripHtml(m[3]);
    if (id && title) {
      jobs.push({
        jobId: `internshala_${id}`,
        company,
        roleTitle: title,
        location: "India",
        platform: "internshala" as any,
        applyUrl: `https://internshala.com/internship/detail/${id}`,
        isEasyApply: false,
        jobDescription: "",
      });
    }
    if (jobs.length >= 15) break;
  }

  return jobs;
}

// ── Naukri scraper ────────────────────────────────────────────────────────────

async function fetchNaukriJobs(role: string): Promise<JobResult[]> {
  const keyword = encodeURIComponent(role);
  const url = `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_keyword&searchType=adv&keyword=${keyword}&jobAge=7&src=jobsearchDesk`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "appid": "109",
      "systemid": "109",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return [];
  const data = (await res.json()) as any;

  return (data?.jobDetails ?? []).slice(0, 20).map((j: any) => ({
    jobId: j.jobId ?? "",
    company: j.companyName ?? "Unknown",
    roleTitle: j.title ?? role,
    location: j.placeholders?.find((p: any) => p.type === "location")?.label ?? "India",
    platform: "naukri" as any,
    applyUrl: j.jobUrl ?? `https://www.naukri.com/job-listings-${j.jobId}`,
    isEasyApply: false,
    jobDescription: j.jobDescription?.slice(0, 3000) ?? "",
  })).filter((j: JobResult) => j.applyUrl);
}

// ── Heuristic match scoring ───────────────────────────────────────────────────

function scoreJob(job: JobResult, targetRoles: string[]): number {
  let score = 50;
  const title = job.roleTitle.toLowerCase();

  for (const role of targetRoles) {
    const words = role.toLowerCase().split(/\s+/);
    const matches = words.filter((w) => w.length > 2 && title.includes(w)).length;
    score += matches * 15;
  }

  if (job.jobDescription && job.jobDescription.length < 200) score -= 10;
  if (job.platform === "linkedin") score += 10;
  if (job.isEasyApply) score += 5;

  return Math.min(100, Math.max(0, score));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
