import { useEffect, useState } from "react";
import { StartLink, useAgent, useStartLabel } from "./start";
import { StuArt } from "./StuArt";

// HOMEPAGE V2: the floating agent (hp/v2.html). On a desktop a big side pill with Stu's head (in a white ink-ringed
// cell, so Stu never sits on purple) and "start the call / Stu, your career agent"; on a phone a bar pinned to the
// bottom, Stu's head and the same button. On once the hero has gone up under the header, off while the footer's
// button is on screen or passed, and while the call takeover is open, so there is never a second start on screen.
// Signed out a tap opens the takeover (Takeover.tsx); signed in it is "open my jobs" to /b2cnew. Hidden from
// COOKIE-TOP2 (4 Nov 2026, the coordinator: "people are not seeing the call"): on a phone the bar also shows from page
// load whenever the hero's start is not FULLY on screen (an observer at threshold 1, kept current as the page scrolls
// and resizes), and hides while the hero's start is fully on screen, so there is never two and never none.
// Hidden from assistive tech and the tab order while hidden. Both rise above the cookie notice (--sj-notice-h, app.css).

export function Floating() {
  const a = useAgent();
  const label = useStartLabel();
  const [vis, setVis] = useState({ heroOut: false, footIn: false, heroBtnPartial: false });

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const end = document.querySelector("[data-hero-end]");
    const foot = document.getElementById("hv-foot-btn");
    const hdr = Math.round(document.querySelector("[data-hdr]")?.getBoundingClientRect().height ?? 0) || 60;
    const obs: IntersectionObserver[] = [];
    if (end) {
      const o = new IntersectionObserver(([e]) => setVis((v) => ({ ...v, heroOut: !e.isIntersecting && e.boundingClientRect.top < hdr })), { rootMargin: `-${hdr}px 0px 0px 0px` });
      o.observe(end);
      obs.push(o);
    }
    const btn = document.getElementById("hv-hero-btn");
    if (btn) {
      const o = new IntersectionObserver(([e]) => setVis((v) => ({ ...v, heroBtnPartial: e.intersectionRatio < 1 })), { threshold: [0, 0.5, 1] });
      o.observe(btn);
      obs.push(o);
    }
    if (foot) {
      const o = new IntersectionObserver(([e]) => setVis((v) => ({ ...v, footIn: e.isIntersecting || e.boundingClientRect.top < 0 })));
      o.observe(foot);
      obs.push(o);
    }
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  const on = vis.heroOut && !vis.footIn && !a.callOpen;
  // The phone bar only (it is not drawn from a tablet up): also while the hero's start is not fully on screen.
  const barOn = on || (vis.heroBtnPartial && !vis.footIn && !a.callOpen);
  return (
    <>
      <StartLink place="side" className={`hv-btn-start hv-side${on ? " hv-show" : ""}`} tabIndex={on ? 0 : -1} aria-hidden={!on}>
        <span className="hv-stu-cell" aria-hidden="true">
          <StuArt small />
        </span>
        <span className="hv-who">
          <span>{label}</span>
          <small>Stu, your career agent</small>
        </span>
      </StartLink>
      <div className={`hv-bar-m${barOn ? " hv-show" : ""}`} aria-hidden={!barOn}>
        <StartLink place="bar-stu" className="hv-stu-cell" tabIndex={-1} aria-label={a.signedIn ? "open my jobs" : "start the call with Stu"}>
          <StuArt small />
        </StartLink>
        <StartLink place="bar" className="hv-btn-start" tabIndex={barOn ? 0 : -1} />
      </div>
    </>
  );
}
