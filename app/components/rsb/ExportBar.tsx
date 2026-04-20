import { FiDownload, FiCopy, FiLock } from "react-icons/fi";
import type { Ats, ResumeDoc } from "~/lib/rsb/types";

function canExport(doc: ResumeDoc, ats: Ats): { ok: boolean; reason?: string } {
  if (!doc.contact.full_name) return { ok: false, reason: "Add your full name first." };
  if (!doc.contact.email) return { ok: false, reason: "Add a contact email." };
  if (doc.experience.length === 0 && doc.projects.length === 0)
    return { ok: false, reason: "Add at least one experience or project." };
  if ((ats?.score ?? 0) < 40) return { ok: false, reason: "Keep going — ATS score needs to reach 40 to export." };
  return { ok: true };
}

export function ExportBar({
  doc,
  ats,
  exporting,
  onExport,
  onCopyPlain,
  lastSaved,
}: {
  doc: ResumeDoc;
  ats: Ats;
  exporting: boolean;
  onExport: () => void;
  onCopyPlain: () => void;
  lastSaved?: Date | null;
}) {
  const gate = canExport(doc, ats);

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] font-['Satoshi'] overflow-hidden">
      {/* Gate notice */}
      {!gate.ok && (
        <div className="flex items-center gap-2 bg-amber-50 border-b-2 border-neutral-900 px-4 py-2">
          <FiLock className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
          <span className="text-xs text-amber-800">{gate.reason}</span>
        </div>
      )}

      {/* Buttons row */}
      <div className="flex items-center gap-3 p-3">
        <button
          disabled={!gate.ok || exporting}
          onClick={onExport}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 text-white font-bold border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
        >
          <FiDownload className="w-4 h-4" />
          {exporting ? "Rendering PDF…" : "Export PDF"}
        </button>
        <button
          onClick={onCopyPlain}
          className="inline-flex items-center gap-2 px-4 py-3 bg-white text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all"
        >
          <FiCopy className="w-4 h-4" />
          Plain text
        </button>
        {lastSaved && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
