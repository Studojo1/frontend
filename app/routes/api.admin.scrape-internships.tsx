import type { Route } from "./+types/api.admin.scrape-internships";
import db from "~/lib/db";
import { sql } from "drizzle-orm";

// ─── helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function makeSlug(company: string, title: string, sourceId: string) {
  const tail = String(sourceId).replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase();
  return `${slugify(company)}-${slugify(title)}-${tail}`.slice(0, 100);
}

// Safe SQL string literal — escape single quotes, truncate to 5000 chars
// Length-cap a value for insertion. Escaping is handled by parameter binding
// (the `sql` tagged template), so this only truncates — it never builds SQL.
function cap(str: unknown, maxLen = 5000): string {
  return String(str ?? "").slice(0, maxLen);
}

async function timedFetch(url: string, opts: RequestInit = {}, ms = 15000) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
}

// ─── normalised shape ─────────────────────────────────────────────────────────

interface ScrapedJob {
  title: string;
  company_name: string;
  location: string;
  stipend: string;
  duration: string;
  description: string;
  requirements: string;
  deadline: string | null;
  source_id: string;
  source_url: string;
}

// ─── Remotive — free JSON API, remote roles worldwide ─────────────────────────

async function fromRemotive(): Promise<ScrapedJob[]> {
  const cats = ["marketing", "software-dev", "data", "design", "product", "finance"];
  const out: ScrapedJob[] = [];
  await Promise.allSettled(
    cats.map(async (cat) => {
      try {
        const r = await timedFetch(
          `https://remotive.com/api/remote-jobs?category=${cat}&limit=25`
        );
        if (!r.ok) return;
        const d = await r.json();
        for (const j of d.jobs ?? []) {
          if (!j.title || !j.company_name) continue;
          out.push({
            title: j.title,
            company_name: j.company_name,
            location: j.candidate_required_location || "Remote / Worldwide",
            stipend: j.salary || "Competitive",
            duration: "Full-time / Contract",
            description: stripTags(j.description || j.title),
            requirements: "See full listing for requirements.",
            deadline: null,
            source_id: `remotive-${j.id}`,
            source_url: j.url || "https://remotive.com",
          });
        }
      } catch {}
    })
  );
  return out;
}

// ─── Arbeitnow — free JSON API, EU + global ───────────────────────────────────

async function fromArbeitnow(): Promise<ScrapedJob[]> {
  const out: ScrapedJob[] = [];
  try {
    for (let p = 1; p <= 4; p++) {
      const r = await timedFetch(`https://www.arbeitnow.com/api/job-board-api?page=${p}`);
      if (!r.ok) break;
      const d = await r.json();
      if (!d.data?.length) break;
      for (const j of d.data) {
        if (!j.title || !j.company_name) continue;
        out.push({
          title: j.title,
          company_name: j.company_name,
          location: j.location || "Remote",
          stipend: "Competitive",
          duration: j.job_types?.join(", ") || "Full-time",
          description: stripTags(j.description || j.title),
          requirements: "See full listing for requirements.",
          deadline: null,
          source_id: `arbeitnow-${j.slug}`,
          source_url: j.url || "https://www.arbeitnow.com",
        });
      }
    }
  } catch {}
  return out;
}

// ─── Jobicy — free JSON API, remote jobs ──────────────────────────────────────

async function fromJobicy(): Promise<ScrapedJob[]> {
  const out: ScrapedJob[] = [];
  try {
    const r = await timedFetch(
      "https://jobicy.com/api/v2/remote-jobs?count=50&tag=marketing,software,design,data,product"
    );
    if (!r.ok) return [];
    const d = await r.json();
    for (const j of d.jobs ?? []) {
      if (!j.jobTitle || !j.companyName) continue;
      const pay =
        j.annualSalaryMin && j.annualSalaryMax
          ? `$${Math.round(j.annualSalaryMin / 1000)}k–$${Math.round(j.annualSalaryMax / 1000)}k/yr`
          : "Competitive";
      out.push({
        title: j.jobTitle,
        company_name: j.companyName,
        location: j.jobGeo || "Remote / Worldwide",
        stipend: pay,
        duration: j.jobType || "Full-time",
        description: stripTags(j.jobDescription || j.jobTitle),
        requirements: "See full listing for requirements.",
        deadline: null,
        source_id: `jobicy-${j.id}`,
        source_url: j.url || "https://jobicy.com",
      });
    }
  } catch {}
  return out;
}

// ─── The Muse — free API, internship filter ───────────────────────────────────

async function fromMuse(): Promise<ScrapedJob[]> {
  const out: ScrapedJob[] = [];
  try {
    for (let p = 1; p <= 3; p++) {
      const r = await timedFetch(
        `https://www.themuse.com/api/public/jobs?level=Internship&page=${p}&per_page=50`
      );
      if (!r.ok) break;
      const d = await r.json();
      if (!d.results?.length) break;
      for (const j of d.results) {
        if (!j.name) continue;
        const loc = j.locations?.[0]?.name || "Remote";
        out.push({
          title: j.name,
          company_name: j.company?.name || "Unknown",
          location: loc,
          stipend: "See listing",
          duration: "Internship",
          description: stripTags(j.contents || j.name),
          requirements: "See full listing for requirements.",
          deadline: null,
          source_id: `muse-${j.id}`,
          source_url: j.refs?.landing_page || "https://www.themuse.com",
        });
      }
    }
  } catch {}
  return out;
}

// ─── Internshala — India focus, HTML scrape ───────────────────────────────────

