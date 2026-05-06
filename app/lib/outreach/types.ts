// ── Auth ──────────────────────────────────────────────────────────────
// User type is handled by authClient.useSession() — no custom type needed.

// ── Candidate ────────────────────────────────────────────────────────

export interface ResumePreview {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: string[];
  experience_years?: number;
  summary?: string;
  char_count?: number;
}

export interface MCQOption {
  label: string;
  text: string;
}

export interface MCQQuestion {
  question: string;
  options: MCQOption[];
  allow_multiple: boolean;
}

export interface PsychometricResult {
  top_strengths: string[];
  dimension_scores: {
    analytical: number;
    creative: number;
    execution: number;
    social: number;
  };
  traits: string[];
  recommended_roles: string[];
  reasoning: string;
  confidence_score: number;
}

export interface AgentResponse {
  message: string;
  current_state: string;
  mcq: MCQQuestion | null;
  text_input: boolean;
  input_placeholder?: string | null;
  is_complete: boolean;
  questions_asked_so_far: number;
  psychometric?: PsychometricResult | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CandidateProfile {
  candidate_id: number;
  parsed_json: Record<string, unknown>;
  target_roles: string[] | null;
  target_industries: string[] | null;
  created_at: string | null;
}

// ── Leads ────────────────────────────────────────────────────────────

export interface LeadJustification {
  headline: string;
  // New schema: 3 bullets. Old schema (fit_reason + talk_track) is kept as
  // optional fallback so existing rows in lead_scores.justification_json
  // don't break the UI until they're re-justified on next discovery.
  bullets?: string[];
  fit_reason?: string;
  talk_track?: string;
  signal_strength: "high" | "medium" | "low";
}

export interface LeadScore {
  overall: number;
  title_relevance: number;
  department_relevance: number;
  industry_relevance: number;
  seniority_relevance: number;
  location_relevance: number;
  explanation: string | null;
  justification: LeadJustification | null;
}

export interface Lead {
  id: number;
  name: string;
  title: string;
  company: string;
  industry: string | null;
  location: string | null;
  linkedin_url: string | null;
  email: string | null;
  email_verified: boolean;
  company_size: string | null;
  status: string;
  score: LeadScore | null;
}

// ── Campaign ─────────────────────────────────────────────────────────

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
}

export interface CampaignMetrics {
  campaign_id: number;
  campaign_name: string;
  status: string;
  user_timezone?: string;
  emails_total: number;
  emails_queued: number;
  emails_pending_enrichment?: number;
  emails_enriched?: number;
  emails_enrichment_skipped?: number;
  emails_sent: number;
  emails_failed: number;
  emails_replied: number;
  emails_bounced: number;
  emails_positive: number;
  emails_negative: number;
  emails_neutral: number;
  reply_rate: number;
  total_leads?: number;
  sent_count?: number;
}

// ── Pricing / Tiers ──────────────────────────────────────────────────

export interface TierPricing {
  tier: number;
  label: string;
  amount_cents: number;
  currency: string;
  display_price: string;
}