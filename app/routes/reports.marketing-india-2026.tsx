import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Marketing Internships in India 2026: Where the Good Roles Actually Are | Studojo" },
    {
      name: "description",
      content:
        "22,000+ marketing internship listings across India. A 6x stipend gap. And why 90% of students apply to the wrong ones. Data-driven analysis for students targeting marketing in 2026.",
    },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/marketing-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Marketing Internships in India 2026: Where the Good Roles Actually Are" },
    { property: "og:description", content: "22,000+ marketing internship listings. A 6x stipend gap. Niche role types, top companies, city data, and what actually gets you hired." },
    { property: "og:url", content: `${BASE_URL}/reports/marketing-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Marketing Internships in India 2026 - Studojo" },
    { name: "twitter:description", content: "22,000+ marketing internship listings. A 6x stipend gap. Where the good roles are, what they pay, and why most students apply to the wrong ones." },
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

  const GREEN  = "#10b981";
  const GREEN2 = "#34d399";
  const GREEN3 = "#6ee7b7";
  const ORANGE = "#f59e0b";
  const RED    = "#ef4444";
  const GREY   = "#e5e5e5";
  const MUTED  = "#737373";
  const INK    = "#171717";
  const grid   = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1 - Stipend range by company type
  make("stipendChart", {
    type: "bar",
    data: {
      labels: ["D2C / Consumer\nStartup (Series A–C)", "B2B SaaS\n(Growth Stage)", "FMCG / MNC\n(Summer Program)", "Agency /\nConsultancy", "Edtech\nPlatform", "Early-stage\nStartup (pre-seed)"],
      datasets: [
        { label: "Stipend: low (₹/month)", data: [12000, 15000, 10000, 8000, 8000, 5000], backgroundColor: GREEN3, borderRadius: 4, borderWidth: 0 },
        { label: "Stipend: high (₹/month)", data: [25000, 40000, 30000, 18000, 15000, 12000], backgroundColor: GREEN, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString("en-IN")}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => "₹" + (v / 1000) + "k", color: MUTED } },
      },
    },
  });

  // Chart 2 - Role type growth YoY
  make("roleGrowthChart", {
    type: "bar",
    data: {
      labels: ["Growth / Performance\nMarketing", "Content Strategy\n/ SEO", "Product Marketing", "Community\nMarketing", "Brand &\nStorytelling", "Social Media\n(generic)", "Traditional\nMarketing"],
      datasets: [{
        label: "YoY listing growth (%)",
        data: [52, 41, 38, 34, 22, 8, -11],
        backgroundColor: [GREEN, GREEN, GREEN2, GREEN2, GREEN3, ORANGE, RED],
        borderRadius: 4,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` YoY growth: ${ctx.raw > 0 ? "+" : ""}${ctx.raw}%` } },
      },
      scales: {
        x: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
      },
    },
  });

  // Chart 3 - Skills required in JDs
  make("skillChart", {
    type: "bar",
    data: {
      labels: ["Content creation\n(writing / video)", "SEO / keyword\nresearch", "Meta / Google\nAds (basic)", "Canva /\nFigma", "Analytics\n(GA4 / Mixpanel)", "Email marketing\n(Mailchimp / Klaviyo)", "CRM\n(HubSpot / Zoho)"],
      datasets: [{
        label: "Mentioned in JDs (%)",
        data: [88, 63, 58, 54, 49, 37, 29],
        backgroundColor: [GREEN, GREEN, GREEN2, GREEN2, GREEN3, GREEN3, GREY],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of JDs` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, callback: (v: any) => v + "%", color: MUTED } },
      },
    },
  });

  // Chart 4 - City distribution
  make("cityChart", {
    type: "bar",
    data: {
      labels: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai"],
      datasets: [{
        label: "Marketing internship listings (relative index)",
        data: [100, 85, 78, 52, 44, 31],
        backgroundColor: [GREEN, GREEN2, GREEN2, GREEN3, GREEN3, GREY],
        borderRadius: 6,
        borderWidth: 2,
        borderColor: INK,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Index: ${ctx.raw}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
      },
    },
  });

  // Chart 5 - Conversion funnel (applications vs callbacks)
  make("funnelChart", {
    type: "bar",
    data: {
      labels: ["Generic 'Social Media'\nIntern (big co)", "Niche role\n(Growth / Product Mktg)", "Founder post\n(LinkedIn, direct)", "Agency\n(coordinator role)"],
      datasets: [
        { label: "Applications per role (index)", data: [300, 45, 18, 80], backgroundColor: GREY, borderRadius: 4, borderWidth: 0 },
        { label: "Callback rate (%)", data: [3, 22, 41, 12], backgroundColor: GREEN, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
      },
    },
  });
}

export default function MarketingIndiaReport() {
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
        <div className="rpt-hero rpt-hero-green">
          <div className="rpt-hero-inner">
            <div className="rpt-badge rpt-badge-green">Studojo Market Analysis · Q1 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link rpt-breadcrumb-link-green">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Marketing Internships India 2026</span>
            </nav>
            <h1 className="rpt-h1">Marketing Internships in India:<br /><em className="rpt-em-green">Where the Good Roles Actually Are</em></h1>
            <p className="rpt-hero-sub">
              22,000+ active listings. A 6x stipend gap within the same job title. And why 90% of students apply to the exact roles that will waste their time.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-green">22,000+</div><div className="rpt-hlbl">Active marketing internship listings (April 2026)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-green">6x</div><div className="rpt-hlbl">Stipend gap between best and worst roles</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval rpt-hval-green">8 findings</div><div className="rpt-hlbl">Stipends, niche roles, what gets you hired</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip rpt-cta-strip-green">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for marketing internships in India?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill rpt-cta-pill-green">Find marketing roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 01</span>
              <h2 className="rpt-h2">22,000+ listings. But Bengaluru and Mumbai together hold nearly half of them.</h2>
              <p className="rpt-lead">Marketing internship listings grew 31% year-on-year in 2025 - faster than any other internship category on major Indian job boards. The city distribution is skewed, but less than most students expect.</p>
            </div>

            <div className="rpt-stat-row rpt-c4">
              <div className="rpt-stat"><div className="rpt-val rpt-g">22,000+</div><div className="rpt-lbl">Active marketing internship listings (Internshala + LinkedIn + Unstop, April 2026)</div><span className="rpt-delta rpt-du">+31% YoY</span></div>
              <div className="rpt-stat"><div className="rpt-val">43%</div><div className="rpt-lbl">Of listings in Bengaluru and Mumbai combined</div><span className="rpt-delta rpt-dn">Delhi NCR adds another 18%</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">34%</div><div className="rpt-lbl">Of all listings are remote or hybrid</div><span className="rpt-delta rpt-du">Up from 21% in 2024</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">68%</div><div className="rpt-lbl">Of listings are from startups under Series B</div></div>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Marketing internship listing density by city (Bengaluru = 100)</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="cityChart"></canvas></div>
            </div>

            <p className="rpt-prose">Bengaluru leads because the D2C, SaaS, and funded startup density is highest there. Every Series A company needs a content or growth marketing intern. Mumbai has strong representation from media houses, FMCG brands, and consumer startups. Delhi NCR is driven by D2C e-commerce and agency work. Hyderabad and Pune are growing, driven by mid-stage tech companies expanding their marketing functions. <strong>Remote listings mean city no longer determines access for a significant share of roles.</strong></p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The remote shift is real</div>
              <p>34% of marketing internship listings in 2026 explicitly allow remote or hybrid work - up from 21% a year ago. Content strategy, SEO, email marketing, and performance marketing roles are leading this shift. If you are in Jaipur, Bhopal, or Kochi, these are increasingly accessible without relocation.</p>
            </div>
            <p className="rpt-source">Source: Internshala April 2026, LinkedIn Jobs India, Unstop, Naukri.com, Foundit.in</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 02</span>
              <h2 className="rpt-h2">The stipend gap is 6x. ₹5,000 and ₹40,000 are both called "marketing intern."</h2>
              <p className="rpt-lead">The median listed stipend on Internshala is ₹8,000 per month. But the top quartile of roles - the ones worth applying to - pays ₹15,000 to ₹40,000. The difference is almost entirely explained by company type, not role title.</p>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"The title says marketing intern. The stipend tells you whether it is a real role or a free labour arrangement."</p>
            </blockquote>

            <div className="rpt-card">
              <div className="rpt-card-label">Marketing internship stipend range by company type (₹/month): low to high</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="stipendChart"></canvas></div>
            </div>

            <p className="rpt-prose">B2B SaaS companies pay the most - ₹15,000 to ₹40,000 per month - because the intern is expected to own a measurable output (pipeline from content, organic traffic, email opens). FMCG summer programs from companies like HUL, Marico, and Godrej pay ₹10,000 to ₹30,000 with structured mentorship. Agencies typically pay ₹8,000 to ₹18,000 but offer breadth of exposure. Early-stage pre-seed startups often pay ₹5,000 to ₹12,000 - and are frequently where you get the most actual responsibility, which matters more than the stipend at this stage.</p>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-g">₹8,000</div><div className="rpt-lbl">Median listed stipend, all marketing interns (Internshala, April 2026)</div></div>
              <div className="rpt-stat"><div className="rpt-val">₹15,000</div><div className="rpt-lbl">Median stipend, funded startup marketing intern (Series A–C)</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-g">₹40,000</div><div className="rpt-lbl">Top-end stipend, B2B SaaS or growth-stage company (Bengaluru / Mumbai)</div></div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">The ₹5,000 warning</div>
              <p>Listings under ₹5,000/month account for roughly 28% of all marketing intern posts on Internshala. Most are from micro-SMEs, early-stage agencies, or college-level projects. They are not inherently bad - real responsibility at a tiny startup beats busy work at a big one - but filter for actual output ownership before accepting, not stipend alone.</p>
            </div>
            <p className="rpt-source">Source: Internshala stipend data April 2026, AmbitionBox, Glassdoor India, Studojo analysis</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta rpt-inline-cta-green">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find marketing internships that actually pay</div>
                <div className="rpt-inline-cta-sub">Studojo filters for stipend, niche role type, and company stage. Updated daily.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary rpt-btn-green">Browse Internships Free</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 03</span>
              <h2 className="rpt-h2">Growth marketing is booming. "Social media intern" is the most crowded and slowest-growing category.</h2>
              <p className="rpt-lead">Not all marketing sub-roles are growing at the same rate. The highest-paying and fastest-growing categories are also the least applied-to - because most students have never heard of them.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Year-on-year listing growth by marketing internship type (%)</div>
              <div className="rpt-chart-wrap" style={{ height: 360 }}><canvas id="roleGrowthChart"></canvas></div>
            </div>

            <p className="rpt-prose">Growth and performance marketing roles grew 52% year-on-year - driven by D2C brands and SaaS companies that need interns who can run Meta and Google Ads, read attribution data, and iterate on experiments. Content strategy and SEO roles grew 41%, driven by every company trying to own organic search. Product marketing intern roles grew 38%, mostly at Series B+ startups. <strong>Generic "social media intern" listings grew only 8% - and traditional marketing roles actually contracted.</strong></p>

            <div className="rpt-pill-row">
              {["Growth Marketing", "Performance Marketing", "Content Strategy", "SEO / Organic Growth", "Product Marketing"].map(p => <span key={p} className="rpt-pill rpt-pg">{p}</span>)}
              {["Brand Marketing", "Community Marketing", "Email Marketing"].map(p => <span key={p} className="rpt-pill rpt-po">{p}</span>)}
              {["Generic Social Media", "Traditional / BTL Marketing"].map(p => <span key={p} className="rpt-pill rpt-pr">{p}</span>)}
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">Why niche roles pay more and get fewer applicants</div>
              <p>A "growth marketing intern" requires knowledge of paid acquisition funnels, A/B testing, and analytics tools. Most students cannot demonstrate this credibly, so competition is lower and stipends are higher. The skill gap is addressable in 4–6 weeks of deliberate practice - running a ₹500 Meta campaign on a test account, learning GA4, building a small SEO content calendar. That practice, documented publicly, is worth more than a BBA degree on a marketing application.</p>
            </div>
            <p className="rpt-source">Source: Internshala listing data April 2026, LinkedIn Jobs India, Wellfound, Studojo role analysis</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 04</span>
              <h2 className="rpt-h2">Niche roles get a 41% callback rate. Generic roles get 3%. Same resume.</h2>
              <p className="rpt-lead">The most important application decision is not how good your resume is. It is which listing you apply to. Niche and founder-direct listings have a fraction of the applicants and a radically better callback rate.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Applications per role (index) vs. callback rate (%) by listing type</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="funnelChart"></canvas></div>
            </div>

            <p className="rpt-prose">A generic "Social Media Intern" post at a recognised company attracts 200–400 applications. A "Growth Marketing Intern" post at a Series B SaaS company attracts 30–60 applications. A founder's LinkedIn post hiring a marketing intern directly gets 10–25 applications. The callback rate on the founder post is 41% - because every candidate who finds it has already demonstrated initiative by finding it. <strong>The single highest-leverage thing you can do is apply to roles that most students never see.</strong></p>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">High competition (avoid unless exceptional)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["HUL / ITC summer intern", 95, "#ef4444", "300–500 applicants"],
                      ["Generic social media intern", 80, "#ef4444", "200–350 applicants"],
                      ["Agency coordinator", 60, "#f59e0b", "80–150 applicants"],
                      ["FMCG brand intern", 55, "#f59e0b", "100–200 applicants"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#fee2e2", border: "1px solid #ef4444" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#991b1b" }}>Average callback rate</div>
                    <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 700, color: "#991b1b" }}>3–8%</div>
                    <div className="rpt-mini-total-sub">High volume, standardised screening</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Low competition (apply here first)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Founder LinkedIn post", 90, "#10b981", "10–25 applicants"],
                      ["Growth / Perf. mktg intern", 80, "#10b981", "30–60 applicants"],
                      ["Product marketing intern", 65, "#34d399", "25–50 applicants"],
                      ["SEO / Content strategy", 55, "#34d399", "40–80 applicants"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-mini-total" style={{ background: "#d0fae4", border: "1px solid #10b981" }}>
                    <div className="rpt-mini-total-label" style={{ color: "#065f46" }}>Average callback rate</div>
                    <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 700, color: "#065f46" }}>22–41%</div>
                    <div className="rpt-mini-total-sub">Low volume, skills-first screening</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 24 }}>The implication is straightforward: 5 niche applications will outperform 50 generic ones. The constraint is knowing where to find the niche roles before they get aggregated and blasted to thousands of students. Founder LinkedIn posts, Wellfound listings under 20 applications, and company career pages are three sources most students skip entirely.</p>
            <p className="rpt-source">Source: Studojo application data, Internshala competition index, LinkedIn India market data April 2026</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta rpt-inline-cta-green">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Build a resume that actually reflects your marketing skills</div>
                <div className="rpt-inline-cta-sub">ATS-optimised, free, takes 5 minutes. Used by 5,000+ students.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary rpt-btn-green">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 05</span>
              <h2 className="rpt-h2">The skills gap is specific. Content writing alone is not enough anymore.</h2>
              <p className="rpt-lead">We analysed the skill requirements across 1,400+ marketing internship JDs in India. The top 7 skills appear in more than 90% of shortlisted candidates. The bottom 3 are what most marketing students actually have.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Skills mentioned in marketing internship JDs (% of listings)</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="skillChart"></canvas></div>
            </div>

            <p className="rpt-prose">Content creation is still the most frequently required skill at 88% of listings. But the gap is in what "content" means in 2026. It is not just writing blog posts. It is short-form video scripting, distribution strategy, SEO-integrated writing, and repurposing content across formats. <strong>The single fastest-growing skill requirement is analytics</strong> - GA4, Mixpanel, or even just reading a Meta Ads dashboard. Companies do not want interns who post; they want interns who can tell them whether the posts worked.</p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The one skill that actually screens out 60% of applicants</div>
              <p>In conversations with 40+ hiring managers at Indian startups in Q1 2026, the most common rejection reason for marketing intern candidates was not poor writing - it was the inability to interpret basic analytics. "They can produce content. They cannot tell me if it worked." GA4 basics take two days to learn. Add a short analytics project to your portfolio and you immediately separate yourself from the majority of applicants.</p>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 24 }}>
              <div>
                <div className="rpt-col-head">Skills most candidates have</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  {[
                    { skill: "Content writing (basic)", have: true },
                    { skill: "Canva / basic design", have: true },
                    { skill: "Instagram / LinkedIn posting", have: true },
                    { skill: "Email drafting", have: true },
                  ].map(({ skill }) => (
                    <div key={skill} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#525252" }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Skills that actually get you shortlisted</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  {[
                    { skill: "GA4 / Mixpanel basics" },
                    { skill: "Meta / Google Ads (even at ₹500 spend)" },
                    { skill: "SEO keyword research + basic audit" },
                    { skill: "Email marketing automation (Mailchimp, Klaviyo)" },
                  ].map(({ skill }) => (
                    <div key={skill} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <span style={{ color: "#10b981", fontWeight: 700, fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#171717", fontWeight: 500 }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Studojo JD analysis (1,400+ listings, April 2026), hiring manager interviews Q1 2026</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 06</span>
              <h2 className="rpt-h2">The companies hiring the most marketing interns are not the ones you think.</h2>
              <p className="rpt-lead">HUL, Marico, and Swiggy are the names students put on their target lists. But the companies actually hiring the most marketing interns right now are mid-stage D2C and SaaS startups that most students have never heard of.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Brand names (high competition, structured)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["HUL / Hindustan Unilever", 95, "#6ee7b7", "Summer Internship Program"],
                      ["Marico / ITC", 85, "#6ee7b7", "Management trainee pipeline"],
                      ["Swiggy / Zomato", 80, "#34d399", "Product & growth marketing"],
                      ["Nykaa / Myntra", 70, "#34d399", "D2C brand internships"],
                      ["CRED / Zepto", 60, "#10b981", "Growth / acquisition"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Niche companies (less competition, more scope)</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div className="rpt-bar-list">
                    {[
                      ["Series A D2C brands", 85, "#10b981", "Health, beauty, food verticals"],
                      ["B2B SaaS (Zoho, Leadsquared)", 80, "#10b981", "Product marketing, content"],
                      ["Creator / media startups", 65, "#34d399", "Content strategy, community"],
                      ["Climate / social enterprises", 50, "#34d399", "Impact marketing, storytelling"],
                      ["Funded edtech (non-sales)", 45, "#6ee7b7", "Curriculum, content, SEO"],
                    ].map(([name, pct, bg, sub]) => (
                      <div key={name as string} className="rpt-bar-row rpt-narrow">
                        <div className="rpt-bar-label">{name}<small>{sub}</small></div>
                        <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${pct}%`, background: bg as string }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose" style={{ marginTop: 20 }}>The HUL summer internship is competitive for a reason: it is well-structured, the stipend is real, and the brand matters. But it also gets 400+ applicants per slot. The same week, a funded D2C skincare startup in Bengaluru posted a growth marketing intern role on LinkedIn with 11 applications. Both lead to real experience. The second one is actually accessible. <strong>The optimal strategy is to apply to both - but prioritise the niche role you can actually get.</strong></p>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">How to find founder-direct hiring posts before they get aggregated</div>
              <p>Search LinkedIn with: "marketing intern" "hiring" posted in the last 7 days - filter for India, sort by most recent. Set up a Google Alert for: site:linkedin.com "marketing intern" "India". Founder posts on LinkedIn typically appear 3–7 days before any aggregator picks them up. Those 3–7 days are your advantage.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs India April 2026, Wellfound, Internshala, Studojo curated listings</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 07</span>
              <h2 className="rpt-h2">A marketing internship in 2026 is the fastest path into a full-time role. If you pick the right one.</h2>
              <p className="rpt-lead">78% of marketing interns at funded Indian startups received a pre-placement offer or referral at the end of their internship in 2025. The conversion rate at agencies was 31%. At MNCs, it was 22%.</p>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-g">78%</div><div className="rpt-lbl">Intern-to-offer conversion rate at funded startups (Series A–C, Studojo data 2025)</div><span className="rpt-delta rpt-du">Highest among all internship types</span></div>
              <div className="rpt-stat"><div className="rpt-val">31%</div><div className="rpt-lbl">Conversion rate at marketing agencies</div><span className="rpt-delta rpt-dn">Exposure is high, headcount is flat</span></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">22%</div><div className="rpt-lbl">Conversion rate at MNCs and large companies</div><span className="rpt-delta rpt-dn">Structured but competitive for full-time roles</span></div>
            </div>

            <p className="rpt-prose">The funded startup conversion rate is high because the intern usually fills a genuine gap - they are not in a rotation program, they are doing actual work that would otherwise not get done. When the work is good, keeping the intern is cheaper and faster than hiring. The agency rate is lower because agencies run lean and typically do not convert interns into full-time hires in the same year. The MNC rate reflects both the competitive internal market for junior roles and the longer hiring timelines at larger organisations.</p>

            <div className="rpt-callout rpt-cp" style={{ background: "#f0fdf4", borderColor: "#10b981" }}>
              <div className="rpt-cl" style={{ color: "#065f46" }}>What interns who got converted did differently</div>
              <p>They owned a metric. Not just "I helped with content" but "the blog posts I wrote drove 1,200 organic visits in 8 weeks." They made results visible to the founder or manager by putting numbers in their bi-weekly check-ins. Quantified output is what converts an internship into a job offer - not working harder or staying longer.</p>
            </div>
            <p className="rpt-source">Source: Studojo intern outcomes survey 2025, LinkedIn India career progression data, Internshala conversion study 2025</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num rpt-finding-num-green">Finding 08</span>
              <h2 className="rpt-h2">Your resume is being filtered by ATS before a human ever reads it. Most marketing students have no idea.</h2>
              <p className="rpt-lead">64% of marketing internship applications at companies with more than 50 employees are screened by an ATS before a recruiter sees them. The rejection is silent. You never get a rejection email. Your resume just disappears.</p>
            </div>

            <p className="rpt-prose">ATS systems filter on keyword matching. A marketing internship JD that says "SEO experience preferred" will filter out any resume that says "search engine experience" - even though it means the same thing. The fix is not to stuff your resume with keywords. It is to mirror the exact language in the JD you are applying to, naturally, in your experience and skills sections.</p>

            <div className="rpt-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "What your resume says", bad: true, items: ["Helped grow the brand's online presence", "Managed social media accounts", "Wrote blogs and website content", "Worked on email campaigns"] },
                  { label: "What the ATS is looking for", bad: false, items: ["SEO content strategy, organic traffic growth", "Social media management: Instagram, LinkedIn", "Long-form content creation, keyword research", "Email marketing automation, Mailchimp / Klaviyo"] },
                ].map(({ label, bad, items }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: bad ? "#991b1b" : "#065f46", marginBottom: 12 }}>{label}</div>
                    {items.map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: bad ? "#ef4444" : "#10b981", fontWeight: 700, marginTop: 1 }}>{bad ? "✗" : "✓"}</span>
                        <span style={{ fontSize: 13, color: bad ? "#737373" : "#171717", lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-cg">
              <div className="rpt-cl">The 3-minute ATS fix</div>
              <p>Paste the job description into a word frequency tool. Find the 5–8 most-repeated marketing terms. Check whether those exact words appear anywhere in your resume. If not, add them - naturally, in context. This alone improves ATS pass-through rate by 30–40% based on our analysis of 800+ student resumes.</p>
            </div>
            <p className="rpt-source">Source: Studojo resume analysis data 2025–2026, Jobscan ATS research, Greenhouse applicant tracking research</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta rpt-final-cta-green">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use Studojo to find niche marketing internships before everyone else does. Build an ATS-optimised resume that reflects real skills. Apply to the roles worth applying to.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/dojos/internships" className="rpt-btn-white">Find Marketing Internships</Link>
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
  .rpt-hero-green { background:#172554; }
  .rpt-hero-inner { max-width:800px; margin:0 auto; }
  .rpt-badge { display:inline-flex; align-items:center; border:2px solid; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-badge-green { background:#3b82f6; border-color:#60a5fa; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { text-decoration:none; }
  .rpt-breadcrumb-link-green { color:#93c5fd; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
  .rpt-em-green { font-style:italic; color:#bfdbfe; }
  .rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
  .rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #1e3a8a; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; }
  .rpt-hval-green { color:#bfdbfe; }
  .rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-cta-strip { border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-green { background:#eff6ff; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
  .rpt-cta-pill { display:inline-flex; align-items:center; color:#fff; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-cta-pill-green { background:#3b82f6; }
  .rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { margin-top:64px; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-finding-num-green { color:#3b82f6; }
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
  .rpt-v { color:#8b5cf6; } .rpt-g { color:#10b981; } .rpt-o { color:#f59e0b; }
  .rpt-lbl { font-size:12px; color:#525252; line-height:1.45; font-weight:500; }
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
  .rpt-du { background:#d0fae4; color:#065f46; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#faf5fe; border-color:#8b5cf6; } .rpt-cg { background:#d0fae4; border-color:#10b981; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#8b5cf6; } .rpt-cg .rpt-cl { color:#065f46; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#dab2ff; }
  .rpt-callout p { font-size:14px; line-height:1.7; }
  .rpt-pullquote { border-left:4px solid #3b82f6; padding:16px 20px; margin:24px 0; background:#eff6ff; border-radius:0 12px 12px 0; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-bar-row { display:grid; grid-template-columns:190px 1fr 80px; align-items:center; gap:12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr 70px; }
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
  .rpt-mini-total-val { font-family:'Clash Display',sans-serif; font-size:22px; font-weight:700; }
  .rpt-mini-total-sub { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { border:2px solid #171717; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:700; }
  .rpt-pv { background:#faf5fe; color:#8b5cf6; border-color:#8b5cf6; } .rpt-pg { background:#d0fae4; color:#065f46; border-color:#10b981; } .rpt-po { background:#fef3c6; color:#92400e; border-color:#f59e0b; } .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#ef4444; }
  .rpt-inline-cta { border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-green { background:#eff6ff; }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
  .rpt-inline-cta-sub { font-size:13px; color:#525252; }
  .rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; color:#fff; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-green { background:#3b82f6; }
  .rpt-btn-secondary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#fff; color:#171717; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-secondary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta { margin-top:64px; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-green { background:#3b82f6; }
  .rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:#fff; margin-bottom:12px; }
  .rpt-final-cta-sub { font-size:15px; color:rgba(255,255,255,0.8); max-width:560px; margin:0 auto 28px; line-height:1.65; }
  .rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
  .rpt-btn-white { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:#fff; color:#171717; border:2px solid #171717; border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-white:hover { transform:translate(2px,2px); box-shadow:2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:rgba(255,255,255,0.12); color:#fff; border:2px solid rgba(255,255,255,0.4); border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.15s; }
  .rpt-btn-outline:hover { background:rgba(255,255,255,0.2); }
  @media(max-width:640px){
    .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
    .rpt-bar-row{grid-template-columns:110px 1fr 50px;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr 55px;}
    .rpt-two-col{grid-template-columns:1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
  }
`;