async function fromInternshala(): Promise<ScrapedJob[]> {
  const out: ScrapedJob[] = [];
  const cats = [
    "marketing-internship",
    "technology-internship",
    "finance-internship",
    "management-internship",
    "design-internship",
  ];

  await Promise.allSettled(
    cats.map(async (cat) => {
      try {
        const r = await timedFetch(
          `https://internshala.com/internships/${cat}/`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36",
              Accept: "text/html,application/xhtml+xml",
              "Accept-Language": "en-US,en;q=0.9",
              Referer: "https://www.google.com/",
            },
          },
          20000
        );
        if (!r.ok) return;
        const html = await r.text();

        // Internshala embeds data in a JS variable on the page
        const match =
          html.match(/internships_data\s*=\s*(\{[\s\S]*?\});(?:\s*var|\s*<\/script>)/) ||
          html.match(/window\.__NEXT_DATA__\s*=\s*(\{[\s\S]+?\})\s*<\/script>/);

        if (match) {
          try {
            const payload = JSON.parse(match[1]);
            const list =
              payload?.internships_meta ||
              payload?.props?.pageProps?.internships ||
              [];
            for (const i of list) {
              const city =
                Array.isArray(i.location_names) && i.location_names.length
                  ? i.location_names.join(", ")
                  : i.location || "India";
              const title = i.title || i.profile_name || "Internship";
              const company = i.company_name || i.organisation_name || "Company";
              out.push({
                title,
                company_name: company,
                location: city,
                stipend: i.stipend?.salary || i.stipend_type || "As per norms",
                duration: i.duration || "3 months",
                description:
                  i.other_details ||
                  i.profile_description ||
                  `${title} internship at ${company}.`,
                requirements: i.perks || i.skills || "See full listing.",
                deadline: i.application_deadline || null,
                source_id: `internshala-${i.id || i.internship_id}`,
                source_url: `https://internshala.com/internship/detail/${i.id || i.internship_id}`,
              });
            }
          } catch {}
        }
      } catch {}
    })
  );

  return out;
}

// ─── utility ──────────────────────────────────────────────────────────────────

function stripTags(html: string): string {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s{3,}/g, "\n\n")
    .trim()
    .slice(0, 5000);
}

// ─── ensure system user exists (idempotent) ───────────────────────────────────

async function ensureScraperUser() {
  await db.execute(sql.raw(`
    INSERT INTO "user" (id, name, email, email_verified, phone_number_verified, created_at, updated_at)
    VALUES ('scraper-system', 'Studojo Scraper', 'scraper@studojo.com', false, false, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `));
}

// ─── route handler ────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const secret = process.env.SCRAPE_SECRET;
  if (secret) {
    const auth = (request.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (auth !== secret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // DELETE ?cleanup=1 — removes all scraper-inserted rows from the DB
  const url = new URL(request.url);
  if (url.searchParams.get("cleanup") === "1") {
    const result = await db.execute(sql.raw(`
      DELETE FROM internships WHERE created_by = 'scraper-system'
    `));
    const deleted = (result as any).rowCount ?? 0;
    await db.execute(sql.raw(`DELETE FROM "user" WHERE id = 'scraper-system'`));
    return Response.json({ cleaned: true, deleted });
  }

  // Bootstrap system user so scraped rows can reference a valid created_by
  await ensureScraperUser();

  // Fetch from all sources concurrently
  const [remotive, arbeitnow, jobicy, muse, internshala] = await Promise.allSettled([
    fromRemotive(),
    fromArbeitnow(),
    fromJobicy(),
    fromMuse(),
    fromInternshala(),
  ]);

  const all: ScrapedJob[] = [
    ...(remotive.status === "fulfilled" ? remotive.value : []),
    ...(arbeitnow.status === "fulfilled" ? arbeitnow.value : []),
    ...(jobicy.status === "fulfilled" ? jobicy.value : []),
    ...(muse.status === "fulfilled" ? muse.value : []),
    ...(internshala.status === "fulfilled" ? internshala.value : []),
  ];

  // Deduplicate by source_id within this batch
  const seen = new Set<string>();
  const deduped = all.filter((j) => {
    if (seen.has(j.source_id)) return false;
    seen.add(j.source_id);
    return true;
  });

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const job of deduped) {
    try {
      const slug = makeSlug(job.company_name, job.title, job.source_id);
      const description = job.description || job.title;
      const requirements = job.requirements || "See full listing.";
      // Bind the deadline as a real value (Date or null) — Postgres casts it.
      const deadline = job.deadline ? new Date(job.deadline) : null;

      const result = await db.execute(sql`
        INSERT INTO internships (
          id, title, company_name, description, requirements,
          location, duration, stipend, application_deadline,
          status, slug, created_by, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${cap(job.title)},
          ${cap(job.company_name)},
          ${cap(description)},
          ${cap(requirements)},
          ${cap(job.location)},
          ${cap(job.duration)},
          ${cap(job.stipend)},
          ${deadline},
          'published',
          ${cap(slug)},
          'scraper-system',
          NOW(),
          NOW()
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `);

      if ((result as any).rows?.length > 0) inserted++;
      else skipped++;
    } catch (err: any) {
      const msg = err?.message?.slice(0, 100) ?? "unknown error";
      errors.push(`${job.source_id}: ${msg}`);
    }
  }

  const sourceCounts = {
    remotive: remotive.status === "fulfilled" ? remotive.value.length : 0,
    arbeitnow: arbeitnow.status === "fulfilled" ? arbeitnow.value.length : 0,
    jobicy: jobicy.status === "fulfilled" ? jobicy.value.length : 0,
    muse: muse.status === "fulfilled" ? muse.value.length : 0,
    internshala: internshala.status === "fulfilled" ? internshala.value.length : 0,
  };

  return Response.json({
    total_fetched: deduped.length,
    inserted,
    skipped,
    errors: errors.slice(0, 20),
    sources: sourceCounts,
  });
}
