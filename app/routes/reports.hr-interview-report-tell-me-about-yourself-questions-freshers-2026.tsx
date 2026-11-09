import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The HR Interview Report: 'Tell Me About Yourself' and the Questions That Quietly Decide Offers | Studojo" },
    { name: "description", content: "The HR round is where freshers lose offers they already earned. What HR checks, how to answer 'tell me about yourself', and the 10 questions to prepare." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "hr interview questions for freshers, tell me about yourself answer for freshers, why should we hire you answer, hr round tips, where do you see yourself in 5 years answer, strengths and weaknesses interview" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/hr-interview-report-tell-me-about-yourself-questions-freshers-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The HR Interview Report: 'Tell Me About Yourself' and the Questions That Quietly Decide Offers" },
    { property: "og:description", content: "Freshers treat the HR round as a formality and lose offers in it. What HR is really checking, a 60-second structure for 'tell me about yourself', and how to answer the 10 standard questions." },
    { property: "og:url", content: `${BASE_URL}/reports/hr-interview-report-tell-me-about-yourself-questions-freshers-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-14T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The HR Interview Report: 'Tell Me About Yourself' and the Questions That Quietly Decide Offers | Studojo" },
    { name: "twitter:description", content: "Freshers clear the technical round, then lose the offer in HR. What HR is actually checking, a 60-second 'tell me about yourself' structure, and answers to the 10 questions you'll definitely get." },
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

export default function Report_HrInterviewReportTellMeAboutYourselfQuestionsFreshers2026() {
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
        "headline": "The HR Interview Report: 'Tell Me About Yourself' and the Questions That Quietly Decide Offers",
        "description": "The HR round is where freshers lose offers they already earned. What HR checks, how to answer 'tell me about yourself', and the 10 questions to prepare.",
        "url": `${BASE_URL}/reports/hr-interview-report-tell-me-about-yourself-questions-freshers-2026`,
        "datePublished": "2026-11-14T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/hr-interview-report-tell-me-about-yourself-questions-freshers-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The HR Interview Report: 'Tell Me About Yourself' and the Questions That Quietly Decide Offers", "item": `${BASE_URL}/reports/hr-interview-report-tell-me-about-yourself-questions-freshers-2026` },
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
              <span>{"The HR Interview Report: 'Tell Me About Yourself' and the Questions That Quietly Decide Offers"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The HR Interview Report:<br /><em>You Cleared the Technical Round. Don't Lose It Here.</em>" }} />
            <p className="rpt-hero-sub">{"Freshers spend weeks preparing for technical rounds and five minutes for HR. Then they lose offers to answers like 'I want to learn and grow' or 'I'm a perfectionist'. HR questions sound generic, but each one checks something specific. Here is what HR is really testing, and how to answer the questions you will definitely be asked."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Freshers and interns"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Guide / Interviews"}</span>
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
              <div className="sc-num">{"60 sec"}</div>
              <div className="sc-label">{"Ideal length for 'tell me about yourself'. Long enough to show direction, short enough to keep attention"}</div>
              <div className="sc-source">{"Studojo guidance"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"4"}</div>
              <div className="sc-label">{"Things HR is checking: communication, fit, honesty and the risk you will leave"}</div>
              <div className="sc-source">{"Studojo guidance"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"10"}</div>
              <div className="sc-label">{"Standard HR questions that come up in almost every fresher interview. Prepare all of them"}</div>
              <div className="sc-source">{"Studojo guidance"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What HR is really checking"}</div>
                <div className="sec-sub">{"The four questions behind every HR question"}</div>
              </div>
            </div>
            <p>{"By the time you reach HR, someone has usually decided you can do the work. HR is checking whether hiring you is a good decision for the company. That comes down to four things: can you communicate clearly, will you fit the team and culture, are you honest, and are you likely to stay long enough to be worth training."}</p>
            <p>{"Every standard HR question maps to one of these. 'Why this company' checks whether you will stay. 'Weaknesses' checks honesty and self-awareness. 'Tell me about a conflict' checks fit. Once you see the question behind the question, the right answer becomes obvious."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" HR is not testing knowledge. It is testing risk. Every answer should lower the perceived risk of hiring you."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"'Tell me about yourself' in 60 seconds"}</div>
                <div className="sec-sub">{"Present, past, future"}</div>
              </div>
            </div>
            <p>{"Do not recite your resume, and do not start with your family or hometown unless it connects to the role. Use three parts. Present: who you are now in one line. Past: two specific things you have done that relate to this role. Future: why this role is the logical next step."}</p>
            <p>{"Example: 'I'm a final-year BCom student focused on financial analysis. Last summer I interned with a fintech startup, where I built the Excel model they used for monthly reporting, and I led our college finance club's equity research team. I'm applying here because your analyst programme is where I can turn that into a career in corporate finance.'"}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" End 'tell me about yourself' by pointing at the role. It answers the next question before it is asked."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"The 10 questions to prepare"}</div>
                <div className="sec-sub">{"What each one is testing, and a strong approach"}</div>
              </div>
            </div>
            <p>{"Prepare a short, specific answer to each of these. Specific means a real example with a result, not an adjective."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" One real example beats three adjectives. 'I'm hardworking' is a claim. 'I finished the project two days early' is evidence."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"1. Why should we hire you?"}</strong> {"Match two of your strengths to two things the role needs, with one example."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"2. Why this company?"}</strong> {"Name something specific: a product, a programme, a value. Generic praise signals you will leave."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"3. What are your strengths?"}</strong> {"Pick one relevant strength and prove it with an example."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"4. What is your weakness?"}</strong> {"A real, non-critical weakness and what you are doing about it. Never 'I'm a perfectionist'."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"5. Where do you see yourself in five years?"}</strong> {"Growing in this field, with more responsibility. Not 'doing an MBA' or 'starting my own company'."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"6. Tell me about a challenge you faced."}</strong> {"Situation, what you did, and the result. Keep the focus on your actions."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"7. Tell me about a conflict in a team."}</strong> {"Show you listened, found common ground and delivered. Never blame teammates."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"8. Are you willing to relocate or work shifts?"}</strong> {"Answer honestly. A yes you later retract is worse than a clear no."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"9. Do you have other offers?"}</strong> {"Be honest and positive about this company."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"10. Do you have any questions for us?"}</strong> {"Always ask one or two: what success looks like in the first three months, or how the team works."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Answers that quietly kill offers"}</div>
                <div className="sec-sub">{"Common fresher mistakes"}</div>
              </div>
            </div>
            <p>{"Most HR rejections come from a handful of avoidable answers. They signal that you are likely to leave, have not researched the company, or are not being straight."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Anything that suggests you see this job as a stopgap, such as higher studies plans or exam preparation, raises a red flag in HR."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"'I want to learn and grow.'"}</strong> {"Everyone says it. Say what specifically you want to learn and why here."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Mentioning higher studies or exam plans."}</strong> {"Signals you will leave soon after training."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Criticising your college, professors or previous internship."}</strong> {"Signals how you will talk about this company."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Knowing nothing about the company."}</strong> {"Spend 15 minutes on their website and recent news before every interview."}</span>
              </div>
            </div>

            <div className="callout-amber"><strong>{"Be honest about the bond and notice terms:"}</strong>{" If HR asks whether you accept a service agreement, relocation or shift work, answer truthfully. Agreeing now and backing out later can cost you the offer and your reputation with the placement cell."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"How to prepare in one evening"}</div>
                <div className="sec-sub">{"A practical routine"}</div>
              </div>
            </div>
            <p>{"Write your 60-second introduction and say it out loud until it sounds natural. Write one real example for strengths, a challenge, a conflict and a failure; these four stories can answer most behavioural questions. Read the company's website, recent news and the job description. Then do one mock interview with a friend or record yourself and watch it back."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" The HR round decides whether a company wants to invest in you. Clear, honest, specific answers make that an easy yes."}</div>
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
              <div className="blist-item" key="Answer the question behind the question">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Answer the question behind the question"}.</strong> {"HR is checking communication, fit, honesty and the risk you will leave."}</span>
              </div>
              <div className="blist-item" key="Use present, past, future">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Use present, past, future"}.</strong> {"A 60-second introduction that ends by pointing at the role."}</span>
              </div>
              <div className="blist-item" key="Prepare four real stories">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Prepare four real stories"}.</strong> {"Strength, challenge, conflict and failure answer most behavioural questions."}</span>
              </div>
              <div className="blist-item" key="Never signal you will leave">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Never signal you will leave"}.</strong> {"Leave higher studies and exam plans out of HR interviews."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Get interview-ready with a stronger profile"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-hr-interview-report-tell-me-about-yourself-questions-freshers-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
