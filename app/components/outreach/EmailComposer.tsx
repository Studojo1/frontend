import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiSend,
  FiZap,
  FiCheck,
  FiEye,
  FiEdit2,
  FiRefreshCw,
  FiCopy,
  FiUser,
  FiLink,
  FiStar,
  FiCalendar,
  FiFileText,
  FiMessageCircle,
  FiTarget,
} from "react-icons/fi";
import type { EmailTemplate } from "~/lib/outreach/types";

// ── Types ────────────────────────────────────────────────────────────

interface ContentBlock {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  template: string;
  category: "structure" | "personal" | "cta";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  updatedEmail?: { subject: string; body: string };
  error?: boolean;
}

interface EmailComposerProps {
  templates: EmailTemplate[];
  initialTemplate: EmailTemplate | null;
  candidateContext?: string;
  onTemplateChange: (t: EmailTemplate) => void;
  onContinue: (subject: string, body: string, templateId: number | null) => void;
}

// ── Draggable content blocks ──────────────────────────────────────────

const CONTENT_BLOCKS: ContentBlock[] = [
  {
    id: "signature",
    label: "Signature",
    description: "Name, title & contact",
    icon: <FiUser className="w-3.5 h-3.5" />,
    template:
      "\n\nBest regards,\n[Your Name]\n[Your Title]\n[Email] | [LinkedIn]",
    category: "structure",
  },
  {
    id: "target_role",
    label: "Target Role",
    description: "Role you're seeking",
    icon: <FiTarget className="w-3.5 h-3.5" />,
    template:
      "\n\nI'm particularly interested in [Target Role] opportunities where I can contribute my background in [Key Area].",
    category: "personal",
  },
  {
    id: "skills",
    label: "Key Skills",
    description: "Highlight your skills",
    icon: <FiZap className="w-3.5 h-3.5" />,
    template: "\n\nKey skills: [Skill 1], [Skill 2], [Skill 3].",
    category: "personal",
  },
  {
    id: "achievement",
    label: "Achievement",
    description: "Notable win",
    icon: <FiStar className="w-3.5 h-3.5" />,
    template: "\n\nMost recently, [specific achievement with measurable result].",
    category: "personal",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Your profile link",
    icon: <FiLink className="w-3.5 h-3.5" />,
    template: " LinkedIn: [Your LinkedIn URL]",
    category: "personal",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Work samples",
    icon: <FiFileText className="w-3.5 h-3.5" />,
    template: " Portfolio: [Your Portfolio URL]",
    category: "personal",
  },
  {
    id: "availability",
    label: "Availability",
    description: "When you can start",
    icon: <FiCalendar className="w-3.5 h-3.5" />,
    template:
      "\n\nI'm available to start [immediately / from Date] and am flexible on [remote / hybrid / on-site] arrangements.",
    category: "cta",
  },
  {
    id: "cta",
    label: "Call to Action",
    description: "Ask for next step",
    icon: <FiMessageCircle className="w-3.5 h-3.5" />,
    template:
      "\n\nWould you be open to a 15-minute call this week to explore if there's a fit?",
    category: "cta",
  },
];

// ── Variable highlight helper ─────────────────────────────────────────

