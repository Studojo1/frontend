/**
 * EmailComposer - 3-phase AI-powered cold email writer
 *
 * Phase 1: Style Profile  - 3-step wizard, stored locally
 * Phase 2: Recipient Setup - per-email context
 * Phase 3: Compose        - 3-panel editor with live scoring + AI chat
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiSend, FiZap, FiCheck, FiEye, FiEdit2, FiCopy,
  FiUser, FiLink, FiStar, FiCalendar, FiFileText,
  FiMessageCircle, FiTarget, FiArrowRight, FiArrowLeft,
  FiRefreshCw, FiAlertCircle, FiChevronDown,
} from "react-icons/fi";
import type { EmailTemplate } from "~/lib/outreach/types";

// ── Types ─────────────────────────────────────────────────────────────

export type ToneOption = "direct" | "warm" | "formal";
export type ConnectionType = "none" | "alumni" | "referral" | "founder_post";
export type CompanyType = "startup" | "scaleup" | "enterprise" | "agency";
export type OutreachGoal = "chat" | "role" | "general";
export type LookingFor = "internship" | "fulltime" | "research" | "networking";

export interface StyleProfile {
  name: string;
  university: string;
  tone: ToneOption;
  topCredential: string;
  lookingFor: LookingFor;
  targetRoles: string;
  sampleEmail?: string;
}

export interface RecipientContext {
  recipientName: string;
  recipientTitle: string;
  company: string;
  connectionType: ConnectionType;
  specificHook: string;
  companyType: CompanyType;
  goal: OutreachGoal;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  editScope?: string;
  error?: boolean;
}

interface EmailScore {
  wordCount: number;
  iCount: number;
  youCount: number;
  hasHook: boolean;
  questionCount: number;
}

interface ContentBlock {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  template: string;
}

interface EmailComposerProps {
  templates: EmailTemplate[];
  initialTemplate: EmailTemplate | null;
  savedProfile?: StyleProfile | null;
  onTemplateChange: (t: EmailTemplate) => void;
  onContinue: (subject: string, body: string, templateId: number | null) => void;
  onSaveProfile?: (profile: StyleProfile) => void;
}

// ── Content blocks ────────────────────────────────────────────────────

const CONTENT_BLOCKS: ContentBlock[] = [
  {
    id: "signature",
    label: "Signature",
    description: "Name, title & contact",
    icon: <FiUser className="w-3.5 h-3.5" />,
    template: "\n\nBest,\n[Your Name]\n[Your Title] | [Email]\nLinkedIn: [URL]",
  },
  {
    id: "target_role",
    label: "Target Role",
    description: "Role you're seeking",
    icon: <FiTarget className="w-3.5 h-3.5" />,
    template: "\n\nI'm particularly interested in [Target Role] opportunities where I can contribute my background in [Key Area].",
  },
  {
    id: "skills",
    label: "Key Skills",
    description: "Your top 3 skills",
    icon: <FiZap className="w-3.5 h-3.5" />,
    template: "\n\nCore skills: [Skill 1], [Skill 2], [Skill 3].",
  },
  {
    id: "achievement",
    label: "Achievement",
    description: "A result with a number",
    icon: <FiStar className="w-3.5 h-3.5" />,
    template: "\n\nMost recently, [specific achievement - e.g. grew X by Y%].",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Your profile link",
    icon: <FiLink className="w-3.5 h-3.5" />,
    template: " LinkedIn: [Your URL]",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Work samples or site",
    icon: <FiFileText className="w-3.5 h-3.5" />,
    template: " Portfolio: [Your URL]",
  },
  {
    id: "availability",
    label: "Availability",
    description: "When you can start",
    icon: <FiCalendar className="w-3.5 h-3.5" />,
    template: "\n\nI'm available from [Date] and open to [remote / hybrid / on-site].",
  },
  {
    id: "cta",
    label: "CTA",
    description: "A low-friction ask",
    icon: <FiMessageCircle className="w-3.5 h-3.5" />,
    template: "\n\nWould you be open to a 15-minute chat this week?",
  },
];

// ── Score computation ─────────────────────────────────────────────────

function computeScore(body: string): EmailScore {
  const words = body.trim().split(/\s+/).filter(Boolean);
  const iCount = (body.match(/\bI\b/g) || []).length;
  const youCount = (body.match(/\b(you|your)\b/gi) || []).length;
  const stripped = body.replace(/\{[^}]+\}/g, "").replace(/\[[^\]]+\]/g, "").trim();
  const hasHook = stripped.length > 60;
  const questionCount = (body.match(/\?/g) || []).length;
  return { wordCount: words.length, iCount, youCount, hasHook, questionCount };
}

function ScoreBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-satoshi border ${
      ok
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-600 border-red-200"
    }`}>
      {ok ? <FiCheck className="w-2.5 h-2.5" /> : <FiAlertCircle className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

// ── Shared UI primitives ──────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-studojo-purple bg-studojo-purple-bg shadow-sm"
          : "border-studojo-ink/15 hover:border-studojo-ink/40 hover:bg-studojo-surface-muted"
      } ${className}`}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-studojo-purple flex items-center justify-center">
          <FiCheck className="w-3 h-3 text-white" />
        </span>
      )}
      {children}
    </button>
  );
}

function WizardProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < step ? "bg-studojo-purple w-6" : i === step ? "bg-studojo-purple/40 w-4" : "bg-studojo-ink/10 w-4"
          }`}
        />
      ))}
    </div>
  );
}

// ── Phase 1: Style Profile Wizard ─────────────────────────────────────

function StyleProfileSetup({
  initial,
  onComplete,
}: {
  initial?: Partial<StyleProfile>;
  onComplete: (p: StyleProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name || "");
  const [university, setUniversity] = useState(initial?.university || "");
  const [tone, setTone] = useState<ToneOption>(initial?.tone || "warm");
  const [topCredential, setTopCredential] = useState(initial?.topCredential || "");
  const [lookingFor, setLookingFor] = useState<LookingFor>(initial?.lookingFor || "internship");
  const [targetRoles, setTargetRoles] = useState(initial?.targetRoles || "");
  const [sampleEmail, setSampleEmail] = useState(initial?.sampleEmail || "");
  const [showSample, setShowSample] = useState(false);

  const canNext0 = name.trim().length > 0;
  const canNext1 = topCredential.trim().length > 0;
  const canComplete = targetRoles.trim().length > 0;

  const handleComplete = () => {
    onComplete({
      name: name.trim(),
      university: university.trim(),
      tone,
      topCredential: topCredential.trim(),
      lookingFor,
      targetRoles: targetRoles.trim(),
      sampleEmail: sampleEmail.trim() || undefined,
    });
  };

  const TONES = [
    {
      id: "direct" as const,
      label: "Direct & punchy",
      desc: "Short sentences. Confident. No filler.",
    },
    {
      id: "warm" as const,
      label: "Warm & personal",
      desc: "Genuine interest. Conversational. Human.",
    },
    {
      id: "formal" as const,
      label: "Professional",
      desc: "Polished. Precise. Respectful.",
    },
  ];

  const LOOKING_FOR = [
    { id: "internship" as const, label: "Internship" },
    { id: "fulltime" as const, label: "Full-time" },
    { id: "research" as const, label: "Research role" },
    { id: "networking" as const, label: "Just networking" },
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <WizardProgress step={step} total={3} />
          <h2 className="font-clash text-2xl font-bold text-studojo-ink mt-4">
            {step === 0 && "Let's set your style"}
            {step === 1 && "Your strongest signal"}
            {step === 2 && "Who are you reaching?"}
          </h2>
          <p className="text-sm text-studojo-muted font-satoshi mt-1">
            {step === 0 && "This gets saved so every email matches how you actually write."}
            {step === 1 && "One specific result beats a list of skills every time."}
            {step === 2 && "We'll use this to personalise every email you write."}
          </p>
        </div>

        {/* Step 0: Name, university, tone */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
                  Your name
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full h-10 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
                  University (optional)
                </label>
                <input
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. University of Delhi"
                  className="w-full h-10 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-2">
                How do you prefer to write?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <OptionCard
                    key={t.id}
                    selected={tone === t.id}
                    onClick={() => setTone(t.id)}
                  >
                    <p className="text-sm font-bold font-satoshi text-studojo-ink">{t.label}</p>
                    <p className="text-xs text-studojo-muted font-satoshi">{t.desc}</p>
                  </OptionCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Top credential + looking for */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
                Your #1 credential - one result with a number if possible
              </label>
              <input
                autoFocus
                value={topCredential}
                onChange={(e) => setTopCredential(e.target.value)}
                placeholder="e.g. Built a newsletter to 3,000 subscribers in 4 months"
                className="w-full h-10 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple"
              />
              <p className="text-[11px] text-studojo-muted font-satoshi mt-1">
                This gets woven into emails where it fits. Be specific.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-2">
                What are you looking for?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LOOKING_FOR.map((l) => (
                  <OptionCard
                    key={l.id}
                    selected={lookingFor === l.id}
                    onClick={() => setLookingFor(l.id)}
                    className="!flex-row items-center gap-3"
                  >
                    <p className="text-sm font-bold font-satoshi text-studojo-ink">{l.label}</p>
                  </OptionCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Target roles + optional sample email */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
                Target roles / industries
              </label>
              <input
                autoFocus
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="e.g. Marketing Intern, Growth, SaaS startups, Fintech"
                className="w-full h-10 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowSample(!showSample)}
                className="flex items-center gap-2 text-sm font-satoshi text-studojo-muted hover:text-studojo-ink transition-colors"
              >
                <FiChevronDown className={`w-4 h-4 transition-transform ${showSample ? "rotate-180" : ""}`} />
                Paste a cold email you've sent before (optional - we'll match your voice)
              </button>
              {showSample && (
                <textarea
                  value={sampleEmail}
                  onChange={(e) => setSampleEmail(e.target.value)}
                  placeholder="Paste any cold email you've written before..."
                  rows={5}
                  className="mt-2 w-full px-3 py-2.5 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple resize-none"
                />
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 text-sm font-satoshi text-studojo-muted hover:text-studojo-ink transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <span />
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 ? !canNext0 : !canNext1}
              className="flex items-center gap-2 h-10 px-6 rounded-xl bg-studojo-purple text-white text-sm font-bold font-satoshi border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:pointer-events-none"
            >
              Continue <FiArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={!canComplete}
              className="flex items-center gap-2 h-10 px-6 rounded-xl bg-studojo-purple text-white text-sm font-bold font-satoshi border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:pointer-events-none"
            >
              Start writing <FiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Phase 2: Recipient Setup ──────────────────────────────────────────

function RecipientSetup({
  onComplete,
  onBack,
}: {
  onComplete: (ctx: RecipientContext) => void;
  onBack: () => void;
}) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientTitle, setRecipientTitle] = useState("");
  const [company, setCompany] = useState("");
  const [connectionType, setConnectionType] = useState<ConnectionType>("none");
  const [specificHook, setSpecificHook] = useState("");
  const [companyType, setCompanyType] = useState<CompanyType>("startup");
  const [goal, setGoal] = useState<OutreachGoal>("chat");

  const canSubmit = company.trim().length > 0;

  const CONNECTIONS = [
    { id: "none" as const, label: "No connection", desc: "Cold outreach" },
    { id: "alumni" as const, label: "Same uni", desc: "Shared alumni angle" },
    { id: "referral" as const, label: "Referred", desc: "Mutual contact" },
    { id: "founder_post" as const, label: "Saw their post", desc: "LinkedIn / social" },
  ];

  const COMPANY_TYPES = [
    { id: "startup" as const, label: "Startup", desc: "Pre-seed to seed" },
    { id: "scaleup" as const, label: "Scale-up", desc: "Series A-C" },
    { id: "enterprise" as const, label: "Enterprise", desc: "Large corp / MNC" },
    { id: "agency" as const, label: "Agency", desc: "Agency / consultancy" },
  ];

  const GOALS = [
    { id: "chat" as const, label: "Book a chat", desc: "15-min conversation" },
    { id: "role" as const, label: "Ask about a role", desc: "Specific open position" },
    { id: "general" as const, label: "Express interest", desc: "General opportunities" },
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-white p-6 overflow-y-auto">
      <div className="w-full max-w-xl">
        <div className="mb-7">
          <WizardProgress step={3} total={4} />
          <h2 className="font-clash text-2xl font-bold text-studojo-ink mt-4">
            Who are you writing to?
          </h2>
          <p className="text-sm text-studojo-muted font-satoshi mt-1">
            The more specific you are, the better the email. Take 30 seconds here.
          </p>
        </div>

        <div className="space-y-5">
          {/* Recipient info */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
                Their name
              </label>
              <input
                autoFocus
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Sarah Chen"
                className="w-full h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
                Their title
              </label>
              <input
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                placeholder="Head of Marketing"
                className="w-full h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
                Company *
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Notion, Stripe..."
                className="w-full h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
              />
            </div>
          </div>

          {/* Specific hook - most important field */}
          <div>
            <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-1.5">
              What do you know about them specifically?
            </label>
            <input
              value={specificHook}
              onChange={(e) => setSpecificHook(e.target.value)}
              placeholder={`e.g. "They wrote about growing ${company || "their"} community on LinkedIn last week" or "just raised a Series A"`}
              className="w-full h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-sm font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple"
            />
            <p className="text-[11px] text-studojo-muted font-satoshi mt-1">
              This is the single biggest driver of reply rates. Something specific beats something generic every time.
            </p>
          </div>

          {/* Connection type */}
          <div>
            <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-2">
              Connection type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CONNECTIONS.map((c) => (
                <OptionCard
                  key={c.id}
                  selected={connectionType === c.id}
                  onClick={() => setConnectionType(c.id)}
                >
                  <p className="text-xs font-bold font-satoshi text-studojo-ink">{c.label}</p>
                  <p className="text-[10px] text-studojo-muted font-satoshi">{c.desc}</p>
                </OptionCard>
              ))}
            </div>
          </div>

          {/* Company type + goal in 2 cols */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-2">
                Company type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {COMPANY_TYPES.map((c) => (
                  <OptionCard
                    key={c.id}
                    selected={companyType === c.id}
                    onClick={() => setCompanyType(c.id)}
                  >
                    <p className="text-xs font-bold font-satoshi text-studojo-ink">{c.label}</p>
                    <p className="text-[10px] text-studojo-muted font-satoshi">{c.desc}</p>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-studojo-muted font-satoshi uppercase block mb-2">
                Your goal
              </label>
              <div className="flex flex-col gap-1.5">
                {GOALS.map((g) => (
                  <OptionCard
                    key={g.id}
                    selected={goal === g.id}
                    onClick={() => setGoal(g.id)}
                    className="!flex-row items-center gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold font-satoshi text-studojo-ink">{g.label}</p>
                      <p className="text-[10px] text-studojo-muted font-satoshi">{g.desc}</p>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-satoshi text-studojo-muted hover:text-studojo-ink transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={() =>
              onComplete({
                recipientName: recipientName.trim(),
                recipientTitle: recipientTitle.trim(),
                company: company.trim(),
                connectionType,
                specificHook: specificHook.trim(),
                companyType,
                goal,
              })
            }
            disabled={!canSubmit}
            className="flex items-center gap-2 h-10 px-6 rounded-xl bg-studojo-purple text-white text-sm font-bold font-satoshi border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:pointer-events-none"
          >
            Generate email <FiZap className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Variable highlight ────────────────────────────────────────────────

function renderWithHighlights(text: string) {
  const parts = text.split(/(\{[^}]+\}|\[[^\]]+\])/g);
  return parts.map((part, i) =>
    /^\{[^}]+\}$/.test(part) || /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="bg-studojo-purple/15 text-studojo-purple rounded px-0.5 not-italic">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

// ── Phase 3: Compose (3-panel) ────────────────────────────────────────

function ComposePanel({
  templates,
  styleProfile,
  recipientContext,
  onContinue,
  onReset,
}: {
  templates: EmailTemplate[];
  styleProfile: StyleProfile;
  recipientContext: RecipientContext;
  onContinue: (subject: string, body: string, templateId: number | null) => void;
  onReset: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [subjectVariants, setSubjectVariants] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [leftSection, setLeftSection] = useState<"templates" | "blocks">("blocks");
  const [generating, setGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const score = computeScore(body);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // Generate initial email on mount
  useEffect(() => {
    generateEmail(true, null);
  }, []);

  // Auto-resize textarea as content changes
  useEffect(() => {
    const ta = bodyRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.max(160, ta.scrollHeight)}px`;
  }, [body]);

  const styleProfileForAPI = {
    name: styleProfile.name,
    university: styleProfile.university,
    tone: styleProfile.tone,
    topCredential: styleProfile.topCredential,
    lookingFor: styleProfile.lookingFor,
    targetRoles: styleProfile.targetRoles,
    sampleEmail: styleProfile.sampleEmail,
  };

  const recipientForAPI = {
    recipientName: recipientContext.recipientName,
    recipientTitle: recipientContext.recipientTitle,
    company: recipientContext.company,
    connectionType: recipientContext.connectionType,
    specificHook: recipientContext.specificHook,
    companyType: recipientContext.companyType,
    goal: recipientContext.goal,
  };

  const generateEmail = async (isInitial: boolean, templateBody: string | null) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/outreach/email-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_initial: isInitial,
          subject: templateBody ? "" : subject,
          body: templateBody ?? "",
          style_profile: styleProfileForAPI,
          recipient_context: recipientForAPI,
          edit_history: editHistory,
        }),
      });
      const data = await res.json();
      if (res.ok && data.body) {
        setSubject(data.subject || "");
        setBody(data.body);
        if (data.subject_variants?.length) setSubjectVariants(data.subject_variants);
        if (isInitial) {
          setChatHistory([{
            role: "assistant",
            content: data.explanation || "Here's your first draft. Ask me to change anything.",
            editScope: data.edit_scope,
          }]);
        }
      }
    } catch {
      // silent fail
    } finally {
      setGenerating(false);
    }
  };

  // Load template into editor
  const handleSelectTemplate = (t: EmailTemplate) => {
    setSelectedTemplateId(t.id);
    // Use template as starting point and refine with AI
    generateEmail(false, t.body);
    setSubject(t.subject);
  };

  // Drag-and-drop blocks
  const insertAtCursor = useCallback(
    (text: string) => {
      const ta = bodyRef.current;
      if (!ta) { setBody((p) => p + text); return; }
      const s = ta.selectionStart ?? body.length;
      const e = ta.selectionEnd ?? body.length;
      setBody(body.substring(0, s) + text + body.substring(e));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + text.length; ta.focus(); }, 0);
    },
    [body],
  );

  // Quick edit actions (map to natural-language instructions)
  const QUICK_EDITS = [
    { label: "Shorter", prompt: "Make the body shorter, under 80 words, keep personalization and CTA" },
    { label: "More casual", prompt: "Make the tone more casual and conversational" },
    { label: "Punchier opener", prompt: "Rewrite just the opening line to be more specific and attention-grabbing" },
    { label: "Softer close", prompt: "Make the closing ask feel lower-pressure and more conversational" },
    { label: "New subject", prompt: "Give me a completely different, better subject line - keep the body" },
    { label: "New angle", prompt: "Try a completely different approach - same facts, different structure and tone" },
  ];

  const sendChatMessage = async (promptOverride?: string) => {
    const prompt = (promptOverride ?? chatInput).trim();
    if (!prompt || chatLoading) return;

    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: prompt }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/outreach/email-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          subject,
          body,
          style_profile: styleProfileForAPI,
          recipient_context: recipientForAPI,
          edit_history: editHistory.slice(-4),
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setChatHistory((prev) => [...prev, {
          role: "assistant",
          content: data.error || "Something went wrong. Please try again.",
          error: true,
        }]);
      } else {
        // Auto-apply changes immediately
        setSubject(data.subject);
        setBody(data.body);
        if (data.subject_variants?.length) setSubjectVariants(data.subject_variants);
        setEditHistory((prev) => [...prev, prompt]);

        const scopeLabel: Record<string, string> = {
          subject_only: "Subject updated",
          opener_only: "Opening line updated",
          shorten: "Body shortened",
          tone_shift: "Tone adjusted",
          cta_only: "Closing updated",
          full_rewrite: "Full rewrite done",
          general: "Updated",
        };
        const badge = scopeLabel[data.edit_scope] || "Updated";

        setChatHistory((prev) => [...prev, {
          role: "assistant",
          content: data.explanation,
          editScope: badge,
        }]);
      }
    } catch {
      setChatHistory((prev) => [...prev, {
        role: "assistant",
        content: "Network error. Check your connection.",
        error: true,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
  };

  const blocksByCategory = {
    structure: CONTENT_BLOCKS.filter((b) => ["signature", "cta", "availability"].includes(b.id)),
    personal: CONTENT_BLOCKS.filter((b) => ["target_role", "skills", "achievement", "linkedin", "portfolio"].includes(b.id)),
  };

  return (
    <div className="flex flex-1 min-h-0 h-full bg-white">
      {/* ── LEFT PANEL ── */}
      <div className="w-48 flex-shrink-0 border-r-2 border-studojo-ink/10 flex flex-col overflow-hidden bg-studojo-surface-muted/30">
        <div className="flex border-b-2 border-studojo-ink/10">
          <button
            onClick={() => setLeftSection("blocks")}
            className={`flex-1 py-2.5 text-xs font-bold font-satoshi transition-colors ${leftSection === "blocks" ? "text-studojo-purple border-b-2 border-studojo-purple -mb-0.5 bg-white" : "text-studojo-muted hover:text-studojo-ink"}`}
          >
            Blocks
          </button>
          <button
            onClick={() => setLeftSection("templates")}
            className={`flex-1 py-2.5 text-xs font-bold font-satoshi transition-colors ${leftSection === "templates" ? "text-studojo-purple border-b-2 border-studojo-purple -mb-0.5 bg-white" : "text-studojo-muted hover:text-studojo-ink"}`}
          >
            Templates
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {leftSection === "templates" ? (
            <>
              <p className="text-[10px] text-studojo-muted font-satoshi uppercase font-bold px-1 pt-1 pb-0.5">
                Click to use as base
              </p>
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 border-2 transition-all ${selectedTemplateId === t.id ? "border-studojo-purple bg-white" : "border-transparent hover:border-studojo-ink/20 hover:bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-bold font-satoshi text-studojo-ink leading-tight">{t.name}</p>
                    {selectedTemplateId === t.id && <FiCheck className="w-3 h-3 text-studojo-purple flex-shrink-0 mt-0.5" />}
                  </div>
                  <p className="text-[10px] text-studojo-muted font-satoshi mt-0.5 line-clamp-2 leading-tight">{t.subject}</p>
                </button>
              ))}
            </>
          ) : (
            <>
              {(["structure", "personal"] as const).map((cat) => (
                <div key={cat}>
                  <p className="text-[9px] text-studojo-muted/60 font-satoshi uppercase font-bold px-1 pt-2 pb-1">
                    {cat === "structure" ? "Structure" : "Personal"}
                  </p>
                  {blocksByCategory[cat].map((block) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", block.template); e.dataTransfer.effectAllowed = "copy"; }}
                      onClick={() => insertAtCursor(block.template)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 border-2 border-dashed border-studojo-ink/15 cursor-grab active:cursor-grabbing hover:border-studojo-purple/40 hover:bg-studojo-purple-bg/30 transition-all select-none"
                    >
                      <span className="text-studojo-purple flex-shrink-0">{block.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold font-satoshi text-studojo-ink leading-tight truncate">{block.label}</p>
                        <p className="text-[9px] text-studojo-muted font-satoshi leading-tight truncate">{block.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>

        {/* New email button */}
        <div className="p-2 border-t-2 border-studojo-ink/10">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl border-2 border-studojo-ink/15 text-xs font-satoshi text-studojo-muted hover:text-studojo-ink hover:border-studojo-ink/30 transition-colors"
          >
            <FiRefreshCw className="w-3 h-3" /> New email
          </button>
        </div>
      </div>

      {/* ── CENTER PANEL ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-studojo-surface-muted/20">
        {/* Slim top bar: actions only */}
        <div className="flex items-center justify-between px-3 py-2 border-b-2 border-studojo-ink/10 bg-white flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold font-satoshi transition-colors ${viewMode === "edit" ? "bg-studojo-ink text-white" : "text-studojo-muted hover:text-studojo-ink hover:bg-studojo-surface-muted"}`}
            >
              <FiEdit2 className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold font-satoshi transition-colors ${viewMode === "preview" ? "bg-studojo-ink text-white" : "text-studojo-muted hover:text-studojo-ink hover:bg-studojo-surface-muted"}`}
            >
              <FiEye className="w-3 h-3" /> Preview
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={copyEmail} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-satoshi text-studojo-muted hover:text-studojo-ink hover:bg-studojo-surface-muted transition-colors">
              <FiCopy className="w-3 h-3" /> Copy
            </button>
            <button
              onClick={() => onContinue(subject, body, selectedTemplateId)}
              disabled={!body}
              className="flex items-center gap-1.5 h-7 px-3 rounded-xl bg-studojo-purple text-white text-xs font-bold font-satoshi border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-40 disabled:pointer-events-none"
            >
              Use this email →
            </button>
          </div>
        </div>

        {/* Quick edit pill row */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-studojo-ink/8 bg-white overflow-x-auto flex-shrink-0">
          {QUICK_EDITS.map((q) => (
            <button
              key={q.label}
              onClick={() => sendChatMessage(q.prompt)}
              disabled={chatLoading || generating}
              className="flex-shrink-0 px-3 py-1 rounded-full bg-studojo-surface-muted text-xs font-satoshi font-medium text-studojo-ink hover:bg-studojo-purple hover:text-white border border-studojo-ink/10 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        {generating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-studojo-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-studojo-muted font-satoshi">Writing your email...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {viewMode === "edit" ? (
              <div className="max-w-2xl mx-auto p-5 space-y-3">
                {/* Email compose card */}
                <div className="rounded-2xl border-2 border-studojo-ink/15 bg-white shadow-sm overflow-hidden">
                  {/* To: header */}
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-studojo-ink/8">
                    <span className="text-xs font-bold text-studojo-muted font-satoshi w-8 flex-shrink-0">To:</span>
                    <span className="text-xs text-studojo-ink font-satoshi">
                      {recipientContext.recipientName
                        ? <><strong>{recipientContext.recipientName}</strong> · {recipientContext.recipientTitle && `${recipientContext.recipientTitle}, `}{recipientContext.company}</>
                        : <span className="text-studojo-muted">{"{name}"} · {"{company}"}</span>
                      }
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="px-5 py-3 border-b border-studojo-ink/8">
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject line..."
                      className="w-full text-sm font-bold font-satoshi text-studojo-ink bg-transparent border-none outline-none focus:outline-none placeholder:font-normal placeholder:text-studojo-muted/40"
                    />
                  </div>

                  {/* Subject variants */}
                  {subjectVariants.length > 0 && (
                    <div className="px-5 py-2 border-b border-studojo-ink/8 bg-studojo-surface-muted/40 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-studojo-muted font-satoshi font-bold uppercase">Try:</span>
                      {subjectVariants.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => setSubject(v)}
                          className="text-[11px] font-satoshi text-studojo-purple bg-white border border-studojo-purple/25 px-2.5 py-0.5 rounded-full hover:bg-studojo-purple hover:text-white transition-colors"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Body */}
                  <div
                    className="px-5 py-4"
                    onDrop={(e) => { e.preventDefault(); const t = e.dataTransfer.getData("text/plain"); if (t) insertAtCursor(t); }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                  >
                    <textarea
                      ref={bodyRef}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Your email body will appear here after generation..."
                      className="w-full text-sm font-satoshi text-studojo-ink bg-transparent border-none outline-none focus:outline-none resize-none leading-relaxed placeholder:text-studojo-muted/40 overflow-hidden"
                      rows={1}
                    />
                  </div>

                  {/* Score bar inside card footer */}
                  {body && (
                    <div className="flex items-center gap-3 px-5 py-2.5 border-t border-studojo-ink/8 bg-studojo-surface-muted/30">
                      <span className={`text-[10px] font-bold font-satoshi px-2 py-0.5 rounded-full border ${
                        score.wordCount <= 85 ? "bg-green-50 text-green-700 border-green-200"
                        : score.wordCount <= 110 ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {score.wordCount} words {score.wordCount <= 85 ? "✓" : score.wordCount <= 110 ? "- a bit long" : "- too long"}
                      </span>
                      <ScoreBadge ok={score.youCount >= score.iCount} label={score.youCount >= score.iCount ? "Good you/I ratio" : `Too many "I"s`} />
                      <ScoreBadge ok={score.questionCount === 1} label={score.questionCount === 1 ? "1 CTA ✓" : score.questionCount === 0 ? "No CTA" : "Multiple CTAs"} />
                    </div>
                  )}
                </div>

                {/* Variable chips */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-studojo-muted/60 font-satoshi uppercase font-bold">Insert:</span>
                  {["{name}", "{company}", "{title}"].map((v) => (
                    <button
                      key={v}
                      onClick={() => insertAtCursor(v)}
                      className="px-2 py-0.5 bg-studojo-purple/10 text-studojo-purple rounded text-xs font-bold font-satoshi hover:bg-studojo-purple/20 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Preview mode */
              <div className="max-w-2xl mx-auto p-5">
                <div className="rounded-2xl border-2 border-studojo-ink/15 bg-white shadow-sm overflow-hidden">
                  <div className="bg-studojo-surface-muted px-5 py-3 border-b-2 border-studojo-ink/10 space-y-0.5">
                    <p className="text-xs font-satoshi text-studojo-muted">
                      <strong className="text-studojo-ink">To:</strong> {recipientContext.recipientName || "{name}"} · {recipientContext.company || "{company}"}
                    </p>
                    <p className="text-sm font-bold font-satoshi text-studojo-ink">
                      {renderWithHighlights(subject || "(no subject)")}
                    </p>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-sm font-satoshi leading-7 whitespace-pre-line text-studojo-ink">
                      {renderWithHighlights(body || "(empty)")}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-studojo-muted font-satoshi text-center mt-3">
                  Highlighted text = auto-filled per lead when sending
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: AI Chat ── */}
      <div className="w-72 flex-shrink-0 border-l-2 border-studojo-ink/10 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="px-3 py-2.5 border-b-2 border-studojo-ink/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-studojo-purple flex items-center justify-center">
              <FiZap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold font-satoshi text-studojo-ink">AI Assistant</p>
              <p className="text-[10px] text-studojo-muted font-satoshi">
                Changes apply instantly
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] ${msg.role === "user" ? "bg-studojo-purple text-white rounded-2xl rounded-br-sm" : msg.error ? "bg-red-50 text-red-700 border border-red-200 rounded-2xl rounded-bl-sm" : "bg-studojo-surface-muted text-studojo-ink rounded-2xl rounded-bl-sm"} px-3 py-2`}>
                {msg.editScope && msg.role === "assistant" && !msg.error && (
                  <span className="inline-flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold font-satoshi border border-green-200">
                    <FiCheck className="w-2.5 h-2.5" /> {msg.editScope}
                  </span>
                )}
                <p className="text-xs font-satoshi leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-studojo-surface-muted rounded-2xl rounded-bl-sm px-3 py-2">
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

        {/* Quick suggestions (shown when no chat history or few messages) */}
        {chatHistory.filter((m) => m.role === "user").length < 2 && (
          <div className="px-3 pb-2 flex-shrink-0">
            <p className="text-[10px] text-studojo-muted/60 font-satoshi uppercase font-bold mb-1.5">
              Try asking
            </p>
            <div className="space-y-1">
              {[
                "I don't like the subject",
                "Make it sound less desperate",
                "Add a stronger hook",
                "Way too long, cut it",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => sendChatMessage(s)}
                  disabled={chatLoading}
                  className="block w-full text-left px-2.5 py-1.5 rounded-lg bg-studojo-surface-muted text-[11px] font-satoshi text-studojo-ink hover:bg-studojo-purple-bg/50 hover:text-studojo-purple transition-colors border border-studojo-ink/10 disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t-2 border-studojo-ink/10 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
              placeholder="Tell me what to change..."
              disabled={chatLoading}
              className="flex-1 h-9 px-3 rounded-xl border-2 border-studojo-ink/20 text-xs font-satoshi focus:outline-none focus:ring-2 focus:ring-studojo-purple focus:border-studojo-purple disabled:opacity-50"
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 rounded-xl bg-studojo-purple text-white flex items-center justify-center border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
            >
              <FiSend className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────

export function EmailComposer({
  templates,
  initialTemplate,
  savedProfile,
  onTemplateChange,
  onContinue,
  onSaveProfile,
}: EmailComposerProps) {
  type Phase = "style" | "recipient" | "compose";

  const [phase, setPhase] = useState<Phase>(savedProfile ? "recipient" : "style");
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(savedProfile ?? null);
  const [recipientContext, setRecipientContext] = useState<RecipientContext | null>(null);
  const [composeKey, setComposeKey] = useState(0); // remount to start fresh

  const handleStyleComplete = (profile: StyleProfile) => {
    setStyleProfile(profile);
    onSaveProfile?.(profile);
    setPhase("recipient");
  };

  const handleRecipientComplete = (ctx: RecipientContext) => {
    setRecipientContext(ctx);
    setPhase("compose");
  };

  const handleReset = () => {
    setRecipientContext(null);
    setComposeKey((k) => k + 1);
    setPhase("recipient");
  };

  return (
    <>
      {phase === "style" && (
        <StyleProfileSetup initial={styleProfile ?? undefined} onComplete={handleStyleComplete} />
      )}
      {phase === "recipient" && (
        <RecipientSetup
          onComplete={handleRecipientComplete}
          onBack={() => setPhase("style")}
        />
      )}
      {phase === "compose" && styleProfile && recipientContext && (
        <ComposePanel
          key={composeKey}
          templates={templates}
          styleProfile={styleProfile}
          recipientContext={recipientContext}
          onContinue={onContinue}
          onReset={handleReset}
        />
      )}
    </>
  );
}
