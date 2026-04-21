import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Header } from "~/components/common/header";
import { ChatPanel } from "~/components/rsb/ChatPanel";
import { ResumePreview } from "~/components/rsb/ResumePreview";
import { AtsMeter } from "~/components/rsb/AtsMeter";
import { ExportBar } from "~/components/rsb/ExportBar";
import { rsbFetch } from "~/lib/rsb/api";
import { getToken } from "~/lib/control-plane";
import type { Ats, ChatMsg, ChatResponse, ResumeDoc, RsbSession, StepInfo } from "~/lib/rsb/types";

type SessionResponse = {
  session: RsbSession;
  transcript: ChatMsg[];
  current_step: StepInfo;
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
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [doc, setDoc] = useState<ResumeDoc>(EMPTY_DOC);
  const [ats, setAts] = useState<Ats>(EMPTY_ATS);
  const [step, setStep] = useState<StepInfo | null>(null);
  const [session, setSession] = useState<RsbSession | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

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
        setStep(res.current_step);
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
      const userMsg: ChatMsg = { id: `local-${Date.now()}`, role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      try {
        const res = await rsbFetch<ChatResponse>(`/session/${id}/chat`, {
          method: "POST",
          body: JSON.stringify({ message: text }),
        });
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: res.assistant_message },
        ]);
        setDoc(res.session.resume_doc || EMPTY_DOC);
        setAts(res.session.ats || EMPTY_ATS);
        setStep(res.next_step);
        setLastSaved(new Date());
      } catch (e) {
        console.error(e);
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: "assistant", content: "Couldn't save that, please try again." },
        ]);
      } finally {
        setSending(false);
      }
    },
    [id, sending],
  );

  const onGenerate = useCallback(async () => {
    if (!id || generating) return;
    setGenerating(true);
    try {
      const res = await rsbFetch<{ session: RsbSession }>(`/session/${id}/generate`, { method: "POST" });
      setDoc(res.session.resume_doc || EMPTY_DOC);
      setAts(res.session.ats || EMPTY_ATS);
      setLastSaved(new Date());
      setMessages((prev) => [
        ...prev,
        {
          id: `gen-${Date.now()}`,
          role: "assistant",
          content: "Polished your resume. Check the preview and hit Export when you're happy.",
        },
      ]);
    } catch (e) {
      console.error(e);
      alert("Couldn't build the polished resume. Try again in a moment.");
    } finally {
      setGenerating(false);
    }
  }, [id, generating]);

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
          Loading your draft...
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="h-[calc(100vh-96px)] flex flex-col bg-gradient-to-br from-violet-50 via-white to-amber-50">
        {/* Top bar */}
        <div className="border-b-2 border-neutral-900 bg-white px-4 md:px-6 py-2 flex items-center gap-4 shrink-0">
          <Link
            to="/profile"
            className="text-xs font-bold text-neutral-500 hover:text-neutral-700 font-['Satoshi']"
          >
            ← My Profile
          </Link>
          {session?.target_role && (
            <span className="text-xs font-semibold text-neutral-700 font-['Satoshi'] hidden sm:block">
              {session.target_role}
            </span>
          )}
        </div>

        {/* Mobile tab bar */}
        <div className="md:hidden flex border-b-2 border-neutral-200 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 text-sm font-bold font-['Satoshi'] transition-colors ${
              activeTab === "chat"
                ? "text-violet-600 border-b-2 border-violet-500"
                : "text-neutral-500"
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-2 text-sm font-bold font-['Satoshi'] transition-colors ${
              activeTab === "preview"
                ? "text-violet-600 border-b-2 border-violet-500"
                : "text-neutral-500"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 min-h-0 px-4 md:px-6 py-4 overflow-hidden">
          <div className="h-full max-w-[1400px] mx-auto grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-4">
            {/* Left: chat + ats */}
            <div className={`flex flex-col gap-3 min-h-0 ${activeTab !== "chat" ? "hidden md:flex" : "flex"}`}>
              <div className="flex-1 min-h-0">
                <ChatPanel
                  messages={messages}
                  step={step}
                  onSend={send}
                  sending={sending}
                  onGenerate={onGenerate}
                  generating={generating}
                />
              </div>
              <AtsMeter ats={ats} />
            </div>

            {/* Right: preview + export */}
            <div className={`flex flex-col gap-3 min-h-0 ${activeTab !== "preview" ? "hidden md:flex" : "flex"}`}>
              <div className="flex-1 min-h-0">
                <ResumePreview
                  doc={doc}
                  editable={step?.is_complete === true}
                  onEdit={async (next) => {
                    setDoc(next);
                    try {
                      const res = await rsbFetch<{ resume_doc: ResumeDoc; ats: Ats }>(
                        `/session/${id}/doc`,
                        { method: "PUT", body: JSON.stringify(next) },
                      );
                      setAts(res.ats);
                      setLastSaved(new Date());
                    } catch (e) {
                      console.error("save failed", e);
                    }
                  }}
                />
              </div>
              <ExportBar doc={doc} exporting={exporting} onExport={onExport} onCopyPlain={onCopyPlain} lastSaved={lastSaved} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
