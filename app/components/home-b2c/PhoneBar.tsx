import { useEffect, useRef, useState } from "react";
import { StartButton, StuOrb, useStartCta } from "./cta";
import { HERO_START_ID } from "./HeroB2C";

// Phones (b2c.css shows it at 640px and below): the same button pinned to the bottom, once the hero's button has
// scrolled away (above the top of the screen), and never while another start button is on screen (a section's
// end, the footer), so there are never two at once. Hidden from assistive tech and the tab order while hidden.
// data-floating-cta lifts it above the cookie notice (app.css, --sj-notice-h).

export function PhoneBar() {
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
      { rootMargin: "-60px 0px 0px 0px" },
    );
    heroObs.observe(hero);

    const others = Array.from(document.querySelectorAll("[data-start]")).filter(
      (el) => el !== hero && !ref.current?.contains(el) && !el.closest("header"),
    );
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
    <div ref={ref} className={`sjb-bar-m${show ? " sjb-show" : ""}`} aria-hidden={!show} data-floating-cta>
      <a href={href} className="sjb-orb-link" tabIndex={-1} aria-hidden="true">
        <StuOrb />
      </a>
      <StartButton place="bar" tabIndex={show ? 0 : -1} />
    </div>
  );
}
