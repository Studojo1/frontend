// JRS start flow — welcome screen + Canva-style template gallery.
// Shown before the editor so users choose a look first instead of being
// dropped into a form.
import { useRef, useState } from "react";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiZap,
  FiClock,
  FiFileText,
  FiUploadCloud,
} from "react-icons/fi";
import { type ResumeData, type TemplateId, TEMPLATES, starterResume } from "~/lib/jrs/types";
import { ResumeTemplate } from "~/lib/jrs/templates";

const PAPER_W = 794;
const PAPER_H = 1123;

// ─── Welcome ────────────────────────────────────────────────────────────────
export function WelcomeScreen({
  hasSaved,
  onCreate,
  onContinue,
  onImported,
}: {
  hasSaved: boolean;
  onCreate: () => void;
  onContinue: () => void;
  onImported: (data: ResumeData) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setImporting(true);
    setImportError("");
    try {
      const fd = new FormData();
      Array.from(fileList).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/jrs/import", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.data) {
        onImported(json.data as ResumeData);
      } else {
        setImportError(json.error || "Couldn't import that file. Try another.");
      }
    } catch {
      setImportError("Upload failed. Check your connection and try again.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 font-['Satoshi']">
      <div className="mx-auto flex max-w-[760px] flex-col items-center px-5 pb-16 pt-10 text-center sm:pt-16">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border-2 border-neutral-900 bg-white px-3 py-1 text-xs font-bold text-neutral-700">
          <FiZap className="h-3.5 w-3.5 text-violet-600" /> Free · ATS-ready · no sign-up
        </span>

        <h1 className="font-['Clash_Display'] text-4xl leading-[1.1] text-neutral-900 sm:text-5xl">
          Build a resume that
          <br />
          actually gets callbacks.
        </h1>
        <p className="mt-4 max-w-[520px] text-[15px] text-neutral-600">
          Pick a template, fill in your details with a live preview beside you, and download a
          clean PDF. Most students finish in under 10 minutes.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-500 px-7 py-3.5 text-base font-bold text-white shadow-[5px_5px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
          >
            {hasSaved ? "Start a new resume" : "Create my resume"}
            <FiArrowRight />
          </button>
          {hasSaved && (
            <button
              type="button"
              onClick={onContinue}
              className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-7 py-3.5 text-base font-bold text-neutral-800 shadow-[5px_5px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
            >
              Continue where you left off
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-neutral-400 bg-white px-5 py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
          >
            <FiUploadCloud className="h-4 w-4 text-violet-600" />
            {importing ? "Reading your resume..." : "Import a resume or LinkedIn screenshots"}
          </button>
          <p className="text-xs text-neutral-400">
            PDF resume or LinkedIn profile screenshots, we'll fill it in for you.
          </p>
          {importError && (
            <p className="text-xs font-semibold text-rose-600">{importError}</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div className="mt-12 grid w-full max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: FiFileText, label: "5 clean templates" },
            { icon: FiCheck, label: "ATS & job-match check" },
            { icon: FiClock, label: "Live preview, instant PDF" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-3 py-3 text-left"
            >
              <f.icon className="h-4 w-4 flex-shrink-0 text-violet-600" />
              <span className="text-xs font-bold text-neutral-700">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template thumbnail (live mini-render of the real template) ─────────────
function TemplateThumb({ id, data }: { id: TemplateId; data: ResumeData }) {
  const thumbW = 250;
  const scale = thumbW / PAPER_W;
  return (
    <div
      className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
      style={{ width: thumbW, height: PAPER_H * scale }}
      aria-hidden="true"
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAPER_W }}>
        <ResumeTemplate id={id} data={data} />
      </div>
    </div>
  );
}

// ─── Template gallery ───────────────────────────────────────────────────────
export function TemplatePicker({
  onPick,
  onBack,
}: {
  onPick: (id: TemplateId) => void;
  onBack: () => void;
}) {
  // One sample resume reused across every thumbnail.
  const sample = starterResume();

  return (
    <div className="min-h-screen bg-neutral-100 font-['Satoshi']">
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_0px_rgba(25,26,35,1)]"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <span className="rounded-md border-2 border-neutral-900 bg-violet-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-800">
            Resume Maker
          </span>
        </div>
        <h1 className="font-['Clash_Display'] text-3xl text-neutral-900">Pick a template</h1>
        <p className="mt-1.5 text-[15px] text-neutral-600">
          Click any template to start editing. You can switch anytime, your content carries over.
        </p>

        <div className="mt-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              className="group flex w-[284px] flex-col items-center rounded-2xl border-2 border-neutral-900 bg-white p-4 text-left shadow-[5px_5px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(124,58,237,1)]"
            >
              <TemplateThumb id={t.id} data={sample} />
              <div className="mt-3 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-['Clash_Display'] text-lg text-neutral-900">{t.name}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-violet-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Use this <FiArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{t.blurb}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
