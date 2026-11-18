import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { StuCta } from "~/components/site-b2c/StuCta";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Internship in Indore 2026: What 118 Listings Show, What to Ask and Who to Email | Studojo" },
    { name: "description", content: "Internship in Indore: 118 listings posted 1 to 15 Nov 2026, led by marketing, social media and sales. Only 2 state a stipend. What to ask and who to email." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "internship in Indore, internship in indore for freshers, internship in indore for students, internship in indore for computer science students, internship in indore for bba students, internship in indore for data analyst, paid internship in indore" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/internships-indore-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Internship in Indore 2026: What 118 Listings Show" },
    { property: "og:description", content: "Marketing, social media and sales lead Indore's internship listings and almost none state a stipend. The employers behind the city, what to ask before you accept, and who to email." },
    { property: "og:url", content: `${BASE_URL}/reports/internships-indore-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-11-18T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Internship in Indore 2026 | Studojo" },
    { name: "twitter:description", content: "118 Indore internship listings, 2 with a stated stipend, and why one email to the person who runs the work beats mass applying." },
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
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };
  const pctAxis = { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => `${v}%` } };
  const labelAxis = { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } };

  // Chart 1: role groups by job title (Studojo Jobs Index, internships naming Indore, 1 to 15 Nov 2026, n=118)
  const indRolesEl = document.getElementById("indRolesChart") as HTMLCanvasElement | null;
  if (indRolesEl && !indRolesEl.dataset.rendered) {
    indRolesEl.dataset.rendered = "1";
    new Chart(indRolesEl, {
      type: "bar",
      data: {
        labels: ["Marketing (general)", "Social media", "Business development", "HR", "Digital marketing", "Content writer", "Accountant", "Graphic designer", "Finance", "Full stack developer", "Video editor", "Operations executive"],
        datasets: [{
          label: "Listings",
          data: [24, 22, 19, 11, 8, 8, 4, 3, 2, 2, 2, 1],
          backgroundColor: [VIOLET, VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET2, VIOLET3, VIOLET3, VIOLET3, INK, VIOLET3, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} of 118 listings` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED } },
          y: labelAxis,
        },
      },
    });
  }

  // Chart 2: skills named in descriptions (share of the 118 listings with a description of 200+ characters)
  const indSkillsEl = document.getElementById("indSkillsChart") as HTMLCanvasElement | null;
  if (indSkillsEl && !indSkillsEl.dataset.rendered) {
    indSkillsEl.dataset.rendered = "1";
    new Chart(indSkillsEl, {
      type: "bar",
      data: {
        labels: ["Communication skills", "Social media", "Excel", "English", "CRM tools", "SEO", "Canva", "Hindi", "Calling or telecalling", "Negotiation"],
        datasets: [{
          label: "Share of descriptions",
          data: [71.2, 48.3, 26.3, 18.6, 15.3, 12.7, 10.2, 7.6, 6.8, 6.8],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET2, VIOLET3, VIOLET3, VIOLET3, VIOLET3, VIOLET3],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of 118 descriptions` } },
        },
        scales: { x: pctAxis, y: labelAxis },
      },
    });
  }

  // Chart 3: terms named in descriptions (share of the 118 listings with a description of 200+ characters)
  const indTermsEl = document.getElementById("indTermsChart") as HTMLCanvasElement | null;
  if (indTermsEl && !indTermsEl.dataset.rendered) {
    indTermsEl.dataset.rendered = "1";
    new Chart(indTermsEl, {
      type: "bar",
      data: {
        labels: ["A certificate", "Freshers", "Targets", "Incentives", "Immediate joining", "A portfolio", "Work from home", "Work from office", "A pre-placement offer (PPO)", "Unpaid"],
        datasets: [{
          label: "Share of descriptions",
          data: [33.9, 30.5, 16.1, 15.3, 9.3, 7.6, 5.1, 4.2, 4.2, 1.7],
          backgroundColor: [VIOLET, VIOLET, VIOLET2, VIOLET2, VIOLET3, VIOLET3, VIOLET3, VIOLET3, VIOLET3, INK],
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
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of 118 descriptions` } },
        },
        scales: { x: pctAxis, y: labelAxis },
      },
    });
  }

  // Chart 4: listings that state a stipend in rupees (Studojo Jobs Index, 1 to 15 Nov 2026, n=118)
  const indPayEl = document.getElementById("indPayChart") as HTMLCanvasElement | null;
  if (indPayEl && !indPayEl.dataset.rendered) {
    indPayEl.dataset.rendered = "1";
    new Chart(indPayEl, {
      type: "doughnut",
      data: {
        labels: ["States a stipend in rupees", "Does not state a stipend in rupees"],
        datasets: [{
          data: [2, 116],
          backgroundColor: [VIOLET, VIOLET3],
          borderColor: "#fff",
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} of 118` } },
        },
      },
    });
  }

  // Chart 5: where the listings were found (Studojo Jobs Index, 1 to 15 Nov 2026, n=118)
  const indSourcesEl = document.getElementById("indSourcesChart") as HTMLCanvasElement | null;
  if (indSourcesEl && !indSourcesEl.dataset.rendered) {
    indSourcesEl.dataset.rendered = "1";
    new Chart(indSourcesEl, {
      type: "doughnut",
      data: {
        labels: ["LinkedIn", "Internshala", "Company career sites and ATS pages", "Shine", "Naukri"],
        datasets: [{
          data: [56, 37, 11, 11, 3],
          backgroundColor: [VIOLET, VIOLET2, VIOLET3, INK, MUTED],
          borderColor: "#fff",
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} of 118 listings` } },
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
`;

const FAQ = [
  {
    q: "How do I get an internship in Indore for freshers?",
    a: "Pick one role and one kind of employer, make one small piece of proof, and email the founder or team lead who would run the work. The 118 internship listings naming Indore that we counted for 1 to 15 November 2026 came from 88 different employers, mostly in marketing, social media and business development, so the decision usually sits with one person on a small team. Having no experience is normal for an internship; a specific email with real work attached is what stands out.",
  },
  {
    q: "Is there a paid internship in Indore, and how much does it pay?",
    a: "Paid internships exist, but very few listings say what they pay: only 2 of the 118 Indore internship listings posted 1 to 15 November 2026 state a stipend in rupees (Studojo Jobs Index). That is far too few to give a fair typical figure for the city, so do not trust anyone who quotes one without a sample. Ask for the monthly stipend in rupees, whether it is fixed or tied to targets, and when it is paid, and get the answer in writing before you accept.",
  },
  {
    q: "Which companies offer an internship in Indore for computer science students?",
    a: "The biggest tech employers in Indore are the IT campuses: TCS says its Indore facility employs over 10,000 professionals (People Matters, September 2025) and Infosys says Infosys Indore has more than 3,300 employees (Infosys, September 2026), with more IT firms in Crystal IT Park on Khandwa Road. Listings for tech interns are thin, though: only 2 of 118 Indore internship listings in our 1 to 15 November 2026 window carry a full stack developer title. Whether a given team takes interns is its lead's call, so show a project and write to that person directly.",
  },
  {
    q: "Where can BBA students find an internship in Indore?",
    a: "In business development, marketing, social media and HR, which make up most Indore internship listings by title. Marketing alone is 20.3% and business development 16.1% of the 118 listings we counted for 1 to 15 November 2026, and BBA is named in 5 descriptions. Write to the founder or the head of sales or marketing at a startup or agency, and attach something concrete, such as a short pitch for their product.",
  },
  {
    q: "Can I find an internship in Indore for data analyst work?",
    a: "Yes, but rarely under that title: data analyst is not among the twelve largest role groups in our 1 to 15 November 2026 Indore window. Excel, though, is named in 26.3% of the 118 descriptions, inside marketing, sales and accounting roles. Build a small analysis of a business's own public numbers and email it to the person who owns them, such as the head of marketing or a finance lead.",
  },
  {
    q: "Should I email companies directly for an internship in Indore?",
    a: "Yes, that is Studojo's position: a short, specific email to the founder or team lead who runs the work beats mass applying. An average opening draws about 242 applications and a single online application converts at roughly 0.1% to 2% (The Interview Guys, April 2026), and 17.8% of the Indore listings we counted even print an email address in the description. Send from your own email, follow up once, and do not expect a reply every time; Stu can find the right person and write the email for you.",
  },
];

export default function InternshipsIndoreReport() {
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
        "headline": "Internship in Indore 2026: What 118 Listings Show",
        "description": "What 118 internship listings naming Indore (1 to 15 November 2026, Studojo Jobs Index) show about roles, skills and stated pay, the employers behind the city, what to ask before you accept, and why emailing the founder or team lead beats mass applying.",
        "url": `${BASE_URL}/reports/internships-indore-2026`,
        "datePublished": "2026-11-18T00:00:00Z",
        "dateModified": "2026-11-18T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/internships-indore-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Internship in Indore 2026", "item": `${BASE_URL}/reports/internships-indore-2026` },
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
              <span>Internship in Indore 2026</span>
            </nav>
            <h1>Internship in Indore 2026: <em>What 118 Listings Show</em></h1>
            <p className="rpt-hero-sub">
              Looking for an internship in Indore? The listings will mostly offer you marketing, social media and sales
              work, and almost none will say what they pay. We counted 118 internship listings naming Indore, posted 1 to
              15 November 2026, in the Studojo Jobs Index, then set them against the employers the city actually runs on:
              IT campuses, the Pithampur belt, startups and two national institutes. Then the move that works.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Indore · students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">Studojo Jobs Index (n=118), company and state sources</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Updated</span>
                <span className="rpt-meta-value">18 November 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>118 internship listings naming Indore</strong> were posted 1 to 15 November 2026 in the Studojo Jobs Index, from 88 different employers. That is about 1 in every 100 India internship listings in the same window (11,528).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Marketing (20.3%), social media (18.6%) and business development (16.1%)</strong> are the three largest role groups by title. Full stack developer has 2 listings.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Only 2 of the 118 state a stipend in rupees.</strong> 40 of them (33.9%) mention a certificate. Ask what an internship pays before you say yes.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The employers are bigger than the listings.</strong> TCS says its Indore facility employs over 10,000 professionals (People Matters, September 2025), Infosys says it has more than 3,300 people in Indore (Infosys, September 2026), and the state calls Pithampur its automobile hub (Invest MP).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>The move that works: a short email to the founder or team lead who runs the work.</strong> 21 listings (17.8%) even print an email address. Stu finds the right person, verifies the work email and writes the note for you.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">118</div>
              <div className="sc-label">internship listings naming Indore, posted 1 to 15 November 2026</div>
              <div className="sc-source">Studojo Jobs Index, 17 Nov 2026 pull</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">2 of 118</div>
              <div className="sc-label">of those listings state a stipend in rupees</div>
              <div className="sc-source">Studojo Jobs Index, 1 to 15 Nov 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">10,000+</div>
              <div className="sc-label">professionals at TCS's Indore facility, per the company</div>
              <div className="sc-source">TCS via People Matters, Sep 2025</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">What the internship market in Indore looks like right now</div>
                <div className="sec-sub">118 listings, 88 employers, and a clear tilt toward marketing and sales</div>
              </div>
            </div>
            <p>Start with the size of the pool. The Studojo Jobs Index holds 118 active internship listings in India that name Indore as a city, posted between 1 and 15 November 2026, as of our 17 November pull. Across all of India the same window holds 11,528 internship listings, so Indore is about 1% of the national pool. Inside Indore, internships are 118 of the 1,176 entry-level and internship listings in the window, or 10.0%; the other 1,058 are full-time entry-level jobs.</p>
            <p>Those 118 listings come from 88 different employers, and every one of them names its employer. The ten busiest posters account for 28.0% of listings, which leaves 78 employers sharing the other 85 listings, barely more than one each. In plain words, an internship in Indore is usually offered by a team that posted once, not by a big programme with a hundred seats. Keep that in mind, because a team that posted once is run by a person you can write to.</p>
            <div className="chart-wrap">
              <div className="chart-label">Indore internship listings by role group, matched on job title (Studojo Jobs Index, 1 to 15 Nov 2026, n=118)</div>
              <div style={{ height: 380 }}>
                <canvas id="indRolesChart" />
              </div>
            </div>
            <p>The role mix is narrow. Marketing in general leads with 24 listings (20.3%), social media follows with 22 (18.6%) and business development with 19 (16.1%). HR has 11 (9.3%), digital marketing and content writing have 8 each (6.8%), and accounting has 4. Technical roles barely register: full stack developer has 2 listings, the same as video editor. Role groups are matched on the title, one title can match more than one group, and generic titles such as associate or trainee match none, so read the chart as the shape of the market, not a full count.</p>
            <p>Here are the most common titles exactly as employers wrote them. Notice how many are the same two or three jobs worded differently.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job title (as posted)</th>
                  <th>Listings</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Business Development (Sales) Internship</td><td>7</td></tr>
                <tr><td>Social Media Marketing Internship</td><td>5</td></tr>
                <tr><td>Social Media Marketing Intern</td><td>5</td></tr>
                <tr><td>Business Development Intern</td><td>3</td></tr>
                <tr><td>Digital Marketing Intern</td><td>3</td></tr>
                <tr><td>Social Media Content Creator</td><td>3</td></tr>
                <tr><td>Digital Marketing Internship</td><td>2</td></tr>
                <tr><td>Accounting Intern</td><td>2</td></tr>
                <tr><td>Sales Internship</td><td>2</td></tr>
                <tr><td>Human Resources Intern</td><td>2</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>How we counted:</strong> every Studojo Jobs Index number on this page comes from 118 active internship listings in India that name Indore, posted 1 to 15 November 2026, from our 17 November 2026 pull. Skill and term shares are counted on listings with a description of at least 200 characters, which in this window is all 118, and one listing can name several skills and several cities. For reference, the same slice for 1 to 31 October 2026 (our 11 November pull) holds 212 listings from 155 employers. One window is a full month and the other is half of one, so do not read the two as a trend. These are listings, not hires.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">What the listings ask for, for BBA, data analyst and other students</div>
                <div className="sec-sub">Skills and terms named in 118 descriptions</div>
              </div>
            </div>
            <p>Read the descriptions side by side and a pattern jumps out. Communication skills appear in 84 of 118 (71.2%), social media in 57 (48.3%) and Excel in 31 (26.3%). English is named in 22 (18.6%) and Hindi in 9 (7.6%). Sales tooling shows up too: CRM tools in 18 (15.3%), calling or telecalling in 8 and negotiation in 8. On the marketing side, SEO is named in 15 (12.7%) and Canva in 12 (10.2%).</p>
            <div className="chart-wrap">
              <div className="chart-label">Skills named in Indore internship descriptions, share of 118 listings with a description of 200+ characters (Studojo Jobs Index, 1 to 15 Nov 2026)</div>
              <div style={{ height: 340 }}>
                <canvas id="indSkillsChart" />
              </div>
            </div>
            <p><strong>For an internship in Indore for BBA students</strong>, this is good news. Business development, marketing and HR make up most of the titled roles, and the skills asked for (talking to customers, a spreadsheet, a CRM, a social account) are exactly what a BBA course touches. BBA is named in 5 descriptions (4.2%) and MBA or PGDM in 5. You will rarely see your degree in the listing; you will see the work.</p>
            <p><strong>For an internship in Indore for data analyst work</strong>, be realistic. Data analyst does not make the twelve largest role groups in this window. What the listings do ask for is Excel, in 26.3% of descriptions, inside marketing, sales and accounting roles, and GST comes up in 4. That is your door: offer a small analysis of a team's own numbers, such as campaign results or a sales pipeline, and send it to the person who owns them.</p>
            <div className="chart-wrap">
              <div className="chart-label">What Indore listings say about the internship, share of 118 descriptions naming each term (Studojo Jobs Index, 1 to 15 Nov 2026)</div>
              <div style={{ height: 340 }}>
                <canvas id="indTermsChart" />
              </div>
            </div>
            <p>Now the fine print. A certificate is mentioned in 40 listings (33.9%), freshers in 36 (30.5%), targets in 19 (16.1%) and incentives in 18 (15.3%). Immediate joining appears in 11 (9.3%), a portfolio in 9 (7.6%), a pre-placement offer in 5 (4.2%) and unpaid in 2 (1.7%). Work from home is named in 6 and work from office in 5, and only 2 listings (1.7%) are flagged remote at all, so plan on being in the city. If you are weighing remote roles instead, our <Link to="/reports/remote-internships-2026">remote internships report</Link> covers which ones are real.</p>
            <div className="highlight">
              A certificate is not a stipend. When a third of listings mention a certificate and almost none state pay, the certificate is doing the job a number should do. Treat it as a bonus, never as the deal.
            </div>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Paid internship in Indore: why so few listings state a stipend, and what to ask</div>
                <div className="sec-sub">2 of 118 name a number in rupees</div>
              </div>
            </div>
            <p>Of the 118 listings, 2 state a stipend in rupees. That is 1.7%. In the October window it was 9 of 212. A handful of numbers is not a pay survey, so we will not quote a typical Indore stipend from them, and you should be wary of anyone who does without showing their sample.</p>
            <div className="chart-wrap">
              <div className="chart-label">Indore internship listings that state a stipend in rupees (Studojo Jobs Index, 1 to 15 Nov 2026, n=118)</div>
              <div style={{ height: 240 }}>
                <canvas id="indPayChart" />
              </div>
            </div>
            <p>Why so quiet? We can only read the listings, not the minds behind them, but the listings leave clues. 16.1% mention targets and 15.3% mention incentives, which is common in sales and business development roles where pay can be partly tied to results. And most posters here put up a single listing, the kind of team that tends to settle pay person by person. None of that is a reason to accept an unknown number. It is a reason to ask early, and in writing.</p>
            <div className="blist">
              {[
                ["What is the monthly stipend in rupees, and is it fixed?", "If part of it depends on targets or incentives, ask what the fixed part is and what an intern on the team actually earned last month."],
                ["When and how is it paid?", "Monthly, by bank transfer, from the first month? Get it in the offer letter or at least in an email."],
                ["Which days, which hours, and where in Indore?", "A long daily commute changes what any stipend is worth, so ask for the office location before you agree."],
                ["Who will I report to, and what will I actually do?", "Ask for a name. If nobody can give one, the role may be a sales quota with an intern title."],
                ["Is there a letter, a certificate and a real chance of a PPO?", "5 listings in this window mention a pre-placement offer. Ask how many past interns got one."],
                ["Is there any fee?", "None of the 118 descriptions mention a registration, training or deposit fee. If anyone asks you to pay to intern, walk away."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}</strong> {detail}</span>
                </div>
              ))}
            </div>
            <div className="callout">
              <strong>The rule:</strong> no number, no yes. Asking about pay is not rude. A team that cannot answer in one line has told you something important.
            </div>
            <p>For the national picture, our <Link to="/reports/internship-stipend-india-2026">internship stipend report for India</Link> looks at what the listings that do state pay actually offer.</p>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Who actually employs people in Indore, and an internship in Indore for computer science students</div>
                <div className="sec-sub">IT campuses, the Pithampur belt, startups and two national institutes</div>
              </div>
            </div>
            <p>The listings are only the visible slice. Indore's employer base is wider and far more technical than its internship listings suggest, and that gap is where a direct email does its best work.</p>
            <p>Start on the Super Corridor. TCS and Infosys both set up SEZ units there on land from the state government (Free Press Journal, April 2022). TCS says its Indore facility employs over 10,000 professionals and is being expanded (TCS statement to People Matters, September 2025). In September 2026 Infosys opened a new 330,000 sq ft block at its Super Corridor campus and said Infosys Indore has more than 3,300 employees, naming engagement with IIT Indore, IIM Indore and Devi Ahilya Vishwavidyalaya (Infosys press release, 16 September 2026). Closer to the city, Crystal IT Park on Khandwa Road opened in 2012 as the state's first operational SEZ for IT (PTI, October 2012).</p>
            <p>That is the honest picture for an internship in Indore for computer science students: thousands of IT professionals work in the city, yet in this window only 2 listings carry a full stack developer title, BTech, BE or computer science is named in 6 descriptions (5.1%) and GitHub in 1. Whether a given IT team takes interns is a question only its lead can answer. Do not wait for a listing that may never appear; show a project and ask the person who runs the team.</p>
            <p>Then head out to Pithampur. Invest MP, the state's MPIDC investment portal, calls Pithampur Industrial Area "the automobile hub of the state", names Force Motors, VECV, Mahindra 2 Wheelers, JBM Auto and John Deere among the major players with manufacturing units in Madhya Pradesh, and lists Indore and Pithampur among the state's pharmaceutical clusters (Invest MP sector profile, accessed November 2026). For mechanical, electrical, production, quality, pharma and supply chain students, these plants are the target, and the person to write to is the plant, production or quality manager.</p>
            <p>Startups and small firms are the third pool, and the index shows them clearly: 88 employers for 118 listings. On a small team, the founder or the head of marketing or sales usually makes the call, which is why the marketing and sales listings that fill the portals are also the easiest ones to take straight to a person.</p>
            <p>Finally, the talent anchors. IIM Indore, set up in 1996, sits on Rau-Pithampur Road (IIM Indore, 2026), and IIT Indore, established by the Government of India in 2009, has a 501-acre campus at Simrol on Khandwa Road (IIT Indore, 2026). If you study at either, your faculty, alumni and seniors are a shortcut to team leads across the city. If you study elsewhere in Indore, you are competing with their students for the same teams, which is one more reason to send something specific instead of a form.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employer pool</th>
                  <th>Where</th>
                  <th>What the source says</th>
                  <th>Who to email</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>IT campuses and SEZ units</td><td>Super Corridor; Crystal IT Park, Khandwa Road</td><td>TCS: over 10,000 professionals (2025). Infosys: more than 3,300 employees (2026)</td><td>The engineering or delivery team lead</td></tr>
                <tr><td>Auto and pharma plants</td><td>Pithampur Industrial Area</td><td>"The automobile hub of the state"; a pharma cluster (Invest MP)</td><td>The plant, production or quality manager</td></tr>
                <tr><td>Startups, agencies, small firms</td><td>Across the city</td><td>88 employers posted 118 internship listings (Studojo Jobs Index)</td><td>The founder or the head of marketing or sales</td></tr>
                <tr><td>Institutes</td><td>IIM Indore (Rau-Pithampur Road); IIT Indore (Simrol)</td><td>Set up in 1996 and 2009</td><td><span className="tag-pill pill-green">Ask</span> Faculty, alumni and seniors for names</td></tr>
              </tbody>
            </table>
            <p>One practical note on getting around. In September 2026 the Indore Metro priority corridor grew from about 6 km to about 17 km, with 16 stations running from Gandhi Nagar past the Super Corridor stations to Malviya Nagar Chauraha (PTI, September 2026). Before you accept an on-site role, check how far the office is from a station or a bus route and set the daily cost against the stipend.</p>
            <div className="highlight">
              <span className="tag-pill pill-amber">The gap</span> The city's biggest employers are IT, auto and pharma. Its internship listings are mostly marketing and sales. If your field is technical, the listing you want may never be posted, so go to the team.
            </div>
            <p className="sc-source" style={{ marginTop: 12 }}>
              Sources: <a href="https://www.infosys.com/newsroom/press-releases/2026/announces-expansion-indore-dc.html">Infosys press release (16 September 2026)</a>; <a href="https://www.peoplematters.in/news/strategic-hr/exclusive-tcs-says-bhopal-office-only-shifted-not-shut-jobs-intact-43630">People Matters (17 September 2025)</a>; <a href="https://www.freepressjournal.in/amp/business/tcs-infosys-offer-80-jobs-to-mp-residents-at-indore-sezs">Free Press Journal (April 2022)</a>; <a href="https://www.governancenow.com/gov-next/egov/shivraj-singh-chouhan-inaugurates-crystal-it-park">PTI via Governance Now (October 2012)</a>; <a href="https://invest.mp.gov.in/old_portal/?p=5134">Invest MP sector profile (MPIDC, accessed November 2026)</a>; <a href="https://iimidr.ac.in/">IIM Indore (2026)</a>; <a href="https://www.iiti.ac.in/about">IIT Indore (2026)</a>; <a href="https://telanganatoday.com/indore-metro-route-to-expand-from-6-km-to-17-km-services-on-extended-stretch-from-sunday">PTI via Telangana Today (4 September 2026)</a>.
            </p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Where Indore internships are listed, and why mass applying stalls</div>
                <div className="sec-sub">LinkedIn and Internshala carry most of them</div>
              </div>
            </div>
            <p>Of the 118 listings, 56 (47.5%) were found on LinkedIn, 37 (31.4%) on Internshala, 11 (9.3%) on company career sites and applicant tracking pages, 11 (9.3%) on Shine and 3 (2.5%) on Naukri. Posting days cluster late in the week: 22 on Thursday, 30 on Friday and 24 on Saturday, so 76 of 118 (64.4%) went up Thursday to Saturday, against 4 on Sunday. Half a month is a small sample, but if you check listings once a week, the weekend is a sensible time to do it.</p>
            <div className="chart-wrap">
              <div className="chart-label">Where Indore internship listings were found (Studojo Jobs Index, 1 to 15 Nov 2026, n=118)</div>
              <div style={{ height: 260 }}>
                <canvas id="indSourcesChart" />
              </div>
            </div>
            <p>A listing tells you a team needs help. It is not where the decision gets made. Behind every portal post sits a queue: an average opening draws about 242 applications, and a single online application converts at roughly 0.1% to 2% (The Interview Guys, April 2026). The first scan of a resume takes about 6 to 7 seconds (Ladders eye-tracking study, 2018).</p>
            <p>Mass applying does not fix those odds, and auto-apply bots make them worse. Recruiters catch bot applications with hidden instructions planted in job posts, and they spot patterns such as one person applying to dozens of roles at the same company (NBC News, 17 November 2024). When most posters in a city put up a single listing, a pile of near-identical forms is easy to skip.</p>
            <p>One more clue in the data: 21 of the 118 listings (17.8%) put an email address right in the description. When a poster hands you an inbox, use it, and still look for the founder or team lead by name.</p>
          </div>

          <StuCta via="report-internships-indore-2026" place="report-mid" size="quiet" title="One short call with Stu: tell it the role, Indore and the stipend you want, and Stu finds the person hiring for each match." />

          {/* Section 6 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">6</div>
              <div>
                <div className="sec-title">The move that works for any internship in Indore for students</div>
                <div className="sec-sub">One short email to the founder or team lead who runs the work</div>
              </div>
            </div>
            <p>Here is Studojo's position, plainly. Auto-apply bots and spray-and-pray applications do not work. What works is a short, personal, specific email to the person who runs the work, sent from your own email address, with one polite follow-up. In Indore that person is the founder at a startup, the head of marketing or sales at an agency, the team lead in an IT unit, or the production or quality manager at a Pithampur plant.</p>
            <div className="blist">
              {[
                ["Pick one role and one pool", "Social media for a local brand, business development for a startup, a developer role in an IT team, quality at a Pithampur plant. One clear target makes the email specific."],
                ["Make one piece of proof", "A week of posts for a real Indore business, a short sales pitch and a prospect list, a small app on GitHub, an Excel teardown of public numbers. One slice of real work beats a line saying you are hardworking."],
                ["Find the person by name", "On the company site and LinkedIn, find the founder or the team lead who would manage you. Not a careers inbox."],
                ["Write three or four lines", "Who you are, what you made, why their team, and a small ask such as a short call. Link the proof."],
                ["Ask about the stipend early", "Once there is interest, ask the questions in section 3. Polite and direct."],
                ["Follow up once, then move on", "If there is no reply in about a week, send one short follow-up. Then write to the next team."],
              ].map(([title, detail]) => (
                <div className="blist-item" key={title as string}>
                  <div className="blist-dot" />
                  <span><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
            <p>The slow part is finding the right person and a work email that reaches them, team after team. That is the part we built Studojo to do. You start with one short call with Stu, our AI career agent, by talking or typing: tell Stu the role, Indore and the pay you want. Stu finds internships that fit you, finds who's hiring, usually the hiring manager, the head of the team or a recruiter for the role, with a verified work email, and writes a short, personal email on why you fit, from your real work. Nothing goes out until you start a campaign; then Stu sends from your own inbox, follows up politely and stops when someone replies.</p>
            <p>Talking to Stu is free, and so are your top matches every day. You pay to see every match Stu finds, and emailing the people who are hiring uses credits. Stu does not mass apply for you, and replies are not guaranteed. The point is one good email to the right person in Indore, not a hundred forms. If you are weighing full-time roles too, our <Link to="/reports/jobs-for-freshers-in-indore-2026">jobs for freshers in Indore report</Link> covers the city's entry-level jobs.</p>
            <div className="pull-quote">
              <p>Indore's listings are mostly marketing and sales; its employers are much broader. The listing tells you who needs help. The email gets you to the person who decides.</p>
              <span className="pq-source">The argument of this report, in one line</span>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">What students ask about getting an internship in Indore, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>An internship in Indore, without waiting in a queue</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>The data points to a short plan:</p>
            <div className="blist">
              {[
                ["Read the listings as a map", "118 listings from 88 employers, mostly marketing, social media and sales. Use them to spot who needs help, not as the place you win."],
                ["Never accept an unknown stipend", "2 of 118 state one. Ask for the number, fixed or variable, and the payment date, in writing."],
                ["Look past the listings", "IT campuses on the Super Corridor and Khandwa Road, plants at Pithampur and startups across the city employ far more people than the listings show."],
                ["Write to one person", "The founder, team lead or manager who runs the work. Short, specific, from your own email, one follow-up."],
                ["Let Stu do the slow parts", "Finding who hires, verifying the work email and drafting the note is what Stu does after one short call."],
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
              <Link to="/reports/how-to-get-an-internship-india-2026" className="related-card">
                <div className="rc-kicker">Internships</div>
                <div className="rc-title">How to Get an Internship in India in 2026: Where to Look, What It Pays, and the Move That Works</div>
              </Link>
              <Link to="/reports/jobs-for-freshers-in-indore-2026" className="related-card">
                <div className="rc-kicker">Indore</div>
                <div className="rc-title">Jobs for Freshers in Indore 2026: What 2,308 Listings Show</div>
              </Link>
              <Link to="/reports/internship-stipend-india-2026" className="related-card">
                <div className="rc-kicker">Stipends</div>
                <div className="rc-title">Internship Stipend in India 2026: What 385 Listings Actually Pay</div>
              </Link>
            </div>
          </div>

          <StuCta via="report-internships-indore-2026" place="report-end" size="card" title="Want an internship in Indore without waiting in a portal queue?" line="Tell Stu the role, Indore and the stipend you want in one short call. Stu finds internships that fit you, finds the founder, team lead or manager who is hiring with a verified work email, and writes a short email to them, sent from your own inbox once you start a campaign." />
        </div>
      </main>
      <Footer />
    </>
  );
}
