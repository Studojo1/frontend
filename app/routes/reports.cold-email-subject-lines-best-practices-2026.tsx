import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Cold Email Subject Lines: What Actually Gets Opened | Studojo" },
    { name: "description", content: "The best cold email subject lines in 2026: patterns that earn opens, lines that trigger instant delete, length and personalization rules, and copy-paste templates by use case." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "best cold email subject lines, cold email subject line examples, cold email open rate 2026, internship email subject line, how to write cold email subject" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/cold-email-subject-lines-best-practices-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Cold Email Subject Lines: What Actually Gets Opened" },
    { property: "og:description", content: "Best cold email subject lines in 2026: the patterns that get opened, the ones that get deleted, and templates by use case." },
    { property: "og:url", content: `${BASE_URL}/reports/cold-email-subject-lines-best-practices-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-06-16T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Cold Email Subject Lines: What Actually Gets Opened | Studojo" },
    { name: "twitter:description", content: "Cold email subject lines that actually get opened in 2026. Patterns, mistakes, and templates." },
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

  const subjectPatternChartEl = document.getElementById("subjectPatternChart") as HTMLCanvasElement | null;
  if (subjectPatternChartEl && !subjectPatternChartEl.dataset.rendered) {
    subjectPatternChartEl.dataset.rendered = "1";
    new Chart(subjectPatternChartEl, {
      type: "bar",
      data: {
        labels: ["Specific observation + topic", "Question tied to their work", "Mutual connection or event", "Plain role or topic label", "Compliment-only opener", "Urgency or hype language", "ALL CAPS or excessive punctuation"],
        datasets: [{
          label: "Relative open strength by subject pattern (illustrative index, 0 to 10)",
          data: [9.0, 8.4, 8.1, 7.2, 4.8, 3.1, 1.9],
          backgroundColor: ["#8B5CF6", "#8B5CF6", "#8B5CF6", "#a78bfa", "#f59e0b", "#ef4444", "#ef4444"],
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

  const deleteReasonChartEl = document.getElementById("deleteReasonChart") as HTMLCanvasElement | null;
  if (deleteReasonChartEl && !deleteReasonChartEl.dataset.rendered) {
    deleteReasonChartEl.dataset.rendered = "1";
    new Chart(deleteReasonChartEl, {
      type: "doughnut",
      data: {
        labels: ["Looks mass-blasted or templated", "Vague or clickbait promise", "Wrong person or irrelevant topic", "Salesy or urgent tone", "Too long to scan on mobile"],
        datasets: [{
          data: [34.0, 22.0, 20.0, 14.0, 10.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#8B5CF6", "#737373", "#171717"],
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
          legend: { position: "bottom" as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}%` } },
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

