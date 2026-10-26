import { useLocation, useRouteLoaderData } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Arrow, Mic } from "./icons";
import { startCta, startHref } from "./links";

// THE button, "start the call", the same everywhere it appears: the header (desktop), the hero, the floating one
// (StickyCta.tsx) and the footer. No per-section buttons (owner, 27 Oct). Signed out it opens /b2cnew/join with the visit's landing query; signed in it is
// "open my jobs" to /b2cnew (links.ts startCta). Always a plain <a href>: /b2cnew is another app.

/**
 * Whether the visitor is signed in. On the homepage the loader already read the session (no flash of the
 * signed-out header); once the browser's own session check is done, that answer wins (a sign-in or sign-out
 * since). Elsewhere (blog, reports, legal) it is the browser's session alone.
 */
export function useSignedIn(): boolean {
  const home = useRouteLoaderData("routes/_index") as { b2cHome?: boolean; signedIn?: boolean } | undefined;
  const { data: session, isPending } = authClient.useSession();
  if (home?.b2cHome && typeof home.signedIn === "boolean" && (isPending || session === undefined)) return home.signedIn;
  return !!session;
}

export function useStartCta(): { label: string; href: string; signedIn: boolean } {
  const signedIn = useSignedIn();
  const { search } = useLocation();
  return { ...startCta(signedIn, search), signedIn };
}

type StartButtonProps = {
  size?: "md" | "sm" | "xl";
  /** Full width at phone size. */
  wide?: boolean;
  id?: string;
  className?: string;
  /** Where it sits (data-start, as in the mocks). */
  place: "header" | "hero" | "footer" | "bar";
  tabIndex?: number;
};

export function StartButton({ size = "md", wide = false, id, className = "", place, tabIndex }: StartButtonProps) {
  const { label, href, signedIn } = useStartCta();
  const cls = ["sjb-btn", size === "md" ? "" : `sjb-${size}`, wide ? "sjb-wide" : "", className].filter(Boolean).join(" ");
  const icon = size === "sm" ? 16 : 20;
  return (
    <a href={href} id={id} className={cls} data-start={place} tabIndex={tabIndex}>
      {signedIn ? <Arrow size={icon - 2} /> : <Mic size={icon} />}
      {label}
    </a>
  );
}

/** "prefer typing?": the one quiet alternative, signed out only. */
export function TypeLink({ label = "prefer typing?", className = "" }: { label?: string; className?: string }) {
  const signedIn = useSignedIn();
  const { search } = useLocation();
  if (signedIn) return null;
  return (
    <a href={startHref(search, "type")} className={`sjb-link-type ${className}`.trim()}>
      {label}
    </a>
  );
}

/** Stu, the ink-line art (a static image; the live Stu is the embed, stu-embed.tsx). Decorative. */
export function StuArt({ className = "" }: { className?: string }) {
  return (
    <span className={`sjb-stu ${className}`.trim()} aria-hidden="true">
      <img src="/stu/stu2-speak.svg" alt="" width={92} height={92} />
    </span>
  );
}
