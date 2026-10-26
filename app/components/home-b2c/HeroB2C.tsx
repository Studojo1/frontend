import { useEffect, useRef, useState } from "react";
import { StartButton, useSignedIn, useStartCta } from "./cta";
import { Briefcase, Doc, Mail } from "./icons";
import { STU_ART, STU_FACES } from "./links";

// Hero (H1 "Stu screen", h1.html): the first step of the app's flow, like a voice assistant's start screen. Stu,
// the owner's hand-drawn character, large; one line, three small chips, one big full-width "start the call" in
// the thumb zone and "free . about 10 minutes". Every way in goes through /b2cnew/join (owner rule): no typing
// link. HERO_START_ID is the id the floating start watches (StickyCta.tsx).
//
// Stu here is our own full figure, a plain link to the same place as the button (/b2cnew/join with the landing
// query; signed in, /b2cnew). Not career-agent's stu-agent embed: it draws a head on a purple circle and would
// replace the figure once loaded (owner, 27 Oct; stu-embed.tsx stays in the tree, unused). The faces: laugh, then
// sparkle, happy, grin, smug, back to laugh, one every 3.5s; laugh while hovered, pressed or focused; laugh only
// when the visitor asks for reduced motion.

export const HERO_START_ID = "hero-start";

const CYCLE_MS = 3500;

function useStuFace(): { face: number; hold: () => void; free: () => void } {
  const [face, setFace] = useState(STU_FACES.length - 1); // the laugh
  const held = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (held.current) return;
      setFace(k % STU_FACES.length);
      k += 1;
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);
  return {
    face,
    hold: () => {
      held.current = true;
      setFace(STU_FACES.length - 1);
    },
    free: () => {
      held.current = false;
    },
  };
}

export function HeroB2C() {
  const { href } = useStartCta();
  const signedIn = useSignedIn();
  const { face, hold, free } = useStuFace();
  return (
    <section className="sjb-hero" aria-labelledby="hero-title">
      <div className="sjb-stage">
        <a
          href={href}
          className="sjb-hero-stu"
          aria-label={signedIn ? "open my jobs" : "start the call with stu"}
          onPointerEnter={hold}
          onPointerDown={hold}
          onFocus={hold}
          onPointerLeave={free}
          onBlur={free}
        >
          <span className="sjb-glow" aria-hidden="true" />
          <span className="sjb-floor" aria-hidden="true" />
          <span className="sjb-body-s" aria-hidden="true">
            <span className="sjb-faces">
              {STU_FACES.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  width={385}
                  height={784}
                  className={i === face ? undefined : "sjb-off"}
                  loading={src === STU_ART ? undefined : "lazy"}
                />
              ))}
            </span>
          </span>
        </a>
        <p className="sjb-kicker">stu, your ai job agent</p>
        <h1 className="sjb-line" id="hero-title">
          find jobs that fit you.
          <br /> just talk to stu.
        </h1>
        <ul className="sjb-hint" aria-label="what you get">
          <li>
            <Doc size={13} width={2.2} />
            your brief
          </li>
          <li>
            <Briefcase size={13} />
            jobs every day
          </li>
          <li>
            <Mail size={13} />
            emails to hiring people
          </li>
        </ul>
      </div>
      <div className="sjb-go">
        <StartButton place="hero" id={HERO_START_ID} className="sjb-go-btn" />
        {signedIn ? null : <p className="sjb-micro">free · about 10 minutes</p>}
      </div>
    </section>
  );
}
