import { useState } from "react";
import { Briefcase, Doc, Mail } from "./icons";
import { StartLink, useAgent } from "./start";
import { StuArt } from "./StuArt";

// HOMEPAGE V2 hero (hp/v2.html): the h1 "Stu screen": Stu's head, "Stu, your career agent", one line, three small
// chips, one big "start the call", "free · about 10 minutes". Signed out, a tap on Stu or the button opens the call
// takeover (Takeover.tsx), where Stu says /b2cnew/join's line and then shows /join's sign-up card; the page stays
// as it was underneath. [data-hero-end] is what the floating agent watches (Floating.tsx).

export function Hero() {
  const a = useAgent();
  const [held, setHeld] = useState(false);

  return (
    <section className="hv-hero" aria-labelledby="hero-title" data-stage="idle">
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
          <StuArt cycle hold={held} />
        </StartLink>
        <p className="hv-kicker">Stu, your career agent</p>
        <h1 className="hv-line" id="hero-title">
          find jobs that fit you.
          <br /> just talk to stu.
        </h1>
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
      </div>
      <div className="hv-go">
        <StartLink place="hero" className="hv-btn-start hv-go-btn" id="hv-hero-btn" />
        {!a.signedIn && <p className="hv-micro">free · about 10 minutes</p>}
      </div>
      <span data-hero-end aria-hidden="true" />
    </section>
  );
}
