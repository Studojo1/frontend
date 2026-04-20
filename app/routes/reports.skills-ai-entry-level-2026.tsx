import { useEffect } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

export function meta() {
  return [
    { title: "Breaking Into AI in 2026: The Skills, Roles and Hiring Reality for Entry-Level Candidates | Studojo" },
    { name: "description", content: "The entry-level AI job market in 2026 is real but misunderstood. Python + SQL is the floor. Most roles are about deploying AI, not building it. Here is the exact skill stack, top roles, salaries, and portfolio signals that get callbacks." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "entry level AI jobs 2026, AI skills for beginners, machine learning entry level, AI internship skills, how to get an AI job, prompt engineer skills, mlops entry level, AI job market 2026" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/skills-ai-entry-level-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Breaking Into AI in 2026: The Skills, Roles and Hiring Reality for Entry-Level Candidates" },
    { property: "og:description", content: "Python + SQL is the floor. Most AI roles are about deploying, not building. Here is the exact skill stack, top entry-level roles, salaries, and portfolio signals that actually get callbacks." },
    { property: "og:url", content: "https://studojo.com/reports/skills-ai-entry-level-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Breaking Into AI in 2026: Skills and Roles That Actually Get You Hired | Studojo" },
    { name: "twitter:description", content: "Python + SQL is the floor. Most AI roles are about deploying AI, not building models. The exact skills, roles, and portfolio signals for entry-level AI jobs in 2026." },
    { name: "twitter:image", content: "https://studojo.com/og-reports.png" },
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

  const BLUE = "#3b82f6";
  const BLUE2 = "#60a5fa";
  const BLUE3 = "#93c5fd";
  const GREEN = "#10b981";
  const RED = "#ef4444";
  const AMBER = "#f59e0b";
  const MUTED = "#737373";
  const INK = "#171717";
  const grid = { color: "#f0f0ee", lineWidth: 1 };

  function make(id: string, config: any) {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = "1";
    new Chart(el, config);
  }

  // Chart 1: Skills frequency in entry-level AI job postings (%)
  make("skillsChart", {
    type: "bar",
    data: {
      labels: ["Python", "Git /\nversion control", "SQL", "Statistics /\nprobability", "Cloud\n(AWS/GCP/Azure)", "PyTorch /\nTensorFlow", "LLM APIs /\nHuggingFace", "Data viz\n(Tableau/BI)", "Docker /\nMLOps basics", "Prompt\nengineering"],
      datasets: [{
        label: "% of entry-level AI job postings mentioning this skill",
        data: [94, 88, 78, 76, 68, 65, 52, 48, 42, 38],
        backgroundColor: [BLUE, BLUE, BLUE, BLUE2, BLUE2, BLUE2, BLUE3, BLUE3, BLUE3, BLUE3],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw}% of job postings` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 100, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "%" } },
      },
    },
  });

  // Chart 2: Entry-level AI role salaries (US, USD annual)
  make("rolesChart", {
    type: "bar",
    data: {
      labels: ["AI Research\nAssistant", "AI Data\nAnalyst", "Prompt\nEngineer", "ML Engineer\n(entry)", "AI Product\nManager", "MLOps\nEngineer"],
      datasets: [
        { label: "Salary low (USD)", data: [50000, 68000, 72000, 92000, 85000, 85000], backgroundColor: BLUE3, borderRadius: 4, borderWidth: 0 },
        { label: "Salary high (USD)", data: [75000, 98000, 108000, 135000, 120000, 130000], backgroundColor: BLUE, borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 12 }, boxWidth: 14, padding: 20 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}/yr` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => "$" + (v / 1000) + "k" } },
      },
    },
  });

  // Chart 3: AI hiring concentration by city/region (index, US = 100)
  make("geoChart", {
    type: "bar",
    data: {
      labels: ["London\n(UK)", "Singapore", "Bengaluru\n(India)", "Berlin /\nMunich", "NYC\n(US)", "Seattle\n(US)", "NYC /\nBoston", "San Francisco\n(US)"],
      datasets: [{
        label: "Relative AI job posting density (SF Bay = 100)",
        data: [18, 20, 22, 24, 48, 54, 50, 100],
        backgroundColor: [BLUE3, BLUE3, BLUE3, BLUE3, BLUE2, BLUE2, BLUE2, BLUE],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Index: ${ctx.raw} (SF Bay = 100)` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v } },
      },
    },
  });

  // Chart 4: Builder vs Wrapper vs Analyst - which path is most accessible
  make("pathChart", {
    type: "doughnut",
    data: {
      labels: ["AI Application / Wrapper roles (use LLM APIs, build products)", "AI Analyst / BI roles (data, insights, AI-assisted analysis)", "Core ML / Model building roles (training, research, fine-tuning)", "MLOps / Infrastructure roles (deployment, pipelines, monitoring)"],
      datasets: [{
        data: [42, 31, 17, 10],
        backgroundColor: [BLUE, BLUE2, BLUE3, "#1d4ed8"],
        borderWidth: 2,
        borderColor: "#fff",
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 11 }, padding: 16, boxWidth: 14 } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}% of entry-level AI postings` } },
      },
    },
  });

  // Chart 5: Portfolio signals that get callbacks (ranked by hiring manager survey weight)
  make("portfolioChart", {
    type: "bar",
    data: {
      labels: ["Deployed\nproject (live URL)", "Kaggle\nmedal / top 10%", "Open source\ncontribution", "Research paper\n(even pre-print)", "GitHub with\nregular commits", "Relevant\ncertification", "Personal\nblog/writeups", "Hackathon\nwinner"],
      datasets: [{
        label: "Hiring manager weight score (1-10)",
        data: [9.2, 8.8, 8.5, 8.1, 7.4, 4.2, 5.8, 6.9],
        backgroundColor: [BLUE, BLUE, BLUE, BLUE, BLUE2, BLUE3, BLUE3, BLUE2],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` Score: ${ctx.raw}/10` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: MUTED } },
        y: { grid, border: { dash: [4, 4] }, min: 0, max: 10, ticks: { font: { size: 11 }, color: MUTED, callback: (v: any) => v + "/10" } },
      },
    },
  });
}

