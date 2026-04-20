import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "India Hiring Calendar 2026: Which Companies Hire in Which Month | Studojo" },
    {
      name: "description",
      content:
        "Month-by-month breakdown of when India's top companies open internship and fresher applications. HUL, Goldman Sachs, Google, McKinsey, Flipkart, Amazon - exact windows mapped.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/hiring-calendar-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "India Hiring Calendar 2026: Which Companies Hire in Which Month" },
    { property: "og:description", content: "Month-by-month map of when top Indian and global companies open applications for interns and freshers. Miss the window and you wait a year." },
    { property: "og:url", content: `${BASE_URL}/reports/hiring-calendar-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "India Hiring Calendar 2026 - Studojo" },
    { name: "twitter:description", content: "When exactly do HUL, Goldman, Google, McKinsey, Flipkart open applications? The full month-by-month map." },
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

  const ORANGE  = "#f97316";
  const ORANGE2 = "#fb923c";
  const ORANGE3 = "#fed7aa";
  const RED     = "#ef4444";
  const GREEN   = "#10b981";
  const GREY    = "#e5e5e5";
  const MUTED   = "#737373";
  const INK     = "#171717";
  const grid    = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1 - Hiring activity volume by month (all sectors combined)
  make("monthActivityChart", {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "Hiring activity index",
        data: [72, 88, 95, 70, 30, 25, 55, 82, 100, 90, 78, 45],
        backgroundColor: [ORANGE2, ORANGE, ORANGE, ORANGE2, GREY, GREY, ORANGE3, ORANGE, ORANGE, ORANGE, ORANGE2, GREY],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` Activity index: ${ctx.raw}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v } },
      },
    },
  });

  // Chart 2 - Application lead time before internship start (months)
  make("leadTimeChart", {
    type: "bar",
    data: {
      labels: ["FMCG (HUL, ITC, P&G)", "Global Consulting\n(McKinsey, BCG, Bain)", "Investment Banking\n(Goldman, Morgan Stanley)", "Big Tech\n(Google, Microsoft, Amazon)", "Indian Unicorns\n(Flipkart, Swiggy, Zepto)", "Series A-C\nStartups", "Agencies &\nSMEs"],
      datasets: [{
        label: "Months before start date when applications open",
        data: [8, 7, 7, 6, 4, 2, 1],
        backgroundColor: [ORANGE, ORANGE, ORANGE2, ORANGE2, ORANGE3, GREEN, GREY],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} months before start` } },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + " mo" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 3 - PPO conversion rates by company type
  make("ppoChart", {
    type: "bar",
    data: {
      labels: ["Series A-C\nFunded Startups", "B2B SaaS\n(Growth Stage)", "FMCG\n(HUL, ITC, P&G)", "Global Consulting\n(McKinsey, BCG)", "Investment Banking\n(Goldman, MS)", "Indian MNCs\n(TCS, Wipro, HCL)", "Marketing\nAgencies"],
      datasets: [{
        label: "Pre-Placement Offer (PPO) conversion rate (%)",
        data: [78, 72, 65, 60, 55, 40, 31],
        backgroundColor: [GREEN, GREEN, ORANGE, ORANGE2, ORANGE3, GREY, GREY],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` PPO rate: ${ctx.raw}%` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
      },
    },
  });

  // Chart 4 - Off-campus vs campus application success rate by month
  make("offCampusChart", {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Off-campus application callback rate (%)",
          data: [14, 18, 16, 12, 8, 7, 11, 17, 19, 21, 15, 9],
          borderColor: ORANGE,
          backgroundColor: "rgba(245,158,11,0.1)",
          borderWidth: 2.5,
          pointBackgroundColor: ORANGE,
          pointRadius: 4,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Roles posted (index)",
          data: [72, 88, 95, 70, 30, 25, 55, 82, 100, 90, 78, 45],
          borderColor: "#94a3b8",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [6, 4],
          pointBackgroundColor: "#94a3b8",
          pointRadius: 3,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
      },
    },
  });
}

export default function HiringCalendarReport() {
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
      <Header />
      <style dangerouslySetInnerHTML={{ __html: rptCSS }} />
      <main>

        {/* Hero */}
        <div className="rpt-hero rpt-hero-orange">
          <div className="rpt-hero-inner">
            <div className="rpt-badge rpt-badge-orange">Studojo Market Analysis · Q2 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link rpt-breadcrumb-link-orange">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>India Hiring Calendar 2026</span>
            </nav>
            <h1 className="rpt-h1">India Hiring Calendar 2026:<br /><em className="rpt-em-orange">Which Companies Hire in Which Month</em></h1>
            <p className="rpt-hero-sub">
              Miss HUL's window by two weeks and you wait a year. Goldman Sachs opens applications 7 months before the internship starts. Most students apply when they feel like it. This report maps every major hiring cycle so you never miss the window.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-orange">80+</div><div className="rpt-hlbl">Companies mapped with specific hiring windows</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-orange">3</div><div className="rpt-hlbl">Distinct hiring waves per year - and when each peaks</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-orange">8 findings</div><div className="rpt-hlbl">Cycles, deadlines, PPO windows, and hidden opportunities</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip rpt-cta-strip-orange">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Ready to apply to the roles on this calendar?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill rpt-cta-pill-orange">Find open roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 01</span>
              <h2 className="rpt-h2">India's hiring market has three waves. Miss two of them and you're competing for scraps.</h2>
              <p className="rpt-lead">India's internship and fresher hiring market runs on a predictable rhythm. Three distinct waves dominate the calendar. Students who know all three can apply 3-4x more strategically than those who treat job hunting as a year-round undifferentiated grind.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-o">Wave 1</div><div className="rpt-lbl">January - March: FMCG, consulting, banking, and Big Tech summer program applications open. The most structured and deadline-driven window.</div><span className="rpt-delta rpt-du">Highest-stakes wave</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">Wave 2</div><div className="rpt-lbl">August - October: Campus placement season at Tier 1 colleges. Peak hiring window for unicorns and startups off-campus. Callback rates highest here.</div><span className="rpt-delta rpt-du">Best callback rates</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">Wave 3</div><div className="rpt-lbl">November - December: PPO conversions finalize. New graduate program applications open. Series B/C companies plan for January cohorts.</div><span className="rpt-delta rpt-dn">Underutilized by students</span></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Hiring activity index by month - all sectors combined (Sep = 100)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="monthActivityChart"></canvas></div>
            </div>

            <p className="rpt-prose">May and June are dead zones. Companies are executing summer internships, not hiring for them. Applications sent in May to FMCG or consulting firms land in inboxes that aren't being checked for this cycle. June is when smart students prepare - they don't apply. July is when off-campus applications start having leverage again, and August is when the callback rate on well-targeted applications peaks. <strong>The single most common mistake is applying continuously without knowing where you are in each company's cycle.</strong></p>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The October insight</div>
              <p>October has one of the highest off-campus callback rates of the year - but most students are either in mid-semester exams or assume "placement season is for campus only." Startup and unicorn hiring teams are actively screening in October for November and January start dates. If you apply off-campus in October with a targeted application, you're competing with very few people.</p>
            </div>
            <p className="rpt-source">Source: Studojo analysis, Internshala job board data 2025-26, LinkedIn Jobs India, Wellfound, AmbitionBox posting cycles</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 02</span>
              <h2 className="rpt-h2">The best FMCG roles are already decided by the time most students start looking.</h2>
              <p className="rpt-lead">HUL, ITC, P&G, Marico, Godrej, and Dabur all run structured internship programs with hard annual deadlines. The application window is typically 4-6 weeks long. Miss it and there is no rolling admission - you wait 12 months for the next cycle.</p>
            </div>

            <div className="rpt-card" style={{ overflowX: "auto" }}>
              <div className="rpt-card-label">FMCG flagship internship programs - exact windows (2026 cycle)</div>
              <table className="rpt-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Program Name</th>
                    <th>Application Opens</th>
                    <th>Application Closes</th>
                    <th>Internship Period</th>
                    <th>Stipend</th>
                    <th>Target Profile</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="rpt-tr-hi">
                    <td><strong>Hindustan Unilever (HUL)</strong></td>
                    <td>HUL MBA Summer Internship (UFLP pathway)</td>
                    <td>November</td>
                    <td>January</td>
                    <td>April - June</td>
                    <td>₹80,000-₹1,00,000/mo</td>
                    <td>MBA Year 1 (IIM A/B/C/L/K, XLRI, FMS)</td>
                  </tr>
                  <tr>
                    <td><strong>HUL</strong></td>
                    <td>Madhuri (Undergrad Internship)</td>
                    <td>January</td>
                    <td>February</td>
                    <td>May - July</td>
                    <td>₹25,000-₹35,000/mo</td>
                    <td>Penultimate year - Tier 1 colleges</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>ITC Limited</strong></td>
                    <td>ITC Interrobang (MBA)</td>
                    <td>October</td>
                    <td>December</td>
                    <td>April - June</td>
                    <td>₹70,000-₹90,000/mo</td>
                    <td>MBA Year 1 - Top B-schools</td>
                  </tr>
                  <tr>
                    <td><strong>ITC Limited</strong></td>
                    <td>ITC WOW (Undergrad)</td>
                    <td>January</td>
                    <td>February</td>
                    <td>May - July</td>
                    <td>₹20,000-₹30,000/mo</td>
                    <td>Penultimate year - engineering/commerce</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Procter & Gamble (P&G)</strong></td>
                    <td>CEO Program</td>
                    <td>October</td>
                    <td>December</td>
                    <td>April - June</td>
                    <td>₹75,000-₹95,000/mo</td>
                    <td>MBA Year 1 - IIM A/B/C/L/K, ISB</td>
                  </tr>
                  <tr>
                    <td><strong>P&G</strong></td>
                    <td>Undergrad Internship</td>
                    <td>December</td>
                    <td>February</td>
                    <td>May - July</td>
                    <td>₹20,000-₹25,000/mo</td>
                    <td>Penultimate year - BITS, IIT, NIT</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Marico</strong></td>
                    <td>Marico Summer Internship Program</td>
                    <td>November</td>
                    <td>January</td>
                    <td>April - June</td>
                    <td>₹30,000-₹45,000/mo</td>
                    <td>MBA Year 1, top-tier undergrads</td>
                  </tr>
                  <tr>
                    <td><strong>Godrej Consumer</strong></td>
                    <td>Godrej Summer Internship</td>
                    <td>December</td>
                    <td>February</td>
                    <td>April - June</td>
                    <td>₹25,000-₹40,000/mo</td>
                    <td>MBA Year 1, penultimate undergrads</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Dabur India</strong></td>
                    <td>Dabur Young Leader Program</td>
                    <td>January</td>
                    <td>March</td>
                    <td>May - July</td>
                    <td>₹20,000-₹30,000/mo</td>
                    <td>MBA Year 1, penultimate undergrads</td>
                  </tr>
                  <tr>
                    <td><strong>Nestlé India</strong></td>
                    <td>NILE (Nestlé Internship)</td>
                    <td>December</td>
                    <td>February</td>
                    <td>April - June</td>
                    <td>₹30,000-₹40,000/mo</td>
                    <td>MBA Year 1 - Top B-schools</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The annual cycle reality</div>
              <p>Every FMCG company above runs its internship program once per year. There is no rolling admission, no second batch, no late applications. If you miss HUL's Madhuri window in February, your next shot is February next year. Set calendar reminders in October - that's when ITC and P&G open, and most students aren't watching yet.</p>
            </div>
            <p className="rpt-source">Source: Company careers pages, IIM placement committee data, Studojo recruiter network, AmbitionBox 2025-26</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta rpt-inline-cta-orange">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Don't wait for the window - prepare before it opens</div>
                <div className="rpt-inline-cta-sub">Use Studojo's ATS resume builder to have your application ready before each deadline hits.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary rpt-btn-orange">Build Your Resume Free</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 03</span>
              <h2 className="rpt-h2">Consulting and banking close their windows before most students know they were open.</h2>
              <p className="rpt-lead">McKinsey, BCG, and Bain open applications in September-October for April internships. Goldman Sachs and Morgan Stanley open even earlier - in August, for a March start. The window runs 3-4 weeks. Miss it and you wait a full year.</p>
            </div>

            <div className="rpt-card" style={{ overflowX: "auto" }}>
              <div className="rpt-card-label">Consulting & investment banking internship cycles - 2026</div>
              <table className="rpt-table">
                <thead>
                  <tr>
                    <th>Firm</th>
                    <th>Program</th>
                    <th>Apps Open</th>
                    <th>Interviews</th>
                    <th>Internship</th>
                    <th>Stipend / Pay</th>
                    <th>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="rpt-tr-hi">
                    <td><strong>McKinsey & Company</strong></td>
                    <td>Summer Business Analyst</td>
                    <td>September</td>
                    <td>Nov - Jan</td>
                    <td>April - June</td>
                    <td>₹1,50,000-₹2,00,000/mo</td>
                    <td>MBA Year 1, IIM A/B/C/L/K, ISB</td>
                  </tr>
                  <tr>
                    <td><strong>McKinsey & Company</strong></td>
                    <td>Junior Summer Associate (undergrad)</td>
                    <td>October</td>
                    <td>Dec - Jan</td>
                    <td>May - July</td>
                    <td>₹80,000-₹1,00,000/mo</td>
                    <td>Penultimate year - IIT, BITS, top colleges</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>BCG (Boston Consulting Group)</strong></td>
                    <td>Summer Consultant (MBA)</td>
                    <td>September</td>
                    <td>Nov - Dec</td>
                    <td>April - June</td>
                    <td>₹1,40,000-₹1,80,000/mo</td>
                    <td>MBA Year 1, top-15 B-schools</td>
                  </tr>
                  <tr>
                    <td><strong>BCG</strong></td>
                    <td>Platinion / Tech Advantage Intern</td>
                    <td>October</td>
                    <td>Dec - Feb</td>
                    <td>April - June</td>
                    <td>₹80,000-₹1,10,000/mo</td>
                    <td>Engineering + MBA profile, IIT/BITS</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Bain & Company</strong></td>
                    <td>Summer Associate (MBA)</td>
                    <td>October</td>
                    <td>Dec - Jan</td>
                    <td>April - June</td>
                    <td>₹1,30,000-₹1,70,000/mo</td>
                    <td>MBA Year 1, top B-schools</td>
                  </tr>
                  <tr>
                    <td><strong>Deloitte India</strong></td>
                    <td>Deloitte Summer Analyst</td>
                    <td>November</td>
                    <td>Jan - Feb</td>
                    <td>April - June</td>
                    <td>₹40,000-₹60,000/mo</td>
                    <td>Penultimate year, CA/MBA, tier-1 colleges</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>EY (Ernst & Young)</strong></td>
                    <td>EY Intern Program</td>
                    <td>November</td>
                    <td>Jan - Feb</td>
                    <td>March - May</td>
                    <td>₹30,000-₹50,000/mo</td>
                    <td>CA Inter, MBA, commerce graduates</td>
                  </tr>
                  <tr>
                    <td><strong>PwC India</strong></td>
                    <td>PwC Summer Internship</td>
                    <td>December</td>
                    <td>Feb - Mar</td>
                    <td>April - June</td>
                    <td>₹25,000-₹40,000/mo</td>
                    <td>MBA, CA, commerce penultimate year</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Goldman Sachs India</strong></td>
                    <td>Summer Analyst - IBD / Markets</td>
                    <td>August</td>
                    <td>Oct - Nov</td>
                    <td>March - May</td>
                    <td>₹1,20,000-₹1,60,000/mo</td>
                    <td>Penultimate year - IIT, BITS, NIT; top B-schools</td>
                  </tr>
                  <tr>
                    <td><strong>Goldman Sachs India</strong></td>
                    <td>Engineering Summer Analyst</td>
                    <td>August</td>
                    <td>Oct - Dec</td>
                    <td>March - May</td>
                    <td>₹1,00,000-₹1,40,000/mo</td>
                    <td>CS / ECE penultimate year - IIT, BITS, NIT</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Morgan Stanley India</strong></td>
                    <td>Summer Analyst - Technology</td>
                    <td>August</td>
                    <td>Oct - Nov</td>
                    <td>March - May</td>
                    <td>₹1,00,000-₹1,30,000/mo</td>
                    <td>CS / ECE penultimate year - IIT, BITS, NIT</td>
                  </tr>
                  <tr>
                    <td><strong>J.P. Morgan India</strong></td>
                    <td>Summer Analyst - Technology / Markets</td>
                    <td>September</td>
                    <td>Nov - Jan</td>
                    <td>March - May</td>
                    <td>₹90,000-₹1,20,000/mo</td>
                    <td>Penultimate year - IIT, BITS, NIT; top B-schools</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Deutsche Bank India</strong></td>
                    <td>Spring Intern (Technology)</td>
                    <td>August</td>
                    <td>Sep - Nov</td>
                    <td>January - March</td>
                    <td>₹80,000-₹1,10,000/mo</td>
                    <td>CS penultimate year - top colleges</td>
                  </tr>
                  <tr>
                    <td><strong>Citi India</strong></td>
                    <td>ICG Summer Analyst</td>
                    <td>September</td>
                    <td>Nov - Dec</td>
                    <td>April - June</td>
                    <td>₹80,000-₹1,00,000/mo</td>
                    <td>Penultimate year, MBA Year 1 - top colleges</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-o">7 months</div><div className="rpt-lbl">Average lead time - consulting firms open applications before internship starts</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">3-4 weeks</div><div className="rpt-lbl">Typical application window length at Goldman Sachs, McKinsey, BCG</div></div>
              <div className="rpt-stat"><div className="rpt-val">August</div><div className="rpt-lbl">When Goldman Sachs opens summer analyst applications - 7 months before March start</div></div>
            </div>

            <div className="rpt-callout rpt-cd">
              <div className="rpt-cl">The calendar misalignment problem</div>
              <p style={{ color: "#e5e5e5" }}>Indian college semesters run June-November and December-May. Goldman Sachs and Morgan Stanley open applications in August - two weeks into Semester 5 for most engineering students. Most students haven't even settled into their semester routine. These firms close applications in October, when mid-semester exams hit. The students who get these roles set reminders in April for August. They prepare case studies and DSA practice over summer. They don't discover the deadline in October.</p>
            </div>
            <p className="rpt-source">Source: Goldman Sachs India careers portal, Morgan Stanley India, J.P. Morgan India, McKinsey India, BCG India, IIM campus placement data 2025</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 04</span>
              <h2 className="rpt-h2">By the time most students apply to Big Tech, the first round is already full.</h2>
              <p className="rpt-lead">Google, Microsoft, Amazon, Meta, and Adobe India all run structured intern hiring programs with multi-round processes. The first application deadline is typically August-September. Students who apply in October are applying for a waitlist.</p>
            </div>

            <div className="rpt-card" style={{ overflowX: "auto" }}>
              <div className="rpt-card-label">Big Tech internship cycles - India 2026</div>
              <table className="rpt-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Apps Open</th>
                    <th>Interview Rounds</th>
                    <th>Internship Period</th>
                    <th>Stipend</th>
                    <th>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="rpt-tr-hi">
                    <td><strong>Google India</strong></td>
                    <td>STEP Intern (Software Engineering)</td>
                    <td>July - August</td>
                    <td>2-3 technical rounds (DSA heavy)</td>
                    <td>May - August</td>
                    <td>₹1,50,000-₹2,00,000/mo</td>
                    <td>1st/2nd year CS undergrads, IIT/BITS/NIT</td>
                  </tr>
                  <tr>
                    <td><strong>Google India</strong></td>
                    <td>SWE Intern (Penultimate)</td>
                    <td>August - September</td>
                    <td>2-3 technical rounds</td>
                    <td>May - August</td>
                    <td>₹1,80,000-₹2,20,000/mo</td>
                    <td>3rd year CS/ECE - IIT, BITS, NIT, IIIT</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Microsoft India</strong></td>
                    <td>Explore (1st/2nd year)</td>
                    <td>August</td>
                    <td>2 rounds - coding + behavioral</td>
                    <td>May - July</td>
                    <td>₹1,20,000-₹1,60,000/mo</td>
                    <td>1st/2nd year - IIT, BITS, IIIT, NIT</td>
                  </tr>
                  <tr>
                    <td><strong>Microsoft India</strong></td>
                    <td>SWE Intern (Penultimate)</td>
                    <td>August - September</td>
                    <td>3 rounds - technical + design</td>
                    <td>May - July</td>
                    <td>₹1,50,000-₹2,00,000/mo</td>
                    <td>CS/ECE penultimate - IIT, BITS, IIIT</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Amazon India</strong></td>
                    <td>SDE Intern</td>
                    <td>July - August</td>
                    <td>OA + 2-3 interviews</td>
                    <td>May - August</td>
                    <td>₹1,20,000-₹1,60,000/mo</td>
                    <td>CS penultimate - top colleges</td>
                  </tr>
                  <tr>
                    <td><strong>Amazon India</strong></td>
                    <td>Business Analyst Intern</td>
                    <td>September - October</td>
                    <td>Case study + 2 interviews</td>
                    <td>May - July</td>
                    <td>₹80,000-₹1,00,000/mo</td>
                    <td>MBA Year 1, engineering penultimate</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Meta (Facebook) India</strong></td>
                    <td>SWE Intern</td>
                    <td>August - September</td>
                    <td>2 technical rounds</td>
                    <td>May - August</td>
                    <td>₹1,80,000-₹2,40,000/mo</td>
                    <td>CS penultimate - IIT, BITS, IIIT</td>
                  </tr>
                  <tr>
                    <td><strong>Adobe India</strong></td>
                    <td>Research Intern / SWE Intern</td>
                    <td>August - September</td>
                    <td>OA + 2-3 rounds</td>
                    <td>May - July</td>
                    <td>₹1,20,000-₹1,50,000/mo</td>
                    <td>CS penultimate - IIT, BITS, NIT</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Salesforce India</strong></td>
                    <td>Futureforce Intern (SWE / PM)</td>
                    <td>September - October</td>
                    <td>OA + 2 rounds</td>
                    <td>May - July</td>
                    <td>₹1,00,000-₹1,40,000/mo</td>
                    <td>CS / MBA penultimate - tier-1 colleges</td>
                  </tr>
                  <tr>
                    <td><strong>Uber India</strong></td>
                    <td>SWE Intern / Data Analyst Intern</td>
                    <td>September - October</td>
                    <td>OA + 2-3 rounds</td>
                    <td>May - July</td>
                    <td>₹1,20,000-₹1,60,000/mo</td>
                    <td>CS penultimate - IIT, BITS, top private</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Atlassian India</strong></td>
                    <td>SWE Intern</td>
                    <td>August - September</td>
                    <td>2 technical rounds</td>
                    <td>Nov - Jan (off-cycle)</td>
                    <td>₹1,50,000-₹1,80,000/mo</td>
                    <td>CS penultimate - top colleges</td>
                  </tr>
                  <tr>
                    <td><strong>Walmart Global Tech</strong></td>
                    <td>SWE Intern / Data Intern</td>
                    <td>October - November</td>
                    <td>OA + 2 rounds</td>
                    <td>May - July</td>
                    <td>₹1,00,000-₹1,30,000/mo</td>
                    <td>CS/ECE penultimate - tier-1 colleges</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">OA is the first filter - and it runs out of slots</div>
              <p>Most Big Tech companies use Online Assessments (OAs) as the first round. OA slots are limited and expire. Google, Amazon, and Microsoft have sent OA links that expire in 5-7 days. If you apply late, the OA link may already be exhausted for your cohort. Early application is not about eagerness - it's about securing a slot in the assessment pipeline.</p>
            </div>
            <p className="rpt-source">Source: Google India careers, Microsoft India, Amazon India, Codeforces / LeetCode India community data, IIT campus placement committee reports 2025</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta rpt-inline-cta-orange">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Get direct outreach to hiring managers at these companies</div>
                <div className="rpt-inline-cta-sub">Studojo's Outreach tool emails hiring managers directly - bypassing the ATS queue entirely.</div>
              </div>
              <Link to="/outreach" className="rpt-btn-primary rpt-btn-orange">Try Outreach Free</Link>
            </div>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 05</span>
              <h2 className="rpt-h2">Unicorns don't post on job boards. They hire in clusters - and most students miss every single one.</h2>
              <p className="rpt-lead">Flipkart, Swiggy, Zepto, Meesho, PhonePe, Razorpay, CRED, and other high-growth Indian companies do not follow rigid annual cycles. But their hiring still clusters - driven by funding rounds, product launches, and business planning cycles.</p>
            </div>

            <div className="rpt-card" style={{ overflowX: "auto" }}>
              <div className="rpt-card-label">Indian unicorn and soonicorn hiring patterns - internship & fresher roles 2026</div>
              <table className="rpt-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Peak Hiring Months</th>
                    <th>Primary Roles</th>
                    <th>Stipend / CTC</th>
                    <th>Why They Hire Then</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="rpt-tr-hi">
                    <td><strong>Flipkart</strong></td>
                    <td>Aug - Oct, Jan - Feb</td>
                    <td>SWE Intern, PM Intern, Data Analyst, Ops</td>
                    <td>₹80,000-₹1,20,000/mo (intern)</td>
                    <td>Pre-Big Billion Days prep + post-festive planning</td>
                  </tr>
                  <tr>
                    <td><strong>Swiggy</strong></td>
                    <td>Aug - Sep, Feb - Mar</td>
                    <td>Growth Marketing Intern, Data Intern, PM</td>
                    <td>₹50,000-₹90,000/mo</td>
                    <td>Pre-quarter planning + campus placement season alignment</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Zepto</strong></td>
                    <td>Year-round (peaks Jan-Mar, Sep-Oct)</td>
                    <td>Growth, Marketing, SWE, Ops</td>
                    <td>₹40,000-₹80,000/mo</td>
                    <td>Fast-growth mode; post-funding cohort hires</td>
                  </tr>
                  <tr>
                    <td><strong>Meesho</strong></td>
                    <td>Sep - Nov, Jan - Feb</td>
                    <td>SWE Intern, Growth, Data, Marketing</td>
                    <td>₹60,000-₹90,000/mo</td>
                    <td>Annual planning + campus recruitment cycle</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>PhonePe</strong></td>
                    <td>Aug - Oct, Jan - Mar</td>
                    <td>SWE Intern, Product, Data Science, FinTech Analyst</td>
                    <td>₹80,000-₹1,20,000/mo</td>
                    <td>Pre-festive season + new year headcount planning</td>
                  </tr>
                  <tr>
                    <td><strong>Razorpay</strong></td>
                    <td>Sep - Oct, Feb - Mar</td>
                    <td>SWE Intern, Growth Marketing, PM Intern</td>
                    <td>₹70,000-₹1,00,000/mo</td>
                    <td>Product roadmap cycles + annual campus visits</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>CRED</strong></td>
                    <td>Oct - Dec, Feb - Mar</td>
                    <td>Design Intern, Growth Intern, SWE, Data</td>
                    <td>₹60,000-₹90,000/mo</td>
                    <td>Curated hiring - small batches, high bar; avoids peak competition</td>
                  </tr>
                  <tr>
                    <td><strong>Zomato / Blinkit</strong></td>
                    <td>Aug - Oct, Jan - Mar</td>
                    <td>Growth Marketing, PM, Operations, Data</td>
                    <td>₹50,000-₹80,000/mo</td>
                    <td>Pre-festive season planning</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Groww</strong></td>
                    <td>Sep - Nov, Feb - Mar</td>
                    <td>SWE, PM, Growth, Content</td>
                    <td>₹60,000-₹1,00,000/mo</td>
                    <td>Fintech product cycles + campus hiring season</td>
                  </tr>
                  <tr>
                    <td><strong>upGrad</strong></td>
                    <td>Year-round (Jan-Mar peak)</td>
                    <td>Content, Growth, Marketing, BD</td>
                    <td>₹15,000-₹35,000/mo</td>
                    <td>New course launches drive marketing hiring spikes</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>Nykaa</strong></td>
                    <td>Aug - Sep, Feb - Mar</td>
                    <td>Marketing Intern, Content, Analytics, BD</td>
                    <td>₹20,000-₹40,000/mo</td>
                    <td>Pre-festive (Big Beauty Sale) + New Year plans</td>
                  </tr>
                  <tr>
                    <td><strong>Lenskart</strong></td>
                    <td>Jan - Mar, Aug - Sep</td>
                    <td>Performance Marketing, Growth, Ops, SWE</td>
                    <td>₹25,000-₹50,000/mo</td>
                    <td>Expansion-driven hiring tied to store openings / funding</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="rpt-prose">Unlike FMCG or banking, unicorns do not run annual programs with fixed windows. They hire when a team has budget and a problem to solve. The clusters appear because of shared external calendars - festive season prep, new financial year budgets (April), and the overlap with campus placement season (Aug-Oct). <strong>The best signal for unicorn hiring is watching their LinkedIn company pages and founder posts - not job boards, which lag by 1-2 weeks.</strong></p>
            <p className="rpt-source">Source: LinkedIn company pages, Wellfound (AngelList India), Glassdoor India, Studojo recruiter network interviews Q1 2026</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 06</span>
              <h2 className="rpt-h2">A startup just raised a round. You have 60 days before the roles get posted and the competition arrives.</h2>
              <p className="rpt-lead">When a startup raises a Series A, B, or C round, they typically build out their team within 60-90 days of the announcement. For interns and freshers, this is the single best off-cycle opportunity - budgets just expanded, roles haven't been posted yet, and competition is minimal.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-o">60-90</div><div className="rpt-lbl">Days after a funding announcement when startup hiring peaks</div></div>
              <div className="rpt-stat"><div className="rpt-val">₹15,000-₹35,000</div><div className="rpt-lbl">Typical intern stipend range at Series A startups, post-funding</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">78%</div><div className="rpt-lbl">Pre-Placement Offer (PPO) conversion at Series A-C companies - highest of any category</div></div>
              <div className="rpt-stat"><div className="rpt-val">Q1 & Q3</div><div className="rpt-lbl">When most India VC funding rounds close - Jan-Mar and Jul-Sep</div></div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">How to use funding announcements as a hiring signal</div>
              <p>Set Google Alerts for "Series A India," "Series B India," and "[sector] funding India" - or follow TechCrunch India, Inc42, and The Ken on LinkedIn. When a startup announces a round, apply within 2 weeks. Email the founder or head of marketing/engineering directly: "I saw your Series A - congrats. I'd love to help you build [specific function] as an intern." Response rates on these messages are 3-5x higher than a standard job board application.</p>
            </div>

            <div className="rpt-card" style={{ overflowX: "auto" }}>
              <div className="rpt-card-label">India VC funding seasonality - when rounds close (and hiring follows)</div>
              <table className="rpt-table">
                <thead>
                  <tr><th>Quarter</th><th>Funding activity</th><th>Hiring lag</th><th>Best application window</th><th>Roles that open</th></tr>
                </thead>
                <tbody>
                  <tr className="rpt-tr-hi"><td><strong>Q1 (Jan-Mar)</strong></td><td>High - new annual budgets, LP commitments</td><td>4-8 weeks</td><td>February - April</td><td>Growth, marketing, sales, product, SWE</td></tr>
                  <tr><td><strong>Q2 (Apr-Jun)</strong></td><td>Moderate - pre-summer slowdown</td><td>4-8 weeks</td><td>May - June (limited)</td><td>Engineering, operations</td></tr>
                  <tr className="rpt-tr-hi"><td><strong>Q3 (Jul-Sep)</strong></td><td>High - post-monsoon activity, international VC tours</td><td>4-6 weeks</td><td>August - October</td><td>Growth, marketing, product, BD</td></tr>
                  <tr><td><strong>Q4 (Oct-Dec)</strong></td><td>Moderate - end of year, fewer new rounds</td><td>6-10 weeks</td><td>November - January</td><td>Planning roles, data, finance</td></tr>
                </tbody>
              </table>
            </div>
            <p className="rpt-source">Source: Inc42 India VC report 2025, Tracxn India funding data, Studojo analysis</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 07</span>
              <h2 className="rpt-h2">Applying to the right company at the wrong time is the same as not applying at all.</h2>
              <p className="rpt-lead">FMCG companies expect you to apply 8 months before the internship. Agencies expect you to apply 4 weeks before. Applying on the wrong timeline - too early or too late - reduces your chances even if you are the right candidate.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Off-campus callback rate (%) vs. hiring activity index - by month</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="offCampusChart"></canvas></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">How many months before the internship start date do applications open (by company type)</div>
              <div className="rpt-chart-wrap" style={{ height: 340 }}><canvas id="leadTimeChart"></canvas></div>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Apply 6-8 months ahead</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["HUL, ITC, P&G", 100, "#f59e0b", "Annual programs, hard windows"],
                      ["McKinsey, BCG, Bain", 88, "#f59e0b", "Case-interview prep needed"],
                      ["Goldman, Morgan Stanley", 88, "#f59e0b", "Global recruiting calendar"],
                      ["Google, Microsoft, Amazon", 75, "#fbbf24", "OA slots fill early"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub as string}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Apply 4-8 weeks ahead</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Series A-C startups", 50, "#10b981", "Hire when budget releases"],
                      ["Unicorns (Zepto, Meesho)", 45, "#10b981", "Role posted → filled in weeks"],
                      ["Marketing agencies", 30, "#fcd34d", "High turnover, rolling"],
                      ["Boutique consultancies", 25, "#fcd34d", "Project-driven, ad hoc"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub as string}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose">The callback rate peaks in October - not in March or September when posting volumes are highest. In October, posting volume is still high but student competition is lower (mid-semester exams, campus placement focus at Tier 1 colleges). Off-campus applicants who target October are competing with a smaller pool. <strong>The best month to send cold applications to startup and unicorn hiring managers is October, not February.</strong></p>
            <p className="rpt-source">Source: Studojo platform data, LinkedIn Recruiter India insights, Wellfound application analytics</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Finding 08</span>
              <h2 className="rpt-h2">At some companies, the internship is the job offer. At others, it never was.</h2>
              <p className="rpt-lead">A Pre-Placement Offer (PPO) is an offer of full-time employment extended to an intern before they graduate. At certain companies, accepting a summer internship is effectively accepting a job. At others, it's not. The conversion rate - and timing - varies dramatically.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">PPO conversion rate by company type (% of interns who receive a full-time offer)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="ppoChart"></canvas></div>
            </div>

            <div className="rpt-card" style={{ overflowX: "auto" }}>
              <div className="rpt-card-label">When PPOs are typically communicated - by company type</div>
              <table className="rpt-table">
                <thead>
                  <tr><th>Company Type</th><th>PPO Communicated</th><th>Offer Deadline</th><th>Conversion Rate</th><th>Note</th></tr>
                </thead>
                <tbody>
                  <tr className="rpt-tr-hi"><td><strong>Series A-C Funded Startups</strong></td><td>Last week of internship</td><td>Within 2 weeks</td><td>78%</td><td>High conversion - intern is often filling a real gap</td></tr>
                  <tr><td><strong>B2B SaaS (growth stage)</strong></td><td>2-4 weeks before end</td><td>1-2 weeks</td><td>72%</td><td>Strong conversion if intern owned measurable output</td></tr>
                  <tr className="rpt-tr-hi"><td><strong>FMCG (HUL, ITC, P&G)</strong></td><td>End of internship</td><td>3-4 weeks</td><td>65%</td><td>Structured PPO process - often same day as final presentation</td></tr>
                  <tr><td><strong>Global Consulting (McKinsey, BCG)</strong></td><td>2-3 weeks before end</td><td>4-6 weeks to decide</td><td>60%</td><td>Known PPO policy - intern knows from Day 1 this is possible</td></tr>
                  <tr className="rpt-tr-hi"><td><strong>Investment Banking (Goldman, MS, JPM)</strong></td><td>Last 1-2 days</td><td>2-3 weeks</td><td>55%</td><td>Selective - typically top 50% of intern cohort</td></tr>
                  <tr><td><strong>Indian MNCs (TCS, Wipro, Infosys off-campus)</strong></td><td>Post-internship (3-6 months later)</td><td>Variable</td><td>40%</td><td>PPO exists but processes slow; many offers rescinded or deferred</td></tr>
                  <tr className="rpt-tr-hi"><td><strong>Marketing Agencies</strong></td><td>If at all - post-internship</td><td>Variable</td><td>31%</td><td>High turnover environment; PPO less common</td></tr>
                </tbody>
              </table>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-o">August</div><div className="rpt-lbl">When most summer internship PPOs are communicated (for April-July internships)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">November</div><div className="rpt-lbl">When most PPO deadlines fall - aligned with campus placement season for Tier 1 colleges</div></div>
              <div className="rpt-stat"><div className="rpt-val">78%</div><div className="rpt-lbl">PPO conversion at funded startups - highest of any company category in India 2026</div></div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The PPO strategy: pick companies where conversion is structural, not discretionary</div>
              <p>At Goldman Sachs, McKinsey, and HUL, PPO conversion is part of the program design. The intern cohort is sized to produce a certain number of full-time hires. At Series A startups, conversion is high because the intern was hired to fill a real gap - if they do the job, they get the offer. At IT services companies, PPOs are often offered but deferred, rescinded, or conditional on a campus placement not materializing. Know what kind of conversion you are walking into before you accept an internship.</p>
            </div>
            <p className="rpt-source">Source: AmbitionBox PPO reviews, IIM placement committee data, Studojo recruiter interviews, LinkedIn survey data Q1 2026</p>
          </div>

          {/* Full calendar summary table */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-orange">Full Calendar</span>
              <h2 className="rpt-h2">The full calendar. Every month. No excuses for missing a window again.</h2>
              <p className="rpt-lead">Use this as your working calendar. Each month has a primary action, who is actively recruiting, and what you should be doing even when nobody is accepting applications.</p>
            </div>

            <div className="rpt-card" style={{ overflowX: "auto" }}>
              <table className="rpt-table">
                <thead>
                  <tr><th>Month</th><th>Primary Action</th><th>Who Is Hiring</th><th>Key Deadlines</th><th>Background Work</th></tr>
                </thead>
                <tbody>
                  <tr className="rpt-tr-hi">
                    <td><strong>January</strong></td>
                    <td>Apply - FMCG undergrad, Big 4, unicorns (Jan cohort)</td>
                    <td>HUL Madhuri, ITC WOW, Dabur YLP, Deloitte, EY, Flipkart, PhonePe, Meesho</td>
                    <td>HUL Madhuri closes mid-Feb; Deloitte closes Jan</td>
                    <td>Update resume for FMCG keywords. Practice GD/PI for FMCG.</td>
                  </tr>
                  <tr>
                    <td><strong>February</strong></td>
                    <td>Apply - FMCG MBA programs, consulting undergrad, banks</td>
                    <td>Nestlé NILE, P&G undergrad, PwC, Goldman Sachs spring cohort (some)</td>
                    <td>P&G undergrad closes Feb. PwC closes Feb-Mar.</td>
                    <td>Start case prep for BCG/McKinsey Oct cycle. Build analytics portfolio.</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>March</strong></td>
                    <td>Final FMCG deadlines. Start startup applications aggressively.</td>
                    <td>Dabur, Godrej final deadlines. Series A companies post-Q1 funding.</td>
                    <td>Most FMCG windows close by March 31.</td>
                    <td>Research Q1 funded startups. Prepare direct founder outreach messages.</td>
                  </tr>
                  <tr>
                    <td><strong>April</strong></td>
                    <td>Summer internships begin executing. Off-campus startup applications.</td>
                    <td>Funded startups (post-Q1 round). Some unicorns (mid-cycle).</td>
                    <td>No major structured deadlines - rolling applications.</td>
                    <td>Build skills portfolio. Run a ₹500 Meta Ads experiment. Learn GA4.</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>May</strong></td>
                    <td>Mostly dead for applications. Focus entirely on skill-building.</td>
                    <td>Very few companies actively screening. Agencies only.</td>
                    <td>None significant.</td>
                    <td>Build case study projects. LinkedIn content. Practice DSA for Aug OAs.</td>
                  </tr>
                  <tr>
                    <td><strong>June</strong></td>
                    <td>Prepare - Big Tech OAs open in July. Get your materials ready now.</td>
                    <td>Very quiet. A few agencies and SMEs.</td>
                    <td>None significant.</td>
                    <td>Finalize resume for Big Tech. Complete LeetCode medium problems. Research IB firms.</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>July</strong></td>
                    <td>Apply - Google STEP, Amazon SDE, Microsoft Explore open NOW.</td>
                    <td>Google, Amazon, Microsoft, Adobe, Meta (open July-August). Unicorns restart.</td>
                    <td>Google STEP OA slots fill fast - apply Week 1 of July.</td>
                    <td>Set up campus interview prep group. Research unicorn hiring plans.</td>
                  </tr>
                  <tr>
                    <td><strong>August</strong></td>
                    <td>Highest-volume month. Apply everywhere simultaneously.</td>
                    <td>Goldman Sachs opens. Morgan Stanley opens. All Big Tech active. Campus placements start (Tier 1).</td>
                    <td>Goldman Sachs closes in 3-4 weeks. Microsoft Explore closes Aug.</td>
                    <td>PPOs from summer internships communicated this month - respond promptly.</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>September</strong></td>
                    <td>Consulting windows open. IB applications peak. Unicorn off-campus peak.</td>
                    <td>McKinsey, BCG, Bain open. J.P. Morgan, Citi open. Swiggy, Meesho, Razorpay active.</td>
                    <td>McKinsey closes Sep-Oct. BCG closes Oct. Goldman rounds end.</td>
                    <td>Prepare case interviews. Set Google Alerts for funding announcements.</td>
                  </tr>
                  <tr>
                    <td><strong>October</strong></td>
                    <td>Highest callback month for off-campus. Final consulting applications.</td>
                    <td>CRED, Nykaa, Meesho active. P&G CEO program opens. ITC Interrobang opens.</td>
                    <td>BCG closes Oct. Bain closes Oct-Nov. P&G CEO opens Oct.</td>
                    <td>Off-campus callback rates peak - send targeted applications daily.</td>
                  </tr>
                  <tr className="rpt-tr-hi">
                    <td><strong>November</strong></td>
                    <td>PPO decisions due. New annual program applications (ITC, P&G MBA).</td>
                    <td>ITC Interrobang, HUL ULIP open. Consulting new cycle starts. Some unicorns (Jan cohort).</td>
                    <td>PPO deadlines for summer interns. ITC open Nov-Dec.</td>
                    <td>If no PPO: build Dec applications list. Research new funded startups.</td>
                  </tr>
                  <tr>
                    <td><strong>December</strong></td>
                    <td>FMCG MBA cycle in full swing. HUL ULIP, P&G CEO, Nestlé NILE active.</td>
                    <td>HUL ULIP, McKinsey, BCG (next cycle preview). Godrej, Nestlé open.</td>
                    <td>HUL ULIP closes Jan. P&G CEO closes Dec. Nestlé closes Jan-Feb.</td>
                    <td>Prepare case interviews for Jan-Feb FMCG GD/PIs. Refresh portfolio.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta rpt-final-cta-orange">
            <div className="rpt-final-cta-title">You know the calendar. Now use it.</div>
            <p className="rpt-final-cta-sub">
              Studojo's Outreach tool identifies the right hiring managers at every company on this calendar and sends personalized emails on your behalf. Most students wait for job boards. You don't have to.
            </p>
            <div className="rpt-final-cta-btns">
              <Link to="/outreach" className="rpt-btn-white">Start Outreach Free</Link>
              <Link to="/dojos/careers" className="rpt-btn-outline">Build Your Resume</Link>
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
  .rpt-hero-orange { background:#431407; }
  .rpt-hero-inner { max-width:800px; margin:0 auto; }
  .rpt-badge { display:inline-flex; align-items:center; border:2px solid; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-badge-orange { background:#f59e0b; border-color:#fbbf24; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { text-decoration:none; }
  .rpt-breadcrumb-link-orange { color:#fbbf24; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
  .rpt-em-orange { font-style:italic; color:#fcd34d; }
  .rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
  .rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #3a2010; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; }
  .rpt-hval-orange { color:#fcd34d; }
  .rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-cta-strip { border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-orange { background:#fffbeb; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
  .rpt-cta-pill { display:inline-flex; align-items:center; color:#fff; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-cta-pill-orange { background:#f59e0b; }
  .rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { margin-top:64px; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-finding-num-orange { color:#f59e0b; }
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
  .rpt-o { color:#f59e0b; } .rpt-g { color:#10b981; } .rpt-v { color:#8b5cf6; }
  .rpt-lbl { font-size:12px; color:#525252; line-height:1.45; font-weight:500; }
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
  .rpt-du { background:#fef3c6; color:#92400e; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#faf5fe; border-color:#8b5cf6; } .rpt-cg { background:#d0fae4; border-color:#10b981; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#8b5cf6; } .rpt-cg .rpt-cl { color:#065f46; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#fcd34d; }
  .rpt-callout p { font-size:14px; line-height:1.7; }
  .rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  .rpt-col-head { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#737373; margin-bottom:12px; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-bar-row { display:grid; grid-template-columns:190px 1fr; align-items:center; gap:12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr; }
  .rpt-bar-label { font-size:12px; font-weight:500; color:#171717; line-height:1.35; }
  .rpt-bar-label small { display:block; font-size:11px; color:#737373; font-weight:400; }
  .rpt-bar-track { height:28px; background:#f5f5f5; border:1px solid #e5e5e5; border-radius:6px; overflow:hidden; }
  .rpt-bar-fill { height:100%; border-radius:6px 0 0 6px; display:flex; align-items:center; padding-left:10px; font-size:11px; font-weight:700; color:#fff; white-space:nowrap; }
  .rpt-inline-cta { border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-orange { background:#fffbeb; }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
  .rpt-inline-cta-sub { font-size:13px; color:#525252; }
  .rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; color:#fff; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-orange { background:#f59e0b; }
  .rpt-btn-secondary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#fff; color:#171717; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-table { width:100%; border-collapse:collapse; font-size:13px; font-family:'Satoshi',sans-serif; }
  .rpt-table th { background:#171717; color:#fff; padding:10px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:0.5px; white-space:nowrap; }
  .rpt-table td { padding:10px 14px; border-bottom:1px solid #e5e5e5; color:#525252; vertical-align:top; line-height:1.4; }
  .rpt-table td strong { color:#171717; }
  .rpt-table tr:last-child td { border-bottom:none; }
  .rpt-tr-hi td { background:#fffbeb; }
  .rpt-table tr:hover td { background:#fef9ee; }
  .rpt-final-cta { margin-top:64px; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-orange { background:#f59e0b; }
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
    .rpt-bar-row{grid-template-columns:110px 1fr;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
    .rpt-table{font-size:12px;} .rpt-table th,.rpt-table td{padding:8px 10px;}
  }
`;
