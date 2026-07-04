import { useState } from "react";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

// Every playbook we've published. To add another for a future webinar, just add
// one entry here and drop its PDF into /public — the page handles the rest.
const PLAYBOOKS = [
  {
    id: "career-clarity",
    label: "Playbook 1",
    title: "Career Clarity Playbook",
    description: "The original webinar playbook: turn your toolkit into interviews and internships, step by step.",
    file: "/webinar-playbook.pdf",
  },
  {
    id: "linkedin-optimization",
    label: "Playbook 2",
    title: "LinkedIn Optimization Playbook",
    description: "Build a standout LinkedIn profile end to end: photo, banner, custom URL, and two AI prompts that write the rest.",
    file: "/webinar-2-playbook.pdf",
  },
] as const;

export function meta() {
  return [
    { title: "The Studojo Playbooks | Studojo" },
    { name: "description", content: "The Studojo playbooks — step-by-step guides to using your toolkit to land interviews and internships." },
    { name: "robots", content: "noindex, follow" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/playbook` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "The Studojo Playbooks" },
    { property: "og:description", content: "Step-by-step guides to using your toolkit to land interviews and internships." },
    { property: "og:url", content: `${BASE_URL}/playbook` },
    { property: "og:site_name", content: "Studojo" },
  ];
}

export default function Playbook() {
  const [activeId, setActiveId] = useState<string>(PLAYBOOKS[PLAYBOOKS.length - 1].id);
  const active = PLAYBOOKS.find((p) => p.id === activeId) ?? PLAYBOOKS[0];

  return (
    <div className="min-h-screen bg-neutral-50 font-['Satoshi']">
      <Header />

      <main className="pt-10 pb-16">
        {/* Heading */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border-2 border-neutral-900 mb-5">
            The Playbooks
          </span>
          <h1 className="font-['Clash_Display'] text-4xl sm:text-5xl font-extrabold text-neutral-900 leading-tight">
            Read the playbooks.
          </h1>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl">
            Your step-by-step guides to using the toolkit and turning each webinar into actual interviews. Pick a playbook below, read it right here, or download it to keep.
          </p>
        </div>

        {/* Playbook selector */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
          <div className="flex flex-wrap gap-3">
            {PLAYBOOKS.map((p) => {
              const isActive = p.id === activeId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`text-left rounded-2xl border-2 border-neutral-900 px-5 py-4 transition-all ${
                    isActive
                      ? "bg-violet-500 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                      : "bg-white text-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] hover:shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:-translate-y-[1px]"
                  }`}
                >
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isActive ? "text-violet-100" : "text-violet-600"}`}>
                    {p.label}
                  </span>
                  <span className="block font-['Clash_Display'] font-extrabold text-lg mt-0.5">{p.title}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-neutral-600 max-w-2xl">{active.description}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={active.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
            >
              Open full screen ↗
            </a>
            <a
              href={active.file}
              download
              className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
            >
              Download PDF ↓
            </a>
          </div>
        </div>

        {/* Mobile: phones can't embed PDFs inline, so show an action card. */}
        <div className="md:hidden mx-4 sm:mx-6 rounded-[24px] border-2 border-neutral-900 bg-white p-7 text-center shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
          <p className="text-neutral-700 font-semibold mb-1">{active.title} is a PDF.</p>
          <p className="text-neutral-600 mb-5 text-sm">Open it in a new tab or save it to your phone.</p>
          <div className="flex flex-col gap-3">
            <a
              href={active.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
            >
              Open the playbook ↗
            </a>
            <a
              href={active.file}
              download
              className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 font-bold px-6 py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
            >
              Download PDF ↓
            </a>
          </div>
        </div>

        {/* Desktop: full-width inline PDF reader */}
        <div className="hidden md:block border-y-2 border-neutral-900 overflow-hidden bg-white">
          <object
            key={active.file}
            data={`${active.file}#view=FitH`}
            type="application/pdf"
            className="w-full"
            style={{ height: "calc(100vh - 100px)", minHeight: "700px" }}
          >
            <div className="p-10 text-center">
              <p className="text-neutral-600 mb-4">Prefer to read it in a new tab?</p>
              <a
                href={active.file}
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
