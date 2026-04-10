import { Link } from "react-router";
import { FiSend } from "react-icons/fi";

const CHECKLIST = [
  "AI finds the right hiring manager",
  "Personalised email for each one",
  "Sent from your own Gmail",
  "Reply tracking included",
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className ?? ""}`}
      aria-hidden
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeaturedProductCard() {
  return (
    <section className="border-b border-neutral-900 bg-white px-4 pt-8 pb-8 md:px-8 md:pt-24 md:pb-16">
      <div className="mx-auto max-w-[var(--section-max-width)]">
        <div className="mb-8 text-center md:mb-14">
          <h2 className="font-['Clash_Display'] text-3xl font-medium leading-8 text-neutral-900 md:text-4xl lg:text-5xl">
            Your path to the{" "}
            <span className="inline-flex rounded-2xl border-2 border-neutral-900 bg-violet-300 px-3 py-1 font-['Satoshi'] text-xl font-medium leading-8 text-neutral-900 md:text-3xl">
              interview room
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-['Satoshi'] text-base font-normal leading-6 text-neutral-700 md:text-xl md:leading-7">
            One tool. One goal. Get you in front of the right people.
          </p>
        </div>

        <article className="flex flex-col gap-6 rounded-[32px] border-2 border-neutral-900 bg-violet-500 p-6 shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] md:rounded-[45px] md:p-10 lg:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: icon, title, description, checklist */}
            <div className="flex flex-col gap-5 md:max-w-lg">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white" aria-hidden>
                  <FiSend className="h-7 w-7 text-violet-500" />
                </div>
                <span className="inline-flex items-center rounded-full border-2 border-white/40 bg-white/20 px-3 py-1 font-['Satoshi'] text-xs font-bold text-white">
                  Hero Product
                </span>
              </div>

              <h3 className="font-['Clash_Display'] text-3xl font-medium leading-8 text-white md:text-4xl">
                Outreach Dojo
              </h3>
              <p className="font-['Satoshi'] text-base font-normal leading-6 text-white/90 md:text-xl md:font-medium md:leading-7">
                Skip the job portal queue. Email the hiring managers who can actually say yes.
              </p>
              <ul className="flex flex-col gap-3" role="list">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-center gap-2 font-['Satoshi'] text-sm font-normal leading-5 text-white md:text-xl md:font-medium md:leading-6">
                    <CheckIcon className="h-5 w-5 text-white md:h-6 md:w-6" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTA */}
            <div className="flex shrink-0 flex-col items-start gap-4 rounded-[24px] border-2 border-white/30 bg-white/15 p-6 backdrop-blur-sm md:min-w-[220px] md:items-center md:text-center">
              <p className="font-['Satoshi'] text-sm text-white/80 md:text-base">
                Ready to skip the queue and email hiring managers directly?
              </p>
              <Link
                to="/outreach/onboarding/upload"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-violet-600 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Get Internship &rarr;
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

// Keep DojoCards as an alias for backwards compat if anything imports it
export { FeaturedProductCard as DojoCards };
