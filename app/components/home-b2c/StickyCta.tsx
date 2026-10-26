import { useEffect, useRef, useState } from "react";
import { StartButton, StuArt, useStartCta } from "./cta";
import { HERO_START_ID } from "./HeroB2C";

// The one floating "start the call" (h1.html), once the hero's button has scrolled up under the header and never
// while the footer's button is on screen, so there are never two at once (owner, 27 Oct):
//   wider screens: the side pill at the bottom right, the button itself led by a small Stu
//   phones (640px and below): a bar pinned to the bottom, a small Stu and the button
// Hidden from assistive tech and the tab order while hidden. Both rise above the cookie notice
// (b2c.css, the same --sj-notice-h lift as app.css [data-floating-cta]).

export function StickyCta() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const { href } = useStartCta();

  useEffect(() => {
    const hero = document.getElementById(HERO_START_ID);
    if (!hero || typeof IntersectionObserver === "undefined") return;
    let heroGone = false;
    const visible = new Set<Element>();
    const update = () => setShow(heroGone && visible.size === 0);

    const heroObs = new IntersectionObserver(
      ([e]) => {
        heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
        update();
      },
      { rootMargin: "-64px 0px 0px 0px" },
    );
    heroObs.observe(hero);

    // Any other start button in the page (the footer's).
    const others = Array.from(document.querySelectorAll("[data-start]")).filter((el) => el !== hero && !ref.current?.contains(el));
    const otherObs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    for (const el of others) otherObs.observe(el);

    return () => {
      heroObs.disconnect();
      otherObs.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="sjb-sticky">
      <StartButton
        place="side"
        className={`sjb-side${show ? " sjb-show" : ""}`}
        lead={<StuArt />}
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
      />
      <div className={`sjb-bar-m${show ? " sjb-show" : ""}`} aria-hidden={!show}>
        <a href={href} className="sjb-stu-link" tabIndex={-1} aria-hidden="true">
          <StuArt />
        </a>
        <StartButton place="bar" tabIndex={show ? 0 : -1} />
      </div>
    </div>
  );
}
