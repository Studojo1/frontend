import type { ReactNode } from "react";
import { Link } from "react-router";
import { Arrow, Book, Chart } from "./icons";
import { BLOG, REPORTS, SECTION_READ } from "./links";

// 6. Read (#read): blogs and reports, the two kept resources. Real titles and routes (a1v2-copy.md): the blog
// posts are live on studojo.com, the reports are routes in this app. All router links (this site).
const SHELVES: { title: string; icon: ReactNode; all: { label: string; to: string }; items: { title: string; to: string }[] }[] = [
  {
    title: "from the blog",
    icon: <Book />,
    all: { label: "all blogs", to: BLOG },
    items: [
      { title: "How Many Internships to Apply To? Find the Ideal Number", to: "/blog/how-many-internships-to-apply-to-find-the-ideal-number" },
      { title: "Internship Myths Debunked: Real Advice for Career Success", to: "/blog/internship-myths-debunked-real-advice-for-career-success" },
      {
        title: "Why Students Reject Internship Offers & How to Choose the Right One",
        to: "/blog/why-students-reject-internship-offers-and-how-to-choose-the-right-one",
      },
    ],
  },
  {
    title: "from our reports",
    icon: <Chart />,
    all: { label: "all reports", to: REPORTS },
    items: [
      { title: "First Job Report India 2026: What Entry-Level Actually Looks Like", to: "/reports/first-job-india-2026" },
      { title: "Cold Outreach: What Actually Gets a Reply", to: "/reports/cold-outreach-what-gets-reply-2026" },
      { title: "Why Companies Post Jobs Without Planning to Hire", to: "/reports/ghost-jobs-2026" },
    ],
  },
];

export function BlogReports() {
  return (
    <section className="sjb-sec" id={SECTION_READ} aria-labelledby="read-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">blogs and reports</span>
          <h2 className="sjb-h-sec" id="read-h">
            read before you call.
          </h2>
          <p className="sjb-lead">Plain answers on getting hired, from the Studojo team.</p>
        </header>

        <div className="s-read">
          {SHELVES.map((shelf) => (
            <div className="sjb-card s-shelf" key={shelf.title}>
              <div className="s-shelf-h">
                <span className="s-ico" aria-hidden="true">
                  {shelf.icon}
                </span>
                <h3 className="sjb-h-card">{shelf.title}</h3>
              </div>
              {shelf.items.map((item) => (
                <Link key={item.to} to={item.to} className="s-item">
                  <span>{item.title}</span>
                  <Arrow />
                </Link>
              ))}
              <Link to={shelf.all.to} className="sjb-link-type s-all">
                {shelf.all.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
