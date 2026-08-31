// Express onboarding for students who arrived through the extension.
//
// IMPORTANT: this is a SEPARATE path from the outreach tool's onboarding. It
// does not modify or reuse `outreach.onboarding.*` routes, and it does not
// touch the quiz engine in job-outreach-svc. That funnel is live and working;
// this one exists because a student who came from a job page has already made
// their choice and should not be walked through a 10-question profile builder
// before they can send one email.
//
// It asks four things, and only four, because that is what the cold-email
// framework actually consumes from the sender (see buildStyleContext in
// api.outreach.email-chat.tsx — every field is optional and read through
// `if (p.x)`):
//
//   1. career stage    — the same first question the main quiz asks
//   2. university       → the BRIDGE
//   3. best credential  → the BRIDGE. The framework calls this out explicitly
//                         as "evidence not a claim"; it is the single
//                         highest-leverage answer.
//   4. tone             → maps to the existing `tone` field
//
// Everything else a cold email needs — the company, the role, the contact and
// their title — the extension already read off the page. The main quiz's extra
// questions produce lead SCORING signals, which this path does not use: the
// student already chose the lead by opening the job.
import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { Footer, Header } from "~/components";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/crm.setup";

export function meta() {
  return [{ title: "Set up outreach · Studojo" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect(`/auth?redirect=${encodeURIComponent("/crm/setup")}`);
  return null;
}

/** Kept identical to the main quiz's first question so the two never diverge. */
const CAREER_STAGE = [
  "Student, not graduating soon",
  "Student, graduating within 6 months",
  "Recent graduate (0-2 years exp.)",
  "Experienced professional (3+ years)",
  "Switching careers / exploring new fields",
  "Other",
];

const TONES = [
  { id: "direct", label: "Direct", hint: "Confident, no filler" },
  { id: "warm", label: "Warm", hint: "Conversational, genuine" },
  { id: "formal", label: "Professional", hint: "Polished, still personal" },
];

export default function CrmSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [answers, setAnswers] = useState({
    careerStage: "",
    university: "",
    topCredential: "",
    tone: "warm",
  });

  // The resume upload is deliberately UNCHANGED from the main flow: same
  // endpoint, same accepted types. It is also the only way to mint a
  // candidate_id, which is what Send needs.
  async function uploadResume(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/outreach/candidate/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Upload failed");
      setStep(1);
    } catch (e: any) {
      setUploadError(e?.message ?? "Could not read that file.");
    } finally {
      setUploading(false);
    }
  }

  async function finish() {
    // Regenerate every unsent draft with the answers we just collected.
    try {
      const list = await fetch("/api/crm/drafts").then((r) => r.json());
      const pending = (list?.drafts ?? []).filter((d: any) => d.status === "draft");
      await Promise.all(
        pending.map((d: any) =>
          fetch("/api/crm/drafts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: d.id,
              intent: "regenerate",
              profile: {
                university: answers.university,
                topCredential: answers.topCredential,
                careerStage: answers.careerStage,
                tone: answers.tone,
              },
            }),
          }),
        ),
      );
    } catch {
      /* the drafts still exist; they are just not rewritten */
    }
    navigate("/crm");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-studojo-muted">
            Step {Math.min(step + 1, 5)} of 5
          </p>
          <h1 className="mb-6 mt-2 font-['Clash_Display'] text-3xl font-bold text-studojo-ink">
            {step === 0 ? "Add your resume" : "Four quick questions"}
          </h1>

          {step === 0 ? (
            <div>
              <p className="mb-4 font-['Satoshi'] text-studojo-muted">
                We read it once to find your strongest credential. Your emails go out
                from your own Gmail — the resume is not attached to them.
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadResume(f);
                }}
                className="block w-full rounded-xl border-2 border-dashed border-studojo-ink/30 p-6 font-['Satoshi']"
              />
              {uploading ? (
                <p className="mt-3 font-['Satoshi'] text-sm text-studojo-muted">Reading…</p>
              ) : null}
              {uploadError ? (
                <p className="mt-3 font-['Satoshi'] text-sm text-red-700">{uploadError}</p>
              ) : null}
              <button
                onClick={() => navigate("/crm")}
                className="mt-6 font-['Satoshi'] text-sm text-studojo-muted underline"
              >
                Skip — I'll write the emails myself
              </button>
            </div>
          ) : null}

          {step === 1 ? (
            <Question title="Which best describes you right now?">
              {CAREER_STAGE.map((opt) => (
                <Choice
                  key={opt}
                  label={opt}
                  selected={answers.careerStage === opt}
                  onSelect={() => {
                    setAnswers({ ...answers, careerStage: opt });
                    setStep(2);
                  }}
                />
              ))}
            </Question>
          ) : null}

          {step === 2 ? (
            <Question title="Where do you study or work?">
              <input
                autoFocus
                value={answers.university}
                onChange={(e) => setAnswers({ ...answers, university: e.target.value })}
                placeholder="BITS Pilani"
                className="w-full rounded-xl border-2 border-studojo-ink/20 px-4 py-3 font-['Satoshi']"
              />
              <Next onClick={() => setStep(3)} disabled={!answers.university.trim()} />
            </Question>
          ) : null}

          {step === 3 ? (
            <Question
              title="What's the single best thing you've done?"
              hint="One specific, real thing. “Built a fintech newsletter with 2,000 readers” beats “strong communication skills”."
            >
              <textarea
                autoFocus
                rows={3}
                value={answers.topCredential}
                onChange={(e) => setAnswers({ ...answers, topCredential: e.target.value })}
                placeholder="Built a fintech newsletter with 2,000 readers"
                className="w-full rounded-xl border-2 border-studojo-ink/20 px-4 py-3 font-['Satoshi']"
              />
              <Next onClick={() => setStep(4)} disabled={!answers.topCredential.trim()} />
            </Question>
          ) : null}

          {step === 4 ? (
            <Question title="How should your emails sound?">
              {TONES.map((t) => (
                <Choice
                  key={t.id}
                  label={t.label}
                  hint={t.hint}
                  selected={answers.tone === t.id}
                  onSelect={() => setAnswers({ ...answers, tone: t.id })}
                />
              ))}
              <Next onClick={finish} label="Rewrite my emails" />
            </Question>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Question({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-1 font-['Satoshi'] text-xl font-semibold text-studojo-ink">{title}</h2>
      {hint ? <p className="mb-4 font-['Satoshi'] text-sm text-studojo-muted">{hint}</p> : null}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Choice({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl border-2 px-4 py-3 text-left font-['Satoshi'] transition-all ${
        selected
          ? "border-studojo-ink bg-studojo-purple-bg"
          : "border-studojo-ink/20 hover:border-studojo-ink/40"
      }`}
    >
      <span className="font-medium text-studojo-ink">{label}</span>
      {hint ? <span className="block text-sm text-studojo-muted">{hint}</span> : null}
    </button>
  );
}

function Next({
  onClick,
  disabled,
  label = "Next",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-2 self-start rounded-2xl border-2 border-studojo-ink bg-studojo-purple px-6 py-3 font-['Satoshi'] font-medium text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50"
    >
      {label}
    </button>
  );
}
