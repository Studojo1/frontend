import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { clearTokenCache } from "~/lib/control-plane";
import { useOutreachStore } from "~/lib/outreach/store";
import { resetPostHog } from "~/lib/posthog";
import { BLOG, REPORTS, SECTION_HOW, SECTION_JOBS, SIGN_IN, stuHref } from "./links";
import { Logo } from "./Logo";

// The header on B2C hosts (studojo.pro): the job agent only. Used by the B2C homepage and, through
// components/common/header.tsx, by every other page there (blog, reports, legal). No old products.
// Placeholder look: structure and links are final, the visual design lands after the owner's pick.

/** On the homepage the sections are in the page; anywhere else they are on the homepage. */
function sectionHref(onHome: boolean, id: string): string {
  return onHome ? `#${id}` : `/#${id}`;
}

function SectionLink({ onHome, id, children, className, onClick }: { onHome: boolean; id: string; children: React.ReactNode; className: string; onClick?: () => void }) {
  return onHome ? (
    <a href={sectionHref(true, id)} className={className} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link to={sectionHref(false, id)} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

const NAV_LINK = "font-satoshi text-base text-studojo-ink hover:text-studojo-purple-strong";
const MOBILE_LINK = "flex min-h-11 items-center rounded-lg px-2 font-satoshi text-base text-studojo-ink hover:bg-lilac-50";

export function HeaderB2C() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === "/";
  const onAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");
  const { data: session, isPending } = authClient.useSession();
  const signedIn = !!session;
  const stu = stuHref(signedIn);

  // Close the phone menu when the page changes.
  useEffect(() => setOpen(false), [pathname]);

  const signOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Same clean-up as the classic header: nothing of this account survives into the next one.
          useOutreachStore.getState().resetFunnel();
          clearTokenCache();
          resetPostHog();
          navigate("/");
        },
      },
    });
  };

  const navItems = (className: string, close?: () => void) => (
    <>
      <SectionLink onHome={onHome} id={SECTION_HOW} className={className} onClick={close}>
        How it works
      </SectionLink>
      <SectionLink onHome={onHome} id={SECTION_JOBS} className={className} onClick={close}>
        Jobs
      </SectionLink>
      <Link to={BLOG} className={className} onClick={close}>
        Blog
      </Link>
      <Link to={REPORTS} className={className} onClick={close}>
        Reports
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-lilac-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[var(--section-max-width)] items-center justify-between gap-4 px-4 md:h-20 md:px-8">
        <Logo size={28} />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navItems(NAV_LINK)}
        </nav>

        <div className="flex items-center gap-3">
          {!isPending && !onAuthPage &&
            (signedIn ? (
              <button type="button" onClick={signOut} className={`hidden md:inline-flex ${NAV_LINK}`}>
                Sign out
              </button>
            ) : (
              <Link to={SIGN_IN} className={`hidden md:inline-flex ${NAV_LINK}`}>
                Sign in
              </Link>
            ))}
          {/* Another app: a full page load (links.ts). */}
          <a
            href={stu}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-studojo-purple-strong px-4 font-satoshi text-sm font-medium text-white hover:bg-studojo-ink md:text-base"
          >
            Talk to Stu
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-studojo-ink hover:bg-lilac-50 md:hidden"
            aria-expanded={open}
            aria-controls="b2c-mobile-menu"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="b2c-mobile-menu" className="border-t border-lilac-line bg-white px-4 py-3 md:hidden" aria-label="Mobile menu">
          <div className="flex flex-col gap-1">
            {navItems(MOBILE_LINK, () => setOpen(false))}
            {!isPending && !onAuthPage &&
              (signedIn ? (
                <button type="button" onClick={() => { setOpen(false); signOut(); }} className={`${MOBILE_LINK} text-left`}>
                  Sign out
                </button>
              ) : (
                <Link to={SIGN_IN} className={MOBILE_LINK} onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              ))}
          </div>
        </nav>
      )}
    </header>
  );
}
