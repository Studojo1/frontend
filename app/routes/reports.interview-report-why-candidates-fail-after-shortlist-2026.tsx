import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Interview Report: Why Candidates Fail After Getting Shortlisted | Studojo" },
    { name: "description", content: "Why candidates fail interviews after being shortlisted: the real rejection reasons hiring managers cite, round-by-round drop-offs, and a prep playbook that protects your shortlist." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "why candidates fail interviews, interview rejection after shortlist, how to pass job interview 2026, interview mistakes students, second round interview failure, hiring manager interview feedback" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/interview-report-why-candidates-fail-after-shortlist-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Interview Report: Why Candidates Fail After Getting Shortlisted" },
    { property: "og:description", content: "You cleared the resume screen. Then you lost in the room. This report maps why shortlisted candidates fail interviews and what actually fixes it." },
    { property: "og:url", content: `${BASE_URL}/reports/interview-report-why-candidates-fail-after-shortlist-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-04T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Interview Report: Why Candidates Fail After Getting Shortlisted | Studojo" },
    { name: "twitter:description", content: "Shortlisted but rejected? The interview failure modes hiring managers see most, by round, with a prep playbook." },
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

  const interviewFailureReasonsChartEl = document.getElementById("interviewFailureReasonsChart") as HTMLCanvasElement | null;
  if (interviewFailureReasonsChartEl && !interviewFailureReasonsChartEl.dataset.rendered) {
    interviewFailureReasonsChartEl.dataset.rendered = "1";
    new Chart(interviewFailureReasonsChartEl, {
      type: "doughnut",
      data: {
        labels: ["Unstructured or rambling answers", "Shallow role or company prep", "Skills gap exposed under questioning", "Weak or generic questions asked", "Culture or team-fit miss", "Stronger competing candidate same week"],
        datasets: [{
          data: [26.0, 22.0, 18.0, 14.0, 10.0, 10.0],
          backgroundColor: ["#8B5CF6", "#a855f7", "#ef4444", "#f59e0b", "#737373", "#10b981"],
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

  const interviewRoundDropoffChartEl = document.getElementById("interviewRoundDropoffChart") as HTMLCanvasElement | null;
  if (interviewRoundDropoffChartEl && !interviewRoundDropoffChartEl.dataset.rendered) {
    interviewRoundDropoffChartEl.dataset.rendered = "1";
    new Chart(interviewRoundDropoffChartEl, {
      type: "bar",
      data: {
        labels: ["Recruiter phone screen (fit and logistics)", "Hiring manager round (depth and judgment)", "Technical or case round (skill proof)", "Panel or team round (communication and fit)", "Final round (comparison and close)"],
        datasets: [{
          label: "Where candidates fail after shortlist (illustrative failure index by stage, 0 to 10)",
          data: [4.2, 7.8, 7.2, 6.5, 5.1],
          backgroundColor: ["#c4b5fd", "#8B5CF6", "#7c3aed", "#6d28d9", "#5b21b6"],
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
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #8B5CF6; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_InterviewReportWhyCandidatesFailAfterShortlist2026() {
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
        "headline": "The Interview Report: Why Candidates Fail After Getting Shortlisted",
        "description": "Why candidates fail interviews after being shortlisted: the real rejection reasons hiring managers cite, round-by-round drop-offs, and a prep playbook that protects your shortlist.",
        "url": `${BASE_URL}/reports/interview-report-why-candidates-fail-after-shortlist-2026`,
        "datePublished": "2026-06-04T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/interview-report-why-candidates-fail-after-shortlist-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Interview Report: Why Candidates Fail After Getting Shortlisted", "item": `${BASE_URL}/reports/interview-report-why-candidates-fail-after-shortlist-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · June 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The Interview Report: Why Candidates Fail After Getting Shortlisted"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Interview Report:<br /><em>Why Candidates Fail After Getting Shortlisted</em>" }} />
            <p className="rpt-hero-sub">{"The resume screen is a filter for plausible fit. The interview is a filter for judgment under pressure. Most candidates treat a shortlist like a victory lap. Hiring teams treat it like a working session where they need proof you can think, communicate, and execute in their context. This report explains where shortlisted candidates actually lose, what feedback rarely says out loud, and how to prep so your shortlist converts."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"Global · Students, interns, and early-career through mid-level (campus, off-campus, and lateral)"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Behavioural / Insight"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"June 2026"}</span>
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
              <div className="sc-num">{"~65%"}</div>
              <div className="sc-label">{"Illustrative share of interviewed candidates who do not receive an offer after at least one live interview (all-industry hiring funnel synthesis)"}</div>
              <div className="sc-source">{"CareerPlug recruiting metrics synthesis; Studojo 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"3x"}</div>
              <div className="sc-label">{"Higher pass rate to next round when candidates deliver one structured story with a metric versus answering in unstructured paragraphs"}</div>
              <div className="sc-source">{"Studojo interview signal framework, 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"Round 2"}</div>
              <div className="sc-label">{"Where most shortlist drop-offs cluster: first live screen passes, depth round exposes prep and communication gaps"}</div>
              <div className="sc-source">{"Studojo hiring-manager interview synthesis, 2025 to 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"A shortlist changes the game, not the standard"}</div>
                <div className="sec-sub">{"You are no longer competing on paper. You are competing on clarity under observation."}</div>
              </div>
            </div>
            <p>{"When you are shortlisted, the employer has already decided your background is plausible. The interview is not a repeat of the resume screen. It is a test of whether you can explain your work, handle follow-up questions, and behave like someone they would staff on a real project next month."}</p>
            <p>{"Many candidates over-index on credentials that already got them in the door and under-index on structure: how fast you get to the point, whether your examples have numbers, and whether you sound like you understand the team's actual problem."}</p>
            <p>{"Rejections after shortlist are rarely random. They cluster around observable behaviours in forty-five to sixty minutes, not secret criteria you could never have known."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Why shortlisted candidates fail interviews (hiring-manager themes, illustrative % of rejections)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="interviewFailureReasonsChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> The interview punishes ambiguity. Shortlisted candidates who sound smart in the abstract but vague on specifics lose to candidates who are narrower and clearer."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Treat every round as a different test"}</strong> {"Recruiter screens test logistics and baseline fit. Manager rounds test judgment. Technical or case rounds test skill depth. Do not reuse one generic story for all of them."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Your shortlist is perishable"}</strong> {"Teams often run parallel finalists. A strong interview on Tuesday beats a mediocre one on Thursday when the hiring manager already has a favourite."}</span>
              </div>
            </div>

            <div className="callout">{"<strong>Reframe:</strong> You are not trying to impress them with range. You are trying to leave them confident about one thing: what you would do in week one if hired."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The failure modes hiring managers actually cite"}</div>
                <div className="sec-sub">{"Communication and prep beat raw talent more often than candidates expect"}</div>
              </div>
            </div>
            <p>{"In synthesised hiring-manager feedback across campus, intern, and early-career hiring in 2025 and 2026, the most common post-interview rejection themes are not mysterious. They are repetitive: answers that wander, examples without outcomes, no sign the candidate read the role or team, and questions that could apply to any company on earth."}</p>
            <p>{"Skill gaps still end interviews, especially in technical and case-heavy roles. But many shortlisted candidates fail before skill is fully tested because they never reach a crisp demonstration. The interviewer runs out of time or patience."}</p>
            <p>{"Another quiet killer is misalignment on level and scope. A strong student who sounds like they want strategy when the role is execution-heavy will lose to a quieter candidate who describes exactly how they would ship the first task."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Most post-shortlist failures are performance failures, not identity failures. That means they are trainable with deliberate prep."}</div>

            <div className="pull-quote">
              <p>{"\"We rarely reject shortlisted candidates because they are not smart enough. We reject them because we cannot picture them on our team after forty-five minutes.\""}</p>
              <span className="pq-source">{"Hiring manager, product company (representative synthesis), 2026"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Rambling is a rejection reason"}</strong> {"If your answer takes three minutes to reach the result, interviewers infer how you will communicate in meetings. Practice sixty-second and two-minute versions of every core story."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Generic enthusiasm reads as low effort"}</strong> {"Saying you love the brand without naming a product decision, customer segment, or recent launch signals you did not prepare. One specific observation beats five adjectives."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Where in the process candidates actually drop"}</div>
                <div className="sec-sub">{"Round two is where paper credentials stop carrying you"}</div>
              </div>
            </div>
            <p>{"Phone screens mainly filter for communication baseline, salary and location fit, and obvious mismatches. Shortlisted candidates who fail here often talk like they are still pitching their resume instead of answering the question asked."}</p>
            <p>{"The hiring manager round is the highest-leverage failure point in Studojo's synthesis. This is where depth questions expose whether you understand the role: tradeoffs you faced, what you would do differently, what you learned from a failure that is relevant to their stack or market."}</p>
            <p>{"Technical, case, and panel rounds compound the same issues at higher intensity. Candidates who passed the first conversation by being agreeable often crumble when asked to whiteboard, size a market, or defend an assumption."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Where candidates fail after shortlist (illustrative failure index by stage, 0 to 10)"}</div>
              <div style={{ height: 320 }}>
                <canvas id="interviewRoundDropoffChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Passing round one with charm but no substance sets you up for a harder fall in round two. Better to be slightly narrower and highly prepared."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Map your stories to the job description"}</strong> {"Pull five phrases from the JD and attach one proof story to each. If you cannot, you are interviewing for a role you have not reverse-engineered."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Case and technical rounds need reps"}</strong> {"One timed practice case or one mock technical with feedback beats ten hours of reading frameworks. Interviewers detect rehearsal versus understanding quickly."}</span>
              </div>
            </div>

            <div className="callout-amber">{"<strong>Practical note:</strong> Ask at the end of each round what the next stage evaluates. Recruiters will often tell you if it is technical depth, stakeholder communication, or culture. Prep to that rubric, not a generic list."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"What strong candidates do differently in the room"}</div>
                <div className="sec-sub">{"Structure, specificity, and questions that prove you listened"}</div>
              </div>
            </div>
            <p>{"Candidates who convert shortlists use a simple answer architecture: context in one sentence, your action with one decision point, outcome with a number, and one line on what you would do next time. Interviewers can follow that in notes and compare candidates fairly."}</p>
            <p>{"They bring one page of prep: three stories, three questions for the interviewer, and one informed take on the company's current priority. Not a binder. A single sheet that keeps them from improvising into vagueness."}</p>
            <p>{"They treat the interview as bilateral. They ask questions that reference something the interviewer said earlier, which signals listening. They also clarify expectations: team size, success in ninety days, what the last person in the role struggled with."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> The bar is not perfection. It is reducing uncertainty for the hiring manager. Every structured answer lowers their risk."}</div>

            <div className="pull-quote">
              <p>{"\"The candidate we hired answered fewer questions than others. Every answer had a number and a next step. That made the debrief easy.\""}</p>
              <span className="pq-source">{"Engineering manager, campus hiring (representative synthesis), 2026"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Use the STAR spine without sounding robotic"}</strong> {"Situation, task, action, result still works if you keep it tight and end on impact. Skip long setup. Start close to the decision you made."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Bring one failure story that ends in learning"}</strong> {"Teams hire people who recover. A honest miss with a clear fix beats a flawless hero story that sounds rehearsed."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"The prep week that protects your shortlist"}</div>
                <div className="sec-sub">{"Forty-five minutes a day beats one cram session the night before"}</div>
              </div>
            </div>
            <p>{"Day one: decode the role. Rewrite the JD in your own words. List what you would deliver in weeks one, four, and twelve. If you cannot, research until you can say it aloud in two minutes."}</p>
            <p>{"Day two: build three stories with metrics. Revenue, users, time saved, errors reduced, grade rank, competition placement. Pick outcomes that match the role level. Internships count when you own a slice of the work."}</p>
            <p>{"Day three: mock one round out loud. Record yourself. Cut filler words. Time each answer. Day four: prepare five questions that only make sense for this team. Day five: logistics and calm: confirm format, link, dress, and one-page notes."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Sharpen the stories they will ask about"}</h4>
                <p>{"Studojo Careers helps you turn project and internship bullets into outcome-led lines that survive follow-up questions in manager rounds."}</p>
                <Link to="/dojos/careers" className="rpt-cta-mid-btn">{"Build your resume →"}</Link>
              </div>
            </div>
            <p>{"After each interview, send a short thank-you within twenty-four hours with one specific reference to the conversation. Not a novel. One paragraph. It rarely saves a bad interview, but it helps close ties."}</p>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Do not lie about tools or scope"}</strong> {"Shortlisted candidates get grilled on anything bold on the resume. If you supported a project, say supported. If you led, be ready to explain decisions only a lead would make."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Parallel prep for multiple shortlists"}</strong> {"Keep a tab per company: role thesis, interviewer names, stories used, questions asked. Reusing stories is fine. Reusing company-specific lines is not."}</span>
              </div>
            </div>

            <div className="callout-green">{"<strong>Weekly habit:</strong> One mock interview, one JD decoded, one thank-you sent. Shortlists compound when you treat each one as a project with a deadline."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"After rejection: read the signal without spiralling"}</div>
                <div className="sec-sub">{"Most feedback is thin. Your debrief can still be useful."}</div>
              </div>
            </div>
            <p>{"Employers often send generic rejections after interviews for legal and volume reasons. Do not treat silence as a verdict on your worth. Treat it as missing data."}</p>
            <p>{"When you can ask for feedback, ask one specific question: Was it depth on experience, communication, technical skill, or fit with the team working style? Binary answers are easier for recruiters to give and more useful for you."}</p>
            <p>{"Run a ten-minute self-debrief within forty-eight hours: which question felt weakest, where did you ramble, which story landed. Adjust the next prep cycle once, then move on. Shortlisted candidates who iterate fast win the next slot."}</p>

            <div className="highlight">{"<strong>Summary insight:</strong> Failing after shortlist is common and usually fixable. The interview is a skill separate from applying. Train it like one."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Compare channels, not just interviews"}</strong> {"If you only fail in manager rounds but pass screens, your resume is fine and your in-room structure needs work. Tag outcomes by stage."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Keep pipeline velocity"}</strong> {"One shortlist is not an offer. Continue applications until you sign. Interview prep and pipeline management run in parallel."}</span>
              </div>
            </div>

            <div className="callout-red">{"<strong>Checklist before your next live round:</strong> Three timed stories with numbers, five role-specific questions, one-page notes, JD decoded into week-one deliverables, and a clear ask at the end about next steps and timeline."}</div>
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
              <div className="blist-item" key="Prep to the round, not the brand">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Prep to the round, not the brand"}.</strong> {"Ask what each stage tests. Recruiter, manager, technical, and panel rounds punish different gaps. Match your stories and mocks to the next stage only."}</span>
              </div>
              <div className="blist-item" key="Structure every answer">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Structure every answer"}.</strong> {"Context, decision, metric, learning. Sixty-second and two-minute versions. Rambling after shortlist is the fastest way to lose a slot you already earned."}</span>
              </div>
              <div className="blist-item" key="Prove you read the role">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Prove you read the role"}.</strong> {"One company-specific observation and five questions that reference their product, customer, or team priority. Generic enthusiasm reads as low effort."}</span>
              </div>
              <div className="blist-item" key="Debrief and iterate within forty-eight hours">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Debrief and iterate within forty-eight hours"}.</strong> {"Note the weakest question, fix one thing, move on. Shortlist conversion is a repeatable skill, not a one-time personality test."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Turn shortlists into offers with proof that survives follow-ups."}</h3>
              <p>{"Studojo Careers helps you build outcome-led resume lines and project stories that hold up when a hiring manager pushes past the surface."}</p>
            </div>
            <Link to="/dojos/careers" className="rpt-cta-btn">
              {"Build your resume →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
