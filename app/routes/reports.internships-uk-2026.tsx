import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

export function meta() {
  return [
    { title: "UK Internship Pay 2026: What Interns Actually Earn and When You Must Be Paid | Studojo" },
    { name: "description", content: "UK National Living Wage is £12.21/hour but unpaid internships are still common. Goldman Sachs pays £5,000/month. Spring weeks, milk round culture, and how international students qualify explained." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "uk internship pay 2026, internship salary uk, do interns get paid uk, spring week internship uk, uk graduate internship, london internship stipend, national minimum wage interns uk" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/internships-uk-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "UK Internship Pay 2026: What Interns Actually Earn and When You Must Be Paid" },
    { property: "og:description", content: "UK National Living Wage is £12.21/hour but unpaid internships are still common. Goldman Sachs pays £5,000/month. Spring weeks, milk round culture, and how international students qualify explained." },
    { property: "og:url", content: "https://studojo.com/reports/internships-uk-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:image:alt", content: "Studojo Career Market Report" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-01T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "UK Internship Pay 2026: What Interns Actually Earn | Studojo" },
    { name: "twitter:description", content: "NLW is £12.21/hr but unpaid internships still exist legally. Goldman pays £5k/month. Spring weeks, milk round, Graduate Route visa explained for international students." },
    { name: "twitter:image", content: "https://studojo.com/og-reports.png" },
    { name: "twitter:site", content: "" },
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

  const EMERALD = "#10b981";
  const EMERALD2 = "#34d399";
  const EMERALD3 = "#6ee7b7";
  const GREEN = "#10b981";
  const RED = "#ef4444";
  const ORANGE = "#f97316";
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

  // Chart 1: Pay by sector (monthly GBP)
  make("sectorChart", {
    type: "bar",
    data: {
      labels: ["NGO /\nCharity", "Marketing /\nCreative", "Media /\nPublishing", "Finance\n(general)", "Tech /\nSoftware", "Big 4\nConsulting", "MBB\nConsulting", "Investment\nBanking"],
      datasets: [{
        label: "Typical monthly pay (GBP)",
        data: [0, 1100, 1200, 2001, 3100, 2800, 3584, 4500],
        backgroundColor: [RED, EMERALD3, EMERALD3, EMERALD2, EMERALD2, EMERALD2, EMERALD, EMERALD],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ctx.raw === 0 ? " Often unpaid" : ` GBP ${ctx.raw.toLocaleString()}/month` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v === 0 ? "GBP 0" : "GBP " + (v / 1000).toFixed(1) + "k" } },
      },
    },
  });

  // Chart 2: City pay comparison (annual, GBP)
  make("cityChart", {
    type: "bar",
    data: {
      labels: ["Bristol /\nLeeds", "Edinburgh /\nGlasgow", "Birmingham /\nNotts", "Manchester", "London\n(general)", "London\n(finance/law)"],
      datasets: [
        { label: "Summer intern annual equivalent (GBP)", data: [22000, 23000, 24000, 23500, 29000, 52000], backgroundColor: EMERALD, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` GBP ${ctx.raw.toLocaleString()}/yr pro-rata` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => "GBP " + (v / 1000) + "k" } },
      },
    },
  });

  // Chart 3: Recruitment calendar (horizontal timeline by month - represented as bar)
  make("calendarChart", {
    type: "bar",
    data: {
      labels: ["Law firms (training contracts)", "Investment banking (summer analyst)", "MBB consulting", "Big 4 consulting", "Tech (Google, Microsoft)", "Spring weeks (finance/law)", "Civil Service Fast Stream"],
      datasets: [
        { label: "Applications open (months from Sept)", data: [1, 1, 2, 2, 2, 4, 3], backgroundColor: EMERALD3, borderRadius: 3, borderWidth: 0 },
        { label: "Deadline (months from Sept)", data: [3, 3, 4, 6, 5, 5, 8], backgroundColor: EMERALD, borderRadius: 3, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const months = ["", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
              return ` ${ctx.dataset.label}: ~${months[ctx.raw] || ctx.raw}`;
            }
          }
        },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => { const m = ["", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]; return m[v] || ""; } } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 4: Acceptance rates at top firms
  make("acceptanceChart", {
    type: "bar",
    data: {
      labels: ["Goldman Sachs\n(summer analyst)", "JPMorgan\n(summer analyst)", "McKinsey / BCG /\nBain", "Magic Circle\nlaw firms", "Big 4\nConsulting", "Google / Microsoft\n(EMEA intern)"],
      datasets: [{
        label: "Estimated acceptance rate (%)",
        data: [0.7, 0.7, 1.5, 3, 5, 4],
        backgroundColor: [RED, RED, AMBER, AMBER, EMERALD2, EMERALD3],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Acceptance: ~${ctx.raw}%` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });

  // Chart 5: Skills that open top-paying UK intern roles
  make("skillChart", {
    type: "bar",
    data: {
      labels: ["Excel /\nFinancial Modelling", "Python / SQL\n(data/tech)", "Commercial\nawareness", "Verbal reasoning\n(Watson Glaser)", "PowerPoint /\nclient presentation", "Coding /\nLeetCode", "Bloomberg /\nFactSet"],
      datasets: [{
        label: "Relevance to top-paying roles (%)",
        data: [72, 68, 85, 64, 78, 58, 45],
        backgroundColor: [EMERALD2, EMERALD2, EMERALD, EMERALD3, EMERALD, EMERALD2, EMERALD3],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of top-paying JDs` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });
}

export default function UKInternshipsReport() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "UK Internship Pay 2026: What Interns Actually Earn and When You Must Be Paid", "description": "UK National Living Wage is £12.21/hour but unpaid internships are still common. Goldman Sachs pays £5,000/month. Spring weeks, milk round culture, and how international students qualify explained.", "url": "https://studojo.com/reports/internships-uk-2026", "datePublished": "2026-04-01T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/internships-uk-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "UK Internships 2026", "item": "https://studojo.com/reports/internships-uk-2026"}]}` }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: rptCSS }} />
      <main>

        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Market Analysis · Q1 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>UK Internships 2026</span>
            </nav>
            <h1 className="rpt-h1">UK Internships in 2026:<br /><em>What They Actually Pay</em></h1>
            <p className="rpt-hero-sub">
              The minimum wage is £12.21/hour. But unpaid internships remain legal in specific cases. Goldman Sachs pays £45,000 to £60,000 pro-rata. And there is a recruitment calendar that most students discover a year too late.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">£12.21</div><div className="rpt-hlbl">National Living Wage per hour (21+, April 2025)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">0.7%</div><div className="rpt-hlbl">Goldman Sachs summer analyst acceptance rate (2025 cycle)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Pay data, legal rules, recruitment calendar, how to qualify</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for paid internships in the UK and beyond?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill">Find UK Internships on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">The law is clear: if you do productive work, you are a worker and must be paid. Most "unpaid internships" are illegal.</h2>
              <p className="rpt-lead">The UK minimum wage law has a worker test. Pass it and you must be paid. The test is not about job titles. It is about what you actually do.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">You MUST be paid if you:</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Have any contract", "Written, verbal, or implied. A confirmation email counts."],
                      ["Do productive work", "Tasks that benefit the business: research, admin, social media, design."],
                      ["Are required to show up", "Set hours, mandatory attendance, any obligation to complete work."],
                      ["Are promised future work", "Any expectation of continuity or a return offer."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#fee2e2", border: "1px solid #ef4444" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#991b1b" }}>If this is you</div>
                    <div style={{ fontSize: 14, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>You are legally a worker. You are entitled to National Minimum Wage for every hour worked. HMRC can investigate and the employer can be named publicly.</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Unpaid placements are legal only if:</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Genuine voluntary work", "At a charity or voluntary organisation. No contractual obligation."],
                      ["Pure shadowing / observation", "Watching others work only. No tasks, no output, no contribution."],
                      ["Student mandatory placement", "Required by your accredited UK course, lasting under 1 year. Must be formally documented by your university."],
                      ["Family business (limited cases)", "Very specific rules apply; most cases still require minimum wage."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d0fae4", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>Bottom line</div>
                    <div style={{ fontSize: 14, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>The vast majority of "unpaid internships" at businesses fail this test. If you are doing real work, you should be paid.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-e">£12.21</div><div className="rpt-lbl">National Living Wage (21+) from April 2025. Rising to £12.71 from April 2026.</div></div>
              <div className="rpt-stat"><div className="rpt-val">£10.00</div><div className="rpt-lbl">National Minimum Wage for ages 18 to 20 from April 2025. Rising to £10.85 in April 2026.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">£7.55</div><div className="rpt-lbl">Rate for ages 16 to 17. Rising to £8.00 from April 2026 (Low Pay Commission recommendation).</div></div>
            </div>

            <p className="rpt-prose">HMRC actively enforces minimum wage rules for interns. Employers found in breach are named in a public list on GOV.UK and face penalties of up to 200% of the unpaid wages (capped at £20,000 per worker). High-profile cases have included law firms, media agencies, and startups. <strong>The test is not whether your contract says "intern": it is whether you are doing work that benefits the business.</strong> If yes, you are a worker, and you are owed the minimum wage from day one.</p>
            <p className="rpt-source">Source: GOV.UK National Minimum Wage guidance for work experience and internships (April 2025), HMRC enforcement naming rounds 2024/25, Low Pay Commission Annual Report 2025, GOV.UK National Minimum Wage in 2026</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">Investment banks pay £4,500/month. NGOs and media pay at or below minimum wage. The sector gap is the largest variable in UK intern pay.</h2>
              <p className="rpt-lead">Once you know you must be paid, the next question is how much. In the UK, sector determines pay more than city, more than company size, and more than almost anything else.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Typical monthly intern pay by sector (GBP): note NGO is often legally unpaid (charity exemption)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="sectorChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-e">£45-60k</div><div className="rpt-lbl">Goldman Sachs and JPMorgan summer analyst pro-rata annual pay in London (Glassdoor UK, 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val">£43,007</div><div className="rpt-lbl">Average annual equivalent for Big 4 / MBB consulting interns in the UK (Glassdoor / PrepLounge, 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">£24,500</div><div className="rpt-lbl">UK average internship pay across all sectors (Glassdoor UK / Indeed, 2025-26). Lower quartile is around £18,000.</div></div>
            </div>

            <p className="rpt-prose">The top end of UK intern pay is genuinely competitive: investment banks pay £45,000 to £60,000 pro-rata, which translates to £3,750 to £5,000 per month for a 10 to 12-week summer placement. MBB consulting follows closely at roughly £3,584/month median. Tech companies (Google, Microsoft, Arm) sit at £3,100 to £3,750/month. <strong>General finance internships away from investment banking average closer to £2,001/month in London, which represents the midpoint between the glamorous IB packages and the minimum-wage-adjacent creative and media internships that make up the majority of listings.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The media and creative sector pay reality</div>
              <p>Marketing, journalism, publishing, and creative agency internships in the UK are the sectors most commonly investigated for minimum wage violations. A significant proportion still advertise as unpaid or "expenses only." If you take one of these roles, you are almost certainly entitled to at least £12.21/hour. The creative sector argument that exposure is compensation is not a legal defence. HMRC has published enforcement cases specifically naming creative and media employers.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor UK intern salary data 2025, PrepLounge UK consulting salary data 2025, GOV.UK HMRC enforcement naming rounds, salary.com UK summer internship data 2025</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find paid internships across UK and Europe</div>
                <div className="rpt-inline-cta-sub">The Internship Dojo surfaces roles with pay data, sector filters, and one-click applications.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary">Find UK Roles</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">London pays 12 to 13% more than Manchester. But London-specific cost of living erases most of that premium below £30k/year.</h2>
              <p className="rpt-lead">City choice matters in the UK, but not as much as sector. The London premium is real but narrow for most internship pay bands. Here is what each major city actually offers.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Internship annual pay equivalent by city (GBP pro-rata)</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="cityChart"></canvas></div>
            </div>

            <div className="rpt-bar-list" style={{ marginTop: 16 }}>
              {[
                { city: "London: finance and law", range: "£40,000 to £60,000/yr", sub: "City of London, Canary Wharf. Investment banking, Magic Circle law, consulting. Housing costs: £1,200 to £1,800/month for a room.", bg: "#10b981", pct: 100 },
                { city: "London: general", range: "£24,000 to £35,000/yr", sub: "Tech, media, marketing, general business. Average ~£29,000/yr (Glassdoor/Indeed 2025). High volume but wide range. Transport costs add £200/month.", bg: "#34d399", pct: 75 },
                { city: "Manchester", range: "£20,000 to £28,000/yr", sub: "Fast-growing tech and media hub. BBC, ITV, KPMG North all based here. Average ~£23,500/yr (Glassdoor 2025). Rent: £700 to £1,000/month.", bg: "#34d399", pct: 65 },
                { city: "Edinburgh / Glasgow", range: "£20,000 to £28,000/yr", sub: "Strong finance (Standard Life, Edinburgh), law, government. Rent: £650 to £900/month.", bg: "#6ee7b7", pct: 55 },
                { city: "Birmingham / Bristol", range: "£20,000 to £26,000/yr", sub: "HSBC UK HQ in Birmingham. Bristol: strong tech and sustainability sector. Rent: £650 to £850/month.", bg: "#6ee7b7", pct: 48 },
              ].map(r => (
                <div key={r.city} className="rpt-bar-row">
                  <div className="rpt-bar-label">{r.city}<small>{r.sub}</small></div>
                  <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                  <div className="rpt-bar-value">{r.range}</div>
                </div>
              ))}
            </div>

            <blockquote className="rpt-pullquote">
              <p>"A £29,000/yr London internship leaves you with roughly £500/month after rent and travel. A £23,500/yr Manchester internship often leaves you with more."</p>
            </blockquote>

            <p className="rpt-prose">The real advantage of London is concentration: nearly all investment banking, Magic Circle law, and MBB consulting internships are exclusively London-based. If you are targeting those sectors, you have no choice. For tech, consulting (Big 4), and most other sectors, Manchester, Edinburgh, and Bristol offer meaningful roles at lower cost with significantly higher disposable income. <strong>The exception is finance above £35,000/yr pro-rata: that entire tier is London only.</strong></p>
            <p className="rpt-source">Source: Glassdoor UK London intern salary (avg £28,381/yr), Indeed London intern (avg £29,391/yr), salary.com UK city internship data 2025, Rightmove UK rental market tracker Q1 2026, Numbeo UK cost of living index 2025</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">The UK recruitment calendar runs September to November. Most students discover it in January, by which time the best roles are gone.</h2>
              <p className="rpt-lead">The UK graduate and intern recruitment cycle is the most structured in the world. Finance, law, and consulting open applications in September and close in November. If you find out about spring weeks in February, you have already missed them for that year.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Application windows by firm type (starting from September of the academic year)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="calendarChart"></canvas></div>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">Spring Weeks (finance and law)</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["What they are", "1 to 2-week paid work experience at investment banks and law firms. For penultimate-year students. Not internships: insight programmes."],
                      ["When they happen", "March to April. Applications open October to November of the preceding year."],
                      ["Why they matter", "Spring week converts directly into summer internship offers at most banks. Summer internship converts to graduate offer. This is the pipeline."],
                      ["Pay", "£400 to £1,200 for the week. Plus accommodation in London (many firms pay this)."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ borderLeft: "3px solid #10b981", paddingLeft: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", textTransform: "uppercase" as const, letterSpacing: 1 }}>{title}</div>
                        <div style={{ fontSize: 14, color: "#525252", marginTop: 2, lineHeight: 1.55 }}>{detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Milk Round (consulting and general grad)</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["What it is", "The annual cycle where major employers visit universities to recruit. Now primarily online via company portals and platforms like Milkround and Bright Network."],
                      ["When it runs", "September to January. Peak window: October to November."],
                      ["Who uses it", "Big 4 accounting, consulting firms, FMCG, tech companies, law firms, government (Civil Service Fast Stream)."],
                      ["Key insight", "Applications are reviewed as they arrive. Applying in October for a November deadline gets a faster, less-competitive review than applying in the final week."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ borderLeft: "3px solid #10b981", paddingLeft: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", textTransform: "uppercase" as const, letterSpacing: 1 }}>{title}</div>
                        <div style={{ fontSize: 14, color: "#525252", marginTop: 2, lineHeight: 1.55 }}>{detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The pipeline that most students miss</div>
              <p>At Goldman Sachs, JPMorgan, and most major investment banks, the path to a graduate offer is: spring week in Year 2 (penultimate year) → summer internship offer → graduate offer. Students who skip the spring week and apply directly for summer internships are competing for a fraction of the available seats against candidates who already have a bank relationship. Apply for spring weeks in October of your penultimate year. That is the entry point for the best-paying internships in the UK.</p>
            </div>
            <p className="rpt-source">Source: eFinancialCareers UK banking internship calendar 2025/26, Vault internship rankings 2026, Goldman Sachs UK programme documentation, Milkround graduate recruitment guide 2025</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">Goldman accepts 0.8% of applicants. JPMorgan 0.9%. MBB around 1.5%. The numbers are brutal but the preparation path is known.</h2>
              <p className="rpt-lead">The top-paying UK internships are also the most competitive. Here is the acceptance data and what actually differentiates successful applicants.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Estimated acceptance rate by firm (%): lower is more selective</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="acceptanceChart"></canvas></div>
            </div>

            <p className="rpt-prose">These acceptance rates look extreme. But the denominator includes everyone who clicks "apply" including students with no relevant preparation. The effective acceptance rate among well-prepared candidates who pass initial screening is meaningfully higher. <strong>At investment banks, the written application (which asks about commercial awareness and motivation) screens out roughly 80% of applicants before any interview.</strong> At MBB consulting, the online verbal and numerical reasoning tests screen out a further 70%. Strong preparation at these two filters is where most of the leverage is.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-e">Watson Glaser</div><div className="rpt-lbl">Critical thinking test used by most UK law firms and many finance employers. Heavily practicable: 2 weeks of prep makes a measurable difference.</div></div>
              <div className="rpt-stat"><div className="rpt-val">SHL / Korn Ferry</div><div className="rpt-lbl">Numerical and verbal reasoning tests used by Big 4, FMCG, and many banks. Free practice tests available at SHL Direct.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">Pymetrics</div><div className="rpt-lbl">Cognitive and behavioural game-based assessment used by Goldman Sachs, JPMorgan, Unilever. Cannot be gamed but can be familiarised.</div></div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">What actually differentiates applications at this level</div>
              <p>Commercial awareness is tested explicitly in written applications and first-round interviews at every top-paying UK firm. This means knowing: what is happening in your target industry right now, what a specific deal or event means for the company you are applying to, and what the firm's competitive position is. Reading the FT for 15 minutes daily for 3 months before applying covers 90% of what is needed. The other 10% is research into the specific firm. Generic "I am passionate about finance" answers fail at screening. Specific answers about recent events in the sector pass.</p>
            </div>
            <p className="rpt-source">Source: Vault 2026 internship rankings, Goldman Sachs application process documentation, Wall Street Oasis UK acceptance rate estimates, Financial Times graduate recruitment survey 2025</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that passes UK ATS filters</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>UK companies expect a clean, 1-2 page CV without a photo. The Studojo resume builder outputs the right format in 5 minutes.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">International students get 20 hours/week during term and unlimited hours during breaks. The Graduate Route gives 2 years of open work rights post-study.</h2>
              <p className="rpt-lead">Two visa pathways matter for international students pursuing UK internships. The rules are different, the timing matters, and one of them is changing significantly in 2027.</p>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">UK visa pathways for international interns</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {[
                  {
                    name: "Student Visa (during study)",
                    sub: "For students currently enrolled at a UK university",
                    detail: "20 hours per week maximum during term time. Unlimited hours during official course breaks (summer, Easter, Christmas). Mandatory course placements are permitted if they do not exceed 50% of the total course duration. Self-employment is not permitted. Full-time summer internships are permitted during vacation periods with no additional paperwork.",
                    color: "#10b981",
                  },
                  {
                    name: "Graduate Route Visa (post-study)",
                    sub: "Available after completing a UK degree",
                    detail: "Work in any sector, at any level, without a sponsor or minimum salary requirement. Duration: 2 years for undergraduate and master's graduates, 3 years for doctoral graduates. CHANGE: From 1 January 2027, the duration drops to 18 months for undergrad and master's. Apply within the final 3 months of your student visa. This is the most flexible UK work visa and the primary route for post-degree internships and graduate programmes.",
                    color: "#10b981",
                  },
                  {
                    name: "Short-term study and work visa (for non-UK-based students)",
                    sub: "For students not enrolled at a UK university",
                    detail: "Indian citizens may apply for a Standard Visitor Visa or a Short-Term Study Visa to do limited work experience in the UK. In practice, most structured internships at UK companies require a proper work visa. The Graduate Route is the cleaner path if you have already studied in the UK. If applying from outside the UK, the company must sponsor you under the Skilled Worker route, which requires a salary minimum (£26,200/yr or role-specific threshold as of April 2025).",
                    color: "#34d399",
                  },
                ].map(r => (
                  <div key={r.name} style={{ borderLeft: `3px solid ${r.color}`, paddingLeft: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: "#737373", fontWeight: 500, marginBottom: 4 }}>{r.sub}</div>
                    <div style={{ fontSize: 14, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-e">20 hrs/wk</div><div className="rpt-lbl">Maximum work during term time on a Student Visa (degree-level students). Foundation/language students: 10 hrs/wk.</div></div>
              <div className="rpt-stat"><div className="rpt-val">2 years</div><div className="rpt-lbl">Graduate Route duration for undergrad and master's graduates. Dropping to 18 months from January 2027.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">£38,700</div><div className="rpt-lbl">Minimum salary for Skilled Worker visa sponsorship (general threshold, April 2025). Rises to £41,700 from July 2025. Required if applying from outside the UK without Graduate Route.</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The 2027 Graduate Route change and what it means now</div>
              <p>The UK government confirmed that from 1 January 2027, the Graduate Route for undergrad and master's graduates reduces from 2 years to 18 months. If you are planning to study in the UK and use the Graduate Route for post-graduation work experience, the 2-year window is still available for anyone who graduates before January 2027. This makes it worth factoring into your study timeline if you are considering a 1-year master's in the UK specifically to access the Graduate Route.</p>
            </div>
            <p className="rpt-source">Source: GOV.UK Graduate Visa official guidance (updated 2025), Study UK British Council Graduate Route page, UKVI Student Visa work conditions, Home Office Immigration Statistics 2025</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">The top skills for UK intern applications are not technical. Commercial awareness and verbal reasoning open more doors than Python.</h2>
              <p className="rpt-lead">Unlike Germany (where technical skills drive most pay differentiation) or the US (where LeetCode is the primary screen), the UK's top-paying internships screen heavily on commercial awareness, logical reasoning, and communication. Here is what actually matters by sector.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skills relevance to top-paying UK intern roles (% of application processes that test or require this)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="skillChart"></canvas></div>
            </div>

            <p className="rpt-prose">Commercial awareness is the single most-tested dimension across UK finance, consulting, and law applications. It is explicitly asked in written applications, tested in first-round interviews, and assessed in case studies. <strong>Verbal reasoning tests (Watson Glaser at law firms, SHL at banks and consulting) appear in 64% of top-paying UK intern application processes and are the most practicable filter.</strong> For tech roles, Python and SQL matter significantly but the UK tech internship market (Google, Microsoft, Arm, DeepMind) also screens for communication and product thinking, not just algorithmic speed.</p>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">Finance and law track</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Commercial awareness (FT literacy)", "Most tested. Read the FT daily from September."],
                      ["Watson Glaser / verbal reasoning", "Direct filter. Practice at FreeWatsonGlaser.com."],
                      ["Excel and financial modelling basics", "Expected for finance; tested at assessment centre."],
                      ["Bloomberg terminal basics", "Differentiating skill for finance roles at banks."],
                      ["Cover letter / motivation (specific, not generic)", "First filter. Specific to the firm and division."],
                    ].map(([skill, note]) => (
                      <div key={skill as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{skill}</div>
                          <div style={{ fontSize: 13, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Tech and consulting track</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Python / SQL (for data/tech roles)", "Strong screen for data engineering and SWE."],
                      ["Structured problem-solving (cases)", "MBB uses case interviews. Practise with 30 cases minimum."],
                      ["PowerPoint / structured slide logic", "All Big 4 and MBB assessment centres include a written exercise."],
                      ["Numerical reasoning (SHL)", "Big 4 and tech companies. Practice at SHL Direct."],
                      ["One real project or work experience", "Any evidence of initiative and delivery."],
                    ].map(([skill, note]) => (
                      <div key={skill as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{skill}</div>
                          <div style={{ fontSize: 13, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Glassdoor UK interview reports 2025, Wall Street Oasis UK banking interview guide, PrepLounge MBB UK interview data, FT Graduate Recruitment survey 2025, SHL assessment framework documentation</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">UK CV rules are different from India, Germany, and the US. No photo. Two pages maximum. Personal statement optional but expected at most firms.</h2>
              <p className="rpt-lead">Getting the format right is a prerequisite. UK recruiters filter on format before they read content. Here is what the standard UK application looks like and what platforms to use.</p>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">UK CV and application norms vs other markets</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                {[
                  { label: "No photo on CV", detail: "UK and US both default to no photo. Submitting a photo is unusual and can flag an applicant as unfamiliar with UK norms. The exception: some overseas-based companies operating in the UK may expect a photo. For UK firms (banks, law, consulting, Big 4), always omit.", flag: "green" },
                  { label: "1 to 2 pages maximum", detail: "UK recruiters expect a 1-page CV for students with under 2 years of experience and a 2-page CV for those with more. Three pages is considered too long for an intern application regardless of experience. Edit ruthlessly.", flag: "green" },
                  { label: "Cover letter / motivation letter", detail: "Most top UK employers require a cover letter or motivation statement (300 to 500 words). UK cover letters are more formal than US ones but less structured than German Anschreiben. Start with what you want and why this firm specifically. End with what you bring.", flag: "amber" },
                  { label: "Rolling application review", detail: "Most UK graduate programmes say they close in November but review applications as they receive them. Applying in October gets you reviewed against fewer competing applicants. Applying in late November (the last week before closing) gets you reviewed in a batch against the full pool. Earlier is strictly better.", flag: "amber" },
                  { label: "Key platforms", detail: "Milkround.com (most widely used UK grad/intern board), Bright Network (employer partnerships, early access), RateMyPlacement.co.uk (placement reviews from past interns), Prospects.ac.uk (broad graduate coverage), TargetJobs.co.uk (sector-specific graduate roles), LinkedIn (networking and direct applications), Glassdoor UK (salary data and interview prep).", flag: "neutral" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 4, borderRadius: 2, background: r.flag === "amber" ? "#f59e0b" : r.flag === "green" ? "#10b981" : "#e5e5e5", flexShrink: 0, alignSelf: "stretch" }}></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 14, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="rpt-source">Source: GOV.UK employment rights guidance, Milkround.com graduate recruitment guide 2025, Bright Network internship application data 2025, UCAS/Prospects CV formatting standards, RateMyPlacement.co.uk employer application requirements</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Internship Dojo to find paid internships in the UK, Europe, and beyond. Build a clean, ATS-ready CV in 5 minutes. Free.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/dojos/internships" className="rpt-btn-white">Find Internships</Link>
              <Link to="/dojos/careers" className="rpt-btn-outline">Build Your CV Free</Link>
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
  .rpt-badge { display:inline-flex; align-items:center; background:#10b981; border:2px solid #34d399; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { color:#6ee7b7; text-decoration:none; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
  .rpt-h1 em { font-style:italic; color:#6ee7b7; }
  .rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
  .rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #333; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; color:#6ee7b7; }
  .rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-cta-strip { background:#ecfdf5; border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
  .rpt-cta-pill { display:inline-flex; align-items:center; background:#10b981; color:#fff; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { margin-top:64px; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#10b981; margin-bottom:8px; }
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
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
  .rpt-du { background:#d0fae4; color:#065f46; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#ecfdf5; border-color:#10b981; } .rpt-cg { background:#d0fae4; border-color:#10b981; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#065f46; } .rpt-cg .rpt-cl { color:#065f46; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#6ee7b7; }
  .rpt-callout p { font-size:15px; line-height:1.7; }
  .rpt-pullquote { border-left:4px solid #10b981; padding:16px 20px; margin:24px 0; background:#ecfdf5; border-radius:0 12px 12px 0; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-bar-row { display:grid; grid-template-columns:190px 1fr 120px; align-items:center; gap:12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr; }
  .rpt-bar-label { font-size:13px; font-weight:500; color:#171717; line-height:1.35; }
  .rpt-bar-label small { display:block; font-size:12px; color:#737373; font-weight:400; }
  .rpt-bar-track { height:28px; background:#f5f5f5; border:1px solid #e5e5e5; border-radius:6px; overflow:hidden; }
  .rpt-bar-fill { height:100%; border-radius:6px 0 0 6px; display:flex; align-items:center; padding-left:10px; font-size:11px; font-weight:700; color:#fff; white-space:nowrap; }
  .rpt-bar-value { font-size:12px; font-weight:700; color:#171717; text-align:right; }
  .rpt-bar-value small { display:block; font-size:10px; color:#737373; font-weight:400; }
  .rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .rpt-col-head { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#737373; margin-bottom:12px; }
  .rpt-mini-total { border-radius:10px; padding:14px 16px; margin-top:14px; }
  .rpt-mini-total-label { font-size:11px; font-weight:700; }
  .rpt-inline-cta { background:#ecfdf5; border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
  .rpt-inline-cta-sub { font-size:13px; color:#525252; }
  .rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#10b981; color:#fff; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta { margin-top:64px; background:#10b981; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:#fff; margin-bottom:12px; }
  .rpt-final-cta-sub { font-size:15px; color:rgba(255,255,255,0.85); max-width:560px; margin:0 auto 28px; line-height:1.65; }
  .rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
  .rpt-btn-white { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:#fff; color:#171717; border:2px solid #171717; border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-white:hover { transform:translate(2px,2px); box-shadow:2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:rgba(255,255,255,0.15); color:#fff; border:2px solid rgba(255,255,255,0.5); border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.15s; }
  .rpt-btn-outline:hover { background:rgba(255,255,255,0.25); }
  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { border:2px solid #171717; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:700; }
  .rpt-pg { background:#d0fae4; color:#065f46; border-color:#10b981; } .rpt-po { background:#fef3c6; color:#92400e; border-color:#f59e0b; } .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#ef4444; }
  @media(max-width:640px){
    .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
    .rpt-bar-row{grid-template-columns:100px 1fr 80px;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr;}
    .rpt-two-col{grid-template-columns:1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
  }
`;
