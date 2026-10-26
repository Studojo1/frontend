import { useEffect, type CSSProperties } from "react";
import { STU_EMBED_SRC } from "./links";
import { forwardStuEvent } from "./stu-events";

// Stu on the B2C homepage: the <stu-agent> web component, built and served by career-agent
// (/b2cnew/embed/stu.js, shadow DOM, no analytics of its own). The page carries two elements:
//   #stu-slot   in the hero:  <stu-agent data-size="hero" data-mode="voice" data-signed-in="auto">
//   #stu-float  once on page: <stu-agent data-size="dock" data-mode="voice" data-signed-in="auto">
// The dock places itself (a fixed orb, bottom right, shown once the hero scrolls away), so #stu-float is a plain
// wrapper with no position or z-index of its own: a stacking context there would trap Stu's panel under the
// header and the cookie notice. data-base is left out: on this host it defaults to /b2cnew.
//
// The script is added on the B2C homepage only, and only where the browser has custom elements. Until it defines
// <stu-agent> the two elements are empty and take no space, so a 404 (before career-agent ships it), a script
// that throws or one that never defines the element leaves the page as it is, with the hero's plain
// "Talk to Stu" link to /b2cnew/start as the way in.

const TAG = "stu-agent";
const TIMEOUT_MS = 10_000;

let loading: Promise<boolean> | null = null;

/** Adds the embed script once per page load. Resolves true once <stu-agent> is defined, false on any failure. */
export function loadStuEmbed(src: string = STU_EMBED_SRC): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.resolve(false);
  const registry = window.customElements;
  if (!registry || typeof registry.define !== "function" || typeof registry.whenDefined !== "function") {
    return Promise.resolve(false);
  }
  if (registry.get(TAG)) return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise<boolean>((resolve) => {
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    try {
      // The embed's contract: <script src="/b2cnew/embed/stu.js" defer></script>, a classic script.
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.dataset.stuEmbed = "";
      // A 404, a wrong MIME type or a network failure: drop the tag, nothing else happens.
      script.onerror = () => {
        script.remove();
        done(false);
      };
      document.head.appendChild(script);
      registry.whenDefined(TAG).then(() => done(true), () => done(false));
      // Loaded but never defined the element (it threw, or it is another file): give up quietly.
      window.setTimeout(() => done(false), TIMEOUT_MS);
    } catch {
      done(false);
    }
  });
  return loading;
}

const HERO_STYLE = { "--stu-size": "200px" } as CSSProperties;

/** Stu in the hero. */
export function StuSlot({ className = "" }: { className?: string }) {
  return (
    <div id="stu-slot" className={className}>
      <stu-agent data-size="hero" data-mode="voice" data-signed-in="auto" style={HERO_STYLE} />
    </div>
  );
}

/** Stu's dock, the script loader and the event forwarding. Render once, on the B2C homepage. */
export function StuDock() {
  useEffect(() => {
    const onStu = (e: Event) => {
      forwardStuEvent((e as CustomEvent).detail);
    };
    window.addEventListener("stu", onStu);
    void loadStuEmbed();
    return () => {
      window.removeEventListener("stu", onStu);
      // Leaving the homepage in the app: an open panel (added to the body) goes with it.
      for (const panel of document.querySelectorAll("[data-stu-panel]")) panel.remove();
    };
  }, []);

  return (
    <div id="stu-float">
      <stu-agent data-size="dock" data-mode="voice" data-signed-in="auto" />
    </div>
  );
}

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "stu-agent": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
