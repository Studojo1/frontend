import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  FiArrowLeft, FiCheck, FiCornerDownLeft, FiExternalLink, FiLinkedin,
  FiMessageCircle, FiRefreshCw, FiSearch, FiUser,
} from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { outreachFetch } from "~/lib/outreach/api";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";

interface InboxConversation {
  request_id: number;
  name: string;
  headline?: string;
  company?: string;
  profile_url?: string;
  profile_image_url?: string;
  status: string;
  accepted_at?: string;
  followup_sent_at?: string;
  followup_message?: string;
  reply_text?: string;
  reply_sentiment?: string;
  reply_received_at?: string;
  last_activity_at?: string;
}

interface InboxMessage {
  direction: "in" | "out";
  text: string;
  sent_at?: string;
}

interface InboxThread {
  request_id: number;
  name: string;
  profile_url?: string;
  messages: InboxMessage[];
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  accepted:      { label: "Connected",       cls: "bg-studojo-green-bg text-studojo-green border-studojo-green/30" },
  followup_sent: { label: "Follow-up sent",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
  replied:       { label: "Replied",         cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

const SENTIMENT_BADGE: Record<string, string> = {
  positive: "🙂 positive",
  neutral:  "😐 neutral",
  negative: "🙁 negative",
};

function relTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function InboxPage() {
  const navigate = useNavigate();
  const { loading: authLoading } = useOutreachAuth();
  const { linkedInCampaignId } = useOutreachStore();

  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [thread, setThread] = useState<InboxThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "replies">("all");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!linkedInCampaignId) return;
    try {
      const data = await outreachFetch<InboxConversation[]>(
        `/linkedin/automation/campaigns/${linkedInCampaignId}/inbox?only_replies=${filter === "replies"}&limit=300`,
      );
      setConversations(data || []);
      setError("");
    } catch (err: any) {
      setError(err?.body?.detail || "Couldn't load conversations");
    } finally {
      setLoading(false);
    }
  }, [linkedInCampaignId, filter]);

  useEffect(() => {
    if (!linkedInCampaignId) return;
    setLoading(true);
    fetchConversations();
    const id = setInterval(fetchConversations, 30000);
    return () => clearInterval(id);
  }, [linkedInCampaignId, fetchConversations]);

  // Auto-select first conversation when list loads
  useEffect(() => {
    if (activeRequestId === null && conversations.length > 0) {
      setActiveRequestId(conversations[0].request_id);
    }
  }, [conversations, activeRequestId]);

  const fetchThread = useCallback(async (requestId: number) => {
    if (!linkedInCampaignId) return;
    setThreadLoading(true);
    setSendError("");
    setSendSuccess(false);
    try {
      const data = await outreachFetch<InboxThread>(
        `/linkedin/automation/campaigns/${linkedInCampaignId}/inbox/${requestId}`,
      );
      setThread(data);
    } catch (err: any) {
      setError(err?.body?.detail || "Couldn't load thread");
    } finally {
      setThreadLoading(false);
    }
  }, [linkedInCampaignId]);

  useEffect(() => {
    if (activeRequestId !== null) fetchThread(activeRequestId);
  }, [activeRequestId, fetchThread]);

