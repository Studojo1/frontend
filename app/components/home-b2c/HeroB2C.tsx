import { useEffect, useRef, useState } from "react";
import { StartButton, useSignedIn, useStartCta } from "./cta";
import { STU_FACES, STU_HEAD } from "./links";

// Hero (NB, nb.html): Stu, the line, the button. Nothing else. Stu is the owner's hand-drawn head cut at the
// neck like the logo, straight on white (no disc, no glow), a plain link to the same place as the button
// (/b2cnew/join with the landing query; signed in, /b2cnew). Not career-agent's stu-agent embed (owner, 27 Oct;
// stu-embed.tsx stays in the tree, unused). The faces: laugh, then sparkle, happy, grin, back to laugh, one every
// 3.5s while the tab is visible; laugh while hovered, pressed or focused; laugh only under reduced motion.
// Every way in goes through /b2cnew/join (owner rule). HERO_START_ID is the id the floating start watches.

export const HERO_START_ID = "hero-start";

const CYCLE_MS = 3500;

function useStuFace(): { face: number; hold: () => void; free: () => void } {
  const [face, setFace] = useState(STU_FACES.length - 1); // the laugh
  const held = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (held.current || document.hidden) return;
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
          aria-label={signedIn ? "Open my jobs" : "Start the call with Stu"}
          onPointerEnter={hold}
          onPointerDown={hold}
          onFocus={hold}
          onPointerLeave={free}
          onBlur={free}
        >
          <span className="sjb-faces" aria-hidden="true">
            {STU_FACES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                width={232}
                height={232}
                className={i === face ? undefined : "sjb-off"}
                decoding="async"
                loading={src === STU_HEAD ? undefined : "lazy"}
              />
            ))}
          </span>
        </a>
        <p className="nb-kicker">Stu, your AI job agent</p>
        <h1 className="nb-h1" id="hero-title">
          <span className="nb-s">Find jobs that fit you.</span> <span className="nb-s">Just talk to Stu.</span>
        </h1>
      </div>
      <div className="sjb-go">
        <StartButton place="hero" id={HERO_START_ID} wide />
        {signedIn ? null : <p className="nb-micro">free · about 10 minutes</p>}
      </div>
    </section>
  );
}
