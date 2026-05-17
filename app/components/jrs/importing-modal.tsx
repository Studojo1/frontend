// Full-screen overlay shown while we parse an uploaded resume PDF or
// LinkedIn screenshots. Backdrop blur + brutalist card + animated dots.
import { FiFileText, FiCheck } from "react-icons/fi";

export function ImportingModal({
  open,
  fileName,
  error,
  onDismiss,
}: {
  open: boolean;
  fileName?: string;
  error?: string;
  onDismiss?: () => void;
}) {
  if (!open && !error) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Importing your resume"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] font-['Satoshi']">
        {error ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-neutral-900 bg-rose-100">
              <span className="text-xl text-rose-700">!</span>
            </div>
            <h2 className="mt-4 font-['Clash_Display'] text-2xl text-neutral-900">
              We couldn't read that
            </h2>
            <p className="mt-1.5 text-sm text-neutral-600">{error}</p>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-5 w-full rounded-xl border-2 border-neutral-900 bg-violet-500 px-4 py-2.5 font-bold text-white shadow-[3px_3px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(25,26,35,1)]"
            >
              Try another file
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 text-white">
                <FiFileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-['Clash_Display'] text-2xl leading-tight text-neutral-900">
                  Reading your resume
                </h2>
                {fileName && (
                  <p className="mt-0.5 truncate text-sm text-neutral-600">{fileName}</p>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <Step label="Uploaded" done />
              <Step label="Extracting text and structure" loading />
              <Step label="Filling your resume" pending />
            </div>

            <p className="mt-5 text-xs text-neutral-500">
              This usually takes 5 to 15 seconds. Hang tight.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Step({
  label,
  done,
  loading,
  pending,
}: {
  label: string;
  done?: boolean;
  loading?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 ${
          done ? "bg-emerald-400" : loading ? "bg-violet-500" : "bg-neutral-100"
        }`}
        aria-hidden
      >
        {done && <FiCheck className="h-3.5 w-3.5 text-neutral-900" strokeWidth={3} />}
        {loading && (
          <span className="flex gap-0.5">
            <span className="h-1 w-1 animate-bounce rounded-full bg-white [animation-delay:0ms]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-white [animation-delay:120ms]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-white [animation-delay:240ms]" />
          </span>
        )}
      </span>
      <span
        className={`text-sm font-semibold ${
          pending ? "text-neutral-400" : "text-neutral-800"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
