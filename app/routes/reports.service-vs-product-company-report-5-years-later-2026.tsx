import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Service vs Product Company Report: IT Services vs Startups vs Product Firms, 5 Years Later | Studojo" },
    { name: "description", content: "IT services starts at 3.36 to 3.6 LPA, product firms at 15 LPA+. Pay, skills and switching over five years, and the one move that closes the gap." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "service vs product company india, tcs vs product company salary, how to switch from service to product company, it services fresher salary stagnation, product company fresher salary india, startup vs mnc first job" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/service-vs-product-company-report-5-years-later-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Service vs Product Company Report: IT Services vs Startups vs Product Firms, 5 Years Later" },
    { property: "og:description", content: "The starting gap between an IT services offer and a product offer is about 5x. By year five it can be 6x or close to zero. The difference is one switch." },
    { property: "og:url", content: `${BASE_URL}/reports/service-vs-product-company-report-5-years-later-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-14T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Service vs Product Company Report: IT Services vs Startups vs Product Firms, 5 Years Later | Studojo" },
    { name: "twitter:description", content: "IT services: 3.6 LPA. Product firm: 18 LPA. By year five, one person can still be at about 5 LPA and another at 18. Same starting company. One switch apart." },
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

  const fiveYearChartEl = document.getElementById("fiveYearChart") as HTMLCanvasElement | null;
  if (fiveYearChartEl && !fiveYearChartEl.dataset.rendered) {
    fiveYearChartEl.dataset.rendered = "1";
    new Chart(fiveYearChartEl, {
      type: "bar",
      data: {
        labels: ["Started in services, stayed (8% yearly hikes)", "Started in services, one switch within services in year four", "Started in services, switched to product in year three", "Started in a product company"],
        datasets: [{
          label: "Illustrative year-five annual pay by path (LPA, Studojo scenario model, not survey data)",
          data: [5.3, 6.9, 18.2, 32.0],
          backgroundColor: ["#737373", "#a78bfa", "#8B5CF6", "#10b981"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} LPA` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 35.0,
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

export default function Report_ServiceVsProductCompanyReport5YearsLater2026() {
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
        "headline": "The Service vs Product Company Report: IT Services vs Startups vs Product Firms, 5 Years Later",
        "description": "IT services starts at 3.36 to 3.6 LPA, product firms at 15 LPA+. Pay, skills and switching over five years, and the one move that closes the gap.",
        "url": `${BASE_URL}/reports/service-vs-product-company-report-5-years-later-2026`,
        "datePublished": "2026-10-14T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/service-vs-product-company-report-5-years-later-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Service vs Product Company Report: IT Services vs Startups vs Product Firms, 5 Years Later", "item": `${BASE_URL}/reports/service-vs-product-company-report-5-years-later-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · October 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The Service vs Product Company Report: IT Services vs Startups vs Product Firms, 5 Years Later"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Service vs Product, 5 Years Later:<br /><em>The Starting Gap Is 5x. Year Five Depends on One Switch.</em>" }} />
            <p className="rpt-hero-sub">{"A TCS Ninja offer pays 3.36 LPA. A well-known product company often pays 15 LPA or more to the same graduate. Freshers treat that gap as fate. We modelled five-year paths across IT services, product firms and startups and found the starting company matters less than whether, and when, you make your first switch."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Software and tech graduates"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Sector / Career paths"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"October 2026"}</span>
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
              <div className="sc-num">{"~5x"}</div>
              <div className="sc-label">{"Gap between an IT services entry offer (3.36 to 3.6 LPA) and a typical product company fresher offer (15 to 18 LPA)"}</div>
              <div className="sc-source">{"TCS and Infosys hiring tracks 2025; public salary aggregator ranges"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"12,000+"}</div>
              <div className="sc-label">{"Roles TCS said it would cut in 2025, about 2% of its workforce. Services is no longer the safe default it was"}</div>
              <div className="sc-source">{"TCS announcement, July 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"3.4x"}</div>
              <div className="sc-label">{"Year-five pay difference between staying in services and switching to product in year three (Studojo scenario model)"}</div>
              <div className="sc-source">{"Studojo five-year scenario model, 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"The starting line: same degree, 5x different pay"}</div>
                <div className="sec-sub">{"Why the entry gap is so wide"}</div>
              </div>
            </div>
            <p>{"IT services firms hire freshers by the tens of thousands and pay by track. TCS Ninja pays 3.36 LPA and Infosys Systems Engineer pays 3.6 LPA. Product companies hire far fewer freshers, filter much harder on coding and problem solving, and pay accordingly. Public salary aggregators put fresher software engineer pay at well-known product companies at roughly 15 to 25 LPA, with the top firms paying more."}</p>
            <p>{"The two business models explain the gap. Services firms bill clients for people's time, so margins depend on keeping entry costs low and staffing pyramids wide. Product firms earn from software that scales without extra headcount, so one strong engineer is worth much more to them. Neither company is being unfair. They are buying different things."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Services pays for availability and trainability. Product pays for proven problem solving. Your entry offer tells you which of those you demonstrated at 21, not which you can demonstrate at 24."}</div>

            <div className="callout-amber"><strong>{"The stagnation problem:"}</strong>{" IT services entry pay has stayed at roughly 3.3 to 3.6 LPA in nominal terms for over a decade, a point industry figures including former Infosys CFO Mohandas Pai have criticised publicly. After inflation, a services fresher today earns less than one did ten years ago."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Five years later: the paths diverge on decisions, not offers"}</div>
                <div className="sec-sub">{"Four illustrative careers from the same graduating class"}</div>
              </div>
            </div>
            <p>{"We modelled four simple paths. Someone who starts in services at 3.6 LPA and stays, with 8% yearly hikes, reaches about 5.3 LPA in year five. Switching once to another services or mid-size firm in year four, with a typical 40% switching jump, brings that to about 6.9 LPA. Switching to a product company in year three at around 15 LPA, then 10% yearly raises, reaches about 18 LPA. Starting at a product company at 18 LPA, with a promotion to the next engineering level around year three, reaches roughly 32 LPA."}</p>
            <p>{"These are scenarios, not averages, and real outcomes vary widely. But the shape is consistent. The gap between 'started in product' and 'switched to product in year three' is about 1.8x. The gap between 'switched to product' and 'stayed in services' is about 3.4x. The biggest pay decision in this model is not the first offer. It is whether you treat your services job as a launchpad or a destination."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Starting in services costs you some ground. Staying in services without a plan costs you far more."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Illustrative year-five annual pay by path (LPA, Studojo scenario model, not survey data)"}</div>
              <div style={{ height: 300 }}>
                <canvas id="fiveYearChart" />
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Skills: what each environment actually teaches"}</div>
                <div className="sec-sub">{"Breadth and process vs ownership and depth"}</div>
              </div>
            </div>
            <p>{"Services firms are good at some things freshers undervalue: structured training, client communication, working inside large processes, and exposure to many domains and stacks. Their weakness is that much fresher work is maintenance, testing or support on legacy systems, and time on the bench between projects teaches nothing. Two people at the same services firm can have very different first years depending on their project."}</p>
            <p>{"Product companies push ownership early. You write code that real users hit, you see production problems, and you learn system design by living with your own decisions. Startups go further: very wide scope, little process, fast learning, and high risk. A startup engineer can do in one year what takes three elsewhere, or can spend a year at a company that then shuts down."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The skill that drives your year-five salary is not the company name on your first offer. It is whether your work produced evidence you can show: shipped features, solved problems, systems you understand end to end."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"In services, pick your project hard."}</strong> {"Ask for development work on active systems over support roles. The project matters more than the brand."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"In product, own something visible."}</strong> {"A feature, a service, a metric. Promotions and switches both run on a clear story of what you owned."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"In startups, document as you go."}</strong> {"If the company does not survive, your portfolio of what you built is the only thing that transfers."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Security is no longer a services advantage"}</div>
                <div className="sec-sub">{"Layoffs, onboarding delays and the end of the safe default"}</div>
              </div>
            </div>
            <p>{"Parents choose services offers for stability. That logic has weakened. TCS said in July 2025 that it would cut more than 12,000 roles, around 2% of its workforce. In 2023 and 2024, large services firms delayed fresher onboarding for months, and some offers were revoked. Product companies and startups have also laid people off in waves since 2022, so no segment is safe."}</p>
            <p>{"The real security in tech today is employability: skills another company will pay for next month. A services engineer who has drifted for four years on a support project is less secure than a startup engineer with two years of shipped work, even if the services employer is larger."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Choose a first job for the skills and evidence it will give you. Company size is a weak proxy for safety."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"The switch: how services engineers move to product"}</div>
                <div className="sec-sub">{"The most common route, and what it takes"}</div>
              </div>
            </div>
            <p>{"The services-to-product switch is one of the most common career moves in Indian tech, and it is learnable. Product interviews test data structures and algorithms, system design at an appropriate level, and depth in your own work. Services jobs rarely build the first two on their own, so the switch takes deliberate preparation, usually six to twelve months alongside the job."}</p>
            <p>{"Two practical obstacles trip people up. Notice periods at large services firms are commonly 60 to 90 days, which makes some product recruiters hesitate. And a resume full of client names and generic duties hides the engineering. Rewrite it around problems solved, scale handled and systems built, and start interviewing before you resign."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The year-two to year-three window is the sweet spot. You have real experience to show, and you have not yet settled into a role that is hard to explain."}</div>

            <div className="callout-green"><strong>{"A 12-month plan:"}</strong>{" Months 1 to 4, daily DSA practice. Months 5 to 8, one serious side project or a high-impact piece of work at your job. Months 9 to 12, referrals, mock interviews and applications to 20 to 30 targeted product roles."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"Which start fits which student"}</div>
                <div className="sec-sub">{"There is no universally right first job"}</div>
              </div>
            </div>
            <p>{"If you have a product offer, take it seriously. The pay, learning and resume signal compound. If you have a services offer and nothing else, take it, but treat it as paid training with a deadline. If you have a startup offer, check the funding, the founders' track record and who you will learn from, because a weak startup teaches bad habits and a strong one is the fastest education in the industry."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Five years later, the people who did best were not always the ones who started best. They were the ones who kept making their next move on purpose."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Services offer only."}</strong> {"Accept, fight for a development project, and start switch preparation within the first year."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Product offer."}</strong> {"Usually the strongest start. Optimise for team and mentorship, not just brand."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Startup offer."}</strong> {"Ask about runway, the engineering team and what you will own in the first 90 days."}</span>
              </div>
            </div>
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
              <div className="blist-item" key="Your first offer is not your ceiling">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Your first offer is not your ceiling"}.</strong> {"In our model, switching to product in year three narrows a 5x starting gap to under 2x."}</span>
              </div>
              <div className="blist-item" key="Treat services as paid training with a deadline">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Treat services as paid training with a deadline"}.</strong> {"Set a 12 to 24 month plan for skills, evidence and a switch. Staying without one is the costly path."}</span>
              </div>
              <div className="blist-item" key="Optimise for evidence, not brand">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Optimise for evidence, not brand"}.</strong> {"Shipped work and owned systems drive both promotions and switches."}</span>
              </div>
              <div className="blist-item" key="Do not buy security with stagnation">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Do not buy security with stagnation"}.</strong> {"Layoffs and onboarding delays hit services too. Employability is the only reliable safety."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Build the evidence that gets you the better start"}</h3>
              <p>{"Internships at product companies and startups are the fastest way to show product-ready skills before your first offer. Find them on Studojo."}</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              {"Browse Internships →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
