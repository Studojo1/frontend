import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Why 80% of Applications Get No Response: The Full Breakdown | Studojo" },
    { name: "description", content: "75% of resumes are filtered before a human sees them. A documented breakdown of every reason applications go unanswered: ATS filtering, volume, timing, ghost jobs, and the referral wall." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "why applications get no response 2026, job application no reply, ATS filtering, why recruiters dont respond, job search response rate" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/application-response-rate-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Why 80% of Applications Get No Response: The Full Breakdown" },
    { property: "og:description", content: "75% of resumes are filtered before a human sees them. Every reason your application disappears, documented." },
    { property: "og:url", content: `${BASE_URL}/reports/application-response-rate-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-01T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Why 80% of Applications Get No Response | Studojo" },
    { name: "twitter:description", content: "75% of resumes filtered before a human sees them. The full documented breakdown." },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
    { name: "twitter:site", content: "@studojo_com" },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: Funnel — what happens to 100 applications
  const funnelEl = document.getElementById("funnelChart") as HTMLCanvasElement | null;
  if (funnelEl && !funnelEl.dataset.rendered) {
    funnelEl.dataset.rendered = "1";
    new Chart(funnelEl, {
      type: "bar",
      data: {
        labels: ["Applications sent", "Pass ATS filter", "Seen by a human", "Get a callback", "Reach interview", "Get an offer"],
        datasets: [{
          label: "Out of 100 applications",
          data: [100, 25, 18, 8, 3, 1],
          backgroundColor: [VIOLET, ORANGE, ORANGE, RED, RED, GREEN],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} out of 100` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: Response rate by application timing
  const timingEl = document.getElementById("timingChart") as HTMLCanvasElement | null;
  if (timingEl && !timingEl.dataset.rendered) {
    timingEl.dataset.rendered = "1";
    new Chart(timingEl, {
      type: "bar",
      data: {
        labels: ["Day 1", "Day 2-3", "Day 4-7", "Day 8-14", "Day 15-30", "Day 30+"],
        datasets: [{
          label: "Callback rate (%)",
          data: [17, 12, 8, 5, 3, 1],
          backgroundColor: [GREEN, GREEN, VIOLET2, ORANGE, RED, RED],
          borderRadius: 6,
          borderWidth: 0,
        }],
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
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 12 }, callback: (v: any) => v + "%", color: MUTED } },
        },
      },
    });
  }

  // Chart 3: How roles are actually filled
  const filledEl = document.getElementById("filledChart") as HTMLCanvasElement | null;
  if (filledEl && !filledEl.dataset.rendered) {
    filledEl.dataset.rendered = "1";
    new Chart(filledEl, {
      type: "doughnut",
      data: {
        labels: ["Internal referral or promotion (49%)", "Direct recruiter outreach (21%)", "Public application (19%)", "Other / agency (11%)"],
        datasets: [{
          data: [49, 21, 19, 11],
          backgroundColor: [VIOLET, VIOLET2, RED, VIOLET3],
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

export default function ApplicationResponseRateReport() {
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
        "headline": "Why 80% of Applications Get No Response: The Full Breakdown",
        "description": "75% of resumes are filtered before a human sees them. A documented breakdown of every reason applications go unanswered.",
        "url": `${BASE_URL}/reports/application-response-rate-2026`,
        "datePublished": "2026-05-01T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/application-response-rate-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Application Response Rate 2026", "item": `${BASE_URL}/reports/application-response-rate-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · May 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Application Response Rate 2026</span>
            </nav>
            <h1>Why 80% of Applications<br /><em>Get No Response</em></h1>
            <p className="rpt-hero-sub">
              75% of resumes are filtered before a human ever reads them. A documented breakdown of every
              reason applications disappear: ATS, volume, timing, ghost jobs, and the referral wall.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · All industries</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Reasons Documented</span>
                <span className="rpt-meta-value">8 categories</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">May 2026</span>
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
              <div className="sc-num">75%</div>
              <div className="sc-label">of resumes never seen by a human due to ATS filtering</div>
              <div className="sc-source">Jobscan, 2024</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">250+</div>
              <div className="sc-label">applications received per corporate job posting on average</div>
              <div className="sc-source">LinkedIn Talent Trends, 2024</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">7 sec</div>
              <div className="sc-label">average time a recruiter spends on a resume before deciding</div>
              <div className="sc-source">Ladders Eye-Tracking Study, 2018</div>
            </div>
          </div>

          {/* Funnel overview */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">What Happens to 100 Applications</div>
                <div className="sec-sub">The full funnel from send to offer</div>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Out of every 100 applications sent</div>
              <div style={{ height: 320 }}>
                <canvas id="funnelChart" />
              </div>
            </div>
            <div className="callout">
              <strong>The math:</strong> If you send 100 applications, roughly 25 pass the ATS, 18 get seen by a human, 8 get a callback, 3 reach interview stage, and 1 results in an offer. The system is not designed to find you. It is designed to eliminate you efficiently.
            </div>
          </div>

          {/* Section 1: ATS */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">ATS Filtering: The Invisible Wall</div>
                <div className="sec-sub">75% of resumes eliminated before any human reads them</div>
              </div>
            </div>
            <p>Applicant Tracking Systems are used by 99% of Fortune 500 companies and the majority of firms with more than 50 employees. They parse, rank, and filter resumes automatically based on keyword matching, formatting, and structured data. A resume that a human would find impressive can score a zero in an ATS if it lacks the right terminology.</p>
            <div className="highlight">
              A 2024 Jobscan study found that <strong>75% of resumes are rejected by ATS before a recruiter ever opens them</strong>. The majority of rejections happen not because the candidate is unqualified, but because their resume uses different language than the job description.
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Keyword mismatch:</strong> Writing "managed social media" when the JD says "social media management" is enough to score poorly. ATS systems match exact phrases, not intent. The solution is mirroring the job description's language precisely.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Formatting failures:</strong> Tables, columns, headers, text boxes, and images break ATS parsing. The system reads the raw text it can extract. A two-column resume that looks clean to a human may read as a scrambled mess to the software.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>File format issues:</strong> PDF rendering varies across ATS platforms. Some systems handle PDFs poorly. A .docx file often parses more reliably. Most candidates never consider this.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Missing required fields:</strong> Skills sections, education fields, and job title formatting are parsed into structured data. Missing or unusual formatting in these fields drops your match score before any human judgment is involved.</span></div>
            </div>
            <div className="callout">
              <strong>The fix is not a better resume. It is a resume written for the specific job description in front of you.</strong> Generic resumes fail ATS systematically. Tailored resumes pass at dramatically higher rates. The effort cost is 15 minutes per application. Most candidates do not spend it.
            </div>
          </div>

          {/* Section 2: Volume */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">Application Volume: You Are One of 250</div>
                <div className="sec-sub">Why even a good application can disappear in the stack</div>
              </div>
            </div>
            <p>LinkedIn reports that a single corporate job posting now receives an average of 250 applications. At well-known companies, that number can reach 1,000 or more. A recruiter managing 10 open roles is handling 2,500 applications per week. The math of attention is brutal.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The 7-second rule:</strong> Eye-tracking research consistently shows recruiters spend 6 to 8 seconds on initial resume review. In that window, they scan for: current company, current role, education, and tenure. If those four items do not land immediately, the resume is discarded.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Stack ranking:</strong> ATS systems surface candidates in ranked order. Recruiters typically work from the top of the list. If you are ranked 200th, your application requires them to scroll past 199 others before reaching you. In practice, most recruiters stop long before that.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The easy yes problem:</strong> Recruiters are incentivised to fill roles quickly. The first qualified candidate who passes the bar gets the call. Being the 40th equally qualified person to apply gives you close to zero advantage over being the 240th.</span></div>
            </div>
            <div className="pull-quote">
              <p>"We had 400 applications in 48 hours. I reviewed the first 50, found 3 people to call, scheduled interviews. The remaining 350 got a rejection email two weeks later."</p>
              <span className="pq-source">Senior Recruiter, Series B tech company (anonymous, Reddit r/recruiting, 2024)</span>
            </div>
          </div>

          {/* Section 3: Timing */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Timing: The Decay Curve</div>
                <div className="sec-sub">Callback rates drop sharply within days of a posting going live</div>
              </div>
            </div>
            <p>LinkedIn data consistently shows that applications submitted within the first 24 to 48 hours of a posting going live receive significantly higher callback rates than those submitted later. This is not only because recruiters work through the early stack first. It is also because many roles are filled or shortlisted before the posting officially closes.</p>
            <div className="chart-two">
              <div>
                <div className="chart-label">Estimated callback rate by day applied</div>
                <div style={{ height: 240 }}>
                  <canvas id="timingChart" />
                </div>
              </div>
              <div>
                <div className="chart-label">How roles are actually filled</div>
                <div style={{ height: 240 }}>
                  <canvas id="filledChart" />
                </div>
              </div>
            </div>
            <div className="highlight">
              Applying on day one of a posting gives you a callback rate roughly <strong>17x higher than applying after day 30</strong>. A posting that has been live for three weeks has already generated most of its serious applications. Many shortlists are already formed.
            </div>
          </div>

          {/* Section 4: Ghost jobs */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Ghost Jobs: The Role Was Never Real</div>
                <div className="sec-sub">A significant share of active listings are not actively hiring</div>
              </div>
            </div>
            <p>A 2023 ResumeBuilder survey found that 1 in 3 companies admitted to posting jobs they were not actively trying to fill. These ghost listings range from roles where hiring is on hold, to pipeline-building exercises, to legal compliance postings where the hire is already decided. Applications to these roles receive no response because there is no active process to respond.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Stale listings:</strong> 43% of companies surveyed admitted to keeping listings live after the role was filled. The posting collects resumes for a future pipeline that may never be activated.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Headcount freeze listings:</strong> A role was approved before a budget cut and the posting stays live to preserve the headcount slot. No one is screening because no one has authority to hire.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Compliance postings:</strong> Immigration and labor law in the US, UK, Canada, and Australia require public advertisement before a visa sponsorship or internal promotion can proceed. The outcome is predetermined. Applications to these roles are a legal formality.</span></div>
            </div>
            <div className="callout">
              <strong>There is no way to identify a ghost listing from the outside.</strong> The job description looks identical to a real one. The posting platform shows it as active. The company's careers page features it. The only signal available to candidates is posting age: roles listed for more than 21 days have meaningfully lower response rates regardless of the reason.
            </div>
          </div>

          {/* Section 5: The referral wall */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">The Referral Wall</div>
                <div className="sec-sub">Most roles are filled before the public ever sees them</div>
              </div>
            </div>
            <p>Research from LinkedIn, Jobvite, and the Society for Human Resource Management consistently shows that internal referrals account for the majority of hires at most companies. The public job posting is often a formality after the referral pipeline has already been worked.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Referrals convert at 4x the rate of cold applications.</strong> A referred candidate bypasses the ATS entirely, receives a warm introduction to the hiring manager, and is reviewed with a prior positive signal already in place. Cold applicants start with none of that.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The hidden job market:</strong> Estimates vary, but between 30% and 50% of roles are never publicly posted. They are filled through internal movement, direct recruiter outreach, or known candidates in the team's network before a job board listing is ever created.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Early-career candidates are most disadvantaged:</strong> Referral networks take years to build. A student or recent graduate applying cold is competing against candidates who already have a connection inside the company. Without the network, the cold application is the only tool available and it is the least effective one.</span></div>
            </div>
            <div className="pull-quote">
              <p>"We filled our last four roles through referrals before the posting even got traction. We kept the posting up because HR requires it, but the process was essentially over."</p>
              <span className="pq-source">Head of Engineering, Series A fintech (anonymous interview, 2025)</span>
            </div>
          </div>

          {/* Section 6: Skills and qualification mismatch */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">Skills Mismatch and Over-Specification</div>
                <div className="sec-sub">Job descriptions that screen out qualified candidates by design</div>
              </div>
            </div>
            <p>Multiple studies show that men apply to jobs when they meet 60% of the listed requirements, while women and underrepresented groups typically apply only when they meet 100%. This is a well-documented pattern. Less discussed is the structural problem on the other side: job descriptions routinely list requirements that do not reflect what the role actually needs.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Credential inflation:</strong> Roles that did not require a degree a decade ago now list one as mandatory. This is partly hiring manager preference, partly HR default templating, and partly a volume management strategy. Requiring a degree reduces the applicant pool without improving hire quality in many cases.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Years of experience paradox:</strong> Entry-level roles frequently list "2 to 3 years of experience required." This is either a description error, a reflection of confusion about what entry-level means, or a proxy filter for something else. The effect is that qualified candidates self-select out.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Tool-specific requirements as barriers:</strong> Listing a specific tool (e.g., "Salesforce experience required") when any CRM experience would suffice eliminates qualified candidates based on a transferable skill that is listed incorrectly as a specific one.</span></div>
            </div>
            <div className="highlight">
              A Harvard Business Review analysis found that <strong>61% of job postings list requirements that are not genuinely necessary for the role</strong>, significantly reducing the applicant pool and increasing time-to-fill. The person writing the JD is rarely the person doing the hiring.
            </div>
          </div>

          {/* Section 7: Recruiter bandwidth */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">Recruiter Bandwidth and Process Breakdowns</div>
                <div className="sec-sub">The human bottleneck behind the automated one</div>
              </div>
            </div>
            <p>Even when an application passes the ATS and lands in a recruiter's reviewed pile, the process can fail at multiple human stages. Recruiting teams are consistently understaffed relative to the volume of applications they manage, and the incentives within the process do not always reward thoroughness.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Role abandonment:</strong> Internal priorities shift, budgets change, or a hiring manager leaves. The role is quietly abandoned but the posting is not taken down. Applications received after the decision to pause hiring go permanently unanswered.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Inbox management failure:</strong> Applications submitted via email rather than ATS systems are particularly vulnerable. A recruiter managing a high-volume inbox may not process applications received during a busy period, especially if the role is later filled through another channel.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>No rejection infrastructure:</strong> Many companies have no automated rejection process for candidates who do not reach the phone screen stage. The default outcome of a failed application is simply silence, not a response. This is a process choice, not a technical limitation.</span></div>
            </div>
          </div>

          {/* Section 8: Platform and algorithm issues */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">8</div>
              <div>
                <div className="sec-title">Platform Algorithms and Engagement Gaming</div>
                <div className="sec-sub">How job board incentives create false signals</div>
              </div>
            </div>
            <p>Job boards are not neutral pipes. LinkedIn, Indeed, and similar platforms surface listings based on engagement and recency signals, not the accuracy of the posting or the likelihood of a hire. This creates systematic distortions that affect which applications are even worth sending.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Refreshed duplicate listings:</strong> A role posted, taken down after 30 days, and reposted appears as new. Candidates who applied to the first posting and received no response apply again. The net effect is inflated application counts with no corresponding increase in hiring activity.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Easy Apply inflation:</strong> LinkedIn's Easy Apply feature dramatically increases application volume for any role that uses it. A role that would receive 40 carefully considered applications instead receives 400 low-effort ones. Recruiters respond by raising their threshold for engagement, making it harder for any application to stand out.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Algorithm-favoured profiles:</strong> LinkedIn's matching algorithm surfaces candidates based on profile completeness, connection proximity, and activity signals. A cold applicant with a sparse profile competes not just against other applicants but against the algorithm's own recommendations to the recruiter.</span></div>
            </div>
            <div className="callout">
              <strong>The platform's incentive is engagement, not accuracy.</strong> More postings generate more candidates. More candidates generate more employer clients. More employer clients generate more revenue. The misaligned incentive is structural and it will not self-correct.
            </div>
          </div>

          {/* Summary table */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">All 8 Reasons: Summary</div>
                <div className="sec-sub">Frequency and candidate impact at a glance</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reason</th>
                  <th>Frequency</th>
                  <th>Fixable by Candidate?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1", "ATS keyword and formatting mismatch", "pill-red", "Yes — tailor each application"],
                  ["2", "Application volume (you are one of 250+)", "pill-red", "Partially — apply earlier, apply to less-posted roles"],
                  ["3", "Poor timing (applying after day 3)", "pill-red", "Yes — apply within 24 hours of posting"],
                  ["4", "Ghost job (role not actively hiring)", "pill-amber", "No — but avoid listings over 21 days old"],
                  ["5", "Referral wall (role filled internally)", "pill-amber", "Partially — build direct outreach to bypass ATS"],
                  ["6", "Skills mismatch or over-specified JD", "pill-amber", "Partially — apply anyway if 60%+ match"],
                  ["7", "Recruiter bandwidth and process breakdown", "pill-green", "No — structural problem on company side"],
                  ["8", "Platform algorithm and engagement gaming", "pill-amber", "Partially — optimize LinkedIn profile, avoid Easy Apply only"],
                ].map(([num, reason, pillClass, fix]) => (
                  <tr key={num}>
                    <td style={{ fontWeight: 700, color: "#8B5CF6" }}>{num}</td>
                    <td>{reason}</td>
                    <td><span className={`tag-pill ${pillClass}`}>{pillClass === "pill-red" ? "Very High" : pillClass === "pill-amber" ? "High" : "Medium"}</span></td>
                    <td style={{ color: "#737373", fontSize: "12px" }}>{fix}</td>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>The research implication for how to approach the job market differently</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>If most applications fail for structural reasons unrelated to candidate quality, then optimising your resume alone is not a sufficient strategy. The research points toward a different approach:</p>
            <div className="blist">
              {[
                ["Apply within 24 hours of a posting going live", "Callback rates on day one are 17x higher than day 30. Set job alerts and move fast. The first 48 hours of a listing are when the application matters most."],
                ["Target listings under 7 days old exclusively", "A listing that has been live for 3 weeks has already generated most of its applications. Your odds are not better because fewer people see it. They are worse because those who did apply were faster than you."],
                ["Rewrite your resume for each application, not once", "ATS pass-through is a keyword matching exercise. Spend 15 minutes mirroring the exact language of the job description. This single change improves ATS pass-through by 30 to 40%."],
                ["Direct outreach bypasses the entire funnel", "Reaching a hiring manager or founder directly skips the ATS, the volume problem, and the timing decay curve in one move. A relevant, well-researched cold message to the right person has a response rate far higher than any cold application through a job board."],
                ["A low response rate is structural, not personal", "You are not being rejected. You are being filtered by a system designed to eliminate efficiently, not to find fairly. The response rate problem is real but it is a system problem, not a you problem."],
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
              <p>Studojo Outreach finds the hiring managers who are actively looking and puts you in front of them directly. No ATS, no ghost jobs, no silence.</p>
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
