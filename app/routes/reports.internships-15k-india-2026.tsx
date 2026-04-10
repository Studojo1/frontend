import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  return [
    { title: "Internship Roles That Pay Above ₹15k in India | Studojo 2026" },
    { name: "description", content: "A role-by-role map of internships paying above ₹15,000/month in India in 2026. Which roles, which companies, which skills unlock the bracket." },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports/internships-15k-india-2026` },
    { property: "og:type", content: "article" },
    { property: "og:title", content: "Internship Roles That Pay Above ₹15k in India 2026" },
    { property: "og:url", content: `${BASE_URL}/reports/internships-15k-india-2026` },
    { property: "og:site_name", content: "Studojo" },
  ];
}

// Stipend brackets
// "high"   = ₹30k+      (dark amber)
// "mid"    = ₹15k–30k   (amber)
// "entry"  = ₹10k–15k   (light / borderline)
// "rare"   = role exists but <15k is common (muted)

const GRID_DATA: {
  domain: string;
  roles: { title: string; bracket: "high" | "mid" | "entry" | "rare"; range: string; note?: string }[];
}[] = [
  {
    domain: "AI / ML",
    roles: [
      { title: "ML Engineering Intern", bracket: "high", range: "₹40k–80k", note: "Highest paying intern category" },
      { title: "AI Research Intern", bracket: "high", range: "₹30k–60k", note: "Funded labs & IIT spinouts" },
      { title: "Prompt Engineering Intern", bracket: "mid", range: "₹20k–40k", note: "Fast-growing category" },
      { title: "LLM Fine-tuning Intern", bracket: "high", range: "₹35k–70k", note: "Very scarce supply" },
      { title: "Computer Vision Intern", bracket: "high", range: "₹30k–60k" },
      { title: "NLP / Speech Intern", bracket: "mid", range: "₹20k–45k" },
    ],
  },
  {
    domain: "Data",
    roles: [
      { title: "Data Science Intern", bracket: "high", range: "₹20k–50k" },
      { title: "Data Analytics Intern", bracket: "mid", range: "₹15k–30k" },
      { title: "Business Intelligence Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "Quant Research Intern", bracket: "high", range: "₹30k–60k", note: "Finance + math profile" },
      { title: "Data Engineering Intern", bracket: "mid", range: "₹20k–35k" },
      { title: "Analytics Engineering Intern", bracket: "mid", range: "₹18k–30k" },
    ],
  },
  {
    domain: "Software Engineering",
    roles: [
      { title: "SWE Intern (MNC)", bracket: "high", range: "₹30k–60k", note: "Google, Microsoft, etc." },
      { title: "Backend Intern (Startup)", bracket: "mid", range: "₹20k–40k" },
      { title: "Frontend Intern", bracket: "mid", range: "₹15k–30k" },
      { title: "Full-Stack Intern", bracket: "mid", range: "₹18k–35k" },
      { title: "DevOps / Cloud Intern", bracket: "mid", range: "₹20k–35k" },
      { title: "Security / Cybersec Intern", bracket: "mid", range: "₹20k–40k" },
    ],
  },
  {
    domain: "Product",
    roles: [
      { title: "Product Management Intern", bracket: "mid", range: "₹20k–40k", note: "B2B SaaS pays best" },
      { title: "Product Analytics Intern", bracket: "mid", range: "₹18k–30k" },
      { title: "UX Research Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "UI / UX Design Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "Growth Product Intern", bracket: "mid", range: "₹20k–35k" },
      { title: "Technical PM Intern", bracket: "high", range: "₹25k–50k" },
    ],
  },
  {
    domain: "Finance / Quant",
    roles: [
      { title: "Investment Banking Intern", bracket: "high", range: "₹30k–60k", note: "Bulge bracket / boutique" },
      { title: "Private Equity Intern", bracket: "high", range: "₹25k–50k" },
      { title: "Quant Trading Intern", bracket: "high", range: "₹40k–80k", note: "Rare but extreme pay" },
      { title: "VC / Startup Analyst Intern", bracket: "mid", range: "₹15k–30k" },
      { title: "Financial Modelling Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "Risk / Compliance Intern", bracket: "entry", range: "₹10k–20k" },
    ],
  },
  {
    domain: "Marketing",
    roles: [
      { title: "Growth Marketing Intern", bracket: "mid", range: "₹15k–25k", note: "Funded startups only" },
      { title: "Performance Marketing Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "Product Marketing Intern", bracket: "mid", range: "₹15k–20k" },
      { title: "Content Strategy Intern", bracket: "entry", range: "₹10k–18k" },
      { title: "SEO / Organic Growth Intern", bracket: "entry", range: "₹10k–15k" },
      { title: "Brand Marketing Intern", bracket: "entry", range: "₹8k–15k" },
    ],
  },
  {
    domain: "Consulting / Strategy",
    roles: [
      { title: "Strategy Consulting Intern", bracket: "high", range: "₹30k–60k", note: "MBB / Big 4" },
      { title: "Management Consulting Intern", bracket: "mid", range: "₹20k–40k" },
      { title: "Business Analyst Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "Operations Strategy Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "Policy / Research Intern", bracket: "entry", range: "₹10k–20k" },
      { title: "Market Research Intern", bracket: "entry", range: "₹8k–15k" },
    ],
  },
  {
    domain: "Operations / Supply Chain",
    roles: [
      { title: "Supply Chain Analytics Intern", bracket: "mid", range: "₹15k–25k" },
      { title: "Logistics Tech Intern", bracket: "mid", range: "₹15k–20k" },
      { title: "Operations Analyst Intern", bracket: "entry", range: "₹10k–18k" },
      { title: "Procurement Intern", bracket: "entry", range: "₹8k–15k" },
      { title: "BPO Process Intern", bracket: "rare", range: "₹5k–12k", note: "Contracting category" },
      { title: "Data Entry Intern", bracket: "rare", range: "₹5k–10k", note: "Being automated" },
    ],
  },
];

const bracketStyle = (bracket: string) => {
  switch (bracket) {
    case "high":   return { bg: "#78350f", text: "#fde68a", border: "#92400e" };
    case "mid":    return { bg: "#1c1917", text: "#f59e0b", border: "#44403c" };
    case "entry":  return { bg: "#1a1a1a", text: "#a3a3a3", border: "#2a2a2a" };
    case "rare":   return { bg: "#1a1a1a", text: "#525252", border: "#2a2a2a" };
    default:       return { bg: "#1a1a1a", text: "#a3a3a3", border: "#2a2a2a" };
  }
};

export default function Internships15kReport() {
  return (
    <>
      <Header />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <main>
        {/* Hero */}
        <div className="r15-hero">
          <div className="r15-inner">
            <div className="r15-badge">Studojo Market Analysis · Q2 2026</div>
            <nav className="r15-breadcrumb">
              <Link to="/reports" className="r15-bc-link">Reports</Link>
              <span className="r15-bc-sep">›</span>
              <span>Internships Above ₹15k</span>
            </nav>
            <h1 className="r15-h1">The Roles That Land You<br /><em>Above ₹15k</em></h1>
            <p className="r15-sub">
              Most internship advice tells you to apply everywhere. This report tells you exactly which roles break the ₹15k floor — and which ones never will, no matter who you are or where you apply.
            </p>
            <div className="r15-hero-stats">
              <div className="r15-hstat"><div className="r15-hval">48</div><div className="r15-hlbl">Roles mapped across 8 domains</div></div>
              <div className="r15-hstat"><div className="r15-hval">₹15k</div><div className="r15-hlbl">The floor that separates career-building from resume-filling</div></div>
              <div className="r15-hstat"><div className="r15-hval">₹80k</div><div className="r15-hlbl">Top of range for AI/ML and Quant roles</div></div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="r15-legend-bar">
          <div className="r15-inner r15-legend-inner">
            <span className="r15-legend-label">Stipend bracket:</span>
            <span className="r15-leg r15-leg-high">₹30k+</span>
            <span className="r15-leg r15-leg-mid">₹15k–30k</span>
            <span className="r15-leg r15-leg-entry">₹10k–15k (borderline)</span>
            <span className="r15-leg r15-leg-rare">Below ₹10k (contracting)</span>
          </div>
        </div>

        {/* The Map */}
        <div className="r15-inner r15-section">
          <div className="r15-map-header">
            <h2 className="r15-h2">The Internship Role Map</h2>
            <p className="r15-lead">Every cell is a real role category. Color shows typical stipend bracket based on live listings, Glassdoor India, Unstop, and Internshala data (Q1–Q2 2026). Notes flag outlier conditions.</p>
          </div>

          <div className="r15-grid-wrap">
            {GRID_DATA.map((domain) => (
              <div key={domain.domain} className="r15-domain-block">
                <div className="r15-domain-label">{domain.domain}</div>
                <div className="r15-role-row">
                  {domain.roles.map((role) => {
                    const s = bracketStyle(role.bracket);
                    return (
                      <div
                        key={role.title}
                        className="r15-role-cell"
                        style={{ backgroundColor: s.bg, borderColor: s.border }}
                      >
                        <div className="r15-role-title" style={{ color: s.text }}>{role.title}</div>
                        <div className="r15-role-range" style={{ color: role.bracket === "high" ? "#fbbf24" : role.bracket === "mid" ? "#d97706" : "#525252" }}>{role.range}</div>
                        {role.note && <div className="r15-role-note">{role.note}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="r15-map-note">Data note: Stipend ranges are based on live listing analysis (Internshala, Unstop, LinkedIn India, Glassdoor) and reflect the realistic range for a credible applicant, not the stated maximum. Ranges are directional. Individual listings vary.</p>
        </div>

        {/* CTA strip */}
        <div className="r15-cta-strip">
          <div className="r15-inner r15-cta-inner">
            <span>Looking for the roles in the amber and gold brackets?</span>
            <Link to="/dojos/internships" className="r15-cta-pill">Find them on Studojo →</Link>
          </div>
        </div>

        {/* Finding 1 */}
        <div className="r15-inner r15-section">
          <div className="r15-finding">
            <span className="r15-fnum">Finding 01</span>
            <h2 className="r15-h2">Three domains own the ₹30k+ bracket. Everything else is playing for ₹15k–25k at best.</h2>
            <p className="r15-lead">AI/ML, Quant Finance, and Strategy Consulting are the only domains where ₹30k+ is a realistic floor, not a ceiling. Across every other domain, ₹15k–25k is where strong applicants land. Understanding this before you start applying is the single most useful thing this report can tell you.</p>

            <div className="r15-stat-row">
              <div className="r15-stat">
                <div className="r15-val" style={{ color: "#f59e0b" }}>₹40k–80k</div>
                <div className="r15-lbl">AI/ML intern range at funded tech cos</div>
                <span className="r15-src">Glassdoor India / Unstop 2026</span>
              </div>
              <div className="r15-stat">
                <div className="r15-val" style={{ color: "#f59e0b" }}>₹40k–80k</div>
                <div className="r15-lbl">Quant trading intern range (rare but real)</div>
                <span className="r15-src">Jane Street / Graviton / WorldQuant India</span>
              </div>
              <div className="r15-stat">
                <div className="r15-val" style={{ color: "#f59e0b" }}>₹30k–60k</div>
                <div className="r15-lbl">Strategy consulting intern (MBB/Big 4)</div>
                <span className="r15-src">Glassdoor India verified listings</span>
              </div>
            </div>

            <div className="r15-callout r15-co-amber">
              <div className="r15-cl">The 3x rule</div>
              <p>The difference between a ₹10k internship and a ₹30k internship is not luck. It is almost always domain selection made 6 months earlier. Students who land the top bracket started building the right skill profile before placement season, not during it.</p>
            </div>
          </div>
        </div>

        {/* Finding 2 */}
        <div className="r15-inner r15-section">
          <div className="r15-finding">
            <span className="r15-fnum">Finding 02</span>
            <h2 className="r15-h2">Company stage matters more than company name. A Series B startup often pays more than a brand-name MNC.</h2>
            <p className="r15-lead">The assumption that big companies pay the best is wrong at intern level in India. MNCs in non-core roles routinely pay ₹8k–15k. Series A and B funded startups in product, data, and growth roles are paying ₹20k–40k to compete for the same candidates. The name is not the signal. The funding stage is.</p>

            <div className="r15-two-col">
              <div>
                <div className="r15-col-head">What actually drives stipend above ₹15k</div>
                <div className="r15-card">
                  {[
                    ["Funding stage", "Series A+ startups pay to compete. Pre-seed rarely can.", "#f59e0b"],
                    ["Role category", "Tech and quant roles pay 2–3x non-tech at same company", "#f59e0b"],
                    ["Skill scarcity", "ML, Quant, DevOps — supply is far below demand", "#fbbf24"],
                    ["Company type", "Product-led > service-led. B2B SaaS pays more than agencies", "#fbbf24"],
                    ["Location", "Bangalore and Mumbai pay 20–30% more than tier-2 cities", "#a3a3a3"],
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
                    ["College brand", "IIT vs NIT matters less than portfolio at intern level", "#525252"],
                    ["Company name alone", "Fortune 500 in India often pays ₹10k–15k for non-core roles", "#525252"],
                    ["CGPA", "Threshold matters (usually 7+) but beyond that, irrelevant", "#525252"],
                    ["Certifications", "A Coursera certificate does not move stipend. Projects do.", "#525252"],
                    ["Number of applications", "Volume without targeting actively hurts callback rate", "#525252"],
                  ].map(([label, desc]) => (
                    <div key={label as string} className="r15-bar-item" style={{ borderLeftColor: "#333" }}>
                      <div className="r15-bar-label" style={{ color: "#737373" }}>{label as string}</div>
                      <div className="r15-bar-desc" style={{ color: "#525252" }}>{desc as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Finding 3 */}
        <div className="r15-inner r15-section">
          <div className="r15-finding">
            <span className="r15-fnum">Finding 03</span>
            <h2 className="r15-h2">Five skills unlock the ₹15k+ bracket across almost every domain. Most students have none of them at a useful level.</h2>
            <p className="r15-lead">The ₹15k floor is not about degree or grades. It is about a small set of applied skills that are in short supply. The students getting the amber and gold roles have at least two of these at a demonstrable, project-backed level — not just listed on a resume.</p>

            <div className="r15-skills-grid">
              {[
                { skill: "Python + data fluency", impact: "+₹8k–15k vs baseline", desc: "Appears in 61% of ₹15k+ JDs. Pandas, basic SQL, able to clean and analyse a dataset without guidance.", color: "#f59e0b" },
                { skill: "AI tool proficiency", impact: "+₹5k–12k vs baseline", desc: "Not just ChatGPT. Cursor, Notion AI, LLM API calls, prompt structuring. Employers test this now.", color: "#f59e0b" },
                { skill: "Financial modelling (Excel)", impact: "+₹8k–20k in finance roles", desc: "3-statement model, DCF, scenario analysis. 95% of finance JDs above ₹15k require this at working level.", color: "#fbbf24" },
                { skill: "Product / growth thinking", impact: "+₹5k–10k in product roles", desc: "Can you identify a user problem, frame a metric, and propose a test? This is what PM internship interviews test.", color: "#fbbf24" },
                { skill: "A real portfolio project", impact: "Most multiplied signal", desc: "One deployed project, one live dataset analysis, one growth experiment with results. Matters more than all certifications combined.", color: "#10b981" },
              ].map((item) => (
                <div key={item.skill} className="r15-skill-card" style={{ borderColor: item.color }}>
                  <div className="r15-skill-name" style={{ color: item.color }}>{item.skill}</div>
                  <div className="r15-skill-impact">{item.impact}</div>
                  <div className="r15-skill-desc">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="r15-callout r15-co-green">
              <div className="r15-cl">The minimum viable profile for ₹15k+</div>
              <p>One domain you know well. One of the five skills above at project level. One application tailored to the company, not copied from a template. That combination gets callbacks. Not a perfect CGPA. Not a premium certification. That combination.</p>
            </div>
            <p className="r15-source">Source: Internshala JD analysis Q1 2026; NASSCOM skills demand report 2025; Glassdoor India intern salary data</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="r15-final-cta">
          <div className="r15-final-title">Work on things that matter.</div>
          <div className="r15-final-sub">Studojo surfaces the roles in the amber and gold brackets — niche, high-signal, across India. Not the generic listings. The ones worth your time.</div>
          <div className="r15-final-btns">
            <Link to="/dojos/internships" className="r15-btn-dark">Find ₹15k+ Internships</Link>
            <Link to="/reports" className="r15-btn-outline">Read More Reports</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const css = `
  .r15-hero { background: #0a0a0a; padding: 80px 24px 60px; }
  .r15-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  .r15-badge { display: inline-block; background: #1c1917; border: 1px solid #44403c; color: #f59e0b; font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin-bottom: 16px; }
  .r15-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-family: 'Satoshi', sans-serif; font-size: 14px; color: #737373; }
  .r15-bc-link { color: #a3a3a3; text-decoration: none; } .r15-bc-link:hover { color: #fff; }
  .r15-bc-sep { color: #525252; }
  .r15-h1 { font-family: 'Clash Display', sans-serif; font-size: clamp(40px, 6vw, 72px); font-weight: 700; color: #fff; line-height: 1.05; letter-spacing: -2px; margin: 0 0 20px; }
  .r15-h1 em { color: #f59e0b; font-style: normal; }
  .r15-sub { font-family: 'Satoshi', sans-serif; font-size: 18px; color: #a3a3a3; line-height: 1.7; max-width: 680px; margin: 0 0 40px; }
  .r15-hero-stats { display: flex; gap: 40px; flex-wrap: wrap; }
  .r15-hstat { border-left: 3px solid #292524; padding-left: 20px; }
  .r15-hval { font-family: 'Clash Display', sans-serif; font-size: 36px; font-weight: 700; color: #f59e0b; }
  .r15-hlbl { font-family: 'Satoshi', sans-serif; font-size: 13px; color: #737373; margin-top: 4px; max-width: 180px; }

  .r15-legend-bar { background: #111; border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 14px 24px; }
  .r15-legend-inner { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .r15-legend-label { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #737373; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-right: 4px; }
  .r15-leg { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 4px; border: 1px solid; }
  .r15-leg-high  { background: #78350f; color: #fde68a; border-color: #92400e; }
  .r15-leg-mid   { background: #1c1917; color: #f59e0b; border-color: #44403c; }
  .r15-leg-entry { background: #1a1a1a; color: #a3a3a3; border-color: #2a2a2a; }
  .r15-leg-rare  { background: #1a1a1a; color: #525252; border-color: #222; }

  .r15-section { padding: 60px 24px; }
  .r15-map-header { margin-bottom: 32px; }
  .r15-h2 { font-family: 'Clash Display', sans-serif; font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: #fff; line-height: 1.2; margin: 8px 0 16px; }
  .r15-lead { font-family: 'Satoshi', sans-serif; font-size: 17px; color: #a3a3a3; line-height: 1.7; max-width: 780px; margin: 0 0 24px; }

  .r15-grid-wrap { display: flex; flex-direction: column; gap: 2px; border: 1px solid #222; border-radius: 8px; overflow: hidden; }
  .r15-domain-block { display: flex; align-items: stretch; }
  .r15-domain-label { width: 160px; min-width: 160px; background: #111; color: #f59e0b; font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: flex; align-items: center; padding: 12px 16px; border-right: 1px solid #222; border-bottom: 1px solid #1a1a1a; }
  .r15-role-row { display: grid; grid-template-columns: repeat(6, 1fr); flex: 1; gap: 2px; background: #0a0a0a; padding: 2px; }
  .r15-role-cell { padding: 12px 14px; border-radius: 4px; border: 1px solid; cursor: default; transition: opacity 0.15s; }
  .r15-role-cell:hover { opacity: 0.85; }
  .r15-role-title { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; line-height: 1.3; margin-bottom: 4px; }
  .r15-role-range { font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 600; margin-bottom: 3px; }
  .r15-role-note  { font-family: 'Satoshi', sans-serif; font-size: 10px; color: #737373; line-height: 1.3; margin-top: 4px; }
  .r15-map-note { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #525252; margin-top: 20px; line-height: 1.6; border-left: 2px solid #292524; padding-left: 12px; }

  .r15-cta-strip { background: #111; border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 20px 24px; }
  .r15-cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; font-family: 'Satoshi', sans-serif; font-size: 15px; color: #a3a3a3; }
  .r15-cta-pill { background: #f59e0b; color: #0a0a0a; font-weight: 700; padding: 10px 20px; border-radius: 100px; text-decoration: none; font-size: 14px; white-space: nowrap; }

  .r15-finding { }
  .r15-fnum { font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #f59e0b; background: #1c1917; border: 1px solid #44403c; padding: 4px 12px; border-radius: 100px; }

  .r15-stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
  .r15-stat { background: #111; border: 1px solid #222; border-radius: 8px; padding: 20px; }
  .r15-val { font-family: 'Clash Display', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 6px; }
  .r15-lbl { font-family: 'Satoshi', sans-serif; font-size: 13px; color: #a3a3a3; line-height: 1.5; margin-bottom: 8px; }
  .r15-src { font-family: 'Satoshi', sans-serif; font-size: 11px; color: #525252; }

  .r15-callout { border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
  .r15-co-amber { background: #1c1917; border: 1px solid #44403c; }
  .r15-co-green { background: #052e16; border: 1px solid #14532d; }
  .r15-cl { font-family: 'Satoshi', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #f59e0b; margin-bottom: 8px; }
  .r15-callout p { font-family: 'Satoshi', sans-serif; font-size: 14px; color: #d4d4d4; line-height: 1.7; margin: 0; }
  .r15-co-green .r15-cl { color: #4ade80; }

  .r15-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 32px 0; }
  .r15-col-head { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #737373; margin-bottom: 12px; }
  .r15-card { background: #111; border: 1px solid #222; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .r15-bar-item { border-left: 3px solid; padding-left: 12px; }
  .r15-bar-label { font-family: 'Satoshi', sans-serif; font-size: 13px; font-weight: 700; color: #e5e5e5; margin-bottom: 2px; }
  .r15-bar-desc { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #737373; line-height: 1.5; }

  .r15-skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin: 32px 0; }
  .r15-skill-card { background: #111; border: 1px solid; border-radius: 8px; padding: 20px; }
  .r15-skill-name { font-family: 'Clash Display', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .r15-skill-impact { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
  .r15-skill-desc { font-family: 'Satoshi', sans-serif; font-size: 13px; color: #a3a3a3; line-height: 1.6; }

  .r15-source { font-family: 'Satoshi', sans-serif; font-size: 12px; color: #525252; margin-top: 16px; border-left: 2px solid #292524; padding-left: 12px; line-height: 1.6; }

  .r15-final-cta { background: #f59e0b; padding: 80px 24px; text-align: center; }
  .r15-final-title { font-family: 'Clash Display', sans-serif; font-size: clamp(32px, 5vw, 56px); font-weight: 700; color: #0a0a0a; margin-bottom: 16px; }
  .r15-final-sub { font-family: 'Satoshi', sans-serif; font-size: 17px; color: rgba(10,10,10,0.65); max-width: 600px; margin: 0 auto 32px; line-height: 1.7; }
  .r15-final-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .r15-btn-dark { background: #0a0a0a; color: #f59e0b; font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; border: 2px solid #0a0a0a; }
  .r15-btn-outline { background: transparent; color: #0a0a0a; font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; border: 2px solid rgba(10,10,10,0.3); }

  @media (max-width: 768px) {
    .r15-stat-row { grid-template-columns: 1fr; }
    .r15-two-col { grid-template-columns: 1fr; }
    .r15-domain-block { flex-direction: column; }
    .r15-domain-label { width: 100%; min-width: unset; border-right: none; border-bottom: 1px solid #222; }
    .r15-role-row { grid-template-columns: repeat(2, 1fr); }
    .r15-hero-stats { gap: 20px; }
  }
`;
