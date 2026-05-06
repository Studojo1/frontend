import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Why Companies Post Jobs Without Hiring: Ghost Jobs, SEO, and 11 Other Reasons | Studojo" },
    { name: "description", content: "68% of managers have posted a job they weren't actively trying to fill. A documented breakdown of every reason a job posting exists that has nothing to do with actually hiring: ghost jobs, legal compliance, SEO, investor optics, and more." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "ghost jobs 2026, why companies post fake jobs, job postings without hiring, ghost job listings, why companies dont respond to applications" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ghost-jobs-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Why Companies Post Jobs Without Hiring: Ghost Jobs, SEO, and 11 Other Reasons" },
    { property: "og:description", content: "68% of managers have posted a job they weren't actively trying to fill. The full documented breakdown." },
    { property: "og:url", content: `${BASE_URL}/reports/ghost-jobs-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-04-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Why Companies Post Jobs Without Hiring | Studojo" },
    { name: "twitter:description", content: "68% of managers posted a job they weren't actively trying to fill. 11 documented reasons." },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
    { name: "twitter:site", content: "" },
  ];
}

declare global {
  interface Window { Chart: any; }
}

function initCharts() {
  const Chart = window.Chart;
  if (!Chart) return;
  Chart.defaults.font.family = "Satoshi, sans-serif";
  Chart.defaults.color = "#171717";

  const VIOLET = "#8B5CF6";
  const VIOLET2 = "#a78bfa";
  const VIOLET3 = "#c4b5fd";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const GREY = "#e5e5e5";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: Frequency of each reason
  const freqEl = document.getElementById("freqChart") as HTMLCanvasElement | null;
  if (freqEl && !freqEl.dataset.rendered) {
    freqEl.dataset.rendered = "1";
    new Chart(freqEl, {
      type: "bar",
      data: {
        labels: [
          "Ghost jobs (already filled / on hold)",
          "SEO & employer brand",
          "Internal process theater",
          "Legal / immigration compliance",
          "Talent pipeline building",
          "Investor / press optics",
          "Job board algorithm gaming",
          "Competitive intelligence",
          "Staffing agency dynamics",
          "M&A / crisis management",
          "Govt grant compliance",
        ],
        datasets: [{
          label: "Prevalence score (1–5)",
          data: [5, 5, 4, 4, 4, 4, 5, 3, 3, 2, 2],
          backgroundColor: [RED, RED, ORANGE, ORANGE, ORANGE, ORANGE, RED, ORANGE, ORANGE, VIOLET3, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` Prevalence: ${ctx.raw}/5` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0, max: 5, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: Ghost job breakdown doughnut
  const ghostEl = document.getElementById("ghostChart") as HTMLCanvasElement | null;
  if (ghostEl && !ghostEl.dataset.rendered) {
    ghostEl.dataset.rendered = "1";
    new Chart(ghostEl, {
      type: "doughnut",
      data: {
        labels: [
          "Role already filled, not taken down (43%)",
          "Headcount freeze / role on hold (31%)",
          "Perpetual always-on listing (26%)",
        ],
        datasets: [{
          data: [43, 31, 26],
          backgroundColor: [RED, ORANGE, VIOLET3],
          borderColor: "#fff",
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
      },
    });
  }

  // Chart 3: Posting age vs response rate
  const ageEl = document.getElementById("ageChart") as HTMLCanvasElement | null;
  if (ageEl && !ageEl.dataset.rendered) {
    ageEl.dataset.rendered = "1";
    new Chart(ageEl, {
      type: "bar",
      data: {
        labels: ["0–7 days", "8–14 days", "15–21 days", "22–30 days", "31–45 days", "45+ days"],
        datasets: [
          {
            label: "Estimated callback rate (%)",
            data: [14, 9, 6, 4, 2, 1],
            backgroundColor: [GREEN, VIOLET2, ORANGE, ORANGE, RED, RED],
            borderRadius: 6,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% callback rate` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4,4] }, ticks: { font: { size: 12 }, callback: (v: any) => v + "%", color: MUTED } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #8B5CF6; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #8B5CF6; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #8B5CF6; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }

  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }

  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #8B5CF6; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
  .stat-card .sc-label { font-size: 13px; font-weight: 600; color: #171717; line-height: 1.4; margin-bottom: 6px; }
  .stat-card .sc-source { font-size: 10px; font-weight: 500; color: #a3a3a3; letter-spacing: 0.5px; }

  .rpt-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .rpt-section { padding: 28px 20px; } }
  .sec-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
  .sec-num { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #8B5CF6; color: #fff; font-size: 13px; font-weight: 700; border-radius: 50%; border: 2px solid #171717; flex-shrink: 0; }
  .sec-title { font-size: 24px; font-weight: 700; color: #171717; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 4px; }
  .sec-sub { font-size: 13px; color: #737373; font-weight: 500; }
  .rpt-section p { font-size: 15px; color: #404040; line-height: 1.75; margin-bottom: 14px; }
  .rpt-section p:last-child { margin-bottom: 0; }

  .highlight { background: #faf5fe; border: 1.5px solid #c4b5fd; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #5b21b6; line-height: 1.6; }
  .highlight strong { color: #6d28d9; }
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }

  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }

  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .chart-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  @media (max-width: 640px) { .chart-two { grid-template-columns: 1fr; } }

  .divider { height: 2px; background: #f0f0f0; margin: 24px 0; border-radius: 2px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-red { background: #fee2e2; color: #b91c1c; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }
  .pill-blue { background: #dbeafe; color: #1e40af; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }

  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function GhostJobsReport() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) { initCharts(); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    script.onload = () => initCharts();
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Why Companies Post Jobs Without Hiring: Ghost Jobs, SEO, and 11 Other Reasons",
        "description": "68% of managers have posted a job they weren't actively trying to fill. A documented breakdown of every reason a job posting exists that has nothing to do with actually hiring.",
        "url": `${BASE_URL}/reports/ghost-jobs-2026`,
        "datePublished": "2026-04-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ghost-jobs-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Ghost Jobs 2026", "item": `${BASE_URL}/reports/ghost-jobs-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · April 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Ghost Jobs 2026</span>
            </nav>
            <h1>Why Companies Post Jobs<br /><em>Without Planning to Hire</em></h1>
            <p className="rpt-hero-sub">
              Ghost jobs. SEO theater. Legal cover. Investor optics. A documented breakdown of
              every reason a job posting exists that has nothing to do with actually filling the role.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · All industries</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Reasons Documented</span>
                <span className="rpt-meta-value">11 categories</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">April 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">68%</div>
              <div className="sc-label">of managers posted a job they weren't actively trying to fill</div>
              <div className="sc-source">Clarify Capital, 2022</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3 in 10</div>
              <div className="sc-label">companies admitted to posting ghost jobs in the past year</div>
              <div className="sc-source">ResumeBuilder.com, 2023</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">55 days</div>
              <div className="sc-label">avg listing stays live vs. 42-day avg time-to-fill</div>
              <div className="sc-source">LinkedIn Talent Insights, 2023</div>
            </div>
          </div>

          {/* Frequency chart */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">All 11 Reasons: Prevalence Overview</div>
                <div className="sec-sub">How common each reason is across companies, scored 1–5</div>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Prevalence by reason (1 = rare · 5 = endemic)</div>
              <div style={{ height: 380 }}>
                <canvas id="freqChart" />
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Ghost Jobs: The Most Common Reason</div>
                <div className="sec-sub">Listings that exist with no real intention of hiring in the near term</div>
              </div>
            </div>
            <p>The most widely documented phenomenon is the "ghost job": a posting that is either for a role that has already been filled, a role that doesn't exist yet, or a role where hiring is perpetually "on hold." These listings stay active on job boards for weeks or months, collecting applications that go unread.</p>
            <div className="highlight">
              A 2023 survey by ResumeBuilder found that <strong>1 in 3 job postings on major boards at any given time may be ghost listings</strong>. Of companies surveyed, 43% said they kept old listings up even after the position was filled.
            </div>
            <div className="chart-two">
              <div>
                <div className="chart-label">Ghost job breakdown by sub-type</div>
                <div style={{ height: 240 }}>
                  <canvas id="ghostChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">Application callback rate by posting age</div>
                <div style={{ height: 240 }}>
                  <canvas id="ageChart" />
                </div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Already-filled roles:</strong> Company hired internally or promoted someone, chose not to take the posting down. The listing collects resumes used as a future pipeline.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Headcount freeze:</strong> Role was approved before a budget cut. Posting stays live to preserve the approved slot and signal to leadership that the team is actively recruiting.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Perpetual listings:</strong> High-turnover roles where companies keep a permanent listing live because they anticipate needing to fill it eventually. No specific candidate, no specific timeline.</span></div>
            </div>
            <div className="callout">
              <strong>What this means:</strong> A response rate under 5% on applications is often not about your profile. It can simply mean the role was never real to begin with. The job board showed it to you because the algorithm rewards active listings, not honest ones.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">SEO and Employer Brand Visibility</div>
                <div className="sec-sub">Job postings as a search engine and brand strategy</div>
              </div>
            </div>
            <p>Job listings are among the highest-traffic pages on any company website. When a company posts to LinkedIn, Indeed, or Google Jobs, they don't just reach job seekers. They get crawled by Google, appear in branded search results, and build domain authority for the careers page.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Google for Jobs integration:</strong> Every structured job posting gets ingested by Google's job search feature. Posting 20 jobs means 20 entries appearing in search results for "[Company] jobs." Free, high-intent traffic that money can't directly buy.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>LinkedIn follower growth:</strong> Companies that post frequently get surfaced in LinkedIn's recommendation feed. A job posting drives page follows and brand awareness far beyond the candidate pool.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Indeed / Glassdoor profile richness:</strong> More job postings means a more complete profile, which means higher placement in employer search results. Companies game this actively.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>"We're always hiring" optics:</strong> A company with zero postings looks stagnant to talent, press, and investors who use job boards as a proxy for company health.</span></div>
            </div>
            <div className="pull-quote">
              <p>"We post roles in categories we're known for even when we're not actively recruiting. It keeps our brand visible to the right people. It's basically content marketing."</p>
              <span className="pq-source">HR Director, Series B SaaS company (anonymous, The Muse, 2023)</span>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Legal Compliance and Immigration Requirements</div>
                <div className="sec-sub">When the law requires you to post before hiring the person you already chose</div>
              </div>
            </div>
            <p>In multiple countries, labor law or immigration regulation explicitly requires companies to publicly advertise a position, even when the candidate is already identified, before they can proceed with the hire or the visa application.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country / Program</th>
                  <th>Requirement</th>
                  <th>Reality</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>USA: PERM Labor Certification</strong></td>
                  <td>Must advertise the role for 30+ days and demonstrate no qualified US workers applied</td>
                  <td><span className="tag-pill pill-red">Performative</span> Employer typically already knows who they want to sponsor. The advertising is a legal checkbox.</td>
                </tr>
                <tr>
                  <td><strong>USA: H-1B LCA Posting</strong></td>
                  <td>Labor Condition Application requires notice posted at the worksite for 10 days</td>
                  <td><span className="tag-pill pill-amber">Mixed</span> Candidate already identified. Posting is a notice, not an invitation to apply.</td>
                </tr>
                <tr>
                  <td><strong>UK: Skilled Worker Visa</strong></td>
                  <td>Roles must be advertised for 28 days on DWP's Find a Job platform</td>
                  <td><span className="tag-pill pill-red">Performative</span> Sponsor already identified preferred candidate. Satisfies the Home Office requirement.</td>
                </tr>
                <tr>
                  <td><strong>Canada: LMIA</strong></td>
                  <td>Employer must advertise on Government of Canada Job Bank for 4+ weeks</td>
                  <td><span className="tag-pill pill-red">Performative</span> Designed to prove Canadians were given a chance. Employer has their hire in mind already.</td>
                </tr>
                <tr>
                  <td><strong>Australia: TSS Visa (482)</strong></td>
                  <td>Must advertise on at least two platforms for 4 weeks within the past 4 months</td>
                  <td><span className="tag-pill pill-red">Performative</span> Sponsor identified. Advertising is procedural.</td>
                </tr>
                <tr>
                  <td><strong>USA: OFCCP Compliance</strong></td>
                  <td>Federal contractors must list all openings with state employment agencies</td>
                  <td><span className="tag-pill pill-blue">Genuine Compliance</span> Real requirement, though depth of recruitment effort varies widely.</td>
                </tr>
              </tbody>
            </table>
            <div className="highlight">
              <strong>Estimate:</strong> Immigration attorneys commonly note that <strong>a significant portion of externally posted senior and specialist roles at large enterprises are PERM or visa-related postings</strong> where the outcome is predetermined. These roles receive thousands of applications that are never reviewed.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Talent Pipeline Building</div>
                <div className="sec-sub">Collecting candidates for roles that don't exist yet</div>
              </div>
            </div>
            <p>Many companies, especially in high-growth phases or industries with chronic talent shortages, run "always-on" job postings with no active search behind them. The goal is to build a database of warm candidates who can be contacted quickly when a real opening materializes.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Continuous intake:</strong> Companies in fast-moving sectors (AI, biotech, defence tech) post engineering and research roles year-round even during hiring freezes. They want the pipeline warm the moment budget unlocks.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>ATS database building:</strong> Every application enriches the company's Applicant Tracking System with candidate data: skills, location, salary expectations, career history. This data has value independent of whether the role is filled.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Competitive talent sourcing:</strong> Posting a "Senior Engineer" role at a competitive salary gets applications from people currently at your competitors. Even if you don't hire now, you know who's open to leaving.</span></div>
            </div>
            <div className="callout">
              <strong>The asymmetry:</strong> A candidate spends 2–4 hours on a tailored application. The company spends 0 hours reviewing it if the role wasn't real. This asymmetry is the core ethical problem with pipeline-building postings. The cost is entirely externalized to applicants.
            </div>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Investor and Press Signal Management</div>
                <div className="sec-sub">Job postings as a public signal of company health</div>
              </div>
            </div>
            <p>Job postings are publicly visible signals that investors, analysts, journalists, and competitors actively monitor. A spike in hiring signals growth. A collapse in postings signals trouble. Companies know this and manage their posting cadence accordingly.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Pre-fundraise posturing:</strong> Companies frequently post a burst of roles ahead of funding rounds to signal momentum. Investors track headcount growth as a leading indicator of traction.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Free press coverage:</strong> "Company X announces plans to hire 500 in [City]" is a reliable press hit that costs nothing except putting up a careers page with some listings. No hires required to generate the headline.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Analyst tracking:</strong> Firms like Thinknum, Revelio Labs, and Burning Glass sell job posting data to investors and hedge funds as alternative data. Companies in competitive industries know their hiring signals are being watched.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Post-layoff narrative management:</strong> After layoffs, companies post new roles quickly, even before offboarding is complete, to signal "right-sizing" rather than collapse. The new postings create a counter-narrative.</span></div>
            </div>
            <div className="pull-quote">
              <p>"After we let go of 200 people in Q3, our comms team pushed us to post 30 new roles within two weeks. Half of them weren't real. It was about controlling the narrative."</p>
              <span className="pq-source">VP of People, public tech company (anonymous interview, 2024)</span>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Competitive and Market Intelligence</div>
                <div className="sec-sub">Using applications to learn what competitors pay and who's available</div>
              </div>
            </div>
            <p>Job postings generate data in both directions. The company posting learns from every application it receives, and from the act of posting itself.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Salary benchmarking:</strong> Post a role at $120k. See who applies and at what expected comp. Revise your compensation bands accordingly. This costs nothing and gives you real-market data your comp team would otherwise pay thousands for.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Skills gap mapping:</strong> The volume and quality of applications tells you how scarce specific skills are in your target market. Struggling to fill a Python role in Bangalore vs. San Francisco? Now you know.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Competitor employee intelligence:</strong> Applications reveal who is employed where and at what seniority. Even rejected candidates teach you about your competitors' org structure, tech stack, and retention.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Suppress internal salary pressure:</strong> The darkest variant: posting externally to "prove" to a current employee that their salary is market rate. The posting is a negotiation tactic, not a genuine search.</span></div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">Internal Process Theater</div>
                <div className="sec-sub">The candidate was chosen before the posting went live</div>
              </div>
            </div>
            <p>Many companies have internal HR policies requiring external posting before an internal candidate can be confirmed or a contractor converted to full-time. The posting is a procedural requirement, not a genuine search.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Internal promotion cover:</strong> Manager wants to promote someone. HR policy requires external posting first. A handful of external candidates are interviewed perfunctorily, then the internal person is promoted. The external search was always a formality.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Contractor-to-FTE conversion:</strong> A contractor has been doing the job for 6 months. Legal/HR requires an open competitive process before they can be hired full-time. The existing contractor is the only real candidate.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Budget slot preservation:</strong> Finance approved a headcount that hasn't been filled. If not filled within the fiscal quarter, the slot disappears. Manager posts the role to keep the slot alive, even without a real search in progress.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Quiet replacement:</strong> A manager wants to replace an existing employee without them knowing. The posting is live and interviews are happening while the employee still holds the role. Legal in at-will jurisdictions, and more common than reported.</span></div>
            </div>
          </div>

          {/* Section 8 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">8</div>
              <div>
                <div className="sec-title">Job Board Algorithm Gaming</div>
                <div className="sec-sub">Reposting, refreshing, and inflating to stay visible</div>
              </div>
            </div>
            <p>Indeed, LinkedIn, and other job boards surface listings based on recency and engagement. Older listings drop in rank. Companies have adapted by treating job postings as an SEO exercise, reposting and refreshing the same roles repeatedly.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Reposting the same role:</strong> Taking down a 30-day-old listing and reposting it as new to reset the algorithm clock and appear at the top of search results. Candidates see the same role multiple times as "new." Endemic on LinkedIn and Indeed.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Volume posting for visibility:</strong> A staffing agency posts 200 positions when they have 20 real ones, because platforms surface high-volume companies more prominently to both candidates and employers.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Sponsored listing A/B testing:</strong> Companies use sponsored posts to test which job titles, locations, and keywords drive the most applications, even without a hire in mind. It's A/B testing the job market.</span></div>
            </div>
            <div className="highlight">
              LinkedIn's terms of service prohibit posting jobs you don't intend to fill, but enforcement is effectively zero. The platform's incentive is engagement, not accuracy. <strong>More listings = more candidates = more employer clients = more revenue.</strong> The misaligned incentive is structural.
            </div>
          </div>

          {/* Section 9–11 combined */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">9</div>
              <div>
                <div className="sec-title">M&A, Staffing Agency, and Grant Compliance</div>
                <div className="sec-sub">Three further structural reasons</div>
              </div>
            </div>

            <p><strong>Merger and acquisition theater.</strong> When a company is being acquired, they may continue posting jobs to prevent employees from noticing unusual activity and to signal normalcy to customers and the market. Many postings are never intended to be filled given the pending structural change. During crises, a spike in job postings can also serve as a PR counter-narrative.</p>

            <div className="divider" />

            <p><strong>Staffing agency and recruiter dynamics.</strong> Contingency recruiters post roles speculatively, without a signed contract, betting they can deliver a candidate and negotiate a fee. The "role" may not have been formally opened by the hiring company. Agencies also reactivate dormant client listings to stay market-visible without any instruction from the client.</p>

            <div className="divider" />

            <p><strong>Government grant and funding compliance.</strong> Companies receiving economic development incentives, startup grants, or accelerator funding are frequently required to demonstrate hiring activity as a condition of the grant. The posting is created to satisfy the "jobs created" metric, not to fill a real vacancy. ESG and DEI reporting requirements can generate similar phantom postings: roles posted to generate application data that supports internal diversity dashboards.</p>
          </div>

          {/* Summary table */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">All 11 Reasons: Summary</div>
                <div className="sec-sub">Frequency and candidate impact at a glance</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reason</th>
                  <th>Frequency</th>
                  <th>Impact on Candidates</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1", "Ghost jobs (already filled / on hold)", "pill-red", "Very High", "Applications go unread"],
                  ["2", "SEO and employer brand visibility", "pill-red", "Very High", "False signal of hiring activity"],
                  ["3", "Legal / immigration compliance", "pill-amber", "High", "Role predetermined, all apps rejected"],
                  ["4", "Talent pipeline building", "pill-amber", "High", "Candidate data harvested, no hire made"],
                  ["5", "Investor / press optics", "pill-amber", "High", "Applications collected but ignored"],
                  ["6", "Competitive / market intelligence", "pill-amber", "Medium", "Salary and skills data extracted from applicants"],
                  ["7", "Internal process theater", "pill-amber", "High", "External apps reviewed perfunctorily or not at all"],
                  ["8", "Job board algorithm gaming", "pill-red", "Very High", "Duplicate effort: same role seen multiple times as 'new'"],
                  ["9", "M&A / crisis management", "pill-green", "Lower", "Postings made during a hiring freeze period"],
                  ["10", "Staffing agency dynamics", "pill-amber", "Medium", "Role may not exist at the client company at all"],
                  ["11", "Govt grant / funding compliance", "pill-green", "Lower", "Role is a metric, not a genuine vacancy"],
                ].map(([num, reason, pillClass, freq, impact]) => (
                  <tr key={num}>
                    <td style={{ fontWeight: 700, color: "#8B5CF6" }}>{num}</td>
                    <td>{reason}</td>
                    <td><span className={`tag-pill ${pillClass}`}>{freq}</span></td>
                    <td style={{ color: "#737373" }}>{impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Takeaway */}
          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>The research implication for how you should approach the job market</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>If a significant fraction of job postings exist for reasons unrelated to hiring, then a pure application-volume strategy is partially a waste of time. The research points toward a different approach:</p>
            <div className="blist">
              {[
                ["Direct outreach to hiring managers outperforms applications", "It bypasses the ATS entirely and reaches the person with actual authority. Ghost jobs can't intercept you at this layer."],
                ["Recency matters more than you think", "A job posted in the last 3–7 days is far more likely to represent an active search than one posted 30+ days ago. Filter aggressively on recency."],
                ["Founder-posted listings on LinkedIn are the most reliable signal of real intent", "A founder writing 'we're hiring' with their own words is about as genuine as a job listing gets."],
                ["A low response rate is structural, not personal", "You are not being rejected. You are often being ignored by a system that was never designed to process your application."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Stop applying into the void.</h3>
              <p>Studojo Outreach finds the hiring managers who actually have open roles and puts you in front of them directly. No ATS, no ghost jobs.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Try Studojo Outreach →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
