import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Tier 2 College to Top Company: The Real Conversion Rate | Studojo" },
    { name: "description", content: "A 2026 report on realistic conversion from Tier 2 colleges to top-tier companies: how campus funnels work, what off-campus paths change, and how to interpret placement stats honestly." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "tier 2 college to top company, placement conversion rate 2026, off campus placement tier 2, how to get into faang from tier 2 college" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/tier-2-college-to-top-company-conversion-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Tier 2 College to Top Company: The Real Conversion Rate" },
    { property: "og:description", content: "The real conversion rate from Tier 2 to top companies: funnels, paths, and what actually moves outcomes." },
    { property: "og:url", content: `${BASE_URL}/reports/tier-2-college-to-top-company-conversion-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-07T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Tier 2 College to Top Company: The Real Conversion Rate | Studojo" },
    { name: "twitter:description", content: "Tier 2 to top company is rarely one number. Here is the funnel that decides who converts." },
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

  const tier2PathwayMixChartEl = document.getElementById("tier2PathwayMixChart") as HTMLCanvasElement | null;
  if (tier2PathwayMixChartEl && !tier2PathwayMixChartEl.dataset.rendered) {
    tier2PathwayMixChartEl.dataset.rendered = "1";
    new Chart(tier2PathwayMixChartEl, {
      type: "doughnut",
      data: {
        labels: ["Internship converted to return offer", "Referral or warm introduction path", "Direct off-campus with strong proof", "Campus day slot (limited intake)"],
        datasets: [{
          data: [38.0, 27.0, 22.0, 13.0],
          backgroundColor: ["#8B5CF6", "#10b981", "#f59e0b", "#737373"],
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

  const conversionLiftChartEl = document.getElementById("conversionLiftChart") as HTMLCanvasElement | null;
  if (conversionLiftChartEl && !conversionLiftChartEl.dataset.rendered) {
    conversionLiftChartEl.dataset.rendered = "1";
    new Chart(conversionLiftChartEl, {
      type: "bar",
      data: {
        labels: ["Target-company internship or equivalent", "Credible referral into the funnel", "Public proof (repo, portfolio, case wins)", "Competitive skill screen performance", "Role-tailored resume and outreach", "High volume, low tailoring"],
        datasets: [{
          label: "What most shifts interview odds for Tier 2 candidates (relative strength, /10)",
          data: [9.3, 8.7, 8.4, 8.0, 7.2, 2.6],
          backgroundColor: ["#8B5CF6", "#10b981", "#8B5CF6", "#f59e0b", "#f59e0b", "#ef4444"],
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

export default function Report_Tier2CollegeToTopCompanyConversion2026() {
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
        "headline": "Tier 2 College to Top Company: The Real Conversion Rate",
        "description": "A 2026 report on realistic conversion from Tier 2 colleges to top-tier companies: how campus funnels work, what off-campus paths change, and how to interpret placement stats honestly.",
        "url": `${BASE_URL}/reports/tier-2-college-to-top-company-conversion-2026`,
        "datePublished": "2026-05-07T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/tier-2-college-to-top-company-conversion-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Tier 2 College to Top Company: The Real Conversion Rate", "item": `${BASE_URL}/reports/tier-2-college-to-top-company-conversion-2026` },
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
              <span>Tier 2 College to Top Company: The Real Conversion Rate</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Tier 2 College to Top Company:<br /><em>The Real Conversion Rate</em>" }} />
            <p className="rpt-hero-sub">Social feeds love a single dramatic percentage. Hiring reality is a funnel: eligibility, shortlists, interviews, and competing paths like internships and referrals. This report separates cohort stories from applicant math, so you can plan with clearer expectations.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">India · Tech and general early-career hiring (illustrative ranges)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Colleges / Hiring Funnel</span>
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
              <div className="sc-num">~0.5–3%</div>
              <div className="sc-label">Illustrative full-cohort share who land a top-tier offer in the same cycle, when “conversion” means everyone enrolled</div>
              <div className="sc-source">Studojo synthesis of campus funnel patterns, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">5–15x</div>
              <div className="sc-label">Typical relative lift when comparing serious off-campus applicants with proof versus a generic blast of applications</div>
              <div className="sc-source">Studojo hiring signal framework, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3 paths</div>
              <div className="sc-label">Most Tier 2 hires at elite employers cluster around internship return offers, referral-assisted pipelines, or proven skill tournaments</div>
              <div className="sc-source">Studojo pathway map, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>1</div>
              <div>
                <div className="sec-title">Conversion rate is meaningless until you define the denominator</div>
                <div className="sec-sub">Cohort placement, applicant pool, and interview-stage math are three different stories</div>
              </div>
            </div>
            <p>When people argue about the Tier 2 to top company conversion rate, they often accidentally compare unlike things. A placement cell may quote a percentage of students who received any offer. A student may quote applications to replies. A creator may imply that everyone who tries has the same odds.</p>
            <p>If you divide top-tier offers by the entire enrolled batch, including students not actively competing for those roles, the number will look brutally small. If you divide offers by students who completed a serious prep track, built proof, and targeted a narrow list of employers, the number moves a lot. Neither version is fake. They answer different questions.</p>
            <p>The honest takeaway is that conversion is conditional. Your relevant denominator is the set of people playing the same game with similar signals, not the whole college population.</p>

            <div className="highlight"><strong>Key insight:</strong> Ask what the percentage measures. Full cohort, placement-registered students, serious off-campus applicants, or interview-stage candidates. The label changes the number more than the college name does.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Headline placement stats smooth out difficulty</strong> A high overall placement number can hide how concentrated top-tier hires are within a small subgroup.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Social media loves numerators</strong> Success posts show offers. They rarely show attempts, time cost, coaching access, or luck factors like timing and requisitions.</span>
              </div>
            </div>

            <div className="callout"><strong>Practical framing:</strong> Track your own funnel: applications, recruiter screens, technical rounds, and offers. That personal conversion rate is the only one you can actually improve week to week.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>2</div>
              <div>
                <div className="sec-title">Campus slots are real, but they are not evenly distributed</div>
                <div className="sec-sub">Tier 2 often competes for fewer on-campus visits from the most selective employers</div>
              </div>
            </div>
            <p>Many top companies run structured campus hiring, but the number of schools in the primary circuit is limited. When a firm visits fewer campuses, Tier 2 students may see fewer day-zero opportunities in the same format peers at feed schools receive.</p>
            <p>That does not mean the door is closed. It means the default path shifts. Instead of relying on a high-volume campus process with a built-in schedule, many students must build eligibility through internships, contests, referrals, or specialist pipelines.</p>
            <p>The emotional risk is interpreting a thinner campus calendar as a talent verdict. In most cases it is a logistics and trust shortcut for employers, not a proof that your ceiling is lower.</p>

            <div className="chart-wrap">
              <div className="chart-label">How Tier 2 students commonly reach top-tier employers (illustrative mix)</div>
              <div style={{ height: 260 }}>
                <canvas id="tier2PathwayMixChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Feed-school advantage is partly queue position</strong> Employers save time when they can interview in batches with predictable credential signals. That efficiency benefit can look like prestige, even when the underlying task is learnable.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Smaller campus intake raises variance</strong> With fewer seats, luck and timing swing outcomes more. Personal tracking and follow-up matter more, not less.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Reframe:</strong> Treat campus as one channel. If the channel is thin, allocate time to channels that create trust faster: demonstrable work, internships, and introductions.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>3</div>
              <div>
                <div className="sec-title">Most Tier 2 to top-company stories are internship and referral stories</div>
                <div className="sec-sub">Return offers and warm paths beat anonymous portals at the margin</div>
              </div>
            </div>
            <p>Across the stories Studojo sees most often, the cleanest Tier 2 to elite employer transitions involve a summer or semester internship where performance converts into a return offer, or a referral that moves a resume from unknown to reviewed.</p>
            <p>Direct applications can still work, but they compete harder on proof density. A strong public project, a measurable outcome, a clear skills match, and a concise narrative reduce the trust gap that campus brand otherwise fills.</p>
            <p>This is why the conversion conversation should include time horizon. A six-month sprint can change interview odds dramatically if it produces one credible line item employers recognize.</p>

            <div className="highlight"><strong>Key insight:</strong> Employers are trying to reduce hiring risk. Internships and referrals are risk-reduction machines. Your strategy should manufacture trust if you do not inherit it from the logo on your ID card.</div>

            <div className="pull-quote">
              <p>"My offer did not come from the college name. It came from a return offer after I shipped real work in the summer, and a manager who could vouch for how I worked."</p>
              <span className="pq-source">Early-career engineer, Tier 2 college (representative synthesis), 2026</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">What changes the rate is signal, not motivation</div>
                <div className="sec-sub">The funnel rewards evidence that is easy to verify quickly</div>
              </div>
            </div>
            <p>Motivation is common. Signal is not. Signal is anything that makes a reviewer believe you can do the job with lower uncertainty: a competitive programming rating only if the role cares, a production bug you fixed with metrics, a model you deployed, a design system contribution, a clear internship impact line.</p>
            <p>Tier 2 candidates often face a shorter attention window. Reviewers may scan for risk flags and mismatch faster when the brand does not pre-vouch for you. That sounds unfair, and it can be. It still implies a practical strategy: put the strongest verifiable proof where scanning happens first.</p>
            <p>Volume without tailoring usually lowers conversion per hour spent. Tailoring raises conversion because it aligns language, skills, and outcomes with the role's stated risks.</p>

            <div className="chart-wrap">
              <div className="chart-label">What most shifts interview odds for Tier 2 candidates (relative strength, /10)</div>
              <div style={{ height: 320 }}>
                <canvas id="conversionLiftChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Pick proof that matches the employer's bar</strong> A bank technology role and a consumer product role may both say software engineer, but they reward different evidence.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Build one flagship artifact</strong> One strong, documented project often beats ten shallow lines on a resume because it gives interviewers something concrete to probe.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>5</div>
              <div>
                <div className="sec-title">Plan for a two-cycle strategy if you want probabilities on your side</div>
                <div className="sec-sub">Many strong outcomes are internship year plus final year, not a single miracle season</div>
              </div>
            </div>
            <p>Students hurt themselves by compressing everything into one recruiting season while comparing themselves to peers who started earlier. The real conversion rate for many competitive roles improves when you treat year two as the main event and year one as signal building.</p>
            <p>That can mean a smaller company internship first, a research lab, a serious open source track, or a contest pipeline that makes your profile searchable. The point is to enter the next cycle with a line employers recognize.</p>
            <p>If you are already late, the strategy still holds, but the tactics get sharper: smaller target list, higher tailoring, aggressive networking hygiene, and faster iteration on resume feedback from real reviewers.</p>

            <div className="highlight"><strong>Summary insight:</strong> Conversion is not a lottery ticket hidden inside a college tier. It is a sequence of bets where each stage rewards clearer proof and better targeting.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Audit your proof, not your anxiety</strong> List what a stranger would believe about you in sixty seconds. If the list is thin, fix the list before you raise application count.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask better questions of seniors</strong> Do not only ask if a company hires from your college. Ask which channel worked: campus, internship, referral, or off-campus, and what evidence they led with.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Weekly discipline:</strong> Ship one visible improvement per week for twelve weeks. A portfolio page, a bug fix, a blog write-up, a mock interview review. Small compounding beats heroic one-off cramming.</div>
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
              <div className="blist-item" key="Define your denominator before you panic">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Define your denominator before you panic.</strong> Separate full-cohort stats from your real competitor set: students targeting the same employers with similar prep. Track your own funnel metrics weekly.</span>
              </div>
              <div className="blist-item" key="Bias effort toward trust-building paths">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Bias effort toward trust-building paths.</strong> Prioritize one internship that produces measurable work, one flagship artifact, and a small network of alumni or practitioners who can forward your profile with context.</span>
              </div>
              <div className="blist-item" key="Tailor brutally for a short target list">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Tailor brutally for a short target list.</strong> Pick fewer employers and align keywords, projects, and outreach to each role's stated risks. Generic volume is usually negative ROI for Tier 2 off-campus pipelines.</span>
              </div>
              <div className="blist-item" key="Run a two-cycle plan when possible">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Run a two-cycle plan when possible.</strong> Use an earlier cycle to earn a recognizable line item, then reuse that credibility in the next recruiting season instead of starting from zero proof each time.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Turn proof into a clearer path.</h3>
              <p>Studojo helps students find internships and career pathways with better role context, so you spend less time guessing what employers reward and more time building evidence that survives screening.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Browse Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
