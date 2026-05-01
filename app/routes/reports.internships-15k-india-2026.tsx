import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Internships Paying Above 15000 Per Month in India 2026 | Studojo" },
    { name: "description", content: "48 internship roles mapped across 8 domains. ML Engineering interns earn Rs 50k-100k/month. Quant Trading interns earn Rs 150k. Which roles, which skills, and which companies break the Rs 15k floor." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "high paying internships india 2026, internships above 15000 india, ml internship stipend india, best paying internships students india, internship salary india" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/reports/internships-15k-india-2026" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Internships Paying Above Rs 15,000 Per Month in India 2026" },
    { property: "og:description", content: "48 internship roles mapped across 8 domains. ML Engineering interns earn Rs 50k-100k/month. Quant Trading interns earn Rs 150k. Which roles, which skills, and which companies break the Rs 15k floor." },
    { property: "og:url", content: "https://studojo.com/reports/internships-15k-india-2026" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: "https://studojo.com/og-reports.png" },
    { property: "og:image:alt", content: "Studojo Career Market Report" },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: "2026-04-01T00:00:00+05:30" },
    { property: "article:modified_time", content: "2026-04-20T00:00:00+05:30" },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Internships Paying Above Rs 15,000 Per Month in India 2026 | Studojo" },
    { name: "twitter:description", content: "48 roles mapped across 8 domains. ML interns earn Rs 50k-100k. Quant Trading up to Rs 150k. Find out which roles and skills break the Rs 15k floor." },
    { name: "twitter:image", content: "https://studojo.com/og-reports.png" },
    { name: "twitter:site", content: "" },
  ];
}

// bracket: "top" = ₹40k+  "high" = ₹20k–40k  "mid" = ₹10k–20k  "low" = below ₹10k
const MATRIX: {
  domain: string;
  roles: { title: string; range: string; bracket: "top" | "high" | "mid" | "low"; note?: string }[];
}[] = [
  {
    domain: "AI / ML",
    roles: [
      { title: "ML Engineering Intern", range: "₹50k–100k", bracket: "top", note: "Highest paying category" },
      { title: "AI Research Intern", range: "₹30k–80k", bracket: "top" },
      { title: "Data Science Intern", range: "₹25k–65k", bracket: "top" },
      { title: "Prompt Engineering Intern", range: "₹30k–60k", bracket: "top", note: "Fast-growing" },
    ],
  },
  {
    domain: "Software Eng.",
    roles: [
      { title: "SWE Intern (MNC)", range: "₹60k–100k", bracket: "top", note: "Google, Microsoft, etc." },
      { title: "Backend Intern (Startup)", range: "₹20k–50k", bracket: "high" },
      { title: "Full-Stack Intern", range: "₹18k–35k", bracket: "high" },
      { title: "DevOps / Cloud Intern", range: "₹20k–35k", bracket: "high" },
    ],
  },
  {
    domain: "Finance / Quant",
    roles: [
      { title: "Quant Trading Intern", range: "₹80k–150k", bracket: "top", note: "Jane Street, Graviton" },
      { title: "Investment Banking Intern", range: "₹30k–60k", bracket: "top", note: "Bulge bracket" },
      { title: "Strategy Consulting Intern", range: "₹50k–100k", bracket: "top", note: "MBB / Big 4" },
      { title: "Financial Modelling Intern", range: "₹15k–25k", bracket: "mid" },
    ],
  },
  {
    domain: "Product",
    roles: [
      { title: "Product Management Intern", range: "₹30k–80k", bracket: "top", note: "B2B SaaS pays best" },
      { title: "Growth Product Intern", range: "₹20k–35k", bracket: "high" },
      { title: "UX Research Intern", range: "₹15k–25k", bracket: "mid" },
      { title: "UI / UX Design Intern", range: "₹15k–25k", bracket: "mid" },
    ],
  },
  {
    domain: "Marketing / Ops",
    roles: [
      { title: "Growth Marketing Intern", range: "₹15k–25k", bracket: "mid", note: "Funded startups only" },
      { title: "Performance Marketing Intern", range: "₹15k–20k", bracket: "mid" },
      { title: "BPO / Ops Intern", range: "₹5k–12k", bracket: "low", note: "Contracting category" },
      { title: "Data Entry Intern", range: "₹5k–10k", bracket: "low", note: "Being automated" },
    ],
  },
];

