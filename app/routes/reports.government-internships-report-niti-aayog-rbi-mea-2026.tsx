import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Government Internships Report: NITI Aayog, RBI, MEA and More, and Whether They Are Worth It | Studojo" },
    { name: "description", content: "NITI Aayog internships are typically unpaid; RBI and MEA internships are paid. How government internships work, who is eligible, and how to apply without scams." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "government internships india, niti aayog internship, rbi internship for students, mea internship, paid government internships, government internship for students 2026" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/government-internships-report-niti-aayog-rbi-mea-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Government Internships Report: NITI Aayog, RBI, MEA and More, and Whether They Are Worth It" },
    { property: "og:description", content: "Government internships carry serious weight on a resume, but they differ hugely in pay, eligibility and how you apply. A guide to NITI Aayog, RBI, MEA and the PM Internship Scheme." },
    { property: "og:url", content: `${BASE_URL}/reports/government-internships-report-niti-aayog-rbi-mea-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-15T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Government Internships Report: NITI Aayog, RBI, MEA and More, and Whether They Are Worth It | Studojo" },
    { name: "twitter:description", content: "NITI Aayog: usually unpaid. RBI and MEA: paid. All of them look serious on a resume. How government internships work, who gets them, and the fake 'government internship' sites to avoid." },
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
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #f59e0b; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #f59e0b; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #f59e0b; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #f59e0b; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #f59e0b; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #f59e0b; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #f59e0b; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_GovernmentInternshipsReportNitiAayogRbiMea2026() {
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
        "headline": "The Government Internships Report: NITI Aayog, RBI, MEA and More, and Whether They Are Worth It",
        "description": "NITI Aayog internships are typically unpaid; RBI and MEA internships are paid. How government internships work, who is eligible, and how to apply without scams.",
        "url": `${BASE_URL}/reports/government-internships-report-niti-aayog-rbi-mea-2026`,
        "datePublished": "2026-11-15T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/government-internships-report-niti-aayog-rbi-mea-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Government Internships Report: NITI Aayog, RBI, MEA and More, and Whether They Are Worth It", "item": `${BASE_URL}/reports/government-internships-report-niti-aayog-rbi-mea-2026` },
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
              <span>{"The Government Internships Report: NITI Aayog, RBI, MEA and More, and Whether They Are Worth It"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Government Internships Report:<br /><em>Some Are Unpaid, Some Pay Well. All Look Serious on a Resume.</em>" }} />
            <p className="rpt-hero-sub">{"Government internships are among the most searched-for internships in India, and among the most misunderstood. NITI Aayog's internship is typically unpaid, while the RBI and MEA offer paid placements with stricter eligibility. Each has its own portal, cycle and selection process. Here is how the main programmes work, and how to avoid the fake sites that sell 'government internships'."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · UG, PG and research students"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Guide / Internships"}</span>
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
              <div className="sc-num">{"Unpaid"}</div>
              <div className="sc-label">{"NITI Aayog internships are typically unpaid, run for about 6 weeks to 6 months, and are based in New Delhi"}</div>
              <div className="sc-source">{"NITI Aayog internship scheme, as described by multiple guides"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"Paid"}</div>
              <div className="sc-label">{"RBI and MEA internships pay a stipend. Amounts and eligibility vary by cycle, so check the official notice"}</div>
              <div className="sc-source">{"RBI and MEA internship programmes, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"₹0"}</div>
              <div className="sc-label">{"What you should ever pay to apply. Official government internships do not charge application fees through agents"}</div>
              <div className="sc-source">{"Studojo guidance"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Why government internships are worth it"}</div>
                <div className="sec-sub">{"Who benefits most"}</div>
              </div>
            </div>
            <p>{"A government internship signals seriousness, especially for careers in public policy, economics, law, international relations, development and civil services. You see how policy is researched and written, you work with officials and researchers, and you leave with a credential that is easy for anyone to recognise."}</p>
            <p>{"They are less useful if you want a corporate or tech career where hiring managers value hands-on industry work more. For those paths, a strong company internship usually does more."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Government internships are high-value for policy, economics, law and public affairs careers, and lower-value for most corporate roles."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The main programmes"}</div>
                <div className="sec-sub">{"How they differ"}</div>
              </div>
            </div>
            <p>{"Details change between cycles, and much of the information online comes from unofficial guides that disagree. Use the descriptions below as orientation, then confirm everything on the official website before applying."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Always read the latest official notice. Stipends, eligibility and application windows change, and unofficial sites are often out of date."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"NITI Aayog."}</strong> {"Typically unpaid, around 6 weeks to 6 months, in New Delhi, open to UG, PG and research students, with applications through its own portal in regular windows. Strong for policy and economics."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Reserve Bank of India."}</strong> {"A paid summer placement aimed mainly at postgraduate students in economics, finance, statistics, law and related fields, with competitive selection. Strong for finance and economics careers."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Ministry of External Affairs."}</strong> {"A paid internship reported for UG and PG students and recent graduates, with work across MEA divisions. Strong for international relations."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"PM Internship Scheme."}</strong> {"Not a ministry internship but a government-backed 12-month placement at large companies, with a monthly stipend. See our PM Internship Scheme Report."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Other ministries, regulators and research bodies."}</strong> {"Many run their own schemes. Check each organisation's official website for notices."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"How selection works"}</div>
                <div className="sec-sub">{"What makes an application stand out"}</div>
              </div>
            </div>
            <p>{"Government internships usually select on academic record, a statement of purpose and sometimes a recommendation from your institution. Some set minimum marks. Because many applicants have similar grades, the statement of purpose is where you stand out."}</p>
            <p>{"Write a short, specific statement: the policy area you care about, what you have already done in it (a research paper, a debate, a project, a society), and what you want to contribute or learn in that specific division. Generic statements about 'serving the nation' do not help."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Your statement of purpose should name a specific area and show you have already worked on it. That is what separates you from candidates with the same marks."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Avoid fake 'government internship' sites"}</div>
                <div className="sec-sub">{"A common scam aimed at students"}</div>
              </div>
            </div>
            <p>{"Because government internships are so searched for, many websites and social media accounts advertise 'government internships with certificate' for a fee. Some are training courses with misleading names. Others are outright scams. Official internships are applied for through the organisation's own website, typically ending in .gov.in or .nic.in, or through the official PM Internship portal."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" If you found it through a site that is not the organisation's own, verify it on the official website before sharing documents or money."}</div>

            <div className="callout-red"><strong>{"Red flags:"}</strong>{" Registration or certificate fees, guaranteed selection, applications through WhatsApp or Telegram, and sites that are not on an official government domain."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Making an unpaid internship work"}</div>
                <div className="sec-sub">{"Plan the cost before you accept"}</div>
              </div>
            </div>
            <p>{"An unpaid internship in New Delhi has real costs: travel, rent and food. If you are not from Delhi, budget for them before accepting, look for hostels or shared accommodation, and consider shorter durations. If the cost is too high, a paid internship elsewhere in your field may be the better choice, and there is no shame in that."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Government internships are powerful credentials for the right careers. Apply through official portals, write a specific statement, and plan the costs."}</div>
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
              <div className="blist-item" key="Match the internship to your career">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Match the internship to your career"}.</strong> {"Strongest for policy, economics, law and international relations."}</span>
              </div>
              <div className="blist-item" key="Use only official portals">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Use only official portals"}.</strong> {"Look for .gov.in or .nic.in domains, or the official PM Internship portal."}</span>
              </div>
              <div className="blist-item" key="Write a specific statement of purpose">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Write a specific statement of purpose"}.</strong> {"Name your area and show what you have already done in it."}</span>
              </div>
              <div className="blist-item" key="Budget for unpaid internships">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Budget for unpaid internships"}.</strong> {"Travel and living costs in Delhi add up. Plan them before accepting."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Compare with paid internships"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-government-internships-report-niti-aayog-rbi-mea-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
