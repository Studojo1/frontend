import { useEffect } from "react";

// HOMEPAGE V3 motion (27 Oct 2026, the owner: "the page seems very dead and dull; animations show a site is not made by
// AI: things floating in, floating out, opening up, closing"). One effect for the whole page, after hydration:
// - [data-reveal]: below the screen, an element waits off to the side (hv3-rv-pre) and floats in when it comes into view
//   (hv3-rv-in); scrolled back up out of view, it floats out again, so it comes in again next time. What is on screen at
//   load is never hidden (no flash), and without JS nothing is hidden at all.
// - [data-count]: the number in its <b> counts up from 0 the first time it is shown (the page's own text, "8,500+",
//   is what the server renders and what a reader without JS sees).
// - [data-type]: the text types itself out the first time it is shown, then its figure gets hv3-typed (the example
//   email's button presses and the email flies off).
// - the questions (.hv3-q): open and close by animating their height, not a jump.
// - the hero's four steps (what Stu does) light up one after another and tick off, then start again, while the hero
//   is on screen (28 Oct 2026, the owner: "animations that have functionality"); they lean with the pointer on a laptop.
// Reduced motion: everything is shown as it is, nothing moves.

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function countUp(b: HTMLElement) {
  const text = b.textContent ?? "";
  const m = /^([\d,]+)(.*)$/.exec(text.trim());
  if (!m) return;
  const target = Number(m[1].replace(/,/g, ""));
  const suffix = m[2];
  const t0 = performance.now();
  const dur = 1400;
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / dur);
    const eased = 1 - (1 - k) ** 3;
    b.textContent = `${Math.round(target * eased).toLocaleString("en-US")}${suffix}`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function typeOut(el: HTMLElement) {
  const full = el.textContent ?? "";
  const fig = el.closest("figure");
  el.textContent = "";
  el.classList.add("hv3-typing");
  const perChar = Math.max(14, Math.min(28, 2200 / full.length));
  let i = 0;
  const tick = () => {
    i = Math.min(full.length, i + 2);
    el.textContent = full.slice(0, i);
    if (i < full.length) window.setTimeout(tick, perChar * 2);
    else {
      el.classList.remove("hv3-typing");
      fig?.classList.add("hv3-typed");
    }
  };
  window.setTimeout(tick, 350);
}

/** Open and close a question by its height (the browser's own details would jump). */
function accordion(root: HTMLElement): () => void {
  const onClick = (e: MouseEvent) => {
    const summary = (e.target as HTMLElement).closest("summary");
    const d = summary?.parentElement;
    if (!summary || !(d instanceof HTMLDetailsElement) || !d.classList.contains("hv3-q")) return;
    e.preventDefault();
    // closed, a question is its summary plus its own border (the line under it)
    const closed = summary.offsetHeight + (d.offsetHeight - d.clientHeight);
    if (d.open) {
      const from = d.offsetHeight;
      d.classList.add("hv3-closing");
      d.animate({ height: [`${from}px`, `${closed}px`] }, { duration: 260, easing: "cubic-bezier(.3,.7,.3,1)" }).onfinish = () => {
        d.open = false;
        d.classList.remove("hv3-closing");
      };
    } else {
      d.open = true;
      const to = d.offsetHeight;
      d.animate({ height: [`${closed}px`, `${to}px`] }, { duration: 320, easing: "cubic-bezier(.2,.9,.3,1.1)" });
    }
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}

/** The hero's four steps: the one Stu is on lights up (hv3-on), the ones before it tick off (hv3-done); after the
 * fourth, all four show done for a moment, then it starts again. Only while the hero is on screen. */
function flowCycle(flow: HTMLElement): () => void {
  const steps = [...flow.querySelectorAll<HTMLElement>(".hv3-flow-step")];
  let at = -1;
  let timer = 0;
  let running = false;
  const paint = () =>
    steps.forEach((s, i) => {
      s.classList.toggle("hv3-on", i === at);
      s.classList.toggle("hv3-done", i < at);
    });
  const tick = () => {
    at = at >= steps.length ? 0 : at + 1;
    paint();
    timer = window.setTimeout(tick, at === steps.length ? 2400 : 1600);
  };
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) {
      running = true;
      // the first time, after the steps have floated in
      timer = window.setTimeout(tick, at < 0 ? 2300 : 600);
    } else if (!e.isIntersecting && running) {
      running = false;
      window.clearTimeout(timer);
    }
  });
  io.observe(flow);
  return () => {
    io.disconnect();
    window.clearTimeout(timer);
  };
}

/** The hero's steps lean a little with the pointer (laptops only). */
function parallax(hero: HTMLElement): () => void {
  if (!window.matchMedia("(pointer: fine)").matches) return () => undefined;
  let raf = 0;
  const onMove = (e: PointerEvent) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty("--hv3-px", x.toFixed(3));
      hero.style.setProperty("--hv3-py", y.toFixed(3));
    });
  };
  hero.addEventListener("pointermove", onMove);
  return () => {
    cancelAnimationFrame(raf);
    hero.removeEventListener("pointermove", onMove);
  };
}

export function useHomeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".hv2");
    if (!root) return;
    const cleanups: (() => void)[] = [];
    const faq = root.querySelector<HTMLElement>(".hv3-faq");
    if (faq && !reduced()) cleanups.push(accordion(faq));
    const hero = root.querySelector<HTMLElement>(".hv3-hero");
    if (hero && !reduced()) cleanups.push(parallax(hero));
    const flow = root.querySelector<HTMLElement>(".hv3-flow");
    if (flow && !reduced() && typeof IntersectionObserver !== "undefined") cleanups.push(flowCycle(flow));

    const items = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
    const shown = new WeakSet<HTMLElement>();
    const firstShow = (el: HTMLElement) => {
      if (shown.has(el)) return;
      shown.add(el);
      if (reduced()) return;
      // matches the element's own <b> too when the element itself has data-count (selectors match against the page)
      for (const b of el.querySelectorAll<HTMLElement>("[data-count] b")) countUp(b);
      for (const t of el.querySelectorAll<HTMLElement>("[data-type]")) typeOut(t);
    };
    if (reduced() || typeof IntersectionObserver === "undefined") {
      for (const el of items) el.classList.add("hv3-rv-in");
      return () => cleanups.forEach((c) => c());
    }
    const vh = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92) {
        el.classList.add("hv3-rv-in");
        firstShow(el);
      } else el.classList.add("hv3-rv-pre");
    }
    root.classList.add("hv3-motion");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.classList.remove("hv3-rv-pre");
            el.classList.add("hv3-rv-in");
            firstShow(el);
          } else if (e.boundingClientRect.top > 0) {
            // Scrolled back up past it: it floats out, and floats in again next time.
            el.classList.remove("hv3-rv-in");
            el.classList.add("hv3-rv-pre");
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    for (const el of items) io.observe(el);
    cleanups.push(() => io.disconnect());
    return () => cleanups.forEach((c) => c());
  }, []);
}
