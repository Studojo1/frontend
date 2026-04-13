import { Link } from "react-router";

export function CTABanner() {
  return (
    <section className="border-b border-neutral-900 bg-violet-500 px-4 pt-8 pb-8 md:px-8 md:py-24">
      <div className="mx-auto flex max-w-[var(--section-max-width)] flex-col items-center gap-4 text-center md:gap-7">
        <h2 className="font-['Clash_Display'] text-3xl font-medium leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
          2026 recruiting won&apos;t wait for you.
        </h2>
        <p className="max-w-xl font-['Satoshi'] text-base font-normal leading-6 text-purple-100 md:text-xl md:leading-7">
          138 students have already found their hiring managers. Takes 2 minutes to set up.
        </p>
        <div className="flex w-full flex-col gap-4 md:flex-row md:flex-wrap md:justify-center">
          <Link
            to="/outreach/onboarding/upload"
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white font-['Satoshi'] text-base font-medium leading-6 text-violet-500 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none md:h-16 md:w-auto md:px-10 md:text-lg md:leading-7"
          >
            Start Outreaching &rarr;
          </Link>
          <a
            href="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl border-2 border-white font-['Satoshi'] text-base font-medium leading-6 text-white transition-transform hover:translate-x-[2px] hover:translate-y-[2px] md:h-16 md:w-auto md:px-10 md:text-lg md:leading-7"
          >
            Join free WhatsApp community
          </a>
        </div>
      </div>
    </section>
  );
}
