import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

export function meta() {
  return [
    { title: "Australia Internship Pay 2026: Salaries, Fair Work Rules and Graduate Program Guide | Studojo" },
    { name: "description", content: "Australia's minimum wage is AUD $24.95/hour. Canva pays AUD $80-110k/year. Rio Tinto pays AUD $30-35/hour. The Fair Work Act rules on unpaid internships, grad program timing, and the 48-hour student visa limit explained." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "australia internship pay 2026, internship salary australia, graduate program australia, canva internship, rio tinto internship, fair work unpaid internship, student visa work hours australia" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/internships-australia-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Australia Internship Pay 2026: Salaries, Fair Work Rules and Graduate Program Guide" },
    { property: "og:description", content: "Australia's minimum wage is AUD $24.95/hour. Canva pays AUD $80-110k/year. Rio Tinto pays AUD $30-35/hour. Fair Work Act unpaid internship rules, grad program timing, and student visa limits explained." },
    { property: "og:url", content: "https://studojo.com/reports/internships-australia-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:image:alt", content: "Studojo Career Market Report" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-01T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Australia Internship Pay 2026: Salaries and Fair Work Rules | Studojo" },
    { name: "twitter:description", content: "AUD $24.95/hr minimum wage. Canva pays AUD $80-110k/yr. Rio Tinto AUD $30-35/hr. Fair Work unpaid internship rules and grad program timeline explained." },
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

  // Chart 1: Pay by sector (AUD annual)
  make("sectorChart", {
    type: "bar",
    data: {
      labels: ["NGO /\nNon-profit", "Government\n(entry)", "Marketing /\nMedia", "Finance\n(general)", "Healthcare\n(medical)", "Mining\n(Rio Tinto)", "Tech\n(general)", "Finance\n(IB analyst)", "Tech\n(Canva)"],
      datasets: [{
        label: "Annual equivalent (AUD)",
        data: [0, 52000, 55000, 58958, 81500, 65000, 70000, 140000, 95000],
        backgroundColor: [RED, EMERALD3, EMERALD3, EMERALD2, EMERALD2, EMERALD2, EMERALD2, EMERALD, EMERALD],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ctx.raw === 0 ? " Often unpaid (charity exemption)" : ` AUD $${ctx.raw.toLocaleString()}/yr` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v === 0 ? "$0" : "$" + (v / 1000) + "k" } },
      },
    },
  });

  // Chart 2: Pay by city (AUD annual)
  make("cityChart", {
    type: "bar",
    data: {
      labels: ["Canberra\n(govt focus)", "Melbourne", "Brisbane", "Sydney", "Perth\n(mining premium)"],
      datasets: [
        { label: "Annual low (AUD)", data: [48000, 58000, 42000, 59000, 57000], backgroundColor: EMERALD3, borderRadius: 4, borderWidth: 0 },
        { label: "Annual high (AUD)", data: [65000, 70000, 77000, 75000, 87000], backgroundColor: EMERALD, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: AUD $${ctx.raw.toLocaleString()}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => "$" + (v / 1000) + "k" } },
      },
    },
  });

  // Chart 3: Grad program application timeline (months from February)
  make("timelineChart", {
    type: "bar",
    data: {
      labels: ["Australian Govt\n(AGGP)", "Big 4\nConsulting", "Big 4 Banks\n(CBA, Westpac)", "Mining\n(BHP, Rio Tinto)", "MBB\nConsulting", "Tech\n(Atlassian, Canva)", "IB\n(Goldman, JPM)"],
      datasets: [
        { label: "Applications open (month)", data: [1, 1, 2, 2, 2, 3, 2], backgroundColor: EMERALD3, borderRadius: 3, borderWidth: 0 },
        { label: "Applications close (month)", data: [3, 5, 5, 3, 5, 5, 4], backgroundColor: EMERALD, borderRadius: 3, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const months = ["", "Feb/Mar", "Mar/Apr", "Apr/May", "May/Jun", "Jun/Jul"];
              return ` ${ctx.dataset.label}: ~${months[ctx.raw] || ctx.raw}`;
            }
          }
        },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => { const m = ["", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]; return m[v] || ""; } } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 4: Top companies intern pay (AUD/hour)
  make("companyChart", {
    type: "bar",
    data: {
      labels: ["NGO /\nCharity", "Government\n(grad)", "BHP /\nRio Tinto", "Big 4\nBanks", "Deloitte /\nPwC / EY", "Goldman /\nJPMorgan", "Atlassian", "Canva"],
      datasets: [{
        label: "Approx hourly rate (AUD)",
        data: [0, 25, 32, 28, 31, 58, 35, 46],
        backgroundColor: [RED, EMERALD3, EMERALD2, EMERALD2, EMERALD2, EMERALD, EMERALD2, EMERALD],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ctx.raw === 0 ? " Often unpaid" : ` AUD $${ctx.raw}/hour` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => "$" + v + "/hr" } },
      },
    },
  });

  // Chart 5: Skills most valued
  make("skillChart", {
    type: "bar",
    data: {
      labels: ["Python / SQL\n(data/tech)", "Excel /\nPower BI", "CAD\n(engineering)", "Commercial\nawareness", "Work Integrated\nLearning (WIL)", "Teamwork /\nadaptability", "AI /\ndata science"],
      datasets: [{
        label: "Priority for top employers (%)",
        data: [72, 65, 55, 80, 75, 82, 68],
        backgroundColor: [EMERALD2, EMERALD2, EMERALD3, EMERALD, EMERALD, EMERALD, EMERALD2],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of top employers prioritise this` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });
}

export default function AustraliaInternshipsReport() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Australia Internship Pay 2026: Salaries, Fair Work Rules and Graduate Program Guide", "description": "Australia's minimum wage is AUD $24.95/hour. Canva pays AUD $80-110k/year. Rio Tinto pays AUD $30-35/hour. The Fair Work Act rules on unpaid internships, grad program timing, and the 48-hour student visa limit explained.", "url": "https://studojo.com/reports/internships-australia-2026", "datePublished": "2026-04-01T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/internships-australia-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Australia Internships 2026", "item": "https://studojo.com/reports/internships-australia-2026"}]}` }} />

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
              <span>Australia Internships 2026</span>
            </nav>
            <h1 className="rpt-h1">Australia Internships in 2026:<br /><em>What You Actually Get Paid</em></h1>
            <p className="rpt-hero-sub">
              Australia's minimum wage is AUD $24.95/hour. Unpaid internships are still legal but narrowly so. Canva pays AUD $90,000 to $110,000 annualised. Rio Tinto pays AUD $32/hour. And the application window for the best roles closes in April, for a role starting in January.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">AUD $24.95</div><div className="rpt-hlbl">National Minimum Wage per hour (from 1 July 2025)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">AUD $65,500</div><div className="rpt-hlbl">Average internship salary across all sectors (Glassdoor AU 2025)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Pay data, legal rules, mining sector, grad timelines, visa limits</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for paid internships in Australia and the Asia-Pacific?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill">Find Australia Internships on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">Unpaid internships are legal in Australia only under one narrow condition. Most "unpaid" roles at for-profit businesses are not legal.</h2>
              <p className="rpt-lead">The Fair Work Act 2009 is specific. An unpaid internship is legal only if it is a genuine vocational placement: structured learning, no productive work for the employer, and part of a formal educational course. Everything else requires pay.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Unpaid is legal only if all of these are true:</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Vocational placement", "Must be part of a formal educational or training program (university, TAFE, recognised qualification)."],
                      ["No productive work", "The intern observes, learns, or completes structured training tasks. They do not produce work that benefits the employer commercially."],
                      ["Primary benefit to intern", "The learning benefit must accrue to the intern, not the organisation."],
                      ["Genuine educational structure", "Supervisor, learning objectives, formal assessment. Not just cheap labour with an educational label."],
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
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>In practice</div>
                    <div style={{ fontSize: 14, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Most university-required placements qualify. Most startup or agency "internships" where you run social media or do design work do not.</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">If you are doing real work, you must be paid:</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Any productive task", "Writing content, managing social media, designing assets, doing research that the employer uses."],
                      ["Set hours or deliverables", "If the employer can direct your work, set your hours, or expect output, you are an employee."],
                      ["Ongoing work relationship", "If you are expected to return, expected to meet deadlines, or treated as part of the team, minimum wage applies."],
                      ["Revenue-generating work", "If what you produce is sold or used commercially by the employer, you must be paid."],
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
                    <div className="rpt-mini-total-label" style={{ color: "#991b1b" }}>The penalty</div>
                    <div style={{ fontSize: 14, color: "#525252", marginTop: 4, lineHeight: 1.6 }}>Employers found in breach of the Fair Work Act face civil penalties of up to AUD $93,900 per contravention (for companies); serious contraventions can reach AUD $469,500. The Fair Work Ombudsman actively investigates complaints.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-e">AUD $24.95</div><div className="rpt-lbl">National Minimum Wage per hour from 1 July 2025 (3.5% increase). Weekly: AUD $948 based on 38-hour week.</div></div>
              <div className="rpt-stat"><div className="rpt-val">AUD $31.19</div><div className="rpt-lbl">Casual minimum wage (includes 25% casual loading). Applies if you work casual hours rather than fixed contract.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">AUD $93,900</div><div className="rpt-lbl">Maximum civil penalty per contravention for companies (standard). Serious contraventions: up to AUD $469,500. Investigated by the Fair Work Ombudsman.</div></div>
            </div>

            <p className="rpt-prose">The Fair Work Ombudsman runs an anonymous tip line and actively investigates complaints. High-profile cases have involved fashion brands, hospitality businesses, and marketing agencies. <strong>The test is not whether both parties agreed to unpaid work: voluntary agreement to work for free does not make unpaid work legal under Australian employment law.</strong> The relationship is assessed objectively based on what the intern actually does, not what the contract says.</p>
            <p className="rpt-source">Source: Fair Work Ombudsman vocational placements and work experience guidance (2025), Fair Work Act 2009 Section 12 definition, Study Australia internship legal framework, LawPath unpaid internship legality guide Australia 2025</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">Canva pays AUD $90,000 to $110,000 annualised. Rio Tinto pays AUD $32/hour. The top of Australian intern pay is genuinely world-class.</h2>
              <p className="rpt-lead">Australian intern pay at the top end competes with London and Singapore. The difference is which sectors lead. In Australia, tech and mining set the ceiling, not finance.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Approximate intern pay by sector (AUD annual equivalent): note NGO is often legally unpaid</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="sectorChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-e">AUD $100k</div><div className="rpt-lbl">Canva internship annual equivalent (AUD $90,000 to $110,000 depending on role). 12-week summer program.</div></div>
              <div className="rpt-stat"><div className="rpt-val">AUD $81,500</div><div className="rpt-lbl">Medical intern average annual salary (all states). Award-based, standardised across public hospitals.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">AUD $58,958</div><div className="rpt-lbl">Average finance intern annual pay (PayScale Australia 2025). J.P. Morgan Australia: approx AUD $60,000/yr pro-rata.</div></div>
            </div>

            <p className="rpt-prose">Canva is the benchmark for Australian tech internship pay. Their 12-week summer programme (November to February) pays AUD $90,000 to $110,000 annualised, which is roughly AUD $1,540 to $2,115 per week. Atlassian runs a similar 12-week programme with competitive pay. Both accept applications in October for November starts. <strong>Medical internships are paid under an Award-based system: standardised by state, averaging AUD $81,500/year nationally.</strong> Finance internships at major banks average AUD $58,958 with J.P. Morgan Australia at roughly AUD $60,000 pro-rata. The IB analyst first-year package (base plus bonus) reaches AUD $120,000 to $180,000, but these are graduate roles, not intern stipends.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The superannuation factor</div>
              <p>Australian internships and employment contracts include mandatory superannuation contributions (currently 11.5%, rising to 12% from July 2025). This means the true cost to an employer is 11.5% higher than the quoted rate. For interns, this money goes into your superannuation fund and is not accessible until retirement. When comparing pay, be clear whether the quoted figure includes super (total package) or excludes it (plus super). AUD $60,000 plus super means you receive AUD $6,900 into your super account on top of your salary.</p>
            </div>
            <p className="rpt-source">Source: Canva Life early careers page 2025/26, Atlassian early careers programme data, PayScale Australia finance intern salary 2025, PrepLounge investment banking Australia 2026, Glassdoor Australia medical intern salary 2025</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find paid internships across Australia and Asia-Pacific</div>
                <div className="rpt-inline-cta-sub">The Internship Dojo surfaces roles with pay data, sector filters, and direct application links.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary">Find Australia Roles</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Mining is Australia's best-kept intern secret. Rio Tinto pays AUD $32/hour. BHP's program runs 10 to 12 weeks with real engineering scope.</h2>
              <p className="rpt-lead">No other country has a mining sector that offers structured, well-paid internships at this scale. For engineering students specifically, Rio Tinto and BHP internships are among the best-compensated graduate pathways in Australia.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Rio Tinto Vacation Program</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Pay", "AUD $30 to $35 per hour (AUD $1,140 to $1,330 per week)"],
                      ["Duration", "10 to 12 weeks during Australian summer (November to February)"],
                      ["Eligibility", "Students in 2nd year to penultimate year of engineering, geology, or related technical degrees"],
                      ["Location", "Pilbara (WA), Queensland, and corporate offices in Perth and Melbourne"],
                      ["Outcome", "High-performing interns receive first access to the Rio Tinto Graduate Programme. Alumni retention rate is high."],
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
                <div className="rpt-col-head">BHP Summer Internship</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Pay", "Competitive with Rio Tinto (AUD $30 to $35/hour range); exact figure not publicly listed"],
                      ["Duration", "10 to 12 weeks (Australian summer). 2025 applications closed 7 April 2025."],
                      ["Eligibility", "2nd to penultimate-year students in engineering, geology, IT, finance, and business"],
                      ["Location", "Perth, Brisbane, Adelaide, and site locations (Pilbara, BMA Coal Queensland)"],
                      ["Outcome", "Successful interns gain first access to the BHP Australian Graduate Program or a return internship invitation."],
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

            <p className="rpt-prose" style={{ marginTop: 20 }}>The mining sector employs around 2.6% of the Australian workforce (including indirect METS employment; direct mining workers are under 2% of the workforce) but contributes around 14% of GDP. Median earnings in mining are AUD $2,832/week: the highest of any Australian industry sector, more than 60% above the all-industries median of AUD $1,741/week. <strong>For engineering students, a Rio Tinto or BHP internship pays more per hour than a Big 4 consulting internship and offers earlier project ownership.</strong> The trade-off is location: most operational roles are in remote Western Australia or Queensland, with FIFO (fly-in, fly-out) arrangements common for site work.</p>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">What FIFO means for intern logistics</div>
              <p>FIFO (fly-in, fly-out) is standard for remote mining operations. Interns on site rotations typically work 8 to 14 days on site, then 6 to 7 days off. Return flights, on-site accommodation, and meals are provided by the company. This makes FIFO roles financially very efficient: your AUD $32/hour pay is almost entirely disposable income since housing and food are covered on-site. Perth and Brisbane-based corporate internship roles at the same companies do not use FIFO and are more relevant to non-engineering tracks.</p>
            </div>
            <p className="rpt-source">Source: Rio Tinto Vacation Program official listing 2025/26, BHP Australian Summer Internship 2025 (deadline 7 April 2025), Jobs and Skills Australia mining industry profile, ABS Mining sector median earnings 2025, Prosple Rio Tinto intern programme data</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">Perth pays the most. Sydney and Melbourne are the volume hubs. Brisbane is the emerging alternative with wide pay variance.</h2>
              <p className="rpt-lead">Australia's internship market is geographically concentrated. The city you apply from matters, not just for pay but for which sectors are accessible at all.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Internship pay range by city (AUD annual): low to high</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="cityChart"></canvas></div>
            </div>

            <div className="rpt-bar-list" style={{ marginTop: 16 }}>
              {[
                { city: "Perth", range: "AUD $57,000 to $87,000/yr", sub: "Mining and resources premium. Rio Tinto, BHP, Woodside, Fortescue HQs. General avg ~$57K; mining/engineering roles reach $87K.", bg: "#10b981", pct: 100 },
                { city: "Sydney", range: "AUD $59,000 to $75,000/yr", sub: "Finance hub. CBA, Westpac, ANZ head offices. ASX, ASIC. Google Sydney. Strong law and consulting.", bg: "#34d399", pct: 85 },
                { city: "Melbourne", range: "AUD $58,000 to $70,000/yr", sub: "Consulting and tech. Canva Melbourne, Atlassian. Deloitte, PwC, EY large presence. BHP corporate office.", bg: "#34d399", pct: 80 },
                { city: "Brisbane", range: "AUD $42,000 to $77,000/yr", sub: "Emerging hub. Wide variance: mining logistics (Gladstone), tech growth post-2032 Olympic push. QUT and UQ strong alumni networks.", bg: "#6ee7b7", pct: 68 },
                { city: "Canberra", range: "AUD $48,000 to $65,000/yr", sub: "Government and public sector focused. Australian Government Graduate Program (AGGP), ASIC, RBA, PM&C. Stable but narrower sector range.", bg: "#6ee7b7", pct: 60 },
              ].map(r => (
                <div key={r.city} className="rpt-bar-row">
                  <div className="rpt-bar-label">{r.city}<small>{r.sub}</small></div>
                  <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                  <div className="rpt-bar-value">{r.range}</div>
                </div>
              ))}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The 2032 Brisbane Olympic Effect</div>
              <p>Brisbane is building out its economy in anticipation of the 2032 Olympics. Infrastructure, tech, sustainability, and tourism roles are growing faster in Brisbane than in any other Australian city. The Queensland government has publicly committed to 100,000 new jobs by 2032. For students open to Queensland, early-entry roles (internship to graduate) in infrastructure, construction management, event technology, and sports administration are growing in volume and will continue to do so for the next 6 years.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor Australia city-level internship salary data 2025, PostGrad Australia city pay analysis, SEEK intern listings by city April 2026, Queensland Government 2032 Economic Plan</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">The best grad program applications open in February and close in April. For a role starting in January. The 12-month planning cycle is real.</h2>
              <p className="rpt-lead">Australian graduate recruitment runs a compressed, highly synchronised cycle. Every major employer opens in roughly the same 2-month window. Here is exactly when to apply for each sector.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Grad program application windows (from February of the year preceding start)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="timelineChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-e">Feb to Apr</div><div className="rpt-lbl">Peak application window for the following year's grad programs. Apply in February for a role starting in January next year.</div></div>
              <div className="rpt-stat"><div className="rpt-val">12 months</div><div className="rpt-lbl">Lead time between application and start date at most major Australian grad programs. Longer than UK, US, or India.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">Oct to Nov</div><div className="rpt-lbl">Application window for summer internship programs (Canva, Atlassian, BHP, Rio Tinto). Start date: November to February.</div></div>
            </div>

            <p className="rpt-prose">Australia runs two distinct recruitment cycles. Summer internships (November to February) recruit in October and November of the same year: a 4 to 6-week lead time. Graduate programs (starting January/February) recruit in February to April of the previous year: a 9 to 12-month lead time. <strong>The Big 4 banks, Big 4 consulting, and government programs all recruit simultaneously in February to May, which means you are competing against the entire applicant pool at once.</strong> Unlike the UK where rolling review rewards early applicants within a long window, Australian grad programs typically batch-review after closing. Applying in March or April gets you the same review as applying in February, but applying after May usually means waitlisting.</p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">Penultimate year is the key qualifier</div>
              <p>Most Australian grad programs require you to be in your penultimate year (second-to-last year) of your degree when applying. This means a 4-year engineering student applies in Year 3, a 3-year commerce student applies in Year 2. If you are not in your penultimate year, most structured programs will not shortlist you. Check this before applying: it is the most common reason for automatic rejection in Australia's graduate recruitment system.</p>
            </div>
            <p className="rpt-source">Source: Prosple when do graduate jobs start guide, SEEK Grad application timing data, Australian Government Graduate Program AGGP 2025 application dates, Deloitte Australia and PwC Australia graduate program documentation</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that Australian ATS systems accept</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>Australian employers use ATS filters that are strict about format. The Studojo resume builder outputs an ATS-clean PDF in 5 minutes.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">Top Australian employers by intern pay (what each actually offers)</h2>
              <p className="rpt-lead">Unlike the UK where a few investment banks dominate, Australian intern pay is diverse across sectors. Here is the verified pay data for the most prominent structured programs.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Approximate hourly intern pay by employer (AUD): note NGO is often legally unpaid</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="companyChart"></canvas></div>
            </div>

            <div className="rpt-card" style={{ marginTop: 20 }}>
              <div className="rpt-card-label">Top structured intern programs in Australia with verified pay data</div>
              <div className="rpt-bar-list">
                {[
                  { r: "Canva (Sydney / Melbourne)", sub: "12-week summer program. AUD $90,000-$110,000 annualised. Applications October-November.", pct: 100, bg: "#10b981" },
                  { r: "Goldman Sachs / JPMorgan (Sydney)", sub: "10-week summer analyst. AUD ~$60,000 pro-rata (approx AUD $58/hr). Acceptance: under 2%.", pct: 95, bg: "#10b981" },
                  { r: "Atlassian (Sydney / Melbourne)", sub: "12-week summer program. Nov 2026-Feb 2027 intake open. Competitive with Canva.", pct: 88, bg: "#34d399" },
                  { r: "Rio Tinto / BHP (Perth, WA)", sub: "10-12 weeks. AUD $30-$35/hour. Accommodation and meals included on site.", pct: 75, bg: "#34d399" },
                  { r: "Deloitte / PwC / EY / KPMG (nationwide)", sub: "10-14 week programs. AUD $28-$32/hour. 2,500+ combined annual graduate intake.", pct: 70, bg: "#34d399" },
                  { r: "CBA / Westpac / ANZ / NAB (Sydney, Melbourne)", sub: "8-12 week programs. AUD $26-$30/hour. Strong graduate-to-full-time conversion rate.", pct: 62, bg: "#6ee7b7" },
                  { r: "Australian Government (AGGP, PM&C)", sub: "Applications Feb-Apr. AUD $52,000-$65,000/yr. Secure, structured, Canberra-centric.", pct: 50, bg: "#6ee7b7" },
                ].map(r => (
                  <div key={r.r} className="rpt-bar-row">
                    <div className="rpt-bar-label">{r.r}<small>{r.sub}</small></div>
                    <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                    <div className="rpt-bar-value">{r.pct === 100 ? "Top" : r.pct + "%"}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="rpt-source">Source: Canva Life early careers, Atlassian early careers programme, Prosple Australia grad program database, Big 4 program documentation, Glassdoor Australia employer salary reports 2025, Consultancy.au Big 4 hiring 2,500 graduates data</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">International students on Student Visa (Subclass 500) can work 48 hours per fortnight during term. Unlimited during course breaks.</h2>
              <p className="rpt-lead">Australian student visa work rules are specific and actively enforced by the Department of Home Affairs. Getting these wrong can result in visa cancellation.</p>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">Student Visa Subclass 500: work rights for international interns</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {[
                  {
                    name: "During term time",
                    sub: "When your course is running",
                    detail: "Maximum 48 hours per fortnight (14-day period starting on a Monday). This works out to roughly 24 hours per week. Part-time internships (3 days/week) are feasible. Full-time internships during term are a visa violation.",
                    color: "#f59e0b",
                  },
                  {
                    name: "During course breaks",
                    sub: "University summer, winter, and semester breaks",
                    detail: "No work hour limit. Full-time internships are permitted. Australia's summer break (November to February) aligns with the major summer internship programs. This is when Canva, Atlassian, Rio Tinto, and BHP run their structured programs. International students can participate fully.",
                    color: "#10b981",
                  },
                  {
                    name: "PhD and master's by research students",
                    sub: "Research-track postgraduate students",
                    detail: "No work hour limit at any time. This is a significant advantage: doctoral students enrolled in Australian universities have unlimited work rights year-round. This makes Australian PhD programs an unusually practical pathway to full-time internship and work experience alongside study.",
                    color: "#10b981",
                  },
                  {
                    name: "Enforcement and compliance",
                    sub: "What happens if you breach",
                    detail: "The Department of Home Affairs actively cross-checks employment records with ATO tax data. Visa holders who exceed the 48-hour limit can face visa cancellation. Employers who knowingly employ international students beyond their visa work limits also face penalties. Keep payslips and timesheets to demonstrate compliance.",
                    color: "#ef4444",
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
              <div className="rpt-stat"><div className="rpt-val rpt-e">48 hrs</div><div className="rpt-lbl">Per fortnight during term time on Student Visa Subclass 500. Coalition proposed increasing to 60 hrs but no change confirmed as of April 2026.</div></div>
              <div className="rpt-stat"><div className="rpt-val">Unlimited</div><div className="rpt-lbl">Work hours during official course breaks. Summer break (Nov-Feb) aligns with Australia's main internship programs. No additional permission needed.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">No limit</div><div className="rpt-lbl">For PhD and master's by research students at any time. Research degree students have full work rights year-round under Subclass 500.</div></div>
            </div>
            <p className="rpt-source">Source: Department of Home Affairs Student Visa Subclass 500 conditions, Study Australia official student visa guide, Desire Migration 48-hour rule guide 2025, Pathway Migration student visa work rights 2025, Fair Work Ombudsman international student rights</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">The skills Australian employers value most are adaptability and AI fluency, ahead of pure technical skills. Commercial awareness is the common thread.</h2>
              <p className="rpt-lead">Australia's top employers converge on a consistent profile across sectors. Here is what the data shows about what actually differentiates successful intern applicants.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skills priority for top Australian employers (% who cite this as high priority)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="skillChart"></canvas></div>
            </div>

            <p className="rpt-prose">Teamwork and adaptability are cited by 82% of Australian employers as high priorities. Commercial awareness follows at 80%. Work Integrated Learning (WIL) experience: formal university placements, capstone projects, and live client work, is cited by 75% of major employers as a strong signal. <strong>AI and data science literacy is now cited by 68% of employers across all sectors, up significantly from 2024 as every industry embeds AI into workflows.</strong> Pure technical skills (Python, SQL) are more sector-specific: essential in tech and data, important in finance, irrelevant in many other areas.</p>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">Key job boards (Australia)</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["GradConnection / SEEK Grad", "1,100+ grad/intern listings. Dominant platform for structured programs."],
                      ["Prosple", "1,700+ roles. Strong salary guides and employer profiles."],
                      ["SEEK", "General job board. Broad reach including SME internships."],
                      ["LinkedIn Australia", "Best for tech and startup roles. Network-driven applications."],
                      ["Company career pages", "Direct applications for Canva, Atlassian, BHP, Rio Tinto, Big 4 banks, MBB."],
                    ].map(([name, note]) => (
                      <div key={name as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{name}</div>
                          <div style={{ fontSize: 13, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">What makes Australian applications stand out</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["WIL experience", "University placements, live projects. Put these first on your resume."],
                      ["Industry-specific knowledge", "Know the employer's sector. Mining students: know commodity cycles. Finance: know RBA decisions."],
                      ["Australian workplace culture fit", "Informal, direct, team-focused. CVs and cover letters should be warm, not stiff."],
                      ["Penultimate year timing", "Most programs require it. Apply in Year 3 of a 4-year degree, Year 2 of a 3-year degree."],
                      ["Apply early in the window", "Feb-April window is batch reviewed. Earlier is slightly better but not dramatically so."],
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
            <p className="rpt-source">Source: Digital Strategy Institute Australian Higher Education Employability 2025, IMFS top in-demand graduate jobs Australia 2025, Deloitte Australia Future of Work 2026, Prosple employer skills data, KPMG Australian Labour Market Update August 2025</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Internship Dojo to find paid internships in Australia, the UK, Germany, and beyond. Build an ATS-ready resume in 5 minutes. Free.</p>
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
  .rpt-bar-row { display:grid; grid-template-columns:200px 1fr 120px; align-items:center; gap:12px; }
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
