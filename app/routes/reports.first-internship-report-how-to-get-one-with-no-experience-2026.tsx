import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The First Internship Report: How Students With No Experience Land Their First One | Studojo" },
    { name: "description", content: "Every internship asks for experience, and you need an internship to get it. How students break that loop: what to build, where to apply, and in what order." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get internship with no experience, first internship tips, internship for college students india, how to get first internship, internship resume no experience, internship for first year students" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/first-internship-report-how-to-get-one-with-no-experience-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The First Internship Report: How Students With No Experience Land Their First One" },
    { property: "og:description", content: "The first internship is the hardest one to get. Every listing wants experience you do not have yet. How students break the loop, step by step." },
    { property: "og:url", content: `${BASE_URL}/reports/first-internship-report-how-to-get-one-with-no-experience-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-13T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The First Internship Report: How Students With No Experience Land Their First One | Studojo" },
    { name: "twitter:description", content: "Every internship wants experience. You need an internship to get experience. Here's how students actually break that loop, and the order to do it in." },
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

export default function Report_FirstInternshipReportHowToGetOneWithNoExperience2026() {
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
        "headline": "The First Internship Report: How Students With No Experience Land Their First One",
        "description": "Every internship asks for experience, and you need an internship to get it. How students break that loop: what to build, where to apply, and in what order.",
        "url": `${BASE_URL}/reports/first-internship-report-how-to-get-one-with-no-experience-2026`,
        "datePublished": "2026-11-13T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/first-internship-report-how-to-get-one-with-no-experience-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The First Internship Report: How Students With No Experience Land Their First One", "item": `${BASE_URL}/reports/first-internship-report-how-to-get-one-with-no-experience-2026` },
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
              <span>{"The First Internship Report: How Students With No Experience Land Their First One"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The First Internship Report:<br /><em>No Experience? Here Is How to Break the Loop.</em>" }} />
            <p className="rpt-hero-sub">{"Every internship listing seems to ask for experience, and you need an internship to get experience. The loop is real, but it breaks in a predictable way. Employers hiring first-timers are not looking for a track record. They are looking for evidence you can learn and deliver. Here is how to create that evidence and where to use it."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · First, second and third-year students"}</span>
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
              <div className="sc-num">{"75%"}</div>
              <div className="sc-label">{"Employers planning to hire freshers in July to December 2026, as reported"}</div>
              <div className="sc-source">{"TeamLease EdTech Career Outlook, H2 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"93%"}</div>
              <div className="sc-label">{"E-commerce and tech startups planning fresher hiring in the same period, among the highest of any sector"}</div>
              <div className="sc-source">{"TeamLease EdTech Career Outlook, H2 2026, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"1"}</div>
              <div className="sc-label">{"Piece of real work you can show. It is the single biggest difference between first-time applicants who get replies and those who do not"}</div>
              <div className="sc-source">{"Studojo guidance"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What 'experience' really means for a first internship"}</div>
                <div className="sec-sub">{"It is evidence, not a job title"}</div>
              </div>
            </div>
            <p>{"When an internship listing asks for experience, the employer is really asking two questions: can this person do the basic work, and will they finish what they start? A previous internship answers both. But so does a project you completed, a college society you ran, a freelance job you delivered, a competition you placed in, or a piece of writing, design or code you can show."}</p>
            <p>{"Startups and small companies, which report some of the strongest fresher hiring intent, are especially open to this kind of evidence, because they hire for what you can do next week rather than what is on your transcript."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" You do not need previous experience. You need proof. One finished piece of work counts as experience for a first internship."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Build one piece of proof in two weeks"}</div>
                <div className="sec-sub">{"Small, real and related to the role"}</div>
              </div>
            </div>
            <p>{"Pick the kind of internship you want, then build one small thing that looks like the work. Keep it small enough to finish in two weeks. A finished small project beats an ambitious unfinished one."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Make the proof look like the job. A marketing applicant with a real campaign beats one with a certificate in marketing."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Marketing."}</strong> {"Run social media for a college club or local shop for a month and report the results."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Content and writing."}</strong> {"Write three strong pieces on one topic and publish them."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Design."}</strong> {"Redesign a real app screen or website page and explain your choices."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Development."}</strong> {"Build and deploy a small working app with a live link."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Finance and analytics."}</strong> {"Analyse a public dataset or a company's annual report in Excel and summarise what you found."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Where first-timers actually get hired"}</div>
                <div className="sec-sub">{"Aim where the odds are best"}</div>
              </div>
            </div>
            <p>{"Famous companies receive thousands of applications for each internship and can choose students with prior internships. Your odds for a first internship are far better at startups, small and mid-size companies, NGOs, college research projects and local businesses. They need help, hire faster and care more about what you can do."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Your first internship is about getting a real line on your resume. The brand name can wait for your second or third."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Early-stage startups."}</strong> {"Reach out directly to founders with your proof attached."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Professors and college projects."}</strong> {"Research assistant roles count as experience and come with a reference."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"NGOs and social enterprises."}</strong> {"Often open to students and give real responsibility."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Local businesses."}</strong> {"Many have never had an intern and will create a role if you pitch a specific idea."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"A resume with nothing on it yet"}</div>
                <div className="sec-sub">{"How to fill one honest page"}</div>
              </div>
            </div>
            <p>{"Lead with a short line about the role you want. Then put your proof first, as a 'Projects' section with what you built, how and what happened. Add positions of responsibility in clubs or events, relevant coursework, competitions and skills you can actually demonstrate. Keep it to one page and cut anything that does not support the role."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" For a first internship, your Projects section is your experience section. Put it at the top."}</div>

            <div className="callout-red"><strong>{"Never pay for an internship:"}</strong>{" Programmes that charge a fee for an 'internship certificate' are courses or scams, and certificates from them can fail background checks later."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"The order that works"}</div>
                <div className="sec-sub">{"A four-week plan"}</div>
              </div>
            </div>
            <p>{"Weeks one and two: build one piece of proof and write a one-page resume around it. Week three: make a list of 30 startups, small companies and professors in your area of interest, and apply or reach out to ten of them with a short, specific message and your proof. Week four: follow up once, apply to ten more, and take the first reasonable offer. A short or part-time internship is fine. It breaks the loop."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" The first internship is the hardest because nobody has vouched for you yet. Proof of work and the right targets do the vouching for you."}</div>
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
              <div className="blist-item" key="Proof counts as experience">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Proof counts as experience"}.</strong> {"One finished project that looks like the job beats an empty resume."}</span>
              </div>
              <div className="blist-item" key="Aim where first-timers get hired">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Aim where first-timers get hired"}.</strong> {"Startups, small companies, professors and NGOs. Save famous brands for later."}</span>
              </div>
              <div className="blist-item" key="Lead your resume with projects">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Lead your resume with projects"}.</strong> {"For a first internship, projects are your experience section."}</span>
              </div>
              <div className="blist-item" key="Take the first real offer">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Take the first real offer"}.</strong> {"Even a short or part-time internship breaks the loop for every application after it."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Find internships that take first-timers"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-first-internship-report-how-to-get-one-with-no-experience-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
