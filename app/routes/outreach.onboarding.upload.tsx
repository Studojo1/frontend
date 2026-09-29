import { describeError } from "~/lib/error-detail";
import { useState, useCallback, useEffect } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { FiUpload, FiFileText, FiCheckCircle } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { useOutreachAuth, useNextStep, isPaidNotLaunched, nextStepLabel, nextStepSummary } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { logFunnelStep } from "~/lib/funnel";
import { getToken, ControlPlaneError } from "~/lib/control-plane";
import { fetchWithRetry } from "~/lib/fetch-with-retry";
import { capturePostHog } from "~/lib/posthog";
import { trackMeta } from "~/lib/meta-pixel";
import { track } from "~/lib/analytics";
import type { ResumePreview } from "~/lib/outreach/types";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/outreach.onboarding.upload";

// Meta ads land here. Logged-out visitors used to load the whole page and
// then get bounced to /auth in the browser: the signup form showed after
// 3.5s on an iPhone against 0.7s for /auth directly (PH-04). Redirect on the
// server instead, keeping the query string so UTM and fbclid survive.
export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = new URL(request.url);
    const back = url.pathname + url.search;
    throw redirect(`/auth?mode=signup&redirect=${encodeURIComponent(back)}${url.search ? "&" + url.search.slice(1) : ""}`);
  }
  return null;
}

// The page says "up to 10MB" and the API now enforces it (413).
const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const TOO_BIG = "That file is over 10MB. Please upload a smaller PDF or DOCX, or export your resume again with smaller images.";
const isResumeFile = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf") || f.name.toLowerCase().endsWith(".docx");

