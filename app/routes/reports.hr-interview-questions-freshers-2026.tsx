import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "HR Interview Questions for Freshers, 2026: Tell Me About Yourself, and What Interviewers Actually Score | Studojo" },
    { name: "description", content: "The 10 HR round questions freshers get asked most, what each one really tests, and strong vs weak example answers. Backed by NACE, LinkedIn, Indeed India and interview research." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "hr interview questions for freshers, tell me about yourself answer for freshers, why should we hire you fresher, what are your strengths and weaknesses, hr round questions and answers, salary expectation answer fresher, do you have any questions for us" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/hr-interview-questions-freshers-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "HR Interview Questions for Freshers, 2026: Tell Me About Yourself, and What Interviewers Actually Score" },
    { property: "og:description", content: "The most-asked HR round questions, what each one tests, and how to answer them as a fresher, with the research on what interviewers really score." },
    { property: "og:url", content: `${BASE_URL}/reports/hr-interview-questions-freshers-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-08T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "HR Interview Questions for Freshers, 2026 | Studojo" },
    { name: "twitter:description", content: "Tell me about yourself, why should we hire you, strengths and weaknesses, salary: what the HR round really scores, and how to answer." },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
    { name: "twitter:site", content: "" },
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
  const VIOLET2 = "#a78bfa";
  const VIOLET3 = "#c4b5fd";
  const RED = "#ef4444";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: top hiring priorities named by employers in India (Michael Page India Talent Trends 2025, 1,383 hiring leaders)
  const skillsEl = document.getElementById("hriqSkillsChart") as HTMLCanvasElement | null;
  if (skillsEl && !skillsEl.dataset.rendered) {
    skillsEl.dataset.rendered = "1";
    new Chart(skillsEl, {
      type: "bar",
      data: {
        labels: ["Communication", "Industry technical expertise", "Continuous learning", "Decision making", "Adaptability"],
        datasets: [{
          label: "% of employers naming it a top priority",
          data: [37, 33, 31, 31, 29],
          backgroundColor: [VIOLET, VIOLET2, VIOLET2, VIOLET3, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of employers` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` }, max: 40 },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
        },
      },
    });
  }

  // Chart 2: fresher pay, expectation vs offer (Indeed India Hiring Tracker, Q4 FY25), plus reported TCS track entry figures
  const payEl = document.getElementById("hriqPayChart") as HTMLCanvasElement | null;
  if (payEl && !payEl.dataset.rendered) {
    payEl.dataset.rendered = "1";
    new Chart(payEl, {
      type: "bar",
      data: {
        labels: ["TCS Ninja (reported)", "Average offer, class of 2025", "Average fresher expectation", "TCS Digital (reported)", "TCS Prime, low end (reported)"],
        datasets: [{
          label: "LPA",
          data: [3.36, 3.5, 3.8, 7, 9],
          backgroundColor: [VIOLET3, VIOLET, RED, VIOLET3, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} lakh a year` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK, maxRotation: 45, minRotation: 30 } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v} L` } },
        },
      },
    });
  }

  // Chart 3: what Indian employers say goes wrong with new graduates (Indeed India Hiring Tracker, Q4 FY25)
  const gapEl = document.getElementById("hriqGapChart") as HTMLCanvasElement | null;
  if (gapEl && !gapEl.dataset.rendered) {
    gapEl.dataset.rendered = "1";
    new Chart(gapEl, {
      type: "bar",
      data: {
        labels: ["Lack of job-ready skills", "Difficulty with workplace integration", "Mismatched pay and role expectations"],
        datasets: [{
          label: "% of employers",
          data: [38, 27, 25],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of employers` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` }, max: 50 },
          y: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
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

  .keyfindings { background: #faf5fe; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #8B5CF6; padding: 32px 40px; }
  @media (max-width: 640px) { .keyfindings { padding: 24px 20px; } }
  .keyfindings h2 { font-size: 13px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; }
  .kf-list { display: flex; flex-direction: column; gap: 12px; }
  .kf-item { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: #3b0764; line-height: 1.6; font-weight: 500; }
  .kf-check { width: 20px; height: 20px; border-radius: 6px; background: #8B5CF6; color: #fff; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .kf-item strong { color: #6d28d9; }

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
  .highlight strong { color: #6d28d9; }
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }
  .pull-quote { border-left: 4px solid #8B5CF6; padding: 16px 24px; margin: 22px 0; background: #faf5fe; border-radius: 0 12px 12px 0; }
  .pull-quote p { font-size: 16px !important; font-weight: 600 !important; color: #3b0764 !important; font-style: italic; margin: 0 !important; }
  .pq-source { font-size: 12px; color: #8B5CF6; font-weight: 600; margin-top: 8px; display: block; }

  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }

  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }

  .divider { height: 2px; background: #f0f0f0; margin: 24px 0; border-radius: 2px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }

  .faq-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .faq-section { padding: 28px 20px; } }
  .faq-item { border-bottom: 1px solid #f0f0f0; padding: 18px 0; }
  .faq-item:first-of-type { padding-top: 0; }
  .faq-item:last-child { border-bottom: none; padding-bottom: 0; }
  .faq-q { font-size: 16px; font-weight: 700; color: #171717; line-height: 1.4; margin-bottom: 8px; }
  .faq-a { font-size: 14px; color: #404040; line-height: 1.7; }
  .faq-a strong { color: #6d28d9; }

  .related { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 32px 40px; }
  @media (max-width: 640px) { .related { padding: 24px 20px; } }
  .related h2 { font-size: 13px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
  .related-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  @media (max-width: 640px) { .related-grid { grid-template-columns: 1fr; } }
  .related-card { display: block; border: 1.5px solid #e5e5e5; border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s; }
  .related-card:hover { border-color: #8B5CF6; }
  .related-card .rc-kicker { font-size: 10px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .related-card .rc-title { font-size: 14px; font-weight: 600; color: #171717; line-height: 1.4; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }

  .rpt-cta { background: #8B5CF6; border: 2px solid #171717; border-radius: 20px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: 4px 4px 0 #171717; }
  .rpt-cta-left h3 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .rpt-cta-left p { font-size: 14px; color: rgba(255,255,255,0.75); font-weight: 500; max-width: 420px; }
  .rpt-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #8B5CF6; font-size: 14px; font-weight: 700; padding: 12px 26px; border-radius: 12px; border: 2px solid #171717; box-shadow: 3px 3px 0 #171717; text-decoration: none; white-space: nowrap; }

  .ans-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
  @media (max-width: 640px) { .ans-pair { grid-template-columns: 1fr; } }
  .ans-box { border-radius: 12px; padding: 16px 18px; font-size: 14px; line-height: 1.6; }
  .ans-weak { background: #fef2f2; border: 1.5px solid #fecaca; color: #7f1d1d; }
  .ans-strong { background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #064e3b; }
  .ans-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .q-head { font-size: 17px; font-weight: 700; color: #171717; margin: 26px 0 8px; }
`;

