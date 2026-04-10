import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { FiUpload, FiFileText, FiCheckCircle } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { ProgressSteps } from "~/components/outreach/ProgressSteps";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { getToken, ControlPlaneError } from "~/lib/control-plane";
import { fetchWithRetry } from "~/lib/fetch-with-retry";
import { capturePostHog } from "~/lib/posthog";
import type { ResumePreview } from "~/lib/outreach/types";

export default function UploadPage() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { setCandidateId, setCurrentStep } = useOutreachStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ResumePreview | null>(null);
  const [error, setError] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.type === "application/pdf" || f.name.endsWith(".docx"))) {
      setFile(f);
      setError("");
    } else {
      setError("Please upload a PDF or DOCX file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new ControlPlaneError("Not authenticated", 401);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithRetry(`/api/v1/outreach/candidate/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        maxRetries: 3,
        timeout: 60_000,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Upload failed");

      setPreview(data.preview);
      setCandidateId(data.candidate_id);
      capturePostHog("resume_uploaded", {
        candidate_id: data.candidate_id,
        skills_count: data.preview?.skills?.length ?? 0,
        experience_years: data.preview?.experience_years ?? null,
        char_count: data.preview?.char_count ?? null,
      });
    } catch (err: any) {
      setError(err?.body?.detail || err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    setCurrentStep(2);
    navigate("/outreach/onboarding/chat");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <ProgressSteps steps={["Upload Resume", "AI Chat", "Your Profile"]} currentStep={1} />

        <div className="mt-8">
          {!preview ? (
            <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8">
              <h1 className="font-clash text-2xl font-bold mb-2 text-studojo-ink">Upload Your Resume</h1>
              <p className="text-sm text-studojo-muted font-satoshi mb-8">
                We'll read your resume and find hiring managers who match your background.
              </p>

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
                  className="h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none"
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
                {preview.char_count != null && (
                  <div>
                    <span className="text-xs font-bold text-studojo-muted uppercase font-satoshi">Resume Length</span>
                    <p className="text-base mt-1 font-satoshi text-studojo-ink">{preview.char_count.toLocaleString()} characters</p>
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

              <div className="mt-8">
                <button
                  onClick={handleContinue}
                  className="h-10 px-5 rounded-xl bg-studojo-purple text-white text-sm font-satoshi font-medium border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
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