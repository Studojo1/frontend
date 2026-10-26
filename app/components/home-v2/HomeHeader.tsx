import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SIGN_IN, STU_HOME } from "../home-b2c/links";
import { useSignedIn } from "./start";

// The homepage's own header (h1.html, as the prototype hp/v2.html has it): the logo on the left, "sign in" on the
// right, nothing else at any size. Signed in it is "my jobs", a plain <a> to /b2cnew (another app on this host: a
// full page load, never this site's router). A hairline shows once the page scrolls. The site-wide B2C header
// (home-b2c/HeaderB2C.tsx) is for the other pages and is not used here.
export function HomeHeader() {
  const signedIn = useSignedIn();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={scrolled ? "hv-hdr hv-scrolled" : "hv-hdr"} data-hdr>
      <Link className="hv-brand" to="/" aria-label="studojo home">
        <img src="/stu/logo-doodle.png" width={24} height={30} alt="" />
        <b>studojo</b>
      </Link>
      <div className="hv-hdr-right">
        {signedIn ? (
          <a className="hv-signin" href={STU_HOME}>
            my jobs
          </a>
        ) : (
          <Link className="hv-signin" to={SIGN_IN}>
            sign in
          </Link>
        )}
      </div>
    </header>
  );
}