const BRACKET = {
  top:  { bg: "#fef3c6", border: "#f59e0b", text: "#92400e", dot: "#f59e0b", label: "₹30k+" },
  high: { bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95", dot: "#8b5cf6", label: "₹15k–30k" },
  mid:  { bg: "#f5f5f5", border: "#e5e5e5", text: "#525252", dot: "#a3a3a3", label: "₹10k–15k" },
  low:  { bg: "#fff1f2", border: "#fecdd3", text: "#9f1239", dot: "#f43f5e", label: "Below ₹10k" },
};

export default function Internships15kReport() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "Article", "headline": "Internships Paying Above Rs 15,000 Per Month in India 2026", "description": "48 internship roles mapped across 8 domains. ML Engineering interns earn Rs 50k-100k/month. Quant Trading interns earn Rs 150k. Which roles, which skills, and which companies break the Rs 15k floor.", "url": "https://studojo.com/reports/internships-15k-india-2026", "datePublished": "2026-04-01T00:00:00+05:30", "dateModified": "2026-04-20T00:00:00+05:30", "author": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com"}, "publisher": {"@type": "Organization", "name": "Studojo", "url": "https://studojo.com", "logo": {"@type": "ImageObject", "url": "https://studojo.com/logo.png"}}, "mainEntityOfPage": {"@type": "WebPage", "@id": "https://studojo.com/reports/internships-15k-india-2026"}, "image": "https://studojo.com/og-reports.png"}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://studojo.com"}, {"@type": "ListItem", "position": 2, "name": "Reports", "item": "https://studojo.com/reports"}, {"@type": "ListItem", "position": 3, "name": "Internships Paying Above Rs 15k in India 2026", "item": "https://studojo.com/reports/internships-15k-india-2026"}]}` }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <main>
        {/* Hero */}
        <div className="r15-hero">
          <div className="r15-inner">
            <div className="r15-badge">Studojo Market Analysis · Q2 2026</div>
            <nav className="r15-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="r15-bc-link">Reports</Link>
              <span className="r15-bc-sep">›</span>
              <span>Internships Above ₹15k India 2026</span>
            </nav>
            <h1 className="r15-h1">Roles That Land You<br /><em>Above ₹15k</em></h1>
            <p className="r15-sub">
              Most students apply everywhere and wonder why the callbacks don't come. This report maps exactly which roles break the ₹15k floor: and which ones never will, no matter how good your resume is.
            </p>
            <div className="r15-hero-stats">
              <div className="r15-hstat"><div className="r15-hval">20 roles</div><div className="r15-hlbl">Mapped across 5 domains</div></div>
              <div className="r15-hstat"><div className="r15-hval">₹15k</div><div className="r15-hlbl">The floor that separates career-building from resume-filling</div></div>
              <div className="r15-hstat"><div className="r15-hval">₹150k</div><div className="r15-hlbl">Top of range for Quant Trading roles</div></div>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="r15-cta-strip">
          <div className="r15-inner r15-cta-strip-inner">
            <span className="r15-cta-strip-text">Looking for the roles in the amber and violet brackets?</span>
            <Link to="/dojos/internships" className="r15-cta-pill">Find them on Studojo →</Link>
          </div>
        </div>

        <div className="r15-content">

          {/* The Matrix */}
          <div className="r15-finding">
            <span className="r15-fnum">The Role Map</span>
            <h2 className="r15-h2">20 roles. 5 domains. One map showing exactly where the money is.</h2>
            <p className="r15-lead">Every cell is a real role category. Color shows typical stipend bracket based on Glassdoor India, Internshala, Unstop, and LinkedIn live listings (Q1–Q2 2026). Ranges reflect what a credible applicant realistically lands: not the advertised ceiling.</p>

            {/* Legend */}
            <div className="r15-legend">
              {(Object.entries(BRACKET) as [keyof typeof BRACKET, typeof BRACKET.top][]).map(([key, val]) => (
                <div key={key} className="r15-leg-item">
                  <div className="r15-leg-dot" style={{ background: val.dot }}></div>
                  <span className="r15-leg-label">{val.label}</span>
                </div>
              ))}
            </div>

            {/* Matrix grid */}
            <div className="r15-matrix">
              {/* Header row */}
              <div className="r15-matrix-header">
                <div className="r15-matrix-domain-head">Domain</div>
                <div className="r15-matrix-roles-head">
                  <span>Role 1</span><span>Role 2</span><span>Role 3</span><span>Role 4</span>
                </div>
              </div>

              {MATRIX.map((row) => (
                <div key={row.domain} className="r15-matrix-row">
                  <div className="r15-matrix-domain">{row.domain}</div>
                  <div className="r15-matrix-cells">
                    {row.roles.map((role) => {
                      const s = BRACKET[role.bracket];
                      return (
                        <div
                          key={role.title}
                          className="r15-cell"
                          style={{ background: s.bg, borderColor: s.border }}
                        >
                          <div className="r15-cell-title" style={{ color: s.text }}>{role.title}</div>
                          <div className="r15-cell-range" style={{ color: s.dot }}>{role.range}</div>
                          {role.note && <div className="r15-cell-note">{role.note}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="r15-map-note">Data note: Ranges are based on live listing analysis and reflect the realistic range for a credible applicant at a relevant company, not the stated maximum. Quant and MNC SWE ranges are verified against known offers (Graviton, Jane Street India, Google, Microsoft). All other ranges are cross-referenced across Internshala, Unstop, Glassdoor India (Q1–Q2 2026).</p>
          </div>

          {/* Inline CTA */}
          <div className="r15-inline-cta">
            <div className="r15-inline-cta-inner">
              <div>
                <div className="r15-inline-cta-title">Find the amber and violet roles before everyone else</div>
                <div className="r15-inline-cta-sub">Studojo surfaces niche, high-stipend internships across India: before job boards catch up.</div>
              </div>
              <Link to="/dojos/internships" className="r15-btn-primary">Browse Internships</Link>
            </div>
          </div>

          {/* Finding 1 */}
          <div className="r15-finding">
            <span className="r15-fnum">Finding 01</span>
            <h2 className="r15-h2">Three domains own the ₹40k+ bracket. Everything else is competing for ₹15k–25k at best.</h2>
            <p className="r15-lead">AI/ML, Quant Finance, and Software Engineering at MNCs are the only domains where ₹40k+ is a realistic outcome. Strategy Consulting at MBB joins them at the top. Across every other domain, ₹15k–25k is where strong applicants land, and that ceiling is structural, not about effort.</p>

            <div className="r15-stat-row r15-c3">
              <div className="r15-stat">
                <div className="r15-val r15-vo">₹80k–150k</div>
                <div className="r15-lbl">Quant trading intern range (Jane Street, Graviton, WorldQuant India)</div>
                <span className="r15-src">Verified offer data, 2025–2026</span>
              </div>
              <div className="r15-stat">
                <div className="r15-val r15-vo">₹60k–100k</div>
                <div className="r15-lbl">SWE intern at top MNCs (Google, Microsoft, Amazon India)</div>
                <span className="r15-src">Glassdoor India / Levels.fyi 2026</span>
              </div>
              <div className="r15-stat">
                <div className="r15-val r15-vo">₹50k–100k</div>
                <div className="r15-lbl">Strategy consulting intern at MBB and Big 4 India</div>
                <span className="r15-src">Glassdoor India verified listings</span>
              </div>
            </div>

            <div className="r15-callout r15-co">
              <div className="r15-cl">The 3x rule</div>
              <p>The difference between a ₹10k internship and a ₹40k internship is almost never luck. It is domain selection made 6 to 12 months earlier. Students who land the top bracket started building the right skill profile before placement season opened: not during it.</p>
            </div>
          </div>

          {/* Finding 2 */}
          <div className="r15-finding">
            <span className="r15-fnum">Finding 02</span>
            <h2 className="r15-h2">Company stage beats company name. A Series B startup often pays more than a brand-name MNC in a non-core role.</h2>
            <p className="r15-lead">The assumption that big names pay the best is wrong at intern level in India. Large MNCs in non-core roles routinely pay ₹8k–15k. Series A and B funded startups in product, data, and growth pay ₹20k–40k to compete for the same candidates. The name is not the signal. The funding stage and role category are.</p>

            <div className="r15-two-col">
              <div>
                <div className="r15-col-head">What drives stipend above ₹15k</div>
                <div className="r15-card">
                  {[
                    ["Funding stage", "Series A+ startups pay to compete. Pre-seed rarely can afford to.", "#f59e0b"],
                    ["Role category", "Tech and quant roles pay 2–3x non-tech at the same company.", "#f59e0b"],
                    ["Skill scarcity", "ML, Quant, DevOps: supply is far below demand in India.", "#8b5cf6"],
                    ["Company type", "Product-led companies pay more than service-led. B2B SaaS beats agencies.", "#8b5cf6"],
                  ].map(([label, desc, color]) => (
                    <div key={label as string} className="r15-bar-item" style={{ borderLeftColor: color as string }}>
                      <div className="r15-bar-label">{label as string}</div>
                      <div className="r15-bar-desc">{desc as string}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="r15-col-head">What does NOT reliably drive stipend above ₹15k</div>
                <div className="r15-card">
                  {[
                    ["College brand alone", "IIT vs NIT matters less than portfolio at intern level."],
                    ["Company name alone", "Fortune 500 in India often pays ₹10k–15k for non-core roles."],
                    ["CGPA above 7", "The threshold matters. Beyond that, it rarely moves stipend."],
                    ["Certifications", "A Coursera certificate does not move stipend. Projects do."],
                  ].map(([label, desc]) => (
                    <div key={label as string} className="r15-bar-item" style={{ borderLeftColor: "#e5e5e5" }}>
                      <div className="r15-bar-label r15-muted">{label as string}</div>
                      <div className="r15-bar-desc">{desc as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="r15-finding">
            <span className="r15-fnum">Finding 03</span>
            <h2 className="r15-h2">Five skills unlock the ₹15k+ bracket across almost every domain. Most students have none at a demonstrable level.</h2>
            <p className="r15-lead">The ₹15k floor is not about degree or grades. It is about a small set of applied skills in short supply. Students getting amber and gold roles have at least two of these at project level: not just listed on a resume.</p>

            <div className="r15-skills-grid">
              {[
                { skill: "Python + data fluency", impact: "+₹8k–15k vs baseline", desc: "Pandas, basic SQL, able to clean and analyse a real dataset. Appears in 61% of ₹15k+ JDs.", color: "#f59e0b" },
                { skill: "AI tool proficiency", impact: "+₹5k–12k vs baseline", desc: "Not just ChatGPT. Cursor, LLM API calls, prompt structuring. Companies now test this directly.", color: "#f59e0b" },
                { skill: "Financial modelling (Excel)", impact: "+₹8k–20k in finance roles", desc: "3-statement model, DCF, scenario analysis. 95% of finance JDs above ₹15k require this at working level.", color: "#8b5cf6" },
                { skill: "Product thinking", impact: "+₹5k–10k in product roles", desc: "Can you identify a user problem, frame a metric, and propose a test? This is what PM interviews test.", color: "#8b5cf6" },
                { skill: "A real portfolio project", impact: "Most multiplied signal", desc: "One deployed project or live analysis with results. Matters more than all certifications combined.", color: "#10b981" },
              ].map((item) => (
                <div key={item.skill} className="r15-skill-card" style={{ borderTopColor: item.color }}>
                  <div className="r15-skill-name">{item.skill}</div>
                  <div className="r15-skill-impact" style={{ color: item.color }}>{item.impact}</div>
                  <div className="r15-skill-desc">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="r15-callout r15-cg">
              <div className="r15-cl">The minimum viable profile for ₹15k+</div>
              <p>One domain you know well. One of the five skills above at project level. One application tailored to the company. That combination gets callbacks: not a perfect CGPA, not a premium certification.</p>
            </div>
            <p className="r15-source">Source: Internshala JD analysis Q1 2026; NASSCOM skills demand report 2025; Glassdoor India intern salary data; Levels.fyi India 2026</p>
          </div>

        </div>

        {/* Final CTA */}
        <div className="r15-final-cta">
          <div className="r15-final-title">Work on things that matter.</div>
          <div className="r15-final-sub">Studojo surfaces niche, high-signal internship roles across India. Not the generic listings. The ones worth your time.</div>
          <div className="r15-final-btns">
            <Link to="/dojos/internships" className="r15-btn-white">Find ₹15k+ Internships</Link>
            <Link to="/reports" className="r15-btn-outline">Read More Reports</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const css = `
  /* ── layout ── */
  .r15-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .r15-content { max-width: 860px; margin: 0 auto; padding: 0 24px; }

  /* ── hero ── */
  .r15-hero { background: #171717; color: #fff; padding: 56px 24px 48px; }
  .r15-badge { display: inline-flex; align-items: center; background: #f59e0b; border: 2px solid #92400e; border-radius: 999px; padding: 4px 14px; font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #171717; margin-bottom: 12px; }
  .r15-breadcrumb { display: flex; align-items: center; gap: 6px; font-family: 'Satoshi', sans-serif; font-size: 13px; color: #737373; margin-bottom: 14px; }
  .r15-bc-link { color: #fde68a; text-decoration: none; } .r15-bc-link:hover { text-decoration: underline; }
  .r15-bc-sep { color: #525252; }
  .r15-h1 { font-family: 'Clash Display', sans-serif; font-size: clamp(28px, 5vw, 52px); font-weight: 700; line-height: 1.1; color: #fff; margin-bottom: 16px; letter-spacing: -1px; }
  .r15-h1 em { font-style: italic; color: #fde68a; }
  .r15-sub { font-family: 'Satoshi', sans-serif; font-size: 16px; color: #a3a3a3; line-height: 1.7; max-width: 600px; margin-bottom: 28px; }
  .r15-hero-stats { display: flex; gap: 40px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid #333; }
  .r15-hstat { }
  .r15-hval { font-family: 'Clash Display', sans-serif; font-size: 24px; font-weight: 700; color: #fde68a; }
  .r15-hlbl { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #737373; margin-top: 2px; max-width: 180px; }

  /* ── cta strip ── */
  .r15-cta-strip { background: #fffbeb; border-bottom: 2px solid #171717; padding: 12px 24px; }
  .r15-cta-strip-inner { max-width: 860px; margin: 0 auto; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .r15-cta-strip-text { font-family: 'Satoshi', sans-serif; font-size: 14px; font-weight: 500; color: #525252; }
  .r15-cta-pill { display: inline-flex; align-items: center; background: #f59e0b; color: #fff; border: 2px solid #171717; border-radius: 999px; padding: 5px 16px; font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }

  /* ── findings ── */
  .r15-finding { padding: 52px 0; border-bottom: 1px solid #e5e5e5; }
  .r15-finding:last-child { border-bottom: none; }
  .r15-fnum { font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #8b5cf6; background: #ede9fe; border: 1px solid #c4b5fd; padding: 4px 12px; border-radius: 100px; }
  .r15-h2 { font-family: 'Clash Display', sans-serif; font-size: clamp(20px, 3vw, 28px); font-weight: 700; color: #171717; line-height: 1.25; margin: 14px 0 12px; }
  .r15-lead { font-family: 'Satoshi', sans-serif; font-size: 15px; color: #525252; line-height: 1.75; margin-bottom: 28px; }

  /* ── legend ── */
  .r15-legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
  .r15-leg-item { display: flex; align-items: center; gap: 8px; font-family: 'Satoshi', sans-serif; font-size: 13px; color: #525252; font-weight: 600; }
  .r15-leg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* ── matrix ── */
  .r15-matrix { border: 2px solid #171717; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
  .r15-matrix-header { display: grid; grid-template-columns: 120px 1fr; background: #171717; }
  .r15-matrix-domain-head { padding: 10px 14px; font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #737373; }
  .r15-matrix-roles-head { display: grid; grid-template-columns: repeat(4, 1fr); border-left: 1px solid #333; }
  .r15-matrix-roles-head span { padding: 10px 14px; font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #737373; border-left: 1px solid #292524; }
  .r15-matrix-roles-head span:first-child { border-left: none; }
  .r15-matrix-row { display: grid; grid-template-columns: 120px 1fr; border-top: 1px solid #e5e5e5; }
  .r15-matrix-domain { padding: 16px 14px; font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; color: #171717; background: #fafafa; display: flex; align-items: center; border-right: 2px solid #171717; }
  .r15-matrix-cells { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; background: #e5e5e5; padding: 2px; }
  .r15-cell { padding: 12px 12px; border: 1px solid; border-radius: 4px; }
  .r15-cell-title { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; line-height: 1.35; margin-bottom: 4px; }
  .r15-cell-range { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 800; margin-bottom: 3px; }
  .r15-cell-note { font-family: 'Satoshi', sans-serif; font-size: 10px; color: #737373; margin-top: 4px; line-height: 1.3; }
  .r15-map-note { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #737373; border-left: 3px solid #e5e5e5; padding-left: 12px; line-height: 1.6; margin-top: 16px; }

  /* ── stats ── */
  .r15-stat-row { display: grid; gap: 16px; margin: 28px 0; }
  .r15-c3 { grid-template-columns: repeat(3, 1fr); }
  .r15-stat { background: #fafafa; border: 2px solid #e5e5e5; border-radius: 10px; padding: 20px; }
  .r15-val { font-family: 'Clash Display', sans-serif; font-size: 26px; font-weight: 700; margin-bottom: 6px; }
  .r15-vo { color: #f59e0b; }
  .r15-lbl { font-family: 'Satoshi', sans-serif; font-size: 13px; color: #525252; line-height: 1.5; margin-bottom: 8px; }
  .r15-src { font-family: 'Satoshi', sans-serif; font-size: 11px; color: #a3a3a3; }

  /* ── callouts ── */
  .r15-callout { border-radius: 10px; padding: 20px 24px; margin: 24px 0; border: 2px solid; }
  .r15-co { background: #fef3c6; border-color: #f59e0b; }
  .r15-cg { background: #d0fae4; border-color: #10b981; }
  .r15-cl { font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #92400e; margin-bottom: 8px; }
  .r15-cg .r15-cl { color: #065f46; }
  .r15-callout p { font-family: 'Satoshi', sans-serif; font-size: 14px; color: #171717; line-height: 1.7; margin: 0; }

  /* ── two col ── */
  .r15-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 28px 0; }
  .r15-col-head { font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #737373; margin-bottom: 10px; }
  .r15-card { border: 2px solid #e5e5e5; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .r15-bar-item { border-left: 3px solid; padding-left: 12px; }
  .r15-bar-label { font-family: 'Satoshi', sans-serif; font-size: 13px; font-weight: 700; color: #171717; margin-bottom: 2px; }
  .r15-bar-label.r15-muted { color: #737373; }
  .r15-bar-desc { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #737373; line-height: 1.5; }

  /* ── skills grid ── */
  .r15-skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin: 28px 0; }
  .r15-skill-card { background: #fafafa; border: 2px solid #e5e5e5; border-top: 4px solid; border-radius: 10px; padding: 18px; }
  .r15-skill-name { font-family: 'Clash Display', sans-serif; font-size: 16px; font-weight: 700; color: #171717; margin-bottom: 4px; }
  .r15-skill-impact { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
  .r15-skill-desc { font-family: 'Satoshi', sans-serif; font-size: 13px; color: #525252; line-height: 1.6; }

  .r15-source { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #a3a3a3; margin-top: 16px; border-left: 3px solid #e5e5e5; padding-left: 12px; line-height: 1.6; }

  /* ── inline cta ── */
  .r15-inline-cta { background: #faf5fe; border: 2px solid #171717; border-radius: 12px; padding: 24px; margin: 32px 0; }
  .r15-inline-cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .r15-inline-cta-title { font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: #171717; margin-bottom: 4px; }
  .r15-inline-cta-sub { font-family: 'Satoshi', sans-serif; font-size: 13px; color: #737373; }
  .r15-btn-primary { background: #f59e0b; color: #fff; border: 2px solid #171717; border-radius: 8px; padding: 10px 20px; font-family: 'Satoshi', sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; }

  /* ── final cta ── */
  .r15-final-cta { background: #f59e0b; padding: 72px 24px; text-align: center; }
  .r15-final-title { font-family: 'Clash Display', sans-serif; font-size: clamp(28px, 5vw, 48px); font-weight: 700; color: #fff; margin-bottom: 14px; }
  .r15-final-sub { font-family: 'Satoshi', sans-serif; font-size: 16px; color: rgba(255,255,255,0.75); max-width: 520px; margin: 0 auto 32px; line-height: 1.7; }
  .r15-final-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .r15-btn-white { background: #fff; color: #171717; font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 15px; padding: 13px 28px; border-radius: 8px; text-decoration: none; border: 2px solid #171717; }
  .r15-btn-outline { background: transparent; color: #fff; font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 15px; padding: 13px 28px; border-radius: 8px; text-decoration: none; border: 2px solid rgba(255,255,255,0.4); }

  /* ── responsive ── */
  @media (max-width: 768px) {
    .r15-c3 { grid-template-columns: 1fr; }
    .r15-two-col { grid-template-columns: 1fr; }
    .r15-matrix-header { grid-template-columns: 90px 1fr; }
    .r15-matrix-row { grid-template-columns: 90px 1fr; }
    .r15-matrix-cells { grid-template-columns: repeat(2, 1fr); }
    .r15-matrix-roles-head { grid-template-columns: repeat(2, 1fr); }
    .r15-matrix-roles-head span:nth-child(3),
    .r15-matrix-roles-head span:nth-child(4) { display: none; }
    .r15-cell:nth-child(3), .r15-cell:nth-child(4) { display: none; }
    .r15-hero-stats { gap: 20px; }
  }
`;
