import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Google Internship Report: Passing the Interviews Is Not the Offer | Studojo" },
    { name: "description", content: "At Google you can clear every technical round and still receive nothing, because no manager picked your profile out of the host matching pool. The stage nobody prepares for." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "google internship, google ASDI internship 2026, google STEP internship 2026, google internship host matching, google internship application timeline, how to get a google internship, internship at google" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/google-internship-report-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Google Internship Report: Passing the Interviews Is Not the Offer" },
    { property: "og:description", content: "Google's technical interviews are not the last gate. Host matching is, and candidates sit in that pool for weeks without ever being picked." },
    { property: "og:url", content: `${BASE_URL}/reports/google-internship-report-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-09-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Google Internship Report: Passing the Interviews Is Not the Offer | Studojo" },
    { name: "twitter:description", content: "You can pass every Google interview and still not get the internship. Host matching is the stage nobody prepares for." },
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
  const MUTED  = "#737373";
  const INK    = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const funnelChartEl = document.getElementById("funnelChart") as HTMLCanvasElement | null;
  if (funnelChartEl && !funnelChartEl.dataset.rendered) {
    funnelChartEl.dataset.rendered = "1";
    new Chart(funnelChartEl, {
      type: "doughnut",
      data: {
        labels: ["Screened out before interviews", "Interviewed, did not pass", "Passed interviews, never matched to a host", "Matched and offered"],
        datasets: [{
          data: [80.0, 12.0, 5.0, 3.0],
          backgroundColor: ["#737373", "#f59e0b", "#ef4444", "#10b981"],
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
          legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
      },
    });
  }

  const stageChartEl = document.getElementById("stageChart") as HTMLCanvasElement | null;
  if (stageChartEl && !stageChartEl.dataset.rendered) {
    stageChartEl.dataset.rendered = "1";
    new Chart(stageChartEl, {
      type: "bar",
      data: {
        labels: ["Application to first response", "Technical interview rounds", "Host matching pool", "Match to written offer"],
        datasets: [{
          label: "How long each stage runs, in weeks",
          data: [4.0, 3.0, 7.0, 1.0],
          backgroundColor: ["#f59e0b", "#8B5CF6", "#ef4444", "#10b981"],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} weeks` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 10.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #f59e0b; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #f59e0b; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #f59e0b; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }
  .callout-amber { background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #92400e; line-height: 1.6; }
  .callout-red { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #b91c1c; line-height: 1.6; }
  .callout-green { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px 22px; margin: 18px 0; font-size: 14px; font-weight: 600; color: #065f46; line-height: 1.6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }
  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }
  .tmpl { background: #faf9f6; border: 2px solid #171717; border-radius: 14px; padding: 22px 24px; margin: 22px 0; box-shadow: 3px 3px 0 #171717; overflow-x: auto; }
  .tmpl-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #737373; margin-bottom: 14px; }
  .tmpl-line { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.8; color: #171717; white-space: pre-wrap; word-break: break-word; }
  .tmpl-blank { height: 12px; }
  .tmpl-var { color: #8B5CF6; font-weight: 700; }
  @media (max-width: 640px) { .tmpl { padding: 18px 16px; } .tmpl-line { font-size: 12px; } }
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_GoogleInternshipReport2026() {
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
        "headline": "The Google Internship Report: Passing the Interviews Is Not the Offer",
        "description": "At Google you can clear every technical round and still receive nothing, because no manager picked your profile out of the host matching pool. The stage nobody prepares for.",
        "url": `${BASE_URL}/reports/google-internship-report-2026`,
        "datePublished": "2026-09-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/google-internship-report-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Google Internship Report: Passing the Interviews Is Not the Offer", "item": `${BASE_URL}/reports/google-internship-report-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · September 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>The Google Internship Report: Passing the Interviews Is Not the Offer</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Google Internship Report:<br /><em>Passing the Interviews Is Not the Offer</em>" }} />
            <p className="rpt-hero-sub">Students prepare for Google's technical rounds for months and treat clearing them as the finish line. It is not. What follows is host matching, where your profile sits in a pool and engineering managers decide whether to pick it up. Candidates who passed every interview wait weeks there and some never match at all. This is the stage worth understanding before you reach it.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Google student internships and the early-degree programme (STEP, now ASDI in India) · Engineering roles</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Company / Internships</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">September 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">June to Sept</div>
              <div className="sc-label">when Google's Summer 2027 Software Engineering Intern application windows opened and closed in India and the US. Roles fill quickly, so late applications compete for what is left</div>
              <div className="sc-source">Google Careers postings, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">6 to 8 weeks</div>
              <div className="sc-label">commonly reported length of the host matching stage, after the technical interviews are already passed</div>
              <div className="sc-source">Candidate-reported timelines, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">10 to 12 weeks</div>
              <div className="sc-label">length of the Associate Software Developer Intern programme in India, formerly STEP, Google's route for students early in their degree</div>
              <div className="sc-source">Google Careers, ASDI 2026 posting (India)</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>1</div>
              <div>
                <div className="sec-title">Host matching is the stage nobody prepares for</div>
                <div className="sec-sub">Clearing the technical rounds gets you into a pool, not into a job</div>
              </div>
            </div>
            <p>After you pass Google's technical interviews, your profile goes into a pool that engineering managers across the company can browse. Managers, referred to as hosts, look through profiles and reach out for short fit conversations, typically 15 to 30 minutes. If a host likes you and you like the project, you match, and the offer follows.</p>
            <p>The part students are rarely told: reaching host matching does not mean you have the internship. Candidates sit in the pool for weeks, and some are never picked up at all despite having cleared every technical round. There is no failure event to point at. Nothing happens, and then the season ends.</p>
            <p>This is close to the opposite of how Apple hires interns, where you apply to a specific team and commit to it before seeing the offer. At Google you are hired into a general pool and then selected out of it, which means the skill that gets you an offer at the end is different from the skill that got you through the interviews.</p>

            <div className="chart-wrap">
              <div className="chart-label">Illustrative path of 100 applicants, showing where host matching sits</div>
              <div style={{ height: 300 }}>
                <canvas id="funnelChart" />
              </div>
            </div>

            <div className="highlight">Key insight: there are two different competitions. The interviews test whether you can do the work. Host matching tests whether a specific manager wants you on their specific project.</div>

            <div className="callout-red">Because there is no rejection at this stage, there is also no signal. Silence in host matching is the normal state, not evidence that something went wrong.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>2</div>
              <div>
                <div className="sec-title">Two doors, and most students only know about one</div>
                <div className="sec-sub">The early-degree programme, long known as STEP, is the route for first and second year students</div>
              </div>
            </div>
            <p>Google runs a separate programme for students early in their degree. Long known as STEP, the Student Training in Engineering Program, it is aimed at first and second year undergraduates, runs 10 to 12 weeks, and is paid on terms similar to the standard intern package, frequently including housing assistance. In India the 2026 posting carried a new title, Associate Software Developer Intern (ASDI), while Japan still used the STEP name.</p>
            <p>The standard software engineering internship targets students further along. The distinction matters because a first-year student applying to the standard posting is competing against people two or three years ahead of them, while a programme built for their stage exists and is less obvious.</p>
            <p>You apply through Google's careers site. Search for both Associate Software Developer Intern and STEP, then filter by region. India's 2026 posting went up in mid-December 2025, and on 10 October 2026 neither title had a 2027 posting listed, so keep checking and set an alert for both. It is a genuinely different pipeline, not a lower tier of the same one.</p>

            <div className="chart-wrap">
              <div className="chart-label">How long each stage runs, in weeks</div>
              <div style={{ height: 250 }}>
                <canvas id="stageChart" />
              </div>
            </div>

            <div className="highlight">Key insight: if you are in your first or second year, applying to the standard engineering internship is the harder version of the same goal. Check for an ASDI or STEP posting first.</div>

            <div className="callout-amber">Google receives tens of thousands of applications for this programme globally and positions fill quickly. Applying in the first weeks of the window is worth more here than a marginally better resume sent weeks later.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>3</div>
              <div>
                <div className="sec-title">The calendar, and where the time actually goes</div>
                <div className="sec-sub">For Summer 2027, the first postings opened in June and July 2026</div>
              </div>
            </div>
            <p>For Summer 2027, Google posted its Software Engineering Intern roles well before autumn. The India posting went up in mid-June 2026 and asked for applications before 28 June. The US posting opened for early consideration around 20 July 2026, reopened for the regular fall cycle, and was expected to close on 25 September 2026. Postings for students in Europe, the Middle East and Africa were still listed on 10 October 2026. Start watching careers.google.com in June and apply in the first week a posting appears. Positions fill as they are matched, so a late application is competing for a shrinking set of open hosts rather than the full intake.</p>
            <p>The stage lengths are worth internalising because they explain why the process feels unresponsive. The wait from application to a first response is commonly several weeks. The interview rounds themselves move relatively quickly. Then host matching, the stage that decides the outcome, is the longest one and the one with the least communication.</p>
            <p>The consequence is practical: your Google application is not a live prospect you should be organising your search around. Apply early, then run a full search elsewhere as though it does not exist, because for six to eight weeks you will have no information either way.</p>

            <div className="highlight">Key insight: apply in the first week a posting appears, then plan your year as if you had not applied. The stage that decides it gives you nothing to respond to.</div>

            <div className="pull-quote">
              <p>&quot;Sometimes you sit in the pool for weeks without a call. Keep your recruiter updated and reiterate your interest.&quot;</p>
              <span className="pq-source">Candidate accounts of Google host matching, 2026</span>
            </div>

            <div className="callout">Broadening your location preferences genuinely helps at this stage, because it increases the number of hosts who can consider you. It is one of the few levers you still hold once you are in the pool.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">Why a referral is worth more here than almost anywhere</div>
                <div className="sec-sub">It moves you past the filter that removes most people</div>
              </div>
            </div>
            <p>A referral from a current Google employee, intern or apprentice meaningfully improves your chances of passing the resume screen. Given that the screen removes the large majority of applicants before anyone speaks to them, that is the highest-leverage single action available.</p>
            <p>The reason referrals matter more at Google than at a company hiring per team is volume. When a specific team posts a role, a hiring manager reads the applications for that role. When tens of thousands of applications arrive for a general intake, the screen is necessarily coarse, and anything that lifts a profile out of it is disproportionately valuable.</p>
            <p>Interns and apprentices can refer, which is the part students overlook. You do not need to know a senior engineer. Someone a year ahead of you who interned last summer can put your name in.</p>

            <div className="highlight">Key insight: ask people one year ahead of you, not senior engineers you have never met. Interns and apprentices can refer, and they are far more likely to say yes.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask former interns from your own university.</strong> They are findable, they remember the process, and a shared programme is a real connection rather than a cold ask.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Make the referral easy to give.</strong> Send the exact posting link, your resume, and two sentences on why that team. Nobody wants to write your pitch for you.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask before the window closes.</strong> A referral in the first weeks a posting is live is worth considerably more than the same referral months later, when most hosts have matched.</span>
              </div>
            </div>

            <div className="callout">A referral improves your odds at the screen. It does not carry you through host matching, which is decided by a manager who has never met your referrer.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>5</div>
              <div>
                <div className="sec-title">What to do while you are in the pool</div>
                <div className="sec-sub">The weeks of silence are not entirely passive</div>
              </div>
            </div>
            <p>Once you are in host matching there are three things that still move: your recruiter's awareness of you, the breadth of what you will accept, and the clarity of your profile to a manager skimming it. Everything else is out of your hands.</p>
            <p>Keep your recruiter updated and reiterate your interest periodically. This is explicitly recommended by candidates who have been through it, and it costs nothing. Widen your location preferences if you can genuinely relocate, because each additional location adds hosts who can consider you.</p>
            <p>Then treat the matching call itself as what it is: a two-way conversation. The host pitches the project and you pitch your skills. Most candidates arrive treating it as another interview to survive, when it is closer to a mutual fit conversation where showing genuine interest in that specific project is the differentiator.</p>

            <div className="highlight">Key insight: the matching call rewards specific interest in that project over polished general answers. A manager is choosing a teammate for one summer, not ranking candidates.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Message your recruiter every two to three weeks.</strong> Short, specific, not anxious. It keeps you present with the one person who can nudge your profile.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Widen locations if you honestly can.</strong> Each additional site adds hosts. This is the single most effective lever available once you are in the pool.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Prepare for a conversation, not an interrogation.</strong> The matching call is 15 to 30 minutes and runs both ways. Have two real questions about the project ready.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Keep applying elsewhere the entire time.</strong> The pool gives no signal for six to eight weeks. Treating it as a live prospect is how students lose a whole season.</span>
              </div>
            </div>

            <div className="callout-green">If the season ends without a match, it is not a verdict on your technical ability. You passed the part that measured that. It means no host had a project that fit, which is a headcount fact rather than a judgement.</div>
          </div>

          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>Prioritised action list</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item" key="Plan for host matching, not just the interviews">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Plan for host matching, not just the interviews.</strong> Clearing the technical rounds puts your profile in a pool. If no manager picks it up you receive nothing, and nothing is the most common outcome at that stage.</span>
              </div>
              <div className="blist-item" key="If you are in year one or two, check for ASDI or STEP first">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>If you are in year one or two, check for ASDI or STEP first.</strong> It is a separate 10 to 12 week programme built for your stage, paid on similar terms, and far less obvious than the standard posting.</span>
              </div>
              <div className="blist-item" key="Get a referral early, from someone a year ahead">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Get a referral early, from someone a year ahead.</strong> Interns and apprentices can refer. A referral lifts you past the resume screen, which is where the large majority of applicants are removed.</span>
              </div>
              <div className="blist-item" key="Apply the week a posting opens, then plan as if you had not">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Apply the week a posting opens, then plan as if you had not.</strong> Six to eight weeks of host matching gives you no information. Students who treat it as a live prospect stop applying elsewhere at the worst moment.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Do not let one pool decide your season.</h3>
              <p>Studojo puts you in front of hiring managers directly, at companies where a person reads your application instead of a queue.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Find Roles →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
