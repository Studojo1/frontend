import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Why 80% of Applications Get No Response | Studojo" },
    { name: "description", content: "A practical 2026 report on why most job applications get no response: hiring funnels, ATS filters, recruiter capacity, timing, and how candidates can improve reply odds." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "why job applications get no response, application silence 2026, how to get replies from job applications, ats filters and recruiter screening" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/why-80-percent-applications-get-no-response-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Why 80% of Applications Get No Response" },
    { property: "og:description", content: "Why most applications disappear into silence, and what candidates can do about it." },
    { property: "og:url", content: `${BASE_URL}/reports/why-80-percent-applications-get-no-response-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-07T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Why 80% of Applications Get No Response | Studojo" },
    { name: "twitter:description", content: "Most applications do not fail in an interview. They fail before a human has time to care." },
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
  const ORANGE = "#f59e0b";
  const RED    = "#ef4444";
  const GREEN  = "#10b981";
  const MUTED  = "#737373";
  const INK    = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const noResponseFunnelChartEl = document.getElementById("noResponseFunnelChart") as HTMLCanvasElement | null;
  if (noResponseFunnelChartEl && !noResponseFunnelChartEl.dataset.rendered) {
    noResponseFunnelChartEl.dataset.rendered = "1";
    new Chart(noResponseFunnelChartEl, {
      type: "doughnut",
      data: {
        labels: ["Auto-triage and knockout requirements", "Recruiter shortlist capacity", "Role timing, pause, or internal candidate", "Hiring manager priority shift", "Interview stage"],
        datasets: [{
          data: [35.0, 30.0, 20.0, 10.0, 5.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#8B5CF6", "#737373", "#10b981"],
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

  const replyTriggerChartEl = document.getElementById("replyTriggerChart") as HTMLCanvasElement | null;
  if (replyTriggerChartEl && !replyTriggerChartEl.dataset.rendered) {
    replyTriggerChartEl.dataset.rendered = "1";
    new Chart(replyTriggerChartEl, {
      type: "bar",
      data: {
        labels: ["Tailored proof tied to the role", "Referral or warm context", "Clear must-have match", "Early application timing", "Generic resume + cover letter", "Easy Apply only"],
        datasets: [{
          label: "What increases reply odds most (relative strength, /10)",
          data: [9.4, 8.8, 8.5, 7.6, 3.2, 2.8],
          backgroundColor: ["#10b981", "#10b981", "#f59e0b", "#f59e0b", "#ef4444", "#ef4444"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10` } },
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
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_Why80PercentApplicationsGetNoResponse2026() {
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
        "headline": "Why 80% of Applications Get No Response",
        "description": "A practical 2026 report on why most job applications get no response: hiring funnels, ATS filters, recruiter capacity, timing, and how candidates can improve reply odds.",
        "url": `${BASE_URL}/reports/why-80-percent-applications-get-no-response-2026`,
        "datePublished": "2026-05-07T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/why-80-percent-applications-get-no-response-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Why 80% of Applications Get No Response", "item": `${BASE_URL}/reports/why-80-percent-applications-get-no-response-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · May 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Why 80% of Applications Get No Response</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Why 80% of Applications<br /><em>Get No Response</em>" }} />
            <p className="rpt-hero-sub">Application silence is not random. In high-volume hiring, most candidates are filtered by timing, baseline requirements, weak proof, or recruiter capacity before a reply is ever sent. This report explains the funnel, and how to apply in a way that earns human attention.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students + early-career candidates</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Career / Hiring Funnel</span>
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
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">80%</div>
              <div className="sc-label">Common candidate shorthand for applications that never receive a useful reply in high-volume funnels</div>
              <div className="sc-source">Studojo synthesis of application funnel patterns, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">10 sec</div>
              <div className="sc-label">Typical first-pass scan window for deciding whether an application deserves deeper review</div>
              <div className="sc-source">Studojo hiring workflow synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3 signals</div>
              <div className="sc-label">The minimum reply triggers: role-fit proof, timing, and a low-risk reason to shortlist</div>
              <div className="sc-source">Studojo candidate response framework, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>1</div>
              <div>
                <div className="sec-title">No response usually means you never entered the real decision set</div>
                <div className="sec-sub">Most applications are sorted before anyone debates your potential</div>
              </div>
            </div>
            <p>Candidates experience silence as rejection. Hiring teams experience it as funnel management. A role may receive more applications than the team can meaningfully review, so the process becomes a sequence of filters: eligibility, location, work authorization, must-have skills, salary range, resume clarity, and timing.</p>
            <p>This means many applications are not losing because the candidate is bad. They are losing because the application never creates enough reason to move from pile to shortlist. The painful part is that most systems do not send personalized closure at that stage.</p>

            <div className="chart-wrap">
              <div className="chart-label">Where applications usually disappear in high-volume funnels</div>
              <div style={{ height: 250 }}>
                <canvas id="noResponseFunnelChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Silence is often a signal problem, not a talent verdict. Your application has to make the shortlist reason obvious fast.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>The first gate is not persuasion</strong> It is exclusion. If a requirement is unclear, missing, or buried, reviewers often move on instead of investigating.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>The second gate is comparison</strong> A qualified candidate can still lose if another candidate makes the same fit easier to see.</span>
              </div>
            </div>

            <div className="callout"><strong>The practical implication:</strong> Stop optimizing for volume alone. A smaller batch of role-specific applications with proof usually beats a larger batch of generic submissions.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>2</div>
              <div>
                <div className="sec-title">Automated triage removes unclear applications first</div>
                <div className="sec-sub">ATS filters are blunt, but the bigger issue is weak matching evidence</div>
              </div>
            </div>
            <p>Applicant tracking systems do not usually decide who gets hired. They help teams organize, parse, search, and rank applications. The damage happens when a resume is hard to parse, misses obvious must-have terms, or describes experience in language that does not match the role.</p>
            <p>For early-career candidates, the risk is often translation. You may have the right project or coursework, but if it is named generically, placed too low, or described without tools and outcomes, it will not look like a match during a fast search or scan.</p>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Use the job's language</strong> If the role says SQL dashboards, do not hide the work under analytics project. Use the terms a recruiter or ATS will search.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Make proof parseable</strong> Simple headings, plain bullet structure, dates, tools, and links beat decorative formats that look good but scan poorly.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Quick fix:</strong> For each job, copy the 5-7 core requirements into a checklist. Your resume should show credible proof for the top 3 before the reviewer reaches the middle of the page.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>3</div>
              <div>
                <div className="sec-title">Recruiters do not reply to every qualified person</div>
                <div className="sec-sub">Capacity and timing decide more outcomes than candidates realize</div>
              </div>
            </div>
            <p>Even after automated triage, recruiters often have more plausible candidates than interview slots. They build a workable shortlist, not a complete ranking of everyone who could do the job. Once that shortlist is strong enough, later or less obvious applications may never receive detailed attention.</p>
            <p>Timing also creates silence. A role may be paused, filled internally, shifted to a referral candidate, changed by the hiring manager, or left open while budget is reapproved. From the outside, all of those situations look the same: no response.</p>

            <div className="highlight"><strong>Key insight:</strong> A good application sent late to a crowded funnel can behave like a weak application. Speed and context matter.</div>

            <div className="pull-quote">
              <p>"I am not trying to ignore candidates. I am trying to find 6-8 people the hiring manager will actually interview before the role changes again."</p>
              <span className="pq-source">Recruiter, high-volume hiring team (representative synthesis), 2026</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>4</div>
              <div>
                <div className="sec-title">Generic applications fail because they create no reply trigger</div>
                <div className="sec-sub">A reply happens when the reviewer can see a specific reason to continue</div>
              </div>
            </div>
            <p>Most applications say some version of the same thing: motivated, quick learner, interested in the company, familiar with common tools. None of that is wrong, but it does not create urgency. A reviewer needs a concrete reason to spend time on you instead of the next candidate.</p>
            <p>The strongest reply triggers are specific: a project that mirrors the job, a metric that proves impact, a referral that adds trust, a portfolio artifact that reduces uncertainty, or a short note that explains why your background fits the current problem.</p>

            <div className="chart-wrap">
              <div className="chart-label">What increases reply odds most (relative strength, /10)</div>
              <div style={{ height: 320 }}>
                <canvas id="replyTriggerChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Replace interest with evidence</strong> Do not only say you are excited about product marketing, data analysis, or software engineering. Show the campaign, analysis, or shipped feature.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Aim for one memorable reason</strong> A recruiter may not remember your full profile. They should remember the one reason you belong in the shortlist.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>5</div>
              <div>
                <div className="sec-title">The fix is to apply like a low-risk shortlist candidate</div>
                <div className="sec-sub">Make your fit easy to verify, then add context outside the portal</div>
              </div>
            </div>
            <p>You cannot control every part of the funnel. You can control whether your application is easy to understand, easy to match, and easy to trust. That means tailoring the top third of your resume, leading with relevant proof, using the role's keywords naturally, and linking to the best supporting artifact.</p>
            <p>For competitive roles, the application portal should not be your only move. A concise message to a recruiter, alumni contact, hiring manager, or team member can add context that the portal cannot capture. The message should not ask for a favor first. It should make the fit obvious and easy to forward.</p>

            <div className="highlight"><strong>Summary insight:</strong> The goal is not to be the best applicant in theory. The goal is to become the easiest credible yes in a crowded, time-limited funnel.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Apply early</strong> Set alerts and prioritize roles posted in the last few days. Early applicants enter before the shortlist hardens.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Customize the top third</strong> Change the summary, first project, and top skills for the role. Most of the response lift comes from the first visible section.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Follow up with proof</strong> A short message plus a portfolio, case study, GitHub repo, or relevant project can turn a cold application into a warm review.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Outreach formula:</strong> One sentence on the role, one sentence on your strongest matching proof, one link if useful, and one clear ask: “Is this the right team to send this to?”</div>
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
              <div className="blist-item" key="Audit your applications for reply triggers">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Audit your applications for reply triggers.</strong> Before submitting, identify the one specific reason a recruiter should reply. If you cannot name it, rewrite the resume top-third or add a stronger project proof point.</span>
              </div>
              <div className="blist-item" key="Build a 10-role priority list">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Build a 10-role priority list.</strong> Apply deeply to fewer roles where your proof genuinely matches. Track posting date, must-have requirements, referral path, and follow-up status.</span>
              </div>
              <div className="blist-item" key="Use outreach to add context">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Use outreach to add context.</strong> After applying, send a concise message that connects your strongest evidence to the team's problem. Keep it easy to forward and do not ask for a long call first.</span>
              </div>
              <div className="blist-item" key="Measure signal, not just submissions">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Measure signal, not just submissions.</strong> Track response rate by application type: generic, tailored, referral, and tailored plus outreach. Double down on the channel that creates replies.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Apply where your proof matches the role.</h3>
              <p>Explore Studojo opportunities and career pathways built around clearer expectations, stronger role context, and work that helps you show evidence, not just interest.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Browse Real Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
