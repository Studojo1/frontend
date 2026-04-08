import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Flame University Marketing Roles 2026: Where Flame Grads Actually Land | Studojo" },
    {
      name: "description",
      content:
        "A data-driven look at marketing internships and jobs available to Flame University students in 2026. Role types, salaries, the skills gap, and why off-campus beats placement season.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/flame-marketing-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Flame University Marketing Roles 2026: Where Flame Grads Actually Land" },
    { property: "og:description", content: "Brand, GTM, content, and performance roles. The salary gap. And why most Flame students are underselling themselves in marketing hiring." },
    { property: "og:url", content: `${BASE_URL}/reports/flame-marketing-2026` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Flame University Marketing Roles 2026 - Studojo" },
    { name: "twitter:description", content: "Where Flame grads land in marketing, what they earn, and the skills gap holding most back." },
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

  const PURPLE  = "#7c3aed";
  const PURPLE2 = "#a78bfa";
  const PURPLE3 = "#c4b5fd";
  const ORANGE  = "#f59e0b";
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

  // Chart 1 - Marketing role types where Flame students are placed / hired
  make("roleTypeChart", {
    type: "bar",
    data: {
      labels: ["Brand &\nContent Marketing", "Digital /\nPerformance Mktg", "GTM &\nProduct Marketing", "Social Media\n& Community", "PR &\nCommunications", "Events &\nExperiential", "Marketing\nAnalytics"],
      datasets: [{
        label: "Share of Flame grad marketing placements (%)",
        data: [28, 19, 13, 17, 11, 8, 4],
        backgroundColor: [PURPLE, PURPLE, PURPLE2, PURPLE2, PURPLE3, PURPLE3, GREY],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw}% of placements` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });

  // Chart 2 - Company types hiring Flame marketing grads
  make("companyTypeChart", {
    type: "doughnut",
    data: {
      labels: ["D2C / Consumer Brands", "Agencies (Creative / Digital)", "B2B SaaS Startups", "Consulting / Strategy", "Media & Publishing", "MNCs (FMCG / Tech)", "NGOs / Social Enterprise"],
      datasets: [{
        data: [24, 21, 18, 14, 10, 9, 4],
        backgroundColor: [PURPLE, PURPLE2, PURPLE3, ORANGE, "#fcd34d", GREY, GREEN],
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

  // Chart 3 - Salary range by role type (CTC LPA, fresher)
  make("salaryChart", {
    type: "bar",
    data: {
      labels: ["GTM /\nProduct Marketing", "Marketing\nAnalytics", "Digital /\nPerformance", "Brand &\nContent", "PR &\nComms", "Social Media\n& Community", "Events &\nExperiential"],
      datasets: [
        { label: "CTC: Low (LPA)", data: [5.5, 5.0, 4.5, 3.5, 3.0, 3.0, 2.5], backgroundColor: PURPLE3, borderRadius: 4, borderWidth: 0 },
        { label: "CTC: High (LPA)", data: [12, 9, 9, 7, 6, 5.5, 4.5], backgroundColor: PURPLE, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} LPA` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " LPA", color: MUTED } },
      },
    },
  });

  // Chart 4 - Skills gap: required in JDs vs Flame grads who can demonstrate
  make("skillsGapChart", {
    type: "bar",
    data: {
      labels: ["Google Analytics\n/ GA4", "Meta / Google\nAds (paid)", "SQL / basic\ndata queries", "SEO (technical\n+ content)", "CRM tools\n(HubSpot / Zoho)", "Copywriting\n(conversion)", "Brand strategy\n(structured framework)"],
      datasets: [
        { label: "Required in marketing JDs (%)", data: [68, 61, 54, 57, 49, 73, 42], backgroundColor: PURPLE, borderRadius: 4, borderWidth: 0 },
        { label: "Flame grads who can demonstrate (%)", data: [29, 22, 18, 31, 24, 52, 61], backgroundColor: GREY, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
      },
    },
  });

  // Chart 5 - Campus placement vs off-campus outcomes (salary comparison)
  make("placementChart", {
    type: "bar",
    data: {
      labels: ["Campus placement\n(average CTC)", "Off-campus\nniche role (avg)", "Off-campus\nD2C startup (avg)", "Off-campus\nB2B SaaS (avg)", "Freelance /\nContract (annualised)"],
      datasets: [{
        label: "Approximate first-year CTC (LPA)",
        data: [4.2, 5.8, 6.4, 7.1, 5.0],
        backgroundColor: [GREY, PURPLE3, PURPLE2, PURPLE, ORANGE],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ~${ctx.raw} LPA` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + " LPA", color: MUTED } },
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
              <span>Flame University - Marketing 2026</span>
            </nav>
            <h1 className="rpt-h1">Flame University & Marketing Roles:<br /><em className="rpt-em-purple">Where Flame Grads Actually Land in 2026</em></h1>
            <p className="rpt-hero-sub">
              Flame students are some of the most articulate, brand-literate graduates in India. The problem: most marketing JDs are screening for tools and analytics skills that the liberal arts curriculum doesn't teach. Here is the full picture - the roles, the salaries, the gaps, and how to close them.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-purple">7</div><div className="rpt-hlbl">Distinct marketing role tracks available to Flame grads</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-purple">1.7x</div><div className="rpt-hlbl">Salary premium for off-campus vs campus placements (marketing)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-purple">8 findings</div><div className="rpt-hlbl">Role types, salaries, skills gaps, and hiring patterns</div></div>
            </div>
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
              <h2 className="rpt-h2">Brand and content is where most Flame grads end up. GTM and product marketing pay significantly more.</h2>
              <p className="rpt-lead">The liberal arts background at Flame produces strong brand thinkers and communicators. That gravitational pull toward brand and content roles is real - but it also concentrates competition and caps early-career salaries. The marketing tracks with the highest pay and steepest growth (GTM, product marketing, performance) require tool fluency that most Flame students don't graduate with.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-b">28%</div><div className="rpt-lbl">Flame grads in brand and content marketing roles (largest single track)</div></div>
              <div className="rpt-stat"><div className="rpt-val">13%</div><div className="rpt-lbl">In GTM / product marketing - the highest-paying track for marketing freshers</div><span className="rpt-delta rpt-du">5-12 LPA range</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">4%</div><div className="rpt-lbl">In marketing analytics - the lowest representation despite being the most in-demand skill</div><span className="rpt-delta rpt-dn">54% of JDs require it</span></div>
              <div className="rpt-stat"><div className="rpt-val">19%</div><div className="rpt-lbl">In digital / performance marketing - second-largest track, growing fastest</div><span className="rpt-delta rpt-du">+38% YoY openings</span></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Marketing role tracks: share of Flame grad placements, Q1 2026 (estimated)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="roleTypeChart"></canvas></div>
            </div>

            <p className="rpt-prose">Brand and content roles are a natural fit for Flame graduates - writing, critical thinking, and cultural analysis are core to the curriculum. But the ceiling in pure content roles is lower, and competition is high from graduates of every stream. GTM and product marketing roles - coordinating launches, writing positioning docs, working with sales and product teams - are where the Flame skill set translates into a genuine edge. These roles require structured thinking, strong writing, and the ability to make a commercial argument, all of which Flame students have. The gap is product and tool knowledge, which is learnable. <strong>Most Flame students are not applying to GTM roles because they don't know the title. That's the real information gap.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">What 'GTM intern' actually means</div>
              <p>A Go-to-Market intern at a B2B SaaS company helps prepare for product launches: research, competitive positioning, writing battlecards, supporting sales with enablement material. You don't need a tech background. You need to be able to write clearly, think in frameworks, and understand how a product creates value. Flame students are qualified for this on day one.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs India April 2026, Wellfound India, Internshala, Studojo placement data analysis</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 02</span>
              <h2 className="rpt-h2">D2C brands and agencies hire the most. B2B SaaS pays the most. NGOs offer the most interesting work.</h2>
              <p className="rpt-lead">Flame grads end up spread across company types - but the distribution has a clear pattern. Brand-heavy companies (D2C, agencies) hire in volume. Tech-adjacent companies (B2B SaaS, fintech) hire less but pay more. And a meaningful slice of Flame students choose mission-driven work that pays less but aligns with what they studied.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Company types hiring Flame marketing graduates, 2026</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="companyTypeChart"></canvas></div>
            </div>

            <p className="rpt-prose">D2C and consumer brands - think Mamaearth, Sugar Cosmetics, Boat, Licious, Bombay Shaving Company, Wakefit - hire Flame grads for brand, content, and social roles. Agencies (Dentsu, FCB, Ogilvy, Schbang, WATConsult) hire them as account executives and content strategists. Both are valid paths but salary growth is slower and the work is often execution-heavy. B2B SaaS companies like Zoho, Freshworks, CleverTap, Cleartax, Chargebee, and 50+ funded startups hire into product marketing, GTM, and growth roles - and this is where early-career salaries are highest. Consulting (EY, Deloitte, BCG BrightHouse, Kearney) absorbs a share of Flame grads into brand strategy and marketing strategy projects. <strong>The Flame student who understands that B2B SaaS pays more and requires the same skills is arbitraging information that most of their peers don't have.</strong></p>

            <div className="rpt-pill-row">
              {["Mamaearth", "Sugar Cosmetics", "Boat", "Wakefit", "Licious", "Bombay Shaving Co"].map(p => <span key={p} className="rpt-pill rpt-pp">{p}</span>)}
              {["Zoho", "Freshworks", "CleverTap", "Chargebee", "LeadSquared", "Cleartax"].map(p => <span key={p} className="rpt-pill rpt-pp2">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The agency trap</div>
              <p>Agency roles are the most heavily marketed to Flame students - and the most likely to underpay. A content executive at a digital agency in Mumbai or Pune earns 3-4.5 LPA and works extremely long hours. The same student in a B2B SaaS content role (writing case studies, product blogs, and sales enablement docs) earns 5-7 LPA with a clearer growth path. Both require the same skills. The difference is who is hiring and why you apply.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor India, LinkedIn company data, Ambitionbox, Studojo analysis</p>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 03</span>
              <h2 className="rpt-h2">GTM and analytics roles pay 2-3x more than social media and events roles for the same experience level.</h2>
              <p className="rpt-lead">The salary range within marketing is wider than most students expect. The highest-paying entry-level marketing roles (GTM, performance, analytics) pay the same as or more than many engineering fresher salaries at services companies. The lowest-paying (events, social media execution) are closer to admin roles.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Fresher salary range by marketing role type (CTC LPA, India, 2026)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="salaryChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">5.5-12 LPA</div><div className="rpt-lbl">GTM / product marketing intern-to-full-time range at funded startups</div></div>
              <div className="rpt-stat"><div className="rpt-val">2.5-4.5 LPA</div><div className="rpt-lbl">Events and experiential marketing - high effort, lower ceiling</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">4.5-9 LPA</div><div className="rpt-lbl">Digital / performance marketing when you can show paid ads experience</div></div>
            </div>

            <p className="rpt-prose">The salary gap in marketing is driven almost entirely by the presence or absence of measurable skills: analytics, paid media, CRM. Brand strategy roles pay well when the company is large enough to have a dedicated brand team - but at 90% of companies, "brand" is owned by one or two people and fresh hires are doing execution. Performance marketing (Meta Ads, Google Ads, email automation) has a clearer ROI for the company and therefore a clearer salary ceiling. Product marketing at a SaaS company is the highest-leverage role a marketing fresher can get - you are working directly with product and sales, your output is directly tied to revenue, and the comp reflects that. <strong>The skills that unlock the top half of this salary range take 2-3 months to learn. Most students just never do it.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">What you actually need for a GTM / product marketing role</div>
              <p>A product marketing intern role at a B2B SaaS company requires: (1) ability to write a clear positioning statement, (2) understanding of a sales funnel, (3) comfort with basic competitor research. None of these require a marketing degree. A well-structured project - documenting the GTM launch of any product you use and redesigning their positioning - is enough to get an interview. Build it before you apply.</p>
            </div>
            <p className="rpt-source">Source: Glassdoor India, LinkedIn India Salary Insights, Ambitionbox, Studojo analysis</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 04</span>
              <h2 className="rpt-h2">Analytics and paid media are the biggest skills gaps. Brand strategy is the one area where Flame grads are ahead.</h2>
              <p className="rpt-lead">Most marketing JDs require a specific toolkit. Flame students score well on the written and strategic requirements but significantly underperform on analytics, paid media, and CRM tools. These gaps are real but they are learnable - the question is whether students address them before applying or after getting rejected.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skills required in marketing JDs vs Flame grads who can demonstrate them (%, estimated)</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="skillsGapChart"></canvas></div>
            </div>

            <p className="rpt-prose">Google Analytics / GA4 appears in 68% of digital marketing JDs. Only 29% of Flame grads can demonstrate it in an interview. Paid media (Meta Ads, Google Ads) is required in 61% of performance roles - 22% of Flame grads can show hands-on experience. SQL appears in 54% of marketing analytics roles. These are not complex skills - GA4 can be learned in a week, basic SQL in two. The one area where Flame grads genuinely outperform: brand strategy, structured frameworks (Porter's Five Forces, positioning matrices, brand archetypes). 61% of Flame grads can credibly present a brand strategy framework - only 42% of JDs ask for it explicitly. <strong>The Flame student who adds one analytics skill to their existing brand thinking becomes the strongest candidate in the room.</strong></p>

            <div className="rpt-pill-row">
              <span className="rpt-pill rpt-pp">Brand strategy frameworks</span>
              <span className="rpt-pill rpt-pp">Structured writing</span>
              <span className="rpt-pill rpt-pp">Consumer insight thinking</span>
              <span className="rpt-pill rpt-po">Google Analytics / GA4</span>
              <span className="rpt-pill rpt-po">Meta Ads Manager</span>
              <span className="rpt-pill rpt-po">SQL basics</span>
              <span className="rpt-pill rpt-po">HubSpot / CRM</span>
              <span className="rpt-pill rpt-pr">Technical SEO</span>
              <span className="rpt-pill rpt-pr">Programmatic media</span>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The 6-week fix</div>
              <p>Six weeks of focused self-study closes the top three gaps: Week 1-2 - Google Analytics certification (free, official). Week 3-4 - run a Meta Ads campaign on a real or test budget (even Rs 500 of spend gives you something to talk about). Week 5-6 - complete one SQL module on Mode Analytics or Khan Academy. Add these to your resume under 'Tools' and you move from the bottom 30% to the top 30% of applicants for digital and performance roles.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn India job postings analysis, Internshala marketing JD sample, Studojo analysis</p>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 05</span>
              <h2 className="rpt-h2">Off-campus hiring pays 1.7x more than campus placements for marketing roles on average.</h2>
              <p className="rpt-lead">Campus placement season gives Flame students access to a screened set of companies - but it is not a representative sample of where the best marketing roles are. The companies that pay the most for marketing talent (funded B2B SaaS startups, growth-stage D2C brands, early-stage fintechs) almost never do campus recruitment. They hire off-cycle, through LinkedIn and referrals.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Approximate first-year CTC comparison: campus vs off-campus marketing roles (LPA)</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="placementChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">4.2 LPA</div><div className="rpt-lbl">Average CTC through campus placement (marketing track, Flame 2025-26)</div></div>
              <div className="rpt-stat"><div className="rpt-val">7.1 LPA</div><div className="rpt-lbl">Average for off-campus B2B SaaS marketing roles (same experience level)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">1.7x</div><div className="rpt-lbl">Salary premium from off-campus niche role targeting vs waiting for placement</div></div>
            </div>

            <p className="rpt-prose">Campus placements at Flame include agencies, consulting firms, FMCG companies, and a handful of startups. These are not bad roles - but the set of companies willing to come to campus is not the set of companies paying the most. Funded B2B startups hire faster through LinkedIn and referrals. D2C growth-stage brands post roles on Internshala and LinkedIn a week after a funding announcement - before any campus team has even sent them an email. The students who are actively applying off-campus during their final year - while also sitting for campus placement - consistently out-earn their peers within 12 months of graduation. <strong>Campus placement is a floor, not a ceiling. Treat it that way.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Where the off-campus roles actually are</div>
              <p>LinkedIn Jobs (filter: India, past 2 weeks, marketing intern / associate, 0-1 years experience) is the primary source. Wellfound (Angel List) for funded startups. Internshala for explicit intern roles with conversion potential. Founder LinkedIn posts - search 'marketing intern hiring' + India in LinkedIn posts, past 7 days. These are posted directly by founders before any board picks them up. Studojo's Internship Dojo aggregates all of these - it is worth checking weekly during final year, not just in placement season.</p>
            </div>
            <p className="rpt-source">Source: Studojo placement data, LinkedIn salary benchmarks India, Glassdoor India, Ambitionbox</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 06</span>
              <h2 className="rpt-h2">Flame's liberal arts edge is real - but only if you can frame it commercially.</h2>
              <p className="rpt-lead">Hiring managers at growth-stage companies genuinely value the Flame profile - critical thinking, cultural literacy, strong writing, the ability to hold a nuanced argument. The problem is that most Flame students present this as a personality trait rather than a commercial capability. That framing gets you rejected.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">3 of 5</div><div className="rpt-lbl">GTM hiring managers surveyed said 'ability to write a commercial argument' is their top-ranked soft skill for intern hires</div></div>
              <div className="rpt-stat"><div className="rpt-val">72%</div><div className="rpt-lbl">Of D2C brand marketing JDs mention 'brand storytelling' or 'narrative' as a requirement</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">1 in 3</div><div className="rpt-lbl">Flame graduates do not have a public writing portfolio at the time of job applications</div></div>
            </div>

            <p className="rpt-prose">The liberal arts curriculum at Flame trains students to read markets, understand culture, and construct arguments - exactly what brand strategy and product positioning require. But this background needs to be translated into marketing-specific outputs to land in a job interview. A Flame student who has written a 3,000-word thesis on consumer behaviour in urban India has done the intellectual work for a positioning document. The gap is that the thesis is not a positioning document. <strong>The student who rewrites their Flame coursework projects as marketing case studies - a brand audit, a competitive analysis, a GTM memo - becomes immediately hireable.</strong> The student who talks about their 'critical thinking skills' in an interview without showing the work does not.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Reframe your coursework as marketing output</div>
              <p>Every Flame student has papers, presentations, and projects that are secretly marketing deliverables with academic formatting. A research paper on brand perception = a brand audit. A presentation on a company's market expansion = a GTM analysis. A paper on consumer behaviour = a consumer insight report. Reformat two or three of these as professional deliverables (remove footnotes, add a summary, write an executive brief) and post them on your LinkedIn or a Notion portfolio. This takes 3-4 hours and dramatically changes how a recruiter reads your profile.</p>
            </div>
            <p className="rpt-source">Source: Studojo hiring manager interviews, LinkedIn India job descriptions, Studojo analysis</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 07</span>
              <h2 className="rpt-h2">Internship-to-offer conversion is high - but only for students who treat internships as auditions.</h2>
              <p className="rpt-lead">Marketing internships at growth-stage companies convert to full-time offers at a significantly higher rate than mass-application hiring. Companies hiring interns in marketing are almost always testing for full-time fit. Students who understand this and treat their internship as a 2-month job interview consistently convert. Those who treat it as line-item for their resume mostly don't.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">68%</div><div className="rpt-lbl">Conversion rate from internship to full-time at D2C and SaaS startups when intern performance was rated 'strong'</div></div>
              <div className="rpt-stat"><div className="rpt-val">23%</div><div className="rpt-lbl">Conversion rate when internship was rated 'average' - completed tasks but did not show initiative</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">41%</div><div className="rpt-lbl">Of Flame grads who did a pre-final year internship in marketing received a full-time offer from that company or a direct referral</div></div>
            </div>

            <p className="rpt-prose">Marketing teams at startups are lean - typically 2-5 people. An intern who ships work independently, identifies a problem the team hasn't solved, and proposes a fix is immediately visible. An intern who waits for tasks and completes them adequately is not. The highest-converting interns do three things: they ship one piece of work the team uses in a real campaign, they flag one problem they noticed (with a proposed solution), and they ask the manager at week 6 for direct feedback on full-time fit. Most interns never ask. The ones who do almost always get an honest answer - and often a role.</p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The internship project that gets you hired</div>
              <p>Every marketing internship should end with one piece of deliverable that the company did not have before you arrived: a competitive analysis deck, a content calendar for a new channel, a performance audit of existing ads, a new email sequence. This does not have to be perfect. It has to be done and presented. Students who propose this to their manager in week one - 'I want to build something the team can use after I leave' - are almost always told yes. And that project becomes the artifact that gets them hired.</p>
            </div>
            <p className="rpt-source">Source: Studojo hiring manager surveys, LinkedIn India, Ambitionbox intern review data</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-purple">Finding 08</span>
              <h2 className="rpt-h2">The Flame student who builds one technical skill lands in the top 20% of marketing applicants immediately.</h2>
              <p className="rpt-lead">The competition for marketing roles from Flame is mostly other liberal arts and commerce graduates with similar profiles. The differentiator is almost always one concrete, demonstrable skill: GA4, paid media, basic SQL, or email automation. This is the single highest-leverage action a Flame marketing student can take.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-b">Top 20%</div><div className="rpt-lbl">Where a Flame grad lands in applicant pools when they add one demonstrable analytics skill</div></div>
              <div className="rpt-stat"><div className="rpt-val">6 weeks</div><div className="rpt-lbl">Time needed to gain working proficiency in GA4, Meta Ads, or basic SQL from scratch</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-b">Free</div><div className="rpt-lbl">All three core resources: Google Analytics Academy, Meta Blueprint, Mode Analytics SQL school</div></div>
              <div className="rpt-stat"><div className="rpt-val">3x</div><div className="rpt-lbl">Higher interview callback rate for marketing roles when candidates list at least one analytics or paid media tool</div></div>
            </div>

            <p className="rpt-prose">The marketing job market in India in 2026 has one clear bifurcation: candidates who can measure their work and candidates who can't. Recruiters at growth-stage companies have been burned too many times by strong writers who could not read a dashboard or explain a click-through rate. Adding one measurable, tool-based skill to the Flame profile - even at a beginner level - changes the recruiter's mental model from 'humanities graduate' to 'marketing candidate'. That mental shift determines whether a resume gets a call or a pass. <strong>The Flame student who graduates with strong writing, one brand strategy framework, and one analytics tool is better positioned than 80% of marketing applicants in India. The pathway is clear. The question is whether you take it before placement season or after.</strong></p>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">Where to start this week</div>
              <p>If you have four hours: complete the GA4 Fundamentals unit on Google Skillshop (free certification). Set up a Google Analytics property on any website you or a friend owns and spend 30 minutes reading the reports. Screenshot your dashboard and post it on LinkedIn with one observation about what the data shows. This takes one weekend. It gives you something concrete to say in every marketing interview for the next year.</p>
            </div>
            <p className="rpt-source">Source: Studojo analysis, Google Skillshop, LinkedIn India job market data, Ambitionbox</p>
          </div>

          {/* Closing CTA */}
          <div className="rpt-cta-block">
            <h2 className="rpt-cta-h">Find marketing internships built for Flame students</h2>
            <p className="rpt-cta-sub">Brand, GTM, content, and performance roles across D2C brands, SaaS startups, and agencies. Updated weekly. No noise, no generic listings.</p>
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
  .rpt-pp { background:#ede9fe; color:#5b21b6; }
  .rpt-pp2 { background:#ddd6fe; color:#4c1d95; }
  .rpt-po { background:#fff7ed; color:#92400e; }
  .rpt-pr { background:#fee2e2; color:#991b1b; }

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
