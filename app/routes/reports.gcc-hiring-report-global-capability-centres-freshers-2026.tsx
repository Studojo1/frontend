import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The GCC Hiring Report: How Freshers Get Into India's Global Capability Centres | Studojo" },
    { name: "description", content: "India has about 2,100 global capability centres employing 2.36 million people. What GCCs are, which roles they hire freshers for, and how to get in." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "gcc jobs for freshers, global capability centre hiring, what is a gcc company, gcc vs it services, gcc companies in india list, captive centre jobs" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/gcc-hiring-report-global-capability-centres-freshers-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The GCC Hiring Report: How Freshers Get Into India's Global Capability Centres" },
    { property: "og:description", content: "About 2,100 global companies run capability centres in India, employing 2.36 million people. Most students have never heard the term. What GCCs hire freshers for, and how to get in." },
    { property: "og:url", content: `${BASE_URL}/reports/gcc-hiring-report-global-capability-centres-freshers-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-11T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The GCC Hiring Report: How Freshers Get Into India's Global Capability Centres | Studojo" },
    { name: "twitter:description", content: "2,100+ GCCs in India. 2.36 million employees. Hiring that outpaces IT services. Yet most students don't know what a GCC is. What they hire freshers for, and how to get in." },
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

export default function Report_GccHiringReportGlobalCapabilityCentresFreshers2026() {
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
        "headline": "The GCC Hiring Report: How Freshers Get Into India's Global Capability Centres",
        "description": "India has about 2,100 global capability centres employing 2.36 million people. What GCCs are, which roles they hire freshers for, and how to get in.",
        "url": `${BASE_URL}/reports/gcc-hiring-report-global-capability-centres-freshers-2026`,
        "datePublished": "2026-11-11T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/gcc-hiring-report-global-capability-centres-freshers-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The GCC Hiring Report: How Freshers Get Into India's Global Capability Centres", "item": `${BASE_URL}/reports/gcc-hiring-report-global-capability-centres-freshers-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · November 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The GCC Hiring Report: How Freshers Get Into India's Global Capability Centres"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The GCC Hiring Report:<br /><em>2,100 Global Companies Are Hiring in India. Most Students Have Never Heard of Them.</em>" }} />
            <p className="rpt-hero-sub">{"When students think of tech and corporate jobs in India, they think of IT services firms and startups. A third option has quietly grown into one of the biggest employers of graduates: global capability centres, the in-house India offices of banks, retailers, manufacturers and tech companies from around the world. Here is what they are, what they hire for, and how freshers get in."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Engineering, commerce and other graduates"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Sector / Hiring"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"November 2026"}</span>
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
              <div className="sc-num">{"2,117"}</div>
              <div className="sc-label">{"Global capability centres operating in India in FY2026"}</div>
              <div className="sc-source">{"Nasscom and Zinnov GCC Landscape report, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"2.36M"}</div>
              <div className="sc-label">{"People employed by India's GCCs, up from about 1.9 million in FY2024"}</div>
              <div className="sc-source">{"Nasscom and Zinnov GCC Landscape report, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"$98.4B"}</div>
              <div className="sc-label">{"Revenue booked by India's GCCs in FY2026, up from $64.6 billion in FY2024"}</div>
              <div className="sc-source">{"Nasscom and Zinnov GCC Landscape report, as reported"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What a GCC actually is"}</div>
                <div className="sec-sub">{"In-house, not outsourced"}</div>
              </div>
            </div>
            <p>{"A global capability centre is an office that a global company runs in India for its own work. When a US bank builds a technology and operations centre in Bengaluru, or a European retailer runs its analytics team from Hyderabad, those are GCCs. Older terms for the same thing are captive centres and global in-house centres."}</p>
            <p>{"The difference from IT services matters for your career. At an IT services firm, you work on a client's project and may move between clients. At a GCC, you work for the company itself, on its own products, systems and operations. The work is often closer to the core of the business, and the company's brand on your resume is the global parent."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A GCC job means working directly for a global company from India, not for a vendor serving it."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"How big GCCs have become"}</div>
                <div className="sec-sub">{"One of India's largest graduate employers"}</div>
              </div>
            </div>
            <p>{"Nasscom and Zinnov count about 2,117 companies running GCCs in India in FY2026, with a combined workforce of about 2.36 million and revenue of about $98.4 billion. Estimates of 2026 hiring vary, with reported projections running into several lakh roles, and coverage in 2025 and 2026 suggested GCC hiring was growing faster than IT services hiring."}</p>
            <p>{"Bengaluru, Hyderabad, Pune, Chennai and the NCR host most GCCs, but newer centres are opening in tier-2 cities. Recruitment trackers have also reported that freshers were among the fastest-growing groups in GCC hiring in 2026."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" GCCs are no longer a niche. For many graduates, they are one of the best-paying entry points into corporate India."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"What GCCs hire freshers for"}</div>
                <div className="sec-sub">{"Not just engineers"}</div>
              </div>
            </div>
            <p>{"GCCs do a wide range of work, so they hire across disciplines. Engineering and data roles get the most attention, but finance, operations, risk, analytics and design centres hire large numbers of commerce and other graduates too."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" If you are a commerce, finance or analytics graduate, GCCs are one of your strongest options, not just an engineering employer."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Software engineering and cloud."}</strong> {"Building and running the parent company's own products and systems."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Data, analytics and AI."}</strong> {"Business analytics, data engineering and machine learning teams."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Finance and accounting."}</strong> {"Financial reporting, audit support, treasury and finance operations, often hiring BCom and CA-track graduates."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Risk, compliance and operations."}</strong> {"Especially at banks, insurers and financial services GCCs."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Design, product and cybersecurity."}</strong> {"Growing as GCCs take on more product ownership."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"How GCCs hire"}</div>
                <div className="sec-sub">{"Campus, careers pages and referrals"}</div>
              </div>
            </div>
            <p>{"GCCs hire freshers through campus drives at selected colleges, through their own careers pages, through graduate programmes and internships, and through employee referrals. Many list roles on the global parent's careers site filtered by Indian city, which is where many students forget to look."}</p>
            <p>{"Their selection usually looks more like a product company's than a mass recruiter's: online assessments, a technical or functional interview and a culture or managerial round. Internship-to-full-time conversion is a common route."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Search the global parent's careers site by Indian city. Many GCC roles never appear on Indian job boards."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"How to get in as a fresher"}</div>
                <div className="sec-sub">{"A targeted approach"}</div>
              </div>
            </div>
            <p>{"Make a list of 20 to 30 GCCs in your city and field. You can build it from news coverage of new centre launches and from LinkedIn searches for 'India' plus the company name. Follow their careers pages, connect with employees, especially alumni from your college, and ask for referrals for specific openings. Tailor your resume to the parent company's industry: banking, retail, healthcare or manufacturing knowledge helps as much as technical skill."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" GCCs offer global-company work, often with better pay than IT services, and they are hiring. Most freshers simply do not know where to look."}</div>
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
              <div className="blist-item" key="Add GCCs to your target list">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Add GCCs to your target list"}.</strong> {"They are one of India's largest graduate employers and hire across disciplines."}</span>
              </div>
              <div className="blist-item" key="Search the parent company's careers site">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Search the parent company's careers site"}.</strong> {"Filter by Indian city. Many roles are not on Indian job boards."}</span>
              </div>
              <div className="blist-item" key="Learn the parent's industry">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Learn the parent's industry"}.</strong> {"Domain knowledge in banking, retail or healthcare sets you apart."}</span>
              </div>
              <div className="blist-item" key="Use internships and referrals">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Use internships and referrals"}.</strong> {"Internship conversion and employee referrals are common GCC routes."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Reach GCC hiring managers directly"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-gcc-hiring-report-global-capability-centres-freshers-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
