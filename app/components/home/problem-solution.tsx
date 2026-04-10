import { Link } from "react-router";
import { FiArrowRight } from "react-icons/fi";

const BAD_ITEMS = [
  "Apply to 100 portals",
  "Compete with 500+ applicants",
  "ATS rejects before humans read",
  "Wait months, hear nothing",
];

const GOOD_ITEMS = [
  "Email the actual hiring manager",
  "Personal message, not a form",
  "Reply in days, not months",
  "First reply typically within a week",
];

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M15 4.5L6.75 12.75 3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProblemSolution() {
  return (
    <section className="border-b border-neutral-900 bg-white px-4 pt-8 pb-8 md:px-8 md:pt-24 md:pb-16">
      <div className="mx-auto max-w-[var(--section-max-width)]">
        <div className="mb-8 text-center md:mb-14">
          <h2 className="font-['Clash_Display'] text-3xl font-medium leading-8 text-neutral-900 md:text-4xl lg:text-5xl">
            The portal game is{" "}
            <span className="inline-flex rounded-2xl border-2 border-neutral-900 bg-red-200 px-3 py-1 font-['Satoshi'] text-xl font-medium leading-8 text-neutral-900 md:text-3xl">
              broken
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-['Satoshi'] text-base font-normal leading-6 text-neutral-600 md:text-xl md:leading-7">
            You apply. They don't read it. You never hear back. Sound familiar?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Bad — The old way */}
          <div className="flex flex-col gap-4 rounded-[32px] border-2 border-red-200 bg-red-50 p-6 md:rounded-[45px] md:p-8">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-300 bg-red-100 text-red-500">
                <XIcon />
              </span>
              <span className="font-['Clash_Display'] text-lg font-medium text-red-700 md:text-xl">
                The old way
              </span>
            </div>
            <ul className="flex flex-col gap-3" role="list">
              {BAD_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3 font-['Satoshi'] text-base font-normal leading-6 text-red-800 md:text-lg">
                  <span className="shrink-0 text-red-400">
                    <XIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Good — The Studojo way */}
          <div className="flex flex-col gap-4 rounded-[32px] border-2 border-neutral-900 bg-violet-500 p-6 shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] md:rounded-[45px] md:p-8">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-white">
                <CheckIcon />
              </span>
              <span className="font-['Clash_Display'] text-lg font-medium text-white md:text-xl">
                The Studojo way
              </span>
            </div>
            <ul className="flex flex-col gap-3" role="list">
              {GOOD_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3 font-['Satoshi'] text-base font-medium leading-6 text-white md:text-lg">
                  <span className="shrink-0 text-emerald-300">
                    <CheckIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            to="/outreach/onboarding/upload"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-violet-500 px-8 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            Start outreaching <FiArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
