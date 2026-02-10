import { useState, useEffect } from "react";
import { FiZap, FiCheck, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { toast } from "sonner";

interface Suggestion {
  section: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "error";
  field?: string;
  suggested_value?: string;
}

interface OptimizerPanelProps {
  resumeId: string;
  resumeData: any;
  jobTitle?: string;
  jobDescription?: string;
  onOptimize?: (optimizedResume: any) => void;
}

export function OptimizerPanel({
  resumeId,
  resumeData,
  jobTitle,
  jobDescription,
  onOptimize,
}: OptimizerPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (resumeId && resumeData) {
      loadSuggestions();
    }
  }, [resumeId, resumeData, jobTitle, jobDescription]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: jobTitle || "",
          job_description: jobDescription || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      console.error("Failed to load suggestions:", error);
      toast.error("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!jobTitle || !jobDescription) {
      toast.error("Please provide job title and description");
      return;
    }

    setOptimizing(true);
    try {
      const { optimizeResumeJob } = await import("~/lib/control-plane");
      const { res } = await optimizeResumeJob({
        resume: resumeData,
        job_title: jobTitle,
        company: "",
        job_description: jobDescription,
      });

      // Poll for optimization result
      const { getJob } = await import("~/lib/control-plane");
      const pollInterval = setInterval(async () => {
        try {
          const job = await getJob(res.job_id);
          if (job.status === "COMPLETED") {
            clearInterval(pollInterval);
            const optimized = job.result as any;
            onOptimize?.(optimized);
            toast.success("Resume optimized successfully!");
            setOptimizing(false);
          } else if (job.status === "FAILED") {
            clearInterval(pollInterval);
            toast.error(job.error || "Optimization failed");
            setOptimizing(false);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to optimize resume");
      setOptimizing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.section]) {
      acc[suggestion.section] = [];
    }
    acc[suggestion.section].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resume Optimizer</h3>
          <p className="text-sm text-gray-600 mt-1">
            Get AI-powered suggestions to improve your resume
          </p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizing || !jobTitle || !jobDescription}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiZap className="h-4 w-4" />
          {optimizing ? "Optimizing..." : "Optimize for Job"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading suggestions...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No suggestions available. Add job details to get personalized recommendations.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSuggestions).map(([section, sectionSuggestions]) => (
            <div key={section} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 capitalize">
                    {section.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {sectionSuggestions.length}
                  </span>
                </div>
                {expandedSections[section] ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections[section] && (
                <div className="p-4 pt-0 space-y-3">
                  {sectionSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${getSeverityColor(suggestion.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">{suggestion.message}</p>
                          {suggestion.suggested_value && (
                            <p className="text-xs mt-2 opacity-75">
                              Suggested: {suggestion.suggested_value}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Accept"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Dismiss"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

