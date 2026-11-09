import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The Group Discussion Report: Why Most Students Fail GD Rounds by Talking More | Studojo" },
    { name: "description", content: "In GD rounds, the loudest student rarely gets selected. What evaluators score, how to enter and steer a discussion, and how to prepare for GD topics in 2026." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "group discussion tips, gd round tips for placements, gd topics 2026, how to start a group discussion, gd evaluation criteria, group discussion for freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/group-discussion-report-gd-round-tips-placements-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The Group Discussion Report: Why Most Students Fail GD Rounds by Talking More" },
    { property: "og:description", content: "Most students think the GD round rewards whoever talks most. Evaluators are scoring something else. What they look for, how to enter and steer a discussion, and how to prepare." },
    { property: "og:url", content: `${BASE_URL}/reports/group-discussion-report-gd-round-tips-placements-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-18T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The Group Discussion Report: Why Most Students Fail GD Rounds by Talking More | Studojo" },
    { name: "twitter:description", content: "Students think GD rewards whoever talks most. It doesn't. Evaluators score how you move the discussion forward. What they look for, how to get in, and how to prepare for 2026 GD topics." },
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

export default function Report_GroupDiscussionReportGdRoundTipsPlacements2026() {
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
        "headline": "The Group Discussion Report: Why Most Students Fail GD Rounds by Talking More",
        "description": "In GD rounds, the loudest student rarely gets selected. What evaluators score, how to enter and steer a discussion, and how to prepare for GD topics in 2026.",
        "url": `${BASE_URL}/reports/group-discussion-report-gd-round-tips-placements-2026`,
        "datePublished": "2026-11-18T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/group-discussion-report-gd-round-tips-placements-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The Group Discussion Report: Why Most Students Fail GD Rounds by Talking More", "item": `${BASE_URL}/reports/group-discussion-report-gd-round-tips-placements-2026` },
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
              <span>{"The Group Discussion Report: Why Most Students Fail GD Rounds by Talking More"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The Group Discussion Report:<br /><em>The Loudest Student Rarely Gets Selected.</em>" }} />
            <p className="rpt-hero-sub">{"A group discussion puts 8 to 12 candidates around a topic for 15 to 20 minutes while evaluators watch. Most students treat it as a contest to speak the most. That is why so many fail it. Evaluators are usually scoring whether you add substance, listen and help the group reach somewhere. Here is what they look for and how to do it."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India · Campus placements, MBA admissions and trainee hiring"}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Report type</span>
                <span className="rpt-meta-value">{"Guide / Selection rounds"}</span>
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
              <div className="sc-num">{"8 to 12"}</div>
              <div className="sc-label">{"Typical number of candidates in a placement or admissions GD"}</div>
              <div className="sc-source">{"Common GD format in Indian campus and MBA selection"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"15 to 20 min"}</div>
              <div className="sc-label">{"Typical length of a GD, which gives each candidate only a couple of minutes of speaking time in total"}</div>
              <div className="sc-source">{"Common GD format in Indian campus and MBA selection"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"3"}</div>
              <div className="sc-label">{"Strong contributions are usually enough: an opening or framing point, a new angle with evidence, and a summary"}</div>
              <div className="sc-source">{"Studojo guidance"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What evaluators actually score"}</div>
                <div className="sec-sub">{"Substance, structure, listening and leadership"}</div>
              </div>
            </div>
            <p>{"A GD is a compressed simulation of a meeting. Evaluators want to see how you would behave in one: whether you bring useful ideas, organise your thoughts, listen to others, and help the group make progress. Speaking time matters only in that you need to contribute enough to be assessed."}</p>
            <p>{"Candidates who interrupt constantly, repeat others' points or argue for the sake of it often score lower than quieter candidates who make two or three strong, well-timed contributions."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Quality and timing of contributions beat quantity. Three strong points usually outscore ten weak ones."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Content."}</strong> {"Relevant points, facts and examples, not generic statements."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Structure."}</strong> {"Framing the topic, organising points and connecting ideas."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Listening."}</strong> {"Building on others' points and responding to what was said."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Leadership."}</strong> {"Bringing a drifting discussion back on track and including quieter members."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Communication."}</strong> {"Clear, calm and concise speaking."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"How to get into the discussion"}</div>
                <div className="sec-sub">{"Entering without fighting"}</div>
              </div>
            </div>
            <p>{"Starting the GD can earn credit, but only if your opening is strong: define the topic, suggest two or three angles to discuss, and stop. A weak or rushed opening counts against you. If someone else starts, you can still enter early with a substantive point."}</p>
            <p>{"To enter a busy discussion, wait for a natural pause, use a short bridge such as 'Building on that point' or 'I'd like to add a different angle', and make your point in under 30 seconds. If you are cut off, calmly finish your sentence once and let it go. Do not fight for the floor."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Enter early with substance, use bridges to join the conversation, and keep each contribution short."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"How to stand out without dominating"}</div>
                <div className="sec-sub">{"Moves that evaluators notice"}</div>
              </div>
            </div>
            <p>{"A few specific moves show leadership and listening at the same time. Use them when the moment fits, not as a script."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Moving the group forward is the clearest sign of leadership in a GD."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Add a new angle."}</strong> {"If the group is stuck on one side, bring in an economic, social or stakeholder perspective nobody has mentioned."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Use one fact or example."}</strong> {"A real number or case you are sure of carries more weight than opinion."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Bring in a quiet member."}</strong> {"'We haven't heard from you yet' shows leadership without dominating."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Redirect a drifting discussion."}</strong> {"'We seem to agree on X; should we look at solutions?'"}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Summarise at the end."}</strong> {"A balanced summary of the main points, if the evaluators ask for one or the group runs out of time."}</span>
              </div>
            </div>

            <div className="callout-red"><strong>{"Avoid:"}</strong>{" Shouting over others, personal attacks, rigid one-sided positions, made-up statistics and long monologues. Each one costs more than a missed chance to speak."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"Preparing for GD topics"}</div>
                <div className="sec-sub">{"Breadth, current affairs and a simple framework"}</div>
              </div>
            </div>
            <p>{"GD topics usually fall into a few types: current affairs and economy, business and technology, social issues, and abstract topics such as a single word or phrase. You cannot predict the exact topic, but you can prepare the knowledge and a way of thinking."}</p>
            <p>{"Read a newspaper's business and national pages daily for a few weeks before placements. For any topic, practise thinking through a simple framework: the economic, social, political and individual angles, plus who gains and who loses. For abstract topics, offer one interpretation and an example, then invite other views."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" A framework you can apply to any topic is more useful than memorised points on predicted topics."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Practise with a group"}</div>
                <div className="sec-sub">{"The only real preparation"}</div>
              </div>
            </div>
            <p>{"Reading about GDs does not prepare you for one. Gather five to eight friends, pick a topic, and run a 15-minute discussion with one person observing and giving feedback on content, entries, listening and summaries. Rotate the observer. Three or four sessions before placement season will make the real round feel familiar."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" GDs reward people who make a group better, not people who win the argument. Say less, say it better, and move the discussion forward."}</div>
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
              <div className="blist-item" key="Quality over quantity">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Quality over quantity"}.</strong> {"Two or three strong, well-timed points beat constant talking."}</span>
              </div>
              <div className="blist-item" key="Enter with bridges">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Enter with bridges"}.</strong> {"Build on what was said, make your point in under 30 seconds, and let others speak."}</span>
              </div>
              <div className="blist-item" key="Use a framework">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Use a framework"}.</strong> {"Economic, social, political and individual angles work for almost any topic."}</span>
              </div>
              <div className="blist-item" key="Practise in real groups">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Practise in real groups"}.</strong> {"Mock GDs with an observer are the only preparation that works."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Get to the GD round more often"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-group-discussion-report-gd-round-tips-placements-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
