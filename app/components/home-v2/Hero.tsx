import { useEffect, useRef, useState } from "react";
import { Briefcase, Doc, Mail } from "./icons";
import { JoinCard, Said, Talking, Ticks } from "./JoinCard";
import { StartLink, useAgent } from "./start";
import { StuArt } from "./StuArt";

// HOMEPAGE V2 hero (hp/v2.html): the h1 "Stu screen": Stu's head, "Stu, your career agent", one line, three small
// chips, one big "start the call", "free · about 10 minutes". Signed out, a tap on Stu or the button brings Stu alive
// right here (start.tsx): she says /b2cnew/join's line with her words lighting up (speaking), then /join's sign-up
// card comes in beside her with /join's three lines (signup; on a desktop Stu and her words on the left, the card on
// the right, as /join lays them out; on a phone the card below, brought into view after 450 ms as /join does).
// [data-hero-end] is what the floating agent watches (Floating.tsx).

export function Hero() {
  const a = useAgent();
  const { stage } = a;
  const [held, setHeld] = useState(false);
  const card = useRef<HTMLElement>(null);

  useEffect(() => {
    if (stage !== "signup" || a.from !== "hero" || window.innerWidth >= 1024) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => card.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }), 450);
    return () => window.clearTimeout(id);
  }, [stage, a.from]);

  return (
    <section className="hv-hero" aria-labelledby="hero-title" data-stage={stage}>
      <div className="hv-stage">
        <StartLink
          place="hero-stu"
          className="hv-hero-stu"
          aria-label={a.signedIn ? "open my jobs" : "start the call with Stu"}
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <StuArt cycle hold={held && !a.speaking} live={a.speaking ? a.level : null} />
        </StartLink>
        <p className="hv-kicker">Stu, your career agent</p>
        <h1 className="hv-line" id="hero-title" hidden={stage !== "idle"}>
          find jobs that fit you.
          <br /> just talk to stu.
        </h1>
        {stage !== "idle" && <Said />}
        {stage === "idle" && (
          <ul className="hv-hint" aria-label="what you get">
            <li>
              <Doc size={13} sw={2.2} />
              your brief
            </li>
            <li>
              <Briefcase size={13} sw={2.2} />
              jobs every day
            </li>
            <li>
              <Mail size={13} sw={2.2} />
              emails to hiring people
            </li>
          </ul>
        )}
        {stage === "signup" && <Ticks />}
      </div>
      {stage === "idle" && (
        <div className="hv-go">
          <StartLink place="hero" className="hv-btn-start hv-go-btn" id="hv-hero-btn" />
          {!a.signedIn && <p className="hv-micro">free · about 10 minutes</p>}
        </div>
      )}
      {stage === "speaking" && (
        <div className="hv-go">
          <Talking />
        </div>
      )}
      {stage === "signup" && <JoinCard ref={card} idPrefix="hero" />}
      <span data-hero-end aria-hidden="true" />
    </section>
  );
}
