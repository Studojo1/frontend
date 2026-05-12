import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Cold Outreach: What Actually Gets a Reply | Studojo" },
    { name: "description", content: "What drives replies to cold email and DMs in 2026: message structure, relevance signals, follow-up discipline, and the mistakes that silently cap response rates for students and early-career senders." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "cold email reply rate 2026, how to cold email hiring manager, cold outreach that works, cold DM LinkedIn tips, follow up email template student" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/cold-outreach-what-gets-reply-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Cold Outreach: What Actually Gets a Reply" },
    { property: "og:description", content: "Cold outreach in 2026: the signals that earn replies, what kills them, and a practical checklist before you hit send." },
    { property: "og:url", content: `${BASE_URL}/reports/cold-outreach-what-gets-reply-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-05-12T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Cold Outreach: What Actually Gets a Reply | Studojo" },
    { name: "twitter:description", content: "Cold outreach: what actually gets a reply in 2026 — relevance, one ask, and follow-ups without spam." },
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

  const replyFactorChartEl = document.getElementById("replyFactorChart") as HTMLCanvasElement | null;
  if (replyFactorChartEl && !replyFactorChartEl.dataset.rendered) {
    replyFactorChartEl.dataset.rendered = "1";
    new Chart(replyFactorChartEl, {
      type: "bar",
      data: {
        labels: ["Specific relevance to their recent work", "One clear, low-friction ask", "Proof you are a real person (signal, not flex)", "Short length and scannable structure", "Correct recipient and role fit", "Subject line that matches the body"],
        datasets: [{
          label: "Relative strength of reply signals (illustrative index, 0 to 10)",
          data: [9.1, 8.6, 7.8, 7.4, 8.9, 6.5],
          backgroundColor: ["#8B5CF6", "#8B5CF6", "#8B5CF6", "#a78bfa", "#8B5CF6", "#c4b5fd"],
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

  const ignoreReasonChartEl = document.getElementById("ignoreReasonChart") as HTMLCanvasElement | null;
  if (ignoreReasonChartEl && !ignoreReasonChartEl.dataset.rendered) {
    ignoreReasonChartEl.dataset.rendered = "1";
    new Chart(ignoreReasonChartEl, {
      type: "doughnut",
      data: {
        labels: ["Looks mass-sent or templated", "Wrong person or irrelevant topic", "Too long before the point", "Vague or multiple asks", "Tone feels entitled or transactional"],
        datasets: [{
          data: [32.0, 24.0, 18.0, 16.0, 10.0],
          backgroundColor: ["#ef4444", "#f59e0b", "#737373", "#8B5CF6", "#171717"],
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

export default function Report_ColdOutreachWhatGetsReply2026() {
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
        "headline": "Cold Outreach: What Actually Gets a Reply",
        "description": "What drives replies to cold email and DMs in 2026: message structure, relevance signals, follow-up discipline, and the mistakes that silently cap response rates for students and early-career senders.",
        "url": `${BASE_URL}/reports/cold-outreach-what-gets-reply-2026`,
        "datePublished": "2026-05-12T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/cold-outreach-what-gets-reply-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "Cold Outreach: What Actually Gets a Reply", "item": `${BASE_URL}/reports/cold-outreach-what-gets-reply-2026` },
        ],
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · May 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Cold Outreach: What Actually Gets a Reply</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "Cold Outreach:<br /><em>What Actually Gets a Reply</em>" }} />
            <p className="rpt-hero-sub">Reply rates stay low by default. The gap between ignored and answered usually comes down to a handful of behaviours: proving you chose this person on purpose, making one small decision easy for them, and avoiding the template tells that trigger instant delete. This report turns those patterns into a checklist you can use before every send.</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">Global · Students and early-career outreach (internships, referrals, mentors, hiring managers)</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">Behavioural / Insight</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Published</span>
                <span className="rpt-meta-value">May 2026</span>
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
              <div className="sc-num">~1–3%</div>
              <div className="sc-label">Typical cold email reply band for unsolicited first touches in noisy inboxes when relevance and timing are weak</div>
              <div className="sc-source">Industry outreach benchmarks, synthesised in Studojo framework, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">3–5×</div>
              <div className="sc-label">Illustrative lift in positive replies when the first paragraph contains a specific, accurate observation about the recipient's work versus a generic compliment</div>
              <div className="sc-source">Studojo outreach signal synthesis, 2026</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">1 ask</div>
              <div className="sc-label">Maximum number of distinct requests that should appear in a first cold message if you want a clear yes, no, or forward</div>
              <div className="sc-source">Studojo outreach playbook, 2026</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>1</div>
              <div>
                <div className="sec-title">The first filter is not politeness — it is triage</div>
                <div className="sec-sub">Why most cold outreach dies before anyone forms an opinion about you</div>
              </div>
            </div>
            <p>Busy people do not evaluate cold messages on fairness. They sort them the way spam filters do: pattern match for risk, effort, and relevance in a few seconds. A message that opens with a generic compliment, a wall of biography, or a subject line that could apply to five hundred companies already signals "this will cost me time" before they reach your ask.</p>
            <p>That does not mean cold outreach is rude or doomed. It means the burden of proof sits on the sender. Your job in the first lines is to show that this message exists because of something they did, said, or shipped — not because you need a favour from someone with their job title.</p>

            <div className="chart-wrap">
              <div className="chart-label">Why cold messages get ignored (recipient-side themes, illustrative %)</div>
              <div style={{ height: 260 }}>
                <canvas id="ignoreReasonChart" />
              </div>
            </div>

            <div className="highlight"><strong>Key insight:</strong> Recipients do not owe you a careful read. They owe their calendar to the people and problems already in motion. Your first paragraph should answer "why me, why now" in language that could not be pasted into another thread without rewriting.</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Delete the throat-clearing.</strong> Lead with the specific hook (their post, release, talk, team mandate). Move your name and school to where it supports credibility for the ask, not where it substitutes for relevance.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Assume skimming.</strong> Short paragraphs, one idea each, and a subject line that matches the first sentence reduce cognitive load. Long blocks read as high effort for them before they know if you are worth it.</span>
              </div>
            </div>

            <div className="callout"><strong>The practical implication:</strong> Before you send, replace every sentence that could apply to another company or another person. If you cannot, delete it or rewrite until you can.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>2</div>
              <div>
                <div className="sec-title">Opens are cheap; replies require a reason</div>
                <div className="sec-sub">Subject lines, previews, and the difference between curiosity and commitment</div>
              </div>
            </div>
            <p>A clever subject line can lift opens, but opens are not the goal. The preview text and first sentence still have to pass the "is this work for me?" test. Clickbait subjects that overpromise relative to the body train people to distrust the next message too.</p>
            <p>What works more reliably is plain specificity: three to seven words that signal the topic and the human behind it. Pair that with a first line that contains a concrete observation — not flattery — so the reader knows you did homework instead of mail merge.</p>

            <div className="highlight"><strong>Key insight:</strong> The subject and first line should read like a colleague forwarding context, not like marketing copy.</div>

            <div className="pull-quote">
              <p>"I stopped replying when the first line could have been sent to fifty people. When someone quoted our launch post back to me with a real question, I answered even if I had to say no."</p>
              <span className="pq-source">Product lead, B2B SaaS (Studojo community interview, 2025)</span>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Avoid performative gratitude.</strong> "I hope you are well" and "I know you are busy" burn space without information. Politeness is fine; filler is not.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Match the channel.</strong> LinkedIn DMs, email, and alumni inboxes each have different norms. Shorter in chat, slightly more room in email — but never confuse length with seriousness.</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>3</div>
              <div>
                <div className="sec-title">The reply-winning body is one decision, not a pitch deck</div>
                <div className="sec-sub">Specificity, credibility, and a single ask that fits the relationship temperature</div>
              </div>
            </div>
            <p>The messages that get answered usually contain three things in order: proof you chose them, proof you can be trusted with a small amount of attention, and one ask that can be resolved in under two minutes — a yes, a no, a forward, or a pointer to the right person.</p>
            <p>Stacking multiple requests ("Can you review my resume, intro me to three people, and tell me if you are hiring?") guarantees deferral or silence because there is no obvious first step. The same applies to attaching large files unprompted or asking for a call without stating why a call beats async for them.</p>
            <p>Credibility is not the same as a long CV paragraph. One crisp line of proof — a project, a metric, a course output, a shared affiliation — is enough if it connects directly to the ask.</p>

            <div className="highlight"><strong>Key insight:</strong> The easiest reply is often "not me, try X" or "not now." Make it psychologically safe to say no; people avoid messages that feel like traps.</div>

            <div className="chart-wrap">
              <div className="chart-label">Relative strength of reply signals (illustrative index, 0 to 10)</div>
              <div style={{ height: 300 }}>
                <canvas id="replyFactorChart" />
              </div>
            </div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>One ask, one thread.</strong> If you need two things, sequence them across replies once there is consent and momentum — not in the opener.</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>Show homework without performing it.</strong> One accurate detail beats three shallow ones. Mispronouncing the product, wrong funding stage, or stale role title is worse than saying less.</span>
              </div>
            </div>

            <div className="callout-amber"><strong>The practical implication:</strong> Ask for the smallest next step that still moves you forward: a five-word referral direction, a policy clarification, or permission to send a two-bullet summary they can skim on mobile.</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>4</div>
              <div>
                <div className="sec-title">Follow-up without becoming noise</div>
                <div className="sec-sub">Timing, tone, and when to stop</div>
              </div>
            </div>
            <p>Polite follow-ups can recover real replies when the first message arrived during travel, quarter close, or parental leave. The line between persistence and pestering is crossed when each bump adds no new information, escalates guilt, or shortens the interval until it feels like a bot sequence.</p>
            <p>A useful follow-up does one of three things: adds a single new fact ("I shipped the demo I mentioned"), narrows the ask ("If hiring is frozen, who owns internships?"), or offers an graceful out ("If this is not on your plate, feel free to ignore — thanks for the work you publish on X").</p>
            <p>After two or three well-spaced, substantive touches with no signal, move on. Silence is data. Burning the contact with "just bumping this" six times closes doors for the next opportunity too.</p>

            <div className="highlight"><strong>Summary insight:</strong> Reply rates rise when you optimise for respect and clarity at every stage — not when you optimise for maximum sends per week.</div>
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
              <div className="blist-item" key="Run the "paste test" before send">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Run the "paste test" before send.</strong> If any paragraph could be sent to another person with zero edits, rewrite until at least one sentence contains a detail only true for this recipient and this week.</span>
              </div>
              <div className="blist-item" key="Design for a two-minute reply">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Design for a two-minute reply.</strong> One ask, minimal attachments, and a default that lets them forward or decline without writing an essay. Make the next step obvious in the last line.</span>
              </div>
              <div className="blist-item" key="Follow up with new information, not new pressure">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>Follow up with new information, not new pressure.</strong> One or two spaced follow-ups that add context or narrow the ask outperform rapid bumps. If still silence, preserve the relationship and move channels or target.</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>Turn outreach into structured practice, not guesswork</h3>
              <p>Studojo helps you draft tighter asks, keep track of who you contacted, and iterate on what earns replies — without spamming your network.</p>
            </div>
            <Link to="/outreach" className="rpt-cta-btn">
              Try Studojo Outreach →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
