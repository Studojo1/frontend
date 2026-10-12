import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Gap Year Report: How Recruiters Really View Career Breaks and Drop Years | Studojo" },
    { name: "description", content: "About 10 lakh people sat UPSC prelims for 979 posts. 77% of Indian women say a career break set them back. How recruiters read gaps and how to explain yours." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "gap year after graduation india, how to explain career gap in interview, upsc preparation gap private job, cat drop year, career break recruiters india, education gap it companies" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/gap-year-report-how-recruiters-view-career-breaks-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Gap Year Report: How Recruiters Really View Career Breaks and Drop Years" },
    { property: "og:description", content: "Around 99.9% of UPSC aspirants will not be selected in a given year. Most will one day sit across from a recruiter and explain the gap. Here is what works." },
    { property: "og:url", content: `${BASE_URL}/reports/gap-year-report-how-recruiters-view-career-breaks-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-15T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Gap Year Report: How Recruiters Really View Career Breaks and Drop Years | Studojo" },
    { name: "twitter:description", content: "About 10 lakh UPSC aspirants. 979 posts. More than 99% will need to explain the gap one day. How recruiters actually read drop years, and the answer that works." },
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
  const VIOLET = "#8B5CF6";
  const ORANGE = "#f59e0b";
  const RED    = "#ef4444";
  const GREEN  = "#10b981";
  const MUTED  = "#737373";
  const INK    = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  const breakStigmaChartEl = document.getElementById("breakStigmaChart") as HTMLCanvasElement | null;
  if (breakStigmaChartEl && !breakStigmaChartEl.dataset.rendered) {
    breakStigmaChartEl.dataset.rendered = "1";
    new Chart(breakStigmaChartEl, {
      type: "bar",
      data: {
        labels: ["Say a break set their career back", "Want better ways to present a break", "Found the break hard to explain to recruiters", "Left the break off their CV", "Lied about the break in interviews"],
        datasets: [{
          label: "Indian working women on career breaks (LinkedIn, 2022)",
          data: [77.0, 80.0, 50.0, 42.0, 35.0],
          backgroundColor: ["#ef4444", "#8B5CF6", "#f59e0b", "#737373", "#737373"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 100.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
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

export default function Report_GapYearReportHowRecruitersViewCareerBreaks2026() {
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
        "headline": "The Gap Year Report: How Recruiters Really View Career Breaks and Drop Years",
        "description": "About 10 lakh people sat UPSC prelims for 979 posts. 77% of Indian women say a career break set them back. How recruiters read gaps and how to explain yours.",
        "url": `${BASE_URL}/reports/gap-year-report-how-recruiters-view-career-breaks-2026`,
        "datePublished": "2026-10-15T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/gap-year-report-how-recruiters-view-career-breaks-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Gap Year Report: How Recruiters Really View Career Breaks and Drop Years", "item": `${BASE_URL}/reports/gap-year-report-how-recruiters-view-career-breaks-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · October 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"The Gap Year Report: How Recruiters Really View Career Breaks and Drop Years"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Gap Year Report:<br /><em>99.9% of UPSC Aspirants Will Need to Explain the Gap</em>" }} />
            <p className="rpt-hero-sub">{"Gap years are not rare in India. They are built into the exam system. Around 10 lakh people sat UPSC prelims in 2025 for 979 posts, and almost 3 lakh registered for CAT. Most will eventually explain the time to a recruiter. We looked at how recruiters actually read gaps, which gaps cost the most, and how to turn a drop year into a credible story."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Graduates and early-career candidates"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Behavioural / Insight"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"October 2026"}</span>
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
              <div className="sc-num">{"~1,000:1"}</div>
              <div className="sc-label">{"UPSC Civil Services 2025: around 10 lakh prelims candidates for 979 vacancies"}</div>
              <div className="sc-source">{"UPSC CSE 2025 notification and prelims coverage"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"77%"}</div>
              <div className="sc-label">{"Indian working women who took a career break and say it set them back because of recruiter stigma"}</div>
              <div className="sc-source">{"LinkedIn India survey, 2022"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"42%"}</div>
              <div className="sc-label">{"Of those women who left the break off their CV entirely. 35% said they lied about it in interviews"}</div>
              <div className="sc-source">{"LinkedIn India survey, 2022"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"Gaps are a feature of India's exam system"}</div>
                <div className="sec-sub">{"The maths that makes drop years inevitable"}</div>
              </div>
            </div>
            <p>{"Around 10 lakh candidates sat UPSC Civil Services prelims in 2025 for 979 vacancies. That is roughly 1,000 people per post. CAT 2025 drew about 2.95 lakh registrations. Railway exams are bigger still: RRB NTPC 2025 received over 1.2 crore applications. Many candidates spend one to four years preparing, often full time, and the large majority are not selected in any given year."}</p>
            <p>{"That means there are millions of capable young Indians with a one to four year gap on their resume. The gap is not a sign that something went wrong. It is the expected result of a high-stakes, low-odds system. The problem is that many private recruiters still read it the way they would read an unexplained gap from a much smaller pool."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A drop year is common. An unexplained drop year is what hurts. Recruiters penalise silence and vagueness far more than the gap itself."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The stigma is real, and hiding it backfires"}</div>
                <div className="sec-sub">{"What the career break data shows"}</div>
              </div>
            </div>
            <p>{"LinkedIn's 2022 India survey of working women is the clearest data on gap stigma in the Indian market. 77% of women who took a career break said it set them back, and half found it hard to explain to recruiters. In response, 42% left the break off their CV and 35% said they had lied about it in interviews."}</p>
            <p>{"Hiding a gap rarely works. Background verification checks employment dates, and a resume with fudged dates fails it. Interviewers notice when graduation was four years ago and the first job started last month. The 80% of women who said they wanted better ways to present a break point to the real need: a framing that recruiters accept. LinkedIn added a dedicated Career Break option to profiles in 2022 for this reason."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Indian working women on career breaks (LinkedIn, 2022)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="breakStigmaChart" />
              </div>
            </div>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Concealing a gap turns a neutral fact into a trust problem. Stating it plainly, with what you did, turns it into context."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"How recruiters actually read a gap"}</div>
                <div className="sec-sub">{"The three questions behind every 'what were you doing?'"}</div>
              </div>
            </div>
            <p>{"When a recruiter asks about a gap, they are rarely judging the choice you made. They are trying to answer three questions. Did you stay sharp, or will you need retraining? Are you really committed to this role, or will you leave for the next exam? And is there something you are hiding?"}</p>
            <p>{"A good answer handles all three in under a minute: what you were doing, what you built or learned, and why you are now fully committed to this path. A weak answer handles none of them: 'I was preparing for exams' followed by silence. The gap is the same. The interviewer's conclusion is completely different."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The second question, commitment, is the hidden one. Aspirants who still sound half-in on the exam are the ones recruiters drop."}</div>

            <div className="callout-amber"><strong>{"Watch eligibility rules:"}</strong>{" Some mass recruiters publish limits on academic or post-graduation gaps for fresher drives, and these vary by company and year. Check each drive's eligibility criteria before you apply, rather than assuming."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Not all gaps cost the same"}</div>
                <div className="sec-sub">{"How common gap types tend to land with private recruiters"}</div>
              </div>
            </div>
            <p>{"Different gaps send different signals. Recruiters read them less by how long they lasted and more by what they suggest about discipline, skills and commitment."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A gap with visible output is read as a different kind of experience. A gap with no output is read as lost time, even when it was not."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"UPSC or state PSC preparation."}</strong> {"Usually respected for discipline and general awareness, especially for policy, consulting, research and public-sector-facing roles. The risk is a perceived lack of commitment. Address it directly."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"CAT or GATE drop year."}</strong> {"Widely understood and short. Mention your score if it was strong, even if you did not convert."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Health or family responsibility."}</strong> {"Legitimate and protected. You owe no detail beyond 'a family health matter that is now resolved.'"}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"A failed startup or freelance work."}</strong> {"Often a plus if you can show what you built, sold or learned. Treat it as a job on your resume."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Unstructured time off."}</strong> {"The hardest to explain if nothing came out of it. Lead with any course, project or work you did, however small."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"The 45-second gap answer"}</div>
                <div className="sec-sub">{"A structure that works for most drop years"}</div>
              </div>
            </div>
            <p>{"Use three sentences. What: 'From 2023 to 2025 I prepared full time for the Civil Services exam and cleared prelims once.' Gain: 'It built a disciplined daily routine, strong writing and a wide grasp of economics and policy, which I have used in a data analysis project on state budgets.' Commitment: 'I have closed that chapter and chosen this field because...' Then stop talking."}</p>
            <p>{"On your resume, give the gap a line of its own with dates, a plain title and one or two outcomes, the same way you would list a job. 'Full-time Civil Services preparation, 2023 to 2025. Cleared prelims 2024. Wrote 200+ practice essays.' A labelled gap is a fact. An empty gap is a question."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Name the gap, show what came out of it, close it. The closing sentence about commitment matters most."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"If you are still in the gap: set an exit rule now"}</div>
                <div className="sec-sub">{"The decision that protects your options"}</div>
              </div>
            </div>
            <p>{"The cost of a gap rises with its length and with how little you can show for it. If you are preparing now, decide in advance how many attempts, or which score, will make you switch. Then build something employable alongside your preparation: a part-time internship, a certification tied to a job, a writing portfolio, a small data project. Even five hours a week compounds."}</p>
            <p>{"Aspirants who leave with nothing but a rank they did not reach have the hardest re-entry. Aspirants who leave with a parallel skill and a clear story often find that the preparation years made them stronger candidates than peers who went straight to work."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Recruiters do not reject gaps. They reject gaps they cannot understand. Your job is to make yours easy to understand."}</div>

            <div className="callout-green"><strong>{"Exit rule example:"}</strong>{" 'Two full attempts. If I do not clear Mains by the second, I move to private roles in policy research, with my portfolio ready.' Write it down before the first attempt."}</div>
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
              <div className="blist-item" key="Never hide the gap">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Never hide the gap"}.</strong> {"Background checks and simple date maths expose it. List it with dates, a title and outcomes, like a job."}</span>
              </div>
              <div className="blist-item" key="Answer the commitment question before it is asked">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Answer the commitment question before it is asked"}.</strong> {"Recruiters worry you will leave for the next attempt. Say clearly that the chapter is closed and why you chose this path."}</span>
              </div>
              <div className="blist-item" key="Build parallel proof during the gap">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Build parallel proof during the gap"}.</strong> {"A part-time internship, project or certification turns lost time into experience."}</span>
              </div>
              <div className="blist-item" key="Set an exit rule before your first attempt">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Set an exit rule before your first attempt"}.</strong> {"Decide the number of attempts or the score that triggers your switch, and keep your fallback ready."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Turn your gap into experience"}</h3>
              <p>{"Part-time and remote internships on Studojo let you build proof while you prepare, or restart quickly when you are ready."}</p>
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
