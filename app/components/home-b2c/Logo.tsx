import { Link } from "react-router";

// The real Studojo logo is the laughing doodle at /favicon.png. Never draw a smooth bean SVG in its place.
export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Link to="/" className={`inline-flex min-h-11 items-center gap-2 ${className}`} aria-label="Studojo home">
      <img src="/favicon.png" alt="" width={size} height={size} className="shrink-0" />
      <span className="font-satoshi text-2xl font-black leading-none tracking-tight text-studojo-ink md:text-3xl">studojo</span>
    </Link>
  );
}
