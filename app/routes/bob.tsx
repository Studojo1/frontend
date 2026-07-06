import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiPlus, FiTrash2, FiSend, FiDownload, FiLock, FiZap, FiSearch,
  FiFileText, FiGrid, FiLoader, FiExternalLink, FiChevronRight,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// Bob — placement intelligence workspace (shared-login, access-code gated).
// Chat on the left/centre, stateful result tables on the right.
// Backend: /api/v1/outreach/bob/* (ingress rewrites to job-outreach /api/v1/bob/*)
// ─────────────────────────────────────────────────────────────────────────────

export function meta() {
  return [
    { title: "Bob | Studojo Intelligence" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

const API = "/api/v1/outreach/bob";
const KEY_STORAGE = "bob_access_key";

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
interface Message { id: number; role: string; content: string; created_at: string }
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
  new: "bg-neutral-100 text-neutral-700",
  contacted: "bg-blue-100 text-blue-800",
  replied: "bg-green-100 text-green-800",
  meeting: "bg-violet-100 text-violet-800",
  dead: "bg-neutral-200 text-neutral-500 line-through",
};

// ── Root component ───────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8">
        <div className="w-12 h-12 bg-violet-500 border-2 border-neutral-900 rounded-2xl flex items-center justify-center mb-5">
          <FiLock className="text-white text-xl" />
        </div>
        <h1 className="font-['Clash_Display'] text-3xl font-semibold text-neutral-900">Bob</h1>
        <p className="font-['Satoshi'] text-neutral-600 mt-2 mb-6">
          Placement intelligence for your team. Enter your workspace access code.
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Access code"
          className="w-full border-2 border-neutral-900 rounded-2xl px-4 py-3 font-['Satoshi'] focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {error && <p className="text-red-600 font-['Satoshi'] text-sm mt-2">{error}</p>}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full bg-violet-500 text-white font-['Satoshi'] font-bold py-3 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-60"
        >
          {busy ? "Checking..." : "Enter workspace"}
        </button>
      </div>
    </div>
  );
}

// ── Workspace ────────────────────────────────────────────────────────────────

