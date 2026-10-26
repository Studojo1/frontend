import { Link } from "react-router";

// The real Studojo logo is the laughing doodle at /favicon.png. Never draw a smooth bean SVG in its place.
export function Logo() {
  return (
    <Link to="/" className="sjb-brand" aria-label="studojo home">
      <img src="/favicon.png" alt="" width={30} height={30} />
      <b>studojo</b>
    </Link>
  );
}
