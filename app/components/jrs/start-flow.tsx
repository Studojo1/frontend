// JRS start flow — welcome screen + Canva-style template gallery.
// Shown before the editor so users choose a look first instead of being
// dropped into a form.
import { useRef, useState } from "react";
import {
  FiArrowRight,
  FiArrowLeft,
  FiUploadCloud,
  FiFileText,
  FiZap,
  FiClock,
} from "react-icons/fi";
import { type ResumeData, type TemplateId, TEMPLATES, starterResume } from "~/lib/jrs/types";
import { ResumeTemplate } from "~/lib/jrs/templates";
import { Footer } from "~/components/common/footer";
import { ImportingModal } from "~/components/jrs/importing-modal";

const PAPER_W = 794;
const PAPER_H = 1123;

// ─── Welcome ────────────────────────────────────────────────────────────────
export function WelcomeScreen({
  hasSaved,
  savedData,
  savedTemplate,
  onCreate,
  onContinue,
  onImported,
}: {
  hasSaved: boolean;
  savedData?: ResumeData;
  savedTemplate?: TemplateId;
  onCreate: () => void;
  onContinue: () => void;
  onImported: (data: ResumeData) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importFileName, setImportFileName] = useState<string>("");
  const [importError, setImportError] = useState("");

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setImporting(true);
    setImportError("");
    setImportFileName(fileList.length === 1 ? fileList[0].name : `${fileList.length} files`);
    try {
      const fd = new FormData();
      Array.from(fileList).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/jrs/import", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.data) {
        setImporting(false);
        onImported(json.data as ResumeData);
      } else {
        setImporting(false);
        setImportError(json.error || "We couldn't read that file. Try a clearer PDF or screenshot.");
      }
    } catch {
      setImporting(false);
      setImportError("Upload failed. Check your connection and try again.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const triggerUpload = () => fileRef.current?.click();

  const firstName = (savedData?.basics.name || "").split(/\s+/)[0];

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col bg-gradient-to-br from-violet-50 via-white to-amber-50 font-['Satoshi']">
      <ImportingModal
        open={importing}
        fileName={importFileName}
        error={importError}
        onDismiss={() => setImportError("")}
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-5 py-10 text-center sm:py-14">
        <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border-2 border-neutral-900 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-700">
          <FiZap className="h-3.5 w-3.5 text-violet-600" /> Resume Maker
        </span>

        {hasSaved ? (
          <>
            <h1 className="mt-5 font-['Clash_Display'] text-4xl leading-[1.05] text-neutral-900 sm:text-5xl">
              Welcome back{firstName ? `, ${firstName}` : ""}.
            </h1>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] text-neutral-600">
              Pick up where you left off, switch templates, or start something new.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-5 font-['Clash_Display'] text-4xl leading-[1.05] text-neutral-900 sm:text-5xl">
              Build a resume that
              <br />
              actually gets callbacks.
            </h1>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] text-neutral-600">
              Pick a template, fill it with a live preview beside you, and download a clean PDF.
              Most students finish in under 10 minutes.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCreate}
                className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-violet-500 px-6 py-3 text-base font-bold text-white shadow-[5px_5px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
              >
                Create my resume
                <FiArrowRight />
              </button>
              <button
                type="button"
                onClick={triggerUpload}
                className="flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-5 py-3 text-sm font-bold text-neutral-800 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
              >
                <FiUploadCloud className="h-4 w-4 text-violet-600" />
                Import a PDF or LinkedIn
              </button>
            </div>

            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-bold text-neutral-700">
              <li className="flex items-center gap-1.5">
                <FiFileText className="h-3.5 w-3.5 text-violet-600" /> {TEMPLATES.length} templates
              </li>
              <li className="flex items-center gap-1.5">
                <FiZap className="h-3.5 w-3.5 text-violet-600" /> AI coach + Auto-format
              </li>
              <li className="flex items-center gap-1.5">
                <FiClock className="h-3.5 w-3.5 text-violet-600" /> Free, instant PDF
              </li>
            </ul>
          </>
        )}

        {/* Saved resume card — Canva-style "your design". Left-aligned even
            though the hero above is centered. */}
        {hasSaved && savedData && savedTemplate && (
          <div className="mt-10 w-full text-left">
            <p className="mb-2 ml-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Your resume
            </p>
            <div className="flex flex-col gap-5 rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] sm:flex-row sm:items-stretch">
              <SavedThumb data={savedData} templateId={savedTemplate} />
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="truncate font-['Clash_Display'] text-2xl text-neutral-900">
                  {savedData.basics.name?.trim() || "Untitled resume"}
                </h2>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {TEMPLATES.find((t) => t.id === savedTemplate)?.name ?? "Modern"} template ·{" "}
                  {savedData.experience.filter((e) => e.company || e.role).length} roles ·{" "}
                  {savedData.projects.filter((p) => p.name).length} projects
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <button
                    type="button"
                    onClick={onContinue}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-neutral-900 bg-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
                  >
                    Continue editing <FiArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={onCreate}
                    className="rounded-xl border-2 border-neutral-900 bg-white px-5 py-2.5 text-sm font-bold text-neutral-800 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
                  >
                    Start a new one
                  </button>
                  <button
                    type="button"
                    onClick={triggerUpload}
                    className="rounded-xl border-2 border-neutral-900 bg-white px-5 py-2.5 text-sm font-bold text-neutral-700 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
                  >
                    Import another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}


// ─── Saved-resume thumbnail (left of the saved card) ─────────────────────────
function SavedThumb({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  const thumbW = 170;
  const scale = thumbW / PAPER_W;
  return (
    <div
      className="flex-shrink-0 overflow-hidden rounded-lg border-2 border-neutral-900 bg-white"
      style={{ width: thumbW, height: PAPER_H * scale }}
      aria-hidden="true"
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAPER_W }}>
        <ResumeTemplate id={templateId} data={data} />
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
    <div className="flex min-h-[calc(100vh-6rem)] flex-col bg-neutral-100 font-['Satoshi']">
      <div className="mx-auto w-full max-w-[var(--section-max-width,1200px)] flex-1 px-5 py-10 sm:px-8">
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

      <Footer />
    </div>
  );
}
