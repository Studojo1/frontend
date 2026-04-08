import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FiX, FiAlertCircle, FiUpload } from "react-icons/fi";
import { QuestionInput, type Question } from "./question-input";
import { ImportResumeModal } from "~/components/resumes/import-resume-modal";
import { fetchWithRetry } from "~/lib/fetch-with-retry";

const RESUME_LIMIT = 4;

interface Resume {
  id: string;
  name: string;
  resumeData: any;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationFlowProps {
  internshipId: string;
  internshipSlug?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationFlow({
  internshipId,
  internshipSlug,
  onClose,
  onSuccess,
}: ApplicationFlowProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionResponses, setQuestionResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [tab, setTab] = useState<"studojo" | "upload">("studojo");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadResumes(), loadQuestions()]);
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const [v2Res, v1Res] = await Promise.all([
        fetch("/api/v2/resumes").catch(() => null),
        fetch("/api/resumes").catch(() => null),
      ]);

      const allResumes: Resume[] = [];

      if (v2Res?.ok) {
        const v2Data = await v2Res.json();
        const drafts = (v2Data.drafts || []).map((draft: any) => ({
          id: draft.id,
          name: draft.name,
          resumeData: draft.sections,
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
        }));
        allResumes.push(...drafts);
      }

      if (v1Res?.ok) {
        const v1Data = await v1Res.json();
        const legacyResumes = (v1Data.resumes || []).map((resume: any) => ({
          id: resume.id,
          name: resume.name,
          resumeData: resume.resumeData,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
        }));
        allResumes.push(...legacyResumes);
      }

