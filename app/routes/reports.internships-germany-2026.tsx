import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

export function meta() {
  return [
    { title: "Do Interns in Germany Get Paid? Stipends, Laws and What to Expect in 2026 | Studojo" },
    { name: "description", content: "Germany's minimum wage rose to EUR 13.90/hour in January 2026 but mandatory internships remain exempt. DAX 40 companies pay EUR 1,500-3,000/month. The exact rules, city-by-city data, and how international students qualify." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "do interns in germany get paid, germany internship stipend 2026, internship salary germany, pflichtpraktikum bezahlung, germany internship minimum wage, international student internship germany" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/internships-germany-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Do Interns in Germany Get Paid? Stipends, Laws and What to Expect in 2026" },
    { property: "og:description", content: "Germany's minimum wage rose to EUR 13.90/hour in January 2026 but mandatory internships remain exempt. DAX 40 companies pay EUR 1,500-3,000/month. The exact rules, city-by-city data, and how international students qualify." },
    { property: "og:url", content: "https://studojo.com/reports/internships-germany-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:image:alt", content: "Studojo Career Market Report" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-01T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Do Interns in Germany Get Paid? Stipends, Laws and What to Expect in 2026 | Studojo" },
    { name: "twitter:description", content: "Germany minimum wage is EUR 13.90/hr (Jan 2026) but mandatory internships are exempt. DAX 40 pays EUR 1,500-3,000/month. Full breakdown for international students." },
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
  const GREEN2 = "#34d399";
  const RED = "#ef4444";
  const ORANGE = "#f97316";
  const MUTED = "#737373";
  const INK = "#171717";
  const grid = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1: Pay by company type (horizontal bar, range shown as grouped)
  make("companyChart", {
    type: "bar",
    data: {
      labels: ["Research Institute /\nUniversity", "NGO / Non-profit", "Startup\n(pre-Series B)", "Mittelstand\n(mid-sized German co)", "Consulting\n(Big 4, MBB)", "DAX 40\n(BASF, BMW, SAP)"],
      datasets: [
        { label: "Stipend: low (EUR/month)", data: [400, 400, 600, 800, 1200, 1500], backgroundColor: EMERALD3, borderRadius: 4, borderWidth: 0 },
        { label: "Stipend: high (EUR/month)", data: [800, 900, 1200, 1500, 2500, 3000], backgroundColor: EMERALD, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: EUR ${ctx.raw}` } },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => "EUR " + v } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 2: Pay by city
  make("cityChart", {
    type: "bar",
    data: {
      labels: ["Berlin", "Hamburg", "Cologne /\nDusseldorf", "Stuttgart /\nMunich", "Frankfurt"],
      datasets: [
        { label: "Avg stipend: low (EUR/month)", data: [800, 900, 900, 1100, 1200], backgroundColor: EMERALD3, borderRadius: 4, borderWidth: 0 },
        { label: "Avg stipend: high (EUR/month)", data: [1500, 1800, 1700, 2500, 3000], backgroundColor: EMERALD, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: EUR ${ctx.raw}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => "EUR " + v } },
      },
    },
  });

  // Chart 3: Pay by sector
  make("sectorChart", {
    type: "bar",
    data: {
      labels: ["Academic\nResearch", "NGO / Social", "Pharma /\nLife Sciences", "Tech /\nSoftware", "Engineering /\nAutomotive", "Finance /\nBanking", "Consulting\n(MBB, Big 4)"],
      datasets: [{
        label: "Median stipend (EUR/month)",
        data: [600, 650, 1100, 1300, 1400, 1800, 2200],
        backgroundColor: [EMERALD3, EMERALD3, EMERALD2, EMERALD2, EMERALD2, EMERALD, EMERALD],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` EUR ${ctx.raw}/month` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => "EUR " + v } },
      },
    },
  });

  // Chart 4: Language requirement by sector
  make("langChart", {
    type: "bar",
    data: {
      labels: ["Tech / SWE", "Finance (intl banks)", "Consulting (MBB / Big 4)", "Marketing", "Operations / Logistics", "HR / Admin", "Customer-facing roles"],
      datasets: [
        { label: "English-first roles (%)", data: [70, 55, 45, 30, 25, 20, 10], backgroundColor: GREEN, borderRadius: 4, borderWidth: 0 },
        { label: "Require B1+ German (%)", data: [30, 45, 55, 70, 75, 80, 90], backgroundColor: RED, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}%` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });

  // Chart 5: Skills that unlock top-paying roles
  make("skillChart", {
    type: "bar",
    data: {
      labels: ["Python / SQL\n(data/tech)", "Excel /\nPower BI", "CAD / SolidWorks\n(engineering)", "German B1+\n(non-tech)", "Bloomberg /\nFactSet (finance)", "English C1+\n(consulting)", "ML / PyTorch\n(AI roles)"],
      datasets: [{
        label: "Roles accessible with this skill (%)",
        data: [78, 65, 60, 58, 52, 71, 42],
        backgroundColor: [EMERALD, EMERALD, EMERALD2, EMERALD2, EMERALD3, EMERALD, EMERALD2],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of advertised roles` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });
}

export default function GermanyInternshipsReport() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Do Interns in Germany Get Paid? Stipends, Laws and What to Expect in 2026", "description": "Germany's minimum wage rose to EUR 13.90/hour in January 2026 but mandatory internships remain exempt. DAX 40 companies pay EUR 1,500-3,000/month. The exact rules, city-by-city data, and how international students qualify.", "url": "https://studojo.com/reports/internships-germany-2026", "datePublished": "2026-04-01T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/internships-germany-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Internships Germany 2026", "item": "https://studojo.com/reports/internships-germany-2026"}]}` }} />

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
              <span>Internships Germany 2026</span>
            </nav>
            <h1 className="rpt-h1">Do Interns in Germany<br /><em>Actually Get Paid?</em></h1>
            <p className="rpt-hero-sub">
              The answer is: it depends on one legal distinction most students have never heard of. Germany's minimum wage rose to EUR 13.90/hour on 1 January 2026. But one category of internship is fully exempt. DAX 40 companies pay up to EUR 3,000/month. Here is the full picture for 2026.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">EUR 13.90</div><div className="rpt-hlbl">Germany minimum wage per hour (Jan 2026, up from EUR 12.82 in 2025)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">EUR 2,404</div><div className="rpt-hlbl">Full-time equivalent monthly at Jan 2026 minimum wage</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Pay data, legal rules, city breakdowns, how to qualify</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for paid internships in Germany and Europe?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill">Find Europe Internships on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">There are two types of internship in Germany. One must be paid. One legally does not have to be.</h2>
              <p className="rpt-lead">The most important thing to know before applying for any internship in Germany is this legal distinction. Everything else: pay rates, city data, company type, all of it sits on top of this one foundational split.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Pflichtpraktikum (mandatory internship)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ borderLeft: "3px solid #10b981", paddingLeft: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>Definition</div>
                      <div style={{ fontSize: 13, color: "#171717", marginTop: 3, lineHeight: 1.6 }}>Required by your university as part of your degree programme. Must be documented as such in your enrollment certificate or study regulations.</div>
                    </div>
                    <div style={{ borderLeft: "3px solid #10b981", paddingLeft: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>Pay requirement</div>
                      <div style={{ fontSize: 13, color: "#171717", marginTop: 3, lineHeight: 1.6 }}>Exempt from minimum wage law regardless of duration. Companies can pay nothing legally. Most still pay EUR 400 to 900/month as a goodwill stipend.</div>
                    </div>
                    <div style={{ borderLeft: "3px solid #10b981", paddingLeft: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>Duration</div>
                      <div style={{ fontSize: 13, color: "#171717", marginTop: 3, lineHeight: 1.6 }}>No cap. Can run 3 months to a full year. The exemption applies for the entire compulsory period.</div>
                    </div>
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d1fae5", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>Bottom line</div>
                    <div style={{ fontSize: 12, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Legally unpaid is possible. In practice, most reputable companies still pay. Always ask explicitly before accepting.</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Freiwilliges Praktikum (voluntary internship)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ borderLeft: "3px solid #10b981", paddingLeft: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>Definition</div>
                      <div style={{ fontSize: 13, color: "#171717", marginTop: 3, lineHeight: 1.6 }}>Not required by your degree. Done by choice for experience, a career switch, or a gap period. This is most internships posted on LinkedIn and job boards.</div>
                    </div>
                    <div style={{ borderLeft: "3px solid #10b981", paddingLeft: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>Pay requirement</div>
                      <div style={{ fontSize: 13, color: "#171717", marginTop: 3, lineHeight: 1.6 }}>Under 3 months: exempt from minimum wage. Over 3 months: minimum wage of EUR 13.90/hour (2026) is legally required for every hour worked, applied retroactively from the very first day of work. No exceptions.</div>
                    </div>
                    <div style={{ borderLeft: "3px solid #10b981", paddingLeft: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: 1 }}>Duration</div>
                      <div style={{ fontSize: 13, color: "#171717", marginTop: 3, lineHeight: 1.6 }}>Most companies keep voluntary internships to 3 months or less specifically to stay below the mandatory pay threshold.</div>
                    </div>
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d0fae4", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>Bottom line</div>
                    <div style={{ fontSize: 12, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Beyond 3 months you are legally entitled to minimum wage. Know your duration before you sign anything.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-a">EUR 13.90</div><div className="rpt-lbl">Germany minimum wage per hour from 1 Jan 2026 (up from EUR 12.82 in 2025), Mindestlohnkommission</div></div>
              <div className="rpt-stat"><div className="rpt-val">3 months</div><div className="rpt-lbl">The threshold after which voluntary interns must be paid minimum wage regardless of agreement</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">EUR 2,404</div><div className="rpt-lbl">Approximate full-time equivalent monthly pay at 2026 minimum wage (173 hours at EUR 13.90)</div></div>
            </div>

            <p className="rpt-prose">The minimum wage law (Mindestlohngesetz, MiLoG) has applied since 2015. It rose to EUR 12.82/hour on 1 January 2025 and increased again to EUR 13.90/hour on 1 January 2026, set by the Mindestlohnkommission. <strong>The law is enforced: companies found in violation can face fines of up to EUR 500,000.</strong> Unpaid voluntary internships lasting beyond 3 months are illegal and reportable to the Zollverwaltung (customs authority), which enforces minimum wage compliance in Germany.</p>
            <p className="rpt-source">Source: Bundesministerium fur Arbeit und Soziales (BMAS) Mindestlohngesetz 2025, Mindestlohnkommission 2024 adjustment, DGB (Deutscher Gewerkschaftsbund) intern rights guide</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">DAX 40 companies pay EUR 1,500 to 3,000/month. Research institutes pay EUR 400 to 800. The gap is 5x.</h2>
              <p className="rpt-lead">Internship pay in Germany varies by company type more than by almost any other factor. Here is what each company type typically pays, based on reported data from Glassdoor DE, LinkedIn Salary, and the Bundesagentur fur Arbeit.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Internship stipend range by company type (EUR/month): low to high</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="companyChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-a">EUR 2,500</div><div className="rpt-lbl">McKinsey / BCG / Bain Germany intern median stipend (Glassdoor DE, 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val">EUR 1,800</div><div className="rpt-lbl">BMW, BASF, SAP, Deutsche Bank median intern stipend (company confirmed data, 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">EUR 650</div><div className="rpt-lbl">Typical NGO and research institute stipend: subsidised cost-of-living, not market wage</div></div>
            </div>

            <p className="rpt-prose">DAX 40 companies treat internships as a talent pipeline and pay accordingly. BMW specifically lists EUR 1,100 to 2,100 for engineering interns and EUR 1,400 to 2,800 for business and finance tracks (BMW Werkstudent / Praktikant programme, 2025 data). SAP pays EUR 1,600 to 2,200 for software engineering interns. <strong>German Mittelstand companies (the hidden backbone of the economy: firms like Bosch, Siemens Healthineers, Trumpf, Krones) consistently pay EUR 800 to 1,500 and offer some of the best technical training in Europe.</strong> The less visible upside of Mittelstand internships is real-world scope: at a company with 500 employees, an intern owns entire workstreams.</p>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The Werkstudent option: better pay, longer relationship</div>
              <p>A Werkstudent (working student) role is not a Praktikant (intern). It is a part-time employment contract of 20 hours/week during the semester, full-time during breaks. Werkstudent roles are not subject to the Mindestlohn exemption: they follow standard employment law and typically pay EUR 15 to 25/hour. For students enrolled in a German university, this is almost always the better financial option compared to a standard Pflichtpraktikum if duration exceeds 3 months.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor DE intern salary data 2025, BMW Praktikant programme 2025, SAP student programme listing data, Bundesagentur fur Arbeit Entgeltatlas 2025</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find paid internships across Europe and Germany</div>
                <div className="rpt-inline-cta-sub">The Internship Dojo surfaces roles in Germany, UK, Singapore and more. Filter by pay, sector and location.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary">Find Europe Roles</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Frankfurt pays the most. Berlin pays the least, but has the most roles. The city choice is a trade-off.</h2>
              <p className="rpt-lead">Germany is not a single market. City matters both for pay and for which sectors are accessible. Here is where the money is and what each city is actually good for as an intern destination.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Internship stipend range by city (EUR/month): low to high</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="cityChart"></canvas></div>
            </div>

            <div className="rpt-bar-list" style={{ marginTop: 16 }}>
              {[
                { city: "Frankfurt am Main", range: "EUR 1,200 to 3,000", sub: "Finance, banking, Big 4. Deutsche Bank, Commerzbank, Goldman Sachs, DWS, ECB all headquartered here.", bg: "#10b981", pct: 100 },
                { city: "Munich", range: "EUR 1,100 to 2,500", sub: "Automotive (BMW HQ, MAN), tech (Google Munich, AWS), insurance (Allianz, Munich Re), consulting.", bg: "#34d399", pct: 85 },
                { city: "Stuttgart", range: "EUR 1,000 to 2,200", sub: "Engineering and automotive core: Daimler, Bosch, Porsche. Some of the best engineering internships in Europe.", bg: "#34d399", pct: 77 },
                { city: "Hamburg", range: "EUR 900 to 1,800", sub: "Shipping/logistics (Hapag-Lloyd), media (Axel Springer), e-commerce (Otto). Strong for marketing and operations.", bg: "#6ee7b7", pct: 65 },
                { city: "Berlin", range: "EUR 800 to 1,500", sub: "Startup capital of Germany. Most English-friendly. Zalando, N26, HelloFresh, Delivery Hero. Lower pay, higher volume.", bg: "#6ee7b7", pct: 55 },
              ].map(r => (
                <div key={r.city} className="rpt-bar-row">
                  <div className="rpt-bar-label">{r.city}<small>{r.sub}</small></div>
                  <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                  <div className="rpt-bar-value">{r.range}</div>
                </div>
              ))}
            </div>

            <blockquote className="rpt-pullquote">
              <p>"Berlin has more internship listings than any other German city. It also has the highest rent-to-stipend ratio. Factor cost of living before you accept."</p>
            </blockquote>

            <p className="rpt-prose">Berlin is the default destination for international students because it is the most English-friendly German city, has the highest startup density, and has the most volume of listings on LinkedIn and Glassdoor DE. But Berlin also has the lowest average stipend of any major German city and rising rents. A EUR 1,000/month internship in Berlin leaves less disposable income than a EUR 1,000/month internship in Leipzig or Dresden. <strong>Munich and Stuttgart offer the best pay-to-cost-of-living ratio for well-compensated internships in engineering, automotive, and insurance sectors.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Cost of living reality check (2025 data)</div>
              <p>Average rent for a single room in shared housing (WG-Zimmer): Berlin EUR 750-950/month, Munich EUR 850-1,100/month, Frankfurt EUR 800-1,050/month, Hamburg EUR 700-900/month, Stuttgart EUR 700-850/month. At a EUR 1,000/month internship, rent alone absorbs 75 to 95% of your stipend in any major German city. DAAD scholarships, university dormitory allocations, and WG listings on WG-Gesucht.de are the standard solutions. Apply for accommodation 3 to 4 months before your start date.</p>
            </div>
            <p className="rpt-source">Source: WG-Gesucht.de city rent index Q1 2026, Numbeo Germany cost of living 2025, Glassdoor DE city salary data, Stepstone Gehaltsreport 2025</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">Consulting interns earn EUR 2,200/month median. Academic research interns earn EUR 600. Sector choice matters as much as company type.</h2>
              <p className="rpt-lead">After company type and city, sector is the third strongest predictor of internship pay in Germany. Here is the median monthly stipend by sector, based on reported intern data.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Median internship stipend by sector (EUR/month)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="sectorChart"></canvas></div>
            </div>

            <p className="rpt-prose">Consulting (MBB and Big 4) consistently pays the highest intern stipends in Germany, reflecting the intense hours, travel expectations, and client-facing nature of the work. Finance internships at investment banks and private equity firms follow closely, with Goldman Sachs Frankfurt paying EUR 2,500 to 3,000/month for summer analyst interns. <strong>Engineering internships at automotive companies offer a strong combination of technical depth and pay: BMW, Porsche, and Bosch all run structured intern programmes at EUR 1,000 to 2,400/month with significant real project exposure.</strong> Tech pays solidly at EUR 1,300/month median but the range is wide depending on company stage.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-a">EUR 2,800</div><div className="rpt-lbl">Goldman Sachs Frankfurt summer intern stipend (reported, 2025). Deutsche Bank similar.</div></div>
              <div className="rpt-stat"><div className="rpt-val">EUR 1,800</div><div className="rpt-lbl">SAP, Google Munich, Siemens tech intern median (Glassdoor DE + LinkedIn Salary, 2025)</div></div>
              <div className="rpt-stat"><div className="rpt-g rpt-val">EUR 1,200</div><div className="rpt-lbl">DAAD-funded research internship average stipend: below market but includes scholarship support</div></div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The pharma exception worth knowing</div>
              <p>Germany is home to three of the world's largest pharmaceutical companies: Bayer (Leverkusen), BASF (Ludwigshafen, chemicals/pharma), and Merck KGaA (Darmstadt). Their intern programmes pay EUR 900 to 1,600/month and are among the most structured in Europe. Research internships include access to lab infrastructure that rivals top universities. The application window opens 5 to 6 months before the start date and is competitive: apply early with a clear research angle in your cover letter.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor DE intern salary reports 2025, LinkedIn Salary Germany 2025, Stepstone Praktikum Gehaltsreport 2025, company-confirmed programme data (BMW, SAP, Goldman Sachs Frankfurt)</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">54% of tech roles are English-first. 50%+ of non-tech roles require B1+ German. The language barrier is real but navigable.</h2>
              <p className="rpt-lead">Language is the single biggest barrier for international students pursuing German internships. But the picture is not uniform. Sector determines how hard the language barrier actually is in practice.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">English-first vs German-required roles by sector (%)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="langChart"></canvas></div>
            </div>

            <p className="rpt-prose">Tech and software engineering roles in Germany are the most international-friendly sector. Around 54% of IT job postings require English (Bundesagentur fur Arbeit, 2025), making tech the clearest path for non-German speakers. Most major tech companies: SAP, Google, Microsoft, Amazon, Zalando, N26, Delivery Hero have declared English as their working language. <strong>Finance is split: international banks (Goldman, JPMorgan, Deutsche Bank in international divisions) operate in English, but German-owned Mittelstand finance firms and regional banks require German fluency.</strong> Around 50% of non-tech employers prioritise B1 German or above. Marketing, HR, customer-facing, and operations roles require German in the large majority of cases.</p>

            <div className="rpt-pill-row">
              {["Tech / SWE (English-first)", "Finance: intl banks (English OK)", "Consulting: MBB (bilingual OK)"].map(p => <span key={p} className="rpt-pill rpt-pg">{p}</span>)}
              {["Marketing at German cos", "Operations / Logistics"].map(p => <span key={p} className="rpt-pill rpt-po">{p}</span>)}
              {["HR / Admin / Customer-facing"].map(p => <span key={p} className="rpt-pill rpt-pr">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">How to learn German fast enough to qualify</div>
              <p>B1 proficiency (conversational, can handle workplace situations) typically takes 350 to 450 hours of study for an English speaker, or 500 to 600 hours for a non-European language speaker. At 2 hours/day, that is 6 to 9 months of consistent study. Resources: Goethe Institut courses (recognised for visa purposes), Deutsche Welle online courses (free), Tandem language exchange apps. A B1 Goethe Zertifikat listed on your resume opens the majority of German-language internship roles that would otherwise screen you out. For tech roles in Berlin, English alone is sufficient.</p>
            </div>
            <p className="rpt-source">Source: Bundesagentur fur Arbeit internship JD language analysis 2025, DAAD language requirement data, Goethe Institut B1 curriculum hours, Glassdoor DE job description corpus</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that clears German ATS filters</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>German companies use ATS systems that are strict about formatting. The Studojo resume builder outputs a clean, ATS-safe PDF in 5 minutes.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">International students can intern in Germany on a student visa with up to 140 full working days per year.</h2>
              <p className="rpt-lead">If you are an international student studying in India, you can intern in Germany via multiple legal pathways. Here is exactly what each route involves and what it costs in time and paperwork.</p>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">Pathways for international students to intern in Germany</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {[
                  {
                    name: "DAAD RISE Programme",
                    sub: "Research Internships in Science and Engineering",
                    detail: "12 weeks at German research universities and institutes. Fully funded: EUR 650 to 750/month stipend + travel grant. For students in science, engineering, and computer science. Application opens October for summer placements. Acceptance rate approximately 22% (2,358 applications for 527 offers in Summer 2024).",
                    color: "#10b981",
                  },
                  {
                    name: "DAAD Scholarship for Study-Related Internships",
                    sub: "Studienrelevantes Praktikum im Ausland",
                    detail: "For students at German universities doing a Pflichtpraktikum abroad, or Indian students at partner institutions. Monthly scholarship of EUR 300 plus travel subsidy. Application through your university's international office.",
                    color: "#34d399",
                  },
                  {
                    name: "German Student Visa (Visum zur Stellensuche / Schengen Work Entitlement)",
                    sub: "For students enrolled at a German university",
                    detail: "Students on a German Aufenthaltserlaubnis (residence permit for study) may work up to 120 full days or 240 half days per year. Internships count as work. No additional work permit needed. Notify your Auslanderamt if switching from study to internship mode.",
                    color: "#6ee7b7",
                  },
                  {
                    name: "Indian Student on Schengen Visa (short internship)",
                    sub: "For internships under 90 days",
                    detail: "Indian citizens can enter Germany on a national visa (Typ D) for an internship up to 90 days. Requires: invitation letter from the German company, proof of funding (EUR 700 to 1,000/month), and university enrollment documentation. Apply 8 to 12 weeks in advance at the German consulate.",
                    color: "#6ee7b7",
                  },
                ].map(r => (
                  <div key={r.name} style={{ borderLeft: `3px solid ${r.color}`, paddingLeft: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#171717" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#737373", fontWeight: 500, marginBottom: 4 }}>{r.sub}</div>
                    <div style={{ fontSize: 13, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-a">120 days</div><div className="rpt-lbl">Full working days allowed per year for students on a German study residence permit (Aufenthaltsgesetz)</div></div>
              <div className="rpt-stat"><div className="rpt-val">8-12 weeks</div><div className="rpt-lbl">Typical visa processing time from Indian consulates for German national visa applications</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">~22%</div><div className="rpt-lbl">Acceptance rate for DAAD RISE (2024 data: 527 offers from 2,358 applications). Based on research fit, not college brand.</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The DAAD RISE application in practice</div>
              <p>DAAD RISE is the most structured entry point for non-EU students wanting a paid German internship without being enrolled in a German university. The application requires: a 1-page research statement (must align with a specific German professor's research group), academic transcripts, and a language certificate if non-English research is involved. Start by browsing the DAAD RISE project database at daad.de/rise and identifying 3 to 5 matching projects before writing your statement. Generic applications are rejected. Tailored ones that demonstrate you read the supervisor's papers succeed.</p>
            </div>
            <p className="rpt-source">Source: DAAD RISE programme official guidelines 2025/2026, Bundesamt fur Migration und Fluchtlinge (BAMF) student work entitlement rules, German consulate India visa requirements 2025</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">The skills that unlock top-paying German internships are specific and learnable in 3 to 4 months.</h2>
              <p className="rpt-lead">Pay in Germany correlates strongly with skill specificity. Roles asking for generic "communication skills" and "MS Office" pay at the bottom. Roles asking for specific technical competencies pay 2 to 5x more. Here is what actually opens doors.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skills that expand the pool of roles accessible to you (% of advertised intern JDs)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="skillChart"></canvas></div>
            </div>

            <p className="rpt-prose">Python and SQL together appear in 78% of data and tech intern JDs across Germany. Excel and Power BI appear in 65% of business, finance, and operations JDs. CAD (SolidWorks, CATIA, AutoCAD) appears in 60% of engineering and automotive JDs. <strong>English C1+ is mentioned in 71% of consulting and MBB-adjacent JDs.</strong> German B1+ appears in 58% of all non-tech JDs. The pattern is clear: one specific technical skill (Python for data, CAD for engineering, Bloomberg for finance) combined with either strong English or German fluency is the profile that commands EUR 1,500/month and above.</p>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">Tech and data track</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Python (pandas, scikit-learn)", "Opens 78% of data/ML roles"],
                      ["SQL (intermediate)", "Required in 62% of analytics and product roles"],
                      ["Git / GitHub", "Expected baseline at all tech companies"],
                      ["One deployed project", "The credibility signal that replaces work experience"],
                    ].map(([skill, note]) => (
                      <div key={skill as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{skill}</div>
                          <div style={{ fontSize: 11, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Business and finance track</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Excel (pivot tables, VLOOKUP, financial modelling)", "Mentioned in 65% of finance and ops JDs"],
                      ["Bloomberg / FactSet terminal basics", "Separates finance interns: most don't have it"],
                      ["PowerPoint (structured storytelling)", "Consulting screens use a slide-building task"],
                      ["German B1 (or active progress toward it)", "Required in 58% of German-company non-tech JDs"],
                    ].map(([skill, note]) => (
                      <div key={skill as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{skill}</div>
                          <div style={{ fontSize: 11, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Bundesagentur fur Arbeit intern JD skill frequency analysis 2025, Glassdoor DE skill mentions, DAAD intern programme skill requirements, Stepstone Praktikum report 2025</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">The application process is different from India, the UK, and the US. Knowing the German norms is half the battle.</h2>
              <p className="rpt-lead">German hiring culture has specific norms that, if you are used to Indian or American application processes, will feel unusual. Getting these right is the difference between a callback and silence.</p>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">What is different about German intern applications vs India / US</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                {[
                  { label: "Bewerbungsmappe format", detail: "German applications traditionally include: Anschreiben (cover letter, 1 page), Lebenslauf (CV, 1 to 2 pages, photo expected at most traditional companies), and Zeugnisse (certificates of academic achievement, previous employment, and internship references). For international applicants at modern tech companies, a standard English-language CV without a photo is increasingly accepted.", flag: "amber" },
                  { label: "Photo on CV", detail: "Standard in Germany and still expected at most DAX 40 companies, insurance firms, and Mittelstand companies. Not required at startups and international tech firms. Use a professional headshot (not a passport photo). Omitting it at a traditional company can signal unfamiliarity with German norms.", flag: "neutral" },
                  { label: "Motivationsschreiben matters more than in India", detail: "German recruiters read cover letters. A 1-page Anschreiben that connects your specific skills to the company's specific team is expected and valued. Generic templates get filtered fast. Mention the Stadteil (district) you are targeting if it is a city-specific role. Show you know the company beyond their homepage.", flag: "amber" },
                  { label: "Response times are slow by Indian standards", detail: "Expect 2 to 4 weeks between application and first response, and 4 to 8 weeks total from application to offer. Germany moves deliberately. Following up after 3 weeks is appropriate and expected. Following up before 2 weeks is considered pushy.", flag: "neutral" },
                  { label: "References (Zeugnisse) are standard documents", detail: "Any previous internship or job in Germany should have resulted in an Arbeitszeugnis (work reference letter) from the employer, written in a formalised style with a specific scoring system embedded in neutral-sounding language. Ask for this before leaving any German workplace.", flag: "green" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 4, borderRadius: 2, background: r.flag === "amber" ? "#10b981" : r.flag === "green" ? "#10b981" : "#e5e5e5", flexShrink: 0, alignSelf: "stretch" }}></div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#171717", marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 13, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Where to find German internship listings as an international student</div>
              <p>Primary sources: LinkedIn Jobs (Germany filter), Stepstone.de, Indeed.de, Xing (German LinkedIn equivalent, widely used by Mittelstand companies), and direct company career pages. For academic and research internships: DAAD portal (daad.de), Research in Germany (research-in-germany.org), and direct university department pages. For startups: Wellfound (previously AngelList), German Accelerator partner company pages, and Berlin-based job boards like StartupJobs.de. Apply via official portals: do not cold-email German hiring managers. It is considered inappropriate in German professional culture.</p>
            </div>
            <p className="rpt-source">Source: Bundesagentur fur Arbeit Ausbildung und Praktikum portal, DAAD intern programme documentation, Glassdoor DE German hiring culture survey 2025, Intercultures Germany workplace norms report</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Internship Dojo to find paid internships in Germany, Europe, and beyond. Build an ATS-ready resume in 5 minutes. Free.</p>
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
  .rpt-source { font-size:11px; color:#a3a3a3; margin-top:16px; }
  .rpt-card { background:#fff; border:2px solid #171717; border-radius:20px; padding:28px; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); margin-bottom:20px; }
  .rpt-card-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#737373; margin-bottom:16px; }
  .rpt-chart-wrap { position:relative; }
  .rpt-chart-wrap canvas { width:100%!important; }
  .rpt-stat-row { display:grid; gap:16px; margin-bottom:20px; }
  .rpt-c2 { grid-template-columns:repeat(2,1fr); }
  .rpt-c3 { grid-template-columns:repeat(3,1fr); }
  .rpt-c4 { grid-template-columns:repeat(4,1fr); }
  .rpt-stat { background:#f5f5f5; border:2px solid #171717; border-radius:16px; padding:18px 16px; }
  .rpt-val { font-family:'Clash Display',sans-serif; font-size:28px; font-weight:700; line-height:1; margin-bottom:6px; }
  .rpt-a { color:#10b981; } .rpt-b { color:#3b82f6; } .rpt-v { color:#8b5cf6; } .rpt-g { color:#10b981; } .rpt-o { color:#10b981; }
  .rpt-lbl { font-size:12px; color:#525252; line-height:1.45; font-weight:500; }
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
  .rpt-du { background:#d0fae4; color:#065f46; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#ecfdf5; border-color:#10b981; } .rpt-cg { background:#d0fae4; border-color:#10b981; } .rpt-co { background:#d1fae5; border-color:#10b981; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#065f46; } .rpt-cg .rpt-cl { color:#065f46; } .rpt-co .rpt-cl { color:#065f46; } .rpt-cd .rpt-cl { color:#6ee7b7; }
  .rpt-callout p { font-size:14px; line-height:1.7; }
  .rpt-pullquote { border-left:4px solid #10b981; padding:16px 20px; margin:24px 0; background:#ecfdf5; border-radius:0 12px 12px 0; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-bar-row { display:grid; grid-template-columns:190px 1fr 80px; align-items:center; gap:12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr; }
  .rpt-bar-label { font-size:12px; font-weight:500; color:#171717; line-height:1.35; }
  .rpt-bar-label small { display:block; font-size:11px; color:#737373; font-weight:400; }
  .rpt-bar-track { height:28px; background:#f5f5f5; border:1px solid #e5e5e5; border-radius:6px; overflow:hidden; }
  .rpt-bar-fill { height:100%; border-radius:6px 0 0 6px; display:flex; align-items:center; padding-left:10px; font-size:11px; font-weight:700; color:#fff; white-space:nowrap; }
  .rpt-bar-value { font-size:12px; font-weight:700; color:#171717; text-align:right; }
  .rpt-bar-value small { display:block; font-size:10px; color:#737373; font-weight:400; }
  .rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .rpt-col-head { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#737373; margin-bottom:12px; }
  .rpt-mini-total { border-radius:10px; padding:14px 16px; margin-top:14px; }
  .rpt-mini-total-label { font-size:11px; font-weight:700; }
  .rpt-donut-layout { display:grid; grid-template-columns:200px 1fr; gap:32px; align-items:center; }
  .rpt-legend-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-legend-item { display:flex; align-items:center; gap:12px; }
  .rpt-legend-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; border:2px solid; }
  .rpt-legend-text { font-size:13px; color:#171717; flex:1; font-weight:500; }
  .rpt-legend-pct { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; }
  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { border:2px solid #171717; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:700; }
  .rpt-pg { background:#d0fae4; color:#065f46; border-color:#10b981; } .rpt-po { background:#d1fae5; color:#065f46; border-color:#10b981; } .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#ef4444; }
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
  @media(max-width:640px){
    .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
    .rpt-bar-row{grid-template-columns:110px 1fr 50px;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr;}
    .rpt-donut-layout{grid-template-columns:1fr;} .rpt-two-col{grid-template-columns:1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
  }
`;
