import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check } from "./icons";
import { faceSrc } from "./StuArt";

// HOMEPAGE V3 how it works: the four examples, drawn the way the Stu desk draws them (1 Nov 2026, the founder: "more
// visuals throughout the page with actual UI components of our product"). Light, static copies of career-agent's
// app/components/desk3: a call with Stu and his chat lines (frame/stu), a match on My matches (jobs/MatchRow.tsx: the
// fit ring and its word, the title, the company's logo tile, place and type, one reason, Add to email campaign), who's
// hiring on a campaign row (liked/LikedList.tsx), the email with its Start (preview/CheckEmail.tsx, mail/index.tsx) and
// a reply as Replies lists it (emails/Replies.tsx). No data and nothing to press: each sits in a figure labelled
// Example, its inside hidden from screen readers (the figure's own label says what it shows).
// Made-up people, a first name and an initial only; the companies are three from the proof list further down the page,
// their logos from the Context.dev Logo Link CDN as the Sensei app draws them (routes/bob.tsx), else Google's icon,
// else the first letter. Swap them here.
// Motion (Motion.tsx, how.css): the ring's number counts up ([data-count] b), the email types itself ([data-type]) and
// its figure gets hv3-typed; the rest is CSS, played when the step floats in. The still state is the finished example.

type Company = { name: string; domain: string };
const RAZORPAY: Company = { name: "Razorpay", domain: "razorpay.com" };
const SWIGGY: Company = { name: "Swiggy", domain: "swiggy.com" };
const GROWW: Company = { name: "Groww", domain: "groww.in" };
/** The example email. It types itself (Motion.tsx) over a hidden copy that holds its height, so nothing below moves. */
const BODY =
  "Hi Ananya, I saw the Business Analyst opening on your team. I built a sales dashboard that cut a weekly report from six hours to two, and I'd love to do that kind of work with you.";

const LOGO_CLIENT_ID = (import.meta.env as Record<string, string | undefined>).VITE_CONTEXT_LOGO_CLIENT_ID || "";
const logoSrc = (domain: string) =>
  LOGO_CLIENT_ID
    ? `https://logos.context.dev/?publicClientId=${LOGO_CLIENT_ID}&domain=${encodeURIComponent(domain)}&theme=light`
    : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

/** The company's logo on a white tile (the desk's CompanyLogo): the letter when the image fails. */
function Logo({ co, big = false }: { co: Company; big?: boolean }) {
  const [bad, setBad] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // An image that failed before React listened for it: read it once the page is live.
  useEffect(() => {
    const el = img.current;
    if (el?.complete && el.naturalWidth === 0) setBad(true);
  }, []);
  return (
    <span className={`hv3x-logo${big ? " hv3x-logo-md" : ""}`}>
      {bad ? (
        co.name[0]
      ) : (
        <img ref={img} src={logoSrc(co.domain)} alt="" decoding="async" referrerPolicy="no-referrer" draggable={false} onError={() => setBad(true)} />
      )}
    </span>
  );
}

/** The fit ring (the desk's ScoreRing): green from 75, purple below. `count`: its number counts up (Motion.tsx). */
function Ring({ pct, count = false }: { pct: number; count?: boolean }) {
  return (
    <span className={`hv3x-ring${pct >= 75 ? " hv3x-ring-hi" : ""}`} style={{ "--p": pct } as CSSProperties} data-count={count || undefined}>
      <svg viewBox="0 0 48 48">
        <circle className="hv3x-ring-bg" cx="24" cy="24" r="20" />
        <circle className="hv3x-ring-fg" cx="24" cy="24" r="20" pathLength={100} />
      </svg>
      <b>{pct}%</b>
    </span>
  );
}

function Face() {
  return (
    <span className="hv3x-face">
      <img src={faceSrc("happy")} alt="" width={28} height={28} draggable={false} />
    </span>
  );
}

