import { useState, type CSSProperties, type MouseEvent } from "react";
import moreCss from "./hero-more.css?url";
import { StartLink, useAgent } from "./start";
import { StuArt } from "./StuArt";

// HOMEPAGE V3 hero (27 Oct 2026, the owner: "the copy is terrible, the small fonts are not legible, it is too long";
// six simulated first-time visitors could not tell what the site does from this screen): one line on what Studojo
// does for you (the jobs, and the person hiring), one plain sentence on how, one start.
// 28 Oct 2026, the owner: the cards floating around Stu ("86% match", "Email drafted") were nice but meant nothing to a
// first-time visitor; "animations that have functionality". They are now what Stu does, in four numbered steps that
// float in in order and then light up one after another (Motion.tsx), on every screen size. The sentence
// under the title says the same in full words, with no call length and no "talk or type": the call is explained
// further down. Stu's head is still a start.
// 1 Nov 2026, the founder after a customer call: a number turning into a tick was too much, so a step's number stays
// its number; the order is a zig zag, 1 top left, 2 top right, 3 bottom left, 4 bottom right (home-v3.css, phone and
// desktop); and it was hard to tell there is more below this screen, so its foot has a chevron that bobs, a link
// (labelled "See how Stu works" for screen readers; the founder: just the arrow) that glides down to #how.
// Signed out, a tap on Stu or the button opens the call takeover (Takeover.tsx), where Stu says /b2cnew/join's line
// and then shows /join's sign-up card; signed in, both are "Open my jobs". [data-hero-end] is what the floating agent
// watches (Floating.tsx).
// 30 Oct 2026, the owner after watching a real user: "email is just a channel"; the page leads with the action,
// reaching the person who's hiring. Email is named once, plainly, in how it works (step 4).

const STEPS = ["Learns what you want", "Finds jobs that fit you", "Finds who's hiring", "Reaches out for you"] as const;
const d = (ms: number) => ({ "--hv3-d": `${ms}ms` }) as CSSProperties;

/** "See how Stu works": glide to #how (a jump for a reader who asks for less motion: html glides by default, app.css),
 * without touching the address, so the router never sees a hash change. It lands by the section's own margin under
 * the header (home-v3.css), not that plus the site's scroll padding on html (app.css), which would leave a gap. Focus
 * moves to its title, as a plain in-page link would move it. Without JS the link's own #how goes there. */
function seeHow(e: MouseEvent<HTMLAnchorElement>) {
  const how = document.getElementById("how");
  if (!how) return;
  e.preventDefault();
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = how.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(how).scrollMarginTop) || 0);
  window.scrollTo({ top, behavior: still ? "instant" : "smooth" });
  const title = how.querySelector<HTMLElement>("h2") ?? how;
  if (!title.hasAttribute("tabindex")) title.setAttribute("tabindex", "-1");
  title.focus({ preventScroll: true });
}

export function Hero() {
  const a = useAgent();
  const [held, setHeld] = useState(false);

  return (
    <section className="hv-hero hv3-hero" aria-labelledby="hero-title" data-stage="idle" data-section="hero">
      <link rel="stylesheet" href={moreCss} precedence="default" />
      <div className="hv-stage">
        <div className="hv3-stu-wrap">
          <ol className="hv3-flow" aria-hidden="true">
            {STEPS.map((label, i) => (
              <li className={`hv3-flow-step hv3-s${i + 1}`} key={label} style={d(900 + i * 260)}>
                <span className="hv3-flow-in">
                  <span className="hv3-flow-n">{i + 1}</span>
                  <span className="hv3-flow-t">{label}</span>
                </span>
              </li>
            ))}
          </ol>
          <StartLink
            place="hero-stu"
            className="hv-hero-stu"
            aria-label={a.signedIn ? "open my jobs" : "try for free: start the call with Stu"}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
          >
            <StuArt cycle hold={held} />
          </StartLink>
        </div>
        <p className="hv-kicker">Stu, your career agent</p>
        <h1 className="hv3-h1" id="hero-title">
          <span className="hv3-l">Find jobs that fit you.</span>{" "}
          <span className="hv3-l">
            Reach the person{" "}
            <span className="hv3-hl">
              who&apos;s hiring
              <svg className="hv3-squig" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9 C 40 2, 78 13, 118 7 S 176 3, 197 8" pathLength={1} />
              </svg>
            </span>
            .
          </span>
        </h1>
        <p className="hv3-hero-sub">
          Tell Stu what jobs you&apos;re looking for. Stu finds the ones that fit you best, finds out who&apos;s hiring, and reaches out to them for you. You skip the portal.
        </p>
      </div>
      <div className="hv-go">
        <StartLink place="hero" className="hv-btn-start hv-go-btn" id="hv-hero-btn" />
      </div>
      <a className="hv3-more" href="#how" onClick={seeHow} aria-label="See how Stu works">
        <span className="hv3-more-chev" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9.5l6 6 6-6" />
          </svg>
        </span>
      </a>
      <span data-hero-end aria-hidden="true" />
    </section>
  );
}
