import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiPlus, FiTrash2, FiSend, FiDownload, FiLock, FiZap, FiSearch,
  FiFileText, FiGrid, FiLoader, FiExternalLink, FiChevronRight,
  FiSidebar, FiMaximize2, FiMinimize2, FiX, FiLinkedin, FiCopy, FiCheck,
  FiMessageSquare, FiColumns, FiUser, FiUsers, FiBriefcase, FiTarget,
  FiLayers, FiGlobe, FiPaperclip, FiFile, FiPhone, FiMail, FiUserPlus, FiSlash,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// Bob — placement intelligence workspace.
// Chat left, results right. Results default to company CARDS (a dossier per
// company); a dense table view is one toggle away. Rows stream in live.
// Backend: /api/v1/outreach/bob/*
// ─────────────────────────────────────────────────────────────────────────────

export function meta() {
  return [
    { title: "Bob | Studojo Intelligence" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

const API = "/api/v1/outreach/bob";
const KEY_STORAGE = "bob_access_key";
const LAYOUT_STORAGE = "bob_layout_v3";

class BobError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function bobFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const key = localStorage.getItem(KEY_STORAGE) || "";
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Bob-Key": key,
      ...(options.headers as Record<string, string>),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BobError(data?.detail || `Request failed (${res.status})`, res.status);
  return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatSummary { id: number; title: string; updated_at: string }
interface Message { id: number; role: string; content: string; created_at: string; meta?: { suggestions?: string[] } }
interface RunEvent { ts: string; type: string; label: string; detail?: string; credits?: number }
interface Run {
  id: number; status: string; events: RunEvent[];
  counters: Record<string, number>; credits_used: number; answer: string;
  tables?: BobTable[];
}
interface BobColumn { key: string; label: string }
interface BobRow { id: number; cells: Record<string, unknown>; status: string }
interface BobTable { id: number; name: string; columns: BobColumn[]; rows: BobRow[] }

const ROW_STATUSES = ["new", "contacted", "replied", "meeting", "dead"] as const;
const STATUS_STYLE: Record<string, string> = {
  new: "bg-neutral-100 text-neutral-600 border-neutral-300",
  contacted: "bg-blue-50 text-blue-700 border-blue-300",
  replied: "bg-green-50 text-green-700 border-green-300",
  meeting: "bg-violet-50 text-violet-700 border-violet-300",
  dead: "bg-neutral-100 text-neutral-400 border-neutral-200 line-through",
};

const COLUMN_PRIORITY = [
  "company", "contact_name", "contact_title", "tier", "fit_score", "city",
  "hiring_evidence", "why_now", "what_they_do", "size_band", "funding",
  "website", "evidence_url", "linkedin_url", "contact_linkedin_url",
];
const WIDE_KEYS = new Set(["hiring_evidence", "why_now", "what_they_do", "funding", "outreach_angle", "suggested_opening", "connection_point", "signal_rationale"]);

function orderColumns(cols: BobColumn[]): BobColumn[] {
  return [...cols].sort((a, b) => {
    const ia = COLUMN_PRIORITY.indexOf(a.key);
    const ib = COLUMN_PRIORITY.indexOf(b.key);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function prettify(s: string): string {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Domains that are never a company's own website (LinkedIn, job boards).
const NON_SITE_DOMAINS = /linkedin\.com|naukri\.com|indeed\.com|wellfound\.com|greenhouse\.io|lever\.co|ashbyhq\.com|glassdoor\./i;

function domainOf(v: string): string {
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return v;
  }
}

// Known-dead link patterns from logged-out LinkedIn HTML: anonymized company
// placeholder, signup redirect wrappers, shorteners. Never render as chips.
const GARBAGE_URL = /linkedin\.com\/(company|school)\/unavailable|linkedin\.com\/signup|\/cold-join|linkedin\.com\/authwall|lnkd\.in\//i;

// Extract every valid URL from a cell. The agent occasionally packed several
// links into one field; each must be its own working chip, never one mangled href.
function extractUrls(s: string): string[] {
  return (s.match(/https?:\/\/[^\s;,)"']+/g) || [])
    .map((u) => u.replace(/[.,;]+$/, ""))
    .filter((u) => !GARBAGE_URL.test(u));
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return typeof v === "object" ? JSON.stringify(v) : String(v);
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function BobPage() {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(KEY_STORAGE)) setAuthed(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#faf7f2]" />;
  if (!authed) return <Gate onSuccess={() => setAuthed(true)} />;
  return <Workspace onAuthLost={() => setAuthed(false)} />;
}

// ── Access gate ──────────────────────────────────────────────────────────────

function Gate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || "Invalid access code");
      }
      localStorage.setItem(KEY_STORAGE, code.trim());
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Could not verify the code");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 font-['Satoshi']">
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8">
        <div className="w-12 h-12 bg-violet-500 border-2 border-neutral-900 rounded-2xl flex items-center justify-center mb-5">
          <FiLock className="text-white text-xl" />
        </div>
        <h1 className="font-['Clash_Display'] text-3xl font-semibold text-neutral-900">Bob</h1>
        <p className="text-neutral-600 mt-2 mb-6">
          Placement intelligence for your team. Enter your workspace access code.
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Access code"
          className="w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full bg-violet-500 text-white font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-60"
        >
          {busy ? "Checking..." : "Enter workspace"}
        </button>
      </div>
    </div>
  );
}

// ── Workspace ────────────────────────────────────────────────────────────────

type PanelMode = "split" | "chat" | "table";
type ResultsView = "cards" | "table";

function Workspace({ onAuthLost }: { onAuthLost: () => void }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tables, setTables] = useState<BobTable[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ id: number; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<PanelMode>("split");
  const [tablePct, setTablePct] = useState(48);
  const [viewPref, setViewPref] = useState<ResultsView | null>(null);
  const dragging = useRef(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_STORAGE) || "{}");
      if (typeof saved.sidebarOpen === "boolean") setSidebarOpen(saved.sidebarOpen);
      if (typeof saved.tablePct === "number") setTablePct(saved.tablePct);
      if (saved.viewPref === "cards" || saved.viewPref === "table") setViewPref(saved.viewPref);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE, JSON.stringify({ sidebarOpen, tablePct, viewPref }));
  }, [sidebarOpen, tablePct, viewPref]);

  const handleError = useCallback((e: unknown) => {
    if (e instanceof BobError && (e.status === 401 || e.status === 503)) {
      localStorage.removeItem(KEY_STORAGE);
      onAuthLost();
    } else {
      console.error(e);
    }
  }, [onAuthLost]);

  const loadChats = useCallback(async () => {
    try {
      const d = await bobFetch<{ chats: ChatSummary[] }>("/chats");
      setChats(d.chats);
      return d.chats;
    } catch (e) {
      handleError(e);
      return [];
    }
  }, [handleError]);

  const openChat = useCallback(async (id: number) => {
    setActiveChat(id);
    setRun(null);
    setPendingFiles([]);
    try {
      const d = await bobFetch<any>(`/chats/${id}`);
      setMessages(d.messages);
      setTables(d.tables || []);
      if (d.latest_run && d.latest_run.status === "running") setRun(d.latest_run);
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  useEffect(() => {
    loadChats().then((list) => {
      if (list.length > 0) openChat(list[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!run || run.status !== "running") return;
    pollRef.current = setInterval(async () => {
      try {
        const d = await bobFetch<Run>(`/runs/${run.id}`);
        setRun(d);
        if (d.tables) setTables(d.tables);
        if (d.status !== "running") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (activeChat) {
            const chat = await bobFetch<any>(`/chats/${activeChat}`);
            setMessages(chat.messages);
            setTables(chat.tables || []);
          }
          loadChats();
        }
      } catch (e) {
        handleError(e);
      }
    }, 2500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.id, run?.status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, run?.events?.length]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current || !layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();
      const pct = ((rect.right - e.clientX) / rect.width) * 100;
      setTablePct(Math.min(72, Math.max(30, pct)));
    };
    const up = () => { dragging.current = false; document.body.style.cursor = ""; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const newChat = async () => {
    try {
      const d = await bobFetch<{ id: number }>("/chats", { method: "POST" });
      await loadChats();
      setMessages([]);
      setTables([]);
      setRun(null);
      setActiveChat(d.id);
      setMode("split");
    } catch (e) {
      handleError(e);
    }
  };

  const deleteChat = async (id: number) => {
    if (!confirm("Delete this chat and its tables?")) return;
    try {
      await bobFetch(`/chats/${id}`, { method: "DELETE" });
      const list = await loadChats();
      if (activeChat === id) {
        if (list.length > 0) openChat(list[0].id);
        else { setActiveChat(null); setMessages([]); setTables([]); setRun(null); }
      }
    } catch (e) {
      handleError(e);
    }
  };

  const uploadFile = async (f: globalThis.File) => {
    setUploading(true);
    try {
      let chatId = activeChat;
      if (!chatId) {
        const d = await bobFetch<{ id: number }>("/chats", { method: "POST" });
        chatId = d.id;
        setActiveChat(chatId);
        loadChats();
      }
      const key = localStorage.getItem(KEY_STORAGE) || "";
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${API}/chats/${chatId}/files`, {
        method: "POST",
        headers: { "X-Bob-Key": key },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new BobError(data?.detail || "Upload failed", res.status);
      setPendingFiles((p) => [...p, { id: data.file_id, name: f.name }]);
    } catch (e: any) {
      alert(e?.message || "Could not read that file");
      if (e instanceof BobError) handleError(e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const send = async (text?: string) => {
    let content = (text ?? input).trim();
    if ((!content && pendingFiles.length === 0) || sending) return;
    if (pendingFiles.length > 0) {
      const names = pendingFiles.map((f) => f.name).join(", ");
      content = `[Attached: ${names}]\n${content || "Analyze the attached file(s) and proceed."}`;
    }
    let chatId = activeChat;
    setSending(true);
    try {
      if (!chatId) {
        const d = await bobFetch<{ id: number }>("/chats", { method: "POST" });
        chatId = d.id;
        setActiveChat(chatId);
      }
      setMessages((m) => [...m, { id: Date.now(), role: "user", content, created_at: "" }]);
      setInput("");
      setPendingFiles([]);
      const d = await bobFetch<{ run_id: number }>(`/chats/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setRun({ id: d.run_id, status: "running", events: [], counters: {}, credits_used: 0, answer: "" });
      loadChats();
    } catch (e: any) {
      if (e instanceof BobError && e.status === 409) {
        alert("Bob is still working on this chat. Wait for the current run to finish.");
      } else {
        handleError(e);
      }
    } finally {
      setSending(false);
    }
  };

  const updateRowStatus = async (rowId: number, status: string) => {
    try {
      await bobFetch(`/rows/${rowId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setTables((ts) => ts.map((t) => ({
        ...t,
        rows: t.rows.map((r) => (r.id === rowId ? { ...r, status } : r)),
      })));
    } catch (e) { handleError(e); }
  };

  // ── Contact reveal (on-demand paid enrichment) ──
  const refreshTables = useCallback(async () => {
    if (!activeChat) return;
    try {
      const chat = await bobFetch<any>(`/chats/${activeChat}`);
      setTables(chat.tables || []);
    } catch (e) { handleError(e); }
  }, [activeChat, handleError]);

  // Optimistically flip a row's contact status so the button reacts instantly;
  // the background poll then reconciles with the real found/not_found result.
  const markEnriching = (rowIds: Set<number>) => {
    setTables((ts) => ts.map((t) => ({
      ...t,
      rows: t.rows.map((r) => (rowIds.has(r.id)
        ? { ...r, cells: { ...r.cells, _contact_status: "enriching", _contact_note: "" } }
        : r)),
    })));
  };

  const enrichRow = async (rowId: number) => {
    markEnriching(new Set([rowId]));
    try {
      await bobFetch(`/rows/${rowId}/enrich`, { method: "POST" });
    } catch (e) { handleError(e); refreshTables(); }
  };

  const enrichTable = async (tableId: number) => {
    const t = tables.find((x) => x.id === tableId);
    if (!t) return;
    const todo = new Set(
      t.rows
        .filter((r) => !["found", "enriching"].includes(str(r.cells._contact_status)))
        .map((r) => r.id),
    );
    if (todo.size === 0) return;
    markEnriching(todo);
    try {
      await bobFetch(`/tables/${tableId}/enrich`, { method: "POST" });
    } catch (e) { handleError(e); refreshTables(); }
  };

  const deleteRow = async (rowId: number) => {
    try {
      await bobFetch(`/rows/${rowId}`, { method: "DELETE" });
      setTables((ts) => ts.map((t) => ({ ...t, rows: t.rows.filter((r) => r.id !== rowId) })));
    } catch (e) { handleError(e); }
  };

  // While any row is enriching, poll the table until every reveal settles.
  const anyEnriching = useMemo(
    () => tables.some((t) => t.rows.some((r) => str(r.cells._contact_status) === "enriching")),
    [tables],
  );
  const enrichPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (enrichPollRef.current) { clearInterval(enrichPollRef.current); enrichPollRef.current = null; }
    if (!anyEnriching) return;
    enrichPollRef.current = setInterval(() => { refreshTables(); }, 3000);
    return () => { if (enrichPollRef.current) clearInterval(enrichPollRef.current); };
  }, [anyEnriching, refreshTables]);

  const running = run?.status === "running";
  const hasTables = tables.length > 0;
  const showChat = mode !== "table";
  const showTable = hasTables && mode !== "chat";
  const lastMsg = messages[messages.length - 1];
  const suggestions: string[] =
    !running && lastMsg?.role === "assistant" ? lastMsg.meta?.suggestions || [] : [];

  return (
    <div className="h-screen bg-[#faf7f2] flex overflow-hidden font-['Satoshi'] text-neutral-900">
      <style>{`
        @keyframes bobFlash { 0% { background-color: rgb(221 214 254); } 100% { background-color: transparent; } }
        .bob-new { animation: bobFlash 2.5s ease-out; }
        @keyframes bobPop { 0% { opacity: 0; transform: translateY(8px) scale(0.98); } 100% { opacity: 1; transform: none; } }
        .bob-pop { animation: bobPop 0.35s ease-out; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        className={`shrink-0 border-r-2 border-neutral-900 bg-white flex flex-col overflow-hidden transition-[width] duration-200 ${
          sidebarOpen ? "w-64" : "w-0 border-r-0"
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="p-4 border-b-2 border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-500 border-2 border-neutral-900 rounded-xl flex items-center justify-center">
                <FiZap className="text-white text-sm" />
              </div>
              <div>
                <div className="font-['Clash_Display'] text-lg font-semibold leading-none">Bob</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Team workspace</div>
              </div>
            </div>
            <button
              onClick={newChat}
              title="New chat"
              className="w-8 h-8 bg-neutral-900 text-white rounded-xl flex items-center justify-center hover:bg-violet-500 transition-colors"
            >
              <FiPlus />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 pb-24">
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => openChat(c.id)}
                className={`group flex items-center justify-between gap-1 px-3 py-2.5 mb-1 rounded-xl cursor-pointer text-sm transition-colors ${
                  activeChat === c.id ? "bg-violet-100 border-2 border-neutral-900" : "hover:bg-neutral-100 border-2 border-transparent"
                }`}
              >
                <span className="truncate">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 shrink-0"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
            {chats.length === 0 && <p className="text-neutral-400 text-sm p-3">No chats yet.</p>}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        <header className="h-12 shrink-0 border-b-2 border-neutral-900 bg-white flex items-center gap-2 px-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide chats" : "Show chats"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <FiSidebar />
          </button>
          <span className="text-sm font-bold truncate">
            {chats.find((c) => c.id === activeChat)?.title || "New conversation"}
          </span>
          {running && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">
              <FiLoader className="animate-spin" size={11} /> researching
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            {hasTables && (
              <div className="flex items-center rounded-xl border-2 border-neutral-900 overflow-hidden">
                {([["chat", FiMessageSquare, "Chat only"], ["split", FiColumns, "Split view"], ["table", FiGrid, "Results only"]] as const).map(([m, Icon, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m as PanelMode)}
                    title={label}
                    className={`w-9 h-8 flex items-center justify-center text-sm transition-colors ${
                      mode === m ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div ref={layoutRef} className="flex-1 min-h-0 flex">

          {/* Chat */}
          {showChat && (
            <section className="flex flex-col min-w-0 flex-1">
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
                {messages.length === 0 && !running && <EmptyChat onPick={(s) => setInput(s)} />}
                <div className="max-w-2xl mx-auto space-y-4">
                  {messages.map((m) => (
                    m.role === "user" ? (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md border-2 border-neutral-900 bg-violet-500 text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14.5px] leading-relaxed">
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      <div key={m.id} className="flex gap-2.5">
                        <div className="w-7 h-7 mt-1 shrink-0 bg-neutral-900 rounded-lg flex items-center justify-center">
                          <FiZap className="text-violet-400" size={13} />
                        </div>
                        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-md border-2 border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14.5px] leading-relaxed">
                          {m.content}
                        </div>
                      </div>
                    )
                  ))}
                  {running && run && <RunProgress run={run} />}
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-9">
                      {suggestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="text-[12px] font-semibold bg-white border border-neutral-300 rounded-full px-3 py-1.5 text-neutral-600 hover:border-violet-500 hover:text-violet-700 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t-2 border-neutral-900 bg-white p-3">
                {pendingFiles.length > 0 && (
                  <div className="max-w-2xl mx-auto flex flex-wrap gap-1.5 mb-2">
                    {pendingFiles.map((f) => (
                      <span key={f.id} className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-300 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-violet-800">
                        <FiFile size={12} /> {f.name}
                        <span className="text-violet-400 font-normal">attached</span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="max-w-2xl mx-auto flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(f);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={running || uploading}
                    title="Attach a resume or cohort sheet (PDF, Word, Excel, CSV)"
                    className="self-end w-11 h-11 shrink-0 rounded-2xl border-2 border-neutral-900 bg-white text-neutral-600 flex items-center justify-center hover:bg-violet-50 hover:text-violet-700 transition-colors disabled:opacity-40"
                  >
                    {uploading ? <FiLoader className="animate-spin" /> : <FiPaperclip />}
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                    }}
                    rows={2}
                    placeholder={running ? "Bob is working on it. Ask your next question when he finishes." : "Describe a candidate, cohort, or the companies you need..."}
                    disabled={running}
                    className="flex-1 border-2 border-neutral-900 rounded-2xl px-4 py-2.5 text-[14.5px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-neutral-100"
                  />
                  <button
                    onClick={() => send()}
                    disabled={running || sending || !input.trim()}
                    className="self-end bg-neutral-900 text-white w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-violet-500 transition-colors disabled:opacity-40"
                  >
                    {sending || running ? <FiLoader className="animate-spin" /> : <FiSend />}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Divider */}
          {showChat && showTable && (
            <div
              onPointerDown={() => { dragging.current = true; document.body.style.cursor = "col-resize"; }}
              className="w-[6px] shrink-0 cursor-col-resize bg-neutral-900 hover:bg-violet-500 transition-colors relative group"
              title="Drag to resize"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-white/60 group-hover:bg-white" />
            </div>
          )}

          {/* Results */}
          {showTable && (
            <ResultsPanel
              widthPct={mode === "table" ? 100 : tablePct}
              fullWidth={mode === "table"}
              tables={tables}
              expanded={mode === "table"}
              onExpand={() => setMode(mode === "table" ? "split" : "table")}
              viewPref={viewPref}
              onViewPref={setViewPref}
              onRowStatus={updateRowStatus}
              onEnrichRow={enrichRow}
              onEnrichTable={enrichTable}
              onDeleteRow={deleteRow}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty chat: mandate templates ────────────────────────────────────────────

const TEMPLATES = [
  {
    icon: FiUser, title: "Place a candidate",
    subtitle: "Attach a resume, get target companies",
    prompt: "I've attached my candidate's resume (use the paperclip). Preferences: [city, company stage, expected CTC]. Find the best companies hiring for this profile right now, with evidence and the right hiring contact per company.",
  },
  {
    icon: FiUsers, title: "Place a cohort",
    subtitle: "Companies that absorb a batch",
    prompt: "I have a cohort of [number] [role] students graduating in [timeframe]. Find companies that can absorb them at volume (bulk hiring, walk-in drives, fresher intakes), with TA contacts for each.",
  },
  {
    icon: FiBriefcase, title: "Build a partner pipeline",
    subtitle: "Companies worth an MoU",
    prompt: "Find [number] companies that should become recurring hiring partners for our [domain] training programs. Look for sustained hiring velocity and fresher-friendliness. Target HR/TA leadership as contacts.",
  },
  {
    icon: FiTarget, title: "Track a market",
    subtitle: "Funding + hiring momentum",
    prompt: "Which [sector] startups in [city/India] raised funding in the last 6 months and are actively hiring? Build a table with the round details, hiring evidence, and why-now for each.",
  },
];

function EmptyChat({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto mt-10 mb-10 bob-pop">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto bg-violet-500 border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] flex items-center justify-center mb-5">
          <FiZap className="text-white text-2xl" />
        </div>
        <h2 className="font-['Clash_Display'] text-3xl font-semibold">What are we placing today?</h2>
        <p className="text-neutral-600 mt-3 mb-8 max-w-md mx-auto">
          Describe a candidate, a cohort, or a market. Bob researches live evidence and builds a working target list with the right people to contact.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.title}
            onClick={() => onPick(t.prompt)}
            className="bg-white border-2 border-neutral-900 rounded-2xl p-4 text-left shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all group"
          >
            <t.icon className="text-violet-500 mb-2" size={18} />
            <div className="font-bold text-sm">{t.title}</div>
            <div className="text-[12px] text-neutral-500 mt-0.5">{t.subtitle}</div>
            <div className="text-[11px] text-violet-600 font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Use template <FiChevronRight className="inline" size={11} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Run progress ─────────────────────────────────────────────────────────────

function RunProgress({ run }: { run: Run }) {
  const events = run.events || [];
  const recent = events.slice(-7);
  const c = run.counters || {};
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 mt-1 shrink-0 bg-neutral-900 rounded-lg flex items-center justify-center">
        <FiLoader className="animate-spin text-violet-400" size={13} />
      </div>
      <div className="flex-1 bg-white border-2 border-neutral-900 rounded-2xl rounded-tl-md shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-bold text-sm">Researching…</span>
          <span className="ml-auto flex gap-1.5 text-[11px] text-neutral-500">
            {c.searches ? <span className="bg-neutral-100 rounded-full px-2 py-0.5">{c.searches} searches</span> : null}
            {c.rows_added ? <span className="bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">{c.rows_added} results</span> : null}
            {run.credits_used ? <span className="bg-neutral-100 rounded-full px-2 py-0.5">{run.credits_used} credits</span> : null}
          </span>
        </div>
        <div className="space-y-1.5">
          {recent.map((ev, i) => (
            <div key={i} className={`flex items-start gap-2 text-[13px] ${i === recent.length - 1 ? "text-neutral-900 font-semibold" : "text-neutral-500"}`}>
              <span className="mt-0.5 text-violet-500 shrink-0">
                {ev.type === "search" || ev.type === "search_done" ? <FiSearch size={13} /> :
                 ev.type === "scrape" ? <FiFileText size={13} /> :
                 ev.type === "table" || ev.type === "rows" ? <FiGrid size={13} /> : <FiZap size={13} />}
              </span>
              <span>{ev.label}</span>
            </div>
          ))}
          {recent.length === 0 && <p className="text-[13px] text-neutral-500">Planning the research…</p>}
        </div>
        <p className="text-[11px] text-neutral-400 mt-3">
          Results appear on the right as Bob finds them. Deep research can take a few minutes.
        </p>
      </div>
    </div>
  );
}

// ── Results panel (cards ⇄ table) ────────────────────────────────────────────

function ResultsPanel({ tables, widthPct, fullWidth, expanded, onExpand, viewPref, onViewPref, onRowStatus, onEnrichRow, onEnrichTable, onDeleteRow }: {
  tables: BobTable[];
  widthPct: number;
  fullWidth: boolean;
  expanded: boolean;
  onExpand: () => void;
  viewPref: ResultsView | null;
  onViewPref: (v: ResultsView) => void;
  onRowStatus: (rowId: number, status: string) => void;
  onEnrichRow: (rowId: number) => void;
  onEnrichTable: (tableId: number) => void;
  onDeleteRow: (rowId: number) => void;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailRow, setDetailRow] = useState<BobRow | null>(null);
  const seenRows = useRef<Set<number>>(new Set());

  const active = tables.find((t) => t.id === activeId) || tables[tables.length - 1] || null;
  const view: ResultsView = viewPref ?? ((active?.rows.length ?? 0) > 40 ? "table" : "cards");

  // Track which rows are new (for the flash-in animation), then mark seen.
  const newIds = useMemo(() => {
    const ids = new Set<number>();
    for (const t of tables) for (const r of t.rows) if (!seenRows.current.has(r.id)) ids.add(r.id);
    return ids;
  }, [tables]);
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const t of tables) for (const r of t.rows) seenRows.current.add(r.id);
    }, 100);
    return () => clearTimeout(timer);
  }, [tables]);

  const exportXlsx = async (t: BobTable) => {
    const key = localStorage.getItem(KEY_STORAGE) || "";
    const res = await fetch(`${API}/tables/${t.id}/export`, { headers: { "X-Bob-Key": key } });
    if (!res.ok) return alert("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.name.replace(/[^a-z0-9 _-]/gi, "")}.xlsx`;
    // Anchor must be in the DOM for the click to trigger a download in all
    // browsers, and the object URL must NOT be revoked synchronously: doing so
    // races the download and aborts it (the "Export does nothing" bug). Defer
    // cleanup so the browser has started reading the blob first.
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <section
      className="shrink-0 bg-[#f4f0e8] flex flex-col min-w-0 relative"
      style={{ width: fullWidth ? "100%" : `${widthPct}%` }}
    >
      {/* Header */}
      <div className="h-12 shrink-0 border-b-2 border-neutral-900 bg-white flex items-center gap-2 px-3 overflow-x-auto">
        {tables.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveId(t.id); setDetailRow(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-colors ${
              active?.id === t.id
                ? "bg-violet-500 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900"
            }`}
          >
            {prettify(t.name)} <span className="opacity-70">· {t.rows.length}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <div className="flex items-center rounded-xl border-2 border-neutral-900 overflow-hidden mr-1">
            {([["cards", FiLayers, "Card view"], ["table", FiGrid, "Table view"]] as const).map(([v, Icon, label]) => (
              <button
                key={v}
                onClick={() => onViewPref(v as ResultsView)}
                title={label}
                className={`w-9 h-8 flex items-center justify-center transition-colors ${
                  view === v ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
          {active && (() => {
            const rows = active.rows;
            const enriching = rows.some((r) => contactStatus(r.cells) === "enriching");
            const pending = rows.filter((r) => !["found", "enriching"].includes(contactStatus(r.cells))).length;
            if (rows.length === 0) return null;
            return (
              <button
                onClick={() => onEnrichTable(active.id)}
                disabled={enriching || pending === 0}
                title={pending === 0 ? "Every row is enriched" : "Find phone + email for all remaining rows (paid)"}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-colors ${
                  enriching || pending === 0
                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                    : "bg-violet-500 text-white border-neutral-900 hover:bg-violet-600"
                }`}
              >
                {enriching
                  ? <><FiLoader size={13} className="animate-spin" /> Enriching…</>
                  : <><FiUsers size={13} /> Enrich all{pending > 0 ? ` (${pending})` : ""}</>}
              </button>
            );
          })()}
          {active && (
            <button
              onClick={() => exportXlsx(active)}
              title="Export to Excel"
              className="flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-violet-500 transition-colors"
            >
              <FiDownload size={13} /> Export
            </button>
          )}
          <button
            onClick={onExpand}
            title={expanded ? "Back to split view" : "Expand results"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            {expanded ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {active && view === "cards" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))" }}>
            {active.rows.map((r, idx) => (
              <CompanyCard
                key={r.id}
                row={r}
                index={idx}
                isNew={newIds.has(r.id)}
                onOpen={() => setDetailRow(r)}
                onStatus={(s) => onRowStatus(r.id, s)}
                onEnrich={() => onEnrichRow(r.id)}
                onDelete={() => onDeleteRow(r.id)}
              />
            ))}
          </div>
          {active.rows.length === 0 && (
            <p className="text-sm text-neutral-400 p-6 text-center">Results will appear here as Bob finds them.</p>
          )}
        </div>
      )}

      {active && view === "table" && (
        <DenseTable
          table={active}
          newIds={newIds}
          onRowClick={setDetailRow}
          onRowStatus={onRowStatus}
          onEnrich={onEnrichRow}
          onDelete={onDeleteRow}
        />
      )}

      {detailRow && active && (
        <RowDrawer
          row={active.rows.find((r) => r.id === detailRow.id) || detailRow}
          columns={orderColumns(active.columns)}
          onClose={() => setDetailRow(null)}
          onStatus={(s) => { onRowStatus(detailRow.id, s); setDetailRow({ ...detailRow, status: s }); }}
          onEnrich={() => onEnrichRow(detailRow.id)}
          onDelete={() => { onDeleteRow(detailRow.id); setDetailRow(null); }}
        />
      )}
    </section>
  );
}

// ── Contact reveal controls ──────────────────────────────────────────────────

// Contacts are revealed on demand. A row's status lives in _contact_status;
// legacy rows (pre-reveal) infer "found" from a populated phone/email.
function contactStatus(cells: Record<string, unknown>): string {
  const s = str(cells._contact_status);
  if (s) return s;
  return str(cells.contact_phone) || str(cells.contact_email) ? "found" : "pending";
}

function EnrichButton({ cells, onEnrich, size = "sm" }: {
  cells: Record<string, unknown>;
  onEnrich: () => void;
  size?: "sm" | "xs";
}) {
  const status = contactStatus(cells);
  const pad = size === "xs" ? "text-[10px] px-1.5 py-0.5 gap-0.5" : "text-[11px] px-2 py-1 gap-1";
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  if (status === "enriching")
    return (
      <span className={`inline-flex items-center font-bold rounded-lg bg-violet-50 text-violet-600 border border-violet-200 ${pad}`}>
        <FiLoader size={10} className="animate-spin" /> Enriching
      </span>
    );
  if (status === "found")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title="Contact found — click to re-run"
        className={`inline-flex items-center font-bold rounded-lg bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 ${pad}`}>
        <FiCheck size={10} /> Contact
      </button>
    );
  if (status === "not_found")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "No reachable contact found — click to retry"}
        className={`inline-flex items-center font-bold rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-300 hover:border-neutral-400 ${pad}`}>
        <FiSlash size={10} /> No contact
      </button>
    );
  if (status === "error")
    return (
      <button onClick={(e) => { stop(e); onEnrich(); }} title={str(cells._contact_note) || "Enrichment failed — retry"}
        className={`inline-flex items-center font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 ${pad}`}>
        Retry
      </button>
    );
  return (
    <button onClick={(e) => { stop(e); onEnrich(); }} title="Find phone + email for this company (paid)"
      className={`inline-flex items-center font-bold rounded-lg bg-violet-500 text-white border-2 border-neutral-900 hover:bg-violet-600 ${pad}`}>
      <FiUserPlus size={10} /> Enrich
    </button>
  );
}

function DeleteRowButton({ onDelete, size = 14 }: { onDelete: () => void; size?: number }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (confirm("Remove this row? The company is excluded from future runs in this chat."))
          onDelete();
      }}
      title="Remove row"
      className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-red-50 hover:text-red-600"
    >
      <FiX size={size} />
    </button>
  );
}

// ── Company card ─────────────────────────────────────────────────────────────

function CompanyCard({ row, index, isNew, onOpen, onStatus, onEnrich, onDelete }: {
  row: BobRow;
  index: number;
  isNew: boolean;
  onOpen: () => void;
  onStatus: (s: string) => void;
  onEnrich: () => void;
  onDelete: () => void;
}) {
  const c = row.cells;
  const company = str(c.company) || `Company ${index + 1}`;
  const website = str(c.website);
  const domain = website ? domainOf(website) : "";
  // LinkedIn/job-board URLs in the website field are not a real company site —
  // never use them for the favicon or a "website" chip.
  const websiteIsReal = !!domain && !NON_SITE_DOMAINS.test(domain);
  const meta = [str(c.city), str(c.size_band) !== "unknown" ? str(c.size_band) : ""].filter(Boolean).join(" · ");
  const what = str(c.what_they_do);
  const whyNow = str(c.why_now);
  const evidence = str(c.hiring_evidence);
  const evidenceUrls = extractUrls(str(c.evidence_url)).filter((u) => !/linkedin\.com\/in\//i.test(u)).slice(0, 2);
  const allLinkedin = extractUrls(str(c.contact_linkedin_url) + " " + str(c.linkedin_url));
  const profileUrl =
    allLinkedin.find((u) => /linkedin\.com\/in\//i.test(u)) ||
    extractUrls(str(c.evidence_url)).find((u) => /linkedin\.com\/in\//i.test(u));
  const companyPageUrl = allLinkedin.find((u) => /linkedin\.com\/(company|school)\//i.test(u));
  const contactName = str(c.contact_name);
  const contactTitle = str(c.contact_title);
  const contactPhone = str(c.contact_phone);
  const contactEmail = str(c.contact_email);
  const tier = str(c.tier).toUpperCase().replace(/[^T0-9]/g, "");
  const fit = parseFloat(str(c.fit_score));
  const funding = str(c.funding);

  return (
    <div
      onClick={onOpen}
      className={`bg-white border-2 border-neutral-900 rounded-2xl p-4 cursor-pointer shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all flex flex-col gap-2.5 ${isNew ? "bob-new" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        {websiteIsReal ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt=""
            className="w-9 h-9 rounded-lg border border-neutral-200 bg-neutral-50 p-1"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg border-2 border-neutral-900 bg-violet-100 flex items-center justify-center font-['Clash_Display'] text-[15px] font-semibold text-violet-700">
            {company.replace(/[^a-zA-Z0-9]/g, "")[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-['Clash_Display'] text-[17px] font-semibold leading-tight truncate">{company}</div>
          <div className="text-[11.5px] text-neutral-500 truncate">{meta || what || ""}</div>
        </div>
        {!isNaN(fit) && (
          <div
            title={`Fit score ${fit}${fit > 10 ? "/100" : "/10"}`}
            className={`shrink-0 min-w-9 h-9 px-1.5 rounded-xl border-2 border-neutral-900 flex items-center justify-center font-black text-sm ${
              (fit > 10 ? fit >= 80 : fit >= 8) ? "bg-green-300" : (fit > 10 ? fit >= 60 : fit >= 6) ? "bg-amber-200" : "bg-neutral-100"
            }`}
          >
            {fit}
          </div>
        )}
      </div>

      {/* Why now */}
      {(whyNow || evidence) && (
        <div className="border-l-[3px] border-violet-500 bg-violet-50/60 rounded-r-lg pl-2.5 pr-2 py-1.5">
          <p
            className="text-[12.5px] text-neutral-800 leading-snug overflow-hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {whyNow || evidence}
          </p>
        </div>
      )}

      {funding && (
        <p className="text-[11.5px] text-neutral-500 truncate">💰 {funding}</p>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
        {evidenceUrls.map((u, i) => (
          <LinkChip key={u} href={u} label={evidenceUrls.length > 1 ? `Evidence ${i + 1}` : "View evidence"} icon={<FiFileText size={11} />} />
        ))}
        {websiteIsReal && (
          <LinkChip
            href={/^https?:\/\//i.test(website) ? website : `https://${domain}`}
            label={domain}
            icon={<FiGlobe size={11} />}
          />
        )}
        {companyPageUrl && !evidenceUrls.includes(companyPageUrl) && (
          <LinkChip href={companyPageUrl} label="LinkedIn page" icon={<FiLinkedin size={11} className="text-[#0a66c2]" />} />
        )}
      </div>

      {/* Contact + status */}
      <div className="mt-auto pt-2 border-t border-neutral-100 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {contactName ? (
            <>
              <div className="w-7 h-7 shrink-0 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center text-[10px] font-black text-violet-700">
                {contactName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-bold truncate">{contactName}</div>
                <div className="text-[10.5px] text-neutral-500 truncate">{contactTitle || ""}</div>
              </div>
              {tier && <TierBadge tier={tier} />}
              {profileUrl && (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open LinkedIn profile"
                  className="w-7 h-7 shrink-0 rounded-lg border border-neutral-200 flex items-center justify-center text-[#0a66c2] hover:border-[#0a66c2] transition-colors"
                >
                  <FiLinkedin size={13} />
                </a>
              )}
            </>
          ) : (
            <EnrichButton cells={c} onEnrich={onEnrich} />
          )}
          <select
            value={row.status}
            onChange={(e) => onStatus(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={`shrink-0 text-[10.5px] font-bold rounded-lg px-1.5 py-1 border cursor-pointer ${STATUS_STYLE[row.status] || STATUS_STYLE.new}`}
          >
            {ROW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <DeleteRowButton onDelete={onDelete} />
        </div>
        {(contactPhone || contactEmail) && (
          <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
            {contactPhone && (
              <a href={`tel:${contactPhone}`} title="Call"
                className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg border border-neutral-200 px-2 py-1 text-neutral-700 hover:border-neutral-900">
                <FiPhone size={11} className="text-green-600" /> {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} title="Email"
                className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-lg border border-neutral-200 px-2 py-1 text-neutral-700 hover:border-neutral-900">
                <FiMail size={11} className="text-violet-600" /> {contactEmail}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const style = tier === "T1" ? "bg-green-100 text-green-800 border-green-300"
    : tier === "T2" ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-neutral-100 text-neutral-500 border-neutral-200";
  const hint = tier === "T1" ? "Named in the hiring evidence" : tier === "T2" ? "Right title, right city" : "Right title, city unconfirmed";
  return <span title={hint} className={`shrink-0 inline-block text-[10px] font-black border rounded-md px-1.5 py-0.5 ${style}`}>{tier}</span>;
}

// ── Dense table view ─────────────────────────────────────────────────────────

function DenseTable({ table, newIds, onRowClick, onRowStatus, onEnrich, onDelete }: {
  table: BobTable;
  newIds: Set<number>;
  onRowClick: (r: BobRow) => void;
  onRowStatus: (rowId: number, status: string) => void;
  onEnrich: (rowId: number) => void;
  onDelete: (rowId: number) => void;
}) {
  // The reveal drives its own Contact column; hide the raw contact_* cells so
  // they don't duplicate it (they render inside the drawer instead).
  const HIDE = new Set(["company", "contact_name", "contact_title", "contact_phone",
    "contact_email", "contact_linkedin_url", "tier"]);
  const cols = orderColumns(table.columns);
  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="text-[12.5px] border-collapse w-full">
        <thead className="sticky top-0 z-20">
          <tr className="bg-[#faf7f2]">
            <th className="sticky left-0 z-30 bg-[#faf7f2] px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Company</th>
            <th className="px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Contact</th>
            {cols.filter((c) => !HIDE.has(c.key)).map((c) => (
              <th key={c.key} className={`px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap ${WIDE_KEYS.has(c.key) ? "min-w-[240px]" : ""}`}>
                {prettify(c.label || c.key)}
              </th>
            ))}
            <th className="px-3 py-2.5 text-left font-bold text-neutral-500 border-b-2 border-neutral-900 whitespace-nowrap">Status</th>
            <th className="px-2 py-2.5 border-b-2 border-neutral-900" />
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, idx) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r)}
              className={`border-b border-neutral-100 align-top cursor-pointer transition-colors hover:bg-violet-50 ${idx % 2 ? "bg-neutral-50/50" : "bg-white"} ${newIds.has(r.id) ? "bob-new" : ""}`}
            >
              <td className="sticky left-0 z-10 px-3 py-2.5 font-bold whitespace-nowrap bg-inherit border-r border-neutral-100">
                <span className="inline-flex items-center gap-2">
                  <span className="w-5 text-right text-[10px] font-normal text-neutral-300">{idx + 1}</span>
                  {str(r.cells.company)}
                </span>
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {str(r.cells.contact_name) ? (
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold truncate max-w-[180px]">{str(r.cells.contact_name)}</div>
                    <div className="flex items-center gap-2 text-[10.5px] text-neutral-500">
                      {str(r.cells.contact_phone) && (
                        <a href={`tel:${str(r.cells.contact_phone)}`} className="inline-flex items-center gap-0.5 hover:text-neutral-900">
                          <FiPhone size={9} className="text-green-600" /> {str(r.cells.contact_phone)}
                        </a>
                      )}
                      {str(r.cells.contact_email) && (
                        <a href={`mailto:${str(r.cells.contact_email)}`} className="inline-flex items-center gap-0.5 hover:text-neutral-900 truncate max-w-[150px]">
                          <FiMail size={9} className="text-violet-600" /> {str(r.cells.contact_email)}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <EnrichButton cells={r.cells} onEnrich={() => onEnrich(r.id)} size="xs" />
                )}
              </td>
              {cols.filter((c) => !HIDE.has(c.key)).map((c) => (
                <td key={c.key} className={`px-3 py-2.5 ${WIDE_KEYS.has(c.key) ? "min-w-[240px] max-w-[340px]" : "max-w-[200px]"}`}>
                  <Cell colKey={c.key} value={r.cells[c.key]} />
                </td>
              ))}
              <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                <select
                  value={r.status}
                  onChange={(e) => onRowStatus(r.id, e.target.value)}
                  className={`text-[11px] font-bold rounded-lg px-1.5 py-1 border cursor-pointer ${STATUS_STYLE[r.status] || STATUS_STYLE.new}`}
                >
                  {ROW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                <DeleteRowButton onDelete={() => onDelete(r.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {table.rows.length === 0 && (
        <p className="text-sm text-neutral-400 p-6 text-center">Rows will appear here as Bob finds them.</p>
      )}
    </div>
  );
}

// ── Smart cells ──────────────────────────────────────────────────────────────

function LinkChip({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 max-w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:border-violet-400 hover:text-violet-700 transition-colors whitespace-nowrap"
    >
      {icon}
      <span className="truncate max-w-[130px]">{label}</span>
      <FiExternalLink size={10} className="shrink-0 opacity-60" />
    </a>
  );
}

function Cell({ colKey, value }: { colKey: string; value: unknown }) {
  const s = str(value);
  if (!s) return <span className="text-neutral-300">-</span>;

  if (colKey === "tier") {
    const t = s.toUpperCase().replace(/[^T0-9]/g, "");
    return <TierBadge tier={t || s.slice(0, 4)} />;
  }

  if (colKey === "fit_score") {
    const n = parseFloat(s);
    if (!isNaN(n)) {
      const style = n >= 8 ? "bg-green-100 text-green-800" : n >= 6 ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-500";
      return <span className={`inline-block text-[11px] font-black rounded-md px-1.5 py-0.5 ${style}`}>{n}</span>;
    }
  }

  if (colKey === "website") {
    const domain = domainOf(s);
    const href = /^https?:\/\//i.test(s) ? extractUrls(s)[0] || `https://${domain}` : `https://${domain}`;
    if (NON_SITE_DOMAINS.test(domain)) {
      const isLi = /linkedin\.com/i.test(domain);
      return (
        <LinkChip
          href={href}
          label={isLi ? "LinkedIn page" : domain}
          icon={isLi ? <FiLinkedin size={11} className="text-[#0a66c2]" /> : <FiFileText size={11} />}
        />
      );
    }
    return (
      <LinkChip
        href={href}
        label={domain}
        icon={<img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" className="w-3.5 h-3.5 rounded-sm" />}
      />
    );
  }

  const urls = extractUrls(s);
  if (urls.length > 0) {
    return (
      <span className="flex flex-wrap gap-1">
        {urls.slice(0, 3).map((u, i) => {
          const isLi = /linkedin\.com/i.test(u);
          const label = colKey.includes("evidence")
            ? (urls.length > 1 ? `Link ${i + 1}` : "View evidence")
            : isLi ? "LinkedIn" : domainOf(u);
          return (
            <LinkChip
              key={u + i}
              href={u}
              label={label}
              icon={isLi ? <FiLinkedin size={11} className="text-[#0a66c2]" /> : <FiFileText size={11} />}
            />
          );
        })}
      </span>
    );
  }

  return (
    <span
      className="block overflow-hidden text-neutral-800 leading-snug"
      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
      title={s.length > 80 ? s : undefined}
    >
      {s}
    </span>
  );
}

// ── Row dossier drawer ───────────────────────────────────────────────────────

const CONTACT_KEYS = ["contact_name", "contact_title", "contact_phone", "contact_email", "tier", "linkedin_url", "contact_linkedin_url"];
const EVIDENCE_KEYS = ["hiring_evidence", "evidence_url", "why_now", "signal_rationale"];
const COMPANY_KEYS = ["website", "city", "size_band", "what_they_do", "funding", "fit_score"];

function RowDrawer({ row, columns, onClose, onStatus, onEnrich, onDelete }: {
  row: BobRow;
  columns: BobColumn[];
  onClose: () => void;
  onStatus: (s: string) => void;
  onEnrich: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const company = str(row.cells.company) || "Details";

  const copy = (key: string, v: string) => {
    navigator.clipboard?.writeText(v);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const sections: [string, BobColumn[]][] = [
    ["Contact", columns.filter((c) => CONTACT_KEYS.includes(c.key))],
    ["Evidence", columns.filter((c) => EVIDENCE_KEYS.includes(c.key))],
    ["Company", columns.filter((c) => COMPANY_KEYS.includes(c.key))],
    ["More", columns.filter((c) => c.key !== "company" && !CONTACT_KEYS.includes(c.key) && !EVIDENCE_KEYS.includes(c.key) && !COMPANY_KEYS.includes(c.key))],
  ];

  return (
    <>
      <div className="absolute inset-0 bg-neutral-900/20 z-30" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-[440px] bg-white border-l-2 border-neutral-900 z-40 flex flex-col bob-pop">
        <div className="p-4 border-b-2 border-neutral-900 flex items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-['Clash_Display'] text-xl font-semibold truncate">{company}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <select
                value={row.status}
                onChange={(e) => onStatus(e.target.value)}
                className={`text-[11px] font-bold rounded-lg px-1.5 py-1 border cursor-pointer ${STATUS_STYLE[row.status] || STATUS_STYLE.new}`}
              >
                {ROW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <EnrichButton cells={row.cells} onEnrich={onEnrich} />
              <button
                onClick={onDelete}
                title="Remove this company from the table"
                className="text-[11px] font-bold px-2 py-1 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600"
              >
                <FiTrash2 size={11} className="inline" />
              </button>
            </div>
            {contactStatus(row.cells) === "not_found" && str(row.cells._contact_note) && (
              <p className="text-[11px] text-neutral-500 mt-1.5">{str(row.cells._contact_note)}</p>
            )}
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
            <FiX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {sections.map(([title, cols]) => {
            const visible = cols.filter((c) => str(row.cells[c.key]) !== "");
            if (visible.length === 0) return null;
            return (
              <div key={title}>
                <div className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-2">{title}</div>
                <div className="space-y-3 bg-neutral-50/70 border border-neutral-200 rounded-xl p-3">
                  {visible.map((c) => {
                    const s = str(row.cells[c.key]);
                    const urls = extractUrls(s);
                    return (
                      <div key={c.key} className="group">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-0.5 flex items-center gap-2">
                          {prettify(c.label || c.key)}
                          {urls.length === 0 && (
                            <button
                              onClick={() => copy(c.key, s)}
                              className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-violet-600"
                              title="Copy"
                            >
                              {copied === c.key ? <FiCheck size={11} className="text-green-600" /> : <FiCopy size={11} />}
                            </button>
                          )}
                        </div>
                        {urls.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {urls.map((u, i) => (
                              <LinkChip
                                key={u + i}
                                href={u}
                                label={/linkedin\.com/i.test(u) ? "LinkedIn" : domainOf(u)}
                                icon={/linkedin\.com/i.test(u) ? <FiLinkedin size={11} className="text-[#0a66c2]" /> : <FiFileText size={11} />}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{s}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