export default function AISkillsReport() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Chart) { initCharts(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    s.onload = () => initCharts();
    document.head.appendChild(s);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Breaking Into AI in 2026: The Skills, Roles and Hiring Reality for Entry-Level Candidates", "description": "The entry-level AI job market in 2026 is real but misunderstood. Python + SQL is the floor. Most roles are about deploying AI, not building it. Here is the exact skill stack, top roles, salaries, and portfolio signals that get callbacks.", "url": "https://studojo.com/reports/skills-ai-entry-level-2026", "datePublished": "2026-04-20T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/skills-ai-entry-level-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Breaking Into AI 2026", "item": "https://studojo.com/reports/skills-ai-entry-level-2026"}]}` }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: rptCSS }} />
      <main>

        {/* Hero */}
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Market Analysis · Q2 2026</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>Breaking Into AI 2026</span>
            </nav>
            <h1 className="rpt-h1">Breaking Into AI in 2026:<br /><em>What You Actually Need</em></h1>
            <p className="rpt-hero-sub">
              The entry-level AI job market is real and growing fast. But most students are preparing for the wrong version of it. 94% of postings want Python. Most roles are about deploying AI, not training it. And a live project beats a certificate every time.
            </p>
            <div className="rpt-hero-stats">
              <div className="rpt-hero-stat"><div className="rpt-hval">94%</div><div className="rpt-hlbl">Of entry-level AI job postings require Python (Burning Glass / LinkedIn Jobs, 2025)</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">42%</div><div className="rpt-hlbl">Of entry-level AI roles are application/wrapper roles - not core model building</div></div>
              <div className="rpt-hero-stat"><div className="rpt-hval">8 findings</div><div className="rpt-hlbl">Skills, roles, salaries, portfolio signals, and where the jobs actually are</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="rpt-cta-strip">
          <div className="rpt-cta-strip-inner">
            <span className="rpt-cta-strip-text">Looking for AI internships and entry-level roles?</span>
            <Link to="/dojos/internships" className="rpt-cta-pill">Find AI Roles on Studojo →</Link>
          </div>
        </div>

        <div className="rpt-content">

          {/* Finding 1 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 01</span>
              <h2 className="rpt-h2">Most entry-level AI jobs are not about building models. 42% are application roles. Knowing this changes how you prepare.</h2>
              <p className="rpt-lead">Students spend months learning to train neural networks. Most entry-level AI jobs do not require this. Understanding the three distinct tracks in the AI job market lets you prepare for the one that fits your skills.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Estimated breakdown of entry-level AI roles by type (based on job posting analysis, Lightcast / LinkedIn, 2025-26)</div>
              <div className="rpt-chart-wrap" style={{ height: 320 }}><canvas id="pathChart"></canvas></div>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">The three tracks</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      ["AI Application / Wrapper (42%)", "Build products using LLM APIs (OpenAI, Anthropic, Gemini). Integrate AI into existing software. Ship AI-powered features. Skills: Python, API integration, prompt engineering, basic backend. Does NOT require ML theory."],
                      ["AI Analyst / BI (31%)", "Use AI tools to analyse data and produce insights. Build AI-assisted dashboards. Write queries, interpret model outputs. Skills: SQL, Python, Tableau/BI, statistics. ML knowledge helpful but not required."],
                      ["Core ML / Model Building (17%)", "Train, fine-tune, or evaluate models. Requires solid ML theory, PyTorch/TensorFlow, linear algebra and calculus. PhD or strong research background increasingly expected at top firms."],
                      ["MLOps / Infrastructure (10%)", "Deploy models to production, build pipelines, monitor drift. Requires DevOps + ML knowledge: Docker, Kubernetes, CI/CD, cloud platforms. Often overlooked but well-paid and less competitive."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 6 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.55, marginTop: 2 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Which track suits you</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["I code but have no ML background", "Application/Wrapper track. Learn Python + API integrations + prompt engineering. Ship something in 4 weeks."],
                      ["I work with data but not code heavily", "AI Analyst track. SQL + Python + a BI tool. AI is changing this role fast and demand is high."],
                      ["I have a CS/stats background and want to go deep", "Core ML track. PyTorch + linear algebra + a strong GitHub is the starting point. Entry is harder but ceiling is highest."],
                      ["I like systems and infrastructure", "MLOps track. DevOps skills + ML awareness. Extremely in demand and undersupplied at entry level."],
                    ].map(([profile, advice]) => (
                      <div key={profile as string} style={{ borderLeft: "3px solid #3b82f6", paddingLeft: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" as const, letterSpacing: 1 }}>{profile}</div>
                        <div style={{ fontSize: 14, color: "#525252", marginTop: 2, lineHeight: 1.55 }}>{advice}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="rpt-prose">The single biggest mistake students make is treating "AI jobs" as one category. A prompt engineer at a Series B startup and an ML research engineer at Google DeepMind require almost entirely different preparation. <strong>The Application and Analyst tracks are significantly more accessible at entry level and represent nearly three quarters of all postings.</strong> If you are starting from scratch, these are the tracks with the shortest path from zero to hired.</p>
            <p className="rpt-source">Source: Burning Glass Technologies AI skills demand report 2025, LinkedIn Jobs AI category analysis Q4 2025, World Economic Forum Future of Jobs Report 2025, OECD AI in the labour market 2025</p>
          </div>

          {/* Finding 2 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 02</span>
              <h2 className="rpt-h2">Python appears in 94% of AI postings. SQL in 78%. Git in 88%. These three are the non-negotiable floor. Without them, most ATS systems filter you before a human sees your resume.</h2>
              <p className="rpt-lead">Before worrying about which ML framework to learn, verify you have solid command of the three universal prerequisites. Missing any one of them disqualifies you from the majority of postings before screening begins.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Approximate skill frequency in entry-level AI job postings (based on job posting analysis, Stack Overflow / LinkedIn / Lightcast, 2025-26)</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="skillsChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">Python</div><div className="rpt-lbl">Required in the vast majority of AI postings. Depth matters: not just scripts. Data manipulation with Pandas, working with APIs, writing clean, readable functions. The bare minimum is 3 months of daily coding practice.</div></div>
              <div className="rpt-stat"><div className="rpt-val">SQL</div><div className="rpt-lbl">Cited across most data-adjacent AI postings. Joins, aggregations, window functions, subqueries. Most data work in AI roles happens upstream of any model. If you cannot query data, you cannot do the job.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">Git</div><div className="rpt-lbl">Expected in nearly all technical AI postings. Branches, pull requests, commit messages. A GitHub profile with consistent green squares is visible evidence of practice. An empty GitHub is a red flag to most technical interviewers.</div></div>
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">What "knowing Python" actually means to a hiring manager</div>
              <p>Many students list Python on their resume after completing one online course. Interviewers test this. The threshold is: can you write a script from scratch to clean a dataset, call an API, handle errors, and output a structured file - without Googling the basic syntax. If you need to look up how to open a file or write a for loop, you are not at the required level. The Pandas + requests + JSON trio is the practical entry point. Get to where you can build something small from a blank file in under an hour.</p>
            </div>

            <div className="rpt-two-col" style={{ marginTop: 20 }}>
              <div>
                <div className="rpt-col-head">Core ML / Research track additions</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["PyTorch (preferred over TensorFlow)", "Leads TensorFlow in ML postings (37.7% vs 32.9% of framework-specific listings; 85% of deep learning research papers). PyTorch dominates research and most production ML."],
                      ["Linear algebra + calculus basics", "Not tested directly but essential for understanding models. 3Blue1Brown Essence series is the fastest path."],
                      ["Statistics and probability", "Frequently required in data-adjacent AI roles. Distributions, hypothesis testing, Bayes theorem, confidence intervals."],
                      ["A Kaggle competition (top 20%)", "Public evidence of applied ML. More credible than any course certificate."],
                    ].map(([skill, note]) => (
                      <div key={skill as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{skill}</div>
                          <div style={{ fontSize: 14, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Application / Wrapper track additions</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["OpenAI / Anthropic / Gemini API", "Build things that use LLM outputs. Chain prompts. Handle rate limits and errors. This is the hands-on minimum."],
                      ["LangChain or LlamaIndex basics", "Frameworks for building LLM applications. Widely used in production app development at startups."],
                      ["Basic backend (FastAPI or Flask)", "To ship your AI feature as a product, not just a notebook. Essential for deployed projects."],
                      ["Prompt engineering", "System prompts, few-shot examples, chain-of-thought. Practical skill, not a soft concept."],
                    ].map(([skill, note]) => (
                      <div key={skill as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{skill}</div>
                          <div style={{ fontSize: 14, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Burning Glass Technologies AI skills demand 2025, LinkedIn Economic Graph AI Skills Report Q3 2025, Stack Overflow Developer Survey 2025, JetBrains State of Developer Ecosystem 2025</p>
          </div>

          {/* CTA 1 */}
          <div className="rpt-inline-cta">
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title">Find AI internships and entry-level roles globally</div>
                <div className="rpt-inline-cta-sub">The Internship Dojo surfaces AI roles with skill filters, pay data, and direct application links.</div>
              </div>
              <Link to="/dojos/internships" className="rpt-btn-primary">Find AI Roles</Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 03</span>
              <h2 className="rpt-h2">Entry-level ML Engineers earn $92k-$135k in the US. MLOps roles start at $85k. AI Product Manager has the highest ceiling at $85k-$120k for entry-level.</h2>
              <p className="rpt-lead">Pay varies significantly by role type, not just by company. Understanding which roles pay what helps you decide where to direct preparation time. Here is the verified salary data for each entry-level AI track.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Entry-level AI role salary ranges (US, USD annual): low to high based on Glassdoor, levels.fyi, LinkedIn Salary 2025-26</div>
              <div className="rpt-chart-wrap" style={{ height: 300 }}><canvas id="rolesChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3">
              <div className="rpt-stat"><div className="rpt-val rpt-b">$85-130k</div><div className="rpt-lbl">MLOps Engineer entry-level range (US). True entry-level starts ~$85K; range reflects early-career with adjacent DevOps or ML experience. High demand, undersupplied talent pool.</div></div>
              <div className="rpt-stat"><div className="rpt-val">$92-135k</div><div className="rpt-lbl">ML Engineer (entry-level, US). Glassdoor median $108k. Big Tech pays significantly above this band.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">$68-98k</div><div className="rpt-lbl">AI Data Analyst (entry-level, US). Most accessible entry point. Median $79k across sectors (LinkedIn Salary 2025).</div></div>
            </div>

            <div className="rpt-card" style={{ marginTop: 20 }}>
              <div className="rpt-card-label">Global equivalents for entry-level ML Engineer roles</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                {[
                  { market: "United States", range: "$92,000 to $135,000/yr", note: "ML Engineer entry-level (Glassdoor median $108K). AI PM entry-level is $85K-$120K. MLOps starts ~$85K. San Francisco Bay Area at the top. NYC and Seattle close.", color: "#3b82f6" },
                  { market: "United Kingdom", range: "£45,000 to £72,000/yr", note: "London (DeepMind, Wayve, Stability AI, Meta AI). Manchester and Edinburgh emerging. Big Tech London competes with Bay Area on equity.", color: "#3b82f6" },
                  { market: "Germany", range: "EUR 52,000 to EUR 78,000/yr", note: "Berlin (Delivery Hero, Zalando AI), Munich (BMW AI, Allianz tech). Strong for European AI startups.", color: "#60a5fa" },
                  { market: "India", range: "INR 5 to 12 LPA (fresher)", note: "Bengaluru dominates. Fresher/entry-level national range INR 5-10 LPA. MNCs (Google, Microsoft, Amazon) reach INR 18-24 LPA for strong candidates. Funded startups INR 10-15 LPA.", color: "#60a5fa" },
                  { market: "Singapore", range: "SGD $65,000 to $105,000/yr", note: "Regional AI hub. GovTech, Sea Group, Grab, Shopee all hiring. Government AIAP programme for fresh graduates.", color: "#93c5fd" },
                  { market: "Australia", range: "AUD $70,000 to $115,000/yr", note: "Sydney (Atlassian, Canva AI) and Melbourne lead. PayScale shows ~AUD $69K for under 1 year; broader market average ~AUD $98K. Government AI roles through ADHA and ASD.", color: "#93c5fd" },
                ].map(r => (
                  <div key={r.market} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 4, borderRadius: 2, background: r.color, flexShrink: 0, alignSelf: "stretch" }}></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 2 }}>{r.market} - {r.range}</div>
                      <div style={{ fontSize: 14, color: "#525252", lineHeight: 1.6 }}>{r.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="rpt-source">Source: Glassdoor ML Engineer salary data 2025, levels.fyi entry-level ML data Q4 2025, LinkedIn Salary AI roles 2025, PayScale India ML Engineer 2025, Glassdoor UK AI roles 2025, Singapore GovTech AIAP programme documentation</p>
          </div>

          {/* Finding 4 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 04</span>
              <h2 className="rpt-h2">Domain knowledge plus AI beats pure AI at most companies outside Big Tech. A finance student who can use ML beats a CS student who cannot explain what a bond is - at every fintech.</h2>
              <p className="rpt-lead">The most underrated edge in the AI job market in 2026 is sector expertise. Most AI teams are not staffed exclusively by ML researchers. They hire domain specialists who can apply AI within a vertical.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Where domain knowledge wins</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Healthcare / BioTech AI", "Clinical trial optimisation, drug discovery, diagnostic imaging. Biology or medicine background plus Python beats pure CS at most medtech companies."],
                      ["Finance / FinTech AI", "Risk models, fraud detection, trading algorithms, credit scoring. Finance + ML is a rare and very well-paid combination. Every bank's quant team needs this profile."],
                      ["Legal AI / LegalTech", "Contract analysis, case prediction, document review. Law background plus LLM API skills is a nearly uncrowded entry point in 2026."],
                      ["Climate / Energy AI", "Grid optimisation, emissions modelling, satellite analysis. Engineering + AI is the hiring profile for this sector."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 6 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, marginTop: 2 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Where pure ML wins</div>
                <div className="rpt-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["Foundation model labs", "Anthropic, OpenAI, Google DeepMind, Meta AI. Pure research. PhD expected or exceptional undergraduate research output."],
                      ["AI infrastructure companies", "Hugging Face, Scale AI, Cohere, Mistral. ML engineering is the core product. Strong ML fundamentals required."],
                      ["Autonomous systems", "Self-driving (Waymo, Cruise), robotics (Boston Dynamics, Figure). Strong control theory + ML background."],
                      ["Recommendation / ranking systems", "Meta, Netflix, TikTok, Spotify. Very competitive. Strong stats + systems background plus significant internship experience expected."],
                    ].map(([title, detail]) => (
                      <div key={title as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", flexShrink: 0, marginTop: 6 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>{title}</div>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, marginTop: 2 }}>{detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <blockquote className="rpt-pullquote">
              <p>"The best AI candidates we hire are not the ones who know the most ML theory. They are the ones who understand the problem well enough to know when to use a model and when not to."</p>
            </blockquote>

            <p className="rpt-prose">This quote, from a VP of Engineering at a Series C fintech, reflects a pattern visible across hiring data. At companies using AI as a means to an end (the majority of AI hiring), domain-fluent candidates who can code outcompete pure ML candidates who cannot communicate business value. <strong>If you have a non-CS background, your fastest path into AI is not to replicate a CS degree. It is to add Python, SQL, and working knowledge of 2 to 3 ML techniques on top of the domain knowledge you already have.</strong> That combination is rarer and often more valuable than a general ML skill set with no sector context.</p>
            <p className="rpt-source">Source: LinkedIn AI Hiring Trends Report 2025, Deloitte AI in the enterprise survey 2025, McKinsey Global AI Survey 2025, World Economic Forum AI talent gap analysis 2025</p>
          </div>

          {/* CTA 2 */}
          <div className="rpt-inline-cta" style={{ background: "#171717" }}>
            <div className="rpt-inline-cta-inner">
              <div>
                <div className="rpt-inline-cta-title" style={{ color: "#fff" }}>Build the resume that clears AI company ATS filters</div>
                <div className="rpt-inline-cta-sub" style={{ color: "#a3a3a3" }}>AI companies use keyword-heavy ATS systems. The Studojo resume builder outputs a clean, ATS-tested format in 5 minutes. Free.</div>
              </div>
              <Link to="/dojos/careers" className="rpt-btn-primary">Build Resume Free</Link>
            </div>
          </div>

          {/* Finding 5 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 05</span>
              <h2 className="rpt-h2">A deployed project beats a certificate 9.2 to 4.2 on a hiring manager's signal scale. The portfolio is not optional - it is the interview.</h2>
              <p className="rpt-lead">AI roles are uniquely portfolio-driven at entry level. Companies hire for demonstrated ability, not credentials. Here is what signals actually move hiring managers and what is largely ignored.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Portfolio signal strength (hiring manager survey weight, 1-10): higher is stronger</div>
              <div className="rpt-chart-wrap" style={{ height: 280 }}><canvas id="portfolioChart"></canvas></div>
            </div>

            <div className="rpt-stat-row rpt-c3" style={{ marginTop: 20 }}>
              <div className="rpt-stat"><div className="rpt-val rpt-b">9.2/10</div><div className="rpt-lbl">Deployed project with live URL. Highest-weighted signal. Shows you can ship, not just experiment in a notebook.</div></div>
              <div className="rpt-stat"><div className="rpt-val">4.2/10</div><div className="rpt-lbl">Certificate (Coursera, Google, etc). Lowest-weighted signal. Demonstrates you completed a course, not that you can do the job.</div></div>
              <div className="rpt-stat"><div className="rpt-val rpt-o">8.5/10</div><div className="rpt-lbl">Open source contribution to a used library. Shows code quality, collaboration, and ability to work in a real codebase.</div></div>
            </div>

            <div className="rpt-card" style={{ marginTop: 20, padding: 24 }}>
              <div className="rpt-card-label">What a strong AI portfolio looks like in practice</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                {[
                  { label: "The deployed project (highest priority)", detail: "An AI-powered tool with a live URL. Does not need to be sophisticated: a sentiment analyser on product reviews, a document Q+A bot built with LangChain, a price prediction model with a simple front end. The key is that someone other than you can use it. Hosted on Hugging Face Spaces, Vercel, or Streamlit Cloud (all free).", flag: "blue" },
                  { label: "The Kaggle proof", detail: "Compete in a Kaggle competition and land in the top 20% of submissions. Write a detailed notebook explaining your approach. This is more credible than any course because it involves real competition. Medal-level performance (top 10%) is a strong signal even at senior levels.", flag: "blue" },
                  { label: "The GitHub commit history", detail: "Hiring managers look at commit frequency and recency. A profile with consistent commits over 6+ months signals genuine practice. Cold-starting GitHub 2 weeks before applying is obvious. One strong, well-documented repository is worth more than 10 sparse ones.", flag: "blue" },
                  { label: "The technical writeup", detail: "A blog post or Substack article where you explain how you built something, what did not work, and why you made each technical decision. Demonstrates communication ability, which is the second most-cited hiring criterion after technical skill.", flag: "amber" },
                  { label: "Certs (use selectively)", detail: "Coursera / Google AI / deeplearning.ai certs are useful as a learning scaffold, not as a hiring signal. List them if they are from recognised names (Andrew Ng's courses, AWS ML Specialty, GCP Professional ML Engineer) but do not rely on them. A cert without a project is empty.", flag: "neutral" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 4, borderRadius: 2, background: r.flag === "blue" ? "#3b82f6" : r.flag === "amber" ? "#f59e0b" : "#e5e5e5", flexShrink: 0, alignSelf: "stretch" }}></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 14, color: "#525252", lineHeight: 1.6 }}>{r.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="rpt-source">Source: Triplebyte AI hiring signals report 2024, Towards Data Science hiring manager survey 2025, LinkedIn AI recruiter interviews Q1 2026, Kaggle annual survey on ML in industry 2025</p>
          </div>

          {/* Finding 6 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 06</span>
              <h2 className="rpt-h2">San Francisco has the highest AI job posting density globally. But the remote layer is real, and Bengaluru is the fastest-growing AI market by absolute job volume.</h2>
              <p className="rpt-lead">AI hiring is geographically concentrated but the remote layer is growing. Here is where the jobs actually are and what that means for where you should be targeting.</p>
            </div>

            <div className="rpt-card">
              <div className="rpt-card-label">Relative AI job posting density by city (SF Bay Area = 100): entry-level and junior roles</div>
              <div className="rpt-chart-wrap" style={{ height: 260 }}><canvas id="geoChart"></canvas></div>
            </div>

            <div className="rpt-bar-list" style={{ marginTop: 16 }}>
              {[
                { city: "San Francisco Bay Area", range: "Index 100", sub: "OpenAI, Anthropic, Google DeepMind, Meta AI, Scale AI, Cohere. Highest density. Also highest cost of living - $3,000+/month for a room.", bg: "#3b82f6", pct: 100 },
                { city: "Seattle", range: "Index 54", sub: "Amazon Web Services AI, Microsoft Azure AI, Waymo. Strong for MLOps and cloud-native AI. Lower cost than SF.", bg: "#3b82f6", pct: 54 },
                { city: "New York City", range: "Index 48", sub: "Finance AI (Goldman, JPMorgan, Two Sigma), media AI, LegalTech. Best city for domain-specific AI roles in finance and law.", bg: "#60a5fa", pct: 48 },
                { city: "Bengaluru, India", range: "Index 22", sub: "Google India, Microsoft India, Walmart Global Tech, PhonePe, Swiggy AI teams. Fastest-growing AI market by absolute volume.", bg: "#60a5fa", pct: 22 },
                { city: "Singapore", range: "Index 20", sub: "Sea Group, GovTech AIAP, Grab, regional AI labs. English-speaking gateway for Southeast Asia AI roles.", bg: "#93c5fd", pct: 20 },
                { city: "London", range: "Index 18", sub: "DeepMind, Wayve, Stability AI, Magic Pony. Smaller but growing. Best European market for research-adjacent AI.", bg: "#93c5fd", pct: 18 },
              ].map(r => (
                <div key={r.city} className="rpt-bar-row">
                  <div className="rpt-bar-label">{r.city}<small>{r.sub}</small></div>
                  <div className="rpt-bar-track"><div className="rpt-bar-fill" style={{ width: `${r.pct}%`, background: r.bg }}></div></div>
                  <div className="rpt-bar-value">{r.range}</div>
                </div>
              ))}
            </div>

            <div className="rpt-callout rpt-cp">
              <div className="rpt-cl">The remote layer is real - for the right roles</div>
              <p>Around 27% of entry-level AI postings specifically offered full or hybrid remote in 2025 (vs ~34% for AI roles broadly across all seniority levels). This skews heavily toward Application/Wrapper and Analyst roles. Core ML research roles at Big Tech remain almost entirely in-person. If you are targeting an AI startup at the application layer, location is a significantly smaller barrier than it was 3 years ago. A strong portfolio and a solid GitHub profile can land you a remote role at a US company from India, Eastern Europe, or Southeast Asia.</p>
            </div>
            <p className="rpt-source">Source: LinkedIn Jobs AI category geographic analysis Q4 2025, Burning Glass AI regional hiring data 2025, Glassdoor remote AI jobs tracker 2025, Indeed AI job trends report 2025</p>
          </div>

          {/* Finding 7 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 07</span>
              <h2 className="rpt-h2">Where to actually find entry-level AI roles - and why LinkedIn is not the whole picture.</h2>
              <p className="rpt-lead">Most entry-level AI roles are posted on 3 to 4 platforms. But the best roles, especially at startups, are posted before they hit job boards at all. Here is the full sourcing map.</p>
            </div>

            <div className="rpt-two-col">
              <div>
                <div className="rpt-col-head">Job boards and platforms</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["LinkedIn Jobs", "Largest volume. Use filters: Entry Level + Machine Learning / AI. Set alerts. Apply within 48 hours of posting."],
                      ["Wellfound (Wellfound.com)", "Best for startup AI roles. Salary ranges shown upfront. Founder-posted roles often here 1-2 weeks before LinkedIn."],
                      ["Hugging Face Jobs", "AI-specific. Mostly ML engineering and research. Small volume but very high signal quality."],
                      ["Y Combinator job board", "YC companies post here. Strong for early-stage AI startup roles. roles.y-combinator.com"],
                      ["Studojo Internship Dojo", "Curated AI internships globally. Pay data, sector filters, direct applications."],
                    ].map(([name, note]) => (
                      <div key={name as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{name}</div>
                          <div style={{ fontSize: 14, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="rpt-col-head">Off-board channels (higher conversion)</div>
                <div className="rpt-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["AI researcher Twitter/X", "Follow researchers at labs you want to join. Intern and junior role announcements often appear here before job boards. Reply with a relevant project."],
                      ["Discord servers", "Hugging Face Discord, LangChain Discord, local AI community servers. Founders and hiring managers are active. Direct conversations happen here."],
                      ["GitHub sponsors and contributors", "Find repos in your target domain. Contribute meaningfully. Maintainers hire contributors they already know."],
                      ["Cold email with a project", "A 3-line email to a relevant team lead, with a link to something you built that is relevant to their product, converts at 3-8%. One of the highest-ROI channels at entry level."],
                    ].map(([name, note]) => (
                      <div key={name as string} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", flexShrink: 0, marginTop: 5 }}></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{name}</div>
                          <div style={{ fontSize: 14, color: "#737373" }}>{note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="rpt-source">Source: Wellfound 2025 startup hiring report, Y Combinator AI company hiring data, LinkedIn Talent Solutions AI hiring guide 2025, Lattice AI hiring channels survey 2025</p>
          </div>

          {/* Finding 8 */}
          <div className="rpt-finding">
            <div className="rpt-finding-header">
              <span className="rpt-finding-num">Finding 08</span>
              <h2 className="rpt-h2">The 90-day sprint: a realistic preparation timeline from zero to first AI application.</h2>
              <p className="rpt-lead">Students often ask how long it takes to be competitive for an entry-level AI role. The honest answer depends on your starting point. Here is a realistic, structured path for the Application/Wrapper track - the most accessible entry point.</p>
            </div>

            <div className="rpt-card" style={{ padding: 24 }}>
              <div className="rpt-card-label">90-day preparation sprint (Application track: assumes basic Python familiarity)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {[
                  {
                    phase: "Days 1-30: Build the floor",
                    color: "#93c5fd",
                    items: [
                      "Python: Pandas + requests + JSON. Build 3 small scripts daily. Target: reading and writing code fluently without googling syntax.",
                      "SQL: Complete Mode Analytics SQL tutorial (free). Write 50 queries. Cover joins, aggregations, window functions.",
                      "Git: Learn branching, commits, pull requests. Make your first open source PR (even docs fixes count).",
                      "LLM basics: Call the OpenAI API. Build a simple chat interface. Understand tokens, temperature, and system prompts.",
                    ],
                  },
                  {
                    phase: "Days 31-60: Build something real",
                    color: "#60a5fa",
                    items: [
                      "Pick one project: a document Q+A bot, a sentiment tool for product reviews, an AI writing assistant for a specific domain.",
                      "Use LangChain or the OpenAI API directly. Add a simple FastAPI backend. Deploy to Hugging Face Spaces or Streamlit Cloud.",
                      "Write a technical post explaining what you built, what did not work, and what you learned.",
                      "Start a Kaggle competition in parallel. Focus on EDA and a clean baseline submission first.",
                    ],
                  },
                  {
                    phase: "Days 61-90: Apply and iterate",
                    color: "#3b82f6",
                    items: [
                      "Polish your GitHub: clear READMEs, commit history visible, pinned repos pointing to your best work.",
                      "Update your resume: lead with the deployed project and skills. Remove anything that is not relevant to AI.",
                      "Apply to 5 to 10 roles per week. Target: startups on Wellfound, internships on Studojo, YC companies.",
                      "For each rejection or silence: improve one concrete thing. A rejected portfolio is not a failure. It is a data point.",
                    ],
                  },
                ].map(phase => (
                  <div key={phase.phase} style={{ borderLeft: `4px solid ${phase.color}`, paddingLeft: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", marginBottom: 8 }}>{phase.phase}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {phase.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 8 }}>
                          <div style={{ fontSize: 14, color: "#737373", lineHeight: 1.6 }}>{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rpt-callout rpt-co">
              <div className="rpt-cl">What to do if you have a non-CS background</div>
              <p>The 90-day path above assumes you can already write basic Python. If you are starting from zero, add 30 days at the front for Python fundamentals (CS50P is free and excellent). If you have a non-CS background in a domain with strong AI adoption (medicine, law, finance, engineering), prioritise learning AI within your domain rather than pivoting to a generic CS profile. A medical student who can build a symptom-checker prototype and explain its limitations is more hireable at a healthtech company than a CS student who cannot name a clinical workflow.</p>
            </div>
            <p className="rpt-source">Source: Towards Data Science community survey 2025, fast.ai "Practical Deep Learning" course data, deeplearning.ai learner outcomes report 2025, Andrej Karpathy "Software 2.0" framework, Kaggle Learn guided paths</p>
          </div>

          {/* Final CTA */}
          <div className="rpt-final-cta">
            <h2 className="rpt-final-cta-title">Work on things that matter.</h2>
            <p className="rpt-final-cta-sub">Use the Studojo Internship Dojo to find AI internships and entry-level roles globally. Build an ATS-ready resume in 5 minutes. Free.</p>
            <div className="rpt-final-cta-btns">
              <Link to="/dojos/internships" className="rpt-btn-white">Find AI Internships</Link>
              <Link to="/dojos/careers" className="rpt-btn-outline">Build Your Resume Free</Link>
              <Link to="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol" target="_blank" rel="noopener noreferrer" className="rpt-btn-outline">Join the Student Community</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

const rptCSS = `
  .rpt-hero { background:#171717; color:#fff; padding:56px 24px 48px; }
  .rpt-hero-inner { max-width:800px; margin:0 auto; }
  .rpt-badge { display:inline-flex; align-items:center; background:#3b82f6; border:2px solid #60a5fa; border-radius:999px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#fff; margin-bottom:12px; }
  .rpt-breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#737373; margin-bottom:14px; }
  .rpt-breadcrumb-link { color:#93c5fd; text-decoration:none; }
  .rpt-breadcrumb-link:hover { text-decoration:underline; }
  .rpt-breadcrumb-sep { color:#525252; }
  .rpt-h1 { font-family:'Clash Display',sans-serif; font-size:clamp(28px,5vw,48px); font-weight:700; line-height:1.1; color:#fff; margin-bottom:16px; }
  .rpt-h1 em { font-style:italic; color:#93c5fd; }
  .rpt-hero-sub { font-size:16px; color:#a3a3a3; line-height:1.7; max-width:600px; margin-bottom:28px; }
  .rpt-hero-stats { display:flex; gap:40px; flex-wrap:wrap; padding-top:24px; border-top:1px solid #333; }
  .rpt-hval { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; color:#93c5fd; }
  .rpt-hlbl { font-size:12px; color:#737373; margin-top:2px; }
  .rpt-cta-strip { background:#eff6ff; border-bottom:2px solid #171717; padding:12px 24px; }
  .rpt-cta-strip-inner { max-width:800px; margin:0 auto; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .rpt-cta-strip-text { font-size:14px; font-weight:500; color:#525252; }
  .rpt-cta-pill { display:inline-flex; align-items:center; background:#3b82f6; color:#fff; border:2px solid #171717; border-radius:999px; padding:5px 16px; font-size:12px; font-weight:700; text-decoration:none; box-shadow:2px 2px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-cta-pill:hover { transform:translate(1px,1px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-content { max-width:800px; margin:0 auto; padding:0 24px 80px; }
  .rpt-finding { margin-top:64px; }
  .rpt-finding-header { margin-bottom:28px; }
  .rpt-finding-num { display:inline-block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#3b82f6; margin-bottom:8px; }
  .rpt-h2 { font-family:'Clash Display',sans-serif; font-size:clamp(20px,3vw,28px); font-weight:700; line-height:1.2; color:#171717; margin-bottom:10px; }
  .rpt-lead { font-size:15px; color:#525252; line-height:1.7; max-width:640px; }
  .rpt-prose { font-size:15px; line-height:1.75; color:#525252; margin-bottom:24px; }
  .rpt-prose strong { color:#171717; font-weight:700; }
  .rpt-source { font-size:12px; color:#a3a3a3; margin-top:16px; }
  .rpt-card { background:#fff; border:2px solid #171717; border-radius:20px; padding:28px; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); margin-bottom:20px; }
  .rpt-card-label { font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#737373; margin-bottom:16px; }
  .rpt-chart-wrap { position:relative; }
  .rpt-chart-wrap canvas { width:100%!important; }
  .rpt-stat-row { display:grid; gap:16px; margin-bottom:20px; }
  .rpt-c2 { grid-template-columns:repeat(2,1fr); }
  .rpt-c3 { grid-template-columns:repeat(3,1fr); }
  .rpt-c4 { grid-template-columns:repeat(4,1fr); }
  .rpt-stat { background:#f5f5f5; border:2px solid #171717; border-radius:16px; padding:18px 16px; }
  .rpt-val { font-family:'Clash Display',sans-serif; font-size:28px; font-weight:700; line-height:1; margin-bottom:6px; }
  .rpt-e { color:#10b981; } .rpt-b { color:#3b82f6; } .rpt-v { color:#8b5cf6; } .rpt-g { color:#10b981; } .rpt-o { color:#f59e0b; }
  .rpt-lbl { font-size:13px; color:#525252; line-height:1.45; font-weight:500; }
  .rpt-delta { display:inline-block; font-size:11px; font-weight:700; margin-top:6px; padding:2px 8px; border-radius:999px; }
  .rpt-du { background:#dbeafe; color:#1d4ed8; } .rpt-dn { background:#f5f5f5; color:#737373; border:1px solid #e5e5e5; }
  .rpt-callout { border:2px solid #171717; border-radius:16px; padding:20px 22px; margin-top:20px; }
  .rpt-cp { background:#eff6ff; border-color:#3b82f6; } .rpt-cg { background:#dbeafe; border-color:#3b82f6; } .rpt-co { background:#fef3c6; border-color:#f59e0b; } .rpt-cd { background:#171717; border-color:#171717; color:#fff; }
  .rpt-cl { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
  .rpt-cp .rpt-cl { color:#1d4ed8; } .rpt-cg .rpt-cl { color:#1d4ed8; } .rpt-co .rpt-cl { color:#92400e; } .rpt-cd .rpt-cl { color:#93c5fd; }
  .rpt-callout p { font-size:15px; line-height:1.7; }
  .rpt-pullquote { border-left:4px solid #3b82f6; padding:16px 20px; margin:24px 0; background:#eff6ff; border-radius:0 12px 12px 0; }
  .rpt-pullquote p { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:600; line-height:1.45; color:#171717; }
  .rpt-bar-list { display:flex; flex-direction:column; gap:10px; }
  .rpt-bar-row { display:grid; grid-template-columns:200px 1fr 90px; align-items:center; gap:12px; }
  .rpt-bar-row.rpt-narrow { grid-template-columns:140px 1fr; }
  .rpt-bar-label { font-size:13px; font-weight:500; color:#171717; line-height:1.35; }
  .rpt-bar-label small { display:block; font-size:12px; color:#737373; font-weight:400; }
  .rpt-bar-track { height:28px; background:#f5f5f5; border:1px solid #e5e5e5; border-radius:6px; overflow:hidden; }
  .rpt-bar-fill { height:100%; border-radius:6px 0 0 6px; display:flex; align-items:center; padding-left:10px; font-size:11px; font-weight:700; color:#fff; white-space:nowrap; }
  .rpt-bar-value { font-size:12px; font-weight:700; color:#171717; text-align:right; }
  .rpt-bar-value small { display:block; font-size:10px; color:#737373; font-weight:400; }
  .rpt-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .rpt-col-head { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#737373; margin-bottom:12px; }
  .rpt-mini-total { border-radius:10px; padding:14px 16px; margin-top:14px; }
  .rpt-mini-total-label { font-size:11px; font-weight:700; }
  .rpt-inline-cta { background:#eff6ff; border:2px solid #171717; border-radius:20px; padding:24px 28px; margin:32px 0; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); }
  .rpt-inline-cta-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .rpt-inline-cta-title { font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#171717; margin-bottom:4px; }
  .rpt-inline-cta-sub { font-size:13px; color:#525252; }
  .rpt-btn-primary { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 24px; background:#3b82f6; color:#fff; border:2px solid #171717; border-radius:14px; font-size:13px; font-weight:700; text-decoration:none; white-space:nowrap; box-shadow:3px 3px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-primary:hover { transform:translate(2px,2px); box-shadow:1px 1px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta { margin-top:64px; background:#3b82f6; border:2px solid #171717; border-radius:24px; padding:48px 40px; text-align:center; box-shadow:6px 6px 0px 0px rgba(25,26,35,1); }
  .rpt-final-cta-title { font-family:'Clash Display',sans-serif; font-size:clamp(24px,4vw,36px); font-weight:700; color:#fff; margin-bottom:12px; }
  .rpt-final-cta-sub { font-size:15px; color:rgba(255,255,255,0.85); max-width:560px; margin:0 auto 28px; line-height:1.65; }
  .rpt-final-cta-btns { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
  .rpt-btn-white { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:#fff; color:#171717; border:2px solid #171717; border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; box-shadow:4px 4px 0px 0px rgba(25,26,35,1); transition:transform 0.1s,box-shadow 0.1s; }
  .rpt-btn-white:hover { transform:translate(2px,2px); box-shadow:2px 2px 0px 0px rgba(25,26,35,1); }
  .rpt-btn-outline { display:inline-flex; align-items:center; justify-content:center; height:48px; padding:0 28px; background:rgba(255,255,255,0.15); color:#fff; border:2px solid rgba(255,255,255,0.5); border-radius:16px; font-size:14px; font-weight:700; text-decoration:none; transition:background 0.15s; }
  .rpt-btn-outline:hover { background:rgba(255,255,255,0.25); }
  .rpt-pill-row { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
  .rpt-pill { border:2px solid #171717; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:700; }
  .rpt-pg { background:#dbeafe; color:#1d4ed8; border-color:#3b82f6; } .rpt-po { background:#fef3c6; color:#92400e; border-color:#f59e0b; } .rpt-pr { background:#fee2e2; color:#991b1b; border-color:#ef4444; }
  @media(max-width:640px){
    .rpt-c4{grid-template-columns:1fr 1fr!important;} .rpt-c3{grid-template-columns:1fr 1fr!important;}
    .rpt-bar-row{grid-template-columns:100px 1fr 70px;} .rpt-bar-row.rpt-narrow{grid-template-columns:100px 1fr;}
    .rpt-two-col{grid-template-columns:1fr;}
    .rpt-inline-cta-inner{flex-direction:column;align-items:flex-start;}
    .rpt-hero-stats{gap:20px;} .rpt-final-cta{padding:32px 20px;}
  }
`;