const FAQ = [
  {
    q: "How do I answer 'Tell me about yourself' as a fresher?",
    a: "Answer in about 60 to 90 seconds using present, past, future: what you are doing now, one or two pieces of proof from college or an internship, and why this role is the next step. Do not recite your resume or start with your family. Research on structured interviews (Barrick, Swider and Stewart, Journal of Applied Psychology, 2010) found that the impression formed in the opening rapport stage correlated with final interview ratings at r = .42, so this first answer carries real weight.",
  },
  {
    q: "What are the most common HR interview questions for freshers?",
    a: "The questions that come up most are: tell me about yourself, why should we hire you, your strengths and weaknesses, why this company, where you see yourself in five years, a challenge or failure you handled, a conflict in a team, your salary expectation, willingness to relocate or work shifts, and whether you have any questions for the interviewer. At Indian IT services firms, relocation, shifts and the service agreement come up in most fresher HR rounds, according to candidate interview reports on prep sites such as PrepInsta and GeeksforGeeks.",
  },
  {
    q: "How should a fresher answer 'Why should we hire you'?",
    a: "Match two or three things the role needs to specific proof you have, then show you will learn fast. Employers are looking for evidence, not adjectives: NACE's Job Outlook 2025 found nearly 90% of employers look for problem-solving and nearly 80% for teamwork on student resumes. Name the project, the result and the skill, in that order.",
  },
  {
    q: "What weakness should I say in an HR interview?",
    a: "Pick a real, non-critical weakness, show what you are doing about it, and give proof of progress. Avoid fake weaknesses like 'I work too hard', which interviewers hear constantly. Do not name a weakness that is central to the job, such as poor communication for a client-facing role, since Michael Page's 2025 India survey of 1,383 hiring leaders found communication was the top hiring priority at 37%.",
  },
  {
    q: "What should a fresher say for expected salary?",
    a: "Give a researched range, not a single number, and say you are flexible for the right role. Indeed India's Hiring Tracker for January to March 2025 put the average fresher offer at 3.5 LPA against an average expectation of 3.8 LPA, and 25% of employers cited mismatched pay and role expectations as a problem with new graduates. At mass recruiters with fixed bands, such as TCS Ninja (reported at about 3.36 LPA), the number is not negotiable, so simply confirm you know the band.",
  },
  {
    q: "What questions should I ask at the end of an HR interview?",
    a: "Ask one or two questions about the work and how success is measured, for example what a new hire in this role works on in the first three months. Avoid asking only about leave and salary in the first round. CareerBuilder's hiring manager survey, reported by CBS News in 2014, ranked appearing disinterested as the most common interview mistake, and having no questions reads as exactly that.",
  },
];

