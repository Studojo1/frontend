import { Link } from "react-router";
import { BLOG, REPORTS } from "./links";

// Blog and reports: the two kept resources. Placeholder cards until the owner picks a direction; the design
// can list the latest posts and reports here (a homepage loader reading what /blog and /reports already read).
const CARDS = [
  { to: BLOG, title: "Blog", body: "Guides to the job search, written for students and freshers." },
  { to: REPORTS, title: "Reports", body: "Research on hiring, pay and the job market for students." },
] as const;

export function BlogReports() {
  return (
    <section aria-labelledby="resources-title" className="bg-white">
      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-16 md:px-8 md:py-24">
        <h2 id="resources-title" className="font-clash text-3xl font-medium text-studojo-ink md:text-5xl">
          Read before you apply
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="block rounded-[var(--radius-card)] border border-lilac-line bg-white p-6 shadow-lilac-soft hover:shadow-lilac-card"
            >
              <h3 className="font-clash text-2xl font-medium text-studojo-ink">{card.title}</h3>
              <p className="mt-2 font-satoshi text-base text-studojo-muted">{card.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
