import { StartButton, StuOrb, TypeLink, useSignedIn, useStartCta } from "./cta";
import { Check, Clock } from "./icons";
import { StuSlot } from "./stu-embed";

// Hero: the first step of the app's flow. Stu, one line, one big unmistakable "start the call" button (the
// thumb zone on phones), "free . about 10 minutes" and the quiet "prefer typing?" link. Kept thin on purpose:
// the owner is picking the final hero (H1/H2), which replaces this markup and keeps #hero-start, the id the
// phone's bottom bar watches (PhoneBar.tsx).
//
// Stu is the <stu-agent data-size="hero" data-mode="join"> embed (stu-embed.tsx); until the script defines it,
// a static Stu stands in its reserved box, itself a plain link to the same place as the button.

export const HERO_START_ID = "hero-start";

export function HeroB2C() {
  const { href } = useStartCta();
  const signedIn = useSignedIn();
  return (
    <section className="sjb-hero" aria-labelledby="hero-title">
      <div className="sjb-center">
        <StuSlot className="sjb-stu-box">
          <a href={href} className="sjb-orb-link" aria-label={signedIn ? "open my jobs" : "start the call with stu"} tabIndex={-1}>
            <StuOrb rings />
          </a>
        </StuSlot>
        <p className="sjb-kicker">stu, your ai job agent</p>
        <h1 className="sjb-h-hero" id="hero-title">
          talk to stu.
          <br /> get jobs that fit you.
        </h1>
        <div className="sjb-go">
          <StartButton size="xl" wide place="hero" id={HERO_START_ID} />
          {signedIn ? null : (
            <ul className="sjb-facts">
              <li>
                <Check size={14} />
                free to start
              </li>
              <li>
                <Clock size={14} />
                about 10 minutes
              </li>
            </ul>
          )}
          <TypeLink />
        </div>
      </div>
    </section>
  );
}
