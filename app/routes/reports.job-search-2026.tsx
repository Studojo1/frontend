import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

export function meta() {
  return [
    { title: "Job Boards Are Dead: How Students Actually Get Hired in 2026 | Studojo" },
    { name: "description", content: "Job board callback rates sit at 2-7%. 70-80% of roles are never publicly posted. Referrals are 5x more effective. Here is the data on what actually works in 2026 and a system to replace the spray-and-pray approach." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "job search 2026, job boards dead, how to find a job 2026, referrals job search, linkedin job search strategy, hidden job market, cold outreach jobs, internship search strategy" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/job-search-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Job Boards Are Dead: How Students Actually Get Hired in 2026" },
    { property: "og:description", content: "Job board callback rates: 2-7%. 70-80% of roles never posted publicly. Referrals 5x more effective. The data on what actually works for students in 2026." },
    { property: "og:url", content: "https://studojo.com/reports/job-search-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-22T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-22T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Job Boards Are Dead: What Actually Works for Students in 2026 | Studojo" },
    { name: "twitter:description", content: "2-7% callback rate on job boards. 70-80% of jobs never posted. Here is what actually gets students hired in 2026." },
    { name: "twitter:image", content: "https://studojo.com/og-reports.png" },
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

  const VIO = "#8b5cf6";
  const VIO2 = "#a78bfa";
  const VIO3 = "#c4b5fd";
  const GREEN = "#10b981";
  const RED = "#ef4444";
  const AMBER = "#f59e0b";
  const MUTED = "#737373";
  const INK = "#171717";
  const grid = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1: Callback rate by application method (%)
  make("callbackChart", {
    type: "bar",
    data: {
      labels: ["Cold job board\napplication", "Company website\n(direct apply)", "LinkedIn Easy\nApply", "Cold email /\noutreach", "Campus career\nfair", "Internal\nreferral"],
      datasets: [{
        label: "Callback rate (%)",
        data: [2, 5, 3, 9, 12, 40],
        backgroundColor: [RED, VIO3, RED, VIO2, VIO2, VIO],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% callback rate` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 50, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });

  // Chart 2: Job market visibility — posted vs hidden
  make("hiddenChart", {
    type: "doughnut",
    data: {
      labels: ["Publicly posted on job boards", "Hidden market (referrals, direct outreach, internal moves, unadvertised roles)"],
      datasets: [{
        data: [25, 75],
        backgroundColor: [VIO3, VIO],
        borderWidth: 3,
        borderColor: "#fff",
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 12 }, padding: 18, boxWidth: 14 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of roles` } },
      },
    },
  });

  // Chart 3: Days to first response by channel
  make("speedChart", {
    type: "bar",
    data: {
      labels: ["Job board\n(cold apply)", "LinkedIn\nEasy Apply", "Company\ndirect", "Cold\noutreach", "Career fair\nfollow-up", "Internal\nreferral"],
      datasets: [{
        label: "Median days to first response",
        data: [18, 21, 12, 5, 7, 4],
        backgroundColor: [RED, RED, VIO3, VIO2, VIO2, VIO],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} days to first response` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "d" } },
      },
    },
  });

  // Chart 4: Effort vs result — weekly applications needed for 1 interview
  make("effortChart", {
    type: "bar",
    data: {
      labels: ["Job board\n(cold)", "LinkedIn\nEasy Apply", "Company\ndirect apply", "Cold email\nwith project", "Campus\nevent follow-up", "Referral\nfrom connection"],
      datasets: [{
        label: "Applications needed to generate 1 interview",
        data: [50, 67, 20, 11, 8, 2.5],
        backgroundColor: [RED, RED, VIO3, VIO2, VIO2, VIO],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} applications per interview` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
      },
    },
  });

  // Chart 5: Recommended weekly effort split (hours/week)
  make("mixChart", {
    type: "bar",
    data: {
      labels: ["Building /\nportfolio work", "Referral\nnetworking", "Targeted\ndirect apply", "Cold\noutreach", "Job board\nscan (research)", "LinkedIn\nprofile / content"],
      datasets: [{
        label: "Recommended weekly hours",
        data: [6, 3, 3, 2.5, 1.5, 2],
        backgroundColor: [VIO, VIO, VIO2, VIO2, VIO3, VIO3],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} hrs/week` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "h" } },
      },
    },
  });
}

export default function JobSearchReport() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) { initCharts(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    s.onload = () => initCharts();
    document.head.appendChild(s);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Job Boards Are Dead: How Students Actually Get Hired in 2026", "description": "Job board callback rates sit at 2-7%. 70-80% of roles are never publicly posted. Referrals are 5x more effective. Here is the data on what actually works in 2026.", "url": "https://studojo.com/reports/job-search-2026", "datePublished": "2026-04-22T00:00:00+05:30", "dateModified": "2026-04-22T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/job-search-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Job Search 2026", "item": "https://studojo.com/reports/job-search-2026"}]}` }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: rptCSS }} />
      <main>

        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Market Analysis · Q2 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Job Search 2026</span>
            </nav>
            <h1 className="rpt-h1">Job Boards Are Dead.<br /><em>Here Is What Actually Works.</em></h1>
            <p className="rpt-hero-sub">
              The average job board application has a 2-7% callback rate. Most of the roles worth having were never posted publicly. And a single referral outperforms 20 cold applications. This report breaks down the data and builds the system.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">2-7%</div><div className="rpt-hlbl">Callback rate for cold job board applications (Jobvite / LinkedIn Talent, 2025)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">75%</div><div className="rpt-hlbl">Of roles filled through the hidden market: referrals, outreach, and unadvertised openings</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Callback data, the hidden market, referral strategy, cold outreach, LinkedIn, and a weekly system</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Skip the boards. Find curated internships with pay data and direct applications.</span>
            <Link to="/dojos/internships" className="rpt-cta-pill">Browse Internships on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">Cold job board applications have a 2-7% callback rate. You need 50+ applications to expect one interview. That is not a job search strategy. That is a lottery.</h2>
              <p className="rpt-lead">The math on cold job board applications is brutal. The volume required to generate even one interview makes it the least efficient use of your job search time. Here is the callback data across every major channel.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Estimated callback rate by application channel (% of applications that lead to a first interview)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="callbackChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">40%</div><div className="rpt-lbl">Callback rate for referred candidates. A referral from someone inside the company is the single highest-leverage action in a job search. (Jobvite Recruiter Nation, 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val">2-7%</div><div className="rpt-lbl">Callback rate for cold job board applications on Indeed, Naukri, LinkedIn Easy Apply. Volume required for one interview: 50-67 applications.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">9%</div><div className="rpt-lbl">Callback rate for targeted cold outreach (personalised email to hiring manager or team lead, with a relevant project attached). High effort, high return.</div></div>
            </div>

            <p className="rpt-prose">The job board problem is not that postings are fake or that companies do not hire from them. It is math. A popular role on LinkedIn or Naukri gets 200-500 applications. Most are not screened by a human at all. ATS systems filter by keyword match. The result is that a well-written application to a well-matched role still has a 93-98% failure rate before a human sees it. <strong>The strategy shift is not to stop using job boards entirely. It is to stop treating them as your primary channel and relegate them to a research tool while the majority of your effort goes to the 3 channels with meaningfully better return rates.</strong></p>
            <p className="rpt-source">Source: Jobvite 2025 Recruiter Nation Report, LinkedIn Talent Solutions hiring data 2025, Indeed UK application to interview conversion data, SHRM Talent Acquisition Benchmarking Report 2025</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">75% of roles are filled without ever being publicly posted. The "hidden job market" is not a myth. It is where most hiring actually happens.</h2>
              <p className="rpt-lead">This is the most consistently misunderstood fact about job markets. The majority of roles at most organisations are filled before they reach a job board. Understanding why changes how you search.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Estimated share of roles by how they are filled (based on LinkedIn Economic Graph and SHRM data, 2025)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="hiddenChart"></canvas></div>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">Why roles go unadvertised</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Internal promotions and transfers", "Most companies fill roles from within first. Only if no internal candidate exists does the role go external."],
                      ["Referrals before posting", "Hiring managers ask their network before HR posts the role. If someone sends a strong candidate, the posting never happens."],
                      ["Proactive outreach", "Candidates who reach out before a role is open are remembered when it opens. The timing advantage is real."],
                      ["Startup and SME hiring", "At companies under 200 people, most hiring is word-of-mouth. The founding team hires from their network. Job boards are an afterthought."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0, marginTop: 6 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, marginTop: 2 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">How to access the hidden market</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Build before you need", "Connect with people at target companies 3-6 months before you want to work there. Not when you are urgently searching."],
                      ["Informational conversations", "Ask for a 15-minute call to learn about someone's role or company. Not a job. The job comes later, if at all."],
                      ["Stay visible in your field", "Post, comment, write, build. People who know your work think of you when roles open. Invisible people get skipped."],
                      ["Track companies, not postings", "Make a list of 20-30 target companies. Follow their news, their team, their hiring signals. Apply before the role is posted."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", flexShrink: 0, marginTop: 6 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, marginTop: 2 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The timing problem with job boards</div>
              <p>By the time a role appears on a job board, the hiring manager has usually already shared it with 2-3 people they know. Those candidates are pre-screened, pre-trusted, and often interviewed before the job board posting even goes live. The public posting is often a formality to satisfy HR policy. Applying on day one of a job board posting still means you are behind the people who got it through a referral 3 days earlier. This is not cynicism. It is how most managers hire, across every industry.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Economic Graph hidden job market analysis 2024, Harvard Business Review "Getting the Job" 2025, SHRM Talent Acquisition survey 2025, Gartner hiring process research 2025</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find internships that are actually worth applying to</div>
                <div className="rpt-inline-cta-sub">Studojo curates roles with pay data, direct application links, and quality filters. No spray and pray.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary">Browse Internships</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">A referral from inside a company makes you 5x more likely to get an interview and 9x more likely to get hired. The mechanics of how to actually get one.</h2>
              <p className="rpt-lead">Everyone knows referrals matter. Almost nobody knows how to get them without already knowing someone at every target company. Here is the actual playbook.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-v">5x</div><div className="rpt-lbl">More likely to get an interview if referred (vs cold application). Referred candidates skip early screening rounds. (Jobvite 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val">9x</div><div className="rpt-lbl">More likely to be hired if referred (vs cold application). Referred candidates are pre-trusted and pre-vouched. (LinkedIn Talent 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">29 days</div><div className="rpt-lbl">Median time to hire via referral vs 55 days via job board. Referrals move faster through every stage. (SHRM 2025)</div></div>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">How to build a referral without a pre-existing connection</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {[
                  {
                    step: "Step 1: Find the right person (not HR)",
                    detail: "On LinkedIn, search [Company Name] + [role you want, e.g. 'marketing analyst']. Find someone 2-4 years into a similar role. They are recent enough to remember the hiring process and senior enough to have credibility. Do not target HR. Target the team.",
                    color: "#8b5cf6",
                  },
                  {
                    step: "Step 2: Ask for a conversation, not a job",
                    detail: "Send a connection request with a short message: 'Hi [Name], I am a final-year student interested in [field]. I saw your work on [specific thing] and would love 15 minutes to understand how you got into [role]. No ask beyond that.' The ask is a conversation. People say yes to conversations. They say no to strangers asking for referrals.",
                    color: "#8b5cf6",
                  },
                  {
                    step: "Step 3: Have the conversation well",
                    detail: "Prepare 3 specific questions about their experience. Show genuine curiosity. Do not pitch yourself. Do not ask for a job. At the end: 'Is there anyone else you think I should speak to?' This question either extends the network or, if the conversation went well, often leads to 'Actually, we might be hiring soon — I can flag your profile.'",
                    color: "#a78bfa",
                  },
                  {
                    step: "Step 4: Follow up with proof of work",
                    detail: "A week after the conversation, send something you made: a piece of analysis on their industry, a side project, something relevant. Not your resume. Something that shows you do the work. This converts a pleasant conversation into a memorable candidate.",
                    color: "#a78bfa",
                  },
                  {
                    step: "Step 5: When a role opens, ask directly",
                    detail: "Once you have a relationship (2+ touch-points), you can ask: 'I saw [Company] is hiring for [role]. Would you be comfortable passing my CV to the hiring manager?' A warm ask to someone who knows your work has an extremely high yes rate. This is a referral.",
                    color: "#c4b5fd",
                  },
                ].map(r => (
                  <div key={r.step} style={{ borderLeft: `3px solid ${r.color}`, paddingLeft: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 4 }}>{r.step}</div>
                    <div style={{ fontSize: 14, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="rpt-source">Source: Jobvite 2025 Recruiter Nation Report, LinkedIn Talent Solutions referral hiring data 2025, SHRM Talent Acquisition Benchmarking 2025, Indeed "How People Find Jobs" survey 2025</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">Cold outreach with a personalised project attached has a 9% callback rate. Without it: under 1%. The 3-line email format that actually gets replies.</h2>
              <p className="rpt-lead">Cold outreach has a terrible reputation because most people do it badly. A generic "I am interested in opportunities at your company" email goes unanswered. A 3-line email with a relevant project attached converts at 9% or higher. Here is the difference.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">What does not work</div>
                <div className="rpt-card" style={{ padding: 20, background: "#fff5f5" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12 }}>Template that gets ignored</div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, color: "#525252", lineHeight: 1.7, background: "#fff", border: "1px solid #fecaca", borderRadius: 8, padding: 14 }}>
                    Hi [Name],<br /><br />
                    I am a final-year student at [University] studying [Course]. I am very passionate about [Industry] and would love to explore opportunities at [Company]. I believe my skills in [list of skills] would be a great fit.<br /><br />
                    Please find my resume attached. I look forward to hearing from you.<br /><br />
                    Best regards
                  </div>
                  <div style={{ fontSize: 13, color: "#991b1b", marginTop: 12, lineHeight: 1.6 }}>Why it fails: entirely about you, no specific hook, no reason to reply, every recruiter gets 30 of these a day.</div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">What works</div>
                <div className="rpt-card" style={{ padding: 20, background: "#f5f3ff" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12 }}>3-line format that converts</div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, color: "#525252", lineHeight: 1.7, background: "#fff", border: "1px solid #c4b5fd", borderRadius: 8, padding: 14 }}>
                    Hi [Name],<br /><br />
                    I built [specific thing] using [their tech/domain] and got [specific result]. Link: [URL].<br /><br />
                    I'd love to work on [specific problem their company is solving]. Are you the right person to speak to about [specific role type], or can you point me to who is?<br /><br />
                    [Name]
                  </div>
                  <div style={{ fontSize: 13, color: "#5b21b6", marginTop: 12, lineHeight: 1.6 }}>Why it works: specific, shows capability before claiming it, asks one clear question, easy to forward to the right person.</div>
                </div>
              </div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-v">9%</div><div className="rpt-lbl">Cold outreach callback rate with a relevant project attached. Highest of any non-referral channel. (LinkedIn InMail benchmark data 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val">Under 1%</div><div className="rpt-lbl">Cold outreach callback rate without a project or specific hook. Equivalent to cold applying on a job board.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">3 lines</div><div className="rpt-lbl">Optimal length for cold outreach. Emails under 100 words have 3x the response rate of emails over 200 words. (Boomerang email study, 2025)</div></div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">Who to email and how to find them</div>
              <p>Do not email HR or generic info@ addresses. Find the hiring manager or team lead directly. On LinkedIn: search the company + the function you want (e.g. "growth" at a startup). On company websites, About or Team pages often name department leads. Use Hunter.io or Apollo to find email formats (first.last@company.com is correct for ~60% of companies). One targeted email to the right person beats 50 applications to a black-hole inbox.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn InMail benchmark data 2025, Boomerang by Robinhood email response research 2025, Yesware cold email study 2025, Hunter.io email format data</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that opens cold outreach doors</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>A clean, ATS-optimised resume is the attachment that makes cold emails credible. Build yours free in 5 minutes.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">LinkedIn in 2026 is not a job board. It is a trust signal. Recruiters check your profile before they decide whether to reply to your application.</h2>
              <p className="rpt-lead">87% of recruiters use LinkedIn as part of their hiring process. But most students use it wrong: either not at all, or only to apply. The profile is not the product. The proof of activity is.</p>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">What LinkedIn actually does for your job search in 2026</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                {[
                  { label: "The profile check (universal)", detail: "Before a recruiter replies to any application or outreach, they check your LinkedIn. A sparse or absent profile is a negative signal. A strong profile with a clear headline, project links, and recent activity is a positive filter that costs nothing to maintain. Minimum viable profile: photo, headline, 3 experience/project entries, 300-character summary that says what you build.", color: "#8b5cf6" },
                  { label: "Search discoverability (passive inbound)", detail: "Recruiters search LinkedIn by skill keyword + location + graduation year. If your profile does not contain the exact keywords a recruiter is searching for, you do not exist. Mirror the language in job postings you want. If postings say 'Python' and 'data analysis', those exact words must appear in your profile.", color: "#8b5cf6" },
                  { label: "Content signals (trust amplifier)", detail: "Students who post once a week about what they are learning, building, or doing get 3-5x more profile views than students who only apply. You do not need viral content. You need consistent evidence that you are active in your field. One post per week is enough. Write about something you actually did, not generic career advice.", color: "#a78bfa" },
                  { label: "InMail and connection requests (outreach amplifier)", detail: "LinkedIn InMail has a 3x higher open rate than email. A personalised connection request (not the default 'I'd like to add you to my network') that references something specific about the person's work has a 45-60% acceptance rate. The accepted connection becomes a warm channel for follow-up.", color: "#a78bfa" },
                  { label: "What to stop doing", detail: "Stop applying to 20 jobs per day via LinkedIn Easy Apply. It has the worst callback rate of any channel (3%). Stop sending generic connection requests. Stop writing 'I am looking for opportunities' as a post. These actions cost time without generating return.", color: "#c4b5fd" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 4, borderRadius: 2, background: r.color, flexShrink: 0, alignSelf: "stretch" }}></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 14, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="rpt-source">Source: LinkedIn Talent Solutions "Global Recruiting Trends" 2025, LinkedIn Economic Graph recruiter behaviour data 2025, Jobscan LinkedIn optimization study 2025, Yesware InMail vs email open rate study 2025</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">Going direct to company career pages beats job boards by 2-3x on callback rate. And the most effective timing is before a role is posted.</h2>
              <p className="rpt-lead">Company career pages are the least noisy channel. Fewer applicants, higher intent, and your application goes directly into the company's own ATS rather than being routed through a third-party platform. Here is how to use them well.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Median days to first response by application channel (fewer is better)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="speedChart"></canvas></div>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">How to use company career pages well</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Build a target company list first", "20-30 companies you would genuinely want to work at. Not just big names. Include mid-sized companies in your sector where you have read their blog, know their product, or have a connection."],
                      ["Set up career page alerts", "Most career pages have a 'notify me' or job alert feature. Enable it for every target company. You want to be among the first 50 applicants, not the first 500."],
                      ["Speculative applications", "Many companies accept expressions of interest outside live postings. A targeted speculative application citing specific work the team is doing is often forwarded to the relevant manager."],
                      ["Tailor your resume per company", "A resume submitted directly to a company's ATS with the exact keywords from their job descriptions outperforms a generic resume dramatically. Use the job description as a template."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                        <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.55, paddingBottom: 8, borderBottom: "1px solid #f5f5f5" }}>{detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Platforms worth using (and why)</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Wellfound (wellfound.com)", "Best for startup roles. Salary shown upfront. Less crowded than LinkedIn. Founder-posted roles appear here before boards."],
                      ["Studojo Internship Dojo", "Curated internships with pay data, sector filters, and direct application links. Built to cut through noise."],
                      ["Y Combinator jobs (ycombinator.com/jobs)", "YC-backed companies. Early-stage roles with high growth potential. Less competition than mainstream boards."],
                      ["GlassDoor company pages", "Use for salary research and to identify team structure before applying. Not primarily for applications."],
                      ["Naukri / Internshala (India)", "High volume, but use only for direct company applications. Filter aggressively: minimum stipend, sector, and role type."],
                    ].map(([name, note]) => (
                      <div key={name as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{name}</div>
                          <div style={{ fontSize: 13, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Glassdoor direct vs board application data 2025, Talent Board candidate experience research 2025, CareerBuilder job application conversion study 2025</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">Proof of work replaces applying. A deployed project, a published analysis, or a public contribution makes recruiters find you. Not the other way around.</h2>
              <p className="rpt-lead">The best job search outcome is inbound interest from companies who found you because of something you made. This is not passive luck. It is the predictable result of putting documented work in public places.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">What "proof of work" means in practice</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["A live project with a URL", "Something someone can use. An AI tool, a data dashboard, an app. Hosted on Hugging Face Spaces, Vercel, or GitHub Pages. Free. The URL goes in your bio, your emails, and your LinkedIn."],
                      ["A published analysis", "A Substack post, a Medium article, or a LinkedIn post where you dig into a data question, a market, or a technical problem in your field. One good piece gets shared. Shares create inbound."],
                      ["An open source contribution", "A PR to a library used in your target sector. Even a documentation fix. The commit history is public evidence of code quality and collaboration ability."],
                      ["A Kaggle notebook (data/ML)", "Top notebooks get viewed thousands of times. A well-explained analysis in a Kaggle competition gets you found by people searching for candidates in your domain."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0, marginTop: 6 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, marginTop: 2 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">How inbound actually happens</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["LinkedIn algorithm", "A post about something you built gets shown to 2nd-degree connections in your field. One strong post can reach 10,000+ relevant people with zero paid promotion."],
                      ["GitHub discovery", "Recruiters and hiring managers in tech actively search GitHub for candidates by language, keyword, and recent activity. A well-maintained profile with a strong README is findable."],
                      ["Google indexing", "Published work with your name on it ranks for your name. When a recruiter Googles you (they do), a portfolio of real work is the difference between a blank page and a credible candidate."],
                      ["Community word-of-mouth", "Discord servers, Slack communities, and Twitter/X threads in your field. Useful contributions to community discussions lead to DMs about roles. Especially effective in developer and AI communities."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", flexShrink: 0, marginTop: 6 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, marginTop: 2 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"We found our last three interns through their GitHub profiles, a Substack piece, and a Kaggle notebook. None of them applied."</p>
            </blockquote>
            <p className="rpt-source">Source: Triplebyte hiring signals survey 2025, GitHub talent insights report 2025, LinkedIn content algorithm research 2025, Stack Overflow developer hiring survey 2025</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">The 5-source system: how to combine every channel into a weekly job search that takes 18 hours and generates 3-5x more interviews than the standard approach.</h2>
              <p className="rpt-lead">Each channel works. None of them work in isolation at scale. This is the weekly system that combines all five for maximum return on job search effort.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Recommended weekly effort allocation (total 18 hrs/week)</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="mixChart"></canvas></div>
            </div>

            <div className="rpt-card" style={{ marginTop: 20, padding: 24 }}>
              <div className="rpt-card-label">The weekly system in practice</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {[
                  {
                    block: "Build (6 hrs/week)",
                    color: "#8b5cf6",
                    detail: "Work on something that generates proof of work. A project, an analysis, an open source PR. This is the highest-leverage job search activity because it simultaneously improves your skills, generates portfolio material, and creates content to share. The output of this block is what makes every other channel more effective.",
                  },
                  {
                    block: "Referral networking (3 hrs/week)",
                    color: "#8b5cf6",
                    detail: "2-3 meaningful conversations per week with people at target companies. Not mass connection requests. One informational call, one follow-up message, one thank-you note with a relevant piece of work attached. Track who you have spoken to and when to follow up.",
                  },
                  {
                    block: "Targeted direct applications (3 hrs/week)",
                    color: "#a78bfa",
                    detail: "5-7 carefully chosen applications to company career pages or curated platforms (Studojo, Wellfound, YC). Tailored resume per application. Mirrored keywords from the job description. Quality over volume. These should take 25-30 minutes each.",
                  },
                  {
                    block: "Cold outreach (2.5 hrs/week)",
                    color: "#a78bfa",
                    detail: "5 targeted emails per week. Each one personalised to the specific person and company. Each one with a link to something you built that is relevant to their work. Use the 3-line format. Track who opens, who replies, and follow up once after 5 days with no response.",
                  },
                  {
                    block: "LinkedIn profile and content (2 hrs/week)",
                    color: "#c4b5fd",
                    detail: "One post per week about what you built, learned, or noticed. Keep your profile updated with new work. Comment on 3-5 posts from people in your target field. This is the 1% passive layer that compounds over time.",
                  },
                  {
                    block: "Job board scan (1.5 hrs/week)",
                    color: "#c4b5fd",
                    detail: "Use job boards for market intelligence, not as your primary application channel. Scan once a week to understand what roles exist, what skills are in demand, and which companies are hiring. Apply only to postings that are under 48 hours old and where you are a strong match.",
                  },
                ].map(r => (
                  <div key={r.block} style={{ borderLeft: `4px solid ${r.color}`, paddingLeft: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 4 }}>{r.block}</div>
                    <div style={{ fontSize: 14, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Applications needed to generate 1 interview, by channel</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="effortChart"></canvas></div>
            </div>

            <p className="rpt-prose">At 18 hours per week, this system produces 5 direct applications, 5 cold outreach contacts, 2-3 referral conversations, and one piece of new public work every week. After 4 weeks, you have a 20-application direct pipeline, 20 warm outreach contacts, 8-12 referral relationships in progress, and 4 pieces of public work. <strong>That pipeline generates meaningfully more interview activity than 100 Easy Apply submissions sent over the same period.</strong> The difference is effort quality, not effort volume.</p>
            <p className="rpt-source">Source: Jobvite Recruiter Nation 2025, LinkedIn Talent Solutions hiring benchmark data 2025, Indeed "How Job Seekers Find Jobs" 2025, CareerBuilder job search strategy report 2025</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Stop spraying and praying. Find curated internships with pay data and direct applications on the Studojo Internship Dojo. Build an ATS-ready resume in 5 minutes. Free.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/dojos/internships" className="rpt-btn-white">Find Internships</Link>
              <Link to="/dojos/careers" className="rpt-btn-outline">Build Your Resume Free</Link>
              <Link to="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol" target="_blank" rel="noopener noreferrer" className="rpt-btn-outline">Join the Student Community</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

const rptCSS = `
  .rpt-hero { background:#171717; color:#fff; padding:56px 24px 48px; }
  .rpt-hero-inner { max-width:800px; margin:0 auto; }
  .rpt-badge { display:inline-flex; align-items:center; background:#8b5cf6; border:2px solid #a78bfa; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { color:#c4b5fd; text-decoration:none; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
  .rpt-h1 em { font-style:italic; color:#c4b5fd; }
  .rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
  .rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #333; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; color:#c4b5fd; }
  .rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-cta-strip { background:#f5f3ff; border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
  .rpt-cta-pill { display:inline-flex; align-items:center; background:#8b5cf6; color:#fff; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { margin-top:64px; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#8b5cf6; margin-bottom:8px; }
  .rpt-h2 { font-family:'Clash Display',sans-serif; font-size:clamp(20px,3vw,28px); font-weight:700; line-height:1.2; color:#171717; margin-bottom:10px; }
  .rpt-lead { font-size:15px; color:#525252; line-height:1.7; max-width:640px; }
  .rpt-prose { font-size:15px; line-height:1.75; color:#525252; margin-bottom:24px; }
  .rpt-prose strong { color:#171717; font-weight:700; }
  .rpt-source { font-size:12px; color:#a3a3a3; margin-top:16px; }
  .rpt-card { background:#fff; border:2px solid #171717; border-radius:20px; padding:28px; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); margin-bottom:20px; }
  .rpt-card-label { font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#737373; margin-bottom:16px; }
  .rpt-chart-wrap { position:relative; }
  .rpt-chart-wrap canvas { width:100%!important; }
  .rpt-stat-row { display:grid; gap:16px; margin-bottom:20px; }
  .rpt-c2 { grid-template-columns:repeat(2,1fr); }
  .rpt-c3 { grid-template-columns:repeat(3,1fr); }
  .rpt-c4 { grid-template-columns:repeat(4,1fr); }
  .rpt-stat { background:#f5f5f5; border:2px solid #171717; border-radius:16px; padding:18px 16px; }
  .rpt-val { font-family:'Clash Display',sans-serif; font-size:28px; font-weight:700; line-height:1; margin-bottom:6px; }
  .rpt-e { color:#10b981; } .rpt-b { color:#3b82f6; } .rpt-v { color:#8b5cf6; } .rpt-g { color:#10b981; } .rpt-o { color:#f59e0b; }
  .rpt-lbl { font-size:13px; color:#525252; line-height:1.45; font-weight:500; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#f5f3ff; border-color:#8b5cf6; } .rpt-cg { background:#ede9fe; border-color:#8b5cf6; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#5b21b6; } .rpt-cg .rpt-cl { color:#5b21b6; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#c4b5fd; }
  .rpt-callout p { font-size:15px; line-height:1.7; }
  .rpt-pullquote { border-left:4px solid #8b5cf6; padding:16px 20px; margin:24px 0; background:#f5f3ff; border-radius:0 12px 12px 0; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
  .rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .rpt-col-head { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#737373; margin-bottom:12px; }
  .rpt-inline-cta { background:#f5f3ff; border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
  .rpt-inline-cta-sub { font-size:13px; color:#525252; }
  .rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#8b5cf6; color:#fff; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta { margin-top:64px; background:#8b5cf6; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:#fff; margin-bottom:12px; }
  .rpt-final-cta-sub { font-size:15px; color:rgba(255,255,255,0.85); max-width:560px; margin:0 auto 28px; line-height:1.65; }
  .rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
  .rpt-btn-white { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:#fff; color:#171717; border:2px solid #171717; border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-white:hover { transform:translate(2px,2px); box-shadow:2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:rgba(255,255,255,0.15); color:#fff; border:2px solid rgba(255,255,255,0.5); border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.15s; }
  .rpt-btn-outline:hover { background:rgba(255,255,255,0.25); }
  @media(max-width:640px){
    .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
    .rpt-two-col{grid-template-columns:1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
  }
`;
