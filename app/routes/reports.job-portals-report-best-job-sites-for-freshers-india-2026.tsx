import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Job Portals Report: Naukri vs LinkedIn vs Internshala vs Unstop vs Wellfound for Freshers | Studojo" },
    { name: "description", content: "Which job portal actually gets freshers interviews? How Naukri, LinkedIn, Internshala, Unstop, Wellfound and company careers pages differ, and how to use each." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "best job portal for freshers, naukri vs linkedin, internshala vs linkedin, unstop for freshers, wellfound jobs india, job sites in india for freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/job-portals-report-best-job-sites-for-freshers-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Job Portals Report: Naukri vs LinkedIn vs Internshala vs Unstop vs Wellfound for Freshers" },
    { property: "og:description", content: "Freshers spread themselves across five job portals and get replies from none. Each portal works for a different kind of job. Here is which one to use for what, and how." },
    { property: "og:url", content: `${BASE_URL}/reports/job-portals-report-best-job-sites-for-freshers-india-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-16T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Job Portals Report: Naukri vs LinkedIn vs Internshala vs Unstop vs Wellfound for Freshers | Studojo" },
    { name: "twitter:description", content: "Naukri, LinkedIn, Internshala, Unstop, Wellfound. Freshers use all five the same way and wonder why nothing works. Each one is built for a different job. Here's which to use for what." },
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

export default function Report_JobPortalsReportBestJobSitesForFreshersIndia2026() {
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
        "headline": "The Job Portals Report: Naukri vs LinkedIn vs Internshala vs Unstop vs Wellfound for Freshers",
        "description": "Which job portal actually gets freshers interviews? How Naukri, LinkedIn, Internshala, Unstop, Wellfound and company careers pages differ, and how to use each.",
        "url": `${BASE_URL}/reports/job-portals-report-best-job-sites-for-freshers-india-2026`,
        "datePublished": "2026-11-16T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/job-portals-report-best-job-sites-for-freshers-india-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Job Portals Report: Naukri vs LinkedIn vs Internshala vs Unstop vs Wellfound for Freshers", "item": `${BASE_URL}/reports/job-portals-report-best-job-sites-for-freshers-india-2026` },
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
              <span>{"The Job Portals Report: Naukri vs LinkedIn vs Internshala vs Unstop vs Wellfound for Freshers"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Job Portals Report:<br /><em>Five Portals, One Strategy, Zero Replies. Use Each One Differently.</em>" }} />
            <p className="rpt-hero-sub">{"Freshers sign up for every portal and use them all the same way: search, click apply, wait. Each portal is built for a different kind of employer, role and candidate. Used the right way, two or three of them will get you interviews. Used the wrong way, all five will get you silence. Here is which portal to use for what."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Freshers and interns"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Guide / Job search"}</span>
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
              <div className="sc-num">{"75%"}</div>
              <div className="sc-label">{"Employers planning to hire freshers in July to December 2026, as reported. The jobs are out there"}</div>
              <div className="sc-source">{"TeamLease EdTech Career Outlook, H2 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"+39%"}</div>
              <div className="sc-label">{"Year-on-year growth in BPO and ITES hiring of 0 to 3 year candidates in January 2026, as reported"}</div>
              <div className="sc-source">{"Naukri JobSpeak, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"2 to 3"}</div>
              <div className="sc-label">{"Portals most freshers should focus on, chosen by target role. Spreading across all of them dilutes effort"}</div>
              <div className="sc-source">{"Studojo guidance"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Why spraying applications across every portal fails"}</div>
                <div className="sec-sub">{"Volume is not a strategy"}</div>
              </div>
            </div>
            <p>{"Easy-apply buttons make it possible to send hundreds of applications a week. Employers know this, which is why they filter hard. A generic resume sent to 200 roles across five portals usually performs worse than a tailored one sent to 30 roles on the two portals your target employers actually use."}</p>
            <p>{"The fix is to choose portals by the kind of job you want, then use each one the way it is designed to be used."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Choose your portals by target role and employer type, then apply less but better on each."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Which portal for what"}</div>
                <div className="sec-sub">{"What each one is best at"}</div>
              </div>
            </div>
            <p>{"Each major platform has a different centre of gravity. Use the ones that match your target."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Internships and early startups: Internshala and Wellfound. Mass and mid-size employers: Naukri. Networking and referrals: LinkedIn. Competitions and campus-style hiring: Unstop."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Naukri."}</strong> {"India's largest traditional job board. Strong for IT services, BFSI, BPO, sales and mid-size companies. Recruiters search its resume database, so your profile matters as much as your applications."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"LinkedIn."}</strong> {"Best for networking, referrals and reaching hiring managers directly. Its job listings are useful, but the platform's real power is the people behind the listings."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Internshala."}</strong> {"Focused on internships and fresher jobs, especially at startups and small companies. Good for first internships, but check the stipend and company carefully."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Unstop."}</strong> {"Competitions, hackathons, case challenges and hiring challenges. A strong way to get noticed without relying on CGPA or college brand."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Wellfound."}</strong> {"Startup jobs, often with salary and equity listed. Good for tech, product and growth roles at funded startups."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Company careers pages."}</strong> {"Underused. Large companies and GCCs often post roles here first, and some never post them on portals at all."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"How to use each one properly"}</div>
                <div className="sec-sub">{"The settings and habits that change results"}</div>
              </div>
            </div>
            <p>{"On Naukri, complete your profile fully, use the keywords from your target job descriptions, and update it regularly, because recruiters search the database and recently updated profiles are easier to find. On LinkedIn, write a clear headline that says what role you want, connect with alumni at target companies, and message people rather than only clicking apply. On Internshala and Wellfound, answer the screening questions properly; they are often the real filter. On Unstop, pick competitions linked to your target role and use results as proof on your resume."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" On every portal, the screening answers and profile keywords decide more than the apply button."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"The roles portals never show you"}</div>
                <div className="sec-sub">{"The hidden part of the market"}</div>
              </div>
            </div>
            <p>{"Many roles, especially at startups and for internships, are filled through referrals, direct outreach and networks before they are posted widely, or without being posted at all. Portals show you the visible market. To reach the rest, combine portals with direct messages to founders and hiring managers, alumni referrals, and company careers pages."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Use portals to find companies that are hiring, then reach the people behind the listing directly."}</div>

            <div className="callout-red"><strong>{"Scam warning:"}</strong>{" Fake recruiters use job portals too. A real employer never asks for a fee, and never moves the whole process to WhatsApp without an interview."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"A weekly routine that works"}</div>
                <div className="sec-sub">{"Two hours a day, five days a week"}</div>
              </div>
            </div>
            <p>{"Monday: search your two or three main portals and shortlist 15 roles. Tuesday and Wednesday: tailor your resume and apply to the best 10. Thursday: message five people at those companies on LinkedIn. Friday: apply to two competitions or hiring challenges and follow up on last week's applications. Track every application in a spreadsheet and drop channels that never produce replies."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" The best job portal is the one your target employers use, used with tailored applications and direct follow-up."}</div>
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
              <div className="blist-item" key="Pick portals by target role">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Pick portals by target role"}.</strong> {"Two or three portals used well beat five used carelessly."}</span>
              </div>
              <div className="blist-item" key="Fix your profile and screening answers">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Fix your profile and screening answers"}.</strong> {"Recruiters search profiles, and screening questions are the real filter."}</span>
              </div>
              <div className="blist-item" key="Don't forget careers pages">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Don't forget careers pages"}.</strong> {"Large companies and GCCs often post there first."}</span>
              </div>
              <div className="blist-item" key="Combine portals with outreach">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Combine portals with outreach"}.</strong> {"Find the role on a portal, then message the person behind it."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Go beyond the apply button"}</h3>
              <p>{"Studojo Outreach helps you reach the hiring managers behind the listings you find on job portals."}</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              {"Try Studojo Outreach →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
