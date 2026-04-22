import { useState } from "react";
import { FiDownload, FiCopy, FiLock, FiArrowRight } from "react-icons/fi";
import type { ResumeDoc } from "~/lib/rsb/types";

type Gate = { ok: true } | { ok: false; field: "name" | "email" | "content"; reason: string };

function canExport(doc: ResumeDoc): Gate {
  if (!doc.contact.full_name)
    return { ok: false, field: "name", reason: "Add your full name to export." };
  if (!doc.contact.email)
    return { ok: false, field: "email", reason: "Add a contact email to export." };
  if (doc.experience.length === 0 && doc.projects.length === 0 && doc.education.length === 0)
    return { ok: false, field: "content", reason: "Add at least one experience, project, or education entry." };
  return { ok: true };
}

export function ExportBar({
  doc,
  exporting,
  onExport,
  onCopyPlain,
  onPatchContact,
  lastSaved,
}: {
  doc: ResumeDoc;
  exporting: boolean;
  onExport: () => void;
  onCopyPlain: () => void;
  onPatchContact?: (patch: Partial<ResumeDoc["contact"]>) => void;
  lastSaved?: Date | null;
}) {
  const gate = canExport(doc);
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);

  const handleQuickFix = async () => {
    if (!onPatchContact || !inputVal.trim()) return;
    setSaving(true);
    if (!gate.ok && gate.field === "name") {
      await onPatchContact({ full_name: inputVal.trim() });
    } else if (!gate.ok && gate.field === "email") {
      await onPatchContact({ email: inputVal.trim() });
    }
    setInputVal("");
    setSaving(false);
  };

  const showQuickFix = !gate.ok && (gate.field === "name" || gate.field === "email") && onPatchContact;

  return (
    <div className="font-['Satoshi']">
      {!gate.ok && (
        <div className="mb-2 px-3 py-2 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
          <FiLock className="w-3.5 h-3.5 flex-shrink-0" />
          {gate.reason}
        </div>
      )}

      {showQuickFix && (
        <div className="mb-2 flex gap-2">
          <input
            type={gate.field === "email" ? "email" : "text"}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleQuickFix(); }}
            placeholder={gate.field === "email" ? "your@email.com" : "Your full name"}
            className="flex-1 px-3 py-2 text-sm border-2 border-amber-400 rounded-xl focus:outline-none focus:border-violet-500 bg-white text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            onClick={handleQuickFix}
            disabled={!inputVal.trim() || saving}
            className="px-4 py-2 bg-amber-400 text-neutral-900 font-bold text-sm border-2 border-neutral-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-40 flex items-center gap-1"
          >
            {saving ? "Saving..." : <>Save <FiArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      )}

      <div className="bg-white border-2 border-neutral-900 rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] flex items-center gap-3">
        <button
          disabled={!gate.ok || exporting}
          onClick={onExport}
          title={gate.ok ? undefined : gate.reason}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 text-white font-bold border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
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
        {lastSaved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Auto-saved
          </div>
        )}
      </div>
    </div>
  );
}
