import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "LinkedIn Message vs Email to a Hiring Manager: Which One Actually Gets Read | Studojo" },
    { name: "description", content: "LinkedIn message vs email to a hiring manager: the 200-character note cap, InMail credit limits, LinkedIn's ban on automation, and why email wins." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "LinkedIn message vs email to hiring manager, should I message or email the hiring manager, LinkedIn InMail vs email, LinkedIn connection request to hiring manager, is it better to email or LinkedIn message a recruiter, how to contact a hiring manager" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/linkedin-message-vs-email-hiring-manager-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "LinkedIn Message vs Email to a Hiring Manager: Which One Actually Gets Read" },
    { property: "og:description", content: "Connection note limits, InMail credits, where each message lands and what LinkedIn's terms allow. Find the person on LinkedIn, then email them." },
    { property: "og:url", content: `${BASE_URL}/reports/linkedin-message-vs-email-hiring-manager-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-10-28T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "LinkedIn Message vs Email to a Hiring Manager | Studojo" },
    { name: "twitter:description", content: "200 characters, three notes a month, five InMails. Use LinkedIn to find the hiring manager and email to reach them." },
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
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const GREEN = "#10b981";
  const MUTED = "#737373";
  const INK = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };

  // Chart 1: monthly InMail credits by paid plan (LinkedIn Help Center, 2026)
  const inmailEl = document.getElementById("lveInmailChart") as HTMLCanvasElement | null;
  if (inmailEl && !inmailEl.dataset.rendered) {
    inmailEl.dataset.rendered = "1";
    new Chart(inmailEl, {
      type: "bar",
      data: {
        labels: ["Premium Career", "Premium Business", "Recruiter Lite"],
        datasets: [{
          label: "InMail credits per month",
          data: [5, 15, 30],
          backgroundColor: [VIOLET3, VIOLET2, VIOLET],
          borderRadius: 6,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} InMail credits a month` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 50, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 2: the four ways to reach a hiring manager compared (Studojo editorial rating)
  const chanEl = document.getElementById("lveChannelChart") as HTMLCanvasElement | null;
  if (chanEl && !chanEl.dataset.rendered) {
    chanEl.dataset.rendered = "1";
    new Chart(chanEl, {
      type: "bar",
      data: {
        labels: ["Connection note", "InMail", "Message to a connection", "Email from your own address"],
        datasets: [
          {
            label: "Room to make your case (1-5)",
            data: [1, 4, 4, 5],
            backgroundColor: VIOLET,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Reach without a connection or credit (1-5)",
            data: [3, 2, 1, 5],
            backgroundColor: ORANGE,
            borderRadius: 6,
            borderWidth: 0,
          },
          {
            label: "Lands where hiring work happens (1-5)",
            data: [2, 2, 3, 5],
            backgroundColor: GREEN,
            borderRadius: 6,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/5 (editorial rating)` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: INK } },
          y: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 5, ticks: { font: { size: 12 }, color: MUTED } },
        },
      },
    });
  }

  // Chart 3: how many characters you get to make your case
  const spaceEl = document.getElementById("lveSpaceChart") as HTMLCanvasElement | null;
  if (spaceEl && !spaceEl.dataset.rendered) {
    spaceEl.dataset.rendered = "1";
    new Chart(spaceEl, {
      type: "bar",
      data: {
        labels: ["Connection note (LinkedIn limit)", "3-line email (illustrative)", "5-line email (illustrative)"],
        datasets: [{
          label: "Characters",
          data: [200, 350, 600],
          backgroundColor: [RED, VIOLET2, VIOLET],
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
          tooltip: { callbacks: { label: (ctx: any) => ` About ${ctx.raw} characters` } },
        },
        scales: {
          x: { grid: gridOpts, border: { dash: [4, 4] }, min: 0, max: 700, ticks: { font: { size: 11 }, color: MUTED } },
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
  .chart-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  @media (max-width: 640px) { .chart-two { grid-template-columns: 1fr; } }

  .divider { height: 2px; background: #f0f0f0; margin: 24px 0; border-radius: 2px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  .tag-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-red { background: #fee2e2; color: #b91c1c; }
  .pill-amber { background: #fef3c6; color: #92400e; }
  .pill-green { background: #d0fae4; color: #065f46; }
  .pill-blue { background: #dbeafe; color: #1e40af; }

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
    q: "Should I message or email the hiring manager?",
    a: "Email them, after you find them on LinkedIn. A LinkedIn connection note is capped at 200 characters and a free account can personalise only three invitations a month (LinkedIn Help Center, 2026), while an email has room for a full, specific message. Use LinkedIn to find the person and check their work, then send the email from your own address.",
  },
  {
    q: "Is LinkedIn InMail better than email for reaching a hiring manager?",
    a: "No, in our view. InMail runs on paid credits, and Premium Career includes 5 a month (LinkedIn Help Center, 2026), so it is scarce and it lands in a LinkedIn inbox. Email costs no credit, has no tight length cap and lands where interview invites and offers arrive.",
  },
  {
    q: "What should a LinkedIn connection request to a hiring manager say?",
    a: "One specific reason you are connecting, in 200 characters or fewer (LinkedIn Help Center, 2026). Mention their team or recent work and who you are in a few words, and do not ask for a job in the note. Save your actual case for a short email.",
  },
  {
    q: "Is it better to email or LinkedIn message a recruiter?",
    a: "For a recruiter, a short LinkedIn message is reasonable, because finding candidates is their job. But a recruiter screens and the hiring manager decides, so if you can send only one message, email the hiring manager. Studojo finds the hiring manager or team lead for you, not a generic HR inbox.",
  },
  {
    q: "How do I contact a hiring manager?",
    a: "Find the role, find the hiring manager or team lead on LinkedIn, get a verified email address, and send five specific lines from your own address. Follow up once if you hear nothing. Studojo finds the person, verifies the email, writes a personal email for that one person and sends it from your own Gmail.",
  },
  {
    q: "Can I use a tool to automate LinkedIn messages to hiring managers?",
    a: "LinkedIn's terms ban bots and automation tools (User Agreement, section 8.2), so automating messages breaks the rules on the account you job hunt with. Automated messages also tend to be generic, which is the opposite of what gets read. Send fewer, specific emails instead.",
  },
];

export default function LinkedinMessageVsEmailReport() {
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
        "headline": "LinkedIn Message vs Email to a Hiring Manager: Which One Actually Gets Read",
        "description": "A comparison of LinkedIn connection notes, InMail and email for reaching a hiring manager: LinkedIn's published limits, where each message lands, and LinkedIn's ban on automation.",
        "url": `${BASE_URL}/reports/linkedin-message-vs-email-hiring-manager-2026`,
        "datePublished": "2026-10-28T00:00:00Z",
        "dateModified": "2026-10-28T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/linkedin-message-vs-email-hiring-manager-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "LinkedIn Message vs Email to a Hiring Manager", "item": `${BASE_URL}/reports/linkedin-message-vs-email-hiring-manager-2026` },
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
            <div className="rpt-badge">Studojo Research · October 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>LinkedIn Message vs Email</span>
            </nav>
            <h1>LinkedIn Message vs Email to a Hiring Manager: <em>Which One Actually Gets Read</em></h1>
            <p className="rpt-hero-sub">
              LinkedIn message vs email to a hiring manager: we compared the limits LinkedIn
              publishes, where each message lands and what LinkedIn's terms allow. Our answer
              is to find the person on LinkedIn, then email them.
            </p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and freshers</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Focus</span>
                <span className="rpt-meta-value">Connection notes, InMail, email</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">October 2026</span>
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
              <div className="kf-item"><span className="kf-check">✓</span><span><strong>Use LinkedIn to find the person, email to reach them.</strong> LinkedIn shows you who leads the team; email gives you room to make your case.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>A connection note is capped at <strong>200 characters</strong>, and a free account can personalise only <strong>three invitations a month</strong> (LinkedIn Help Center, 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>InMail runs on <strong>paid credits</strong>: Premium Career includes 5 a month and Premium Business 15 (LinkedIn Help Center, 2026).</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>LinkedIn's terms <strong>ban bots and automation tools</strong> (User Agreement, section 8.2), so mass-messaging tools are a bad bet.</span></div>
              <div className="kf-item"><span className="kf-check">✓</span><span>Email from your own address lands <strong>where hiring work happens</strong>. Studojo finds the hiring manager, verifies the email, writes it for that one person and sends it from your Gmail.</span></div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="stat-bar">
            <div className="stat-card">
              <div className="sc-num">200</div>
              <div className="sc-label">characters, the most a LinkedIn connection request note can hold</div>
              <div className="sc-source">LinkedIn Help Center, Personalize invitations to connect, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3</div>
              <div className="sc-label">personalised connection notes a month on a free LinkedIn account</div>
              <div className="sc-source">LinkedIn Help Center, Personalize invitations to connect, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">5</div>
              <div className="sc-label">InMail credits a month on LinkedIn Premium Career</div>
              <div className="sc-source">LinkedIn Help Center, InMail message credits, 2026</div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Should I Message or Email the Hiring Manager? The Short Answer</div>
                <div className="sec-sub">Use LinkedIn to find the person. Use email to reach them.</div>
              </div>
            </div>
            <p>The LinkedIn message vs email to a hiring manager question has a clean answer in our view: use both, for different jobs. LinkedIn is a very good map of who works where. Email is where you make your case.</p>
            <p>On LinkedIn you can see the team lead's name, their title, what their team works on and what they post about. That is exactly what you need to write something specific. But the LinkedIn message itself is boxed in: a connection note is capped at 200 characters, a free account can personalise only three invitations a month, and InMail runs on paid credits (LinkedIn Help Center, 2026).</p>
            <p>Email has none of those caps. It has room for a full message, it does not depend on the person accepting a request, and it lands where hiring work happens: interview invites, offer letters and calendar invites all arrive by email.</p>
            <div className="highlight">
              <strong>The method:</strong> find the person on LinkedIn, check their role and recent work, then send a short personal email from your own address. Studojo does the email part for you.
            </div>
          </div>

          {/* Section 2 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">LinkedIn Connection Request to a Hiring Manager: The Limits</div>
                <div className="sec-sub">200 characters, three personalised notes, and InMail credits</div>
              </div>
            </div>
            <p>Here is what LinkedIn's own Help Center says about its limits in 2026. LinkedIn changes these from time to time, so check its Help Center before you plan around them.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>What</th>
                  <th>Limit</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Connection request note</strong></td>
                  <td>Up to 200 characters</td>
                  <td>LinkedIn Help Center, Personalize invitations to connect (2026)</td>
                </tr>
                <tr>
                  <td><strong>Personalised notes, free account</strong></td>
                  <td>3 a month</td>
                  <td>Same page</td>
                </tr>
                <tr>
                  <td><strong>Personalised notes, Premium</strong></td>
                  <td>Unlimited (connection request limits still apply)</td>
                  <td>Same page</td>
                </tr>
                <tr>
                  <td><strong>InMail, Premium Career</strong></td>
                  <td>5 credits a month; unused credits build up to a maximum of 15</td>
                  <td>LinkedIn Help Center, InMail message credits (2026)</td>
                </tr>
                <tr>
                  <td><strong>InMail, Premium Business</strong></td>
                  <td>15 credits a month</td>
                  <td>Same page</td>
                </tr>
                <tr>
                  <td><strong>InMail, Recruiter Lite</strong></td>
                  <td>30 credits a month</td>
                  <td>Same page</td>
                </tr>
              </tbody>
            </table>
            <div className="chart-wrap">
              <div className="chart-label">Monthly InMail credits by paid LinkedIn plan (LinkedIn Help Center, 2026)</div>
              <div style={{ height: 260 }}>
                <canvas id="lveInmailChart" />
              </div>
            </div>
            <p>What those numbers mean for you: on a free account, 200 characters is about two short sentences, and after three personalised notes in a month you can still send requests, just without a note. On Premium Career, five InMails a month is five people. LinkedIn returns an InMail credit if the person responds within 90 days (LinkedIn Help Center, 2026), but you still start with five.</p>
            <p>None of this is a reason to pay for a plan just to reach a hiring manager. Email reaches them without credits.</p>
          </div>

          {/* Section 3 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">LinkedIn InMail vs Email: Where Each Message Lands</div>
                <div className="sec-sub">Inbox behaviour matters as much as the words</div>
              </div>
            </div>
            <p>A message is only as good as the place it lands. Here is where each option ends up, and what it costs you to get there.</p>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>Connection note.</strong> Waits in the person's invitations list, up to 200 characters. If they never accept, the conversation never starts.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>InMail.</strong> Lands in their LinkedIn inbox without a connection, but costs a credit, and Premium Career includes 5 a month.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Message to an existing connection.</strong> Free and full length, but only once they have accepted you.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>Email from your own address.</strong> Full length, no request to accept, no credit spent, and it lands in the inbox where their interview invites and offer letters already live.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">Four ways to reach a hiring manager (Studojo editorial rating, not measured data)</div>
              <div style={{ height: 300 }}>
                <canvas id="lveChannelChart" />
              </div>
            </div>
            <p>Our read, and it is an opinion, not a measurement: for most people with a job, email is the main inbox and LinkedIn is a side one. Think about where your own interview invites arrive.</p>
            <div className="callout">
              <strong>Is it better to email or LinkedIn message a recruiter?</strong> A recruiter's job is finding candidates, so a short LinkedIn message to a recruiter is reasonable. But a recruiter screens and the hiring manager decides. If you send one message, email the hiring manager.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">The Automation Trap on LinkedIn</div>
                <div className="sec-sub">Why bots and blast tools are a bad bet</div>
              </div>
            </div>
            <p>When LinkedIn's limits feel tight, the temptation is a tool that sends connection requests and messages for you. LinkedIn's terms ban bots and automation tools: its User Agreement (section 8.2) prohibits bots or other unauthorized automated methods, and software or browser add-ons that scrape or automate the service.</p>
            <p>It is also a bad bet on the merits. Recruiters already look for bot patterns, such as one person applying to dozens of roles at the same company (NBC News, 17 November 2024, quoting recruiter Mike Peditto). Mass messages read like mass messages, on any channel.</p>
            <p>The fix is not more messages. It is fewer, better ones, sent to the right person, by email.</p>
          </div>

          {/* Section 5 */}
          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">How to Contact a Hiring Manager: LinkedIn to Find, Email to Reach</div>
                <div className="sec-sub">The combined method, step by step, and the part Studojo does</div>
              </div>
            </div>
            <div className="blist">
              <div className="blist-item"><div className="blist-dot" /><span><strong>1. Find the role.</strong> Listings on LinkedIn, Naukri or Indeed tell you who is hiring.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>2. Find the person on LinkedIn.</strong> The hiring manager or team lead for that role, not a generic HR inbox. Read what their team works on.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>3. Get a verified email address.</strong> A guessed address that bounces reaches nobody. Our guide on <Link to="/reports/find-hiring-manager-email-2026">how to find a hiring manager's email</Link> covers the manual way.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>4. Write five lines for that one person.</strong> One reason tied to their work, one proof point, one small ask.</span></div>
              <div className="blist-item"><div className="blist-dot" /><span><strong>5. Send it from your own address, and follow up once.</strong> A real name in their inbox, not a platform notification.</span></div>
            </div>
            <div className="chart-wrap">
              <div className="chart-label">How many characters you get to make your case (note limit: LinkedIn Help Center, 2026; email lengths illustrative)</div>
              <div style={{ height: 220 }}>
                <canvas id="lveSpaceChart" />
              </div>
            </div>
            <p>We built Studojo to do the email part. Studojo finds the person who can actually hire you (the hiring manager or team lead, not a generic HR inbox), verifies their email address, writes a personal email for that one person based on your background and their work, and sends it from your own Gmail.</p>
            <div className="pull-quote">
              <p>"LinkedIn tells you who to write to. Email is where you write."</p>
              <span className="pq-source">The Studojo rule for reaching a hiring manager</span>
            </div>
            <p>So far: 8,500+ students signed up, 4,000+ matched with hiring managers and 28,000+ personal emails sent from students' own Gmail (Studojo's own records, September 2026). Replies are not guaranteed. A specific email to the right person gives you more room than a 200-character note waiting in a pending list.</p>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#171717" }}>?</div>
              <div>
                <div className="sec-title">Frequently Asked Questions</div>
                <div className="sec-sub">LinkedIn or email, answered directly</div>
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
                <div className="sec-sub" style={{ color: "#7c3aed" }}>How to split the work between LinkedIn and email</div>
              </div>
            </div>
            <p style={{ color: "#3b0764" }}>Give each channel the job it is good at:</p>
            <div className="blist">
              {[
                ["Map on LinkedIn", "Find the hiring manager or team lead and read what their team works on."],
                ["Skip the credit hunt", "You do not need InMail credits to reach a hiring manager."],
                ["Write the email", "Five lines: one reason tied to their work, one proof point, one small ask."],
                ["No bots", "LinkedIn's terms ban automation. A few specific messages beat a blast of generic ones."],
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
              <Link to="/reports/direct-outreach-job-search-2026" className="related-card">
                <div className="rc-kicker">Direct outreach</div>
                <div className="rc-title">The Direct Outreach Report: How People Get Hired by Writing to the Person, Not the Portal</div>
              </Link>
              <Link to="/reports/find-hiring-manager-email-2026" className="related-card">
                <div className="rc-kicker">Finding the person</div>
                <div className="rc-title">How to Find a Hiring Manager's Email</div>
              </Link>
              <Link to="/reports/linkedin-easy-apply-killing-chances-2026" className="related-card">
                <div className="rc-kicker">LinkedIn</div>
                <div className="rc-title">Why LinkedIn Easy Apply Is Killing Your Chances</div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Found them on LinkedIn? Let Studojo send the email.</h3>
              <p>Studojo finds the hiring manager, verifies their email, writes a personal email for that one person and sends it from your own Gmail.</p>
            </div>
            <Link to="/b2cnew/join?via=report-linkedin-message-vs-email-hiring-manager-2026&how=voice" reloadDocument className="rpt-cta-btn">Email hiring managers with Studojo →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
