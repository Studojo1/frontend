import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { FiUploadCloud, FiLinkedin, FiCheckCircle, FiAlertCircle, FiFileText } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";
import { useOutreachAuth } from "~/lib/outreach/hooks";
import { useOutreachStore } from "~/lib/outreach/store";
import { getToken, ControlPlaneError } from "~/lib/control-plane";
import { fetchWithRetry } from "~/lib/fetch-with-retry";

export default function LinkedInUpload() {
  const navigate = useNavigate();
  useOutreachAuth();
  const { setCandidateId } = useOutreachStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback((files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    const f = files[0];
    if (!/\.(pdf|docx?|txt)$/i.test(f.name)) {
      setError("Please upload a PDF, DOCX or TXT resume.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large, please keep it under 10 MB.");
      return;
    }
    setError("");
    setFile(f);
  }, []);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new ControlPlaneError("Please sign in first", 401);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetchWithRetry(`/api/v1/outreach/candidate/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
        maxRetries: 2,
        timeout: 60_000,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Upload failed");
      setCandidateId(data.candidate_id);
      navigate("/linkedin/onboarding/profile");
    } catch (e: any) {
      setError(e?.body?.detail || e?.message || "Couldn't parse your resume. Try a different file?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-satoshi bg-[#0a66c2]/10 text-[#0a66c2] border-2 border-[#0a66c2]/25 mb-4">
            <FiLinkedin className="w-3.5 h-3.5" /> STEP 1 OF 3
          </span>
          <h1 className="font-clash text-3xl md:text-4xl font-bold text-studojo-ink mb-2">Drop your resume.</h1>
          <p className="text-base text-studojo-muted font-satoshi">We'll figure out who you should connect with on LinkedIn.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed bg-white p-10 md:p-14 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-studojo-purple bg-studojo-purple-bg/30"
              : "border-studojo-ink/40 hover:border-studojo-ink hover:bg-studojo-surface-muted/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-16 h-16 rounded-2xl bg-studojo-purple-bg border-2 border-studojo-ink flex items-center justify-center mx-auto mb-4 text-studojo-purple">
            <FiUploadCloud className="w-8 h-8" />
          </div>
          {file ? (
            <div className="space-y-1">
              <p className="font-bold font-satoshi text-studojo-ink inline-flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-studojo-purple" /> {file.name}
              </p>
              <p className="text-xs text-studojo-muted font-satoshi">{(file.size / 1024).toFixed(0)} KB · ready to upload</p>
            </div>
          ) : (
            <>
              <p className="font-bold font-satoshi text-studojo-ink mb-1">Drag your resume here</p>
              <p className="text-sm text-studojo-muted font-satoshi">…or click to browse. PDF / DOCX / TXT, max 10 MB.</p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 p-3 flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-satoshi text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={upload}
          disabled={!file || uploading}
          className="mt-6 w-full h-12 rounded-xl bg-studojo-purple text-white font-satoshi font-bold text-sm border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
        >
          {uploading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Reading your resume…</>
          ) : (
            <>Continue <FiCheckCircle className="w-4 h-4" /></>
          )}
        </button>

        <div className="mt-6 rounded-xl bg-studojo-surface-muted border border-studojo-ink/10 p-4 text-xs font-satoshi text-studojo-muted">
          <span className="font-bold text-studojo-ink">Privacy:</span> your resume is parsed only to match you with the right contacts. We never share or sell your data. You can delete it any time.
        </div>
      </div>
      <Footer />
    </div>
  );
}
