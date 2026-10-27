import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "~/lib/auth-client";
import { clearTokenCache } from "~/lib/control-plane";
import { useOutreachStore } from "~/lib/outreach/store";
import { resetPostHog } from "~/lib/posthog";
import { SIGN_IN, STU_HOME } from "../home-b2c/links";
import { useSignedIn } from "./start";

// The homepage's own header (h1.html, as the prototype hp/v2.html has it): the logo on the left, "sign in" on the
// right, nothing else at any size. Signed in it is "my jobs", a plain <a> to /b2cnew (another app on this host: a
// full page load, never this site's router), and "sign out" next to it, at every size (the homepage has no phone
// menu), so someone on a shared device can leave this account and start with another (owner, 27 Oct). Signing out
// does what the site header's does (site-b2c/SiteHeader.tsx): nothing of this account survives into the next one, and
// the homepage comes back signed out ("start the call", "sign in"). A hairline shows once the page scrolls. The
// site-wide B2C header (site-b2c/SiteHeader.tsx) is for the other pages and is not used here.
export function HomeHeader() {
  const signedIn = useSignedIn();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const signOut = () => {
    if (leaving) return;
    setLeaving(true);
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Same clean-up as the site header: nothing of this account survives into the next one.
          useOutreachStore.getState().resetFunnel();
          clearTokenCache();
          resetPostHog();
          setLeaving(false);
          navigate("/");
        },
        onError: () => setLeaving(false),
      },
    });
  };
  return (
    <header className={scrolled ? "hv-hdr hv-scrolled" : "hv-hdr"} data-hdr>
      <Link className="hv-brand" to="/" aria-label="studojo home">
        <img src="/stu/logo-doodle.png" width={24} height={30} alt="" />
        <b>studojo</b>
      </Link>
      <div className="hv-hdr-right">
        {signedIn ? (
          <>
            <a className="hv-signin" href={STU_HOME}>
              my jobs
            </a>
            <button type="button" className="hv-signout" onClick={signOut} disabled={leaving} aria-busy={leaving || undefined} data-signout="">
              {leaving ? "signing out" : "sign out"}
            </button>
          </>
        ) : (
          <Link className="hv-signin" to={SIGN_IN}>
            sign in
          </Link>
        )}
      </div>
    </header>
  );
}
