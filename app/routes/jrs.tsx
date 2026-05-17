// JRS — Studojo resume maker. Self-contained tool at /jrs.
// Editor + live preview + 5 templates + native print-to-PDF + ATS match.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MetaFunction } from "react-router";
import {
  type ResumeData,
  type TemplateId,
  type Density,
  type JrsChatMsg,
  TEMPLATES,
  DENSITIES,
  densityFactor,
  loadResume,
  saveResume,
  loadTemplate,
  saveTemplate,
  loadDensity,
  saveDensity,
  loadChat,
  saveChat,
  clearChat,
  starterResume,
  hasSavedResume,
} from "~/lib/jrs/types";
import { ResumeTemplate } from "~/lib/jrs/templates";
import { Editor } from "~/components/jrs/editor";
import { AtsPanel } from "~/components/jrs/ats-panel";
import { WelcomeScreen, TemplatePicker } from "~/components/jrs/start-flow";
import { ChatPanel } from "~/components/rsb/ChatPanel";
import type { ChatMsg as RsbChatMsg } from "~/lib/rsb/types";

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

function PreviewPane({
  data,
  templateId,
  density,
}: {
  data: ResumeData;
  templateId: TemplateId;
  density: number;
}) {
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
            {/* Density: render wider, then zoom back to page width so text
                and spacing scale together while the page stays A4-wide. */}
            <div style={{ width: PAPER_W / density, zoom: density }}>
              <ResumeTemplate id={templateId} data={data} />
            </div>
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
  const [tab, setTab] = useState<"edit" | "chat" | "ats">("edit");
  const [phase, setPhase] = useState<Phase>("welcome");
  const [hasSaved, setHasSaved] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [density, setDensity] = useState<Density>("normal");
  const [messages, setMessages] = useState<JrsChatMsg[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setData(loadResume());
    setTemplateId(loadTemplate());
    setDensity(loadDensity());
    setHasSaved(hasSavedResume());
    setMessages(loadChat());
    setMounted(true);
  }, []);

  const sendChat = useCallback(
    async (text: string) => {
      if (sending || !text.trim()) return;
      const userMsg: JrsChatMsg = {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: "user",
        content: text.trim(),
      };
      const next = [...messages, userMsg];
      setMessages(next);
      saveChat(next);
      setSending(true);
      try {
        const res = await fetch("/api/jrs/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map((m) => ({ role: m.role, content: m.content })),
            data,
          }),
        });
        const json = await res.json();
        if (res.ok && json.reply) {
          const botMsg: JrsChatMsg = {
            id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            role: "assistant",
            content: json.reply,
          };
          const after = [...next, botMsg];
          setMessages(after);
          saveChat(after);
          if (json.data) {
            setData(json.data);
            saveResume(json.data);
          }
        } else {
          const errMsg: JrsChatMsg = {
            id: `e_${Date.now()}`,
            role: "assistant",
            content: json.error || "I couldn't send that. Try again in a moment.",
          };
          const after = [...next, errMsg];
          setMessages(after);
          saveChat(after);
        }
      } catch {
        const errMsg: JrsChatMsg = {
          id: `e_${Date.now()}`,
          role: "assistant",
          content: "Couldn't reach the coach. Check your connection and try again.",
        };
        const after = [...next, errMsg];
        setMessages(after);
        saveChat(after);
      } finally {
        setSending(false);
      }
    },
    [data, messages, sending],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    clearChat();
  }, []);

  const updateDensity = useCallback((d: Density) => {
    setDensity(d);
    saveDensity(d);
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

  const autoFormat = useCallback(async () => {
    if (formatting) return;
    setFormatting(true);
    try {
      const res = await fetch("/api/jrs/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
        saveResume(json.data);
      } else {
        alert(json.error || "Auto-format failed. Try again in a moment.");
      }
    } catch {
      alert("Couldn't reach auto-format. Check your connection and try again.");
    } finally {
      setFormatting(false);
    }
  }, [data, formatting]);

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
        onImported={(imported) => {
          setData(imported);
          saveResume(imported);
          setPhase("template");
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

      {/* Top bar — brutalist, decluttered. The template pill rail is gone:
          use the "Templates" button to open the full gallery. */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-900 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <a href="/" className="font-['Clash_Display'] text-lg font-extrabold text-neutral-900 hover:underline">
            Studojo
          </a>
          <span className="rounded-md border-2 border-neutral-900 bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800">
            Resume Maker
          </span>
          <span className="hidden text-xs font-semibold text-neutral-500 md:inline">
            · {TEMPLATES.find((t) => t.id === templateId)?.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={density}
            onChange={(e) => updateDensity(e.target.value as Density)}
            title="Spacing"
            className="rounded-lg border-2 border-neutral-900 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-800 focus:outline-none"
          >
            {DENSITIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} spacing
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPhase("template")}
            className="rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_0px_rgba(25,26,35,1)]"
          >
            Templates
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_0px_rgba(25,26,35,1)]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={autoFormat}
            disabled={formatting}
            className="rounded-lg border-2 border-neutral-900 bg-violet-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {formatting ? "Formatting..." : "✨ Auto-format"}
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

      {/* Body: edit / chat / ats (left) + preview (right) */}
      <div className="flex flex-1 overflow-hidden bg-neutral-50">
        <div className="flex w-full max-w-[480px] flex-col border-r-2 border-neutral-900 bg-white">
          {/* Brutalist tab strip */}
          <div className="flex gap-1.5 border-b-2 border-neutral-900 bg-neutral-100 p-1.5">
            {(
              [
                { id: "edit", label: "Edit" },
                { id: "chat", label: "Chat with coach" },
                { id: "ats", label: "ATS / job match" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg border-2 border-neutral-900 px-2 py-2 text-xs font-bold transition-transform ${
                  tab === t.id
                    ? "bg-violet-500 text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 hover:translate-x-[1px] hover:translate-y-[1px]"
                }`}
                aria-pressed={tab === t.id}
              >
                {t.label}
                {t.id === "chat" && messages.length > 0 && (
                  <span
                    className={`ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border border-neutral-900 px-1 text-[10px] font-bold ${
                      tab === t.id ? "bg-white text-violet-700" : "bg-violet-500 text-white"
                    }`}
                  >
                    {messages.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div
            className={`flex-1 min-h-0 ${
              tab === "chat" ? "p-3" : "overflow-y-auto px-4"
            }`}
          >
            {tab === "edit" && <Editor data={data} onChange={updateData} />}
            {tab === "ats" && <AtsPanel data={data} />}
            {tab === "chat" && (
              <div className="flex h-full flex-col gap-2">
                <ChatPanel
                  messages={messages as unknown as RsbChatMsg[]}
                  step={null}
                  onSend={sendChat}
                  sending={sending}
                  onGenerate={() => {}}
                  generating={false}
                />
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={resetChat}
                    className="self-end rounded-md border-2 border-neutral-900 bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-600 hover:bg-neutral-50"
                  >
                    Clear chat
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <PreviewPane data={data} templateId={templateId} density={densityFactor(density)} />
      </div>

      {/* Print-only copy — portaled to <body> so print CSS can isolate it. */}
      {createPortal(
        <div className="jrs-print-portal">
          <div
            style={{
              width: PAPER_W / densityFactor(density),
              zoom: densityFactor(density),
            }}
          >
            <ResumeTemplate id={templateId} data={data} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
