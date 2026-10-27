import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { HOW_IT_WORKS } from "../site-links";
import { ArrowIcon, Kicker, StuHead, TileIcon } from "../ui";

// SITE-V2 /reports on B2C hosts (studojo.pro): the page head, the newest three, one quiet Stu card, then every other
// report as a white card with topic chips and a "show more" step so a phone does not get a 38k px page. The list is
// routes/reports.tsx's own published, newest-first list (same data as studojo.com, which keeps its classic page).
// Every card is in the HTML (hidden ones only get a class), so crawlers still see every link. Styles: site-reports.css.

export type ReportCardData = {
  slug: string;
  publishDate: string;
  title: string;
  excerpt: string;
  category: string;
  type: string;
  date: string;
};

/** The classic filter types, in the classic order, with lowercase chip labels. */
const TYPES: Array<{ type: string; label: string }> = [
  { type: "Sector", label: "careers" },
  { type: "Internships", label: "internships" },
  { type: "Cities", label: "cities and countries" },
  { type: "Colleges", label: "colleges" },
  { type: "Hiring Calendar", label: "hiring calendar" },
];

const FEATURED = 3;
const FIRST = 12;

function kicker(r: ReportCardData): string {
  // "Sector" is the classic catch-all type name; the chip calls it "careers", so the card does too.
  const cat = r.category === "Sector" ? "careers" : r.category.toLowerCase();
  return `${cat} · ${r.date.toLowerCase()}`;
}

function ReportCard({ r, featured = false, hidden = false }: { r: ReportCardData; featured?: boolean; hidden?: boolean }) {
  const cls = ["sv-card", "sv-rx-card", featured ? "sv-rx-feat" : "", hidden ? "sv-rx-hide" : ""].filter(Boolean).join(" ");
  return (
    <Link to={`/reports/${r.slug}`} className={cls}>
      {featured ? <TileIcon name="chart" /> : null}
      <span className="sv-mono sv-rx-kick">{kicker(r)}</span>
      <h3 className="sv-rx-title">{r.title}</h3>
      {r.excerpt ? <p className="sv-rx-sum">{r.excerpt}</p> : null}
      <span className="sv-go">
        read the report <ArrowIcon size={15} />
      </span>
    </Link>
  );
}

/** `requestForm`: the route's own "request a report" form (reports.tsx RequestForm, same fields and the same POST), shown
 * in this look by site-reports.css (.sv-rx-request). */
export function ReportsIndexB2C({ reports, jsonLd, requestForm }: { reports: ReportCardData[]; jsonLd: object; requestForm?: ReactNode }) {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const featured = reports.slice(0, FEATURED);
  const list = filter === "all" ? reports.slice(FEATURED) : reports.filter((r) => r.type === filter);
  const chips = [{ type: "all", label: "all", n: reports.length }].concat(
    TYPES.map((t) => ({ ...t, n: reports.filter((r) => r.type === t.type).length })).filter((t) => t.n > 0),
  );
  const pick = (type: string) => {
    setFilter(type);
    setOpen(false);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="sv-page sv-rx">
        <div className="sv-in">
          <header className="sv-pagehead">
            <Kicker>studojo reports</Kicker>
            <h1 className="sv-h1">reports on getting hired.</h1>
            <p className="sv-lead">
              {reports.length} free reports on entry-level pay, hiring and applying, for students and freshers in India and beyond.
            </p>
          </header>

          {featured.length > 0 ? (
            <section className="sv-rx-block" aria-labelledby="rx-new">
              <h2 id="rx-new" className="sv-kicker sv-rx-label">newest</h2>
              <div className="sv-rx-grid sv-rx-grid-feat">
                {featured.map((r) => (
                  <ReportCard key={r.slug} r={r} featured />
                ))}
              </div>
            </section>
          ) : null}

          <aside className="sv-card sv-rx-stu" aria-label="about stu">
            <StuHead size={64} />
            <div className="sv-rx-stu-copy">
              <h2 className="sv-h3">find the roles these reports talk about.</h2>
              <p className="sv-body">
                Stu, Studojo's AI job agent, finds roles that fit you, tailors your resume to each one and finds the right person to write to.
              </p>
            </div>
            <a href={HOW_IT_WORKS} className="sv-link sv-rx-stu-link">
              how it works
            </a>
          </aside>

          <section className="sv-rx-block sv-rx-all" aria-labelledby="rx-all">
            <div className="sv-rx-allhead">
              <h2 id="rx-all" className="sv-h2">browse by topic.</h2>
              <div className="sv-rx-chips" role="group" aria-label="filter reports by topic">
                {chips.map((c) => (
                  <button
                    key={c.type}
                    type="button"
                    className={`sv-rx-chip${filter === c.type ? " sv-rx-on" : ""}`}
                    aria-pressed={filter === c.type}
                    onClick={() => pick(c.type)}
                  >
                    {c.label}
                    <span className="sv-rx-n">{c.n}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sv-rx-grid">
              {list.map((r, i) => (
                <ReportCard key={r.slug} r={r} hidden={!open && i >= FIRST} />
              ))}
            </div>
            {!open && list.length > FIRST ? (
              <div className="sv-rx-more">
                <button type="button" className="sv-btn-ghost" onClick={() => setOpen(true)}>
                  show {list.length - FIRST} more reports
                </button>
              </div>
            ) : null}
          </section>

          {requestForm ? (
            <section className="sv-rx-block sv-rx-request" aria-label="request a report">
              {requestForm}
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
