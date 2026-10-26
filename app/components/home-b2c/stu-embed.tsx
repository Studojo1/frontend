import { useEffect, type CSSProperties, type ReactNode } from "react";
import { STU_EMBED_SRC } from "./links";
import { forwardStuEvent } from "./stu-events";

// Stu on the B2C homepage: the <stu-agent> web component, built and served by career-agent
// (/b2cnew/embed/stu.js, shadow DOM, no <slot>, no analytics of its own). The page carries two elements:
//   #stu-slot   in the hero:  <stu-agent data-size="hero" data-mode="join" data-signed-in="auto">, a tap goes
//               straight to /b2cnew/join with the landing query and via=home&how=voice
//   #stu-float  once on page: <stu-agent data-size="dock" data-mode="join" data-signed-in="auto">, the same way
//               in (hidden behind the side pill for now, b2c.css)
// The dock places itself (a fixed orb, bottom right, shown once the hero Stu scrolls away), so #stu-float is a
// plain wrapper with no position or z-index of its own: a stacking context there would trap Stu's panel under
// the header and the cookie notice. data-base is left out: on this host it defaults to /b2cnew.
//
// The script is added on the B2C homepage only, and only where the browser has custom elements. It ships in
// the same staging batch as this page, so until it defines <stu-agent> the page must look complete without it:
// the hero element holds a static Stu image as a light-DOM child (shown until the element is defined; the
// component has no <slot>, so once its shadow root attaches the image is not rendered), in a box whose size is
// reserved (b2c.css, stu-agent:not(:defined)). The dock gets no fallback: its fixed position lives in the
// shadow CSS, so an image there would sit in the page flow. A 404, a script that throws or one that never
// defines the element leaves the page as it is, with the plain "start the call" button as the way in.

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

// The hero Stu's size follows the hero (b2c.css --sjb-hero-stu: about 168 to 230px on phones, 232 to 292px wider).
const HERO_STYLE = { "--stu-size": "var(--sjb-hero-stu, 112px)" } as CSSProperties;
// While the cookie notice is open it sets --sj-notice-h (components/legal/cookie-notice.tsx); the dock rises by
// --stu-dock-lift (career-agent 9ca96333), which inherits into its shadow DOM. A custom property makes no stacking context.
const DOCK_STYLE = { "--stu-dock-lift": "var(--sj-notice-h, 0px)" } as CSSProperties;

/** Stu in the hero. `children` is the fallback (a static Stu) shown until the embed defines <stu-agent>. */
export function StuSlot({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <div id="stu-slot" className={className}>
      <stu-agent data-size="hero" data-mode="join" data-signed-in="auto" style={HERO_STYLE}>
        {children}
      </stu-agent>
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
    <div id="stu-float" style={DOCK_STYLE}>
      <stu-agent data-size="dock" data-mode="join" data-signed-in="auto" />
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