function renderBodyWithHighlights(text: string) {
  const parts = text.split(/(\{[^}]+\}|\[[^\]]+\])/g);
  return parts.map((part, i) => {
    if (/^\{[^}]+\}$/.test(part) || /^\[[^\]]+\]$/.test(part)) {
      return (
        <mark
          key={i}
          className="bg-studojo-purple/15 text-studojo-purple rounded px-0.5 not-italic"
        >
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ── Main component ────────────────────────────────────────────────────

export function EmailComposer({
  templates,
  initialTemplate,
  candidateContext,
  onTemplateChange,
  onContinue,
}: EmailComposerProps) {
  // Editor state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    initialTemplate?.id ?? null,
  );
  const [subject, setSubject] = useState(initialTemplate?.subject ?? "");
  const [body, setBody] = useState(initialTemplate?.body ?? "");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // Left panel
  const [leftSection, setLeftSection] = useState<"templates" | "blocks">("templates");

  // AI chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Sync when template changes externally
  useEffect(() => {
    if (initialTemplate) {
      setSubject(initialTemplate.subject);
      setBody(initialTemplate.body);
      setSelectedTemplateId(initialTemplate.id);
    }
  }, [initialTemplate?.id]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // ── Template selection ──────────────────────────────────────────────

  const handleSelectTemplate = (t: EmailTemplate) => {
    setSelectedTemplateId(t.id);
    setSubject(t.subject);
    setBody(t.body);
    onTemplateChange(t);
    setChatHistory([]);
    setPendingUpdate(null);
  };

  // ── Drag-and-drop blocks ────────────────────────────────────────────

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = bodyRef.current;
      if (!textarea) {
        setBody((prev) => prev + text);
        return;
      }
      const start = textarea.selectionStart ?? body.length;
      const end = textarea.selectionEnd ?? body.length;
      const newValue = body.substring(0, start) + text + body.substring(end);
      setBody(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    },
    [body],
  );

  const handleDragStart = (e: React.DragEvent, block: ContentBlock) => {
    e.dataTransfer.setData("text/plain", block.template);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text) insertAtCursor(text);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // ── AI chat ─────────────────────────────────────────────────────────

  const sendChatMessage = async () => {
    const prompt = chatInput.trim();
    if (!prompt || chatLoading) return;

    setChatInput("");
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: prompt },
    ]);
    setChatLoading(true);
    setPendingUpdate(null);

    try {
      const res = await fetch("/api/outreach/email-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          subject,
          body,
          candidate_context: candidateContext,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
            error: true,
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.explanation,
            updatedEmail: { subject: data.subject, body: data.body },
          },
        ]);
        setPendingUpdate({ subject: data.subject, body: data.body });
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please check your connection.",
          error: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const applyUpdate = (update: { subject: string; body: string }) => {
    setSubject(update.subject);
    setBody(update.body);
    setPendingUpdate(null);
  };

  // ── Copy to clipboard ───────────────────────────────────────────────

  const copyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
  };

  // ── Render ───────────────────────────────────────────────────────────

  const blocksByCategory = {
    structure: CONTENT_BLOCKS.filter((b) => b.category === "structure"),
    personal: CONTENT_BLOCKS.filter((b) => b.category === "personal"),
    cta: CONTENT_BLOCKS.filter((b) => b.category === "cta"),
  };

  return (
    <div className="flex flex-1 min-h-0 h-full bg-white">
      {/* ── LEFT PANEL: Template Library + Blocks ── */}
      <div className="w-52 flex-shrink-0 border-r-2 border-studojo-ink/10 flex flex-col overflow-hidden bg-studojo-surface-muted/30">
        {/* Panel toggle */}
        <div className="flex border-b-2 border-studojo-ink/10">
          <button
            onClick={() => setLeftSection("templates")}
            className={`flex-1 py-2.5 text-xs font-bold font-satoshi transition-colors ${
              leftSection === "templates"
                ? "text-studojo-purple border-b-2 border-studojo-purple -mb-0.5 bg-white"
                : "text-studojo-muted hover:text-studojo-ink"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setLeftSection("blocks")}
            className={`flex-1 py-2.5 text-xs font-bold font-satoshi transition-colors ${
              leftSection === "blocks"
                ? "text-studojo-purple border-b-2 border-studojo-purple -mb-0.5 bg-white"
                : "text-studojo-muted hover:text-studojo-ink"
            }`}
          >
            Blocks
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {leftSection === "templates" ? (
            <>
              <p className="text-[10px] text-studojo-muted font-satoshi uppercase font-bold px-1 pt-1 pb-0.5">
                Click to load
              </p>
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 border-2 transition-all ${
                    selectedTemplateId === t.id
                      ? "border-studojo-purple bg-white shadow-sm"
                      : "border-transparent hover:border-studojo-ink/20 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-bold font-satoshi text-studojo-ink leading-tight">
                      {t.name}
                    </p>
                    {selectedTemplateId === t.id && (
                      <FiCheck className="w-3 h-3 text-studojo-purple flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-[10px] text-studojo-muted font-satoshi mt-0.5 line-clamp-2 leading-tight">
                    {t.subject}
                  </p>
                </button>
              ))}
              {templates.length === 0 && (
                <p className="text-xs text-studojo-muted font-satoshi text-center py-4">
                  No templates yet
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[10px] text-studojo-muted font-satoshi uppercase font-bold px-1 pt-1 pb-0.5">
                Drag into email
              </p>

              {(["structure", "personal", "cta"] as const).map((cat) => (
                <div key={cat}>
                  <p className="text-[9px] text-studojo-muted/60 font-satoshi uppercase font-bold px-1 pt-2 pb-1">
                    {cat === "structure" ? "Structure" : cat === "personal" ? "Personal" : "Call to Action"}
                  </p>
                  {blocksByCategory[cat].map((block) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, block)}
                      onClick={() => insertAtCursor(block.template)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 border-2 border-dashed border-studojo-ink/15 cursor-grab active:cursor-grabbing hover:border-studojo-purple/40 hover:bg-studojo-purple-bg/30 transition-all select-none"
                      title={`Drag or click to insert: ${block.description}`}
                    >
                      <span className="text-studojo-purple flex-shrink-0">
                        {block.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold font-satoshi text-studojo-ink leading-tight truncate">
                          {block.label}
                        </p>
                        <p className="text-[9px] text-studojo-muted font-satoshi leading-tight truncate">
                          {block.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── CENTER PANEL: Email Editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-studojo-ink/10 bg-white flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-satoshi transition-colors ${
                viewMode === "edit"
                  ? "bg-studojo-ink text-white"
                  : "text-studojo-muted hover:text-studojo-ink hover:bg-studojo-surface-muted"
              }`}
            >
              <FiEdit2 className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-satoshi transition-colors ${
                viewMode === "preview"
                  ? "bg-studojo-ink text-white"
                  : "text-studojo-muted hover:text-studojo-ink hover:bg-studojo-surface-muted"
              }`}
            >
              <FiEye className="w-3 h-3" /> Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-satoshi text-studojo-muted hover:text-studojo-ink hover:bg-studojo-surface-muted transition-colors"
              title="Copy email to clipboard"
            >
              <FiCopy className="w-3 h-3" /> Copy
            </button>
            <button
              onClick={() => onContinue(subject, body, selectedTemplateId)}
              disabled={!subject && !body}
              className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-studojo-purple text-white text-xs font-bold font-satoshi border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-40 disabled:pointer-events-none"
            >
              Continue →
            </button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {viewMode === "edit" ? (
            <>
              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold text-studojo-muted font-satoshi uppercase block mb-1">
                  Subject line
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your email subject..."
                  className="w-full h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi font-medium focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple text-studojo-ink"
                />
              </div>

              {/* Body */}
              <div className="flex-1">
                <label className="text-[10px] font-bold text-studojo-muted font-satoshi uppercase block mb-1">
                  Email body
                  <span className="ml-2 normal-case font-normal text-studojo-muted/60">
                    — drag blocks from the left panel
                  </span>
                </label>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  placeholder="Write your email here, or pick a template from the left panel and refine it with the AI assistant →"
                  rows={18}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple resize-none text-studojo-ink leading-relaxed"
                />
              </div>

              {/* Variable chips */}
              <div>
                <p className="text-[10px] font-bold text-studojo-muted font-satoshi uppercase mb-1.5">
                  Auto-filled variables
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["{name}", "{company}", "{title}"].map((v) => (
                    <button
                      key={v}
                      onClick={() => insertAtCursor(v)}
                      className="px-2 py-0.5 bg-studojo-purple/10 text-studojo-purple rounded text-xs font-bold font-satoshi hover:bg-studojo-purple/20 transition-colors"
                      title={`Insert ${v}`}
                    >
                      {v}
                    </button>
                  ))}
                  <span className="text-[10px] text-studojo-muted/60 font-satoshi self-center ml-1">
                    Click to insert at cursor
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Preview mode */
            <div className="max-w-xl mx-auto">
              <div className="rounded-2xl border-2 border-studojo-ink/15 bg-white shadow-sm overflow-hidden">
                <div className="bg-studojo-surface-muted px-5 py-3 border-b-2 border-studojo-ink/10">
                  <p className="text-xs text-studojo-muted font-satoshi">
                    <span className="font-bold text-studojo-ink">To:</span> {"{name}"} at {"{company}"}
                  </p>
                  <p className="text-sm font-bold font-satoshi text-studojo-ink mt-1">
                    {renderBodyWithHighlights(subject || "(no subject)")}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm font-satoshi text-studojo-ink leading-relaxed whitespace-pre-line">
                    {renderBodyWithHighlights(body || "(empty)")}
                  </p>
                </div>
              </div>
              <p className="text-xs text-studojo-muted font-satoshi text-center mt-3">
                Highlighted text = auto-filled per lead
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: AI Chat ── */}
      <div className="w-80 flex-shrink-0 border-l-2 border-studojo-ink/10 flex flex-col overflow-hidden bg-white">
        {/* Chat header */}
        <div className="px-4 py-3 border-b-2 border-studojo-ink/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-studojo-purple flex items-center justify-center">
              <FiZap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold font-satoshi text-studojo-ink">AI Assistant</p>
              <p className="text-[10px] text-studojo-muted font-satoshi">
                Ask me to refine your email
              </p>
            </div>
          </div>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {chatHistory.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-xs text-studojo-muted font-satoshi mb-4">
                I can rewrite, shorten, adjust tone, add specifics, or anything else.
              </p>
              <div className="space-y-1.5">
                {[
                  "Make it shorter and punchier",
                  "Add a stronger opening hook",
                  "Make the tone more casual",
                  "Add a specific ask at the end",
                  "Make it more personalized",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setChatInput(suggestion);
                      chatInputRef.current?.focus();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-xl bg-studojo-surface-muted text-xs font-satoshi text-studojo-ink hover:bg-studojo-purple-bg/50 hover:text-studojo-purple transition-colors border border-studojo-ink/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-studojo-purple text-white"
                    : msg.error
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-studojo-surface-muted text-studojo-ink"
                }`}
              >
                <p className="text-xs font-satoshi leading-relaxed">{msg.content}</p>

                {msg.updatedEmail && (
                  <div className="mt-2 pt-2 border-t border-studojo-ink/10 space-y-1.5">
                    <div className="bg-white rounded-lg px-2 py-1.5 border border-studojo-ink/10">
                      <p className="text-[10px] text-studojo-muted font-satoshi font-bold uppercase mb-0.5">
                        Preview
                      </p>
                      <p className="text-[10px] font-bold font-satoshi text-studojo-ink">
                        {msg.updatedEmail.subject}
                      </p>
                      <p className="text-[10px] font-satoshi text-studojo-muted mt-0.5 line-clamp-3 leading-tight">
                        {msg.updatedEmail.body}
                      </p>
                    </div>
                    <button
                      onClick={() => applyUpdate(msg.updatedEmail!)}
                      className="w-full flex items-center justify-center gap-1 h-7 rounded-lg bg-studojo-purple text-white text-[10px] font-bold font-satoshi transition-all hover:opacity-90"
                    >
                      <FiCheck className="w-3 h-3" />
                      Apply to editor
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-studojo-surface-muted rounded-2xl px-3 py-2">
                <div className="flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-studojo-muted animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-studojo-muted animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-studojo-muted animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Pending update banner */}
        {pendingUpdate && (
          <div className="px-3 pb-1 flex-shrink-0">
            <div className="flex items-center gap-2 bg-studojo-purple-bg rounded-xl px-3 py-2 border border-studojo-purple/30">
              <FiRefreshCw className="w-3.5 h-3.5 text-studojo-purple flex-shrink-0" />
              <p className="text-xs font-satoshi text-studojo-purple flex-1 min-w-0">
                Updated version ready
              </p>
              <button
                onClick={() => applyUpdate(pendingUpdate)}
                className="text-xs font-bold font-satoshi text-studojo-purple hover:underline flex-shrink-0"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Chat input */}
        <div className="p-3 border-t-2 border-studojo-ink/10 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
              placeholder="e.g. make it shorter..."
              disabled={chatLoading}
              className="flex-1 h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-xs font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple disabled:opacity-50 text-studojo-ink"
            />
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 rounded-xl bg-studojo-purple text-white flex items-center justify-center border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
            >
              <FiSend className="w-3.5 h-3.5" />
            </button>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={() => {
                setChatHistory([]);
                setPendingUpdate(null);
              }}
              className="mt-1.5 text-[10px] text-studojo-muted/60 font-satoshi hover:text-studojo-muted transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
