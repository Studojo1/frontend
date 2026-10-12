// Wire contract for the student desk (agent chat plus workspace), Phase 1.
//
// Mirror of job-outreach-svc services/agent/schemas.py. The source of truth is
// the lead's contract (real_build/contract.md). Owned by the lead: builders
// import from here and never edit it; ask the coordinator for a change.
//
// Base URL in the browser: /api/v1/outreach/agent (the ingress rewrites it to
// /api/v1/agent on job-outreach-svc). Auth is the session cookie.
// Timestamps are naive UTC ISO strings ("2026-10-12T11:02:10"): append "Z"
// before handing them to Date.
// Phase 1 never sends email: `sent` and `sending_enabled` are always false.

// ------------------------------------------------------------------ vocabulary

export type StatusWord = "needs_you" | "scheduled" | "sent" | "replied" | "failed" | "skipped";
export const STATUS_WORDS: readonly StatusWord[] = [
  "needs_you", "scheduled", "sent", "replied", "failed", "skipped",
];
export type DraftStatus =
  | "drafting" | "needs_review" | "approved" | "skipped" | "failed"
  | "discarded" | "superseded" | "sent";
export type MatchState = "new" | "drafted" | "contacted" | "skipped";
export type SignalStrength = "high" | "medium" | "low";
export type DraftStyle = "warm_intro" | "value_prop" | "company_curiosity" | "peer_to_peer" | "direct_ask";
export type MemoryScope = "everywhere" | "emails" | "matching" | "company";
export type DeskRoute = "home" | "people" | "inbox" | "profile" | "settings" | "outreach";
export type InvalidateKey =
  | "status" | "matches" | "outreach" | "replies" | "profile" | "memories" | "settings" | "threads";
export type RunStatus = "running" | "done" | "error" | "cancelled" | "limit";
export type StreamErrorCode = "internal" | "model_unavailable" | "content_filter" | "interrupted";
export type ReplyGroup = "positive" | "question" | "not_now" | "bounced";
export type Sentiment = "positive" | "negative" | "neutral";
export type AccountState =
  | "needs_resume" | "needs_profile" | "not_paid" | "connect_gmail"
  | "launch_ready" | "launch_draft" | "campaign_active";
export type ConfirmationStatus = "pending" | "approved" | "declined" | "expired" | "failed";
export type AgentErrorCode =
  | "agent_disabled" | "agent_not_enabled" | "not_found" | "run_in_progress" | "duplicate_turn"
  | "daily_limit" | "draft_limit" | "busy" | "wrong_state" | "version_conflict" | "invalid";

/** "d_88" is an agent draft, "e_4512" is a campaign email (Touch 1). */
export type OutreachId = string;
export const OUTREACH_ID_RE = /^[de]_[1-9][0-9]*$/;
export type IsoTime = string;

// ------------------------------------------------------------------ errors

export interface AgentErrorDetail {
  code: AgentErrorCode;
  message: string;
  run_id?: number | null;
  limit?: string | null;
  resets_at?: IsoTime | null;
  current?: OutreachDetail | null;
}
export interface AgentErrorResponse { detail: AgentErrorDetail }

// ------------------------------------------------------------------ matches

export interface LeadRef {
  id: number; name: string; title: string | null; company: string | null; company_domain: string | null;
}
export interface Why {
  headline: string | null; bullets: string[]; signal_strength: SignalStrength | null; source: "ai" | "score";
}
export interface CompanyFacts {
  summary: string | null; what_they_build: string | null; core_tech: string[];
  primary_market: string | null; recent_momentum: string | null; hiring_signal: string | null;
}
export interface MatchCard {
  lead_id: number; name: string; title: string | null; company: string | null;
  company_domain: string | null; city: string | null;
  score: number | null; reason: string | null; signal_strength: SignalStrength | null;
  strong: boolean; has_address: boolean; state: MatchState; outreach_id: OutreachId | null;
}
export interface MatchDetail extends MatchCard {
  industry: string | null; company_size: string | null; linkedin_url: string | null;
  why: Why; company_facts: CompanyFacts | null; outreach: OutreachRow[];
}
export interface MatchList { items: MatchCard[]; total: number; strong_total: number; offset: number; limit: number }

// ------------------------------------------------------------------ outreach

