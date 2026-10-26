import type { ReactNode } from "react";

// Hero: a thin, swappable shell. The owner is choosing a restrained desktop hero (round 2, variants A1/A2/A3);
// the picked variant replaces this markup and keeps the props: a headline, a subhead, two CTAs and the Stu slot.
// No hero visuals here yet on purpose. Headline type per the owner: Satoshi 500 (or Geist 500), about
// 80 to 88px, -0.03em tracking, lowercase, not Clash.
//
// CTAs into /b2cnew are another app, so every CTA is a plain <a href> (links.ts). The primary one signed out
// opens /b2cnew/start, and it is the way in when the Stu embed does not load.

export type HeroCta = { label: string; href: string };

export type HeroB2CProps = {
  headline: string;
  subhead: string;
  primary: HeroCta;
  secondary: HeroCta;
  /** Stu in the hero (StuSlot). Placed by the variant. */
  stu?: ReactNode;
};

export function HeroB2C({ headline, subhead, primary, secondary, stu }: HeroB2CProps) {
  return (
    <section aria-labelledby="hero-title" className="bg-white">
      <div className="mx-auto grid max-w-[var(--section-max-width)] gap-10 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:items-center md:px-8 md:py-24">
        <div className="flex flex-col gap-6">
          <h1 id="hero-title" className="font-satoshi text-5xl font-medium lowercase leading-[1.02] tracking-[-0.03em] text-studojo-ink md:text-[84px]">
            {headline}
          </h1>
          <p className="max-w-xl font-satoshi text-lg text-studojo-muted md:text-xl">{subhead}</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={primary.href}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-studojo-ink px-6 font-satoshi text-base font-medium text-white hover:bg-studojo-purple-strong"
            >
              {primary.label}
            </a>
            <a href={secondary.href} className="font-satoshi text-base font-medium text-studojo-ink underline underline-offset-4 hover:text-studojo-purple-strong">
              {secondary.label}
            </a>
          </div>
        </div>
        {stu}
      </div>
    </section>
  );
}
