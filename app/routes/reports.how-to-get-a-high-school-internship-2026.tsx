import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "How to Get a High School Internship | Studojo" },
    { name: "description", content: "The famous programmes take a few hundred students a year and close months early. This is the other route, and it works in any country: the email that gets a local organisation to say yes." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "how to get an internship in high school, internships for high school students, high school internship email template, internship for class 11 12 students india, internships for 16 year olds, research placement sixth form student" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/how-to-get-a-high-school-internship-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "How to Get a High School Internship" },
    { property: "og:description", content: "Most high school internships were never advertised. Someone asked a local organisation and they said yes. Here is exactly what to send, wherever you live." },
    { property: "og:url", content: `${BASE_URL}/reports/how-to-get-a-high-school-internship-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-09-27T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "How to Get a High School Internship | Studojo" },
    { name: "twitter:description", content: "The famous programmes close in winter and take a few hundred students. The other route has no deadline and works anywhere. Here is the email." },
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

  const replyChartEl = document.getElementById("replyChart") as HTMLCanvasElement | null;
  if (replyChartEl && !replyChartEl.dataset.rendered) {
    replyChartEl.dataset.rendered = "1";
    new Chart(replyChartEl, {
      type: "bar",
      data: {
        labels: ["Generic template, sent to everyone", "Light research in the opening line", "Genuinely specific to that person"],
        datasets: [{
          label: "Reply rate by how personal the email is, percent",
          data: [1.0, 6.0, 17.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% reply` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 20.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }

  const deadlineChartEl = document.getElementById("deadlineChart") as HTMLCanvasElement | null;
  if (deadlineChartEl && !deadlineChartEl.dataset.rendered) {
    deadlineChartEl.dataset.rendered = "1";
    new Chart(deadlineChartEl, {
      type: "bar",
      data: {
        labels: ["Bank of America Student Leaders, US, mid-January", "NIH high school programme, US, early February", "NASA OSTEM summer, US, late February", "When most students start looking, May"],
        datasets: [{
          label: "How far ahead of the summer applications close, in months",
          data: [4.5, 4.0, 3.1, 1.0],
          backgroundColor: ["#10b981", "#10b981", "#10b981", "#ef4444"],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} months before summer` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 6.0,
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
  .tmpl { background: #faf9f6; border: 2px solid #171717; border-radius: 14px; padding: 22px 24px; margin: 22px 0; box-shadow: 3px 3px 0 #171717; overflow-x: auto; }
  .tmpl-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #737373; margin-bottom: 14px; }
  .tmpl-line { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.8; color: #171717; white-space: pre-wrap; word-break: break-word; }
  .tmpl-blank { height: 12px; }
  .tmpl-var { color: #8B5CF6; font-weight: 700; }
  @media (max-width: 640px) { .tmpl { padding: 18px 16px; } .tmpl-line { font-size: 12px; } }
  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_HowToGetAHighSchoolInternship2026() {
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
        "headline": "How to Get a High School Internship",
        "description": "The famous programmes take a few hundred students a year and close months early. This is the other route, and it works in any country: the email that gets a local organisation to say yes.",
        "url": `${BASE_URL}/reports/how-to-get-a-high-school-internship-2026`,
        "datePublished": "2026-09-27T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/how-to-get-a-high-school-internship-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "How to Get a High School Internship", "item": `${BASE_URL}/reports/how-to-get-a-high-school-internship-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · September 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>How to Get a High School Internship</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "How to Get a High School Internship:<br /><em>The Email That Works</em>" }} />
            <p className="rpt-hero-sub">You have probably found the list for wherever you live. Apply to those. But between them they take a few hundred students out of millions, they close months before they run, and in some countries they barely exist. This report is about the route that has no deadline, no eligibility gate and no waiting list, because it is the one you create yourself.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students aged 14 to 18 · Programme routes covered for the US, India, UK and Singapore</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Internships / High School</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">September 2026</span>
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
              <div className="sc-num">5.8%</div>
              <div className="sc-label">reply rate when fewer than 50 people are emailed, against 2.1 percent for large blasts. Sending less works better</div>
              <div className="sc-source">Cold email benchmark data, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">+66%</div>
              <div className="sc-label">lift in replies from a single follow-up. Most students send one email and stop</div>
              <div className="sc-source">Cold email sequence benchmarks, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">17 to 18%</div>
              <div className="sc-label">reply rate for genuinely personalised emails, against 7 to 9 percent without. Generic templates sit near 1 percent</div>
              <div className="sc-source">Sopro and Instantly personalisation benchmarks, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#f59e0b" }}>1</div>
              <div>
                <div className="sec-title">Find your country's programmes, apply, then stop calling it a plan</div>
                <div className="sec-sub">Two minutes on the list, including the ones you are wrongly told to apply to</div>
              </div>
            </div>
            <p>In the United States, Bank of America Student Leaders places juniors and seniors in paid summer roles and closes in mid-January. The NIH high school programme pays a stipend of $2,300 to $2,530 and closes in early February. NASA's OSTEM internships pay stipends, with the summer 2027 round closing on 26 February 2027.</p>
            <p>Elsewhere the same shape holds with different names. In the UK, Nuffield Research Placements are fully funded placements of four to six weeks, and In2STEM runs free for 16 and 17 year olds with travel and lunch covered. In India, RSI India runs cost-free at IISc Bengaluru, and the INSPIRE internship camp is free but nomination-based for students in the top one percent of their Class 10 boards. In Singapore, the A*STAR Science Awards attach secondary and junior college students to research institutes.</p>
            <p>One correction worth having, because Indian students are pointed at these constantly: NIUS, and the IISc and IISER summer internships, are undergraduate programmes. If you are in Class 11 or 12 you are not eligible, however strong your marks are, and no amount of applying will change that.</p>

            <div className="chart-wrap">
              <div className="chart-label">How far ahead of the summer applications close, in months</div>
              <div style={{ height: 250 }}>
                <canvas id="deadlineChart" />
              </div>
            </div>

            <div className="highlight">Whatever your country, the pattern is identical: applications close months before the programme runs, and most students start looking once the summer has already begun.</div>

            <div className="callout-amber">Put your two or three local deadlines in your phone today with a two-week warning. Then read the rest of this, because between them these programmes take a few hundred students out of millions.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>2</div>
              <div>
                <div className="sec-title">Most high school internships are created, not advertised</div>
                <div className="sec-sub">Nobody posts a role for a sixteen year old. They say yes to one.</div>
              </div>
            </div>
            <p>A dental practice, a small law office, a university lab, a local newspaper, an architecture studio, a food bank, a neighbourhood clinic, an auto workshop, a bakery, a small accounting firm. None of these run an internship programme. None will ever post a listing. Most would say yes to a specific, polite, organised student who asked to come in for a few weeks and help with something real.</p>
            <p>This is not a workaround. It is how the majority of these placements have always happened, and in some markets it is close to the only route. In India the formal infrastructure for school-age research placements barely exists, which makes local small and micro enterprises near your school the realistic path rather than the consolation prize.</p>
            <p>Singapore's A*STAR, which does run formal programmes, tells students plainly that they can write directly to a research institute with their CV, their results and the period they want. A national research agency is telling you the direct ask is a legitimate door. It is the same door everywhere, just usually unmarked.</p>

            <div className="highlight">The reframe: you are not applying for a role that exists and competing with three hundred people. You are proposing one that does not, which is why there is no queue.</div>

            <div className="pull-quote">
              <p>&quot;Students interested in a research attachment can write directly to the respective research institutes, indicating their preferred area of research and period of attachment.&quot;</p>
              <span className="pq-source">A*STAR, Singapore, on how to get a placement</span>
            </div>

            <div className="callout">Make a list of fifteen local organisations doing something you are genuinely curious about. Fifteen, not a hundred. The next section explains why the small number is the point.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>3</div>
              <div>
                <div className="sec-title">The email</div>
                <div className="sec-sub">Copy it, make every bracket specific to you, send it to one real person</div>
              </div>
            </div>
            <p>Every line here is doing a job. It states your age and year immediately so nobody is surprised later. It proves you looked them up. It asks for something small and specific instead of a vague opportunity. And it removes, before they can raise them, the three reasons an adult hesitates over a student.</p>
            <p>Send it to a named human, never to an info address or a contact form. At a small business that is usually the owner. At a lab it is the professor or the lab manager. At a clinic it is the practice manager. Their name is almost always on the website or in something they have published.</p>

            <div className="tmpl">
              <div className="tmpl-label">Copy this, then make every bracket specific</div>
              <div className="tmpl-line">Subject: <span className="tmpl-var">[Year 12 student]</span> interested in your <span className="tmpl-var">[lakeshore restoration work]</span></div>
              <div className="tmpl-line tmpl-blank" />
              <div className="tmpl-line">Hi <span className="tmpl-var">[Dr Alvarez]</span>,</div>
              <div className="tmpl-line tmpl-blank" />
              <div className="tmpl-line">I am <span className="tmpl-var">[Maya]</span>, <span className="tmpl-var">[16]</span>, in <span className="tmpl-var">[Year 12]</span> at <span className="tmpl-var">[Riverside Secondary]</span> here in <span className="tmpl-var">[Nagpur]</span>.</div>
              <div className="tmpl-line tmpl-blank" />
              <div className="tmpl-line">I read your <span className="tmpl-var">[piece in the local paper about replanting the lakeshore]</span>. <span className="tmpl-var">[I did not know that native reeds hold a bank better than planted grass, and I have been reading about it since.]</span></div>
              <div className="tmpl-line tmpl-blank" />
              <div className="tmpl-line">I would like to spend part of <span className="tmpl-var">[this summer]</span> learning how this work actually gets done, from people doing it rather than from a course. Would you be open to me helping with <span className="tmpl-var">[data entry, site prep, or whatever is genuinely useful]</span> for <span className="tmpl-var">[a few weeks in July]</span>?</div>
              <div className="tmpl-line tmpl-blank" />
              <div className="tmpl-line">To make this easy for you:</div>
              <div className="tmpl-line">   I am not asking to be paid.</div>
              <div className="tmpl-line">   I can bring any permission or paperwork your side needs before I start.</div>
              <div className="tmpl-line">   If a few weeks is too much, I would happily start with a single day of shadowing instead.</div>
              <div className="tmpl-line tmpl-blank" />
              <div className="tmpl-line">Either way, thank you for <span className="tmpl-var">[the lakeshore work]</span>. It is the reason I started paying attention to this.</div>
              <div className="tmpl-line tmpl-blank" />
              <div className="tmpl-line"><span className="tmpl-var">[Maya Chen]</span></div>
              <div className="tmpl-line"><span className="tmpl-var">[maya.chen@email.com]</span> · <span className="tmpl-var">[+91 00000 00000]</span></div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>The subject names you and them.</strong> Around 47 percent of professionals say the subject alone decides whether they open an unsolicited email, and one specific accurate detail lifts opens two to three times. Four to seven words. Use whatever your system calls your year: Class 11, Year 12, junior, JC1.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Age and school go in line one.</strong> Burying it feels safer and is not. They will find out, and finding out late is the thing that makes an adult uncomfortable.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>The second paragraph must be impossible to copy and paste.</strong> One real detail about their actual work, one honest sentence about why it caught you. This single line is most of the difference between a 17 percent reply rate and a 1 percent one.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Ask for something small and specific.</strong> Any opportunity asks them to do your thinking. A few weeks in July helping with a named task is a yes or no question.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>The three-line block answers their objections in advance.</strong> Pay, paperwork and the size of the commitment. Offering one day of shadowing as a fallback is what converts most of the maybes.</span>
              </div>
            </div>

            <div className="callout-green">Send fifteen of these, not two hundred. Campaigns under fifty recipients reply at 5.8 percent against 2.1 percent for large blasts, because nobody can write a real second paragraph two hundred times.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">The rules differ by country. Who says yes easily does not.</div>
                <div className="sec-sub">What the law where you live actually permits at 16</div>
              </div>
            </div>
            <p>Earlier this report warned you about programmes that charge families thousands. Now it suggests offering to work unpaid. These are not the same thing: in one you pay someone for access, in the other nobody pays anybody.</p>
            <p>The legal detail decides who can say yes without checking with anyone. In the United States, hours stop being federally capped at 16 but hazardous occupations stay closed until 18, most states require a work permit under 18, and unpaid work at a for-profit has to be genuinely educational rather than replacing a paid employee. In India, the Child and Adolescent Labour Act permits 14 to 18 year olds to work in non-hazardous occupations, with hazardous ones prohibited outright and real penalties attached. In the UK, under-16s typically need a local authority work permit and face term-time hour limits.</p>
            <p>Across all of them the same organisations say yes fastest: nonprofits, charities, public institutions, schools, hospitals in a shadowing capacity, and university labs. They can accept a student without the employment questions a private company has to think about. Hazardous work is closed to you almost everywhere until you are 18, so do not ask a construction site or a machine shop for floor time in any country.</p>

            <div className="highlight">For the fastest yes anywhere: start with nonprofits, public institutions and university labs. The paperwork question that stalls a private company barely arises.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Find out what your school needs to sign.</strong> Permission letters, a permit, or a parental consent form. Having it ready before you email removes a reason to stall.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Do not ask for hazardous work.</strong> Machinery, construction and similar are closed to under-18s in the US, India and the UK alike. It is the one no that is genuinely final.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Say the paperwork sentence out loud in the email.</strong> I can bring any permission your side needs before I start is worth more than another paragraph about yourself.</span>
              </div>
            </div>

            <div className="callout">If you are in India, note that the practical route for most Class 11 and 12 students is a small local enterprise or a clinic, not a national research programme. That is not settling. It is where the yes actually lives.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#10b981" }}>5</div>
              <div>
                <div className="sec-title">What to do with silence, and with no</div>
                <div className="sec-sub">The follow-up is where most students quit and most yeses live</div>
              </div>
            </div>
            <p>A single follow-up lifts reply rates by about 66 percent. Almost no student sends one, because silence feels like rejection and following up feels like pestering. It is neither. Busy people open an email, intend to reply, and forget within the hour.</p>
            <p>Wait a week, then reply to your own original email so the thread stays together. Three sentences: you are following up, the specific ask again, and no problem at all if it is not possible. Then stop. One follow-up, not four.</p>
            <p>A no is worth answering too. Reply once, briefly, and make a smaller ask: could you spare twenty minutes to tell me how you got into this. A surprising number of those conversations end with the person offering something anyway, or naming someone who will. That is how one email becomes three.</p>

            <div className="chart-wrap">
              <div className="chart-label">Reply rate by how personal the email is, percent</div>
              <div style={{ height: 250 }}>
                <canvas id="replyChart" />
              </div>
            </div>

            <div className="highlight">Expect most to say nothing. Fifteen careful emails with one follow-up each is a realistic path to one or two yeses, and one is all you need.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Follow up once, after seven days.</strong> Reply on the same thread so the original sits right there. Three sentences, no new arguments.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Turn a no into a twenty minute conversation.</strong> Almost nobody refuses that, and it often produces either an offer or a referral to someone who will.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Keep a simple list.</strong> Who you emailed, the date, whether you followed up. Without it you lose track by week two and start repeating yourself.</span>
              </div>
            </div>

            <div className="callout-green">If you get a yes, reply the same day with the three things they need: your permission or permit status, the exact dates you can come in, and a contact number for a parent or guardian. Being organised in the first reply is what stops a yes quietly evaporating.</div>
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
              <div className="blist-item" key="Apply to your country's programmes, then move on">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Apply to your country's programmes, then move on.</strong> US, UK, India and Singapore all have them, they all close months early, and they all take a few hundred students. Diarise the deadlines and treat them as a lottery ticket.</span>
              </div>
              <div className="blist-item" key="Email fifteen local organisations, not two hundred">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Email fifteen local organisations, not two hundred.</strong> Small personal batches reply at 5.8 percent against 2.1 percent for blasts. The second paragraph has to be impossible to copy and paste.</span>
              </div>
              <div className="blist-item" key="Start where the law makes yes easy">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Start where the law makes yes easy.</strong> Nonprofits, public institutions and university labs can accept a student almost anywhere. Hazardous work is closed under 18 in every market covered here.</span>
              </div>
              <div className="blist-item" key="Follow up once, and answer every no">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Follow up once, and answer every no.</strong> One follow-up lifts replies by roughly 66 percent. A no deserves one reply asking for twenty minutes, which often produces a referral.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Send the fifteen emails.</h3>
              <p>Studojo finds the right person at each organisation and helps you write the line that makes them reply, instead of guessing at info addresses.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Start Reaching Out →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