export default function HrInterviewQuestionsFreshersReport() {
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
        "headline": "HR Interview Questions for Freshers, 2026: Tell Me About Yourself, and What Interviewers Actually Score",
        "description": "The most-asked HR round questions, what each one tests, and how to answer them as a fresher, with the research on what interviewers really score.",
        "url": `${BASE_URL}/reports/hr-interview-questions-freshers-2026`,
        "datePublished": "2026-11-08T00:00:00Z",
        "dateModified": "2026-11-08T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/hr-interview-questions-freshers-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "HR Interview Questions for Freshers, 2026", "item": `${BASE_URL}/reports/hr-interview-questions-freshers-2026` },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · November 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>HR Interview Questions for Freshers</span>
            </nav>
            <h1>HR Interview Questions for Freshers, 2026: <em>What Interviewers Actually Score</em></h1>
            <p className="rpt-hero-sub">
              The ten questions you will almost certainly get in the HR round, what each one is
              really testing, and how a strong answer differs from a weak one. Plus salary, the
              "any questions?" moment, and how the round changes between IT services, startups and MNCs.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Freshers · HR and managerial rounds</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Sources</span>
                <span className="rpt-meta-value">NACE, LinkedIn, Indeed India, Michael Page, TeamLease, peer-reviewed research</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">8 November 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          {/* Key findings answer box */}
          <div className="keyfindings">
            <h2>Key findings</h2>
            <div className="kf-list">
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The opening minutes count.</strong> In a peer-reviewed study, impressions from the rapport stage correlated with final interview ratings at r = .42 (Barrick, Swider and Stewart, 2010). "Tell me about yourself" is that stage.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Communication is the top priority</strong> for Indian employers: 37% of 1,383 hiring leaders named it first (Michael Page India Talent Trends 2025).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Soft skills sink hires.</strong> 89% of talent professionals said bad hires typically have poor soft skills (LinkedIn Global Talent Trends 2019). The HR round is where those get checked.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Freshers expect more than they are offered:</strong> 3.8 LPA expected vs 3.5 LPA offered on average, and 25% of employers flag mismatched pay and role expectations (Indeed India, Q4 FY25).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Evidence beats adjectives.</strong> Nearly 90% of employers look for problem-solving and nearly 80% for teamwork (NACE Job Outlook 2025). Every strong answer below names a specific example.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">37%</div>
              <div className="sc-label">of Indian hiring leaders rank communication as their top hiring priority</div>
              <div className="sc-source">Michael Page India Talent Trends 2025</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">89%</div>
              <div className="sc-label">of talent professionals say bad hires typically have poor soft skills</div>
              <div className="sc-source">LinkedIn Global Talent Trends 2019</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">₹30,000</div>
              <div className="sc-label">gap between average fresher pay expectation (3.8 LPA) and offer (3.5 LPA)</div>
              <div className="sc-source">Indeed India Hiring Tracker, Jan to Mar 2025</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What the HR Round Is Actually Scoring</div>
                <div className="sec-sub">It is not a formality, and it is not a memory test</div>
              </div>
            </div>
            <p>Many freshers treat the HR round as the easy bit after the technical round. It is not. The HR round checks three things the technical round cannot: can you explain yourself clearly, will you fit how this team works, and will you stay. Every question in this report maps to one of those three.</p>
            <p>The research on interviews says the first few minutes do a lot of work. In a study published in the Journal of Applied Psychology, Barrick, Swider and Stewart (2010) found that interviewer impressions formed during the opening rapport stage of a structured interview correlated with end-of-interview ratings at r = .42, and with internship offers at r = .22. Importantly, the part that carried over to other interviewers was judged competence, not just liking. An older, often-cited study by Prickett, Gada-Jain and Bernieri found that people who watched only a short clip of a candidate's greeting and handshake could predict how trained interviewers rated them on most traits (as described by Malcolm Gladwell in The New Yorker, 2000). And in a CareerBuilder survey reported by CBS News in 2014, nearly half of hiring managers said they know within the first five minutes whether a candidate is right.</p>
            <div className="highlight">
              The first answer you give, usually "tell me about yourself", is the rapport stage. It is not small talk. It sets the frame the interviewer uses for everything after it.
            </div>
            <p>There is good news in the same research. Structured interviews, where every candidate gets the same questions scored against the same criteria, are far better predictors of job performance than casual chats: a 2022 meta-analysis by Sackett, Zhang, Berry and Lievens (Journal of Applied Psychology) put the validity of structured interviews at .42 versus .19 for unstructured ones. Larger employers increasingly use scoring sheets in HR rounds. That means a clear, structured answer with a real example is exactly what the scorer is looking for, and it can pull back a shaky first impression.</p>
            <p>Why soft skills get so much weight: in LinkedIn's 2019 Global Talent Trends survey of thousands of hiring professionals, 89% said bad hires typically have poor soft skills, and 92% said soft skills matter as much as or more than hard skills. The HR round is the employer's main check on those.</p>
            <div className="callout">
              <strong>What this means for you:</strong> the HR interviewer is filling in a mental (or literal) scorecard with three boxes: communication, fit, and commitment. Before you answer any question, ask yourself which box it is filling, and give evidence for that box.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Barrick, Swider and Stewart, Journal of Applied Psychology 95(6), 2010; Sackett et al., Journal of Applied Psychology, 2022; LinkedIn Global Talent Trends 2019; CareerBuilder survey via CBS News MoneyWatch, January 2014; Gladwell, "The New-Boy Network", The New Yorker, 2000.</p>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">"Tell Me About Yourself": The Answer That Sets the Score</div>
                <div className="sec-sub">60 to 90 seconds, present, past, future</div>
              </div>
            </div>
            <p>This is almost always the first question, and it is really a communication test. The interviewer wants to see if you can pick what matters, put it in order, and stop. Communication is also what Indian employers say they want most: in Michael Page's 2025 India Talent Trends survey of 1,383 hiring leaders, communication skills topped the list of hiring priorities at 37%, ahead of industry technical expertise at 33%.</p>
            <div className="chart-wrap">
              <div className="chart-label">Top hiring priorities named by employers in India, % of hiring leaders (Michael Page India Talent Trends 2025)</div>
              <div style={{ height: 260 }}>
                <canvas id="hriqSkillsChart" />
              </div>
            </div>
            <p>The structure that works is present, past, future. Present: what you are doing now, in one line. Past: one or two pieces of proof, a project, an internship, a result. Future: why this role is the logical next step. Keep it to about 60 to 90 seconds. The examples below are written by us to illustrate the structure, not quotes from real candidates.</p>
            <div className="ans-pair">
              <div className="ans-box ans-weak">
                <span className="ans-label">Weak (example)</span>
                "My name is Rahul. I am from Nagpur. My father is a government employee and my mother is a homemaker. I did my schooling from Kendriya Vidyalaya and then BTech in ECE with 7.8 CGPA. My hobbies are cricket and listening to music. I am a hardworking and honest person."
              </div>
              <div className="ans-box ans-strong">
                <span className="ans-label">Strong (example)</span>
                "I am a final-year BTech ECE student at a college in Nagpur, and over the last year I have moved toward data work. In my internship at a small logistics firm I built a Python script that cleaned their daily delivery data, which cut a two-hour manual job to about ten minutes. I want an analyst role where I work with real operations data, which is why this role on your supply chain team stood out."
              </div>
            </div>
            <p>The weak version spends its time on facts already on the resume or irrelevant to the job, and ends on two adjectives with no proof. The strong version gives one concrete result, a number, and a reason for this company. It also hands the interviewer an easy follow-up question, which is what you want: you choose the topic you are best prepared to discuss.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Skip:</strong> family background, school name, hobbies (unless directly relevant), and your CGPA unless asked.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Include:</strong> one result with a number, one skill the job description asks for, one line on why this company.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Practise out loud</strong> with a timer. Most freshers who write it down run past two minutes the first time.</span></div>
            </div>
            <div className="callout">
              <strong>The test:</strong> after your answer, could the interviewer repeat back one specific thing you did? If the only thing they could repeat is "hardworking", rewrite it.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Michael Page, 2025 India Talent Trends Report "Compete on Clarity", August 2025. Example answers are illustrative and written by Studojo.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">The Other Nine Questions, and What Each One Tests</div>
                <div className="sec-sub">Every question maps to communication, fit or commitment</div>
              </div>
            </div>
            <p>Beyond "tell me about yourself", these are the questions that recur across fresher HR rounds in India, based on candidate interview reports on prep sites such as PrepInsta, GeeksforGeeks and Glassdoor. The wording changes, the intent does not. Employers are looking for evidence: NACE's Job Outlook 2025 survey of 237 employers found nearly 90% look for problem-solving and nearly 80% for teamwork on student resumes, and the Spring 2026 update (185 employers) again named teamwork, problem-solving and communication as the top three. Your answers should carry examples of exactly those.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>What it really tests</th>
                  <th>Strong answer structure</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Why should we hire you?</td><td>Have you read the role, and can you match yourself to it</td><td>Two needs of the role, proof for each, one line on learning speed</td></tr>
                <tr><td>What are your strengths?</td><td>Self-awareness, relevance to the job</td><td>One strength the job needs, one story that proves it</td></tr>
                <tr><td>What is your weakness?</td><td>Honesty, coachability</td><td>Real but non-critical weakness, what you are doing, evidence of progress</td></tr>
                <tr><td>Why this company?</td><td>Did you research us, or are you mass applying</td><td>One specific fact about their work, why it fits what you want to learn</td></tr>
                <tr><td>Where do you see yourself in five years?</td><td>Will you stay, are your plans realistic</td><td>Growing depth in this field, with more responsibility, here</td></tr>
                <tr><td>Tell me about a challenge or failure</td><td>Problem-solving, ownership</td><td>Situation, what you did, result, what you would do differently</td></tr>
                <tr><td>Tell me about a conflict in a team</td><td>Teamwork, maturity</td><td>The disagreement, how you listened, how it was resolved, no blaming</td></tr>
                <tr><td>Are you open to relocation, shifts or a service agreement?</td><td>Commitment, practical fit</td><td>A clear yes or an honest, specific constraint. Do not dodge</td></tr>
                <tr><td>Do you have any questions for us?</td><td>Interest, curiosity</td><td>One or two questions about the work and how success is judged</td></tr>
              </tbody>
            </table>
            <p className="q-head">Why should we hire you?</p>
            <div className="ans-pair">
              <div className="ans-box ans-weak">
                <span className="ans-label">Weak (example)</span>
                "Because I am a fast learner, hardworking and a team player. I will give my 100% to the company."
              </div>
              <div className="ans-box ans-strong">
                <span className="ans-label">Strong (example)</span>
                "The role needs someone comfortable with SQL and with explaining numbers to non-technical people. In my final-year project I wrote the SQL for a canteen sales dashboard and presented it to the college admin, who now use it weekly. I am new to your tools, but I learned Power BI in three weeks for that project, so I expect to get up to speed fast."
              </div>
            </div>
            <p className="q-head">What are your strengths and weaknesses?</p>
            <div className="ans-pair">
              <div className="ans-box ans-weak">
                <span className="ans-label">Weak (example)</span>
                "My strength is I am a perfectionist. My weakness is also that I am a perfectionist and I work too hard."
              </div>
              <div className="ans-box ans-strong">
                <span className="ans-label">Strong (example)</span>
                "A strength is staying with a problem: in a hackathon our API kept failing and I spent the night reading logs until I found a timeout setting. A weakness is public speaking. I used to rush through presentations, so I joined my college's debate club last year and now present in every team review. I am better, not perfect."
              </div>
            </div>
            <div className="highlight">
              The pattern across every strong example: a specific situation, what you did, and a result. That is the STAR method (Situation, Task, Action, Result) in plain words, and it is what structured interview scorecards are built to reward.
            </div>
            <div className="callout">
              <strong>On weaknesses:</strong> do not pick one that is central to the role. Saying you struggle with communication in a client-facing role, when communication is the top hiring priority for 37% of Indian employers (Michael Page 2025), hands the interviewer a reason to say no.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: NACE Job Outlook 2025 (published December 2024, 237 respondents); NACE Job Outlook 2026 Spring Update (April 2026, 185 respondents); Michael Page India Talent Trends 2025. Example answers are illustrative and written by Studojo.</p>
          </div>
          <StuCta via="report-hr-interview-questions-freshers-2026" place="report-mid" size="quiet" title="Stu finds who's hiring for the roles you want and writes the email that gets you to the interview." />

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Salary Expectations and "Do You Have Any Questions?"</div>
                <div className="sec-sub">The two answers freshers most often fumble</div>
              </div>
            </div>
            <p>The salary question tests whether your expectations are realistic, not whether you are a good negotiator. The data says many freshers are slightly out of step. Indeed India's Hiring Tracker for January to March 2025 put the average offer for the class of 2025 at 3.5 LPA against an average fresher expectation of 3.8 LPA, a gap of about ₹30,000 a year. 25% of employers said mismatched expectations on pay and role were a problem with new graduates, and 72% of freshers said they would not accept lower pay even for a role with strong learning prospects.</p>
            <div className="chart-wrap">
              <div className="chart-label">Fresher pay in lakh per year: Indeed India averages vs reported TCS entry bands</div>
              <div style={{ height: 300 }}>
                <canvas id="hriqPayChart" />
              </div>
            </div>
            <p>At mass recruiters, the band is fixed by track. TCS's entry tracks are widely reported at about 3.36 LPA for Ninja, about 7 LPA for Digital and roughly 9 to 11.5 LPA for Prime (Business Today and placement prep sites; figures vary by batch, so confirm with your offer letter). There, the right answer is to confirm you know the band. At startups and mid-sized firms, give a range you have researched on AmbitionBox or Glassdoor (self-reported, so treat as indicative) and anchor it to the role.</p>
            <div className="ans-pair">
              <div className="ans-box ans-weak">
                <span className="ans-label">Weak (example)</span>
                "Whatever the company decides." Or: "I want 8 LPA because my friend got that at another company."
              </div>
              <div className="ans-box ans-strong">
                <span className="ans-label">Strong (example)</span>
                "From what I have seen for analyst roles at this level in Pune, the range is around 4 to 5.5 LPA. I am flexible within that, and the learning in this role matters a lot to me. Could you share the band you have in mind?"
              </div>
            </div>
            <p>"Do you have any questions for us?" is the last box on the scorecard: interest. In CareerBuilder's hiring manager survey reported by CBS News in 2014, appearing disinterested ranked as the most common interview mistake. Saying "No, everything is clear" is a quiet way of looking disinterested. Ask one or two questions about the work itself.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span>"What does a new hire in this role usually work on in the first three months?"</span></div>
              <div className="blist-item"><div className="blist-dot" /><span>"How do you judge whether someone in this role is doing well after six months?"</span></div>
              <div className="blist-item"><div className="blist-dot" /><span>"Is there a training period, and which team would I join after it?" (useful at IT services firms)</span></div>
              <div className="blist-item"><div className="blist-dot" /><span>Avoid leading with leave, work-from-home or appraisal cycles in the first round. Ask those once there is an offer.</span></div>
            </div>
            <div className="callout">
              <strong>One rule for salary:</strong> research the band before the interview. A researched range plus "I am flexible" never hurts you. A number pulled from a friend's offer at a different company often does.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Indeed India Hiring Tracker, Q4 FY25 (January to March 2025), via People Matters, 30 April 2025; Business Today, March 2024, and placement prep sites for TCS bands (reported, indicative); CareerBuilder via CBS News, January 2014.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">IT Services vs Startups vs MNCs: Same Questions, Different Weight</div>
                <div className="sec-sub">What each kind of employer is really checking</div>
              </div>
            </div>
            <p>The questions overlap, but what each employer cares about most differs. At large IT services firms the HR round is often short and partly a logistics check. Candidate reports on prep sites describe relocation, night shifts, documents and the service agreement coming up in almost every TCS and Wipro fresher HR round, and at Wipro the technical and HR parts are often merged into one interview. Bond terms reported online conflict, so read your own offer documents rather than trusting a forum post.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employer type</th>
                  <th>What the HR round weighs most</th>
                  <th>Questions to expect</th>
                  <th>What to prepare</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>IT services (TCS, Infosys, Wipro and similar)</td><td>Commitment, flexibility, clean documents</td><td>Relocation, shifts, service agreement, gaps in education, why IT if non-CS</td><td>Clear yes/no answers, document set ready, one line on why IT</td></tr>
                <tr><td>Startups</td><td>Ownership, speed of learning, real interest in the product</td><td>What have you built, why a startup, how you handle ambiguity, have you used our product</td><td>One project you drove end to end, specific feedback on their product</td></tr>
                <tr><td>MNCs and large product firms</td><td>Structured behavioural evidence, values fit</td><td>Tell me about a time you..., conflict, failure, leadership in a team</td><td>Five or six STAR stories you can adapt to any behavioural question</td></tr>
              </tbody>
            </table>
            <p>At startups, the HR round may be run by a founder or the hiring manager, not an HR person, and "why a startup?" is a real filter. A generic answer about "learning a lot" is weak. A strong answer names something specific: their product, a problem they solve, or the kind of ownership you want. At MNCs, expect structured behavioural questions scored on a rubric, which is where the research on structured interviews (Sackett et al., 2022) applies most directly.</p>
            <div className="highlight">
              Across all three, India's employers say they are moving toward skills and proof. TeamLease EdTech's Career Outlook Report for HY1 2026 (1,051 employers) found fresher hiring intent at 73% and described a shift from degree filters toward skills, behaviour and proof-of-work such as projects and internships.
            </div>
            <div className="callout">
              <strong>For non-CS freshers at IT services:</strong> "Why IT when you studied mechanical?" is near-certain. Answer with what you did about it (a course, a project, the test you cleared), not with "IT has good opportunities".
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Candidate interview reports on PrepInsta, GeeksforGeeks and freshershunt.in (indicative, not official); TeamLease EdTech Career Outlook Report HY1 2026 via EducationWorld; Sackett et al., 2022.</p>
          </div>

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The Fresher Mistakes That Cost the Offer</div>
                <div className="sec-sub">What employers say goes wrong with new graduates</div>
              </div>
            </div>
            <p>Indian employers are fairly clear about where new graduates fall short. In Indeed India's Hiring Tracker for January to March 2025, 38% of employers cited a lack of job-ready skills among new graduates, 27% reported difficulties with workplace integration, and 25% pointed to mismatched expectations on pay and role. Each of these shows up in the HR round as a specific mistake.</p>
            <div className="chart-wrap">
              <div className="chart-label">Problems employers report with new graduates, % of employers (Indeed India Hiring Tracker, Q4 FY25)</div>
              <div style={{ height: 220 }}>
                <canvas id="hriqGapChart" />
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Memorised answers.</strong> Interviewers hear the same template from dozens of candidates on campus day. A recited answer signals weak communication, the top priority for 37% of Indian employers (Michael Page 2025).</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Adjectives instead of evidence.</strong> "Hardworking, honest, team player" with no story. NACE's employers are looking for evidence of problem-solving and teamwork, not the words.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Not knowing the company.</strong> "Why this company?" answered with "it is a reputed MNC" tells them you would say the same anywhere.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Dodging relocation or shift questions.</strong> At IT services firms these are commitment checks. A vague "I will try" reads worse than an honest constraint.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Unrealistic salary numbers.</strong> The expectation gap is real (3.8 vs 3.5 LPA, Indeed India) and a quarter of employers flag it.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Looking disinterested.</strong> Ranked the most common interview mistake by hiring managers in CareerBuilder's survey (CBS News, 2014). No questions at the end, flat answers, checking your phone.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Lying or inflating.</strong> Claimed skills get tested in the next question, and resume claims get checked later in background verification.</span></div>
            </div>
            <div className="pull-quote">
              <p>"The HR round rarely rejects freshers for not knowing an answer. It rejects them for giving an answer with nothing behind it."</p>
              <span className="pq-source">The takeaway from the employer surveys above</span>
            </div>
            <div className="callout">
              <strong>The fix for most of these is the same:</strong> prepare five or six true stories from your projects, internships and college life, and practise telling each in under a minute. Almost every HR question can be answered with one of them.
            </div>
            <p className="sc-source" style={{marginTop: 12}}>Source: Indeed India Hiring Tracker, Q4 FY25, via People Matters, April 2025; Michael Page India Talent Trends 2025; NACE Job Outlook 2025; CareerBuilder via CBS News, January 2014.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">The HR round questions freshers search for, answered directly</div>
              </div>
            </div>
            {FAQ.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          {/* Takeaway */}
          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <div className="sec-title" style={{ color: "#3b0764" }}>What This Means For You</div>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to prepare for the HR round this week</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The HR round rewards preparation more than talent. A simple plan:</p>
            <div className="blist">
              {[
                ["Write and time your opening", "Present, past, future, 60 to 90 seconds, one number in it. Practise it out loud until it sounds like you, not a script."],
                ["Build five or six stories", "A project, a failure, a team conflict, a time you learned something fast, a result you are proud of. Most HR questions are one of these in disguise."],
                ["Research the company and the band", "One specific fact about their work for 'why us', and a realistic pay range from AmbitionBox or Glassdoor, labelled in your head as indicative."],
                ["Decide your logistics answers in advance", "Relocation, shifts, service agreement. Know your honest answer before you walk in."],
                ["Prepare two real questions", "About the work and how success is measured. Save leave and appraisals for after the offer."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related reports */}
          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              <Link to="/reports/interview-report-why-candidates-fail-after-shortlist-2026" className="related-card">
                <div className="rc-kicker">Interviews</div>
                <div className="rc-title">The Interview Report: Why Candidates Fail After Getting Shortlisted</div>
              </Link>
              <Link to="/reports/salary-negotiation-report-do-freshers-who-negotiate-get-more-2026" className="related-card">
                <div className="rc-kicker">Salary</div>
                <div className="rc-title">The Salary Negotiation Report: Do Freshers Who Negotiate Get More?</div>
              </Link>
              <Link to="/reports/it-services-hiring-report-tcs-infosys-wipro-2026" className="related-card">
                <div className="rc-kicker">IT services</div>
                <div className="rc-title">The IT Services Hiring Report 2026: TCS, Infosys, Wipro</div>
              </Link>
            </div>
          </div>
          <StuCta via="report-hr-interview-questions-freshers-2026" place="report-end" size="card" title="Want more interviews to practise on?" line="Tell Stu the role, the city and the pay you want in one short call. Stu finds jobs that fit you, finds who's hiring and writes the email to them." />
        </div>
      </main>
      <Footer />
    </>
  );
}