function Workspace({ onAuthLost }: { onAuthLost: () => void }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tables, setTables] = useState<BobTable[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    try {
      const d = await bobFetch<any>(`/chats/${id}`);
      setMessages(d.messages);
      setTables(d.tables || []);
      if (d.latest_run && d.latest_run.status === "running") {
        setRun(d.latest_run);
      }
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

  // Poll the active run while it's running.
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

  const newChat = async () => {
    try {
      const d = await bobFetch<{ id: number }>("/chats", { method: "POST" });
      await loadChats();
      setMessages([]);
      setTables([]);
      setRun(null);
      setActiveChat(d.id);
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

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
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

  const running = run?.status === "running";

  return (
    <div className="h-screen bg-[#faf7f2] flex overflow-hidden font-['Satoshi']">
      {/* ── Left: chats ── */}
      <aside className="w-64 shrink-0 border-r-2 border-neutral-900 bg-white flex flex-col">
        <div className="p-4 border-b-2 border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-500 border-2 border-neutral-900 rounded-xl flex items-center justify-center">
              <FiZap className="text-white text-sm" />
            </div>
            <span className="font-['Clash_Display'] text-xl font-semibold">Bob</span>
          </div>
          <button
            onClick={newChat}
            title="New chat"
            className="w-8 h-8 bg-neutral-900 text-white rounded-xl flex items-center justify-center hover:bg-violet-500 transition-colors"
          >
            <FiPlus />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chats.map((c) => (
            <div
              key={c.id}
              onClick={() => openChat(c.id)}
              className={`group flex items-center justify-between gap-1 px-3 py-2.5 mb-1 rounded-xl cursor-pointer text-sm ${
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
          {chats.length === 0 && (
            <p className="text-neutral-400 text-sm p-3">No chats yet. Ask Bob anything about companies, hiring, or your candidates.</p>
          )}
        </div>
        <div className="p-3 border-t-2 border-neutral-900 text-[11px] text-neutral-500">
          Shared team workspace. Everyone sees all chats.
        </div>
      </aside>

      {/* ── Centre: conversation ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 && !running && (
            <div className="max-w-xl mx-auto mt-16 text-center">
              <h2 className="font-['Clash_Display'] text-3xl font-semibold text-neutral-900">
                What are we placing today?
              </h2>
              <p className="text-neutral-600 mt-3 mb-8">
                Describe a candidate, a cohort, or the companies you want. Bob researches live evidence and builds your target table on the right.
              </p>
              <div className="grid gap-3 text-left">
                {[
                  "Find 10 Bangalore startups hiring MERN developers right now, with the right HR contact for each",
                  "I have 40 technical support reps graduating in 3 weeks. Which companies can absorb them at mass?",
                  "Which fintech startups raised funding in the last 6 months and are building sales teams?",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="bg-white border-2 border-neutral-900 rounded-2xl px-4 py-3 text-sm text-left shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
                  >
                    <FiChevronRight className="inline mr-1 text-violet-500" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl border-2 border-neutral-900 whitespace-pre-wrap text-[15px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-violet-500 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                      : "bg-white text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {running && run && <RunProgress run={run} />}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t-2 border-neutral-900 bg-white p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              rows={2}
              placeholder={running ? "Bob is working. You can send the next message when he finishes." : "Describe a candidate, cohort, or the companies you need..."}
              disabled={running}
              className="flex-1 border-2 border-neutral-900 rounded-2xl px-4 py-3 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-neutral-100"
            />
            <button
              onClick={send}
              disabled={running || sending || !input.trim()}
              className="self-end bg-neutral-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-neutral-900 hover:bg-violet-500 transition-colors disabled:opacity-40"
            >
              {sending || running ? <FiLoader className="animate-spin" /> : <FiSend />}
            </button>
          </div>
        </div>
      </main>

      {/* ── Right: tables ── */}
      <TablesPanel tables={tables} onRowStatus={async (rowId, status) => {
        try {
          await bobFetch(`/rows/${rowId}`, { method: "PATCH", body: JSON.stringify({ status }) });
          setTables((ts) => ts.map((t) => ({
            ...t,
            rows: t.rows.map((r) => (r.id === rowId ? { ...r, status } : r)),
          })));
        } catch (e) { handleError(e); }
      }} />
    </div>
  );
}

// ── Run progress (the "analyst at work" feed) ────────────────────────────────

function RunProgress({ run }: { run: Run }) {
  const events = run.events || [];
  const recent = events.slice(-7);
  const c = run.counters || {};
  return (
    <div className="bg-white border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <FiLoader className="animate-spin text-violet-500" />
        <span className="font-bold text-sm">Bob is researching</span>
        <span className="ml-auto flex gap-2 text-[11px] text-neutral-500">
          {c.searches ? <span className="bg-neutral-100 rounded-full px-2 py-0.5">{c.searches} searches</span> : null}
          {c.rows_added ? <span className="bg-violet-100 rounded-full px-2 py-0.5">{c.rows_added} rows</span> : null}
          {run.credits_used ? <span className="bg-neutral-100 rounded-full px-2 py-0.5">{run.credits_used} credits</span> : null}
        </span>
      </div>
      <div className="space-y-1.5">
        {recent.map((ev, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px] text-neutral-700">
            <span className="mt-0.5 text-violet-500 shrink-0">
              {ev.type === "search" || ev.type === "search_done" ? <FiSearch size={13} /> :
               ev.type === "scrape" ? <FiFileText size={13} /> :
               ev.type === "table" || ev.type === "rows" ? <FiGrid size={13} /> : <FiZap size={13} />}
            </span>
            <span className={i === recent.length - 1 ? "font-semibold" : ""}>{ev.label}</span>
          </div>
        ))}
        {recent.length === 0 && <p className="text-[13px] text-neutral-500">Planning the research...</p>}
      </div>
      <p className="text-[11px] text-neutral-400 mt-3">
        Deep research can take a few minutes. Rows appear in the right panel as Bob finds them.
      </p>
    </div>
  );
}

// ── Tables panel ─────────────────────────────────────────────────────────────

function TablesPanel({ tables, onRowStatus }: {
  tables: BobTable[];
  onRowStatus: (rowId: number, status: string) => void;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = tables.find((t) => t.id === activeId) || tables[tables.length - 1] || null;

  const exportXlsx = async (t: BobTable) => {
    const key = localStorage.getItem(KEY_STORAGE) || "";
    const res = await fetch(`${API}/tables/${t.id}/export`, { headers: { "X-Bob-Key": key } });
    if (!res.ok) return alert("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.name.replace(/[^a-z0-9 _-]/gi, "")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (tables.length === 0) {
    return (
      <aside className="w-[38%] shrink-0 border-l-2 border-neutral-900 bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 bg-neutral-100 border-2 border-neutral-900 rounded-2xl flex items-center justify-center mb-4">
          <FiGrid className="text-2xl text-neutral-400" />
        </div>
        <h3 className="font-['Clash_Display'] text-xl font-semibold">Results land here</h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-xs">
          When Bob finds companies and contacts, they stream into a live table you can work, track, and export.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-[38%] shrink-0 border-l-2 border-neutral-900 bg-white flex flex-col min-w-0">
      {/* Table tabs + actions */}
      <div className="border-b-2 border-neutral-900 p-3 flex items-center gap-2 overflow-x-auto">
        {tables.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border-2 ${
              active?.id === t.id
                ? "bg-violet-500 text-white border-neutral-900"
                : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
            }`}
          >
            {t.name} <span className="opacity-70">({t.rows.length})</span>
          </button>
        ))}
        {active && (
          <button
            onClick={() => exportXlsx(active)}
            title="Export to Excel"
            className="ml-auto shrink-0 flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-violet-500 transition-colors"
          >
            <FiDownload size={13} /> Export
          </button>
        )}
      </div>

      {/* Grid */}
      {active && (
        <div className="flex-1 overflow-auto">
          <table className="text-[12px] border-collapse min-w-full">
            <thead className="sticky top-0 bg-neutral-900 text-white z-10">
              <tr>
                <th className="px-2 py-2 text-left font-bold whitespace-nowrap">#</th>
                {active.columns.map((c) => (
                  <th key={c.key} className="px-2 py-2 text-left font-bold whitespace-nowrap">{c.label}</th>
                ))}
                <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Status</th>
                <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Contact</th>
              </tr>
            </thead>
            <tbody>
              {active.rows.map((r, idx) => (
                <tr key={r.id} className="border-b border-neutral-200 align-top hover:bg-violet-50">
                  <td className="px-2 py-2 text-neutral-400">{idx + 1}</td>
                  {active.columns.map((c) => (
                    <td key={c.key} className="px-2 py-2 max-w-[220px]">
                      <CellValue value={r.cells[c.key]} />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <select
                      value={r.status}
                      onChange={(e) => onRowStatus(r.id, e.target.value)}
                      className={`text-[11px] font-bold rounded-lg px-1.5 py-1 border border-neutral-300 ${STATUS_STYLE[r.status] || ""}`}
                    >
                      {ROW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      disabled
                      title="Contact enrichment is coming soon"
                      className="text-[11px] font-bold px-2 py-1 rounded-lg bg-neutral-100 text-neutral-400 cursor-not-allowed whitespace-nowrap"
                    >
                      Enrich
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </aside>
  );
}

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-neutral-300">-</span>;
  }
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^https?:\/\//i.test(s)) {
    return (
      <a href={s} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline inline-flex items-center gap-1 break-all">
        {s.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
        <FiExternalLink size={11} className="shrink-0" />
      </a>
    );
  }
  return <span className="break-words">{s.length > 400 ? s.slice(0, 400) + "..." : s}</span>;
}
