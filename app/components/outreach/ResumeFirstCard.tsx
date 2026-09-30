import { useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiUpload } from "react-icons/fi";
import { capturePostHog } from "~/lib/posthog";
import {
  MAX_RESUME_BYTES,
  isResumeFile,
  loadResumeDraft,
  saveResumeDraft,
} from "~/lib/outreach/resume-draft";

/**
 * EX-06 experiment (flag `upload-before-signup`): on /auth, an ad visitor on
 * the way to resume upload picks the resume first. The file stays on this
 * device until the account exists; the upload page then sends it straight
 * away. See app/lib/outreach/resume-draft.ts.
 */
export function ResumeFirstCard() {
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // A resume picked earlier (before a Google round trip that failed, say).
  useEffect(() => {
    let live = true;
    void loadResumeDraft().then((f) => {
      if (live && f) setSaved(f.name);
    });
    return () => {
      live = false;
    };
  }, []);

  const onPick = async (f: File | undefined) => {
    if (!f) return;
    if (!isResumeFile(f)) {
      setError("Please pick a PDF or DOCX file.");
      return;
    }
    if (f.size > MAX_RESUME_BYTES) {
      setError("That file is over 10MB. Please pick a smaller PDF or DOCX.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      // Read now: on Android a picked file can stop being readable later (OP-N01).
      await saveResumeDraft(new File([await f.arrayBuffer()], f.name, { type: f.type }));
      setSaved(f.name);
      capturePostHog("upload_before_signup_saved", { file_type: f.type || "unknown", file_size: f.size });
    } catch {
      setError("We could not open that file from your phone. Download it to your phone first, then pick it from Files.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="mb-6 rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
      data-testid="resume-first"
    >
      {saved ? (
        <div className="flex items-start gap-3">
          <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
          <div className="min-w-0">
            <p className="font-['Satoshi'] text-sm font-bold text-neutral-900">Resume ready: {saved}</p>
            <p className="mt-1 font-['Satoshi'] text-sm text-neutral-700">
              Create your account below and we start reading it straight away. It stays on this phone until then.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 inline-flex min-h-11 items-center font-['Satoshi'] text-sm font-medium text-purple-600 underline underline-offset-2"
            >
              Pick a different file
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="font-['Satoshi'] text-base font-bold text-neutral-900">Start with your resume</p>
          <p className="mt-1 font-['Satoshi'] text-sm text-neutral-700">
            Pick it now. We find your hiring managers as soon as your account is ready.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60"
          >
            <FiUpload className="h-5 w-5" aria-hidden />
            {busy ? "Reading…" : "Upload resume (PDF or DOCX)"}
          </button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
      {error && (
        <p className="mt-3 font-['Satoshi'] text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
