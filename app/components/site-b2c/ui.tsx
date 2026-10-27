import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { authClient } from "~/lib/auth-client";
import { heldTrackingParams } from "~/lib/attribution";
import { LOGO_DOODLE, STU_HEAD, STU_HOME, siteStartHref } from "./site-links";

// SITE-V2 building blocks (site.css): the wordmark, Stu's head, the one purple pill and the small icons. Used by the
// B2C header and footer and by every SITE-V2 page body. Links into /b2cnew are plain <a href> (another app).

export function useSignedInSite(): boolean {
  const { data: session } = authClient.useSession();
  return !!session;
}

/**
 * The "start the call" link for this page: the URL's ad keys, else (after hydration) the visit's held first touch,
 * then via=site&how=voice. Signed in it is "my jobs" to /b2cnew, never /join again (that would restart onboarding).
 */
export function useSiteStart(): { label: string; href: string; signedIn: boolean } {
  const signedIn = useSignedInSite();
  const { search } = useLocation();
  const [held, setHeld] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    try {
      setHeld(heldTrackingParams());
    } catch {
      setHeld(null);
    }
  }, []);
  if (signedIn) return { label: "my jobs", href: STU_HOME, signedIn };
  return { label: "start the call", href: siteStartHref(search, held), signedIn };
}

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`sv-brand ${className}`.trim()} aria-label="studojo home">
      <img src={LOGO_DOODLE} alt="" width={22} height={28} />
      <b>studojo</b>
    </Link>
  );
}

/** Stu: the logo's own head (the laugh by default), white with the rough outline, cut at the neck. Never on a purple
 * circle. Other faces: the owner's hand-drawn expressions in /public/stu. */
export function StuHead({ size = 64, className = "", face = "laugh" }: { size?: number; className?: string; face?: "laugh" | "grin" | "happy" | "sparkle" }) {
  const src = face === "laugh" ? STU_HEAD : `/stu/head-${face}.png`;
  return <img className={`sv-stu ${className}`.trim()} src={src} alt="" width={size} height={size} aria-hidden="true" />;
}

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`sv-kicker ${className}`.trim()}>{children}</span>;
}

/** THE button: the purple pill "start the call" (signed in: "my jobs"). `place` tags it (data-start), as on the homepage. */
export function StartPill({ size = "md", place, wide = false, className = "" }: { size?: "md" | "sm"; place: string; wide?: boolean; className?: string }) {
  const { label, href, signedIn } = useSiteStart();
  const cls = ["sv-btn", size === "sm" ? "sv-btn-sm" : "", wide ? "sv-btn-wide" : "", className].filter(Boolean).join(" ");
  return (
    <a href={href} className={cls} data-start={place}>
      {signedIn ? <ArrowIcon /> : <MicIcon />}
      {label}
    </a>
  );
}

export function MicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

export function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function BackIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

/** Small line icons for the lilac tiles (.sv-ico). */
export function TileIcon({ name }: { name: "doc" | "chart" | "mail" | "shield" | "book" | "help" | "search" | "lock" | "user" | "spark" }) {
  const paths: Record<string, ReactNode> = {
    doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5M8 7h7" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>,
  };
  return (
    <span className="sv-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  );
}
