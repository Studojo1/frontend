import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";
// The playbook PDF lives in /public. Replace this filename with the uploaded PDF.
const PLAYBOOK_PDF = "/webinar-playbook.pdf";

export function meta() {
  return [
    { title: "The Studojo Playbook | Studojo" },
    { name: "description", content: "The Studojo career playbook — the step-by-step guide to using your toolkit to land interviews and internships." },
    { name: "robots", content: "noindex, follow" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/playbook` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "The Studojo Playbook" },
    { property: "og:description", content: "The step-by-step guide to using your toolkit to land interviews and internships." },
    { property: "og:url", content: `${BASE_URL}/playbook` },
    { property: "og:site_name", content: "Studojo" },
  ];
}

export default function Playbook() {
  return (
    <div className="min-h-screen bg-neutral-50 font-['Satoshi']">
      <Header />

      <main className="pt-10 pb-16">
        {/* Heading */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border-2 border-neutral-900 mb-5">
            The Playbook
          </span>
          <h1 className="font-['Clash_Display'] text-4xl sm:text-5xl font-extrabold text-neutral-900 leading-tight">
            Read the playbook.
          </h1>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
            Your step-by-step guide to using the toolkit and turning the webinar into actual interviews. Read it right here, or download it to keep.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={PLAYBOOK_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
            >
              Open full screen ↗
            </a>
            <a
              href={PLAYBOOK_PDF}
              download
              className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
            >
              Download PDF ↓
            </a>
          </div>
        </div>

        {/* Mobile: phones can't embed PDFs inline (iOS Safari / most Android),
            so show a clear action card instead of a broken/empty embed box. */}
        <div className="md:hidden mx-4 sm:mx-6 rounded-[24px] border-2 border-neutral-900 bg-white p-7 text-center shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
          <p className="text-neutral-700 font-semibold mb-1">The playbook is a PDF.</p>
          <p className="text-neutral-600 mb-5 text-sm">Open it in a new tab or save it to your phone.</p>
          <div className="flex flex-col gap-3">
            <a
              href={PLAYBOOK_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
            >
              Open the playbook ↗
            </a>
            <a
              href={PLAYBOOK_PDF}
              download
              className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
            >
              Download PDF ↓
            </a>
          </div>
        </div>

        {/* Desktop: full-width inline PDF reader (browsers here embed PDFs reliably) */}
        <div className="hidden md:block border-y-2 border-neutral-900 overflow-hidden bg-white">
          <object
            data={`${PLAYBOOK_PDF}#view=FitH`}
            type="application/pdf"
            className="w-full"
            style={{ height: "calc(100vh - 100px)", minHeight: "700px" }}
          >
            {/* Fallback if a desktop browser still can't embed PDFs */}
            <div className="p-10 text-center">
              <p className="text-neutral-600 mb-4">
                Prefer to read it in a new tab?
              </p>
              <a
                href={PLAYBOOK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900"
              >
                Open the playbook ↗
              </a>
            </div>
          </object>
        </div>

        {/* Soft CTA back to the toolkit */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">
          <div className="rounded-[24px] border-2 border-neutral-900 bg-violet-50 p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h2 className="font-['Clash_Display'] text-2xl font-extrabold text-neutral-900">Ready to put it into action?</h2>
              <p className="text-neutral-600 mt-1">Open the toolkit and start with the tool the playbook points you to.</p>
            </div>
            <a
              href="/toolkit"
              className="inline-flex items-center gap-2 whitespace-nowrap bg-neutral-900 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(124,58,237,1)] transition-all"
            >
              Open the toolkit →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
