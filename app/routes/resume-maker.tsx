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
  loadScriptStep,
  saveScriptStep,
  starterResume,
  hasSavedResume,
  isStarterSample,
} from "~/lib/jrs/types";
import { ResumeTemplate } from "~/lib/jrs/templates";
import {
  type ResumeFormatting,
  DEFAULT_FORMATTING,
  loadFormatting,
  saveFormatting,
  formattingCSS,
} from "~/lib/jrs/formatting";
import { FormatToolbar } from "~/components/jrs/format-toolbar";
import { Editor } from "~/components/jrs/editor";
import { AtsPanel } from "~/components/jrs/ats-panel";
import { WelcomeScreen, TemplatePicker } from "~/components/jrs/start-flow";
import { ChatPanel } from "~/components/jrs/chat-panel";
import { Header } from "~/components/common/header";
import {
  type ScriptedStep,
  type Op,
  nextScriptedStep,
  scriptedQuestion,
  applyScripted,
  smartOpener,
  applyOps,
  KICKOFF_AFTER_BASICS,
} from "~/lib/jrs/coach";

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

const FORMAT_SCOPE_CLASS = "jrs-fmt-scope";

function PreviewPane({
  data,
  templateId,
  density,
  formatting,
}: {
  data: ResumeData;
  templateId: TemplateId;
  density: number;
  formatting: ResumeFormatting;
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

  // Multiply density and user-set font scale together — both ride the same
  // `zoom` so the page stays A4-wide while everything inside scales.
  const totalZoom = density * formatting.fontScale;

  return (
    <div ref={wrapRef} className="flex-1 overflow-auto bg-neutral-100 p-6">
      <style>{formattingCSS(FORMAT_SCOPE_CLASS, formatting)}</style>
      <div
        className="mx-auto"
        style={{ width: PAPER_W * scale, height: PAPER_H * scale }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div
            className="bg-white shadow-[0_2px_24px_rgba(0,0,0,0.18)]"
            style={{ width: PAPER_W }}
          >
            <div
              className={FORMAT_SCOPE_CLASS}
              style={{ width: PAPER_W / totalZoom, zoom: totalZoom }}
            >
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
  const [templateId, setTemplateId] = useState<TemplateId>("harvard");
  const [tab, setTab] = useState<"edit" | "chat" | "ats">("edit");
  const [phase, setPhase] = useState<Phase>("welcome");
  const [hasSaved, setHasSaved] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [density, setDensity] = useState<Density>("normal");
  const [typography, setTypography] = useState<ResumeFormatting>(DEFAULT_FORMATTING);
  const [messages, setMessages] = useState<JrsChatMsg[]>([]);
  const [sending, setSending] = useState(false);
  // Scripted-coach state. When non-null, the user's next message is treated
  // as an answer to a known basic field — no LLM call needed.
  const [scriptStep, setScriptStep] = useState<ScriptedStep>(null);
  // True once the user has opened the Chat tab; we drop the opener message
  // only at that point so we don't burn a slot if they never use chat.
  const [chatPrimed, setChatPrimed] = useState(false);

  const pushBot = useCallback(
    (content: string, current: JrsChatMsg[]): JrsChatMsg[] => {
      const msg: JrsChatMsg = {
        id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        content,
      };
      const next = [...current, msg];
      setMessages(next);
      saveChat(next);
      return next;
    },
    [],
  );

  useEffect(() => {
    const loaded = loadResume();
    setData(loaded);
    setTemplateId(loadTemplate());
    setDensity(loadDensity());
    setTypography(loadFormatting());
    // Only treat as "saved" if it's NOT the starter sample. Otherwise the
    // welcome card would greet new users back as Aanya Sharma.
    setHasSaved(hasSavedResume() && !isStarterSample(loaded));
    setMessages(loadChat());
    setScriptStep((loadScriptStep() as ScriptedStep) || null);
    setMounted(true);
  }, []);

  // First-open opener: only when the user actually visits the Chat tab and
  // there's no chat history yet. Cheap because it's scripted, not an LLM call.
  useEffect(() => {
    if (!mounted) return;
    if (tab !== "chat" || chatPrimed) return;
    setChatPrimed(true);
    if (messages.length > 0) return;
    const step = nextScriptedStep(data);
    if (step) {
      setScriptStep(step);
      saveScriptStep(step);
      pushBot(scriptedQuestion(step, data), []);
    } else {
      saveScriptStep(null);
      pushBot(smartOpener(data), []);
    }
  }, [mounted, tab, chatPrimed, messages.length, data, pushBot]);

  const sendChat = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || sending) return;

      const userMsg: JrsChatMsg = {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: "user",
        content: t,
      };
      const afterUser = [...messages, userMsg];
      setMessages(afterUser);
      saveChat(afterUser);

      // ── Scripted path: zero LLM cost ───────────────────────────────────
      if (scriptStep) {
        const patched = applyScripted(scriptStep, t, data);
        setData(patched);
        saveResume(patched);
        const nextStep = nextScriptedStep(patched);
        if (nextStep) {
          setScriptStep(nextStep);
          saveScriptStep(nextStep);
          pushBot(scriptedQuestion(nextStep, patched), afterUser);
        } else {
          setScriptStep(null);
          saveScriptStep(null);
          pushBot(KICKOFF_AFTER_BASICS, afterUser);
        }
        return;
      }

      // ── LLM path: ops model, compact resume in ─────────────────────────
      setSending(true);
      try {
        const res = await fetch("/api/resume-maker/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: afterUser.map((m) => ({ role: m.role, content: m.content })),
            data,
          }),
        });
        const json = await res.json();
        if (res.ok && json.reply) {
          if (Array.isArray(json.ops) && json.ops.length > 0) {
            const nextData = applyOps(data, json.ops as Op[]);
            setData(nextData);
            saveResume(nextData);
          } else if (json.data) {
            // Server-applied fallback if ops were missing.
            setData(json.data);
            saveResume(json.data);
          }
          pushBot(json.reply, afterUser);
        } else {
          pushBot(
            json.error || "I couldn't send that. Try again in a moment.",
            afterUser,
          );
        }
      } catch {
        pushBot("Couldn't reach the coach. Check your connection and try again.", afterUser);
      } finally {
        setSending(false);
      }
    },
    [data, messages, sending, scriptStep, pushBot],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    clearChat();
    setScriptStep(null);
    saveScriptStep(null);
    setChatPrimed(false);
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
      const res = await fetch("/api/resume-maker/format", {
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
      <>
        <Header />
        <WelcomeScreen
          hasSaved={hasSaved}
          savedData={hasSaved ? data : undefined}
          savedTemplate={hasSaved ? templateId : undefined}
          onCreate={() => {
            // Set state to the starter sample but DO NOT persist it. We only
            // save once the user actually edits something — that way the
            // "Welcome back" card won't show until there's real content.
            setData(starterResume());
            setHasSaved(false);
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
      </>
    );
  }

  // Phase 2 — Canva-style template gallery.
  if (phase === "template") {
    return (
      <>
        <Header />
        <TemplatePicker
          onPick={(id) => {
            updateTemplate(id);
            setTab("edit");
            setPhase("editor");
          }}
          onBack={() => setPhase("welcome")}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white font-['Satoshi']">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* Global studojo header — same as the rest of the site */}
      <Header />

      {/* JRS workspace subheader — sits under the global studojo Header.
          Branding lives in the Header; this row is just the resume tools. */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-900 bg-neutral-50 px-4 py-2">
        {/* Crumb + template chip */}
        <div className="flex items-center gap-2">
          <span className="rounded-md border-2 border-neutral-900 bg-violet-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-800">
            Resume Maker
          </span>
          <button
            type="button"
            onClick={() => setPhase("template")}
            title="Switch template"
            className="flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 text-xs font-bold text-neutral-900 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_0px_rgba(25,26,35,1)]"
          >
            <span className="text-neutral-500">Template:</span>
            <span>{TEMPLATES.find((t) => t.id === templateId)?.name ?? "Harvard"}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-neutral-600">
              <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Workspace settings */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border-2 border-neutral-900 bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
            {DENSITIES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => updateDensity(d.id as Density)}
                title={`${d.name} spacing`}
                className={`rounded-md px-2 py-1 text-[11px] font-bold capitalize transition-colors ${
                  density === d.id
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={reset}
            title="Clear and start from the sample"
            className="rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_0px_rgba(25,26,35,1)]"
          >
            Reset
          </button>
        </div>

        {/* Primary actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={autoFormat}
            disabled={formatting}
            className="flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-violet-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            <span aria-hidden>✨</span>
            {formatting ? "Formatting..." : "Auto-format"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-amber-300 px-4 py-1.5 text-sm font-bold text-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
            </svg>
            Download PDF
          </button>
        </div>
      </header>

      {/* Body: edit / chat / ats (left) + preview (right) */}
      <div className="flex flex-1 overflow-hidden bg-neutral-100">
        <div className="flex w-full max-w-[460px] flex-col border-r-2 border-neutral-900 bg-white">
          {/* Segmented tab control — single bordered shell with internal segments */}
          <div className="border-b-2 border-neutral-900 bg-neutral-50 px-3 py-2.5">
            <div
              className="inline-flex w-full items-center rounded-xl border-2 border-neutral-900 bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
              role="tablist"
              aria-label="Resume tools"
            >
              {(
                [
                  { id: "edit", label: "Edit" },
                  { id: "chat", label: "Coach" },
                  { id: "ats", label: "Job match" },
                ] as const
              ).map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={`relative flex-1 rounded-lg px-2 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {t.label}
                    {t.id === "chat" && messages.length > 0 && (
                      <span
                        className={`ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          active
                            ? "bg-violet-400 text-neutral-900"
                            : "bg-violet-500 text-white"
                        }`}
                      >
                        {messages.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`flex-1 min-h-0 ${
              tab === "chat" ? "p-3" : "overflow-y-auto px-4 py-3"
            }`}
          >
            {tab === "edit" && (
              <>
                <FormatToolbar
                  formatting={typography}
                  onChange={(next) => {
                    setTypography(next);
                    saveFormatting(next);
                  }}
                />
                <Editor data={data} onChange={updateData} />
              </>
            )}
            {tab === "ats" && <AtsPanel data={data} />}
            {tab === "chat" && (
              <div className="flex h-full flex-col gap-2">
                <ChatPanel messages={messages} onSend={sendChat} sending={sending} />
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

        {/* Preview workspace */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-neutral-900 bg-white px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live preview
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-700">A4</span>
              <span className="text-neutral-400">·</span>
              <span className="capitalize text-neutral-700">{density} spacing</span>
            </div>
            <div className="text-[11px] font-bold text-neutral-400">Auto-saved</div>
          </div>
          <PreviewPane
            data={data}
            templateId={templateId}
            density={densityFactor(density)}
            formatting={typography}
          />
        </div>
      </div>

      {/* Print-only copy — portaled to <body> so print CSS can isolate it. */}
      {createPortal(
        <div className="jrs-print-portal">
          <style>{formattingCSS(FORMAT_SCOPE_CLASS, typography)}</style>
          <div
            className={FORMAT_SCOPE_CLASS}
            style={{
              width: PAPER_W / (densityFactor(density) * typography.fontScale),
              zoom: densityFactor(density) * typography.fontScale,
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
