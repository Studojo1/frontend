import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "The AI Interview Report: One-Way Video and AI-Scored Interviews, and How to Pass Them | Studojo" },
    { name: "description", content: "AI and one-way video interviews are now a common first round. What they record, what employers review, and how to prepare so a recording doesn't cost you." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "ai interview tips, one way video interview, hirevue interview tips, how to pass ai interview, asynchronous video interview, ai interview questions for freshers" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/ai-interview-report-one-way-video-interviews-how-to-pass-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "The AI Interview Report: One-Way Video and AI-Scored Interviews, and How to Pass Them" },
    { property: "og:description", content: "More first-round interviews are now a camera, a timer and no human. What AI and one-way video interviews assess, and how to prepare so the format does not cost you the job." },
    { property: "og:url", content: `${BASE_URL}/reports/ai-interview-report-one-way-video-interviews-how-to-pass-2026` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_US" },
    { property: "article:published_time", content: "2026-11-17T00:00:00Z" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "The AI Interview Report: One-Way Video and AI-Scored Interviews, and How to Pass Them | Studojo" },
    { name: "twitter:description", content: "Your first interview might be a camera, a countdown timer and no human at all. What one-way video and AI interviews actually assess, and how to prepare for them." },
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

export default function Report_AiInterviewReportOneWayVideoInterviewsHowToPass2026() {
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
        "headline": "The AI Interview Report: One-Way Video and AI-Scored Interviews, and How to Pass Them",
        "description": "AI and one-way video interviews are now a common first round. What they record, what employers review, and how to prepare so a recording doesn't cost you.",
        "url": `${BASE_URL}/reports/ai-interview-report-one-way-video-interviews-how-to-pass-2026`,
        "datePublished": "2026-11-17T00:00:00Z",
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL,
          "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/reports/ai-interview-report-one-way-video-interviews-how-to-pass-2026` },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": "The AI Interview Report: One-Way Video and AI-Scored Interviews, and How to Pass Them", "item": `${BASE_URL}/reports/ai-interview-report-one-way-video-interviews-how-to-pass-2026` },
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
              <span>{"The AI Interview Report: One-Way Video and AI-Scored Interviews, and How to Pass Them"}</span>
            </nav>
            <h1 dangerouslySetInnerHTML={{ __html: "The AI Interview Report:<br /><em>No Interviewer, a Countdown Timer, and Your Job on the Line.</em>" }} />
            <p className="rpt-hero-sub">{"For many freshers, the first interview is now a recording: a question appears, a timer starts, and you talk to your own camera. Some platforms add AI-assisted scoring on top. These interviews feel strange, but they follow predictable rules. Here is how they work, what they assess, and how to prepare so the format does not cost you the job."}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{"India and global · Freshers and interns"}</span>
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
              <div className="sc-num">{"77%"}</div>
              <div className="sc-label">{"HR teams that use AI regularly in hiring, according to HireVue's 2026 global report, as reported"}</div>
              <div className="sc-source">{"HireVue global report 2026, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"41%"}</div>
              <div className="sc-label">{"HR teams in the same survey that fully trust AI's hiring decisions. Humans still review most outcomes"}</div>
              <div className="sc-source">{"HireVue global report 2026, as reported"}</div>
            </div>
            <div className="stat-card">
              <div className="sc-num">{"45%"}</div>
              <div className="sc-label">{"Indian BFSI firms that have adopted AI-led recruitment tools in at least one hiring process, as cited"}</div>
              <div className="sc-source">{"Deloitte India, as cited by industry coverage"}</div>
            </div>
          </div>


          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"1"}</div>
              <div>
                <div className="sec-title">{"What these interviews actually are"}</div>
                <div className="sec-sub">{"One-way video, AI interviewers and assessments"}</div>
              </div>
            </div>
            <p>{"A one-way, or asynchronous, video interview shows you a question on screen, gives you a short preparation time, then records your answer within a time limit. There is no live interviewer. Recruiters, hiring managers or software review the recordings later. Some platforms add AI-assisted features, such as transcribing answers or helping recruiters rank responses, and newer tools use a conversational AI interviewer that asks follow-up questions."}</p>
            <p>{"Employers use them because they let a small recruiting team screen many more candidates. For you, it means the first impression is a recording that can be watched, rewatched and compared."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Treat every recorded answer as if a hiring manager will watch it, because often one will."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"2"}</div>
              <div>
                <div className="sec-title">{"What they assess"}</div>
                <div className="sec-sub">{"Content first, delivery second"}</div>
              </div>
            </div>
            <p>{"Despite the myths, the most reliable way to do well is the same as in any interview: answer the question asked, with a clear structure and a real example. Reviewers, human or software-assisted, look for relevance, structure, specific evidence and clear communication. Fancy vocabulary and forced smiles do not replace a good answer."}</p>
            <p>{"Delivery still matters, mainly because poor audio, a dark room or rambling make your content harder to follow."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Focus on what you say: answer the question, use a structure, give one example. Make sure nothing about the setup gets in the way."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"3"}</div>
              <div>
                <div className="sec-title">{"Set up for the recording"}</div>
                <div className="sec-sub">{"Remove every technical distraction"}</div>
              </div>
            </div>
            <p>{"Most technical problems are avoidable with ten minutes of setup. Test everything with a practice recording before you start the real one."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Use the practice question if the platform offers one. It is the best way to learn the timer and your setup."}</div>

            <div className="blist">

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Light in front of you."}</strong> {"Face a window or lamp; never sit with a bright window behind you."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Camera at eye level."}</strong> {"Prop up your laptop or phone so you look straight ahead."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Quiet room and good audio."}</strong> {"Wired earphones with a mic often sound better than a laptop microphone."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Stable internet."}</strong> {"Close other apps and avoid starting near a data limit."}</span>
              </div>

              <div className="blist-item">
                <div className="blist-dot" />
                <span><strong>{"Clean background."}</strong> {"A plain wall is better than a busy room."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"4"}</div>
              <div>
                <div className="sec-title">{"How to answer against a timer"}</div>
                <div className="sec-sub">{"Structure for 60 to 120 seconds"}</div>
              </div>
            </div>
            <p>{"Use the preparation time to note three words: your main point, your example, and your result. Start by answering the question directly in one sentence. Spend most of the time on one specific example. End with the result and what it shows about you. If you finish early, stop. Filling time with repetition hurts more than a short, complete answer."}</p>
            <p>{"Look at the camera, not your own face on screen. If the platform allows a retake, use it only for a genuine mistake. Many platforms limit retakes, and the first answer is often the most natural."}</p>

            <div className="highlight"><strong>{"Key insight:"}</strong>{" Direct answer, one example, result. Three notes in the preparation window are enough."}</div>

            <div className="callout-amber"><strong>{"Do not read a script:"}</strong>{" Reading from notes is easy to spot on video and sounds unnatural. Bullet points are fine; full sentences are not."}</div>
          </div>

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#8B5CF6" }}>{"5"}</div>
              <div>
                <div className="sec-title">{"Practise the format, not just the answers"}</div>
                <div className="sec-sub">{"How to prepare in a weekend"}</div>
              </div>
            </div>
            <p>{"Write answers for common questions: tell me about yourself, why this role, a challenge, a teamwork example and a failure. Then record yourself answering each one against a two-minute timer on your phone and watch it back. Most people improve sharply after three or four rounds, because they see their pauses, filler words and eye contact for the first time."}</p>

            <div className="highlight"><strong>{"Summary insight:"}</strong>{" AI and video interviews reward the same thing as live ones: clear, specific answers. Practise on camera, fix your setup, and let your content do the work."}</div>
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
              <div className="blist-item" key="Assume a human will watch">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Assume a human will watch"}.</strong> {"Recordings are reviewed by recruiters and hiring managers, often with software assistance."}</span>
              </div>
              <div className="blist-item" key="Content beats tricks">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Content beats tricks"}.</strong> {"Direct answer, one real example and a result."}</span>
              </div>
              <div className="blist-item" key="Fix your setup first">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Fix your setup first"}.</strong> {"Front lighting, eye-level camera, quiet room and a practice recording."}</span>
              </div>
              <div className="blist-item" key="Practise against a timer">
                <div className="blist-dot" style={{ background: "#6d28d9" }} />
                <span style={{ color: "#3b0764" }}><strong>{"Practise against a timer"}.</strong> {"Record and rewatch your answers until they fit naturally in two minutes."}</span>
              </div>
            </div>
          </div>

          <div className="rpt-cta">
            <div className="rpt-cta-left">
              <h3>{"Get more interviews to practise on"}</h3>
              <p>{"Stu, Studojo's job agent, finds internships and early-career roles that fit you, best fit first."}</p>
            </div>
            <Link to="/b2cnew/join?via=report-ai-interview-report-one-way-video-interviews-how-to-pass-2026&how=voice" reloadDocument className="rpt-cta-btn">
              {"Let Stu find roles →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
