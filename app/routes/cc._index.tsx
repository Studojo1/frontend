import { Link } from "react-router";

export function meta() {
  return [
    { title: "CareerDojo | Your Personal Career Coach" },
    {
      name: "description",
      content:
        "Get a personalised readiness score, gap analysis, and week-by-week action plan — based on your actual profile. Free to start.",
    },
  ];
}


const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Tell the coach about yourself",
    desc: "No forms. No uploads. Just a conversation. The AI asks about your degree, skills, experience, and what you are going after — and listens.",
  },
  {
    num: "02",
    title: "Get your Career DNA",
    desc: "You receive a readiness score, a detailed gap analysis, and a clear picture of exactly what is holding your reply rate back.",
  },
  {
    num: "03",
    title: "Follow your weekly roadmap",
    desc: "One prioritised action per week. Closes your gaps. Moves your readiness score. Tracks your progress every time you come back.",
  },
];

const WHAT_YOU_GET = [
  {
    color: "#7C3AED",
    bg: "#F3F0FF",
    label: "Career DNA",
    title: "Know exactly where you stand",
    bullets: [
      "Readiness score out of 100",
      "Skills, industry, and experience gaps",
      "Personalised clarity score",
    ],
    cta: "Get your Career DNA",
    href: "/cc/chat",
  },
  {
    color: "#0891B2",
    bg: "#ECFEFF",
    label: "Gap Analysis",
    title: "See what is holding you back",
    bullets: [
      "Skills gap ranked by impact",
      "Industry knowledge gaps",
      "Experience gaps vs target role",
    ],
    cta: "Run your gap analysis",
    href: "/cc/chat",
  },
  {
    color: "#D97706",
    bg: "#FFFBEB",
    label: "Weekly Action Plan",
    title: "One thing to do this week",
    bullets: [
      "Highest-leverage move for your profile",
      "Updates every week as you close gaps",
      "Tracks your score improvement",
    ],
    cta: "Get your action plan",
    href: "/cc/chat",
  },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.lp-root { font-family: 'Inter', sans-serif; background: #fff; color: #111; }
.lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* NAV */
.lp-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 64px;
  background: #fff; border-bottom: 2px solid #111;
  box-shadow: 0 2px 0 #111;
}
/* studojo wordmark — matches the main platform: Satoshi 900, brand ink black, tight tracking, no dot. */
.lp-nav-logo { font-size: 1.75rem; font-weight: 900; letter-spacing: -0.055em; line-height: 1; text-decoration: none; color: #191A23; font-family: "Satoshi", ui-sans-serif, system-ui, sans-serif; }
.lp-nav-dot { display: none; }
.lp-nav-cta { background: #111; color: #fff; font-weight: 700; font-size: 0.9rem; padding: 10px 22px; border-radius: 999px; text-decoration: none; transition: opacity 0.15s; }
.lp-nav-cta:hover { opacity: 0.8; }

/* HERO */
.lp-hero {
  background: #6D28D9;
  padding: 100px 48px 80px;
  text-align: left;
  max-width: 100%;
}
.lp-hero-inner { max-width: 720px; }
.lp-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);
  border-radius: 999px; padding: 5px 14px;
  font-size: 0.72rem; font-weight: 700; color: #E9D5FF;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 28px;
}
.lp-hero-eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #A78BFA; flex-shrink: 0; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.lp-hero h1 {
  font-size: clamp(2.4rem, 5vw, 4rem); font-weight: 800; line-height: 1.1;
  letter-spacing: -0.04em; color: #fff; margin-bottom: 24px;
}
.lp-hero-sub { font-size: 1.125rem; color: #DDD6FE; line-height: 1.65; max-width: 560px; margin-bottom: 40px; }
.lp-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
.lp-btn-primary {
  background: #fff; color: #6D28D9; font-weight: 800; font-size: 1rem;
  padding: 15px 32px; border-radius: 999px;
  border: 2px solid #111; box-shadow: 4px 4px 0 #111;
  text-decoration: none; transition: all 0.15s; display: inline-block;
}
.lp-btn-primary:hover { transform: translate(2px,2px); box-shadow: 2px 2px 0 #111; }
.lp-btn-ghost {
  background: transparent; color: #fff; font-weight: 700; font-size: 1rem;
  padding: 15px 32px; border-radius: 999px;
  border: 2px solid rgba(255,255,255,0.4);
  text-decoration: none; transition: all 0.15s; display: inline-block;
}
.lp-btn-ghost:hover { background: rgba(255,255,255,0.1); }
.lp-hero-meta { margin-top: 28px; font-size: 0.78rem; color: #C4B5FD; font-weight: 500; }

/* STATS BAR */
.lp-stats {
  background: #5B21B6; border-top: 2px solid rgba(255,255,255,0.1);
  display: grid; grid-template-columns: repeat(4,1fr);
  divide-x: 1px solid rgba(255,255,255,0.1);
}
.lp-stat {
  padding: 28px 40px; border-right: 1px solid rgba(255,255,255,0.12);
}
.lp-stat:last-child { border-right: none; }
.lp-stat-num { font-size: 2rem; font-weight: 800; color: #fff; letter-spacing: -0.03em; }
.lp-stat-label { font-size: 0.78rem; color: #C4B5FD; margin-top: 4px; font-weight: 500; }


/* HOW IT WORKS */
.lp-section { padding: 80px 48px; }
.lp-section-label {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.14em; color: #7C3AED; margin-bottom: 14px;
}
.lp-section h2 {
  font-size: clamp(1.8rem,3.5vw,2.75rem); font-weight: 800;
  letter-spacing: -0.04em; color: #111; margin-bottom: 10px;
}
.lp-section-sub { font-size: 1rem; color: #71717A; margin-bottom: 52px; }
.lp-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
.lp-step-card {
  border: 2px solid #111; border-radius: 20px; padding: 28px 28px 32px;
  box-shadow: 4px 4px 0 #111; background: #fff; position: relative;
}
.lp-step-num {
  font-size: 3rem; font-weight: 800; color: #F3F0FF;
  letter-spacing: -0.04em; line-height: 1; margin-bottom: 12px;
}
.lp-step-title { font-size: 1.05rem; font-weight: 800; color: #111; margin-bottom: 10px; }
.lp-step-desc { font-size: 0.875rem; color: #71717A; line-height: 1.65; }

/* WHAT YOU GET — coloured cards */
.lp-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
.lp-feature-card {
  border-radius: 20px; padding: 32px; position: relative; overflow: hidden;
  border: 2px solid #111; box-shadow: 5px 5px 0 #111;
}
.lp-card-label {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; margin-bottom: 14px; opacity: 0.7;
}
.lp-card-title { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 20px; line-height: 1.3; }
.lp-card-bullets { list-style: none; margin-bottom: 28px; }
.lp-card-bullets li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 0.875rem; line-height: 1.55; margin-bottom: 10px; font-weight: 500;
}
.lp-card-bullets li::before { content: "✓"; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
.lp-card-cta {
  display: inline-block; background: rgba(0,0,0,0.08);
  border: 2px solid rgba(0,0,0,0.15); border-radius: 999px;
  padding: 10px 22px; font-size: 0.85rem; font-weight: 700;
  text-decoration: none; transition: all 0.15s;
}
.lp-card-cta:hover { background: rgba(0,0,0,0.15); transform: translateY(-1px); }

/* SOCIAL PROOF QUOTE */
.lp-proof-section { background: #FAFAF9; border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 80px 48px; }
.lp-quotes { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
.lp-quote {
  background: #fff; border: 2px solid #111; border-radius: 20px;
  padding: 28px; box-shadow: 4px 4px 0 #111;
}
.lp-quote-text { font-size: 0.95rem; color: #374151; line-height: 1.65; margin-bottom: 20px; font-style: italic; }
.lp-quote-name { font-size: 0.78rem; font-weight: 700; color: #111; }
.lp-quote-detail { font-size: 0.72rem; color: #71717A; margin-top: 2px; }

/* CTA BANNER */
.lp-cta-banner {
  background: #F59E0B; padding: 80px 48px; text-align: center;
  border-top: 2px solid #111;
}
.lp-cta-banner h2 {
  font-size: clamp(2rem,4vw,3rem); font-weight: 800; color: #111;
  letter-spacing: -0.04em; margin-bottom: 16px; line-height: 1.2;
}
.lp-cta-banner p { font-size: 1rem; color: rgba(0,0,0,0.65); margin-bottom: 36px; }

/* FOOTER */
.lp-footer {
  padding: 32px 48px; border-top: 2px solid #111;
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.78rem; color: #71717A;
}
.lp-footer a { color: #71717A; text-decoration: none; }
.lp-footer a:hover { color: #111; }

@media(max-width:768px){
  .lp-nav{padding:0 20px;}
  .lp-hero{padding:64px 20px 56px;}
  .lp-stats{grid-template-columns:1fr 1fr;}
  .lp-trust{padding:20px;}
  .lp-section{padding:56px 20px;}
  .lp-steps{grid-template-columns:1fr;}
  .lp-cards{grid-template-columns:1fr;}
  .lp-proof-section{padding:56px 20px;}
  .lp-quotes{grid-template-columns:1fr;}
  .lp-cta-banner{padding:56px 20px;}
  .lp-footer{flex-direction:column;gap:12px;text-align:center;padding:28px 20px;}
  .lp-stat{padding:20px 24px;}
}
`;

const QUOTES = [
  {
    text: "I had no idea what was actually stopping me from getting replies. The readiness score told me exactly which skill to build first. Got an interview at Razorpay two weeks later.",
    name: "Arjun S.",
    detail: "B.Tech CS, SRM — targeting Product",
  },
  {
    text: "Every career counsellor I talked to gave me the same generic advice. This actually read my profile and told me the specific gap I needed to close.",
    name: "Priya M.",
    detail: "BCom, Mumbai — Finance track",
  },
  {
    text: "I was applying to everything and getting nothing. The coach told me I was going too broad. Narrowed my target, updated my approach, got three replies in 10 days.",
    name: "Rahul K.",
    detail: "MBA, non-IIM — Consulting pivot",
  },
];

export default function CcIndex() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lp-root">

        {/* NAV */}
        <nav className="lp-nav">
          <a href="/cc" className="lp-nav-logo">
            studojo<span className="lp-nav-dot" />
          </a>
          <Link to="/cc/chat" className="lp-nav-cta">Start for free →</Link>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <div className="lp-hero-eyebrow">
              <span className="lp-hero-eyebrow-dot" />
              Career Coach — Free to start
            </div>
            <h1>Skip the guessing.<br />Know exactly what to do next.</h1>
            <p className="lp-hero-sub">
              Stop applying blindly. Get a personalised readiness score, a skills gap breakdown, and a week-by-week action plan, built around your actual profile. The more you talk to the coach, the better it knows you and the sharper your plan gets.
            </p>
            <div className="lp-hero-btns">
              <Link to="/cc/chat" className="lp-btn-primary">Get my Career DNA →</Link>
              <a href="#how-it-works" className="lp-btn-ghost">See how it works</a>
            </div>
            <div className="lp-hero-meta">Takes 8 minutes. Free. No account needed to start. Gets smarter the more you use it.</div>
          </div>
        </section>

        {/* STATS BAR */}
        <div className="lp-stats">
          <div className="lp-stat">
            <div className="lp-stat-num">8 min</div>
            <div className="lp-stat-label">to your Career DNA</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num">3x</div>
            <div className="lp-stat-label">better reply rate after closing gaps</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num">100%</div>
            <div className="lp-stat-label">personalised to your profile</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num">Free</div>
            <div className="lp-stat-label">to get started today</div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="lp-section" id="how-it-works">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="lp-section-label">How it works</div>
            <h2>Three steps. Your roadmap is ready.</h2>
            <p className="lp-section-sub">No forms, no uploads. Just a conversation that builds your complete career picture.</p>
            <div className="lp-steps">
              {HOW_IT_WORKS.map((s, i) => (
                <div key={i} className="lp-step-card">
                  <div className="lp-step-num">{s.num}</div>
                  <div className="lp-step-title">{s.title}</div>
                  <div className="lp-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="lp-section" style={{ background: "#FAFAF9", borderTop: "2px solid #111" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="lp-section-label">What you get</div>
            <h2>Everything in one session.</h2>
            <p className="lp-section-sub">Built around your degree, skills, and target role — not a generic checklist.</p>
            <div className="lp-cards">
              {WHAT_YOU_GET.map((c, i) => (
                <div key={i} className="lp-feature-card" style={{ background: c.bg }}>
                  <div className="lp-card-label" style={{ color: c.color }}>{c.label}</div>
                  <div className="lp-card-title" style={{ color: c.color }}>{c.title}</div>
                  <ul className="lp-card-bullets" style={{ color: c.color }}>
                    {c.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                  <Link to={c.href} className="lp-card-cta" style={{ color: c.color }}>
                    {c.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUOTES */}
        <section className="lp-proof-section">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="lp-section-label">What students say</div>
            <h2 style={{ marginBottom: 48 }}>Real feedback from real profiles.</h2>
            <div className="lp-quotes">
              {QUOTES.map((q, i) => (
                <div key={i} className="lp-quote">
                  <div className="lp-quote-text">"{q.text}"</div>
                  <div className="lp-quote-name">{q.name}</div>
                  <div className="lp-quote-detail">{q.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="lp-cta-banner">
          <h2>Know exactly where you stand.</h2>
          <p>Takes 8 minutes. Free to get started. No account needed.</p>
          <Link to="/cc/chat" className="lp-btn-primary" style={{ display: "inline-block", background: "#111", color: "#F59E0B" }}>
            Get my Career DNA →
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div>© 2026 Studojo. All rights reserved.</div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="https://studojo.com">Main platform</a>
            <a href="https://studojo.com/outreach">Outreach Dojo</a>
            <a href="https://studojo.com/dojos/internships">Internship Dojo</a>
          </div>
        </footer>

      </div>
    </>
  );
}
