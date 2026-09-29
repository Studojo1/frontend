import type { ReactNode } from "react";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";

type TocItem = { id: string; label: string };

// Shared layout for /privacy, /terms and /refund-policy. The text itself is
// generated from the approved drafts; styles for it live in app.css
// under .legal-prose.
export function LegalPage({
  title,
  subtitle,
  toc,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  toc: TocItem[];
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="border-b border-neutral-900 bg-purple-50 py-14 md:py-20">
          <Section width="narrow" className="text-center">
            <p className="font-['Satoshi'] text-sm font-medium uppercase tracking-wider text-neutral-600">
              Studojo Labs Private Limited
            </p>
            <h1 className="mt-3 font-['Clash_Display'] text-4xl font-medium leading-tight text-neutral-900 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 font-['Satoshi'] text-base leading-7 text-neutral-700 md:text-lg">{subtitle}</p>
          </Section>
        </section>

        <Section width="wide" className="py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
            <nav aria-label="Contents" className="lg:sticky lg:top-24 lg:self-start">
              <p className="mb-3 font-['Satoshi'] text-xs font-bold uppercase tracking-wider text-neutral-500">Contents</p>
              <ol className="grid gap-1 font-['Satoshi'] text-sm">
                {toc.map((t) => (
                  <li key={t.id}>
                    {/* py-2 keeps the tap target near 44px on phones */}
                    <a href={`#${t.id}`} className="block py-2 text-neutral-600 hover:text-studojo-purple-strong lg:py-1">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <article className="legal-prose max-w-3xl">{children}</article>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
