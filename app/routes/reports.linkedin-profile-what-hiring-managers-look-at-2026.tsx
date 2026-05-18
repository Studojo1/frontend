import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The LinkedIn Profile Report: What Hiring Managers Look At | Studojo" },
    { name: "description", content: "What hiring managers actually scan on your LinkedIn profile in 2026: headline, experience, activity, and red flags. Includes copy-paste templates and a 15-minute audit checklist." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "linkedin profile tips 2026, what recruiters look at linkedin, linkedin headline examples students, linkedin about section template, optimize linkedin for hiring" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/linkedin-profile-what-hiring-managers-look-at-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The LinkedIn Profile Report: What Hiring Managers Look At" },
    { property: "og:description", content: "The 6-second LinkedIn scan: what hiring managers check first, what makes them stop, and templates you can paste today." },
    { property: "og:url", content: `${BASE_URL}/reports/linkedin-profile-what-hiring-managers-look-at-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-18T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The LinkedIn Profile Report: What Hiring Managers Look At | Studojo" },
    { name: "twitter:description", content: "LinkedIn in 2026: what hiring managers look at first, the red flags that end the scan, and headline/about templates." },
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

  const profilePriorityChartEl = document.getElementById("profilePriorityChart") as HTMLCanvasElement | null;
  if (profilePriorityChartEl && !profilePriorityChartEl.dataset.rendered) {
    profilePriorityChartEl.dataset.rendered = "1";
    new Chart(profilePriorityChartEl, {
      type: "bar",
      data: {
        labels: ["Headline states role + specialty", "Current title matches target role", "Top experience has quantified outcomes", "Photo looks professional and current", "Featured shows real work (not defaults)", "Recent activity relevant to field", "About is scannable with proof line", "Skills endorsed by credible people"],
        datasets: [{
          label: "How much each profile element influences a positive first pass (illustrative index, 0 to 10)",
          data: [9.4, 9.1, 8.8, 7.2, 7.6, 6.4, 5.8, 4.2],
          backgroundColor: ["#0A66C2", "#0A66C2", "#0A66C2", "#60a5fa", "#0A66C2", "#93c5fd", "#60a5fa", "#bfdbfe"],
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

  const profileRedFlagChartEl = document.getElementById("profileRedFlagChart") as HTMLCanvasElement | null;
  if (profileRedFlagChartEl && !profileRedFlagChartEl.dataset.rendered) {
    profileRedFlagChartEl.dataset.rendered = "1";
    new Chart(profileRedFlagChartEl, {
      type: "doughnut",
      data: {
        labels: ["Headline is generic or aspirational only", "Experience has duties, no outcomes", "Role or level mismatch vs job", "No proof (portfolio, project, writing)", "Inactive or off-brand activity", "Photo missing or low effort"],
        datasets: [{
          data: [28.0, 22.0, 20.0, 14.0, 10.0, 6.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#8B5CF6", "#737373", "#171717", "#fca5a5"],
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
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #0A66C2; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #0A66C2; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #0A66C2; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #0A66C2; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #0A66C2; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #0A66C2; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #0A66C2; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #0A66C2; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_LinkedinProfileWhatHiringManagersLookAt2026() {
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
        "headline": "The LinkedIn Profile Report: What Hiring Managers Look At",
        "description": "What hiring managers actually scan on your LinkedIn profile in 2026: headline, experience, activity, and red flags. Includes copy-paste templates and a 15-minute audit checklist.",
        "url": `${BASE_URL}/reports/linkedin-profile-what-hiring-managers-look-at-2026`,
        "datePublished": "2026-05-18T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/linkedin-profile-what-hiring-managers-look-at-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The LinkedIn Profile Report: What Hiring Managers Look At", "item": `${BASE_URL}/reports/linkedin-profile-what-hiring-managers-look-at-2026` },
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
              <span>The LinkedIn Profile Report: What Hiring Managers Look At</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The LinkedIn Profile Report:<br /><em>What Hiring Managers Look At</em>" }} />
            <p className="rpt-hero-sub">Recruiters and hiring managers do not read your whole profile. They pattern-match in seconds: role fit, proof of work, and friction signals like vague headlines or empty experience. This report turns that scan into a priority list, red-flag checklist, and copy-paste templates you can use today.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students, interns, and early-career professionals (0 to 5 years experience)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Behavioural / Insight</span>
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
              <div className="sc-num">~6 sec</div>
              <div className="sc-label">Typical time a recruiter spends on an initial profile pass before deciding to open, save, or skip</div>
              <div className="sc-source">Recruiter workflow studies, synthesised in Studojo framework, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3 layers</div>
              <div className="sc-label">What most hiring managers check in order: headline and current role, recent experience bullets, then proof (featured, activity, or mutuals)</div>
              <div className="sc-source">Studojo hiring-manager interview synthesis, 2025 to 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">40%</div>
              <div className="sc-label">Illustrative share of profiles rejected at scan stage due to headline or current-role mismatch, before anyone reads the About section</div>
              <div className="sc-source">Studojo talent-screening synthesis, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0A66C2" }}>1</div>
              <div>
                <div className="sec-title">The scan happens in layers, not pages</div>
                <div className="sec-sub">Why most profiles lose before anyone reads your About section</div>
              </div>
            </div>
            <p>Hiring managers and recruiters open LinkedIn the way they open inboxes: fast triage, not deep reading. The first pass answers three questions: Are you in the right ballpark for this role? Can I verify that in ten seconds? Is there anything that makes me nervous about referring you internally?</p>
            <p>That is why your About section rarely saves a weak headline or a mismatched current title. The scan order is remarkably consistent across industries: photo and name (trust), headline (fit), current role and company (credibility), top one or two experience entries (proof), then featured content or recent posts if they still care.</p>

            <div className="highlight"><strong>Key insight:</strong> Optimize for the scan path, not for completeness. A shorter profile with sharp proof beats a long profile that buries the signal.</div>

            <div className="chart-wrap">
              <div className="chart-label">Why profiles get skipped at scan stage (recruiter-side themes, illustrative %)</div>
              <div style={{ height: 260 }}>
                <canvas id="profileRedFlagChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Turn on "Open to work" thoughtfully.</strong> For students and interns, the visible badge can help inbound. For employed professionals targeting discreet moves, use the recruiters-only setting so you do not signal to your current team before you are ready.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Custom URL and location matter.</strong> linkedin.com/in/yourname reads as intentional. City plus open-to-remote (if true) removes a common back-and-forth in recruiter DMs.</span>
              </div>
            </div>

            <div className="callout"><strong>The practical implication:</strong> Open your profile in an incognito window or ask a friend to describe your headline and top role in one sentence. If they cannot, a hiring manager will not either.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0A66C2" }}>2</div>
              <div>
                <div className="sec-title">Headline and photo: your billboard, not your biography</div>
                <div className="sec-sub">The two fields that decide whether anyone scrolls</div>
              </div>
            </div>
            <p>The headline is not your job title repeated. It is a search string plus a value proposition: who you help, what you do, and what proof you have. Recruiters literally search keywords from requisitions. Students who write "Aspiring professional | Open to opportunities" disappear into noise.</p>
            <p>Photos do not need studio lighting. They need a clear face, neutral background, and clothes that match the industry you are targeting. Group photos, heavy filters, or cropped wedding shots create friction because the brain spends scan time decoding instead of assessing fit.</p>

            <div className="highlight"><strong>Key insight:</strong> Your headline should make sense if pasted into a Slack message: "We should look at [name], they are a ___ who ___ ."</div>

            <div className="pull-quote">
              <p>"I do not read summaries first. I read the headline and the most recent role. If those disagree with the job description, I am gone before the About section loads."</p>
              <span className="pq-source">Tech hiring manager, Series B SaaS (Studojo community interview, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Avoid title inflation.</strong> "CEO" of a one-person project or "Founder" with no shipped product reads as noise to experienced hiring managers. Use accurate titles; put ambition in the work you show.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Match the job you want, not only the job you have.</strong> If your current title is "Analyst" but you are applying for product roles, your headline can say "Product-minded analyst" and your featured section must show product work.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Headline templates (pick one structure):</strong><br /><br /><strong>Student / intern:</strong> "CS @ [University] · [Specialty: PM / Data / Design] · Built [project] ([metric]) · Seeking [role] [term/year]"<br /><br /><strong>Early career (0 to 2 years):</strong> "[Role] @ [Company] · [Skill 1] + [Skill 2] · [Outcome: shipped X, cut Y%] · Open to [target roles]"<br /><br /><strong>Career pivot:</strong> "[Target role] · Ex-[prior field] · [Proof: certification, portfolio, shipped project] · [City] / Remote"</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0A66C2" }}>3</div>
              <div>
                <div className="sec-title">Experience: outcomes beat responsibilities</div>
                <div className="sec-sub">What they read in your top two roles (and what they ignore)</div>
              </div>
            </div>
            <p>Hiring managers skim the first two experience blocks hardest. Older roles get a glance unless you are senior. Each bullet should answer: What did you do, for whom, with what result? Verbs like "assisted," "helped," and "responsible for" without numbers are the profile version of resume filler.</p>
            <p>For students, projects count as experience if you frame them like work: team size, constraint, deliverable, metric. Link the repo, deck, or case study in the description or featured section. A bullet that says "Led user research" is weaker than "Interviewed 12 users; simplified onboarding; signup completion +18% in A/B test."</p>

            <div className="highlight"><strong>Key insight:</strong> One quantified bullet at the top of each role outperforms five vague bullets. Recruiters remember numbers and nouns (tools, markets, users), not adjectives.</div>

            <div className="chart-wrap">
              <div className="chart-label">How much each profile element influences a positive first pass (illustrative index, 0 to 10)</div>
              <div style={{ height: 320 }}>
                <canvas id="profilePriorityChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Reorder bullets.</strong> Put the strongest proof first under each role. LinkedIn does not require chronological bullets within a job.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Use the description field for links.</strong> One line: "Portfolio: … | Case study: … | Repo: …" Recruiters who are still interested after bullets will click; others will not scroll for URLs buried in paragraph three.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Bullet formula (copy per role):</strong> [Strong verb] + [what you did] + [scope] + [result with number or clear before/after].<br /><br /><strong>Example:</strong> "Built churn dashboard in SQL + Looker for 3 account managers; flagged at-risk accounts 2 weeks earlier; saved ~$40K ARR in pilot quarter."<br /><br /><strong>Student example:</strong> "Shipped React + Firebase app for campus food co-op; 400+ MAU; cut order errors 30% vs paper system."</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0A66C2" }}>4</div>
              <div>
                <div className="sec-title">About, featured, and skills: proof, not poetry</div>
                <div className="sec-sub">Where interested hiring managers go after the scan passes</div>
              </div>
            </div>
            <p>The About section is not a cover letter. The best versions use short paragraphs: line one is who you are and what you want; line two is proof (projects, metrics, domains); line three is a human detail or values hook optional; line four is how to reach you or what you are open to.</p>
            <p>Featured is your showroom. Pin a deck, writing sample, GitHub readme walkthrough, or case study PDF. Default LinkedIn certificates and "I'm happy to announce" posts without substance do not count as proof. Skills matter mainly as search metadata: list tools you can defend in an interview, top five first, and prune buzzwords you cannot explain.</p>

            <div className="highlight"><strong>Key insight:</strong> Treat Featured as mandatory if you have fewer than three years of full-time experience. It is how you compensate for a thin employment history without exaggerating titles.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Recommendations: quality over quantity.</strong> One specific recommendation from a manager or client beats five generic "great team player" lines. Ask recommenders to mention a project and outcome.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Licenses and courses go last.</strong> They support credibility but rarely win the scan. Do not let a long course list push experience below the fold on mobile.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>About template (fill in brackets):</strong><br /><br />I am a [target role] focused on [domain/problem]. Recently I [strongest proof with metric].<br /><br />Background: [degree or path] + [1 to 2 tools/skills you use weekly]. I care about [specific problem in your field, one sentence].<br /><br />Open to: [roles], [locations/remote], [start window]. Best reach: [email] or message here on LinkedIn.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#0A66C2" }}>5</div>
              <div>
                <div className="sec-title">Activity and the 15-minute profile audit</div>
                <div className="sec-sub">What your last 30 days say about you when nobody asked for a resume</div>
              </div>
            </div>
            <p>Activity is a tiebreaker, not a replacement for proof. Commenting thoughtfully on posts in your target industry signals you are plugged in. Posting once a week with a lesson from a project beats daily motivation quotes. Hiring managers notice when your feed contradicts your headline (for example, only reposting memes while claiming serious finance interest).</p>
            <p>Run this audit before you apply or message anyone: (1) Headline passes the one-sentence friend test. (2) Photo is clear and current. (3) Top role and headline align with target jobs. (4) First two bullets per recent role have numbers or concrete deliverables. (5) Featured has at least one piece of work. (6) About is under 120 words and ends with what you want. (7) Last 30 days of activity would not embarrass you in front of that company's team.</p>

            <div className="highlight"><strong>Summary insight:</strong> LinkedIn is a credibility product. Hiring managers are not grading your personality. They are reducing risk that you are the wrong person, at the wrong level, with no evidence.</div>

            <div className="pull-quote">
              <p>"A strong profile does not get you the job. It stops you from getting filtered out before the conversation starts."</p>
              <span className="pq-source">Studojo career research framing, 2026</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Align with your resume, do not duplicate it.</strong> Same facts, sharper hooks on LinkedIn. Contradicting dates or titles between resume and profile is a common silent disqualifier.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Before you DM a hiring manager.</strong> They will open your profile. If the headline does not match the role you are asking about, fix the profile before you send the message.</span>
              </div>
            </div>

            <div className="callout"><strong>Quick win this week:</strong> Update headline and top three bullets only. That is where most scan decisions are made. Save banner redesigns and skill endorsements for later.</div>
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
              <div className="blist-item" key="Fix headline and top role first">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Fix headline and top role first.</strong> Use the templates in section 2. If a recruiter cannot describe you in one sentence from those fields alone, nothing else on the page will rescue you.</span>
              </div>
              <div className="blist-item" key="Add one number per recent role">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Add one number per recent role.</strong> Rewrite the top bullet under each experience entry with the verb + scope + metric pattern. Move your best bullet to the top.</span>
              </div>
              <div className="blist-item" key="Pin proof in Featured">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Pin proof in Featured.</strong> Case study, deck, repo, or writing sample. Students and career switchers should treat this as non-optional.</span>
              </div>
              <div className="blist-item" key="Run the 15-minute audit before applying">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Run the 15-minute audit before applying.</strong> Use the checklist in section 5 every time you target a new role family. Profile and resume titles and dates must match.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Turn your profile into interview-ready proof</h3>
              <p>Studojo helps you tighten headlines, bulletproof experience lines, and keep your story consistent across resume and LinkedIn before you reach out.</p>
            </div>
            <Link to="/dojos/careers" className="rpt-cta-btn">
              Build Your Career Story →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
