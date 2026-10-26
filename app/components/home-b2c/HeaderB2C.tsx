import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { clearTokenCache } from "~/lib/control-plane";
import { useOutreachStore } from "~/lib/outreach/store";
import { resetPostHog } from "~/lib/posthog";
import "./b2c.css";
import { StartButton, useSignedIn } from "./cta";
import { SETTINGS, SIGN_IN, STU_HOME } from "./links";
import { Logo } from "./Logo";

// The header on B2C hosts (studojo.pro): the job agent only. Used by the B2C homepage and, through
// components/common/header.tsx, by every other page there (blog, reports, legal). No old products and no nav
// links (owner, 27 Oct): blog and reports are reached through the footer and the homepage's read section.
//   signed out: logo, "sign in", and on desktop the small "start the call" button (sticky, so it stays)
//   signed in:  logo, "my jobs" (/b2cnew, another app: a plain <a>, a full page load) and a small account menu
//               with "settings" (account deletion lives there) and "sign out"
// On phones the header carries no start button: the hero's button, then the bottom bar, do.

export function HeaderB2C() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signedIn = useSignedIn();
  const { data: session } = authClient.useSession();
  const onAuthPage = pathname === "/auth" || pathname.startsWith("/auth/");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // A hairline once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The account menu closes on a page change, a click outside and Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const signOut = () => {
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
    <header className={`sjb sjb-hdr${scrolled ? " sjb-scrolled" : ""}`}>
      <div className="sjb-hdr-in">
        <Logo />
        <div className="sjb-hdr-right">
          {signedIn ? (
            <>
              <a href={STU_HOME} className="sjb-quiet sjb-myjobs">
                my jobs
              </a>
              <div className="sjb-acct" ref={menuRef}>
                <button
                  type="button"
                  className="sjb-acct-btn"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls="sjb-acct-menu"
                  aria-label="account"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  {initial}
                </button>
                {menuOpen ? (
                  <div className="sjb-acct-menu" id="sjb-acct-menu" role="menu">
                    <Link to={SETTINGS} role="menuitem" onClick={() => setMenuOpen(false)}>
                      settings
                    </Link>
                    <button type="button" role="menuitem" onClick={signOut}>
                      sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              {onAuthPage ? null : (
                <Link to={SIGN_IN} className="sjb-quiet">
                  sign in
                </Link>
              )}
              <StartButton size="sm" place="header" className="sjb-hdr-start" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
