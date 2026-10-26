import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams Targeting Students | Studojo" },
    { name: "description", content: "Indians lost 22,845 crore to cyber fraud in 2024, and fake jobs are a top hook. How task scams and pay-to-join internships work, and how to verify any offer." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "job scams india students, fake internship offer, task scam whatsapp telegram, how to verify job offer, part time job scam india, report cyber fraud 1930" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/job-scam-report-fake-internships-task-scams-students-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams Targeting Students" },
    { property: "og:description", content: "Indians lost about 62 crore a day to cyber fraud in 2024. Fake job and internship offers are one of the main hooks. How the scams work and a 7-point check for any offer." },
    { property: "og:url", content: `${BASE_URL}/reports/job-scam-report-fake-internships-task-scams-students-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-18T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams Targeting Students | Studojo" },
    { name: "twitter:description", content: "Indians lost 62 crore a day to cyber fraud in 2024. Task scams pay you 150 for liking videos, then take 1.5 lakh. How they work, and how to check any offer in 5 minutes." },
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

  const taskScamChartEl = document.getElementById("taskScamChart") as HTMLCanvasElement | null;
  if (taskScamChartEl && !taskScamChartEl.dataset.rendered) {
    taskScamChartEl.dataset.rendered = "1";
    new Chart(taskScamChartEl, {
      type: "bar",
      data: {
        labels: ["2020", "2023 (full year)", "2024 (first half only)"],
        datasets: [{
          label: "Task scam reports to the US FTC: from near zero to the fastest-growing job scam",
          data: [0.0, 5000.0, 20000.0],
          backgroundColor: ["#737373", "#f59e0b", "#ef4444"],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "x" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} reports` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4,4] }, min: 0.0, max: 22000.0,
               ticks: { font: { size: 11 }, color: MUTED } },
          y: { grid: { display: false }, ticks: { font: { size: 12 }, color: INK } },
        },
      },
    });
  }
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #ef4444; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #ef4444; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }
  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #ef4444; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
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
  .rpt-cta { background: #ef4444; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #ef4444; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }
  .rpt-cta-mid { margin: 20px 0; }
  .rpt-cta-mid-inner { background: #ef4444; border: 2px solid #171717; border-radius: 16px; padding: 22px 26px; box-shadow: 3px 3px 0 #171717; }
  .rpt-cta-mid-inner h4 { font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.2px; line-height: 1.25; }
  .rpt-cta-mid-inner p { font-size: 14px; color: rgba(255,255,255,0.78); font-weight: 500; margin: 0 0 14px 0; line-height: 1.55; }
  .rpt-cta-mid-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #ef4444; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; border: 2px solid #171717; box-shadow: 2px 2px 0 #171717; text-decoration: none; white-space: nowrap; }
`;

export default function Report_JobScamReportFakeInternshipsTaskScamsStudents2026() {
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
        "headline": "The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams Targeting Students",
        "description": "Indians lost 22,845 crore to cyber fraud in 2024, and fake jobs are a top hook. How task scams and pay-to-join internships work, and how to verify any offer.",
        "url": `${BASE_URL}/reports/job-scam-report-fake-internships-task-scams-students-2026`,
        "datePublished": "2026-10-18T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/job-scam-report-fake-internships-task-scams-students-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams Targeting Students", "item": `${BASE_URL}/reports/job-scam-report-fake-internships-task-scams-students-2026` },
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
              <span>{"The Job Scam Report: Fake Internships, Pay-to-Join Offers and Task Scams Targeting Students"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Job Scam Report:<br /><em>62 Crore a Day, and Your Job Search Is the Bait</em>" }} />
            <p className="rpt-hero-sub">{"Indians lost 22,845 crore to cyber fraud in 2024, around 62 crore every day. Fake job offers and part-time task schemes are among the main hooks, and students looking for their first income are a prime target. We break down exactly how the scams work, the patterns that give them away, and what to do in the first hour if you have been hit."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India and global · Students and first-time job seekers"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Warning / Data"}</span>
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
              <div className="sc-num">{"22,845 cr"}</div>
              <div className="sc-label">{"Lost by Indians to cyber fraud in 2024, all fraud types, up 206% on 2023"}</div>
              <div className="sc-source">{"Ministry of Home Affairs / I4C, reported July 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"36.4 lakh"}</div>
              <div className="sc-label">{"Cyber fraud complaints filed in India in 2024, up from 24.4 lakh in 2023"}</div>
              <div className="sc-source">{"NCRP and CFCFRMS data, Ministry of Home Affairs, 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"$501M"}</div>
              <div className="sc-label">{"Reported US job scam losses in 2024, up from $90M in 2020. The same scam playbooks run in India"}</div>
              <div className="sc-source">{"US Federal Trade Commission, 2024 data"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"The scale: India's fraud bill tripled in a year"}</div>
                <div className="sec-sub">{"Where job scams fit in a 22,845 crore problem"}</div>
              </div>
            </div>
            <p>{"Government data released in July 2025 showed Indians lost 22,845 crore to cyber fraud in 2024, a 206% jump from 2023. There were 36.4 lakh fraud complaints across the national cybercrime portal and the financial fraud reporting system, up from 24.4 lakh the year before. That figure covers all cyber fraud, from investment scams to digital arrest calls, but fake jobs and part-time task schemes are among the most common entry points."}</p>
            <p>{"Enforcement cases show how big individual job scam networks get. In December 2023, the Home Ministry's cybercrime centre identified more than 100 websites running task-based part-time job and investment frauds, operated by overseas actors using chat apps and rented bank accounts, and had them blocked. In 2024, the Enforcement Directorate attached 32.34 crore in a single part-time job scam case."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Job scams are not small-time fraud. They are run by organised, often cross-border networks, with scripts, fake reviews and mule bank accounts."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"Anatomy of a task scam"}</div>
                <div className="sec-sub">{"How 150 rupees for liking videos turns into a 1.5 lakh loss"}</div>
              </div>
            </div>
            <p>{"Task scams follow a script. A WhatsApp or Telegram message offers part-time work: like YouTube videos, follow accounts, rate hotels or 'optimise' app listings. The first tasks pay real money, small amounts like 150 or 300 rupees, straight to your UPI. That payout is what builds trust."}</p>
            <p>{"Then the work moves to 'prepaid' or 'merchant' tasks. You deposit money to unlock a task that promises a bigger return. The first deposit pays out. The next one, larger, shows profits on a dashboard but cannot be withdrawn until you complete one more task, pay a 'tax', or clear a 'negative balance'. A group chat full of fake members posts screenshots of their withdrawals. By the time victims stop, they have often moved lakhs into accounts that are emptied within minutes."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The moment any job asks you to send money to earn money, it is no longer a job. That single rule stops every task scam."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Task scam reports to the US FTC: from near zero to the fastest-growing job scam"}</div>
              <div style={{ height: 260 }}>
                <canvas id="taskScamChart" />
              </div>
            </div>

            <div className="callout-red"><strong>{"Global trend:"}</strong>{" The US FTC recorded almost no task scam reports in 2020, around 5,000 in 2023, and about 20,000 in just the first half of 2024. The same playbook is running across countries, including India."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Pay-to-join internships and fake offer letters"}</div>
                <div className="sec-sub">{"The scams that look like a real first job"}</div>
              </div>
            </div>
            <p>{"Students are also targeted with offers that look professional. An 'internship' that charges a registration fee, a training fee, a certificate fee or a refundable security deposit. An offer letter on a well-known company's letterhead, sent from a Gmail or Outlook address, asking you to pay for a background check or laptop before joining. A 'work from home' data entry role that requires you to buy a starter kit."}</p>
            <p>{"Some of these are outright fraud. Others are paid courses disguised as internships, where the 'internship' is a recorded course and a certificate, and the fee is the business. Neither is a job. Legitimate employers, including small startups, pay you. They do not charge you to join."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Real employers spend money to hire you. If the money flows from you to them, it is a scam or a course with a misleading name."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Fee for anything."}</strong> {"Registration, training, certificate, ID card, background check, equipment or deposit. All are red flags."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Offer without an interview."}</strong> {"Real companies, even small ones, talk to you before they hire you."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Big brand, personal email."}</strong> {"Large companies send offers from their own domain or applicant system, not free email accounts."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Urgency."}</strong> {"'Pay today or the seat goes to someone else' is pressure, not process."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Why students are the perfect target"}</div>
                <div className="sec-sub">{"The vulnerabilities scammers design for"}</div>
              </div>
            </div>
            <p>{"Students and first-time job seekers have exactly the profile scammers look for. They want income and experience quickly, they have never seen a real hiring process, they are used to paying fees for exams and courses, and they are comfortable on WhatsApp, Telegram and UPI. Many also feel embarrassed to admit they were fooled, so losses go unreported and the same networks keep going."}</p>
            <p>{"Scammers also exploit the hiring market itself. When real internships are scarce and applications go unanswered, an offer that arrives quickly and asks for little feels like a lucky break. That feeling is the scam working as designed."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" The more rejections you have had, the more convincing a fake offer feels. Build your checks before you need them."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"The 7-point offer check"}</div>
                <div className="sec-sub">{"Five minutes that can save you lakhs"}</div>
              </div>
            </div>
            <p>{"Run every unexpected offer through these checks before you share documents or money. One failed check is enough reason to stop."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Verify through a channel the scammer does not control: the company's own website, its official careers page, or an employee you find yourself."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"1. Did you apply?"}</strong> {"Unsolicited offers for jobs you never applied to are the biggest single warning sign."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"2. Was there a real interview?"}</strong> {"A video call with a named person who works at the company, not a chat-only process."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"3. Is the email from the company domain?"}</strong> {"Check the address character by character. Look-alike domains are common."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"4. Is the role on the official careers page?"}</strong> {"Search the company site directly. Do not use links in the message."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"5. Can you find the recruiter on LinkedIn?"}</strong> {"A real profile with history, connections and the company listed."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"6. Is anyone asking for money?"}</strong> {"Any fee, deposit or purchase means stop."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"7. Is the pay believable?"}</strong> {"Several thousand rupees a day for simple tasks is not a job. It is bait."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#ef4444" }}>{"6"}</div>
              <div>
                <div className="sec-title">{"If you have been scammed: the first hour matters"}</div>
                <div className="sec-sub">{"What to do immediately"}</div>
              </div>
            </div>
            <p>{"Act fast and do not let embarrassment slow you down. Call the national cyber fraud helpline 1930 or file a complaint at cybercrime.gov.in as soon as possible. Government data shows more than 5,489 crore was stopped from reaching fraudsters in 2024 through complaints, and fast reporting is what gives banks time to freeze money before it moves on."}</p>
            <p>{"Then call your bank to block further transactions, save every screenshot, chat, UPI ID and account number, and do not pay anyone who contacts you offering to 'recover' your money. Recovery scams target people who have just been defrauded."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" Real jobs pay you, interview you and write to you from their own domain. Anything else needs checking, and any request for money needs refusing."}</div>

            <div className="callout-green"><strong>{"Remember:"}</strong>{" 1930 helpline, cybercrime.gov.in, your bank's fraud line. In that order, as fast as you can."}</div>
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
              <div className="blist-item" key="Never pay to work">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Never pay to work"}.</strong> {"Any fee, deposit or prepaid task means the offer is a scam or a course in disguise."}</span>
              </div>
              <div className="blist-item" key="Verify through channels you control">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Verify through channels you control"}.</strong> {"Official careers pages, the company's own domain and recruiters you find yourself, never links inside the message."}</span>
              </div>
              <div className="blist-item" key="Be most careful when you are most eager">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Be most careful when you are most eager"}.</strong> {"Fast, easy offers after a run of rejections are exactly what scammers design."}</span>
              </div>
              <div className="blist-item" key="Report within the hour">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Report within the hour"}.</strong> {"Call 1930 or use cybercrime.gov.in immediately. Speed is what lets banks freeze money."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Look for internships where companies come to you openly"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships that fit you from company career sites and job boards, so you apply to companies you can research. Never pay to apply."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-job-scam-report-fake-internships-task-scams-students-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
