import { StartButton, TypeLink, useSignedIn, useStartCta } from "./cta";
import { Briefcase, Doc, Mail } from "./icons";
import { StuSlot } from "./stu-embed";
import { STU_ART } from "./links";

// Hero (H1 "Stu screen"): the first step of the app's flow, like a voice assistant's start screen. Stu, large,
// one line, three small chips, one big full-width "start the call" in the thumb zone and "free . about 10 minutes"; the quiet
// "prefer typing?" sits just below the fold. Kept thin: the owner's final pick between H1 and H2 replaces this
// markup and keeps HERO_START_ID, the id the phone's bottom bar watches (PhoneBar.tsx).
//
// Stu is the <stu-agent data-size="hero" data-mode="join"> embed (stu-embed.tsx): a tap goes straight into the
// call. Until the script defines it, a static Stu stands in its reserved box, a plain link to the same place.

export const HERO_START_ID = "hero-start";

export function HeroB2C() {
  const { href } = useStartCta();
  const signedIn = useSignedIn();
  return (
    <>
      <section className="sjb-hero" aria-labelledby="hero-title">
        <div className="sjb-stage">
          <StuSlot>
            <a href={href} className="sjb-stu sjb-hero-stu" aria-label={signedIn ? "open my jobs" : "start the call with stu"} tabIndex={-1}>
              <span className="sjb-glow" aria-hidden="true" />
              <span className="sjb-ring" aria-hidden="true" />
              <span className="sjb-ring sjb-r2" aria-hidden="true" />
              <span className="sjb-floor" aria-hidden="true" />
              <span className="sjb-body-s" aria-hidden="true">
                <img src={STU_ART} alt="" width={230} height={230} />
              </span>
            </a>
          </StuSlot>
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
      {signedIn ? null : (
        <div className="sjb-alt">
          <TypeLink />
        </div>
      )}
    </>
  );
}