  const handleSendReply = async () => {
    if (!linkedInCampaignId || !activeRequestId || !reply.trim() || sending) return;
    setSending(true);
    setSendError("");
    setSendSuccess(false);
    try {
      await outreachFetch(
        `/linkedin/automation/campaigns/${linkedInCampaignId}/inbox/${activeRequestId}/reply`,
        { method: "POST", body: JSON.stringify({ text: reply.trim() }), timeout: 120_000, maxRetries: 1 },
      );
      setReply("");
      setSendSuccess(true);
      // Refresh thread + conversation list to reflect new message
      fetchThread(activeRequestId);
      fetchConversations();
    } catch (err: any) {
      setSendError(err?.body?.detail || err?.message || "Couldn't send reply");
    } finally {
      setSending(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) =>
      c.name.toLowerCase().includes(term)
      || (c.company || "").toLowerCase().includes(term)
      || (c.headline || "").toLowerCase().includes(term)
      || (c.reply_text || "").toLowerCase().includes(term),
    );
  }, [conversations, search]);

  const activeConv = useMemo(
    () => conversations.find((c) => c.request_id === activeRequestId) || null,
    [conversations, activeRequestId],
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!linkedInCampaignId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <FiMessageCircle className="w-12 h-12 text-studojo-muted mx-auto mb-4" />
          <h1 className="font-clash text-2xl font-bold mb-2">No LinkedIn campaign yet</h1>
          <p className="text-sm text-studojo-muted font-satoshi mb-6">
            Connect LinkedIn first to start receiving conversations here.
          </p>
          <button
            onClick={() => navigate("/outreach/connect/linkedin")}
            className="h-11 px-6 rounded-2xl bg-studojo-purple text-white font-satoshi font-bold border-2 border-studojo-ink shadow-brutal"
          >
            Connect LinkedIn
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/outreach/campaign/dashboard")}
              className="h-9 w-9 rounded-xl border-2 border-studojo-ink bg-white flex items-center justify-center shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              aria-label="Back to dashboard"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-clash text-2xl font-bold text-studojo-ink flex items-center gap-2">
                <FiMessageCircle className="w-6 h-6 text-studojo-purple" /> Inbox
              </h1>
              <p className="text-xs text-studojo-muted font-satoshi mt-0.5">
                LinkedIn conversations from your outreach. Replies appear here as people respond.
              </p>
            </div>
          </div>
          <button
            onClick={fetchConversations}
            disabled={loading}
            className="h-9 px-3 rounded-xl border-2 border-studojo-ink bg-white text-sm font-satoshi font-medium shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all inline-flex items-center gap-2 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 mb-6">
            <p className="text-red-600 font-satoshi text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4 min-h-[600px]">
          {/* ── Conversation list ── */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal flex flex-col overflow-hidden">
            <div className="p-3 border-b-2 border-studojo-ink/10 space-y-3">
              <div className="flex gap-1 p-1 rounded-xl border border-studojo-ink/10 bg-studojo-surface-muted">
                <button
                  onClick={() => setFilter("all")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-satoshi transition-all ${
                    filter === "all" ? "bg-white text-studojo-purple shadow-sm" : "text-studojo-muted"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("replies")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-satoshi transition-all ${
                    filter === "replies" ? "bg-white text-studojo-purple shadow-sm" : "text-studojo-muted"
                  }`}
                >
                  Replies only
                </button>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studojo-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, company, reply"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:border-studojo-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
              {loading && conversations.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FiMessageCircle className="w-8 h-8 text-studojo-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-studojo-muted font-satoshi">
                    {filter === "replies" ? "No replies yet" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-studojo-ink/5">
                  {filtered.map((c) => {
                    const active = c.request_id === activeRequestId;
                    const lastMsg = c.reply_text || c.followup_message || "Connection accepted";
                    return (
                      <li key={c.request_id}>
                        <button
                          onClick={() => setActiveRequestId(c.request_id)}
                          className={`w-full text-left px-3 py-3 flex gap-3 transition-colors ${
                            active ? "bg-studojo-purple-bg" : "hover:bg-studojo-surface-muted"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-studojo-ink text-white flex items-center justify-center text-xs font-bold font-clash flex-shrink-0">
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold font-satoshi text-sm text-studojo-ink truncate">{c.name}</p>
                              <span className="text-[10px] text-studojo-muted font-satoshi flex-shrink-0">
                                {relTime(c.last_activity_at)}
                              </span>
                            </div>
                            {c.company && (
                              <p className="text-xs text-studojo-muted font-satoshi truncate">{c.company}</p>
                            )}
                            <p className="text-xs text-studojo-muted font-satoshi mt-1 line-clamp-1">
                              {c.status === "replied" && c.reply_text ? <span className="font-bold text-studojo-ink">↩ </span> : null}
                              {lastMsg}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── Thread view ── */}
          <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal flex flex-col overflow-hidden">
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center text-studojo-muted font-satoshi text-sm">
                Select a conversation
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b-2 border-studojo-ink/10 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-studojo-ink text-white flex items-center justify-center text-sm font-bold font-clash flex-shrink-0">
                      {initials(activeConv.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold font-clash text-base text-studojo-ink truncate">{activeConv.name}</p>
                      {activeConv.headline && (
                        <p className="text-xs text-studojo-muted font-satoshi truncate">{activeConv.headline}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {STATUS_BADGE[activeConv.status] && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-satoshi font-medium border ${STATUS_BADGE[activeConv.status].cls}`}>
                            {STATUS_BADGE[activeConv.status].label}
                          </span>
                        )}
                        {activeConv.reply_sentiment && SENTIMENT_BADGE[activeConv.reply_sentiment] && (
                          <span className="text-[10px] font-satoshi text-studojo-muted">
                            {SENTIMENT_BADGE[activeConv.reply_sentiment]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {activeConv.profile_url && (
                    <a
                      href={activeConv.profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-studojo-purple font-satoshi font-bold inline-flex items-center gap-1 flex-shrink-0"
                    >
                      LinkedIn <FiExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[55vh]">
                  {threadLoading && !thread ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-3 border-studojo-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : thread && thread.messages.length === 0 ? (
                    <p className="text-center text-sm text-studojo-muted font-satoshi py-8">
                      No messages yet — say hi.
                    </p>
                  ) : (
                    thread?.messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            m.direction === "out"
                              ? "bg-studojo-purple text-white"
                              : "bg-studojo-surface-muted text-studojo-ink border border-studojo-ink/10"
                          }`}
                        >
                          <p className="text-sm font-satoshi whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          {m.sent_at && (
                            <p className={`text-[10px] font-satoshi mt-1 ${m.direction === "out" ? "text-white/70" : "text-studojo-muted"}`}>
                              {relTime(m.sent_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply input */}
                <div className="border-t-2 border-studojo-ink/10 p-3 space-y-2">
                  {sendSuccess && (
                    <div className="flex items-center gap-2 text-xs text-studojo-green font-satoshi">
                      <FiCheck className="w-3.5 h-3.5" /> Message sent
                    </div>
                  )}
                  {sendError && (
                    <p className="text-xs text-red-600 font-satoshi">{sendError}</p>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Type a reply… (⌘/Ctrl+Enter to send)"
                      rows={2}
                      className="flex-1 border-2 border-studojo-ink/20 rounded-xl px-3 py-2 text-sm font-satoshi resize-none focus:border-studojo-ink focus:outline-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!reply.trim() || sending}
                      className="h-11 px-4 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-bold border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1.5"
                    >
                      {sending
                        ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <FiCornerDownLeft className="w-3.5 h-3.5" />
                      }
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
