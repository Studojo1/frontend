import { useRef, useState } from "react";
import { FiUploadCloud, FiCheck, FiArrowRight, FiArrowLeft } from "react-icons/fi";

export type IntakeSubmit = {
  full_name: string;
  resume_label?: string;
  linkedin_url?: string;
  pdf?: File;
  resumePdf?: File;
};

type Step = "ask" | "linkedin" | "name";

export function LinkedInIntake({
  onSubmit,
  submitting,
  requireResume = false,
}: {
  onSubmit: (v: IntakeSubmit) => void;
  submitting: boolean;
  requireResume?: boolean;
}) {
  const [step, setStep] = useState<Step>("ask");
  const [hasLinkedIn, setHasLinkedIn] = useState<boolean | null>(null);
  const [fullName, setFullName] = useState("");
  const [resumeLabel, setResumeLabel] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [resumePdf, setResumePdf] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    fullName.trim().length > 1 && !submitting && (!requireResume || !!resumePdf);

  // Explain why submit is disabled so users aren't stuck on a silently greyed-out button.
  const missingReason: string | null = (() => {
    if (submitting) return null;
    if (fullName.trim().length <= 1) return "Add your full name to continue.";
    if (requireResume && !resumePdf) return "Upload your existing resume to continue.";
    return null;
  })();

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      full_name: fullName.trim(),
      resume_label: resumeLabel.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      pdf: pdf ?? undefined,
      resumePdf: resumePdf ?? undefined,
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-violet-50 via-white to-amber-50 px-4 py-10 font-['Satoshi']">
      <div className="max-w-[640px] mx-auto bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8 md:p-10">

        {/* Step: ask */}
        {step === "ask" && (
          <>
            <h1 className="font-['Clash_Display'] text-3xl md:text-4xl text-neutral-900 leading-tight mb-3">
              Do you have a LinkedIn profile?
            </h1>
            <p className="text-neutral-500 text-[15px] mb-10">
              If you do, we can pre-fill most of your resume automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => { setHasLinkedIn(true); setStep("linkedin"); }}
                className="flex-1 py-4 bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all text-lg"
              >
                Yes, I do
              </button>
              <button
                type="button"
                onClick={() => { setHasLinkedIn(false); setStep("name"); }}
                className="flex-1 py-4 bg-white text-neutral-700 font-bold border-2 border-neutral-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all text-lg"
              >
                No, skip this
              </button>
            </div>
          </>
        )}

        {/* Step: linkedin */}
        {step === "linkedin" && (
          <>
            <button
              type="button"
              onClick={() => setStep("ask")}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="font-['Clash_Display'] text-3xl md:text-4xl text-neutral-900 leading-tight mb-3">
              Add your LinkedIn.
            </h1>
            <p className="text-neutral-500 text-[15px] mb-7">
              Paste your profile URL, or upload your LinkedIn PDF export for the best results.
            </p>

            <label className="block text-sm font-bold text-neutral-900 mb-2">
              LinkedIn URL <span className="font-normal text-neutral-500">(optional)</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-4 py-3 border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] mb-6"
            />

            <label className="block text-sm font-bold text-neutral-900 mb-1">
              LinkedIn PDF export <span className="font-normal text-neutral-500">(recommended)</span>
            </label>
            <p className="text-xs text-neutral-500 mb-3">
              On LinkedIn: open your profile, click "More", then "Save to PDF".
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full border-2 border-dashed border-neutral-900 rounded-2xl px-4 py-6 flex flex-col items-center gap-2 transition-all mb-8 ${
                pdf ? "bg-violet-50" : "bg-neutral-50 hover:bg-violet-50"
              }`}
            >
              {pdf ? (
                <>
                  <FiCheck className="w-6 h-6 text-emerald-600" />
                  <span className="text-sm font-bold text-neutral-900">{pdf.name}</span>
                  <span className="text-xs text-neutral-500">Click to replace</span>
                </>
              ) : (
                <>
                  <FiUploadCloud className="w-7 h-7 text-neutral-700" />
                  <span className="text-sm font-bold text-neutral-900">Upload LinkedIn PDF</span>
                  <span className="text-xs text-neutral-500">PDF only, under 10 MB</span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPdf(f);
              }}
            />

            <button
              type="button"
              onClick={() => setStep("name")}
              className="w-full bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl py-3 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all flex items-center justify-center gap-2"
            >
              Next <FiArrowRight />
            </button>
          </>
        )}

        {/* Step: name */}
        {step === "name" && (
          <>
            <button
              type="button"
              onClick={() => setStep(hasLinkedIn ? "linkedin" : "ask")}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-6 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="font-['Clash_Display'] text-3xl md:text-4xl text-neutral-900 leading-tight mb-3">
              Last thing - your name.
            </h1>
            <p className="text-neutral-500 text-[15px] mb-7">
              We'll use this on your resume.
            </p>

            <label className="block text-sm font-bold text-neutral-900 mb-2">Your full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Kavya Sharma"
              autoFocus
              className="w-full px-4 py-3 border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] mb-5"
            />

            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Resume name <span className="font-normal text-neutral-500">(optional)</span>
            </label>
            <input
              type="text"
              value={resumeLabel}
              onChange={(e) => setResumeLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="e.g. Google SWE Intern, Summer 2025"
              className="w-full px-4 py-3 border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] mb-5"
            />

            {requireResume && (
              <>
                <label className="block text-sm font-bold text-neutral-900 mb-1">
                  Your existing resume <span className="text-rose-600">(required)</span>
                </label>
                <p className="text-xs text-neutral-500 mb-3">
                  We'll mine it for bullets, outcomes, and tools.
                </p>
                <button
                  type="button"
                  onClick={() => resumeRef.current?.click()}
                  className={`w-full border-2 border-dashed border-neutral-900 rounded-2xl px-4 py-6 flex flex-col items-center gap-2 transition-all mb-6 ${
                    resumePdf ? "bg-amber-50" : "bg-neutral-50 hover:bg-amber-50"
                  }`}
                >
                  {resumePdf ? (
                    <>
                      <FiCheck className="w-6 h-6 text-emerald-600" />
                      <span className="text-sm font-bold text-neutral-900">{resumePdf.name}</span>
                      <span className="text-xs text-neutral-500">Click to replace</span>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud className="w-7 h-7 text-neutral-700" />
                      <span className="text-sm font-bold text-neutral-900">Upload your resume PDF</span>
                      <span className="text-xs text-neutral-500">PDF only, under 10 MB</span>
                    </>
                  )}
                </button>
                <input
                  ref={resumeRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setResumePdf(f);
                  }}
                />
              </>
            )}

            {missingReason && (
              <p
                role="status"
                aria-live="polite"
                className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-center"
              >
                {missingReason}
              </p>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              aria-describedby={missingReason ? "submit-help" : undefined}
              className="w-full bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl py-3 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {submitting ? "Setting up..." : "Start the interview"}
              <FiArrowRight />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
