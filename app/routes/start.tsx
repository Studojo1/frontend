import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { FiArrowRight } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { REAL_NUMBERS } from "~/components/outreach/RealNumbers";
import { trackMeta } from "~/lib/meta-pixel";

// /start: the page paid ads point at (audit VS-V06). /outreach is a 6-screen
// marketing page with dozens of links; ad visitors need one screen and one
// button. The button goes to resume upload, which sends logged-out visitors
// to sign-up and back, carrying the ad's utm_* / fbclid through.
export function meta() {
  return [
    { title: "Email the hiring managers who can hire you | Studojo" },
    {
      name: "description",
      content: "Upload your resume. Studojo finds the hiring managers who can hire you, writes each one a personal email, and sends it from your Gmail.",
    },
    // An ad landing page, not a search result: /outreach is the canonical page.
    { name: "robots", content: "noindex" },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/outreach" },
  ];
}

const STEPS = [
  "Upload your resume (2 minutes)",
  "See the hiring managers who can hire you, before you pay",
  "We write each one a personal email and send it from your Gmail",
];

export default function Start() {
  const { search } = useLocation();
  const cta = `/outreach/onboarding/upload${search}`;

  // Paid ads land here, so this is the audience retargeting is built from.
  // Without its own event these visitors gave Meta nothing but a PageView.
  useEffect(() => {
    trackMeta("ViewContent", { content_name: "Outreach ad landing" });
  }, []);
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header landing />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-10">
        <h1 className="font-clash text-3xl font-bold leading-tight text-studojo-ink md:text-4xl">
          Skip the job board. Email the people who can hire you.
        </h1>
        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3 font-satoshi text-base text-studojo-ink">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-purple font-bold text-white text-sm">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <Link
          to={cta}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-studojo-ink bg-studojo-purple font-satoshi text-lg font-bold text-white shadow-brutal"
        >
          Find my hiring managers <FiArrowRight className="h-5 w-5" />
        </Link>
        <p className="text-center font-satoshi text-sm text-studojo-muted">
          {REAL_NUMBERS.students} students signed up.
        </p>
      </main>
    </div>
  );
}
