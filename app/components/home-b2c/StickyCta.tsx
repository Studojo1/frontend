import { useEffect, useRef, useState } from "react";
import { StartButton, StuArt, useStartCta } from "./cta";
import { HERO_START_ID } from "./HeroB2C";

// The one floating "start the call", once the hero's button has scrolled away (above the top of the screen) and
// never while the footer's button is on screen, so there are never two at once (owner, 27 Oct):
//   phones (640px and below): a bar pinned to the bottom, a small Stu and the button
//   wider: a pill at the bottom right, a small Stu and the button
// Hidden from assistive tech and the tab order while hidden. data-floating-cta lifts it above the cookie notice
// (app.css, --sj-notice-h).

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

    // Any other start button in the page (the footer's), but not the header's, which is always there.
    const others = Array.from(document.querySelectorAll("[data-start]")).filter(
      (el) => el !== hero && !ref.current?.contains(el) && el.getAttribute("data-start") !== "header",
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
    <div ref={ref} className={`sjb-sticky${show ? " sjb-show" : ""}`} aria-hidden={!show} data-floating-cta>
      <a href={href} className="sjb-stu-link" tabIndex={-1} aria-hidden="true">
        <StuArt />
      </a>
      <StartButton place="bar" tabIndex={show ? 0 : -1} />
    </div>
  );
}
