import { Link } from "react-router";

const LINKS = [
  { to: "/contact", label: "Help" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/refund-policy", label: "Refund Policy" },
];

/**
 * The footer inside the Outreach app (upload through dashboard). The full
 * marketing footer, with its link columns and giant wordmark, sat in the
 * middle of the paid funnel and competed with the next step (audit PH-15).
 * This keeps only help and the legal links, each a 44px tap target.
 */
export function AppFooter() {
  return (
    <footer className="border-t border-studojo-ink/10 bg-white">
      <div className="mx-auto flex max-w-[var(--section-max-width)] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 md:px-8">
        <p className="font-satoshi text-xs text-studojo-muted">
          © {new Date().getFullYear()} Studojo Labs Private Limited
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="inline-flex min-h-11 items-center font-satoshi text-sm text-studojo-muted hover:text-studojo-purple"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
