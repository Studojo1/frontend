import { Link } from "react-router";
import { Footer } from "~/components/common/footer";
import { Header } from "~/components/common/header";
import { BLOG, HOW_IT_WORKS, REPORTS } from "../site-links";
import { ArrowIcon, BackIcon, Kicker, StuHead, TileIcon } from "../ui";

// SITE-V2 error page on B2C hosts (components/error-page.tsx hands over here; the root Layout sets
// html[data-sv2="error"]): every 404 (an unknown URL, a missing blog post, profile or report, all through the root
// ErrorBoundary) and the 500 / app error. Stu's head, a mono kicker with the code, a lowercase line, the details,
// a white pill home and a quiet "go back", three places to go next, then the site footer. The 500 keeps its own
// message and details; the dev-only stack trace stays as before.

type Props = { statusCode?: number; message: string; details: string; stack?: string };

const NEXT = [
  { href: HOW_IT_WORKS, icon: "spark", title: "how it works", body: "One short call, then Stu gets to work.", go: "see how it works", router: false },
  { href: BLOG, icon: "book", title: "the studojo blog", body: "Short reads on internships, applying and choosing an offer.", go: "all posts", router: true },
  { href: REPORTS, icon: "chart", title: "reports", body: "Free reports on entry-level pay, hiring and skills.", go: "all reports", router: true },
] as const;

export function ErrorPageB2C({ statusCode, message, details, stack }: Props) {
  const missing = statusCode === 404;
  return (
    <>
      <Header />
      <main className="sv-page sv-err">
        <div className="sv-in">
          <div className="sv-err-head">
            <StuHead size={120} face="grin" />
            <Kicker>{statusCode ? String(statusCode) : "error"}</Kicker>
            <h1 className="sv-h1">{missing ? "this page isn't here." : message}</h1>
            <p className="sv-lead">{details}</p>
            <div className="sv-err-acts">
              <Link to="/" className="sv-btn-ghost">
                back to the homepage
              </Link>
              <button type="button" className="sv-link sv-err-back" onClick={() => window.history.back()}>
                <BackIcon />
                go back
              </button>
            </div>
          </div>

          <nav className="sv-err-go" aria-label="places to go">
            {NEXT.map((n) => {
              const inner = (
                <>
                  <TileIcon name={n.icon} />
                  <h2 className="sv-h3">{n.title}</h2>
                  <p className="sv-body">{n.body}</p>
                  <span className="sv-go">
                    {n.go}
                    <ArrowIcon />
                  </span>
                </>
              );
              return n.router ? (
                <Link key={n.href} to={n.href} className="sv-card">
                  {inner}
                </Link>
              ) : (
                <a key={n.href} href={n.href} className="sv-card">
                  {inner}
                </a>
              );
            })}
          </nav>

          {stack && import.meta.env.DEV && (
            <details className="sv-err-stack">
              <summary>Stack Trace (Dev Only)</summary>
              <pre>
                <code>{stack}</code>
              </pre>
            </details>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
