import type { ReactNode } from "react";
import { FiGlobe } from "react-icons/fi";
import { Footer, Header } from "~/components";
import { Kicker, StartPill, TileIcon } from "../ui";

// SITE-V2 /about on B2C hosts (routes/about.tsx hands over here; html[data-sv2="about"], site-pages.css). Layout only:
// the route's own copy and lists (PARTS, PRINCIPLES, MARKETS, passed in), in the h1 language: mono kickers, lowercase
// display headings (lowercased in CSS, the words are the route's), white cards with lilac icon tiles, one purple pill
// in the head. Dropped on B2C, as decoration or doubles: the colour slabs, the black band, the per-card "Start with
// Stu" buttons, the "Explore Studojo" buttons back to / and the closing "Ready to get started?" band (the site footer
// closes every page with the same call to start).

type Part = { title: string; description: string; checklist: readonly string[] };
type Principle = { number: string; heading: string; body: string };
type Market = { flag: string; name: string; detail: string };

const PART_ICONS = ["search", "doc", "mail"] as const;

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Head({ kicker, children, lead }: { kicker: string; children: ReactNode; lead?: string }) {
  return (
    <header className="sva-head">
      <Kicker>{kicker}</Kicker>
      <h2 className="sv-h2">{children}</h2>
      {lead ? <p className="sv-lead">{lead}</p> : null}
    </header>
  );
}

export function AboutB2C({ parts, principles, markets }: { parts: readonly Part[]; principles: readonly Principle[]; markets: readonly Market[] }) {
  return (
    <>
      <Header />
      <main className="sv-page sva">
        <section className="sv-in">
          <div className="sv-pagehead sv-center sva-hero">
            <Kicker>Bengaluru, India. Serving students globally.</Kicker>
            <h1 className="sv-h1">
              Built for students
              <br />
              who mean business.
            </h1>
            <p className="sv-lead">
              Studojo is a job agent for students. Stu cuts through the noise so ambitious students can spend their time on work that genuinely moves the needle.
            </p>
            <StartPill place="about" className="sva-start" />
          </div>
        </section>

        {/* Our story */}
        <section className="sv-sec">
          <div className="sv-in sva-story">
            <div>
              <Kicker>Our story</Kicker>
              <h2 className="sv-h2">
                Most career tools are built for employers.
                <br />
                <span className="sva-soft">We built ours for you.</span>
              </h2>
            </div>
            <div className="sva-story-copy">
              <p className="sv-body">
                Studojo started with a simple observation: students were spending hours on job boards and finding nothing. Writing generic cover letters nobody read. Applying into silence.
              </p>
              <p className="sv-body">
                The tools that existed were either built to help recruiters filter applicants, or built to extract money from students in exchange for marginal improvements.
              </p>
              <p className="sv-body">
                We flipped that. Stu, our job agent, finds the roles that fit you, tailors your resume to each one, and drafts the email to the right person that you send from your own mailbox.
              </p>
            </div>
          </div>
        </section>

        {/* How we think */}
        <section className="sv-sec">
          <div className="sv-in">
            <Head kicker="How we think">Three things we never compromise on.</Head>
            <div className="sva-three">
              {principles.map((p) => (
                <article key={p.number} className="sv-card sva-card">
                  <span className="sva-num">{p.number}</span>
                  <h3 className="sv-h3">{p.heading}</h3>
                  <p className="sv-body">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* The product */}
        <section className="sv-sec">
          <div className="sv-in">
            <Head kicker="The product">One agent for the whole job hunt. No bloat.</Head>
            <div className="sva-three">
              {parts.map((d, i) => (
                <article key={d.title} className="sv-card sva-card">
                  <TileIcon name={PART_ICONS[i % PART_ICONS.length]} />
                  <h3 className="sv-h3">{d.title}</h3>
                  <p className="sv-body">{d.description}</p>
                  <ul className="sva-checks">
                    {d.checklist.map((item) => (
                      <li key={item}>
                        <Check />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Who we serve */}
        <section className="sv-sec">
          <div className="sv-in">
            <Head kicker="Who we serve" lead="Undergrad and postgrad students, 18-25, who are serious about building real careers. Not passive job seekers.">
              Ambitious students.
              <br />
              5 markets. One standard.
            </Head>
            <div className="sva-markets">
              {markets.map((m) => (
                <div key={m.name} className="sv-card sva-market">
                  <div className="sva-market-top">
                    <span className="sv-ico sva-flag" aria-hidden="true">
                      {m.flag}
                    </span>
                    <h3 className="sv-h3">{m.name}</h3>
                  </div>
                  <p className="sv-body">{m.detail}</p>
                </div>
              ))}
              <div className="sv-card sv-card-soft sva-market sva-more">
                <span className="sv-ico" aria-hidden="true">
                  <FiGlobe />
                </span>
                <p className="sv-body">And wherever ambitious students are trying to build real careers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our north star */}
        <section className="sv-sec">
          <div className="sv-in sva-star">
            <Kicker>Our north star</Kicker>
            <p className="sv-h1 sva-star-line">
              Work on things
              <br />
              that matter.
            </p>
            <p className="sv-lead">
              This is not motivational fluff. It is a filter. Is this role going to teach you something real? Will this experience make a difference to someone? Will you be proud of what you worked on? That is the standard we hold our products to. We think students should hold their opportunities to it too.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
