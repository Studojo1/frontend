import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Internship, Externship, Co-op, Practicum, Fellowship, Apprenticeship | Studojo" },
    { name: "description", content: "Six words for six different trades. What each one costs you in time and pay, what it gives back, and which ones actually end in a job offer." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "internship vs externship, internship vs co-op, internship vs apprenticeship, what is a practicum, fellowship vs internship, difference between internship and externship" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/internship-vs-externship-coop-practicum-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Internship, Externship, Co-op, Practicum, Fellowship, Apprenticeship" },
    { property: "og:description", content: "These are not tiers of prestige. They are different trades between time, money, credit and the odds of a job at the end. Picking wrong costs a semester or a salary." },
    { property: "og:url", content: `${BASE_URL}/reports/internship-vs-externship-coop-practicum-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-09-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Internship, Externship, Co-op, Practicum, Fellowship, Apprenticeship | Studojo" },
    { name: "twitter:description", content: "Six words, six different deals. What each format actually costs you and what it gives back." },
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

  const durationChartEl = document.getElementById("durationChart") as HTMLCanvasElement | null;
  if (durationChartEl && !durationChartEl.dataset.rendered) {
    durationChartEl.dataset.rendered = "1";
    new Chart(durationChartEl, {
      type: "bar",
      data: {
        labels: ["Externship, shadowing", "Internship, one term", "Practicum, one academic term", "Co-op, one rotation", "Apprenticeship, minimum"],
        datasets: [{
          label: "Typical duration in months (apprenticeships run 1 to 6 years, shown at the minimum)",
          data: [0.5, 2.5, 3.0, 5.0, 12.0],
          backgroundColor: ["#f59e0b", "#8B5CF6", "#8B5CF6", "#10b981", "#10b981"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} months` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 14.0,
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

export default function Report_InternshipVsExternshipCoopPracticum2026() {
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
        "headline": "Internship, Externship, Co-op, Practicum, Fellowship, Apprenticeship",
        "description": "Six words for six different trades. What each one costs you in time and pay, what it gives back, and which ones actually end in a job offer.",
        "url": `${BASE_URL}/reports/internship-vs-externship-coop-practicum-2026`,
        "datePublished": "2026-09-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/internship-vs-externship-coop-practicum-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Internship, Externship, Co-op, Practicum, Fellowship, Apprenticeship", "item": `${BASE_URL}/reports/internship-vs-externship-coop-practicum-2026` },
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
              <span>Internship, Externship, Co-op, Practicum, Fellowship, Apprenticeship</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Six Words, Six Different Deals:<br /><em>Which One Should You Actually Take?</em>" }} />
            <p className="rpt-hero-sub">Internship, externship, co-op, practicum, fellowship, apprenticeship. Most guides define them and stop, which is useless when you are holding two offers. These are not ranks of prestige. Each is a specific trade between your time, your money, your graduation date and your odds of a job at the end. Here are the terms of each one.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Primarily US terminology, with notes on where the same words mean different things elsewhere</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Career / Formats</span>
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
              <div className="sc-num">1 week to 6 years</div>
              <div className="sc-label">the range these six formats cover. An externship can be a few days of shadowing. A registered apprenticeship can run six years</div>
              <div className="sc-source">US Department of Labor and university career office definitions, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">Paid by design</div>
              <div className="sc-label">co-ops and apprenticeships are paid as a rule. Externships essentially never are, and carry no academic credit either</div>
              <div className="sc-source">Comparative definitions across US career services, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">One semester</div>
              <div className="sc-label">what a co-op typically costs you, because it replaces your classes rather than sitting alongside them</div>
              <div className="sc-source">Cooperative education programme structures, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>1</div>
              <div>
                <div className="sec-title">What actually separates them</div>
                <div className="sec-sub">Three variables: who pays, how long, and whether your degree is involved</div>
              </div>
            </div>
            <p>Every one of these six can be described by three questions. Does money flow to you. How much of your life does it take. And is it wired into your degree, meaning it carries credit or replaces coursework. Once you answer those three, the labels stop mattering and the choice becomes obvious.</p>
            <p>The formats that are academically integrated, co-ops and practicums, are degree-driven: your university is a party to the arrangement, and that is both the benefit and the cost. The formats that sit outside your degree, internships and externships, are more flexible and less protected. Apprenticeships are a third thing entirely, because they are employment first.</p>

            <div className="chart-wrap">
              <div className="chart-label">Typical duration in months (apprenticeships run 1 to 6 years, shown at the minimum)</div>
              <div style={{ height: 270 }}>
                <canvas id="durationChart" />
              </div>
            </div>

            <div className="highlight">Key insight: an externship and an apprenticeship are not two points on one scale. One is a few days of watching. The other is a multi-year job with a training contract attached.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Internship.</strong> Typically 8 to 12 weeks, may or may not be paid, sits alongside or between terms. The default format and the one most conversion pipelines are built around.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Externship.</strong> Short, often a few days to two weeks, built around shadowing rather than doing. Generally unpaid and generally carries no academic credit. Low cost, low commitment, low signal.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Co-op.</strong> Paid, full time, 4 to 6 months per rotation, built into your degree and replacing a semester of classes. The deepest immersion available to a student, paid for with your graduation date.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Practicum.</strong> Academically integrated and degree-driven, usually a required component of a professional programme such as teaching, nursing, social work or clinical psychology. You rarely choose it. Your degree does.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Fellowship.</strong> Oriented around research, leadership or specialisation rather than general work experience. Often funded, often competitive, and usually the format for people who already have a direction.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Apprenticeship.</strong> Paid employment from day one with a structured training plan and an assigned mentor, running anywhere from one to six years. In the US these are nationally standardised and registered, which makes the credential portable.</span>
              </div>
            </div>

            <div className="callout-amber">The words are not used consistently outside the US. In the UK an apprenticeship is a mainstream post-school route with its own funding system, and placement or industrial placement often means what Americans call a co-op. Read the terms, not the label.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>2</div>
              <div>
                <div className="sec-title">Who pays, and what that tells you</div>
                <div className="sec-sub">The money question answers a second question you did not ask</div>
              </div>
            </div>
            <p>Co-ops and apprenticeships are paid as a matter of structure. A co-op is a full-time working position; an apprenticeship is employment. Internships vary enormously and may be paid or unpaid depending on the employer and the sector. Externships are essentially never paid, because you are observing rather than producing. Fellowships are frequently funded, sometimes generously.</p>
            <p>The pattern underneath is worth naming. Payment tracks how much real output you produce. An organisation pays you when your work has value to them, and that is also the condition under which you learn the most, because nobody gives meaningful work to someone they are not invested in.</p>
            <p>This is why an unpaid position is not automatically a bad deal but is always worth interrogating. If nobody is paying, ask what you are producing. If the honest answer is very little, you are buying exposure, and you should price that against a shorter externship which costs you a week instead of a summer.</p>

            <div className="highlight">Key insight: payment is a proxy for whether your work matters to them. That is usually the same thing as whether the experience will matter to you.</div>

            <div className="callout-green">A funded fellowship and a paid co-op signal something to a future employer that an unpaid placement cannot: somebody committed budget to you.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>3</div>
              <div>
                <div className="sec-title">The co-op question: is a semester worth it?</div>
                <div className="sec-sub">The only format that changes your graduation date</div>
              </div>
            </div>
            <p>A co-op replaces your classes rather than filling your summer. One rotation runs four to six months, and taking one, or more commonly two or three, extends your degree. That is the real price, and it is paid in time rather than money.</p>
            <p>What you get back is depth. Four to six months inside one organisation is long enough to be trusted with something that matters, to see a project from beginning to end, and to be evaluated as a colleague rather than a visitor. It is also paid, which offsets part of the delayed graduation.</p>
            <p>The trade against internships is genuinely two-sided. Two summers of internships let you sample two industries and find out what you do not want, which is worth more at nineteen than most people admit. One co-op gets you further inside a single door. Neither is correct in the abstract.</p>

            <div className="highlight">Key insight: choose a co-op when you already know the field and want depth. Choose internships when you are still narrowing down, because sampling is worth more than depth while you are undecided.</div>

            <div className="pull-quote">
              <p>&quot;Co-ops add a semester to your graduation timeline but give you deeper company immersion. Internships let you sample multiple roles and industries faster.&quot;</p>
              <span className="pq-source">Standard framing across US career services, 2026</span>
            </div>

            <div className="callout-red">If your programme offers a co-op and you have no idea what you want to do, that is an argument for taking one early rather than avoiding it. Four months resolves the question faster than four more courses will.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>4</div>
              <div>
                <div className="sec-title">Which ones actually end in a job</div>
                <div className="sec-sub">Conversion is a structural property, not a reward for performing well</div>
              </div>
            </div>
            <p>An apprenticeship ends in a job because it started as one. You are an employee being trained toward a specific occupation the employer needs filled, with a mentor assigned to get you there. The conversion question does not arise in the same way, because you are already inside.</p>
            <p>Co-ops convert well because of exposure time and because the employer has already carried the cost of training you across several months. Internships are the format most conversion pipelines are explicitly built around, and many large employers treat their intern cohort as the primary source of graduate hires.</p>
            <p>Externships convert rarely, and it is not a criticism of them to say so. A few days of shadowing is not an audition. Fellowships vary completely depending on whether the funder is also an employer.</p>

            <div className="highlight">Key insight: if a job at the end is your goal, rank them by how many hours the employer will have watched you work. That ordering predicts conversion better than prestige does.</div>

            <div className="callout">This also tells you when each format is the right tool. Use an externship to find out whether a career is worth pursuing. Use an internship or co-op to get hired into it.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>5</div>
              <div>
                <div className="sec-title">A rule for choosing</div>
                <div className="sec-sub">Work backwards from what you do not yet know</div>
              </div>
            </div>
            <p>Start with your actual uncertainty. If you do not know whether you would enjoy a field at all, the cheapest way to find out is an externship, because the cost of being wrong is a week. Spending a summer to learn the same thing is an expensive answer to a cheap question.</p>
            <p>If you know the field and want to be good at it, you need hours inside it, which means an internship or a co-op. Pick the co-op if your programme supports it and you can afford the semester. Pick internships if you want optionality or cannot delay graduating.</p>
            <p>If you know the specific occupation and want to be paid while learning it rather than paying tuition, look hard at apprenticeships before assuming a degree is the only route. And if you have a research question or a specialism you are already committed to, a fellowship is the format built for that, not a general internship.</p>

            <div className="highlight">Key insight: the right format is the one matched to the question you cannot yet answer. Prestige is not one of the variables.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Do not know if you would like the field?</strong> Externship. A week of shadowing answers it. Do not spend a summer on a question this cheap.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Know the field, want to be hired into it?</strong> Internship, or a co-op if you can afford the semester. Conversion follows hours observed.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Know the occupation, want to earn while learning?</strong> Apprenticeship. Paid from day one, with a structured plan and a mentor attached.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Already have a specific research or leadership direction?</strong> Fellowship. It is built for depth in one direction, not breadth across several.</span>
              </div>
            </div>

            <div className="callout-green">Whatever the label, ask three questions before accepting: will I be paid, how many hours will I actually be there, and does this carry credit or replace coursework. Those answers describe the deal. The word on the offer letter does not.</div>
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
              <div className="blist-item" key="Judge the deal, not the word">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Judge the deal, not the word.</strong> Who pays, how long it runs, and whether your degree is involved. Those three answers fully describe any of the six formats.</span>
              </div>
              <div className="blist-item" key="Payment signals whether your work matters">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Payment signals whether your work matters.</strong> Co-ops and apprenticeships are paid by design. If nobody is paying, ask what you are actually producing, and price the answer honestly.</span>
              </div>
              <div className="blist-item" key="A co-op costs a semester and buys depth">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>A co-op costs a semester and buys depth.</strong> Right when you already know the field. Internships are right while you are still narrowing down, because sampling beats depth when undecided.</span>
              </div>
              <div className="blist-item" key="Conversion follows hours observed">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Conversion follows hours observed.</strong> Apprenticeships start as employment. Co-ops and internships convert because the employer watched you work. Externships rarely do, by design.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Find the format that fits your actual question.</h3>
              <p>Studojo surfaces internships, placements and apprenticeships together, so you are comparing real terms instead of job titles.</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              Explore Internships →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
