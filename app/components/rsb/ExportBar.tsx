import { FiDownload, FiCopy } from "react-icons/fi";
import type { Ats, ResumeDoc } from "~/lib/rsb/types";

function canExport(doc: ResumeDoc, ats: Ats): { ok: boolean; reason?: string } {
  if (!doc.contact.full_name) return { ok: false, reason: "Add your full name first." };
  if (!doc.contact.email) return { ok: false, reason: "Add a contact email." };
  if (doc.experience.length === 0 && doc.projects.length === 0)
    return { ok: false, reason: "Add at least one experience or project." };
  if ((ats?.score ?? 0) < 40) return { ok: false, reason: "Keep going. Fill a bit more before exporting." };
  return { ok: true };
}

export function ExportBar({
  doc,
  ats,
  exporting,
  onExport,
  onCopyPlain,
}: {
  doc: ResumeDoc;
  ats: Ats;
  exporting: boolean;
  onExport: () => void;
  onCopyPlain: () => void;
}) {
  const gate = canExport(doc, ats);
  return (
    <div className="bg-white border-2 border-neutral-900 rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] flex items-center gap-3 font-['Satoshi']">
      <button
        disabled={!gate.ok || exporting}
        onClick={onExport}
        title={gate.reason}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
      >
        <FiDownload className="w-4 h-4" />
        {exporting ? "Rendering PDF..." : "Export PDF"}
      </button>
      <button
        onClick={onCopyPlain}
        className="inline-flex items-center gap-2 px-4 py-3 bg-white text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all"
      >
        <FiCopy className="w-4 h-4" />
        Plain text
      </button>
      {!gate.ok && <span className="text-xs text-neutral-600">{gate.reason}</span>}
    </div>
  );
}
