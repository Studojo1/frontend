import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The High School Internship Report: How Teenagers Actually Get Real Experience | Studojo" },
    { name: "description", content: "High school internships in 2026: the four routes that work, age and legal rules in the US and India, pay-to-play traps, and how to land your first role." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "high school internships 2026, internships for high school students, how to get an internship in high school, summer research programs high school, high school internship India, NIH summer internship high school, internship at 16" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/high-school-internships-how-to-get-one-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The High School Internship Report: How Teenagers Actually Get Real Experience" },
    { property: "og:description", content: "Most high school internships are never posted. This report maps the four routes that work, the legal rules, the paid-program traps, and a simple plan to land one." },
    { property: "og:url", content: `${BASE_URL}/reports/high-school-internships-how-to-get-one-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-09-26T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The High School Internship Report: How Teenagers Actually Get Real Experience | Studojo" },
    { name: "twitter:description", content: "High school internships 2026: selective programs are a lottery, local cold emails are not. The four routes and a plan that works." },
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
  const MUTED  = "#737373";
  const INK    = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const hsRouteAccessChartEl = document.getElementById("hsRouteAccessChart") as HTMLCanvasElement | null;
  if (hsRouteAccessChartEl && !hsRouteAccessChartEl.dataset.rendered) {
    hsRouteAccessChartEl.dataset.rendered = "1";
    new Chart(hsRouteAccessChartEl, {
      type: "bar",
      data: {
        labels: ["Family network and local small businesses", "Self-built project or freelance work", "Local nonprofits and community organisations", "School or district career programs", "University lab via cold email", "Selective national research programs"],
        datasets: [{
          label: "How reachable each route is for a typical high school student (illustrative index, 0 to 10)",
          data: [8.8, 8.5, 8.0, 7.0, 5.0, 1.5],
          backgroundColor: ["#10b981", "#10b981", "#34d399", "#34d399", "#f59e0b", "#ef4444"],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 10.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const hsWhatCountsChartEl = document.getElementById("hsWhatCountsChart") as HTMLCanvasElement | null;
  if (hsWhatCountsChartEl && !hsWhatCountsChartEl.dataset.rendered) {
    hsWhatCountsChartEl.dataset.rendered = "1";
    new Chart(hsWhatCountsChartEl, {
      type: "bar",
      data: {
        labels: ["A concrete thing you built or contributed", "A mentor who can vouch for you by name", "Skills you can show (code, writing, data, design)", "Duration and consistency (weeks, not days)", "Brand name of the organisation", "Certificate from a paid program"],
        datasets: [{
          label: "What makes a high school internship valuable later (illustrative index, 0 to 10)",
          data: [9.3, 9.0, 8.6, 7.8, 5.0, 2.0],
          backgroundColor: ["#10b981", "#10b981", "#34d399", "#34d399", "#737373", "#ef4444"],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}/10` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 10.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #10b981; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #10b981; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #10b981; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #10b981; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #10b981; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #10b981; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #10b981; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #10b981; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_HighSchoolInternshipsHowToGetOne2026() {
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
        "headline": "The High School Internship Report: How Teenagers Actually Get Real Experience",
        "description": "High school internships in 2026: the four routes that work, age and legal rules in the US and India, pay-to-play traps, and how to land your first role.",
        "url": `${BASE_URL}/reports/high-school-internships-how-to-get-one-2026`,
        "datePublished": "2026-09-26T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/high-school-internships-how-to-get-one-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The High School Internship Report: How Teenagers Actually Get Real Experience", "item": `${BASE_URL}/reports/high-school-internships-how-to-get-one-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Internships · September 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The High School Internship Report: How Teenagers Actually Get Real Experience"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The High School Internship Report:<br /><em>How Teenagers Actually Get Real Experience</em>" }} />
            <p className="rpt-hero-sub">{"Most students assume internships start in college. In reality, thousands of high schoolers work in labs, small businesses, nonprofits, and startups every year. Almost none of those roles appear on a job board. This report explains where high school internships really come from, which rules apply to your age, which programs are worth it, and exactly how to ask for one."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"US and India · High school students aged 14 to 18 · STEM, business, and creative fields"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Early Career / Internships"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"September 2026"}</span>
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
              <div className="sc-num">{"~3%"}</div>
              <div className="sc-label">{"Acceptance rate at MIT's Research Science Institute: about 100 students from roughly 3,100 applicants each year"}</div>
              <div className="sc-source">{"Center for Excellence in Education, 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"14"}</div>
              <div className="sc-label">{"Minimum age for most non-hazardous work in both the US and India, with tighter rules on hours and job types until 18"}</div>
              <div className="sc-source">{"US Fair Labor Standards Act; India Child and Adolescent Labour Act"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"4 routes"}</div>
              <div className="sc-label">{"Where high school internships actually come from: selective programs, school pipelines, local employers, and self-built projects"}</div>
              <div className="sc-source">{"Studojo high school internship framework, 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Most high school internships are never posted"}</div>
                <div className="sec-sub">{"Why searching job boards finds almost nothing"}</div>
              </div>
            </div>
            <p>{"Search 'high school internship' and you mostly find the same famous programs and a lot of paid courses. That is not where most teenagers get experience. The majority of high school internships are informal: a local accountant who needs help with spreadsheets, a professor who lets a student clean data, a nonprofit that needs a social media volunteer, a startup founder who says yes to a well-written email."}</p>
            <p>{"These roles rarely have a title or a posting because the employer did not plan to hire anyone. They exist because a student asked. That is good news: it means the main barrier is not your grades or your school's reputation. It is whether you are willing to reach out."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" For high schoolers, internships are created, not found. The student who asks ten local people usually beats the student who applies to ten famous programs."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"The title does not matter."}</strong> {"'Research assistant', 'volunteer', or 'summer help' all count if you did real work and can explain it."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Small beats famous."}</strong> {"At a 10-person business you will get real tasks. At a large company, high school roles are rare and often mostly observation."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The four routes that actually work"}</div>
                <div className="sec-sub">{"From selective national programs to your own neighbourhood"}</div>
              </div>
            </div>
            <p>{"Selective programs are the most visible route and the hardest. MIT's Research Science Institute admits about 100 students from roughly 3,100 applicants. NIH has folded its separate high school program into its main Summer Internship Program, and 17-year-old applicants must live within 40 miles of an NIH campus. Programs like these are worth applying to, but treat them as a bonus, not a plan."}</p>
            <p>{"School and district career programs are more reachable. Many US school districts and some Indian schools run career pathway or work-based learning programs with local employers. Ask your counsellor directly, because these are often under-advertised."}</p>
            <p>{"Local employers, nonprofits, and university labs are the biggest route. A short, specific email to a small business owner or a professor at a nearby college is the single highest-return action most students never take. Finally, self-built projects count: an app you shipped, a newsletter you run, or freelance design work for real clients is experience you control completely."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Run all four routes in parallel. Apply to one or two selective programs, ask your school, and send cold emails locally. Keep a personal project going regardless."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"How reachable each route is for a typical high school student (illustrative index, 0 to 10)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="hsRouteAccessChart" />
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Age and legal rules you need to know"}</div>
                <div className="sec-sub">{"What you can and cannot do at 14, 16, and 18"}</div>
              </div>
            </div>
            <p>{"In the US, federal law generally allows 14 and 15 year olds to work in non-hazardous jobs with limits on hours during the school year. From 16, most of those hour limits lift, but hazardous work stays off-limits until 18. States add their own rules, and many require work permits for minors. Unpaid internships at for-profit companies must primarily benefit the intern, not the employer. Volunteering for a nonprofit is treated differently."}</p>
            <p>{"In India, the Child and Adolescent Labour Act prohibits employing children under 14, apart from narrow exceptions such as helping in a family enterprise outside school hours. Adolescents aged 14 to 18 can work, but not in hazardous occupations or processes. Most office, research, and digital internships fall comfortably within the rules, but you should still have a parent or guardian involved in any arrangement."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Office, lab, digital, and nonprofit work is usually fine for 14 to 18 year olds. Factories, construction, and heavy machinery are not."}</div>

            <div className="callout-amber"><strong>{"Before you start any role:"}</strong>{" Tell a parent or guardian, confirm your hours fit around school, check whether your state or school needs a work permit, and get the basic arrangement (dates, hours, pay or unpaid, supervisor) in writing, even if it is just an email."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"The pay-to-play trap"}</div>
                <div className="sec-sub">{"When the 'internship' is actually a product you are buying"}</div>
              </div>
            </div>
            <p>{"A fast-growing industry sells 'research programs', 'virtual internships', and 'certificates' to high schoolers and their parents, sometimes for thousands of dollars or lakhs of rupees. Some of these offer genuine mentoring. Many offer a pre-packaged project, a certificate, and little real responsibility."}</p>
            <p>{"Admissions officers and future employers increasingly recognise these programs. A paid certificate does not hurt you, but it rarely helps as much as the marketing suggests. A free, selective program or a real unpaid role at a local organisation almost always carries more weight."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Real internships do not charge you. If you are paying, you are a customer, and you should judge it like any other purchase."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Free selective programs are different."}</strong> {"Programs like RSI are fully funded. Competitive and free is a very different signal from open and expensive."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Ask one question."}</strong> {"'What will I produce, and who will review it?' If the answer is vague, the experience probably will be too."}</span>
              </div>
            </div>

            <div className="callout-red"><strong>{"Red flags:"}</strong>{" An application fee for an 'internship'. A guaranteed placement or guaranteed publication. A certificate as the main outcome. No named supervisor. Pressure to pay before you know what work you will do."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"How to actually get one: the cold email method"}</div>
                <div className="sec-sub">{"A simple, repeatable way to create your own internship"}</div>
              </div>
            </div>
            <p>{"Make a list of 20 people near you who do work you find interesting: small business owners, professors at local colleges, nonprofit leaders, startup founders, doctors, architects. Find their email on their website or LinkedIn. Write each one a short, specific message."}</p>
            <p>{"A good message is under 120 words. Say who you are and your grade, what you noticed about their work, one specific thing you can help with, and the time you have available. Attach nothing large. Offer to start small, for example a two-week trial or one defined task. Follow up once after a week if you hear nothing."}</p>

            <div className="rpt-cta-mid">
              <div className="rpt-cta-mid-inner">
                <h4>{"Find the people worth emailing"}</h4>
                <p>{"Studojo helps students discover internships and reach the right people with short, specific messages, even before a role is posted."}</p>
                <Link to="/dojos/internships" className="rpt-cta-mid-btn">{"Browse Internships →"}</Link>
              </div>
            </div>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Expect most people not to reply. Getting one or two yeses from twenty emails is a strong result, and one yes is all you need."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Build a one-page resume first."}</strong> {"Include school projects, clubs, competitions, any part-time work, and skills like Excel, Python, Canva, or writing."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Start with warm contacts."}</strong> {"Parents' friends, teachers, and alumni of your school reply far more often than strangers. Ask them for one introduction each."}</span>
              </div>
            </div>

            <div className="callout-green"><strong>{"Template:"}</strong>{" \"Hi Dr. Rao, I am a Grade 11 student at [school] interested in environmental science. I read your study on groundwater in [city] and would love to help with data entry or literature review this summer. I am free 15 hours a week from June to August. Would you be open to a short call?\""}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"What a high school internship is really worth"}</div>
                <div className="sec-sub">{"College applications, first college internships, and clarity"}</div>
              </div>
            </div>
            <p>{"A high school internship will not guarantee a college admission or a job. What it does is give you three things most classmates do not have: a concrete story about work you did, an adult who can vouch for you by name, and a much clearer sense of what you do or do not want to study."}</p>
            <p>{"That last one is underrated. Discovering in Grade 11 that you dislike lab work, or love client-facing work, can save years. And when you apply for your first college internship, a real high school role puts you ahead of peers whose resumes start at zero."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Depth beats prestige. A few months of real work with a mentor who knows you is worth more than a famous name or a paid certificate."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"What makes a high school internship valuable later (illustrative index, 0 to 10)"}</div>
              <div style={{ height: 280 }}>
                <canvas id="hsWhatCountsChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Write down what you did every week."}</strong> {"You will forget the details. Notes make college essays and future interviews much easier."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Ask for a recommendation before you leave."}</strong> {"Supervisors write better letters while your work is fresh in their mind."}</span>
              </div>
            </div>
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
              <div className="blist-item" key="Stop searching, start asking">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Stop searching, start asking"}.</strong> {"Most high school internships are created through direct outreach. Email 20 local people with a short, specific offer of help."}</span>
              </div>
              <div className="blist-item" key="Run all four routes at once">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Run all four routes at once"}.</strong> {"Apply to one or two selective programs, ask your school counsellor, contact local employers, and keep a personal project going."}</span>
              </div>
              <div className="blist-item" key="Know the rules for your age">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Know the rules for your age"}.</strong> {"Office, lab, and digital work is usually fine from 14. Avoid hazardous work, involve a parent, and check permit requirements."}</span>
              </div>
              <div className="blist-item" key="Do not pay for an internship">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Do not pay for an internship"}.</strong> {"Paid programs are products, not jobs. Judge them on who mentors you and what you produce, not on the certificate."}</span>
              </div>
              <div className="blist-item" key="Aim for depth and a mentor">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Aim for depth and a mentor"}.</strong> {"A few months of real work and one adult who can vouch for you matter more than a famous brand name."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Your first internship starts with one message."}</h3>
              <p>{"Studojo helps students find internships and reach the people who can say yes, from your first role onwards."}</p>
            </div>
            <Link to="/dojos/internships" className="rpt-cta-btn">
              {"Browse Internships →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
