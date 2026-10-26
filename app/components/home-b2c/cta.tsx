import type { ReactNode } from "react";
import { useLocation, useRouteLoaderData } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Arrow, Mic } from "./icons";
import { STU_HEAD, startCta } from "./links";

// THE button, "Start the call", the same everywhere it appears: the hero, the floating one (StickyCta.tsx: the side
// pill on desktop, the bottom bar on phones) and the footer. No header and no per-section buttons (owner, 27 Oct).
// Signed out it opens /b2cnew/join with the visit's landing query; signed in it is "Open my jobs" to /b2cnew
// (links.ts startCta). Always a plain <a href>: /b2cnew is another app.

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
  size?: "md" | "sm";
  /** Full width (the hero on phones). */
  wide?: boolean;
  id?: string;
  className?: string;
  /** Where it sits (data-start, as in the mocks). */
  place: "hero" | "side" | "bar" | "footer";
  tabIndex?: number;
  /** In place of the mic (or arrow) icon: the side pill and the bar lead with a small Stu. */
  lead?: ReactNode;
  /** A class for the label (the bar centres it). */
  labelClass?: string;
  "aria-hidden"?: boolean;
};

export function StartButton({ size = "md", wide = false, id, className = "", place, tabIndex, lead, labelClass, "aria-hidden": ariaHidden }: StartButtonProps) {
  const { label, href, signedIn } = useStartCta();
  const cls = ["nb-btn", size === "sm" ? "nb-sm" : "", wide ? "nb-wide" : "", className].filter(Boolean).join(" ");
  return (
    <a href={href} id={id} className={cls} data-start={place} tabIndex={tabIndex} aria-hidden={ariaHidden}>
      {lead ?? (signedIn ? <Arrow /> : <Mic />)}
      {labelClass ? <span className={labelClass}>{label}</span> : label}
    </a>
  );
}

/** Stu's laughing head in a white cell at the left of a small start button, so Stu never sits on purple. */
export function StuCell() {
  return (
    <span className="sjb-cell" aria-hidden="true">
      <img src={STU_HEAD} alt="" width={36} height={36} />
    </span>
  );
}
