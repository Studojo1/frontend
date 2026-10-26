import { Link } from "react-router";
import { LOGO_DOODLE } from "./links";

// The B2C header and footer logo: the bare laughing doodle (the real Studojo logo, as a transparent cutout), no
// purple square, as in nb.html; the owner wants no purple but the start buttons. The browser-tab favicon and the
// classic studojo.com header keep /favicon.png. Never draw a smooth bean SVG in its place.
export function Logo() {
  return (
    <Link to="/" className="sjb-brand" aria-label="studojo home">
      <img src={LOGO_DOODLE} alt="" width={24} height={30} />
      <b>studojo</b>
    </Link>
  );
}
