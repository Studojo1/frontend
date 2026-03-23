import { useState } from "react";
import { FiEdit2, FiCheck } from "react-icons/fi";
import type { EmailTemplate } from "~/lib/outreach/types";

interface TemplateEditorProps {
  template: EmailTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (subject: string, body: string) => void;
}

export function TemplateEditor({ template, isSelected, onSelect, onUpdate }: TemplateEditorProps) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);

  const handleSave = () => {
    onUpdate(subject, body);
    setEditing(false);
  };

  return (
    <div
      className={`border-2 rounded-2xl p-6 transition-all duration-200 cursor-pointer
        ${isSelected ? "border-studojo-purple bg-studojo-purple-bg/50 shadow-brutal" : "border-studojo-ink/20 hover:border-studojo-ink hover:shadow-brutal"}`}
      onClick={() => !editing && onSelect()}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-clash text-lg font-bold text-studojo-ink">{template.name}</h4>
        <div className="flex gap-2">
          {isSelected && !editing && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="text-studojo-muted hover:text-studojo-purple transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}
          {isSelected && <FiCheck className="w-5 h-5 text-studojo-purple" />}
        </div>
      </div>

      {editing ? (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div>
            <label className="text-xs font-bold text-studojo-muted uppercase font-satoshi block mb-1">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border-2 border-studojo-ink/20 rounded-xl text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-studojo-muted uppercase font-satoshi block mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border-2 border-studojo-ink/20 rounded-xl text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="h-9 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="h-9 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-medium border-2 border-studojo-ink/20 transition-all hover:bg-studojo-surface-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-studojo-muted font-bold font-satoshi">Subject: {subject}</p>
          <p className="text-sm text-studojo-muted font-satoshi mt-2 line-clamp-3">{body}</p>
        </div>
      )}

      {isSelected && (
        <div className="flex gap-1 mt-4 flex-wrap">
          {["{name}", "{company}", "{title}"].map((v) => (
            <span key={v} className="px-2 py-1 bg-studojo-purple/10 text-studojo-purple rounded text-xs font-bold uppercase font-satoshi">
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}