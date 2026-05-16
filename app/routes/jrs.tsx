// JRS — Studojo resume maker. Self-contained tool at /jrs.
// Editor + live preview + 5 templates + native print-to-PDF + ATS match.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MetaFunction } from "react-router";
import {
  type ResumeData,
  type TemplateId,
  TEMPLATES,
  loadResume,
  saveResume,
  loadTemplate,
  saveTemplate,
  starterResume,
  hasSavedResume,
} from "~/lib/jrs/types";
import { ResumeTemplate } from "~/lib/jrs/templates";
import { Editor } from "~/components/jrs/editor";
import { AtsPanel } from "~/components/jrs/ats-panel";
import { WelcomeScreen, TemplatePicker } from "~/components/jrs/start-flow";

type Phase = "welcome" | "template" | "editor";

export const meta: MetaFunction = () => [
  { title: "Resume Maker — Studojo" },
  { name: "description", content: "Build an ATS-ready resume with a live preview, 5 templates, and job-match scoring. Free." },
];

// 210mm A4 width in CSS px at 96dpi.
const PAPER_W = 794;
const PAPER_H = 1123;

const PRINT_CSS = `
@media print {
  body > *:not(.jrs-print-portal) { display: none !important; }
  .jrs-print-portal { display: block !important; }
  html, body { background: #fff !important; margin: 0 !important; }
  @page { size: A4; margin: 0; }
}
@media screen {
  .jrs-print-portal { display: none; }
}
`;

function PreviewPane({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const avail = el.clientWidth - 48;
      setScale(Math.max(0.35, Math.min(1, avail / PAPER_W)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="flex-1 overflow-auto bg-neutral-100 p-6">
      <div
        className="mx-auto"
        style={{ width: PAPER_W * scale, height: PAPER_H * scale }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div
            className="bg-white shadow-[0_2px_24px_rgba(0,0,0,0.18)]"
            style={{ width: PAPER_W }}
          >
            <ResumeTemplate id={templateId} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JrsRoute() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<ResumeData>(() => starterResume());
  const [templateId, setTemplateId] = useState<TemplateId>("modern");
  const [tab, setTab] = useState<"edit" | "ats">("edit");
  const [phase, setPhase] = useState<Phase>("welcome");
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    setData(loadResume());
    setTemplateId(loadTemplate());
    setHasSaved(hasSavedResume());
    setMounted(true);
  }, []);

  const updateData = useCallback((d: ResumeData) => {
    setData(d);
    saveResume(d);
  }, []);

  const updateTemplate = useCallback((id: TemplateId) => {
    setTemplateId(id);
    saveTemplate(id);
  }, []);

  const reset = useCallback(() => {
    if (!confirm("Clear this resume and start from the sample again?")) return;
    const fresh = starterResume();
    setData(fresh);
    saveResume(fresh);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 text-neutral-500 font-['Satoshi']">
        Loading resume maker...
      </div>
    );
  }

  // Phase 1 — welcome / continue.
  if (phase === "welcome") {
    return (
      <WelcomeScreen
        hasSaved={hasSaved}
        onCreate={() => {
          const fresh = starterResume();
          setData(fresh);
          saveResume(fresh);
          setPhase("template");
        }}
        onContinue={() => {
          setTab("edit");
          setPhase("editor");
        }}
      />
    );
  }

  // Phase 2 — Canva-style template gallery.
  if (phase === "template") {
    return (
      <TemplatePicker
        onPick={(id) => {
          updateTemplate(id);
          setTab("edit");
          setPhase("editor");
        }}
        onBack={() => setPhase("welcome")}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white font-['Satoshi']">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-900 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <a href="/" className="font-['Clash_Display'] text-lg font-extrabold text-neutral-900">
            Studojo
          </a>
          <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
            Resume Maker
          </span>
        </div>

        {/* Template switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => updateTemplate(t.id)}
              title={t.blurb}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                templateId === t.id
                  ? "border-neutral-900 bg-violet-500 text-white"
                  : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-900"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPhase("template")}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-neutral-900"
          >
            Templates
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-neutral-900"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border-2 border-neutral-900 bg-amber-300 px-4 py-1.5 text-sm font-bold text-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
          >
            Download PDF
          </button>
        </div>
      </header>

      {/* Body: editor/ats (left) + preview (right) */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-full max-w-[460px] flex-col border-r-2 border-neutral-900">
          {/* Tabs */}
          <div className="flex border-b border-neutral-200">
            {(["edit", "ats"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t
                    ? "border-b-2 border-violet-600 text-violet-700"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {t === "edit" ? "Edit resume" : "ATS / job match"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            {tab === "edit" ? (
              <Editor data={data} onChange={updateData} />
            ) : (
              <AtsPanel data={data} />
            )}
          </div>
        </div>

        <PreviewPane data={data} templateId={templateId} />
      </div>

      {/* Print-only copy — portaled to <body> so print CSS can isolate it. */}
      {createPortal(
        <div className="jrs-print-portal">
          <ResumeTemplate id={templateId} data={data} />
        </div>,
        document.body,
      )}
    </div>
  );
}