function Send({ className }: { className?: string }) {
  return (
    <svg className={className ?? "hv3x-ico"} viewBox="0 0 24 24">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

/** 1. Tell Stu what you want: a call with Stu, his lines and yours, and what he noted. */
export function CallExample() {
  return (
    <figure
      className="hv3x hv3x-call"
      aria-label="Example: part of a call with Stu. You say you want a business analyst role in Bengaluru or remote, Stu notes it, then asks the lowest pay you would take."
    >
      <figcaption className="hv3x-tag">Example</figcaption>
      <div className="hv3x-app" aria-hidden="true">
        <div className="hv3x-bar">
          <Face />
          <span className="hv3x-bar-words">
            <b>Call with Stu</b>
            <small>
              <i className="hv3x-live" />
              Live
            </small>
          </span>
          <span className="hv3x-wave">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="hv3x-end">End</span>
        </div>
        <div className="hv3x-log">
          <div className="hv3x-stu">
            <Face />
            <p>What kind of role are you looking for?</p>
          </div>
          <p className="hv3x-you">A business analyst role. I&apos;m good with SQL.</p>
          <div className="hv3x-stu">
            <Face />
            <p>Nice. Which city would you like to work in?</p>
          </div>
          <p className="hv3x-you">Bengaluru, or remote.</p>
          <div className="hv3x-stu">
            <Face />
            <p>Got it. What&apos;s the lowest pay you&apos;d say yes to?</p>
          </div>
        </div>
        <div className="hv3x-noted">
          <span className="hv3x-noted-k">Stu noted</span>
          <span className="hv3x-chip hv3x-chip-a">Business Analyst</span>
          <span className="hv3x-chip hv3x-chip-a">SQL</span>
          <span className="hv3x-chip hv3x-chip-b">Bengaluru</span>
          <span className="hv3x-chip hv3x-chip-b">Remote</span>
        </div>
      </div>
    </figure>
  );
}

/** A match after the top one: its ring and word, title, company and place. */
function MatchRow({ pct, word, title, co, meta }: { pct: number; word: string; title: string; co: Company; meta: string }) {
  return (
    <li className="hv3x-row">
      <span className="hv3x-fit">
        <Ring pct={pct} />
        <small>{word}</small>
      </span>
      <span className="hv3x-main">
        <b className="hv3x-title">{title}</b>
        <span className="hv3x-meta">
          <span className="hv3x-co">
            <Logo co={co} />
            {co.name}
          </span>
          <span>{meta}</span>
        </span>
      </span>
    </li>
  );
}

/** 2. Stu finds jobs that fit you: My matches, best fit first, the top one with its reason and its actions. */
export function MatchesExample() {
  return (
    <figure
      className="hv3x hv3x-jobs"
      aria-label="Example: three jobs Stu matched today, best fit first. The top one is a Business Analyst job at Razorpay in Bengaluru, an 86% fit."
    >
      <figcaption className="hv3x-tag">Example</figcaption>
      <div className="hv3x-app" aria-hidden="true">
        <div className="hv3x-head">
          <b>My matches</b>
          <span>3 new today</span>
        </div>
        <ul className="hv3x-rows">
          <li className="hv3x-row hv3x-row-top">
            <span className="hv3x-fit">
              <Ring pct={86} count />
              <small>Strong fit</small>
            </span>
            <span className="hv3x-main">
              <b className="hv3x-title">Business Analyst</b>
              <span className="hv3x-meta">
                <span className="hv3x-co">
                  <Logo co={RAZORPAY} />
                  {RAZORPAY.name}
                </span>
                <span>Bengaluru · Full time</span>
              </span>
              <span className="hv3x-why">The analyst role you asked for, in Bengaluru, and it uses the SQL on your resume.</span>
              <span className="hv3x-acts">
                <span className="hv3x-btn hv3x-btn-p">Add to email campaign</span>
                <span className="hv3x-btn">Not interested</span>
              </span>
            </span>
          </li>
          <MatchRow pct={78} word="Strong fit" title="Data Analyst" co={SWIGGY} meta="Bengaluru · Full time" />
          <MatchRow pct={71} word="Good fit" title="Product Analyst" co={GROWW} meta="Remote · Full time" />
        </ul>
      </div>
    </figure>
  );
}

/** 3. Stu finds who's hiring: the jobs in your campaign, each searched in turn: the top one's person found with their
 * work email, the next one still being searched (as liked/LikedList.tsx shows them). */
export function PersonExample() {
  return (
    <figure
      className="hv3x hv3x-who"
      aria-label="Example: for the Business Analyst job at Razorpay, Stu found Ananya R., the hiring manager for analytics, and her work email. For a Data Analyst job at Swiggy, Stu is still finding who's hiring."
    >
      <figcaption className="hv3x-tag">Example</figcaption>
      <div className="hv3x-app" aria-hidden="true">
        <div className="hv3x-head">
          <b>In your campaign</b>
          <span>2 jobs</span>
        </div>
        <ul className="hv3x-camp">
          <li>
            <JobLine co={RAZORPAY} title="Business Analyst" line="Bengaluru · 86% fit" />
            <div className="hv3x-find">
              <p className="hv3x-finding">
                <span className="hv3x-spin" />
                Finding who&apos;s hiring...
              </p>
              <div className="hv3x-person">
                <span className="hv3x-av">AR</span>
                <span className="hv3x-person-main">
                  <b>Ananya R.</b>
                  <span>Hiring Manager, Analytics</span>
                </span>
              </div>
            </div>
            <div className="hv3x-found">
              <span className="hv3x-ok">
                <Check size={15} sw={3} />
                Work email found
              </span>
              <span className="hv3x-btn hv3x-btn-p">
                <Send />
                Email Ananya
              </span>
            </div>
          </li>
          <li>
            <JobLine co={SWIGGY} title="Data Analyst" line="Bengaluru · 78% fit" />
            <p className="hv3x-wait">
              <span className="hv3x-spin" />
              Finding who&apos;s hiring...
            </p>
          </li>
        </ul>
      </div>
    </figure>
  );
}

function JobLine({ co, title, line }: { co: Company; title: string; line: string }) {
  return (
    <p className="hv3x-jobline">
      <Logo co={co} big />
      <span>
        <b>{title}</b>
        <span>
          {co.name} · {line}
        </span>
      </span>
    </p>
  );
}

/** 4. Stu reaches out for you: the email (to, subject, a short body) with its Start, then a reply as Replies shows it. */
export function MailExample() {
  return (
    <figure
      className="hv3x hv3x-mail"
      aria-label="Example: the email Stu wrote to Ananya R. about the Business Analyst job, ready to start, and her reply asking for the dashboard it mentions"
    >
      <figcaption className="hv3x-tag">Example</figcaption>
      <div className="hv3x-app" aria-hidden="true">
        <div className="hv3x-mail-head">
          <p>
            <span>To</span>
            <span>
              <b>Ananya R.</b>
              <span className="hv3x-muted">, Hiring Manager, Analytics</span>
            </span>
          </p>
          <p>
            <span>Subject</span>
            <b>Business Analyst role on your team</b>
          </p>
        </div>
        <div className="hv3x-mail-body">
          <p className="hv3x-ghost">{BODY}</p>
          <p data-type>{BODY}</p>
        </div>
        <div className="hv3x-mail-foot">
          <span className="hv3x-from">From your inbox</span>
          <span className="hv3x-go">
            <span className="hv3x-btn hv3x-btn-p hv3x-start">
              <Send className="hv3x-ico hv3x-plane" />
              Start
            </span>
            <span className="hv3x-started">
              <Check size={14} sw={3} />
              Started
            </span>
          </span>
        </div>
      </div>
      <div className="hv3x-reply" aria-hidden="true">
        <Logo co={RAZORPAY} big />
        <span className="hv3x-reply-main">
          <span className="hv3x-reply-top">
            <b>Ananya R.</b>
            <span>Just now</span>
          </span>
          <span className="hv3x-reply-role">Hiring Manager, Analytics, {RAZORPAY.name}</span>
          <span className="hv3x-reply-text">Thanks for writing. Could you send me the dashboard you mentioned?</span>
          <span className="hv3x-badge">Needs your answer</span>
        </span>
      </div>
    </figure>
  );
}
