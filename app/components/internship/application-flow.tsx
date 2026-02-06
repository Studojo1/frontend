import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import { QuestionInput, type Question } from "./question-input";
import { ImportResumeModal } from "~/components/resumes/import-resume-modal";

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
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to load resumes");
      const data = await res.json();
      setResumes(data.resumes || []);
      if (data.resumes && data.resumes.length > 0) {
        setSelectedResumeId(data.resumes[0].id);
      }
    } catch (error) {
      toast.error("Failed to load resumes");
      console.error(error);
    }
  };

  const loadQuestions = async () => {
    try {
      console.log("Loading questions for internship:", internshipId);
      const res = await fetch(`/api/internships/${internshipId}/questions`);
      console.log("Questions API response status:", res.status);
      if (!res.ok) {
        // Questions endpoint might not exist yet, that's okay
        if (res.status !== 404) {
          console.error("Failed to load questions:", res.status, res.statusText);
        } else {
          console.log("No questions endpoint found (404)");
        }
        return;
      }
      const data = await res.json();
      console.log("Questions data:", data);
      console.log("Questions data stringified:", JSON.stringify(data, null, 2));
      const loadedQuestions = (data.questions || []).sort((a: Question, b: Question) => 
        (a.order || 0) - (b.order || 0)
      );
      console.log("Loaded questions:", loadedQuestions.length);
      console.log("First question structure:", loadedQuestions[0] ? {
        id: loadedQuestions[0].id,
        question_text: loadedQuestions[0].question_text,
        question_type: loadedQuestions[0].question_type,
        hasQuestionText: !!loadedQuestions[0].question_text,
        questionTextValue: loadedQuestions[0].question_text,
        questionTextType: typeof loadedQuestions[0].question_text,
        keys: Object.keys(loadedQuestions[0] || {}),
        fullQuestion: loadedQuestions[0]
      } : "No questions");
      console.log("All questions details:", loadedQuestions.map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        order: q.order,
        allKeys: Object.keys(q),
        fullObject: q
      })));
      console.log("Raw questions array:", loadedQuestions);
      console.log("First question full object:", JSON.stringify(loadedQuestions[0], null, 2));
      setQuestions(loadedQuestions);

      // Load user's previous responses for autofill
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

          // Build autofill map
          const autofillMap: Record<string, any> = {};

          // Direct matches (same question_id)
          responses.forEach((resp: any) => {
            if (questionIds.includes(resp.questionId)) {
              autofillMap[resp.questionId] = resp.response;
            }
          });

          // Tag matches (similar questions with same tag)
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

          // Similarity matches (fuzzy matching)
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

  // Simple similarity calculation
  const calculateSimilarity = (text1: string, text2: string): number => {
    const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, "").trim();
    const norm1 = normalize(text1);
    const norm2 = normalize(text2);
    
    if (norm1 === norm2) return 1.0;
    if (norm1.length === 0 || norm2.length === 0) return 0.0;
    
    // Simple word overlap similarity
    const words1 = new Set(norm1.split(/\s+/));
    const words2 = new Set(norm2.split(/\s+/));
    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  const generateSmartResumeName = (resumeData: any, existingResumes: Resume[]): string => {
    // Try to extract a meaningful name from resume data
    let baseName = "My Resume";
    
    if (resumeData.title) {
      baseName = resumeData.title;
    } else if (resumeData.contact_info?.name) {
      baseName = `${resumeData.contact_info.name}'s Resume`;
    } else if (resumeData.contact_info?.email) {
      const emailName = resumeData.contact_info.email.split("@")[0];
      baseName = `${emailName}'s Resume`;
    }

    // Check for duplicates and append number if needed
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
      
      // Refresh resume list
      await loadResumes();
      
      // Auto-select the newly imported resume
      if (data.resume) {
        setSelectedResumeId(data.resume.id);
      }
      
      // Close import modal
      setImportModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to import resume");
      throw error; // Re-throw so ImportResumeModal can handle it
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResumeId) {
      toast.error("Please select a resume");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/internships/${internshipId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_id: selectedResumeId,
          question_responses: questionResponses,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        
        // Handle duplicate application (409 Conflict)
        if (res.status === 409) {
          toast.error(error.error || "You have already applied for this internship");
          onClose(); // Close modal on duplicate application
          return;
        }
        
        throw new Error(error.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      onSuccess();
    } catch (error: any) {
      // Only show error if it's not a duplicate (which we already handled)
      if (error.message && !error.message.includes("already applied")) {
        toast.error(error.message || "Failed to submit application");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      {/* Modal */}
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
        ) : resumes.length === 0 ? (
          <div className="space-y-4">
            <p className="font-['Satoshi'] text-gray-600">
              You don't have any resumes yet. Please import a resume to continue.
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-['Clash_Display'] text-xl font-bold text-neutral-900">
                  Application Questions
                </h3>
                {questions.map((question) => {
                  // Debug: log question structure
                  console.log("Rendering question:", {
                    id: question.id,
                    question_text: question.question_text,
                    question_type: question.question_type,
                    hasQuestionText: !!question.question_text,
                    questionTextValue: question.question_text,
                    questionTextType: typeof question.question_text,
                    allKeys: Object.keys(question),
                    fullQuestion: question
                  });
                  
                  if (!question.question_text) {
                    console.warn("Question missing question_text:", question);
                  }
                  const questionText = question.question_text || `Question ${(question.order || 0) + 1}`;
                  console.log("Question text to display:", questionText);
                  return (
                    <div key={question.id} className="space-y-2">
                      <label 
                        className="block font-['Satoshi'] font-medium text-neutral-900"
                        style={{ display: 'block', visibility: 'visible', opacity: 1, color: '#171717' }}
                      >
                        {questionText || `Question ${(question.order || 0) + 1}`}
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

            <div>
              <label className="mb-2 block font-['Satoshi'] font-medium text-neutral-900">
                Select Resume
              </label>
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <label
                    key={resume.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-neutral-900 p-4 transition-colors hover:bg-violet-50"
                  >
                    <input
                      type="radio"
                      name="resume"
                      value={resume.id}
                      checked={selectedResumeId === resume.id}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                    />
                    <div className="flex-1">
                      <p className="font-['Satoshi'] font-medium text-neutral-900">
                        {resume.name}
                      </p>
                      <p className="text-sm font-['Satoshi'] text-gray-500">
                        Created {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border-2 border-neutral-900 px-6 py-3 font-['Satoshi'] font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedResumeId}
                className="flex-1 rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-3 font-['Satoshi'] font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <ImportResumeModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleResumeImport}
      />
    </div>
    </>
  );
}