export interface Followup { number: number; status: string; scheduled_at: IsoTime | null; sent_at: IsoTime | null }
export interface OutreachRow {
  id: OutreachId; kind: "draft" | "email"; lead: LeadRef;
  subject: string; preview: string;
  status_word: StatusWord; server_status: string; note: string; busy: boolean;
  when: IsoTime | null; version: number | null; followups: Followup[];
}
export interface Counts {
  all: number; needs_you: number; scheduled: number; sent: number; replied: number; failed: number; skipped: number;
}
export interface OutreachList { items: OutreachRow[]; counts: Counts; total: number; offset: number; limit: number }
export interface Fact { text: string; source: "profile" | "notes" | "memory" | "company" }
export interface Flag { text: string; reason: string }
export interface DraftVersion {
  version: number; subject: string; body: string; edited_by: "agent" | "student"; created_at: IsoTime;
}
export interface SentTouch {
  number: number; status: string; subject: string | null; body: string | null; sent_at: IsoTime | null;
}
export interface EmailThread {
  touches: SentTouch[]; reply_text: string | null; reply_sentiment: Sentiment | null;
  reply_received_at: IsoTime | null; failure_note: string | null;
}
export interface PreviousCopy { subject: string; body: string; version: number }
export interface OutreachDetail extends OutreachRow {
  body: string; style: string | null; instructions: string | null;
  facts_used: Fact[]; flags: Flag[]; versions: DraftVersion[]; approved_at: IsoTime | null;
  can_edit: boolean; can_approve: boolean; can_skip: boolean; can_discard: boolean;
  sending_enabled: false; send_blocker: "sending_off" | null; thread: EmailThread | null;
}
export interface Refusal { lead_id: number | null; outreach_id: OutreachId | null; code: string; message: string }
export interface DraftsCreated { items: OutreachRow[]; refused: Refusal[] }
export interface ReviseResult { outreach: OutreachDetail; previous: PreviousCopy }
export interface ApproveResult { outreach: OutreachDetail; sent: false; message: string }
export interface ApproveAllResult { approved: OutreachRow[]; refused: Refusal[]; sent: false; message: string }
export interface ReplyCounts { positive: number; question: number; not_now: number; bounced: number }
export interface ReplyItem {
  outreach_id: OutreachId; lead: LeadRef; subject: string | null; reply_text: string | null;
  sentiment: Sentiment | null; group: ReplyGroup; received_at: IsoTime | null; sent_at: IsoTime | null;
}
export interface ReplyList { items: ReplyItem[]; counts: ReplyCounts; total: number; offset: number; limit: number }

// ------------------------------------------------------------------ profile, memory, settings, status

export interface ProfileNotes {
  best_project: string | null; outcome: string | null; why_now: string | null; credential: string | null;
}
export interface Profile {
  candidate_id: number; name: string; education: string | null; summary: string | null;
  top_skills: string[]; target_roles: string[]; target_industries: string[]; dream_companies: string[];
  locations: string[]; career_stage: string | null; hiring_manager_titles: string[]; notes: ProfileNotes;
}
export interface Memory {
  id: number; text: string; scope: MemoryScope; company: string | null; use_in_emails: boolean;
  source: "chat" | "settings" | "profile"; created_at: IsoTime;
}
export interface MemoryList { items: Memory[]; cap: number }
export interface NeverContact { kind: "company" | "person"; value: string }
export interface AgentSettings { review_before_send: boolean; followups: boolean; never_contact: NeverContact[] }
export interface Credits { available: number; reserved: number }
export interface GmailState { connected: boolean; address: string | null; token_valid: boolean | null }
export interface MatchTotals { total: number; strong: number; new: number }
export interface Limits {
  messages_today: number; messages_cap: number; drafts_today: number; drafts_cap: number;
  drafts_waiting: number; drafts_waiting_cap: number; max_message_chars: number;
}
export interface Status {
  state: AccountState; candidate_id: number | null; first_name: string;
  credits: Credits; gmail: GmailState; counts: Counts; matches: MatchTotals;
  sending_enabled: false; limits: Limits;
}

// ------------------------------------------------------------------ chat

export interface Suggestion { label: string; prompt: string }
export interface Thread { id: number; title: string; scope: string; updated_at: IsoTime }
export interface ThreadList { items: Thread[] }
export interface Step { call_id: string; tool: string; label: string; ok: boolean | null; summary: string | null }
export interface Confirmation { id: string; tool: string; summary: string; status: ConfirmationStatus; expires_at: IsoTime }
export interface NavigateTarget { to: DeskRoute; id: string | null; filter: string | null }

export type Card =
  | { kind: "matches"; items: MatchCard[]; total: number }
  | { kind: "match"; match: MatchCard; why: Why }
  | { kind: "outreach"; items: OutreachRow[]; counts: Counts }
  | { kind: "status"; status: Status }
  | { kind: "profile"; profile: Profile }
  | { kind: "memory"; memory: Memory; action: "saved" | "removed" };