export default function Report_ColdEmailSubjectLinesBestPractices2026() {
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
        "headline": "Cold Email Subject Lines: What Actually Gets Opened",
        "description": "The best cold email subject lines in 2026: patterns that earn opens, lines that trigger instant delete, length and personalization rules, and copy-paste templates by use case.",
        "url": `${BASE_URL}/reports/cold-email-subject-lines-best-practices-2026`,
        "datePublished": "2026-06-16T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/cold-email-subject-lines-best-practices-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Cold Email Subject Lines: What Actually Gets Opened", "item": `${BASE_URL}/reports/cold-email-subject-lines-best-practices-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">{"Studojo Research · June 2026"}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{"Cold Email Subject Lines: What Actually Gets Opened"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Cold Email Subject Lines:<br /><em>What Actually Gets Opened</em>" }} />
            <p className="rpt-hero-sub">{"Most cold emails die in the inbox preview. Recipients decide in under two seconds whether a message is work, noise, or a trap. This report breaks down the subject line patterns that earn opens without sounding like marketing, the mistakes that cap reply rates before anyone reads line one, and templates you can adapt for your next send."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"Global · Students and early-career senders (internships, referrals, mentors, hiring managers)"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Behavioural / Insight"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">{"June 2026"}</span>
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
              <div className="sc-num">{"47%"}</div>
              <div className="sc-label">{"Share of professionals who say the subject line alone determines whether they open an unsolicited email"}</div>
              <div className="sc-source">{"Boomerang email behaviour survey, synthesised in Studojo framework, 2025"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"2–3×"}</div>
              <div className="sc-label">{"Typical open-rate lift when the subject contains a specific, accurate detail about the recipient versus a generic opener"}</div>
              <div className="sc-source">{"Studojo outreach signal synthesis, 2026"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"4–7"}</div>
              <div className="sc-label">{"Word count sweet spot for first-touch subjects: specific enough to signal intent, short enough to display fully on mobile"}</div>
              <div className="sc-source">{"Studojo subject line playbook, 2026"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"The subject line is a filter, not a headline"}</div>
                <div className="sec-sub">{"What recipients scan for before they decide to open"}</div>
              </div>
            </div>
            <p>{"Cold email subject lines do not need to be clever. They need to pass a fast relevance test: Is this about me? Is it work I might care about? Does it look like one human wrote to one human? Recipients triage in the preview pane, often on a phone, with half a subject visible and the first line of body text stacked underneath."}</p>
            <p>{"Opens are a means, not the goal. A subject that tricks someone into opening a generic pitch burns trust on the first read. The best subjects set honest expectations: the body delivers exactly what the subject promised, usually in the first sentence."}</p>

            <div className="chart-wrap">
              <div className="chart-label">{"Why recipients skip without opening (inbox triage themes, illustrative %)"}</div>
              <div style={{ height: 260 }}>
                <canvas id="deleteReasonChart" />
              </div>
            </div>

            <div className="highlight">{"<strong>Key insight:</strong> Write the subject as if a colleague is forwarding you context, not as if a brand is launching a campaign."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Match subject to first sentence."}</strong> {"If the subject mentions their podcast episode, line one should reference the same episode. Mismatch trains people to distrust the next message too."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Assume mobile truncation."}</strong> {"Front-load the meaningful words. \"Question on your API docs\" beats \"Quick question for you about something I saw.\""}</span>
              </div>
            </div>

            <div className="callout">{"<strong>The practical implication:</strong> Draft the subject last. Write the body first, then pull the most specific true phrase from paragraph one into four to seven words."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"The five subject patterns that consistently win opens"}</div>
                <div className="sec-sub">{"Ranked by how often they survive triage for student and early-career outreach"}</div>
              </div>
            </div>
            <p>{"Across internship asks, referral requests, and hiring manager notes, five patterns show up again and again in messages that get opened and answered. They share one trait: each could not be sent to a different person without rewriting."}</p>
            <p>{"The strongest pattern is a specific observation plus topic: \"Your post on intern pipelines\" or \"Re: your talk at SaaStr.\" Second is a tight question tied to their work: \"Who owns campus hiring at Acme?\" Third is a warm intro signal: \"Intro from Priya (IITB '24).\" Fourth is a plain label when context already exists: \"Summer PM intern question.\" Fifth, weaker but acceptable in alumni or event follow-ups: \"Met at Demo Day Thursday.\""}</p>

            <div className="highlight">{"<strong>Key insight:</strong> Specificity beats creativity. A boring accurate subject outperforms a witty vague one almost every time."}</div>

            <div className="chart-wrap">
              <div className="chart-label">{"Relative open strength by subject pattern (illustrative index, 0 to 10)"}</div>
              <div style={{ height: 320 }}>
                <canvas id="subjectPatternChart" />
              </div>
            </div>

            <div className="pull-quote">
              <p>{"\"I open almost nothing that says 'opportunity' or 'partnership.' When the subject is my product name plus a real question, I at least skim.\""}</p>
              <span className="pq-source">{"Engineering manager, fintech (Studojo community interview, 2025)"}</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Observation + topic."}</strong> {"Quote or paraphrase something they shipped, wrote, or said. \"Your Series B post\" not \"Love what you're building.\""}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"One tight question."}</strong> {"Questions work when they are answerable in one line. \"Still hiring SWE interns for July?\" beats \"Can we chat about opportunities?\""}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Social proof in the subject."}</strong> {"Use a mutual only when real: shared school, referrer name, or event. Fake familiarity is worse than no name."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Subject lines that silently cap your reply rate"}</div>
                <div className="sec-sub">{"Phrases and formats that trigger delete before open"}</div>
              </div>
            </div>
            <p>{"Some subjects are not wrong grammatically. They are wrong socially. They signal bulk send, hidden agenda, or high effort for the reader. Compliment-only openers (\"Impressed by your journey\"), hype (\"Game-changing idea\"), false urgency (\"EOD today\"), and empty curiosity (\"Quick question\") all train recipients to pattern-match you with sales spam."}</p>
            <p>{"Formatting tells matter too. ALL CAPS, emoji stacks, Re: or Fwd: when there was no prior thread, and keyword stuffing for SEO-style subjects all reduce trust. Personalization tokens that break (\"Hi {{FirstName}}\") are worse than no name."}</p>
            <p>{"Length is a secondary filter. Subjects over roughly ten words often truncate on mobile before the meaningful phrase appears. Subjects under two words (\"Hello\", \"Internship\") fail the relevance test from the other direction."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> If your subject could appear on a listicle of \"100 best cold email templates,\" rewrite it until it sounds like something you would send to one person you actually researched."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Never bait the open."}</strong> {"Subjects that promise news, funding, or a job offer you cannot deliver in line one get reported, not replied to."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Skip performative Re:."}</strong> {"Fake reply threading is a known tactic. Use \"Re:\" only when you are actually continuing a thread."}</span>
              </div>
            </div>

            <div className="callout-red">{"<strong>Red flags to delete from your drafts:</strong> \"Partnership opportunity\", \"Following up\", \"Touching base\", \"Pick your brain\", \"Synergy\", \"Revolutionary\", and any subject that does not contain a noun tied to their world."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Best subjects by use case"}</div>
                <div className="sec-sub">{"Templates to adapt, not paste"}</div>
              </div>
            </div>
            <p>{"The right subject depends on relationship temperature and channel norms. A hiring manager who posted a role publicly tolerates a direct label. A stranger at your target company needs observation or a question first. An alumni contact can carry school name in the subject if the body is short and respectful."}</p>
            <p>{"Below are patterns that work when filled with real details. Swap bracketed placeholders for one true fact each. If you cannot fill a bracket honestly, pick a different pattern."}</p>

            <div className="highlight">{"<strong>Key insight:</strong> The best template is a sentence structure, not a fixed string. Keep the skeleton, replace every noun."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Internship / role ask."}</strong> {"\"[Role] intern question\" or \"Your [team] intern posting.\" Example: \"PM intern question\" or \"Your backend intern posting.\""}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Referral request."}</strong> {"\"Intro ask re: [role] at [company]\" or \"[Referrer name] suggested I reach out.\" Name the referrer only with permission."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Hiring manager (cold)."}</strong> {"\"Question on [specific project/post]\" or \"Who owns [function] hiring?\" Tie to something they published in the last 90 days."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Mentor / advice."}</strong> {"\"[Specific topic] advice from a [year] [school] student\" or \"Your essay on [topic].\" One narrow topic, not \"career guidance.\""}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Follow-up (second touch)."}</strong> {"Add new information: \"Shipped the [project] I mentioned\" or \"Narrowing ask: internships only.\" Never \"Just bumping this\" as the whole subject."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Test subjects without spamming your network"}</div>
                <div className="sec-sub">{"Lightweight iteration for students sending at low volume"}</div>
              </div>
            </div>
            <p>{"Enterprise teams A/B test subjects at thousands of sends. Students rarely have that volume. You can still improve: keep a simple log of subject, recipient type, open if trackable, and reply. After twenty sends, patterns emerge faster than gut feel."}</p>
            <p>{"Test one variable at a time: observation vs question, with vs without referrer, four words vs seven. Do not change subject and body together or you will not know what moved the needle. When a subject earns opens but not replies, the problem moved to the body or ask, not the subject."}</p>
            <p>{"For LinkedIn InMail or connection notes, subject lines do not exist the same way. Treat the first line like a subject: same rules, same length discipline."}</p>

            <div className="highlight">{"<strong>Summary insight:</strong> Subject line craft is the highest-leverage edit in cold outreach because it is the cheapest to change and the first thing every recipient sees."}</div>

            <div className="callout-amber">{"<strong>Before you send checklist:</strong> (1) Could only this person receive this subject? (2) Does the first body sentence match? (3) Under ten words? (4) No hype, urgency, or fake Re:? (5) One clear topic noun?"}</div>
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
              <div className="blist-item" key="Draft the subject last">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Draft the subject last"}.</strong> {"Pull the most specific true phrase from your first paragraph into four to seven words. If the subject and body disagree, fix the subject."}</span>
              </div>
              <div className="blist-item" key="Use observation, question, or intro">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Use observation, question, or intro"}.</strong> {"Lead with something they did, a one-line question they can answer quickly, or a real mutual connection. Skip compliments and hype."}</span>
              </div>
              <div className="blist-item" key="Match use case to temperature">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Match use case to temperature"}.</strong> {"Plain role labels work when they posted the job. Strangers need homework in the subject. Follow-ups need new information, not \"bumping.\""}</span>
              </div>
              <div className="blist-item" key="Log and iterate in batches">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Log and iterate in batches"}.</strong> {"Track twenty sends with subject plus outcome. Change one variable at a time. Opens without replies mean fix the body next, not the subject."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Practice better subjects before you hit send"}</h3>
              <p>{"Studojo Outreach helps you draft tighter subject lines, track what earns replies, and iterate without burning your network."}</p>
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
