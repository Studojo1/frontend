import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { clearTokenCache } from "~/lib/control-plane";
import { useOutreachStore } from "~/lib/outreach/store";
import { resetPostHog } from "~/lib/posthog";
import { authUrl } from "~/lib/return-to";
import { BLOG, HOW_IT_WORKS, REPORTS, SETTINGS, STU_HOME } from "./site-links";
import { Brand, MenuIcon, StartPill, useSignedInSite } from "./ui";

// SITE-V2 header (h1.html): on every studojo.pro page but the homepage (components/common/header.tsx picks it on B2C
// hosts). The job agent only, no old products.
//   desktop: wordmark | how it works, blog, reports | sign in, "start the call"
//   phones:  wordmark | "start the call", menu (how it works, blog, reports, sign in)
// Signed in, the pill is "my jobs" (/b2cnew) and "sign in" becomes the account menu (settings, sign out).
// /b2cnew is another app: a plain <a>, a full page load.

export function SiteHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signedIn = useSignedInSite();
  const { data: session } = authClient.useSession();
  // The sign-in and password pages carry their own way to sign in, so the header leaves its "sign in" out there.
  const onAuthPage = pathname === "/auth" || pathname.startsWith("/auth/") || pathname === "/forgot-password" || pathname === "/reset-password";
  const signIn = authUrl("signin", STU_HOME);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const hdrRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Both menus close on a page change, a click outside and Escape.
  useEffect(() => {
    setMenuOpen(false);
    setAcctOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!menuOpen && !acctOpen) return;
    const onDown = (e: PointerEvent) => {
      if (hdrRef.current && !hdrRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setAcctOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setAcctOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, acctOpen]);

  const signOut = () => {
    setAcctOpen(false);
    setMenuOpen(false);
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

  const initial = (session?.user?.name || session?.user?.email || "").trim().charAt(0).toLowerCase() || "s";

  return (
    <header ref={hdrRef} className={`sv-hdr${scrolled ? " sv-scrolled" : ""}`}>
      <div className="sv-hdr-in">
        <Brand />
        <nav className="sv-nav sv-desk" aria-label="main">
          <a href={HOW_IT_WORKS} className="sv-navlink">
            how it works
          </a>
          <Link to={BLOG} className="sv-navlink">
            blog
          </Link>
          <Link to={REPORTS} className="sv-navlink">
            reports
          </Link>
        </nav>
        <div className="sv-hdr-right">
          {signedIn ? (
            <div className="sv-acct sv-desk">
              <button
                type="button"
                className="sv-acct-btn"
                aria-haspopup="menu"
                aria-expanded={acctOpen}
                aria-controls="sv-acct-menu"
                aria-label="account"
                onClick={() => setAcctOpen((o) => !o)}
              >
                {initial}
              </button>
              {acctOpen ? (
                <div className="sv-acct-menu" id="sv-acct-menu" role="menu">
                  <Link to={SETTINGS} role="menuitem" onClick={() => setAcctOpen(false)}>
                    settings
                  </Link>
                  <button type="button" role="menuitem" onClick={signOut}>
                    sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : onAuthPage ? null : (
            <Link to={signIn} className="sv-signin sv-desk">
              sign in
            </Link>
          )}
          <StartPill size="sm" place="header" />
          <button
            type="button"
            className="sv-menu-btn sv-phone"
            aria-expanded={menuOpen}
            aria-controls="sv-menu"
            aria-label={menuOpen ? "close menu" : "menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="sv-menu sv-phone" id="sv-menu" aria-label="menu">
          <a href={HOW_IT_WORKS}>how it works</a>
          <Link to={BLOG}>blog</Link>
          <Link to={REPORTS}>reports</Link>
          {signedIn ? (
            <>
              <Link to={SETTINGS}>settings</Link>
              <button type="button" onClick={signOut}>
                sign out
              </button>
            </>
          ) : onAuthPage ? null : (
            <Link to={signIn}>sign in</Link>
          )}
        </nav>
      ) : null}
    </header>
  );
}