export default function UploadPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useOutreachAuth();
  const { setCandidateId, setCurrentStep, clearChatHistory } = useOutreachStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ResumePreview | null>(null);
  const [error, setError] = useState("");
  const [paidOrderOnOldResume, setPaidOrderOnOldResume] = useState(false);
  // OP-N07: the server flags files that read like an invoice or a letter.
  // The upload is kept; the student decides.
  const [notAResume, setNotAResume] = useState(false);
  const userId = user?.id;
  useEffect(() => {
    if (userId) logFunnelStep("upload_view");
  }, [userId]);

  // Qualified handoff from the Career Coach: it passes the student's target
  // companies so this flow starts pre-populated. Stash them for later steps.
  const [searchParams] = useSearchParams();
  const fromCoach = searchParams.get("from") === "coach";
  const coachCompanies = (searchParams.get("companies") || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  useEffect(() => {
    if (fromCoach && coachCompanies.length) {
      try {
        sessionStorage.setItem("coach_target_companies", JSON.stringify(coachCompanies));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCoach]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f || !isResumeFile(f)) {
      setError("Please upload a PDF or DOCX file");
    } else if (f.size > MAX_RESUME_BYTES) {
      setError(TOO_BIG);
    } else {
      setFile(f);
      setError("");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isResumeFile(f)) {
      setError("Please upload a PDF or DOCX file");
    } else if (f.size > MAX_RESUME_BYTES) {
      setError(TOO_BIG);
    } else {
      setFile(f);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    capturePostHog("resume_upload_started", { file_type: file.type || "unknown", file_size: file.size });
    try {
      const token = await getToken();
      if (!token) throw new ControlPlaneError("Not authenticated", 401);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithRetry(`/api/v1/outreach/candidate/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        // One attempt (maxRetries counts attempts). A retry re-ran the OCR on a
        // resume the server had usually already saved, and after three 60s
        // timeouts the student was told to check their connection (UC-Q15).
        maxRetries: 1,
        timeout: 180_000,
      });

      // A too-big body can be refused by the ingress with an HTML page, so
      // check the status before parsing.
      if (res.status === 413) throw Object.assign(new Error("File too large"), { status: 413 });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || "Upload failed");

      // UC-Q14: the same resume as a run that already has leads. The server
      // hands back that candidate and creates nothing, so there is no new quiz
      // to take and no new discovery to wait for: go straight to the leads the
      // student already has. Its quiz is done, so keep its transcript and
      // quiz_completed flag, and skip the resume_uploaded conversion (no new
      // resume was saved).
      if (data?.existing_results) {
        capturePostHog("resume_upload_existing_results", { candidate_id: data.candidate_id });
        setCandidateId(data.candidate_id);
        navigate("/outreach/leads/results?existing=1");
        return;
      }

      setPreview(data.preview);
      setNotAResume(data?.looks_like_resume === false);
      // UC-Q28: a paid order keeps its leads on the earlier resume; this upload
      // starts a separate search. Tell the student so the two lists do not
      // look like one campaign that changed under them.
      setPaidOrderOnOldResume(typeof data.order_candidate_id === "number");
      // A new resume starts a new quiz. Upload can hand back the SAME candidate
      // id (it reuses a row whose quiz never finished), and the quiz page
      // restores any transcript stamped with that id, so without this the old
      // resume's answers would be replayed onto the new one.
      clearChatHistory();
      try {
        localStorage.removeItem(`quiz_completed_${data.candidate_id}`);
      } catch {}
      setCandidateId(data.candidate_id);
      // track() maps resume_uploaded -> Meta Lead, so the admin funnel step and
      // the ad-side conversion can never drift apart.
      track("resume_uploaded", {
        candidate_id: data.candidate_id,
        skills_count: data.preview?.skills?.length ?? 0,
        experience_years: data.preview?.experience_years ?? null,
        char_count: data.preview?.char_count ?? null,
      });
      // Custom event, kept alongside the mapped Lead: it is the activation-rate
      // numerator in Meta's UI. Never optimise against it.
      trackMeta("ResumeUploaded");
      // Uploading a resume IS using Outreach: fire the used signal now (the
      // earliest "they're using the tool" moment), not only at quiz completion.
      if (user?.id) {
        import("~/lib/events").then(({ publishEmailEventFromClient }) => {
          publishEmailEventFromClient("event.cc.outreach_used", {
            user_id: user.id,
            email: user.email,
            name: user.name,
          }).catch(() => {});
        }).catch(() => {});
      }
    } catch (err: any) {
      capturePostHog("resume_upload_failed", { file_type: file?.type || "unknown", reason: describeError(err, "unknown") });
      const msg = String(err?.message || "");
      if (/timeout|timed out|aborted/i.test(msg)) {
        setError("Your resume is still being read. This can take a few minutes for scanned files. Refresh this page in a minute to continue.");
      } else if (err?.status === 413 || /413|too large/i.test(msg)) {
        setError(TOO_BIG);
      } else {
        setError(describeError(err, "Upload failed. Please try again."));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    setCurrentStep(2);
    navigate("/outreach/onboarding/chat");
  };

  // Paid and not launched: uploading again restarts onboarding and does not
  // launch anything. Say so, and put the way to Launch first. Upload still
  // works for anyone who really wants a new resume.
  const nextStep = useNextStep();
  const launchInstead =
    isPaidNotLaunched(nextStep) && nextStep.state !== "needs_profile" ? nextStep : null;

  if (authLoading || !user) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        {launchInstead && (
          <div className="mb-6 rounded-2xl border-2 border-studojo-ink bg-studojo-purple-bg shadow-brutal p-6">
            <p className="font-clash text-lg font-bold text-studojo-ink">
              {launchInstead.has_launched ? "You have credits ready for another campaign." : "You've already paid. Your campaign is waiting."}
            </p>
            <p className="mt-1 text-sm text-studojo-muted font-satoshi">
              {nextStepSummary(launchInstead)}{" "}
              Uploading a new resume starts over; it won't launch anything.
            </p>
            <button
              onClick={() => navigate(`/outreach${launchInstead.path}`)}
              className="mt-4 h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              {nextStepLabel(launchInstead)}
            </button>
          </div>
        )}
        <ProgressSteps steps={["Upload Resume", "AI Chat", "Your Profile"]} currentStep={1} />

        <div className="mt-8">
          {!preview ? (
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8">
              <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Upload Your Resume</h1>
              <p className="text-sm text-studojo-muted font-satoshi mb-4">
                We'll read your resume and find hiring managers who match your background.
              </p>

              {fromCoach && coachCompanies.length > 0 && (
                <div className="mb-8 rounded-xl border-2 border-studojo-purple bg-studojo-purple-bg/50 p-4">
                  <p className="text-sm font-satoshi font-semibold text-studojo-ink mb-1">
                    Brought over from your Career Coach
                  </p>
                  <p className="text-xs font-satoshi text-studojo-muted">
                    We'll target the companies you've been working towards:{" "}
                    <span className="font-semibold text-studojo-ink">{coachCompanies.join(", ")}</span>.
                  </p>
                </div>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-studojo-ink/30 rounded-2xl p-12 text-center hover:border-studojo-purple hover:bg-studojo-purple-bg/50 transition-all cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <FiUpload className="w-12 h-12 text-studojo-muted mx-auto mb-4" />
                <p className="text-base text-studojo-ink font-satoshi mb-2">
                  {file ? file.name : "Drop your resume here, or click to browse"}
                </p>
                <p className="text-sm text-studojo-muted font-satoshi">PDF or DOCX, up to 10MB</p>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="flex items-center gap-4 mt-6 p-4 bg-studojo-surface-muted rounded-xl border-2 border-studojo-ink/20">
                  <FiFileText className="w-5 h-5 text-studojo-purple" />
                  <span className="text-sm flex-1 font-satoshi text-studojo-ink">{file.name}</span>
                  <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}

              {error && <p className="text-sm text-red-600 mt-4 font-satoshi">{error}</p>}

              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="h-12 w-full md:w-auto px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
                >
                  {uploading ? "Analyzing..." : "Upload & Analyze"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <FiCheckCircle className="w-6 h-6 text-studojo-green" />
                <h2 className="font-clash text-2xl font-bold text-studojo-ink">Resume Analyzed</h2>
              </div>

              {paidOrderOnOldResume && (
                <div className="mb-6 rounded-xl border-2 border-studojo-ink bg-studojo-purple-bg p-4" role="status">
                  <p className="text-sm font-satoshi font-semibold text-studojo-ink">Your paid campaign is unchanged.</p>
                  <p className="mt-1 text-sm font-satoshi text-studojo-muted">
                    It keeps using the hiring managers found from your earlier resume. This new resume starts a fresh search.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {preview.name && (
                  <div>
                    <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi">Name</span>
                    <p className="text-base mt-1 font-satoshi text-studojo-ink">{preview.name}</p>
                  </div>
                )}
                {preview.email && (
                  <div>
                    <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi">Email</span>
                    <p className="text-base mt-1 font-satoshi text-studojo-ink">{preview.email}</p>
                  </div>
                )}
                {preview.experience_years != null && (
                  <div>
                    <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi">Experience</span>
                    <p className="text-base mt-1 font-satoshi text-studojo-ink">{preview.experience_years} years</p>
                  </div>
                )}
              </div>

              {preview.skills && preview.skills.length > 0 && (
                <div className="mt-6">
                  <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi">Skills Detected</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {preview.skills.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-purple-bg text-studojo-purple border border-studojo-purple/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preview.education && preview.education.length > 0 && (
                <div className="mt-6">
                  <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi">Education</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {preview.education.map((e) => (
                      <span key={e} className="px-2.5 py-0.5 rounded-full text-xs font-satoshi font-medium bg-studojo-surface-muted text-studojo-muted border border-studojo-ink/20">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notAResume && (
                <div className="mt-6 rounded-xl border-2 border-amber-500 bg-amber-50 px-4 py-3" role="alert">
                  <p className="font-satoshi text-sm font-bold text-amber-900">This does not look like a resume. Upload a different file?</p>
                  <p className="font-satoshi text-sm text-amber-800 mt-1">We could not find sections like education, experience or skills. Hiring managers are matched from your resume, so the right file matters.</p>
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setFile(null); setNotAResume(false); }}
                    className="mt-3 h-10 px-4 rounded-xl bg-white text-studojo-ink text-sm font-satoshi font-bold border-2 border-studojo-ink"
                  >
                    Upload a different file
                  </button>
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={handleContinue}
                  className="h-12 w-full md:w-auto px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  Build My Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}