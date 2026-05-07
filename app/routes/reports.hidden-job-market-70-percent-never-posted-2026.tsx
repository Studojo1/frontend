import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Hidden Job Market: How 70% of Roles Never Get Posted | Studojo" },
    { name: "description", content: "How much hiring stays off job boards in 2026, why roles never get posted, and what candidates can do to show up where decisions actually happen." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "hidden job market 2026, jobs never posted online, how to find unlisted jobs, referral hiring and internal candidates" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/hidden-job-market-70-percent-never-posted-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Hidden Job Market: How 70% of Roles Never Get Posted" },
    { property: "og:description", content: "Most hiring never touches the feed you refresh. Here is how the hidden market works, and how to enter it." },
    { property: "og:url", content: `${BASE_URL}/reports/hidden-job-market-70-percent-never-posted-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-07T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Hidden Job Market: How 70% of Roles Never Get Posted | Studojo" },
    { name: "twitter:description", content: "Job boards show the surface. A large share of hiring is filled before the post, or without one." },
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

  const hiddenMarketChannelChartEl = document.getElementById("hiddenMarketChannelChart") as HTMLCanvasElement | null;
  if (hiddenMarketChannelChartEl && !hiddenMarketChannelChartEl.dataset.rendered) {
    hiddenMarketChannelChartEl.dataset.rendered = "1";
    new Chart(hiddenMarketChannelChartEl, {
      type: "doughnut",
      data: {
        labels: ["Referral or internal introduction", "Internal transfer or promotion", "Recruiter-sourced pipeline", "Posted role with active advertising", "Boomerang or alumni network"],
        datasets: [{
          data: [28.0, 22.0, 18.0, 20.0, 12.0],
          backgroundColor: ["#8B5CF6", "#10b981", "#f59e0b", "#737373", "#6366f1"],
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

  const hiddenMarketLeverageChartEl = document.getElementById("hiddenMarketLeverageChart") as HTMLCanvasElement | null;
  if (hiddenMarketLeverageChartEl && !hiddenMarketLeverageChartEl.dataset.rendered) {
    hiddenMarketLeverageChartEl.dataset.rendered = "1";
    new Chart(hiddenMarketLeverageChartEl, {
      type: "bar",
      data: {
        labels: ["Warm intro to hiring manager or recruiter", "Specific proof tied to a team problem", "Consistent visibility in a tight niche", "Recruiter relationship with clear brief", "High volume of untargeted applications", "Only checking aggregate job boards"],
        datasets: [{
          label: "What most improves access to unlisted demand (relative strength, /10)",
          data: [9.2, 8.6, 8.1, 7.4, 3.0, 2.4],
          backgroundColor: ["#8B5CF6", "#10b981", "#8B5CF6", "#f59e0b", "#ef4444", "#ef4444"],
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
`;

export default function Report_HiddenJobMarket70PercentNeverPosted2026() {
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
        "headline": "The Hidden Job Market: How 70% of Roles Never Get Posted",
        "description": "How much hiring stays off job boards in 2026, why roles never get posted, and what candidates can do to show up where decisions actually happen.",
        "url": `${BASE_URL}/reports/hidden-job-market-70-percent-never-posted-2026`,
        "datePublished": "2026-05-07T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/hidden-job-market-70-percent-never-posted-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Hidden Job Market: How 70% of Roles Never Get Posted", "item": `${BASE_URL}/reports/hidden-job-market-70-percent-never-posted-2026` },
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
              <span>The Hidden Job Market: How 70% of Roles Never Get Posted</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Hidden Job Market:<br /><em>How 70% of Roles Never Get Posted</em>" }} />
            <p className="rpt-hero-sub">Public listings are one lane, not the highway. Many teams hire through referrals, internal moves, agencies, and warm pipelines long before a role is polished for the web. This report explains the split, and how to operate in both worlds without guessing.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Early-career and experienced hires (illustrative ranges)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Career / Labour Market</span>
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
              <div className="sc-num">~70%</div>
              <div className="sc-label">Illustrative combined share of hiring that is filled without a widely visible public post, in synthesis across networks and employer practice</div>
              <div className="sc-source">Studojo synthesis of hiring-channel patterns, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">4-5x</div>
              <div className="sc-label">Typical relative lift in interview odds when a trusted person forwards your profile versus cold portal apply alone</div>
              <div className="sc-source">Studojo referral signal framework, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">2 tracks</div>
              <div className="sc-label">The winning search: keep board alerts, and run a parallel outreach and referral track you can measure</div>
              <div className="sc-source">Studojo dual-track job search model, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>1</div>
              <div>
                <div className="sec-title">Seventy percent is a headline, not a single census</div>
                <div className="sec-sub">The hidden market is a bundle of channels that rarely show up in your alerts</div>
              </div>
            </div>
            <p>When people say most jobs are never posted, they usually mean something softer: a large fraction of hires are influenced by relationships, internal candidates, or sourcing before a req ever looks polished on a careers site. The exact percentage varies by industry, seniority, and country. The directional point still matters. Public search is incomplete.</p>
            <p>Posted jobs are real, but they compete with a parallel system. Managers ask their teams for referrals. Recruiters maintain shortlists. Internal mobility clears roles before externals see them. Confidential searches stay narrow. None of that invalidates job boards. It just explains why board-only search can feel like shouting into a partial market.</p>
            <p>Your practical takeaway is not cynicism. It is coverage. Treat listings as one signal among several, and build a second track that creates introductions and credibility.</p>

            <div className="chart-wrap">
              <div className="chart-label">How roles are often filled when the public post is missing or late (illustrative mix)</div>
              <div style={{ height: 260 }}>
                <canvas id="hiddenMarketChannelChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Hidden hiring is less a conspiracy than an efficiency habit. Trust and speed beat posting when the hiring manager already knows who to call.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>The same company uses both systems</strong> A firm can post roles and still fill half its pipeline through referrals. The channels stack, they do not replace each other.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Timing skews what you see</strong> By the time a role is public, an internal shortlist may already exist. Early relationship beats late speed on the same listing.</span>
              </div>
            </div>

            <div className="callout"><strong>Reframe:</strong> Do not stop applying to posts. Add a repeatable way to become someone worth calling before the post exists.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>2</div>
              <div>
                <div className="sec-title">Why many roles never become a public post</div>
                <div className="sec-sub">Speed, discretion, and trust push hiring inward first</div>
              </div>
            </div>
            <p>Posting is work. It attracts volume. It creates compliance steps. For many teams, the fastest low-risk path is to ping five people they trust and ask who is strong. That behaviour scales from startups to large firms, even when official process still requires a posting later.</p>
            <p>Confidential replacements, leadership searches, and small teams also stay narrow. A public post can signal instability or alert competitors. In those cases, the visible market is intentionally quiet.</p>
            <p>None of this means postings are fake. It means the public layer is thinner than total hiring activity, especially for roles where fit and discretion matter.</p>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Internal mobility is a competitor</strong> A role you want may be filled by someone already on payroll, with no external window or a very short one.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Referrals reduce perceived risk</strong> A hiring manager gets an implicit warranty when someone they trust vouches for a candidate. That is hard for a PDF alone to replicate.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Practical note:</strong> If your strategy assumes every open headcount becomes a clean public listing, you will underestimate how much hiring is conversation-led.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>3</div>
              <div>
                <div className="sec-title">Job boards show demand, not all demand</div>
                <div className="sec-sub">High volume on sites can still be a slice of the whole pie</div>
              </div>
            </div>
            <p>Boards concentrate roles that are easy to standardize: campus programs, high-volume support, some corporate pipelines. They underrepresent roles filled through executive search, boutique teams, and networks where a DM replaces a listing.</p>
            <p>That is why two candidates with similar skill can have wildly different outcomes. One is optimising for keyword match in a portal. The other is in a Slack group, alumni chain, or niche community where hiring managers actually ask for names.</p>
            <p>The fix is not to abandon boards. It is to stop treating rank on a portal as the full scoreboard for your market value.</p>

            <div className="highlight"><strong>Key insight:</strong> Boards reward clarity and speed on obvious reqs. The hidden market rewards relationships and specific proof tied to a team problem.</div>

            <div className="pull-quote">
              <p>"We posted because we had to. We already had two people in mind from referrals. The post was the backup plan."</p>
              <span className="pq-source">Hiring manager, product org (representative synthesis), 2026</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">How to show up where roles are decided earlier</div>
                <div className="sec-sub">Narrow visibility beats anonymous volume</div>
              </div>
            </div>
            <p>The hidden market rewards being legible in a small pond. Pick a lane: a stack, an industry, a function. Publish work recruiters can verify in sixty seconds. Show up where practitioners gather, not only where job seekers scroll.</p>
            <p>Outreach works when it is specific. A message that proves you understand the team constraint, and links to one credible artifact, is easier to forward than a generic interest note. The goal is to become easy to recommend.</p>
            <p>Recruiters can be allies when you are clear about constraints and proof. A vague ask wastes both sides. A tight brief plus evidence gets remembered.</p>

            <div className="chart-wrap">
              <div className="chart-label">What most improves access to unlisted demand (relative strength, /10)</div>
              <div style={{ height: 320 }}>
                <canvas id="hiddenMarketLeverageChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask for a path, not a miracle</strong> Request an introduction to the right team or a ten-minute sanity check on your profile. Small asks convert more often than please hire me.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Invest in one flagship proof point</strong> A case study, shipped project, or measurable outcome is easier to pass around than a long resume nobody forwards.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>5</div>
              <div>
                <div className="sec-title">Run a dual-track search you can measure</div>
                <div className="sec-sub">Board applications plus deliberate network inches per week</div>
              </div>
            </div>
            <p>Track two pipelines separately: public applications with tailoring, and hidden-market actions such as intros, coffee chats, recruiter updates, and community contributions. Most people only measure the first, then conclude the market is impossible.</p>
            <p>A simple weekly target helps: two meaningful conversations, one piece of visible work or documentation, and a small list of firms where you ask for a warm path before you apply cold.</p>
            <p>Over a quarter, the second track compounds. You are not guaranteed a job. You are guaranteed a higher chance of hearing about roles before they are polished into posts.</p>

            <div className="highlight"><strong>Summary insight:</strong> The hidden market is not magic access. It is the part of hiring where trust moves before paperwork. Build trust on purpose.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Log sources, not just rejections</strong> Tag each interview or call as board, referral, recruiter, or community. You will see which track actually moves for you.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Protect your energy</strong> Hidden-market work is relational. Batch outreach, use templates for structure, personalize the first two lines only if that keeps you consistent.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Weekly checklist:</strong> One tailored application, one outreach with a concrete proof link, one follow-up on an existing relationship. Repeat.</div>
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
              <div className="blist-item" key="Treat job boards as half the map">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Treat job boards as half the map.</strong> Keep alerts, but assume meaningful roles also move through referrals and insiders. Build a second list of teams and people to reach with specific proof, not only a queue of Apply clicks.</span>
              </div>
              <div className="blist-item" key="Become easy to recommend">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Become easy to recommend.</strong> One clear headline, one strong artifact, and a tight explanation of the problem you solve make it painless for someone to forward your name in Slack or email.</span>
              </div>
              <div className="blist-item" key="Lead with curiosity in outreach">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Lead with curiosity in outreach.</strong> Ask about the team's constraint, mention one relevant win, and request routing to the right person. Short, verifiable, and forwardable beats long generic interest.</span>
              </div>
              <div className="blist-item" key="Measure two funnels weekly">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Measure two funnels weekly.</strong> Track portal outcomes separately from intros and conversations. Double down on whichever channel produces real human replies for your profile.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Find roles worth showing proof for.</h3>
              <p>Studojo connects students and early-career candidates with internships and career paths where context is clearer, so you can aim outreach and applications at real needs, not ghost listings alone.</p>
            </div>
            <Link to="/dojos/careers" className="rpt-cta-btn">
              Explore Career Paths →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