export interface Message {
  id: number; role: "user" | "assistant"; content: string; created_at: IsoTime; run_id: number | null;
  status: RunStatus | null; steps: Step[]; cards: Card[]; outreach_ids: OutreachId[];
  confirmations: Confirmation[]; navigate: NavigateTarget | null; suggestions: Suggestion[];
}
export interface Run {
  id: number; thread_id: number; status: RunStatus; started_at: IsoTime;
  finished_at: IsoTime | null; error_code: StreamErrorCode | null;
}
export interface ThreadDetail { thread: Thread; messages: Message[]; latest_run: Run | null; has_more: boolean }

// ------------------------------------------------------------------ stream events

export interface Usage { messages_today: number; messages_cap: number }
export type StreamEvent = { seq: number } & (
  | { type: "run_start"; run_id: number; thread_id: number; user_message_id: number }
  | { type: "text"; delta: string }
  | { type: "tool_start"; call_id: string; tool: string; label: string }
  | { type: "tool_end"; call_id: string; tool: string; ok: boolean; summary: string; invalidate: InvalidateKey[] }
  | { type: "card"; call_id: string; card: Card }
  | { type: "draft"; call_id: string; outreach: OutreachDetail; previous: PreviousCopy | null }
  | { type: "confirmation"; confirmation: Confirmation }
  | { type: "navigate"; to: DeskRoute; id: string | null; filter: string | null }
  | { type: "suggestions"; items: Suggestion[] }
  | { type: "message_end"; message_id: number; content: string }
  | { type: "done"; run_id: number; status: "done" | "cancelled" | "limit"; invalidate: InvalidateKey[]; usage: Usage }
  | { type: "error"; code: StreamErrorCode; message: string; retryable: boolean }
);
export type StreamEventType = StreamEvent["type"];
/** Every type except "text" is stored on the run and replayed by GET /runs/{id}. */
export const PERSISTED_EVENT_TYPES: readonly StreamEventType[] = [
  "run_start", "tool_start", "tool_end", "card", "draft", "confirmation", "navigate",
  "suggestions", "message_end", "done", "error",
];

export interface RunPoll { run: Run; events: StreamEvent[]; message: Message | null }
export interface CancelResult { ok: true; status: RunStatus }
export interface OkResult { ok: true }

// ------------------------------------------------------------------ bootstrap

export interface Bootstrap {
  enabled: true;
  user: { id: string; first_name: string };
  status: Status; settings: AgentSettings; status_labels: Record<StatusWord, string>;
  top_matches: MatchCard[]; outreach: OutreachList;
  threads: Thread[]; thread: ThreadDetail; suggestions: Suggestion[]; greeting: string | null;
}
export interface BootstrapDisabled { enabled: false; reason: "agent_disabled" | "agent_not_enabled" }
export type BootstrapResponse = Bootstrap | BootstrapDisabled;

// ------------------------------------------------------------------ requests

export interface ContextItem { kind: "lead" | "outreach"; id: number | string }
export interface PageContext {
  route: DeskRoute; outreach_id?: OutreachId | null; lead_id?: number | null;
  filter?: string | null; query?: string | null; selected?: ContextItem[];
}
export interface ConfirmationDecision { id: string; decision: "approve" | "decline" }
export interface SendMessageBody {
  content: string; client_turn_id: string; page_context?: PageContext | null;
  confirmation?: ConfirmationDecision | null; time_zone?: string | null;
}
export interface CreateThreadBody { title?: string | null; scope?: string }
export interface CreateDraftsBody { lead_ids: number[]; style?: DraftStyle | null; instructions?: string | null }
export interface ReviseDraftBody { instruction: string; expected_version: number }
export interface EditDraftBody { subject?: string; body?: string; expected_version: number }
export interface ApproveDraftBody { expected_version: number }
export interface ApproveAllBody { ids: OutreachId[] }
export interface DiscardDraftBody { reason?: string | null }
export interface SkipMatchBody { reason?: string | null }
export interface UpdateNotesBody {
  best_project?: string | null; outcome?: string | null; why_now?: string | null; credential?: string | null;
}
export interface CreateMemoryBody { text: string; scope?: MemoryScope; company?: string | null; use_in_emails?: boolean }
export interface UpdateSettingsBody {
  review_before_send?: boolean; followups?: boolean; never_contact?: NeverContact[];
}

// ------------------------------------------------------------------ frontend seams (contract section 10)

/** Cache resources. Each InvalidateKey maps to the resources it refetches. */
export type DeskResourceKey =
  | "bootstrap" | "status" | "matches" | "top_matches" | "outreach" | `outreach:${OutreachId}`
  | `match:${number}` | "replies" | "profile" | "memories" | "settings" | "threads";
export const INVALIDATES: Record<InvalidateKey, readonly string[]> = {
  status: ["status"],
  matches: ["matches", "top_matches", "match:*"],
  outreach: ["outreach", "outreach:*", "top_matches"],
  replies: ["replies"],
  profile: ["profile"],
  memories: ["memories"],
  settings: ["settings"],
  threads: ["threads"],
};
