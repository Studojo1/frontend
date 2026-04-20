import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { ChatPanel } from "~/components/rsb/ChatPanel";
import { ResumePreview } from "~/components/rsb/ResumePreview";
import { AtsMeter } from "~/components/rsb/AtsMeter";
import { ExportBar } from "~/components/rsb/ExportBar";
import { rsbFetch, rsbStreamFetch, parseSSE } from "~/lib/rsb/api";
import { getToken } from "~/lib/control-plane";
import type { Ats, ChatMsg, ResumeDoc, RsbSession } from "~/lib/rsb/types";

type SessionResponse = {
  session: RsbSession;
  transcript: ChatMsg[];
};

const EMPTY_DOC: ResumeDoc = {
  contact: {},
  target: {},
  summary: null,
  experience: [],
  education: [],
  projects: [],
  skills: { technical: [], soft: [], languages: [], certifications: [] },
  awards: [],
  volunteer: [],
  publications: [],
};
const EMPTY_ATS: Ats = { score: 0, keyword_matches: [], missing_keywords: [], suggestions: [] };

export default function RsbSessionRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: auth, isPending } = authClient.useSession();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState("");
  const [sending, setSending] = useState(false);
  const [doc, setDoc] = useState<ResumeDoc>(EMPTY_DOC);
  const [ats, setAts] = useState<Ats>(EMPTY_ATS);
  const [session, setSession] = useState<RsbSession | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const streamingRef = useRef("");

  useEffect(() => {
    if (!isPending && !auth?.user) navigate(`/auth?mode=signin&redirect=/rsb/session/${id}`);
  }, [isPending, auth?.user, navigate, id]);

  useEffect(() => {
    if (!auth?.user || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await rsbFetch<SessionResponse>(`/session/${id}`);
        if (cancelled) return;
        setSession(res.session);
        setDoc(res.session.resume_doc || EMPTY_DOC);
        setAts(res.session.ats || EMPTY_ATS);
        setMessages(res.transcript);
        if (typeof window !== "undefined") localStorage.setItem("rsb:lastSessionId", res.session.id);
      } catch (e) {
        console.error(e);
        navigate("/rsb", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth?.user, id, navigate]);

  const send = useCallback(
    async (text: string) => {
      if (!id || sending) return;
      setSending(true);
      streamingRef.current = "";
      setStreaming("");
      const userMsg: ChatMsg = {
        id: `local-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await rsbStreamFetch(`/session/${id}/chat`, { message: text });
        if (!res.ok) throw new Error(`chat failed: ${res.status}`);

        let finalAssistant = "";
        for await (const ev of parseSSE(res)) {
          if (ev.event === "token") {
            streamingRef.current += ev.data;
            setStreaming(streamingRef.current);
          } else if (ev.event === "resume_patch") {
            try {
              const payload = JSON.parse(ev.data);
              if (payload.merged) setDoc(payload.merged);
            } catch {}
          } else if (ev.event === "ats_update") {
            try {
              setAts(JSON.parse(ev.data));
            } catch {}
          } else if (ev.event === "done") {
            try {
              const payload = JSON.parse(ev.data);
              finalAssistant = payload.assistant_text || streamingRef.current;
              if (payload.resume_doc) setDoc(payload.resume_doc);
              if (payload.ats) setAts(payload.ats);
              setLastSaved(new Date());
            } catch {}
          } else if (ev.event === "error") {
            console.error("SSE error event:", ev.data);
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: finalAssistant || streamingRef.current,
          },
        ]);
      } catch (e) {
        console.error(e);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Something glitched on my end. Try that again?",
          },
        ]);
      } finally {
        setStreaming("");
        setSending(false);
      }
    },
    [id, sending],
  );

  const onExport = useCallback(async () => {
    if (!id) return;
    setExporting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("not authed");
      const res = await fetch(`/api/v1/rsb/session/${id}/export`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(doc.contact.full_name || "resume").replace(/\s+/g, "_")}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed. Try again in a moment.");
    } finally {
      setExporting(false);
    }
  }, [id, doc.contact.full_name]);

  const onCopyPlain = useCallback(async () => {
    if (!id) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("not authed");
      const res = await fetch(`/api/v1/rsb/session/${id}/plain`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      alert("Plain text copied to clipboard.");
    } catch (e) {
      console.error(e);
      alert("Couldn't copy. Try again.");
    }
  }, [id]);

  if (isPending || !auth?.user || loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-neutral-500 font-['Satoshi']">
          Loading your draft…
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Full-height wrapper */}
      <div className="flex flex-col bg-gradient-to-br from-violet-50 via-white to-amber-50" style={{ height: "calc(100vh - 96px)" }}>

        {/* Top bar */}
        <div className="flex-shrink-0 border-b-2 border-neutral-900 bg-white px-4 py-2 flex items-center gap-4">
          <Link
            to="/profile"
            className="flex items-center gap-1 font-['Satoshi'] text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ← My Profile
          </Link>
          {session?.target_role && (
            <>
              <span className="text-neutral-300">·</span>
              <span className="font-['Satoshi'] text-sm text-neutral-700 truncate max-w-[200px]">
                {session.target_role}
              </span>
            </>
          )}
          {lastSaved && (
            <span className="ml-auto flex items-center gap-1.5 font-['Satoshi'] text-xs text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Auto-saved
            </span>
          )}
        </div>

        {/* Mobile tab bar */}
        <div className="flex-shrink-0 flex border-b-2 border-neutral-900 bg-white md:hidden">
          {(["chat", "preview"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 font-['Satoshi'] text-sm font-bold transition-colors capitalize ${
                activeTab === tab
                  ? "bg-violet-500 text-white border-b-0"
                  : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {tab === "chat" ? "Chat" : "Preview"}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden px-3 py-3 md:px-5 md:py-4">

          {/* Desktop: side-by-side */}
          <div className="hidden md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-4 h-full">
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0">
                <ChatPanel
                  messages={messages}
                  streamingText={streaming}
                  onSend={send}
                  sending={sending}
                />
              </div>
              <div className="flex-shrink-0">
                <AtsMeter ats={ats} />
              </div>
            </div>
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0">
                <ResumePreview doc={doc} />
              </div>
              <div className="flex-shrink-0">
                <ExportBar doc={doc} ats={ats} exporting={exporting} onExport={onExport} onCopyPlain={onCopyPlain} lastSaved={lastSaved} />
              </div>
            </div>
          </div>

          {/* Mobile: single active panel */}
          <div className="flex flex-col gap-3 h-full md:hidden">
            {activeTab === "chat" ? (
              <>
                <div className="flex-1 min-h-0">
                  <ChatPanel
                    messages={messages}
                    streamingText={streaming}
                    onSend={send}
                    sending={sending}
                  />
                </div>
                <div className="flex-shrink-0">
                  <AtsMeter ats={ats} />
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 min-h-0">
                  <ResumePreview doc={doc} />
                </div>
                <div className="flex-shrink-0">
                  <ExportBar doc={doc} ats={ats} exporting={exporting} onExport={onExport} onCopyPlain={onCopyPlain} lastSaved={lastSaved} />
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