      allResumes.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setResumes(allResumes);
      if (allResumes.length > 0) {
        setSelectedResumeId(allResumes[0].id);
      }
    } catch (error) {
      toast.error("Failed to load resumes");
      console.error(error);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await fetch(`/api/internships/${internshipId}/questions`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      const loadedQuestions = (data.questions || []).sort((a: Question, b: Question) =>
        (a.order || 0) - (b.order || 0)
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
      if (questionIds.length > 0) {
        params.append("question_ids", questionIds.join(","));
      }
      if (tagIds.length > 0) {
        params.append("tag_ids", tagIds.join(","));
      }

      if (params.toString()) {
        const res = await fetch(`/api/questions/responses?${params.toString()}`);
        if (res.ok) {
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
                (resp: any) => resp.question?.tagId === question.tag_id
              );
              if (tagResponse) {
                autofillMap[question.id] = tagResponse.response;
              }
            }
          });

          for (const question of loadedQuestions) {
            if (!autofillMap[question.id]) {
              const similarResponse = responses.find((resp: any) => {
                const similarity = calculateSimilarity(
                  question.question_text,
                  resp.question?.questionText || ""
                );
                return similarity >= 0.8;
              });
              if (similarResponse) {
                autofillMap[question.id] = similarResponse.response;
              }
            }
          }

          setQuestionResponses(autofillMap);
        }
      }
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

  const generateSmartResumeName = (resumeData: any, existingResumes: Resume[]): string => {
    let baseName = "My Resume";

    if (resumeData.title) {
      baseName = resumeData.title;
    } else if (resumeData.contact_info?.name) {
      baseName = `${resumeData.contact_info.name}'s Resume`;
    } else if (resumeData.contact_info?.email) {
      const emailName = resumeData.contact_info.email.split("@")[0];
      baseName = `${emailName}'s Resume`;
    }

    const existingNames = existingResumes.map((r) => r.name.toLowerCase().trim());
    let finalName = baseName;
    let counter = 1;

    while (existingNames.includes(finalName.toLowerCase().trim())) {
      finalName = `${baseName} (${counter})`;
      counter++;
    }

    return finalName;
  };

  const handleResumeImport = async (resumeData: any) => {
    try {
      const name = generateSmartResumeName(resumeData, resumes);
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, resumeData }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Failed to save resume";
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      toast.success("Resume imported and saved");

      await loadResumes();

      if (data.resume) {
        setSelectedResumeId(data.resume.id);
      }

      setImportModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to import resume");
      throw error;
    }
  };

  const submitWithResume = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/internships/${internshipId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_id: resumeId,
          question_responses: questionResponses,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (res.status === 409) {
          toast.error(error.error || "You have already applied for this internship");
          onClose();
          return;
        }
        throw new Error(error.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      onSuccess();
    } catch (error: any) {
      if (error.message && !error.message.includes("already applied")) {
        toast.error(error.message || "Failed to submit application");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithResumeData = async (resumeData: any) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/internships/${internshipId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_data: resumeData,
          question_responses: questionResponses,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (res.status === 409) {
          toast.error(error.error || "You have already applied for this internship");
          onClose();
          return;
        }
        throw new Error(error.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      onSuccess();
    } catch (error: any) {
      if (error.message && !error.message.includes("already applied")) {
        toast.error(error.message || "Failed to submit application");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB");
      return;
    }

    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithRetry("/api/resumes/parse", {
        method: "POST",
        body: formData,
        isUpload: true,
        timeout: 10 * 60 * 1000,
        maxRetries: 3,
      });

      if (!res.ok) {
        let errorMessage = "Failed to parse PDF";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (!data.resumeData) {
        throw new Error("No resume data returned from server");
      }

      await submitWithResumeData(data.resumeData);
    } catch (error: any) {
      toast.error(error.message || "Failed to process PDF");
      console.error(error);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isParsing && !submitting) setIsDragging(true);
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
    if (isParsing || submitting) return;
    const file = e.dataTransfer.files[0];
    if (file) handlePdfUpload(file);
  };

  return (
    <>
      {/* Backdrop */}
      {!importModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Modal */}
      {!importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="relative w-full max-w-2xl rounded-lg border-2 border-neutral-900 bg-white p-6 shadow-lg pointer-events-auto"
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

            {loading ? (
              <p className="font-['Satoshi'] text-gray-600">Loading resumes...</p>
            ) : (
              <div className="space-y-6">
                {/* Questions */}
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
                              setQuestionResponses((prev) => ({
                                ...prev,
                                [question.id]: value,
                              }));
                            }}
                            autofilled={!!questionResponses[question.id] && questionResponses[question.id] !== ""}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab switcher */}
                <div className="flex rounded-lg border-2 border-neutral-900 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTab("studojo")}
                    className={`flex-1 py-2.5 font-['Satoshi'] text-sm font-bold transition-colors ${
                      tab === "studojo"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    Use a Studojo Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("upload")}
                    className={`flex-1 py-2.5 font-['Satoshi'] text-sm font-bold transition-colors border-l-2 border-neutral-900 ${
                      tab === "upload"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    Upload your own PDF
                  </button>
                </div>

                {/* Tab: Studojo Resume */}
                {tab === "studojo" && (
                  <div>
                    {resumes.length === 0 ? (
                      <div className="space-y-4">
                        <p className="font-['Satoshi'] text-gray-600">
                          You don't have any resumes yet. Import one or switch to the upload tab.
                        </p>
                        <button
                          type="button"
                          onClick={() => setImportModalOpen(true)}
                          className="inline-block rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-2 font-['Satoshi'] font-medium text-white transition-colors hover:bg-violet-700"
                        >
                          Import Resume
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <label className="font-['Satoshi'] font-medium text-neutral-900">
                            Choose a resume to apply with
                          </label>
                          {resumes.length < RESUME_LIMIT && (
                            <button
                              type="button"
                              onClick={() => setImportModalOpen(true)}
                              className="text-xs font-['Satoshi'] font-medium text-violet-600 hover:underline"
                            >
                              + Import resume
                            </button>
                          )}
                        </div>

                        {resumes.length >= RESUME_LIMIT && (
                          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
                            <FiAlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
                            <p className="font-['Satoshi'] text-xs text-amber-800">
                              4 resume limit reached. Delete a resume to import a new one.
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          {resumes.map((resume) => (
                            <div
                              key={resume.id}
                              className="flex items-center gap-3 rounded-lg border-2 border-neutral-900 p-4"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-['Satoshi'] font-medium text-neutral-900 truncate">
                                  {resume.name}
                                </p>
                                <p className="text-xs font-['Satoshi'] text-gray-500">
                                  {new Date(resume.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => submitWithResume(resume.id)}
                                className="flex-shrink-0 rounded-lg border-2 border-neutral-900 bg-violet-600 px-4 py-2 font-['Satoshi'] text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting && selectedResumeId === resume.id ? "Applying..." : "Apply"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Upload PDF */}
                {tab === "upload" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileInputChange}
                      disabled={isParsing || submitting}
                      className="hidden"
                      id="apply-pdf-upload"
                    />
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-colors ${
                        isParsing || submitting
                          ? "border-violet-400 bg-violet-50 cursor-not-allowed"
                          : isDragging
                          ? "border-violet-500 bg-violet-50 scale-[1.02]"
                          : "border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50"
                      }`}
                    >
                      {isParsing ? (
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
                            {submitting ? "Submitting application..." : "Processing PDF with AI..."}
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
                              PDF only · Max 10MB · We'll parse and apply directly
                            </p>
                          </div>
                        </label>
                      )}
                    </div>
                    <p className="mt-2 font-['Satoshi'] text-xs text-gray-500 text-center">
                      Your PDF won't be saved to your profile — it's used for this application only.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-lg border-2 border-neutral-900 px-6 py-3 font-['Satoshi'] font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ImportResumeModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleResumeImport}
      />
    </>
  );
}
