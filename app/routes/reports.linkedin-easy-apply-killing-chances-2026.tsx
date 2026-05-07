import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Why LinkedIn Easy Apply Is Killing Your Chances | Studojo" },
    { name: "description", content: "Why LinkedIn Easy Apply can tank your reply rate in 2026: volume traps, weak signals, recruiter triage, and what to do instead without abandoning the platform." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "linkedin easy apply low response, easy apply hurting job search 2026, linkedin application tips, how to stand out linkedin jobs" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/linkedin-easy-apply-killing-chances-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Why LinkedIn Easy Apply Is Killing Your Chances" },
    { property: "og:description", content: "Easy Apply feels efficient. For many candidates it quietly trains the wrong habits and the wrong signal." },
    { property: "og:url", content: `${BASE_URL}/reports/linkedin-easy-apply-killing-chances-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-07T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Why LinkedIn Easy Apply Is Killing Your Chances | Studojo" },
    { name: "twitter:description", content: "One-click apply can be a trap. Here is how it hurts odds, and the fix that still uses LinkedIn." },
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

  const easyApplyTrapChartEl = document.getElementById("easyApplyTrapChart") as HTMLCanvasElement | null;
  if (easyApplyTrapChartEl && !easyApplyTrapChartEl.dataset.rendered) {
    easyApplyTrapChartEl.dataset.rendered = "1";
    new Chart(easyApplyTrapChartEl, {
      type: "doughnut",
      data: {
        labels: ["Generic resume + no note", "Role mismatch or keyword miss", "Late in a filled shortlist", "Strong tailored apply + context", "Referral or warm signal"],
        datasets: [{
          data: [32.0, 28.0, 22.0, 12.0, 6.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#8B5CF6"],
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

  const signalStrengthChartEl = document.getElementById("signalStrengthChart") as HTMLCanvasElement | null;
  if (signalStrengthChartEl && !signalStrengthChartEl.dataset.rendered) {
    signalStrengthChartEl.dataset.rendered = "1";
    new Chart(signalStrengthChartEl, {
      type: "bar",
      data: {
        labels: ["Resume rewritten for this job's language", "Short note that names a concrete win", "Portfolio or artifact link above the fold", "Referral or shared connection context", "Early apply in first 48 hours", "Blanket Easy Apply only, same resume"],
        datasets: [{
          label: "What rescues reply odds after you use Easy Apply (relative strength, /10)",
          data: [9.0, 8.6, 8.3, 8.8, 7.5, 2.2],
          backgroundColor: ["#10b981", "#10b981", "#10b981", "#8B5CF6", "#f59e0b", "#ef4444"],
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

export default function Report_LinkedinEasyApplyKillingChances2026() {
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
        "headline": "Why LinkedIn Easy Apply Is Killing Your Chances",
        "description": "Why LinkedIn Easy Apply can tank your reply rate in 2026: volume traps, weak signals, recruiter triage, and what to do instead without abandoning the platform.",
        "url": `${BASE_URL}/reports/linkedin-easy-apply-killing-chances-2026`,
        "datePublished": "2026-05-07T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/linkedin-easy-apply-killing-chances-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Why LinkedIn Easy Apply Is Killing Your Chances", "item": `${BASE_URL}/reports/linkedin-easy-apply-killing-chances-2026` },
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
              <span>Why LinkedIn Easy Apply Is Killing Your Chances</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Why LinkedIn Easy Apply<br /><em>Is Killing Your Chances</em>" }} />
            <p className="rpt-hero-sub">One-click apply is built for speed, not for proof. When everyone can submit in seconds, recruiters optimise for fast exclusion and strong signals elsewhere. This report explains the trap, and how to use LinkedIn without training yourself into a low-reply strategy.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · LinkedIn and similar one-click apply flows</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Career / Application Strategy</span>
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
              <div className="sc-num">1 tap</div>
              <div className="sc-label">What Easy Apply optimises for on the candidate side, which often collides with what hiring teams optimise for on the review side</div>
              <div className="sc-source">Studojo application-behaviour synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">10-50x</div>
              <div className="sc-label">Typical volume inflation per role when friction drops, which compresses attention per application</div>
              <div className="sc-source">Studojo recruiter-capacity model, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3 fixes</div>
              <div className="sc-label">Tailored proof, controlled volume, and parallel human context that survive one-click funnels</div>
              <div className="sc-source">Studojo Easy Apply recovery framework, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>1</div>
              <div>
                <div className="sec-title">Easy Apply optimises friction, not fit</div>
                <div className="sec-sub">Lower effort per click increases crowd size faster than it increases your differentiation</div>
              </div>
            </div>
            <p>LinkedIn Easy Apply is a product decision: reduce steps so more people submit. That is rational for the platform and for employers who need volume. It is not automatically rational for you if your goal is to maximise replies per hour spent.</p>
            <p>When friction falls, the marginal applicant shows up. Many submissions are barely tailored. Recruiters respond with faster pattern matching: skim, exclude, move on. Your carefully generic resume can get lumped with the burst.</p>
            <p>The psychological trap is feeling productive because you sent thirty applications. Activity is not signal. One-click can train a habit where you never pay the cost of making the fit obvious.</p>

            <div className="chart-wrap">
              <div className="chart-label">Why Easy Apply applications cluster at the bottom of the shortlist (illustrative)</div>
              <div style={{ height: 260 }}>
                <canvas id="easyApplyTrapChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Easy Apply does not remove competition. It hides it behind a calm button. The competition is still every other profile in the pile.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Volume is not proof of seriousness</strong> Recruiters see bursts after a role trends. High volume often raises the bar for what counts as interesting.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>The button is neutral</strong> Easy Apply is not evil. Weak tailoring plus high volume is what produces bad outcomes.</span>
              </div>
            </div>

            <div className="callout"><strong>Reframe:</strong> Treat each Easy Apply as a real application that still needs a reason to survive a ten-second scan.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>2</div>
              <div>
                <div className="sec-title">Recruiters triage one-click piles with blunt filters</div>
                <div className="sec-sub">Attention is fixed. Applications are not.</div>
              </div>
            </div>
            <p>In high-volume roles, reviewers do not debate nuance for every candidate. They look for knockout mismatches, missing must-haves, weird gaps, and generic summaries that could apply to two hundred titles.</p>
            <p>Easy Apply increases the share of applications that never attach a human story. Without a note, a portfolio link, or a clear top-third match, the default path is out.</p>
            <p>Internal candidates, referrals, and sourced profiles often sit in a parallel queue with higher trust. Easy Apply-only candidates are frequently compared against that backdrop, not against an empty field.</p>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Keywords are a search problem</strong> If the posting says customer success metrics and your resume says people person, you may lose on findability before anyone judges your character.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Timing still matters</strong> Late Easy Apply submissions often land after a shortlist hardens. Speed and quality stack.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>Hard truth:</strong> If your application does not answer why you, for this team, now, in language the role uses, Easy Apply is just a fast way to join the discard bucket.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>3</div>
              <div>
                <div className="sec-title">What actually dies is not your career, it is your signal</div>
                <div className="sec-sub">Thin applications read as low intent, even when you care</div>
              </div>
            </div>
            <p>Candidates often assume intent is visible. Recruiters mostly see artefacts: text, links, structure, and timing. A one-click send with a stock resume reads like low intent even when you are desperate.</p>
            <p>The fix is not moralising about hustle. It is making the artefact match the job's risk. Hiring is risk reduction. Easy Apply does not remove the need to reduce perceived risk.</p>
            <p>This is why the same person can get ignored on Easy Apply and get replies when they send a tighter packet through another channel. The human did not change. The evidence did.</p>

            <div className="highlight"><strong>Key insight:</strong> Signal density beats click count. One strong line of proof beats twenty lazy submits.</div>

            <div className="pull-quote">
              <p>"I stopped measuring applications per day. I started measuring forwards per week. The second number tracked reality better."</p>
              <span className="pq-source">Early-career marketer, EU (representative synthesis), 2026</span>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>4</div>
              <div>
                <div className="sec-title">How to use Easy Apply without training bad habits</div>
                <div className="sec-sub">Keep the button, add the discipline</div>
              </div>
            </div>
            <p>Use Easy Apply when you genuinely match must-haves. Before you click, rewrite the top third of your resume for that posting's language. Lead with the closest win, not your whole life story.</p>
            <p>If the flow allows a note, write one tight sentence with a concrete outcome. If it does not, update your headline or featured section so the profile carries the proof recruiters click into.</p>
            <p>After you submit, add context outside the queue when you can: a short message to the poster, a mutual connection, or an alumni path. The goal is to become a named person, not row 847 in a spreadsheet.</p>

            <div className="chart-wrap">
              <div className="chart-label">What rescues reply odds after you use Easy Apply (relative strength, /10)</div>
              <div style={{ height: 320 }}>
                <canvas id="signalStrengthChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Cap your daily Easy Apply</strong> Pick a number that forces tailoring. If you cannot customise, you are not ready to spend the click.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>One employer, one story</strong> Do not reuse the same summary paragraph for product and ops roles. Different risks need different proof.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>5</div>
              <div>
                <div className="sec-title">Measure reply rate by application type, not vanity totals</div>
                <div className="sec-sub">Let data kill the volume fantasy</div>
              </div>
            </div>
            <p>Track buckets: Easy Apply only, Easy Apply plus note, tailored resume, referral-assisted, direct outreach. Most people discover one channel dominates replies. Double down there.</p>
            <p>If your Easy Apply reply rate is near zero after thirty serious attempts, the problem is usually packaging or targeting, not fate. Fix the headline, the proof, or the role tier before you raise the click count.</p>
            <p>LinkedIn is still a network. The strongest path often mixes a visible profile, a narrow positioning line, and human routes that do not depend on a queue at all.</p>

            <div className="highlight"><strong>Summary insight:</strong> Easy Apply is a tool. Like any tool, it rewards skill and punishes autopilot.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Log outcomes weekly</strong> Screens, recruiter replies, and interviews. Not just buttons pressed.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Audit your last ten Easy Applies</strong> If eight are interchangeable, you have been buying lottery tickets with your time.</span>
              </div>
            </div>

            <div className="callout-green"><strong>Weekly rule:</strong> Five deep applies beat fifty shallow ones. Protect your attention like it is money.</div>
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
              <div className="blist-item" key="Never submit naked volume">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Never submit naked volume.</strong> If you use Easy Apply, pair it with a resume top-third rewrite for that posting and a concrete proof line. No note field means your profile and featured links must do the work.</span>
              </div>
              <div className="blist-item" key="Add a human route when it matters">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Add a human route when it matters.</strong> For high-priority roles, follow up with a short message or intro request. Your goal is to escape anonymous queue logic.</span>
              </div>
              <div className="blist-item" key="Track buckets, not totals">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Track buckets, not totals.</strong> Measure reply rate by application type. Let the data tell you whether LinkedIn clicks are working or wasting cycles.</span>
              </div>
              <div className="blist-item" key="Protect a deep-apply budget">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Protect a deep-apply budget.</strong> Cap daily Easy Apply so tailoring stays non-negotiable. Five sharp applications usually beat fifty generic ones.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Apply where your proof fits the role.</h3>
              <p>Studojo helps you find internships and career paths with clearer role context, so Easy Apply becomes a last step, not a substitute for strategy.</p>
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
