import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FiX, FiUpload, FiMail, FiFileText, FiTrash2 } from "react-icons/fi";
import { QuestionInput, type Question } from "./question-input";
import { fetchWithRetry } from "~/lib/fetch-with-retry";

interface UploadedResume {
  url: string;
  contentType: string;
  name: string;
  size: number;
}

interface ApplicationFlowProps {
  internshipId: string;
  internshipSlug?: string;
  companyName?: string;
  roleTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationFlow({
  internshipId,
  companyName,
  roleTitle,
  onClose,
  onSuccess,
}: ApplicationFlowProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionResponses, setQuestionResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resume, setResume] = useState<UploadedResume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadQuestions().finally(() => setLoading(false));
  }, []);

  const loadQuestions = async () => {
    try {
      const res = await fetch(`/api/internships/${internshipId}/questions`);
      if (!res.ok) return;
      const data = await res.json();
      const loadedQuestions: Question[] = (data.questions || []).sort(
        (a: Question, b: Question) => (a.order || 0) - (b.order || 0),
      );
      setQuestions(loadedQuestions);
      if (loadedQuestions.length > 0) {
        await loadUserResponses(loadedQuestions);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const loadUserResponses = async (loadedQuestions: Question[]) => {
    try {
      const questionIds = loadedQuestions.map((q) => q.id);
      const tagIds = loadedQuestions
        .map((q) => q.tag_id)
        .filter((id): id is string => id !== null && id !== undefined);

      const params = new URLSearchParams();
      if (questionIds.length > 0) params.append("question_ids", questionIds.join(","));
      if (tagIds.length > 0) params.append("tag_ids", tagIds.join(","));
      if (!params.toString()) return;

      const res = await fetch(`/api/questions/responses?${params.toString()}`);
      if (!res.ok) return;

      const data = await res.json();
      const responses = data.responses || [];
      const autofillMap: Record<string, any> = {};

      responses.forEach((resp: any) => {
        if (questionIds.includes(resp.questionId)) {
          autofillMap[resp.questionId] = resp.response;
        }
      });

      loadedQuestions.forEach((question) => {
        if (!autofillMap[question.id] && question.tag_id) {
          const tagResponse = responses.find(
            (resp: any) => resp.question?.tagId === question.tag_id,
          );
          if (tagResponse) autofillMap[question.id] = tagResponse.response;
        }
      });

      for (const question of loadedQuestions) {
        if (!autofillMap[question.id]) {
          const similarResponse = responses.find((resp: any) => {
            const similarity = calculateSimilarity(
              question.question_text,
              resp.question?.questionText || "",
            );
            return similarity >= 0.8;
          });
          if (similarResponse) autofillMap[question.id] = similarResponse.response;
        }
      }

      setQuestionResponses(autofillMap);
    } catch (error) {
      console.error("Error loading user responses:", error);
    }
  };

  const calculateSimilarity = (text1: string, text2: string): number => {
    const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, "").trim();
    const norm1 = normalize(text1);
    const norm2 = normalize(text2);
    if (norm1 === norm2) return 1.0;
    if (norm1.length === 0 || norm2.length === 0) return 0.0;
    const words1 = new Set(norm1.split(/\s+/));
    const words2 = new Set(norm2.split(/\s+/));
    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  };

  const handleFileSelected = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithRetry("/api/internships/applications/upload", {
        method: "POST",
        body: formData,
        isUpload: true,
        timeout: 5 * 60 * 1000,
        maxRetries: 3,
      });

      if (!res.ok) {
        let errorMessage = "Failed to upload resume";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setResume({
        url: data.url,
        contentType: data.contentType,
        name: data.name,
        size: file.size,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload resume");
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && !submitting) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading || submitting) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  };

  const handleSubmit = async () => {
    if (!resume) {
      toast.error("Please upload your resume before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/internships/${internshipId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_file: {
            url: resume.url,
            contentType: resume.contentType,
            name: resume.name,
          },
          question_responses: questionResponses,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        if (res.status === 409) {
          toast.error(error.error || "You have already applied for this internship");
          onClose();
          return;
        }
        throw new Error(error.error || "Failed to submit application");
      }

      setSubmitted(true);
      onSuccess();
    } catch (error: any) {
      if (!error.message?.includes("already applied")) {
        toast.error(error.message || "Failed to submit application");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border-2 border-neutral-900 bg-white p-6 shadow-lg pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded p-2 text-gray-500 hover:bg-gray-100"
          >
            <FiX className="w-5 h-5" />
          </button>

          <h2 className="mb-6 font-['Clash_Display'] text-3xl font-bold text-neutral-900">
            Apply for Internship
          </h2>

          {submitted ? (
            <div className="rounded-lg bg-neutral-900 p-6 text-white">
              <div className="mb-4">
                <div className="mb-1 font-['Clash_Display'] text-2xl font-bold">
                  Application submitted.
                </div>
                <p className="font-['Satoshi'] text-sm text-neutral-300">
                  You're in the pile. Now get to the top of it. Email the team directly before anyone else does.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={`/outreach${companyName ? `?company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(roleTitle || "")}` : ""}`}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-amber-400 bg-amber-400 px-5 py-3 font-['Satoshi'] font-bold text-neutral-900 transition-colors hover:bg-amber-300"
                >
                  <FiMail className="h-4 w-4 shrink-0" />
                  Email the hiring team
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border-2 border-white/30 bg-white/10 px-5 py-3 font-['Satoshi'] font-bold text-white transition-colors hover:bg-white/20"
                >
                  Browse other internships
                </button>
              </div>
            </div>
          ) : loading ? (
            <p className="font-['Satoshi'] text-gray-600">Loading...</p>
          ) : (
            <div className="space-y-6">
              {questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
                    Application Questions
                  </h3>
                  {questions.map((question) => {
                    const questionText = question.question_text || `Question ${(question.order || 0) + 1}`;
                    return (
                      <div key={question.id} className="space-y-2">
                        <label className="block font-['Satoshi'] font-medium text-neutral-900">
                          {questionText}
                          {question.required && <span className="text-red-500"> *</span>}
                        </label>
                        <QuestionInput
                          question={question}
                          value={questionResponses[question.id]}
                          onChange={(value) => {
                            setQuestionResponses((prev) => ({ ...prev, [question.id]: value }));
                          }}
                          autofilled={!!questionResponses[question.id] && questionResponses[question.id] !== ""}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
                  Your Resume
                </h3>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  disabled={uploading || submitting}
                  className="hidden"
                  id="apply-pdf-upload"
                />

                {resume ? (
                  <div className="flex items-center gap-3 rounded-lg border-2 border-neutral-900 bg-violet-50 px-4 py-3">
                    <FiFileText className="h-6 w-6 flex-shrink-0 text-violet-700" />
                    <div className="min-w-0 flex-1">
                      <p className="font-['Satoshi'] font-medium text-neutral-900 truncate">
                        {resume.name}
                      </p>
                      <p className="font-['Satoshi'] text-xs text-gray-600">
                        {formatSize(resume.size)} · PDF
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResume(null)}
                      disabled={submitting}
                      className="flex flex-shrink-0 items-center gap-1 rounded-lg border-2 border-neutral-900 bg-white px-3 py-1.5 font-['Satoshi'] text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-colors ${
                      uploading
                        ? "border-violet-400 bg-violet-50 cursor-not-allowed"
                        : isDragging
                          ? "border-violet-500 bg-violet-50 scale-[1.02]"
                          : "border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50"
                    }`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="h-2 w-2 rounded-full bg-violet-500 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                        <p className="font-['Satoshi'] text-sm font-medium text-violet-600">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <label
                        htmlFor="apply-pdf-upload"
                        className="flex cursor-pointer flex-col items-center gap-3"
                      >
                        <FiUpload className="h-7 w-7 text-gray-400" />
                        <div className="text-center">
                          <p className="font-['Satoshi'] text-sm font-medium text-neutral-900">
                            {isDragging ? "Drop your PDF here" : "Click to upload or drag and drop"}
                          </p>
                          <p className="mt-1 font-['Satoshi'] text-xs text-gray-500">
                            PDF only · Max 10MB
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                )}

                <p className="font-['Satoshi'] text-xs text-gray-500">
                  The exact file you upload is what the hiring team sees. We don't parse, re-render, or modify it.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!resume || uploading || submitting}
                  className="w-full rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-3 font-['Satoshi'] font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                >
                  {submitting ? "Submitting..." : "Submit application"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="w-full rounded-lg border-2 border-neutral-900 px-6 py-3 font-['Satoshi'] font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50 sm:flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
