// The result chip's flight: when a run lands, a copy of its result chip
// flies from the run card to its tab in the strip (or the phone bar), where
// the count bumps. Runs in an effect only (never during render); skipped
// under reduced motion or when the tab is out of sight.
import { useCallback, useEffect, useRef } from "react";
import { useB2C } from "../core/store";
import { useSafeReducedMotion } from "../motion";
import type { TabId } from "../types";

function visible(el: HTMLElement | null): el is HTMLElement {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

/** Returns fly(sourceEl, tab, label). Safe to call any time after mount. */
export function useFlyToTab() {
  const { s, viewport } = useB2C();
  const reduced = useSafeReducedMotion();
  const live = useRef({ reduced, viewport, overlay: s.dock.overlay });
  useEffect(() => {
    live.current = { reduced, viewport, overlay: s.dock.overlay };
  });

  return useCallback((source: HTMLElement | null, tab: TabId, label: string) => {
    const { reduced: r, viewport: vp, overlay } = live.current;
    if (r || !source || typeof document === "undefined") return;
    // The phone sheet covers the bottom bar; the run card itself is the news there.
    if (vp === "phone" && overlay) return;
    window.requestAnimationFrame(() => {
      const target = [document.getElementById(`b2c-ws-tab-${tab}`), document.getElementById(`b2c-bar-tab-${tab}`)].find(visible);
      // Browsers without the Web Animations API skip the flight; the tab count still bumps.
      if (!target || !visible(source) || typeof HTMLElement.prototype.animate !== "function") return;
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const ghost = document.createElement("div");
      ghost.setAttribute("aria-hidden", "true");
      ghost.textContent = label;
      ghost.className =
        "pointer-events-none fixed left-0 top-0 z-[70] whitespace-nowrap rounded-full border-2 border-studojo-ink bg-studojo-purple-strong px-3 py-1.5 font-satoshi text-[13px] font-bold text-white shadow-[2px_2px_0_0_#191a23]";
      ghost.style.transform = `translate(${from.left}px, ${from.top}px)`;
      document.body.appendChild(ghost);
      const dx = to.left + to.width / 2 - from.width / 2;
      const dy = to.top + to.height / 2 - from.height / 2;
      const midX = (from.left + dx) / 2;
      const midY = Math.min(from.top, dy) - 40;
      const anim = ghost.animate(
        [
          { transform: `translate(${from.left}px, ${from.top}px) scale(1)`, opacity: 1 },
          { transform: `translate(${midX}px, ${midY}px) scale(0.85)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0 },
        ],
        { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
      const done = () => ghost.remove();
      anim.onfinish = done;
      anim.oncancel = done;
    });
  }, []);
}
