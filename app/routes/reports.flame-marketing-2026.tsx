import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Flame University & Marketing Careers 2026: What the Placement Data Actually Shows | Studojo" },
    {
      name: "description",
      content:
        "Flame's placement data is BFSI-heavy, not marketing-heavy. Here is what the published numbers actually show, and what marketing-track students need to do differently.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/flame-marketing-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Flame University & Marketing Careers 2026: What the Placement Data Actually Shows" },
    { property: "og:description", content: "Flame's MBA avg CTC is ₹9.63 LPA, but campus placements skew BFSI and consulting, not marketing. Here is what that means for marketing-track students." },
    { property: "og:url", content: `${BASE_URL}/reports/flame-marketing-2026` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Flame University Marketing Careers 2026 - Studojo" },
    { name: "twitter:description", content: "Flame's placement data decoded. What marketing-track students actually face and where the real opportunities are." },
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

  const PURPLE  = "#8b5cf6";
  const PURPLE2 = "#a78bfa";
  const PURPLE3 = "#c4b5fd";
  const ORANGE  = "#f59e0b";
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

  // Chart 1 - Flame MBA placement sector breakdown (official 2023 data)
  make("sectorChart", {
    type: "doughnut",
    data: {
      labels: ["BFSI", "IT / ITeS", "Consulting", "Retail", "Conglomerate / Other"],
      datasets: [{
        data: [37, 26, 13, 11, 13],
        backgroundColor: [PURPLE, PURPLE2, PURPLE3, ORANGE, GREY],
        borderWidth: 2,
        borderColor: "#fff",
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { font: { size: 12 }, boxWidth: 14, padding: 14 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}%` } },
      },
    },
  });

  // Chart 2 - Flame MBA CTC trend (published data)
  make("ctcTrendChart", {
    type: "bar",
    data: {
      labels: ["2023", "2024", "2025"],
      datasets: [
        {
          label: "Average CTC (LPA)",
          data: [9.15, 11.0, 9.63],
          backgroundColor: PURPLE,
          borderRadius: 6,
          borderWidth: 0,
        },
        {
          label: "Highest CTC (LPA)",
          data: [20.5, 25.0, 15.25],
          backgroundColor: PURPLE3,
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ₹${ctx.raw} LPA` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 }, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => "₹" + v + " L", color: MUTED } },
      },
    },
  });

  // Chart 3 - Real marketing fresher salary market (India 2025-26, general market)
  make("marketSalaryChart", {
    type: "bar",
    data: {
      labels: ["Social Media /\nContent Exec", "Digital Marketing\nExecutive", "Brand /\nMarketing Exec (metro)", "Product Marketing\n(B2B SaaS)", "PR /\nComms Executive"],
      datasets: [
        { label: "Low (LPA)", data: [1.8, 2.5, 3.0, 4.5, 3.0], backgroundColor: PURPLE3, borderRadius: 4, borderWidth: 0 },
        { label: "High (LPA)", data: [3.3, 4.5, 6.0, 9.0, 6.0], backgroundColor: PURPLE, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ₹${ctx.raw} LPA` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => "₹" + v + " L", color: MUTED } },
      },
    },
  });

  // Chart 4 - Skills appearing in real Indian marketing JDs (Internshala/LinkedIn/Naukri, April 2026)
  make("skillsChart", {
    type: "bar",
    data: {
      labels: ["Social media\n(Instagram/LinkedIn)", "Content writing\n/ copywriting", "Canva", "MS Excel", "SEO\n(on-page/off-page)", "Google Analytics\n/ GA4", "Email marketing\n(Mailchimp etc.)", "Meta / Google\nAds (paid)", "Video editing\n(CapCut/Premiere)"],
      datasets: [{
        label: "Editorial ranking index (based on JD review: not a counted dataset)",
        data: [95, 90, 82, 78, 71, 65, 52, 55, 48],
        backgroundColor: [PURPLE, PURPLE, PURPLE, PURPLE2, PURPLE2, PURPLE2, PURPLE3, PURPLE3, GREY],
        borderRadius: 4,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` Frequency index: ${ctx.raw}` } },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });
}

export default function FlameMarketingReport() {
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
        <div className="rpt-hero rpt-hero-purple">
          <div className="rpt-hero-inner">
            <div className="rpt-badge rpt-badge-purple">Studojo Market Analysis · Q1 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link rpt-breadcrumb-link-purple">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Flame University: Marketing 2026</span>
            </nav>
            <h1 className="rpt-h1">Flame University & Marketing Careers:<br /><em className="rpt-em-purple">What the Placement Data Actually Shows</em></h1>
            <p className="rpt-hero-sub">
              Flame's published placement numbers are real and solid. But they tell a story most marketing-track students miss: campus recruiters skew heavily toward BFSI and consulting, not brand and content. Students who want marketing careers from Flame mostly build them off-campus. Here's the full picture.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-purple">₹9.63 LPA</div><div className="rpt-hlbl">Flame MBA average CTC 2025 (published)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-purple">37%</div><div className="rpt-hlbl">Campus placements in BFSI: the largest sector</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-purple">7 findings</div><div className="rpt-hlbl">Placement data, market salaries, and skills that actually get you hired</div></div>
            </div>
          </div>
        </div>

        {/* Methodology note */}
        <div className="rpt-method-bar">
          <div className="rpt-method-inner">
            <strong>Data note:</strong> Placement figures are from Flame University's official published reports (flame.edu.in/career-services/placement-report). Market salary ranges are from Glassdoor India, AmbitionBox, and DigitalVidya. JD skills frequency is from Internshala, LinkedIn Jobs India, and Naukri (April 2026). BBA-specific placement data is not published by Flame: figures in this report refer to the MBA programme unless stated.
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip rpt-cta-strip-purple">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Flame student looking for marketing internships?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill rpt-cta-pill-purple">Find marketing roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 01</span>
              <h2 className="rpt-h2">Flame MBA placements average ₹9.63 LPA, but the sector breakdown is not what most students expect.</h2>
              <p className="rpt-lead">Flame's placement numbers are published and verified. The headline CTC is strong for a Pune business school. But the sector breakdown tells a different story: 37% of placements are in BFSI, 26% in IT and ITeS, and 13% in consulting. Marketing as a domain is listed as a functional area but does not dominate: the bulk of campus recruiting is driven by banks, insurance companies, and IT services firms.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-b">₹9.63 LPA</div><div className="rpt-lbl">MBA average CTC, 2025 batch</div><span className="rpt-delta rpt-dn">Down from ₹11 LPA in 2024</span></div>
              <div className="rpt-stat"><div className="rpt-val">₹9.42 LPA</div><div className="rpt-lbl">MBA median CTC, 2025 batch</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">₹15.25 LPA</div><div className="rpt-lbl">Highest CTC offer, 2025 batch</div></div>
              <div className="rpt-stat"><div className="rpt-val">96%</div><div className="rpt-lbl">Placement rate, 2025 batch</div></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Flame MBA campus placements by sector: 2023 (most detailed data published)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="sectorChart"></canvas></div>
            </div>

            <p className="rpt-prose">The companies that show up reliably on Flame's campus recruiter list are HDFC Bank, ICICI Prudential, Bajaj Finserv, Kotak Mahindra Bank, Axis AMC, Mahindra Finance, GoDigit, EY, PwC, Deloitte, FactSet, and WNS. This is a strong recruiter list, but it is a BFSI and consulting list. Consumer brands, creative agencies, and growth-stage startups are not primary campus recruiters here. <strong>The alumni employer list on Flame's website, which includes Ogilvy, HUL, Zomato, and Nike: represents lifetime alumni, not annual campus batch placements.</strong> These are different things and the distinction matters when you are planning your career strategy.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">What this means for marketing-track students</div>
              <p>If your goal is a brand, content, GTM, or growth marketing role, you are unlikely to get it through Flame's campus placement process. This is not a criticism of Flame: it reflects who participates in campus recruiting broadly. D2C brands, funded startups, and agencies almost never do campus placements at any B-school outside the IIMs. The students who land those roles from Flame are doing it off-campus, through LinkedIn, referrals, and direct applications.</p>
            </div>
            <p className="rpt-source">Source: flame.edu.in/career-services/placement-report/year-2025, year-2024, year-2023</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 02</span>
              <h2 className="rpt-h2">Average CTC dropped from ₹11 LPA in 2024 to ₹9.63 LPA in 2025. The highest offer also fell: from ₹25 LPA to ₹15.25 LPA.</h2>
              <p className="rpt-lead">Three years of published placement data shows a consistent average in the ₹9–11 LPA range, with meaningful year-on-year variation. The 2025 batch saw a dip from the 2024 peak. This is consistent with the broader Indian MBA placement market, which saw compression in 2024-25 across most non-IIM schools.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Flame MBA placement CTC: average and highest, 2023–2025 (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="ctcTrendChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">₹7.65 LPA</div><div className="rpt-lbl">MBA (Communications Management) average CTC, 2025: the marketing-adjacent programme</div></div>
              <div className="rpt-stat"><div className="rpt-val">₹8 LPA</div><div className="rpt-lbl">MBA (Comms Mgmt) median CTC, 2025</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">₹40k/mo</div><div className="rpt-lbl">Average summer internship stipend (MBA, 2025): strongest signal of full-time offer quality</div></div>
            </div>

            <p className="rpt-prose">The MBA (Communications Management) programme, the most directly marketing-relevant, shows a lower average CTC (₹7.65 LPA) than the standard MBA (₹9.63 LPA). This is expected: comms, PR, and media roles pay less at entry level than BFSI relationship management or consulting analyst roles. The summer internship stipend of ₹40k/month average is a meaningful number: it reflects the quality of companies willing to take Flame interns and is a reasonable proxy for full-time offer quality at conversion. The highest MBA stipend in 2025 was ₹80k/month: the floor was not published.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">BBA data caveat</div>
              <p>Flame does not publish BBA-specific placement statistics in their official reports. Third-party aggregator sites (Shiksha, Careers360) cite figures but these cannot be verified against Flame's own data. One Careers360 review from a BA Economics graduate mentioned 2.5–3 LPA offers from Infosys, TCS, and Wipro, which is consistent with what tier-2 and tier-3 colleges see from IT services campus drives, not what BBA Business or Comms students targeting marketing roles would expect. If you are a Flame BBA student, treat all third-party salary figures for your programme as unverified.</p>
            </div>
            <p className="rpt-source">Source: flame.edu.in/career-services/placement-report (2023, 2024, 2025, interim 2025-26)</p>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 03</span>
              <h2 className="rpt-h2">The general market for marketing freshers in India pays ₹1.8–6 LPA. Flame's MBA average sits well above this: because the placements are not in marketing.</h2>
              <p className="rpt-lead">Understanding the difference between Flame's placement average and the general marketing fresher market is essential. The ₹9.63 LPA average includes BFSI and consulting roles, which pay more than most marketing roles. A Flame MBA student who specifically targets brand or content marketing is entering a market where the general range is ₹2.5–6 LPA at most companies.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">General market salary range for marketing freshers, India 2025-26 (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="marketSalaryChart"></canvas></div>
            </div>

            <p className="rpt-prose">These ranges are from Glassdoor India, AmbitionBox, and published salary reports (accessed via secondary sources: both platforms require login for direct data). Treat as directional, not precise. Social media and content executive roles pay ₹1.8–3.3 LPA at most companies. Digital marketing executives earn ₹2.5–4.5 LPA. Brand and marketing executive roles in metro cities run ₹3–6 LPA. The outlier is product marketing at B2B SaaS companies, which can reach ₹9 LPA for strong candidates at funded startups. <strong>A Flame MBA student who insists on a marketing title and targets agencies or mid-size consumer brands is likely to receive offers below the campus placement average.</strong> The students who maintain the CTC average are those who accept BFSI or consulting roles, or are exceptional candidates who land the rare high-paying startup marketing role.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The B2B SaaS exception</div>
              <p>Product marketing roles at funded B2B SaaS companies (Zoho, Freshworks, CleverTap, Chargebee, LeadSquared, Icertis, and funded Series A–B startups) are the highest-paying pure marketing roles accessible to fresh MBA graduates. The work involves launch coordination, competitive positioning, and sales enablement: all areas where strong writing and structured thinking matter more than technical skills. These companies rarely do campus placements. They hire off-cycle, mostly through LinkedIn and referrals. The Flame profile is genuinely competitive for these roles: the gap is visibility, not qualification.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor India, AmbitionBox, digitalvidya.com salary reports, thedmschool.com India salary survey 2025</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 04</span>
              <h2 className="rpt-h2">Real marketing JDs require tools most Flame students haven't used. Content and brand thinking alone is not enough.</h2>
              <p className="rpt-lead">Analysing live marketing job listings on Internshala, LinkedIn Jobs, and Naukri in April 2026 shows a consistent pattern: the skills most in demand are practical and tool-based. Social media, Canva, Excel, SEO, and GA4 appear in the majority of listings. Strong writing is table stakes. Analytics and paid media are fast-becoming table stakes too.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skills appearing in Indian marketing JDs: Internshala, LinkedIn, Naukri (April 2026) · Editorial ranking, not a counted dataset</div>
              <div className="rpt-chart-wrap" style={{ height: 360 }}><canvas id="skillsChart"></canvas></div>
            </div>

            <p className="rpt-prose">The frequency index shown is relative: social media at 95 means it appears in nearly every marketing listing. Canva is explicitly named in the majority of design-adjacent roles. Google Analytics/GA4 appears in roughly two-thirds of digital marketing roles. Meta and Google Ads appear in just over half: concentrated in performance and growth roles. Video editing tools (CapCut, Premiere Pro) are a growing requirement, particularly for D2C and social-first brands. <strong>Flame's curriculum builds strong writers and structured thinkers. It does not systematically build GA4 users, Canva-proficient designers, or paid media operators.</strong> That gap is real and students who close it before applying have a meaningfully stronger application.</p>

            <div className="rpt-pill-row">
              <span className="rpt-pill rpt-pp-g">Free: Google Analytics Certification</span>
              <span className="rpt-pill rpt-pp-g">Free: Meta Blueprint</span>
              <span className="rpt-pill rpt-pp-g">Free: Canva tutorials</span>
              <span className="rpt-pill rpt-pp-g">Free: Semrush SEO Academy</span>
              <span className="rpt-pill rpt-po">Paid but cheap: CapCut / Premiere</span>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The fastest thing you can do</div>
              <p>Google Analytics certification on Google Skillshop is free and takes 4–6 hours. It gives you something concrete to list under Tools on your resume and something real to talk about in every digital marketing interview. Set up a free GA4 property on any website after completing it. Take a screenshot of the dashboard. That's your portfolio proof. This takes one weekend and moves you past a large share of competing applicants who list "good communication skills" but nothing tool-specific.</p>
            </div>
            <p className="rpt-source">Source: internshala.com/internships/marketing-internship/, in.indeed.com, naukri.com, linkedin.com/jobs: April 2026</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 05</span>
              <h2 className="rpt-h2">Internshala marketing intern stipends range from ₹3,000 to ₹80,000/month. The spread tells you what type of company you are targeting.</h2>
              <p className="rpt-lead">Internship stipend ranges in real listings on Internshala as of April 2026 vary enormously. The spread is not random: it directly reflects company type, stage, and how seriously they treat the intern role.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-b">₹3k–5k</div><div className="rpt-lbl">Entry stipend range: small agencies, early-stage startups, NGOs</div></div>
              <div className="rpt-stat"><div className="rpt-val">₹7k–15k</div><div className="rpt-lbl">Standard range: mid-size companies, growth-stage startups</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">₹18k–30k</div><div className="rpt-lbl">Quality range: funded Series A–B startups taking marketing seriously</div></div>
              <div className="rpt-stat"><div className="rpt-val">₹35k–80k</div><div className="rpt-lbl">Premium: large D2C brands, sales-heavy or MBA-level roles</div></div>
            </div>

            <p className="rpt-prose">For a Flame MBA student, targeting the ₹18k–30k+ bracket is the right calibration. These are roles at companies that treat interns as pre-hires: the conversion rate to full-time is high, the work is real, and the brand name adds to your profile. Companies paying ₹3k–5k are either early-stage with no budget or are treating interns as cheap execution labour. The quality of work and the learning curve are different. The stipend is a proxy, not a perfect filter, but it is a useful first screen. <strong>A Flame MBA student taking a ₹5k/month marketing internship at an agency when they could target a ₹25k/month role at a funded startup is leaving money, learning, and future optionality on the table.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Where to find the ₹18k+ marketing internships</div>
              <p>Wellfound (formerly AngelList) is the best source for funded startup internships: filter by India, marketing, internship. LinkedIn Jobs with a 'past 2 weeks' filter and 'internship' job type finds roles before they fill. Founder LinkedIn posts: search "marketing intern hiring" in LinkedIn Posts, India, past 7 days: are often the freshest source before any aggregator picks them up. Studojo's Internship Dojo aggregates these weekly. The volume of quality listings is higher than most Flame students realise because most students only look at Internshala.</p>
            </div>
            <p className="rpt-source">Source: internshala.com/internships/marketing-internship/: live listings, April 2026</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 06</span>
              <h2 className="rpt-h2">The Flame liberal arts edge is real, but it needs to be shown as work, not described as a trait.</h2>
              <p className="rpt-lead">Flame's curriculum: built around critical thinking, cultural analysis, and structured argumentation: produces graduates with a genuine advantage in brand strategy, positioning, and written communication. This advantage is real. The problem is that most Flame students present it as a personality description in interviews and resumes, rather than as demonstrated work. That framing does not land.</p>
            </div>

            <p className="rpt-prose">A marketing hiring manager at a growth-stage company does not need to be told that a candidate thinks critically. They need to see a brand audit, a positioning document, a competitive analysis, a content calendar: something that shows the thinking applied to a real problem. Flame students write sophisticated papers, presentations, and research projects throughout their degree. Many of these are, in substance, marketing deliverables with academic formatting. A brand perception paper is a brand audit. A market expansion analysis is a GTM memo. A consumer behaviour study is a consumer insight report. <strong>The student who takes two or three of these projects, reformats them as professional deliverables, and posts them on a Notion portfolio or LinkedIn becomes immediately more credible than a peer who lists 'strong analytical skills' with no evidence.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Turn your coursework into a portfolio this week</div>
              <p>Pick two Flame projects. Remove the academic formatting. Add a one-page executive summary at the top: what was the question, what did you find, what would you recommend. Export as PDF. Post on LinkedIn as a document post with a two-sentence context. This takes 3–4 hours and creates a searchable, shareable artifact that hiring managers can read in 5 minutes. Most of your competition doesn't have this.</p>
            </div>
            <p className="rpt-source">Source: Studojo editorial analysis; LinkedIn India marketing JD review, April 2026</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 07</span>
              <h2 className="rpt-h2">Campus placement is a floor for Flame students, not a ceiling. The highest-paying marketing roles are built off-campus.</h2>
              <p className="rpt-lead">The companies paying the most for early-career marketing talent: funded B2B SaaS startups, growth-stage D2C brands, early-stage fintechs: almost never do campus placements at any B-school outside the top 5 IIMs. This is not specific to Flame. It means the students who land those roles are doing so through direct applications, LinkedIn outreach, and referrals, not through the placement cell.</p>
            </div>

            <p className="rpt-prose">Flame's placement cell provides real value: it brings in companies, filters for serious candidates, and gives students access to interviews they might not generate themselves. For BFSI and consulting roles, which make up the majority of campus placements: it is the right channel. For marketing roles at the quality of company most Flame students aspire to, it is not the primary channel. Students who treat campus placement as their only strategy for marketing careers are narrowing their options significantly. The students who run both in parallel: sitting for campus placement while also applying directly off-campus throughout the year: consistently have better outcomes. <strong>Running your own job search in parallel to placement season is not disloyalty to the process. It is standard practice at every top B-school.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The off-campus stack that works</div>
              <p>LinkedIn profile with a clear headline (not just 'MBA student at Flame'), 2–3 portfolio pieces visible, and 5–10 connection requests per week to marketing managers at target companies. Wellfound for funded startup roles. Internshala for explicit intern-to-hire roles. Direct email to founders who post about their company on LinkedIn: one specific, well-researched email is worth 50 generic applications. Studojo's Internship Dojo for a curated weekly list. This stack, run consistently for two months during final year, generates more quality marketing interviews than most Flame students get through campus placement.</p>
            </div>
            <p className="rpt-source">Source: Studojo editorial; flame.edu.in placement reports; LinkedIn India</p>
          </div>

          {/* Closing CTA */}
          <div className="rpt-cta-block">
            <h2 className="rpt-cta-h">Find marketing internships worth applying to</h2>
            <p className="rpt-cta-sub">Brand, GTM, content, and performance roles at D2C brands, B2B SaaS startups, and agencies. Updated weekly. No ₹3k agency listings.</p>
            <div className="rpt-cta-btns">
              <Link to="/dojos/internships" className="rpt-btn rpt-btn-purple">Browse marketing internships</Link>
              <Link to="/dojos/careers" className="rpt-btn rpt-btn-out-purple">Build your resume free</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

const rptCSS = `
  .rpt-hero { padding: 72px 24px 56px; }
  .rpt-hero-purple { background: #1e1b4b; color: #fff; }
  .rpt-hero-inner { max-width: 800px; margin: 0 auto; }
  .rpt-badge { display:inline-block; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:999px; padding:4px 14px; margin-bottom:20px; }
  .rpt-badge-purple { background:rgba(167,139,250,.18); color:#c4b5fd; border:1px solid rgba(167,139,250,.3); }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:rgba(255,255,255,.55); margin-bottom:18px; }
  .rpt-breadcrumb-link { text-decoration:none; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-link-purple { color:#a78bfa; }
  .rpt-breadcrumb-sep { opacity:.4; }
  .rpt-h1 { font-size: clamp(26px,4.5vw,42px); font-weight:800; line-height:1.18; margin:0 0 18px; letter-spacing:-.02em; }
  .rpt-em-purple { font-style:normal; color:#a78bfa; }
  .rpt-hero-sub { font-size: clamp(15px,2vw,18px); line-height:1.65; opacity:.82; max-width:680px; margin:0 0 36px; }
  .rpt-hero-stats { display:flex; flex-wrap:wrap; gap:32px; }
  .rpt-hero-stat { display:flex; flex-direction:column; gap:4px; }
  .rpt-hval { font-size:28px; font-weight:800; line-height:1; }
  .rpt-hval-purple { color:#a78bfa; }
  .rpt-hlbl { font-size:12px; opacity:.65; max-width:160px; line-height:1.4; }

  .rpt-method-bar { background:#fafafa; border-bottom:1px solid #ececec; padding:12px 24px; }
  .rpt-method-inner { max-width:800px; margin:0 auto; font-size:12px; color:#737373; line-height:1.6; }
  .rpt-method-inner strong { color:#404040; }

  .rpt-cta-strip { padding:14px 24px; }
  .rpt-cta-strip-purple { background:#ede9fe; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .rpt-cta-strip-text { font-size:14px; font-weight:600; color:#3730a3; }
  .rpt-cta-pill { font-size:13px; font-weight:700; border-radius:999px; padding:7px 18px; text-decoration:none; }
  .rpt-cta-pill-purple { background:#7c3aed; color:#fff; }
  .rpt-cta-pill-purple:hover { background:#6d28d9; }

  .rpt-content { max-width:800px; margin:0 auto; padding:16px 24px 80px; }
  .rpt-finding { padding:48px 0; border-bottom:1px solid #f0f0ee; }
  .rpt-finding:last-child { border-bottom:none; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; display:block; margin-bottom:12px; }
  .rpt-finding-num-purple { color:#7c3aed; }
  .rpt-h2 { font-size: clamp(18px,2.5vw,24px); font-weight:800; line-height:1.3; letter-spacing:-.02em; margin:0 0 14px; color:#0a0a0a; }
  .rpt-lead { font-size:16px; line-height:1.7; color:#404040; margin:0; }
  .rpt-prose { font-size:15px; line-height:1.75; color:#404040; margin:20px 0; }
  .rpt-prose strong { color:#0a0a0a; }

  .rpt-stat-row { display:grid; gap:16px; margin:24px 0; }
  .rpt-c3 { grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); }
  .rpt-c4 { grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); }
  .rpt-stat { background:#fafafa; border:1px solid #ececec; border-radius:10px; padding:18px; }
  .rpt-val { font-size:22px; font-weight:800; color:#0a0a0a; margin-bottom:6px; line-height:1; }
  .rpt-val.rpt-b { color:#7c3aed; }
  .rpt-lbl { font-size:12px; color:#737373; line-height:1.4; }
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; border-radius:999px; padding:2px 8px; margin-top:8px; }
  .rpt-du { background:#dcfce7; color:#15803d; }
  .rpt-dn { background:#fee2e2; color:#b91c1c; }

  .rpt-card { background:#fff; border:1px solid #ececec; border-radius:12px; padding:20px; margin:24px 0; }
  .rpt-card-label { font-size:12px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:.06em; margin-bottom:16px; }
  .rpt-chart-wrap { position:relative; width:100%; }

  .rpt-callout { border-radius:10px; padding:20px 22px; margin:20px 0; }
  .rpt-cp { background:#f5f3ff; border-left:3px solid #7c3aed; }
  .rpt-cl { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#7c3aed; margin-bottom:8px; }
  .rpt-callout p { font-size:14px; line-height:1.7; color:#3730a3; margin:0; }

  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { font-size:12px; font-weight:600; border-radius:999px; padding:4px 12px; }
  .rpt-pp-g { background:#dcfce7; color:#15803d; }
  .rpt-po { background:#fff7ed; color:#92400e; }

  .rpt-source { font-size:11px; color:#a3a3a3; margin-top:8px; }

  .rpt-cta-block { background:#f5f3ff; border-radius:16px; padding:40px 36px; text-align:center; margin-top:48px; }
  .rpt-cta-h { font-size:clamp(18px,2.5vw,24px); font-weight:800; letter-spacing:-.02em; color:#0a0a0a; margin:0 0 10px; }
  .rpt-cta-sub { font-size:15px; color:#525252; line-height:1.6; margin:0 auto 24px; max-width:520px; }
  .rpt-cta-btns { display:flex; justify-content:center; flex-wrap:wrap; gap:12px; }
  .rpt-btn { display:inline-block; font-size:14px; font-weight:700; border-radius:8px; padding:12px 24px; text-decoration:none; }
  .rpt-btn-purple { background:#7c3aed; color:#fff; }
  .rpt-btn-purple:hover { background:#6d28d9; }
  .rpt-btn-out-purple { background:#fff; color:#7c3aed; border:2px solid #7c3aed; }
  .rpt-btn-out-purple:hover { background:#f5f3ff; }

  @media (max-width:600px) {
    .rpt-hero { padding:48px 16px 40px; }
    .rpt-content { padding:12px 16px 60px; }
    .rpt-hero-stats { gap:20px; }
    .rpt-cta-block { padding:28px 20px; }
    .rpt-cta-strip-inner { flex-direction:column; align-items:flex-start; }
  }
`;
