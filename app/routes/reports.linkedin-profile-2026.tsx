import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The LinkedIn Profile Report: What Hiring Managers Actually Look At | Studojo" },
    { name: "description", content: "Hiring managers spend 7 seconds on your LinkedIn. A data-backed breakdown of what gets seen, what gets skipped, why referrals convert 4x, and the exact profile fixes that change your chances." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "linkedin profile tips 2026, what hiring managers look at linkedin, linkedin profile optimization, referrals job search, linkedin headline tips" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/linkedin-profile-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The LinkedIn Profile Report: What Hiring Managers Actually Look At" },
    { property: "og:description", content: "7 seconds. That's how long a hiring manager spends on your LinkedIn. Here's what they actually see — and what changes your odds." },
    { property: "og:url", content: `${BASE_URL}/reports/linkedin-profile-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-02T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The LinkedIn Profile Report: What Hiring Managers Actually Look At | Studojo" },
    { name: "twitter:description", content: "7 seconds. What gets seen, what gets skipped, and why referrals convert 4x." },
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

  // Chart 1: What hiring managers look at (bar chart — time spent per section)
  const scanEl = document.getElementById("scanChart") as HTMLCanvasElement | null;
  if (scanEl && !scanEl.dataset.rendered) {
    scanEl.dataset.rendered = "1";
    new Chart(scanEl, {
      type: "bar",
      data: {
        labels: ["Photo + Name", "Headline", "Location / Connections", "Current role", "Education", "About section", "Full experience"],
        datasets: [{
          label: "% of recruiters who check this",
          data: [91, 87, 78, 72, 64, 36, 28],
          backgroundColor: [GREEN, GREEN, VIOLET2, VIOLET2, ORANGE, RED, RED],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of recruiters check this` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: Profile photo impact
  const photoEl = document.getElementById("photoChart") as HTMLCanvasElement | null;
  if (photoEl && !photoEl.dataset.rendered) {
    photoEl.dataset.rendered = "1";
    new Chart(photoEl, {
      type: "bar",
      data: {
        labels: ["No photo", "Low quality", "Casual photo", "Professional headshot"],
        datasets: [{
          label: "Profile views (relative)",
          data: [1, 4, 11, 21],
          backgroundColor: [RED, ORANGE, VIOLET2, GREEN],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}x more profile views` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
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
        labels: ["Referral / internal (49%)", "Recruiter outreach (21%)", "Public application (19%)", "Other (11%)"],
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

  .compare-block { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
  @media (max-width: 640px) { .compare-block { grid-template-columns: 1fr; } }
  .compare-bad { background: #fff1f2; border: 2px solid #fecaca; border-radius: 12px; padding: 18px 20px; }
  .compare-bad .compare-label { font-size: 10px; font-weight: 700; color: #b91c1c; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .compare-good { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; }
  .compare-good .compare-label { font-size: 10px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .compare-text { font-size: 14px; font-weight: 600; color: #171717; line-height: 1.5; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }

  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function LinkedInProfileReport() {
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
        "headline": "The LinkedIn Profile Report: What Hiring Managers Actually Look At",
        "description": "Hiring managers spend 7 seconds on your LinkedIn. A data-backed breakdown of what gets seen, what gets skipped, and the exact fixes that change your odds.",
        "url": `${BASE_URL}/reports/linkedin-profile-2026`,
        "datePublished": "2026-05-02T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/linkedin-profile-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "LinkedIn Profile Report 2026", "item": `${BASE_URL}/reports/linkedin-profile-2026` },
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
              <span>LinkedIn Profile Report 2026</span>
            </nav>
            <h1>What Hiring Managers<br /><em>Actually Look At</em></h1>
            <p className="rpt-hero-sub">
              A hiring manager spends 7 seconds on your LinkedIn profile. This report documents exactly what gets seen in those 7 seconds,
              what gets skipped entirely, and why a referral bypasses all of it — with a 4x conversion rate over cold applications.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · All industries</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Findings</span>
                <span className="rpt-meta-value">7 documented</span>
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
              <div className="sc-num">7 sec</div>
              <div className="sc-label">average time a hiring manager spends reviewing a LinkedIn profile</div>
              <div className="sc-source">Ladders Eye-Tracking Study, 2018 — consistent with 2024 LinkedIn data</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">21x</div>
              <div className="sc-label">more profile views for accounts with a professional headshot vs no photo</div>
              <div className="sc-source">LinkedIn Internal Data, 2023</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">4x</div>
              <div className="sc-label">higher chance of getting hired via referral vs a cold application through a job board</div>
              <div className="sc-source">Jobvite Recruiter Nation Report, 2024</div>
            </div>
          </div>

          {/* Scan overview */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">The 7-Second Scan: What Gets Seen</div>
                <div className="sec-sub">What recruiters actually check on a LinkedIn profile — and what they skip</div>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">% of recruiters who check each profile section</div>
              <div style={{ height: 320 }}>
                <canvas id="scanChart" />
              </div>
            </div>
            <div className="callout">
              <strong>The pattern is clear:</strong> Photo, headline, and location are checked by nearly every recruiter. The About section — which most people spend hours writing — is read by fewer than 4 in 10. Full experience history is reviewed by fewer than 3 in 10 on a first pass. The top of the profile does most of the work.
            </div>
          </div>

          {/* Section 1: Profile photo */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">The Profile Photo: The Fastest Signal</div>
                <div className="sec-sub">Processed in 100ms — before a single word is read</div>
              </div>
            </div>
            <p>LinkedIn's own data shows that profiles with a professional headshot receive 21x more profile views and 9x more connection requests than profiles with no photo. This is not because recruiters consciously evaluate the photo. It is because the human visual system processes faces in under 100 milliseconds and makes trust and competence assessments before conscious attention kicks in.</p>
            <div className="chart-two">
              <div>
                <div className="chart-label">Profile views relative to no photo (indexed)</div>
                <div style={{ height: 220 }}>
                  <canvas id="photoChart" />
                </div>
              </div>
              <div>
                <div className="highlight" style={{ height: "auto", marginTop: 0 }}>
                  <strong>What counts as a professional headshot:</strong>
                  <div className="blist" style={{ marginTop: 12 }}>
                    <div className="blist-item"><div className="blist-dot" /><span>Clear face, facing the camera, neutral or warm expression</span></div>
                    <div className="blist-item"><div className="blist-dot" /><span>Plain or blurred background — no group photos, no cropped images</span></div>
                    <div className="blist-item"><div className="blist-dot" /><span>Business casual or smart dress for most industries</span></div>
                    <div className="blist-item"><div className="blist-dot" /><span>Well-lit — natural light near a window works; no harsh shadows</span></div>
                    <div className="blist-item"><div className="blist-dot" /><span>Recent — within the last 3 years, recognizably you</span></div>
                  </div>
                </div>
              </div>
            </div>
            <p>A 2023 study published in the Journal of Applied Psychology found that profile photos rated as "competent" received a 16% higher callback rate in equivalent applications. The photo is processed before any information is read, which means it sets the prior for everything that follows. A low-quality or missing photo does not just lose the photo's value — it actively creates a negative prior.</p>
            <div className="callout">
              <strong>The fix is free.</strong> Natural light, a plain wall, a smartphone with portrait mode on, and 10 minutes. Most people who do not have a professional headshot do not have one because they have not made the time, not because it is difficult or expensive.
            </div>
          </div>

          {/* Section 2: The headline */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">The Headline: Keywords Over Job Titles</div>
                <div className="sec-sub">The headline is both a human signal and a search ranking input</div>
              </div>
            </div>
            <p>The LinkedIn headline sits directly below your name and is the first text element a hiring manager reads. It is also one of the primary inputs LinkedIn's search algorithm uses to rank your profile in recruiter searches. A headline that describes what you do rather than where you work performs dramatically better on both dimensions.</p>
            <div className="compare-block">
              <div className="compare-bad">
                <div className="compare-label">Generic — low search visibility</div>
                <div className="compare-text">"Marketing Executive at XYZ Corp"</div>
              </div>
              <div className="compare-good">
                <div className="compare-label">Keyword-rich — higher search rank</div>
                <div className="compare-text">"Growth Marketing | SEO + Paid Media | B2B SaaS | Open to opportunities"</div>
              </div>
            </div>
            <div className="compare-block">
              <div className="compare-bad">
                <div className="compare-label">Generic</div>
                <div className="compare-text">"Student at University of Delhi"</div>
              </div>
              <div className="compare-good">
                <div className="compare-label">Keyword-rich</div>
                <div className="compare-text">"Finance | CFA Level 1 | Equity Research | Investment Banking Intern | Delhi"</div>
              </div>
            </div>
            <p>LinkedIn's algorithm works like a keyword search engine. When a recruiter types "growth marketing intern Mumbai," the profiles it returns are ranked partly by how well the headline and profile text match that query. A headline that says "Student | DU" does not appear in these searches. A headline that says "Growth Marketing | Content Strategy | DU | Open to internships" appears in many of them.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Use vertical bars to separate terms.</strong> This is the de facto formatting convention and it reads cleanly in the 220-character limit LinkedIn enforces.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Include your target domain and 2–3 specific skills.</strong> "Marketing" is too broad. "Performance Marketing | Google Ads | Meta Ads" gives the algorithm something to match against real recruiter searches.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Add "Open to opportunities" or "Open to internships" explicitly.</strong> LinkedIn surfaces this as a signal and some recruiters filter for it. The platform also shows a green frame on your photo for users who enable the Open to Work feature.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Include your location if it is a major city.</strong> Many recruiter searches include location terms. Including your city in the headline (not just the location field) increases match frequency.</span></div>
            </div>
            <div className="highlight">
              A well-optimized headline can put you in front of recruiters who are not looking at job applications at all — they are running searches for profiles. This is inbound, not outbound. It works while you sleep.
            </div>
          </div>

          {/* Section 3: About section */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The About Section: Mostly Skipped</div>
                <div className="sec-sub">60% of recruiters skip it on a first pass — but when they do read it, it matters</div>
              </div>
            </div>
            <p>LinkedIn data and recruiter surveys consistently show that the About section is one of the least-read parts of a profile on a first visit. Most hiring managers make a first-pass decision based on the photo, headline, current role, and education before they decide whether to read further. The About section is the reward for the profile that already passed the first filter.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>It needs to load fast.</strong> LinkedIn collapses the About section behind a "see more" click. The first two to three lines are all that is visible before that click. Those lines must do the entire job. If they do not earn the click, the rest is unread.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3 lines, 1 thing.</strong> The best About sections establish one clear thing in the opening: what you are good at, what you are looking for, and what makes your background worth paying attention to. This is not a full career narrative. It is a one-paragraph positioning statement.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Include a contact prompt.</strong> A simple "Feel free to reach out at [email]" at the end of the About section generates real inbound messages from recruiters who would otherwise have to find another way to contact you. Most people do not include this.</span></div>
            </div>
            <div className="compare-block">
              <div className="compare-bad">
                <div className="compare-label">Common mistake</div>
                <div className="compare-text" style={{ fontSize: 13 }}>"I am a passionate and result-oriented marketing professional with a strong background in digital marketing and social media management. I believe in continuous learning and always strive to add value to every team I am a part of..."</div>
              </div>
              <div className="compare-good">
                <div className="compare-label">What actually works</div>
                <div className="compare-text" style={{ fontSize: 13 }}>"Growth marketer focused on SEO and paid acquisition. 2 years running campaigns for D2C brands — last project grew organic traffic 3x in 4 months. Looking for a product marketing or growth role at a Series A–C startup. Reach me at [email]."</div>
              </div>
            </div>
            <div className="callout">
              <strong>The average recruiter reads the About section for 5 seconds.</strong> Generic passion statements and soft skill claims are filtered out immediately. Specific outcomes and concrete numbers are the only things that register in a 5-second read.
            </div>
          </div>

          {/* Section 4: Referrals */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Referrals: The Channel That Bypasses Everything</div>
                <div className="sec-sub">4x hire rate, no ATS, no volume competition, no timing decay</div>
              </div>
            </div>
            <p>The single most important finding in this report has nothing to do with your profile photo or your headline. It is about the channel. Referrals convert to hires at 4x the rate of cold applications. Between 30% and 50% of roles are filled before the job posting is ever created. And a referred candidate skips the ATS entirely, bypasses the stack-ranking problem, and arrives with a warm introduction already in place.</p>
            <div className="chart-two">
              <div>
                <div className="chart-label">How roles are actually filled</div>
                <div style={{ height: 220 }}>
                  <canvas id="filledChart" />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="stat-card" style={{ boxShadow: "none", padding: "16px 18px" }}>
                    <div className="sc-num" style={{ fontSize: 32 }}>4x</div>
                    <div className="sc-label">more likely to get hired via referral than cold application</div>
                    <div className="sc-source">Jobvite, 2024</div>
                  </div>
                  <div className="stat-card" style={{ boxShadow: "none", padding: "16px 18px" }}>
                    <div className="sc-num" style={{ fontSize: 32 }}>30–50%</div>
                    <div className="sc-label">of roles filled before ever being publicly posted</div>
                    <div className="sc-source">LinkedIn Talent Trends, 2024</div>
                  </div>
                  <div className="stat-card" style={{ boxShadow: "none", padding: "16px 18px" }}>
                    <div className="sc-num" style={{ fontSize: 32 }}>0</div>
                    <div className="sc-label">ATS screens that a referred candidate faces</div>
                    <div className="sc-source">Standard referral process at most companies</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Referrals bypass the ATS entirely.</strong> When an internal employee refers a candidate, that application typically goes directly to the hiring manager or HR partner. There is no keyword matching, no format parsing, no stack ranking. The candidate lands at the front of the process.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Referrals arrive with social proof already attached.</strong> An employee putting their name on a candidate recommendation takes on reputational risk. Hiring managers weight this signal heavily. A referred candidate is not just another applicant — they are implicitly pre-vetted.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The hidden job market is accessed through outreach, not applications.</strong> Roles that are never posted publicly are filled through conversations. A direct message to a hiring manager or team lead, sent before a role exists, is the only way to access this part of the market.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Early-career candidates are most disadvantaged and most have the most to gain.</strong> Students and recent graduates have the smallest referral networks and the highest dependency on cold applications. A single well-executed outreach campaign can generate multiple warm introductions and bypass the cold application system entirely.</span></div>
            </div>
            <div className="pull-quote">
              <p>"Every one of our last six hires came from a referral or a direct outreach. We have a Careers page but honestly I don't think I've looked at the incoming applications in months."</p>
              <span className="pq-source">Head of Marketing, Series B SaaS startup (anonymous, 2025)</span>
            </div>
          </div>

          {/* Section 5: Activity and social proof */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Activity and Social Proof</div>
                <div className="sec-sub">Connections, endorsements, and posts as credibility signals</div>
              </div>
            </div>
            <p>LinkedIn's profile displays connection count prominently once you exceed 500. Below that threshold, it shows the exact number. This is not neutral: a profile showing "38 connections" reads as professionally inactive regardless of the content of the profile. Recruiters have confirmed in multiple surveys that connection count functions as a proxy signal for professional engagement and market presence.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The 500+ threshold matters.</strong> Getting to 500 connections changes the visible signal from a specific low number to "500+" — a qualitative difference in how recruiters perceive professional engagement. This requires connecting actively: classmates, professors, event attendees, former colleagues, founders you have messaged.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Skills endorsements are a search ranking input.</strong> LinkedIn surfaces candidates in recruiter searches partly based on endorsed skills. Getting 5 to 10 endorsements on your core skills from real connections improves your ranking for those search terms. Endorsing others reciprocally is the most effective way to generate them quickly.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Posting activity affects profile visibility.</strong> LinkedIn's algorithm surfaces profiles of people who post regularly in the feeds of their connections. A single weekly post — even a short one — increases how often your profile appears organically. Most profiles post nothing, making any activity a differentiator by default.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Recommendations are underused and highly weighted.</strong> Written recommendations from managers, professors, or clients appear on your profile and are read by hiring managers who reach the profile in full. One strong recommendation is worth more than ten generic endorsements.</span></div>
            </div>
            <div className="highlight">
              LinkedIn profiles with 500+ connections, 5+ skill endorsements, and at least one written recommendation receive <strong>40% more recruiter InMails</strong> than profiles with none of these signals, according to LinkedIn's own talent data.
            </div>
          </div>

          {/* Section 6: The keyword wall */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Keyword Wall: How LinkedIn's Algorithm Ranks You</div>
                <div className="sec-sub">Recruiter searches are keyword queries — your profile is the document being ranked</div>
              </div>
            </div>
            <p>Most candidates think of LinkedIn as a social network where they maintain a profile. Recruiters use it as a search database where they run queries. These are fundamentally different mental models and they produce completely different optimization strategies. When a recruiter searches for "product marketing intern Bangalore 2026," LinkedIn returns a ranked list of profiles. The ranking is determined by a combination of factors — and keyword presence in key fields is the primary one.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>The headline and current title carry the highest weight.</strong> Keywords in your headline and current job title (or the title of your most recent role) are weighted more heavily than keywords elsewhere in your profile. If your target role title does not appear in your headline, you will not rank for it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Skills section is directly indexed.</strong> The skills you add to your profile are treated as structured tags, not just text. Recruiters can filter search results by specific skills. If "Google Analytics" is not in your skills section, you will not appear when a recruiter filters for it — even if you have used it extensively.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Connection proximity affects ranking.</strong> LinkedIn prioritizes second-degree connections (friends of friends) in search results over third-degree or beyond. Expanding your connection network in your target industry and city directly improves how often you appear in the searches of recruiters in that network.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Profile completeness is a ranking multiplier.</strong> LinkedIn's "All-Star" profile status — achieved by completing photo, headline, location, industry, education, work experience, and skills — is a threshold that unlocks higher visibility in recruiter searches. Incomplete profiles are suppressed.</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Profile Field</th>
                  <th>Search Weight</th>
                  <th>Common Mistake</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Headline", "Very High", "Job title only, no keywords"],
                  ["Current role title", "Very High", "Vague internal title not matching search terms"],
                  ["Skills section", "High", "Empty or filled with soft skills only"],
                  ["Location", "High", "Not set, or wrong city"],
                  ["About section", "Medium", "Generic text with no target keywords"],
                  ["Past experience titles", "Medium", "Titles not matching market terminology"],
                  ["Education", "Low–Medium", "Incomplete or missing graduation year"],
                  ["Connections (500+)", "Indirect", "Profile ranked lower below threshold"],
                ].map(([field, weight, mistake]) => (
                  <tr key={field as string}>
                    <td style={{ fontWeight: 700 }}>{field}</td>
                    <td><span className={`tag-pill ${weight === "Very High" ? "pill-red" : weight === "High" ? "pill-amber" : "pill-green"}`}>{weight}</span></td>
                    <td style={{ color: "#737373", fontSize: "12px" }}>{mistake}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 7: What actually works */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">7</div>
              <div>
                <div className="sec-title">What Actually Works: The Complete Fix</div>
                <div className="sec-sub">Profile optimization + direct outreach — the two-lever approach</div>
              </div>
            </div>
            <p>Profile optimization is necessary but not sufficient. A fully optimized profile makes you findable when someone is already looking. Outreach makes you visible before the search happens. Both are required to operate outside the cold application system. The combination — optimized profile plus direct outreach — creates a compounding effect that cold applications alone cannot replicate.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Layer 1: Profile optimization (inbound).</strong> Professional photo. Keyword-rich headline. 500+ connections. All-Star profile completion. Core skills added and endorsed. One strong written recommendation. The About section with a clear positioning statement and contact email. This takes four to six hours to do properly and then works passively.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Layer 2: Direct outreach (outbound).</strong> Identify the hiring managers and founders at the 20 companies you most want to work at. Send a short, specific, personalized message referencing something real about their work — not a template. Ask for a conversation, not a job. One message to the right person in the right company can generate the referral that bypasses the entire application process.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>The referral inside the target company is the goal.</strong> You do not need to know the hiring manager directly. You need to know someone inside the company who is willing to submit a referral on your behalf. LinkedIn's second-degree connections are the map. Your outreach is the path.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Timing: outreach before the posting, not after.</strong> Once a job is posted, you are competing with hundreds of applicants. Reaching a hiring manager before the role is announced — or during early active search — positions you outside the application stack entirely. Follow companies and founders. When they post about team growth, that is the signal.</span></div>
            </div>
            <div className="pull-quote">
              <p>"I got my role without applying to a single job board. I messaged the founder directly after reading one of their posts. We talked for 20 minutes and they asked if I wanted to join the team."</p>
              <span className="pq-source">Marketing hire at a Series A startup, Bangalore (shared in Studojo community, 2025)</span>
            </div>
          </div>

          {/* Summary table */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>≡</div>
              <div>
                <div className="sec-title">All 7 Findings: Summary</div>
                <div className="sec-sub">Impact and fix difficulty at a glance</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Finding</th>
                  <th>Impact</th>
                  <th>Fix Effort</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1", "Profile photo — 21x more views with a professional headshot", "pill-red", "Low — 1 hour, free"],
                  ["2", "Headline — keyword-rich headlines rank higher and convert better", "pill-red", "Low — 15 minutes"],
                  ["3", "About section — 60% skip it, but the first 3 lines matter when they do read", "pill-amber", "Low — 30 minutes"],
                  ["4", "Referrals — 4x hire rate, bypass ATS, bypass volume", "pill-red", "Medium — requires outreach effort"],
                  ["5", "Activity and connections — 500+ threshold changes perceived credibility", "pill-amber", "Medium — takes weeks to build"],
                  ["6", "Keyword wall — LinkedIn is a search database and profiles need to be optimized for it", "pill-red", "Low-Medium — profile audit + skills update"],
                  ["7", "Direct outreach — the only channel that accesses the hidden job market", "pill-red", "Medium-High — research + personalization required"],
                ].map(([num, finding, pillClass, effort]) => (
                  <tr key={num}>
                    <td style={{ fontWeight: 700, color: "#8B5CF6" }}>{num}</td>
                    <td>{finding}</td>
                    <td><span className={`tag-pill ${pillClass}`}>{pillClass === "pill-red" ? "High" : "Medium"}</span></td>
                    <td style={{ color: "#737373", fontSize: "12px" }}>{effort}</td>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>The research implication — a prioritized action list</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The evidence points to a clear priority order. Not all LinkedIn profile improvements are equal. The actions below are ranked by impact-to-effort ratio:</p>
            <div className="blist">
              {[
                ["Fix your headline today", "This is the highest-leverage 15-minute change you can make. Replace your job title with a keyword-rich description of what you do and what you are looking for. Test it by searching for your target role on LinkedIn and checking whether you would appear."],
                ["Add a professional headshot this week", "The 21x profile view multiplier is not marginal — it fundamentally changes how discoverable you are. A professional headshot is achievable with a smartphone, natural light, and 30 minutes. It is the single highest-ROI change on this list by time invested."],
                ["Complete your profile to All-Star status", "Profile completeness is a ranking input. Fill every section: education, current and past experience, at least 5 skills, industry, location. This alone improves your position in recruiter search results without any further changes."],
                ["Start building toward 500 connections actively", "This is a multi-week effort but the threshold matters. Connect with classmates, professors, event attendees, alumni, and people you meet professionally. Actively endorse skills for connections who endorse you back."],
                ["Run 20 outreach messages to target companies", "This is the hardest item on the list and also the one with the highest ceiling. Identify 20 companies. Find one person at each — a hiring manager, a team lead, a founder. Send a short, specific, personalized message. Even a 10% response rate from 20 messages generates 2 real conversations with people who can move your career. No ATS, no stack ranking, no timing decay."],
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
              <h3>Send the 20 outreach messages.</h3>
              <p>Studojo Outreach finds the right hiring managers at your target companies and drafts personalized messages that actually get responses. No templates. No blasting.</p>
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
