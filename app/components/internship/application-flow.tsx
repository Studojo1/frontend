import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";

interface Resume {
  id: string;
  name: string;
  resumeData: any;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationFlowProps {
  internshipId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationFlow({
  internshipId,
  onClose,
  onSuccess,
}: ApplicationFlowProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

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
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ resume_id: selectedResumeId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg border-2 border-neutral-900 bg-white p-6 shadow-lg">
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
              You don't have any resumes yet. Please create a resume first.
            </p>
            <a
              href="/resumes"
              className="inline-block rounded-lg border-2 border-neutral-900 bg-violet-600 px-6 py-2 font-['Satoshi'] font-medium text-white transition-colors hover:bg-violet-700"
            >
              Create Resume
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
    </div>
  );
}

