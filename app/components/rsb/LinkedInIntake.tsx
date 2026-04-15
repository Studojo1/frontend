import { useRef, useState } from "react";
import { FiUploadCloud, FiCheck, FiArrowRight } from "react-icons/fi";

export type IntakeSubmit = {
  full_name: string;
  linkedin_url?: string;
  pdf?: File;
  resumePdf?: File;
};

export function LinkedInIntake({
  onSubmit,
  submitting,
  requireResume = false,
}: {
  onSubmit: (v: IntakeSubmit) => void;
  submitting: boolean;
  requireResume?: boolean;
}) {
  const [fullName, setFullName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [resumePdf, setResumePdf] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    fullName.trim().length > 1 && !submitting && (!requireResume || !!resumePdf);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      full_name: fullName.trim(),
      linkedin_url: linkedinUrl.trim() || undefined,
      pdf: pdf ?? undefined,
      resumePdf: resumePdf ?? undefined,
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-violet-50 via-white to-amber-50 px-4 py-10 font-['Satoshi']">
      <div className="max-w-[640px] mx-auto bg-white border-2 border-neutral-900 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(25,26,35,1)] p-8 md:p-10">
        <h1 className="font-['Clash_Display'] text-3xl md:text-4xl text-neutral-900 leading-tight mb-2">
          Let's set up your resume.
        </h1>
        <p className="text-neutral-600 mb-8 text-[15px]">
          Drop your LinkedIn PDF and we'll pre-fill the boring parts. You'll chat with the coach for 5 minutes to fill the rest.
        </p>

        <label className="block text-sm font-bold text-neutral-900 mb-2">Your full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Kavya Sharma"
          className="w-full px-4 py-3 border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] mb-5"
        />

        <label className="block text-sm font-bold text-neutral-900 mb-2">
          LinkedIn URL <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <input
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/kavyasharma"
          className="w-full px-4 py-3 border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] mb-6"
        />

        <label className="block text-sm font-bold text-neutral-900 mb-2">
          LinkedIn PDF export <span className="font-normal text-neutral-500">(recommended, not required)</span>
        </label>
        <p className="text-xs text-neutral-500 mb-3">
          On LinkedIn: open your profile, click the "More" button, then "Save to PDF". Upload that file here.
        </p>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`w-full border-2 border-dashed border-neutral-900 rounded-2xl px-4 py-6 flex flex-col items-center gap-2 transition-all ${
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

        {requireResume && (
          <>
            <label className="block text-sm font-bold text-neutral-900 mt-6 mb-2">
              Your existing resume <span className="text-rose-600">(required)</span>
            </label>
            <p className="text-xs text-neutral-500 mb-3">
              We'll mine it for bullets, outcomes, and tools, then merge with your chat answers.
            </p>
            <button
              type="button"
              onClick={() => resumeRef.current?.click()}
              className={`w-full border-2 border-dashed border-neutral-900 rounded-2xl px-4 py-6 flex flex-col items-center gap-2 transition-all ${
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

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="mt-8 w-full bg-violet-500 text-neutral-900 font-bold border-2 border-neutral-900 rounded-xl py-3 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {submitting ? "Setting up..." : "Start the interview"}
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
}
