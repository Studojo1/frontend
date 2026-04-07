import { useState } from "react";
import { FiX, FiZap, FiTarget, FiRefreshCw, FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";
import { toast } from "sonner";

interface AISuggestion {
  id: string;
  type: 'keyword' | 'completeness' | 'formatting' | 'rewrite';
  message: string;
  severity: 'info' | 'warning' | 'error';
  suggestedValue?: string;
  field?: string;
}

interface AIPanelProps {
  draftId: string;
  sections: any[];
  onOptimizationComplete?: (optimizedSections: any[]) => void;
  onClose?: () => void;
}

export function AIPanel({ draftId, sections, onOptimizationComplete, onClose }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<"suggestions" | "job" | "full">("suggestions");
  const [loading, setLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const applySuggestion = (suggestion: AISuggestion) => {
    if (!suggestion.suggestedValue || !onOptimizationComplete) {
      return;
    }

    const updatedSections = sections.map((section) => {
      // Check if this suggestion applies to this section
      const fieldMatches = 
        suggestion.field === section.id ||
        suggestion.field === section.type ||
        suggestion.field?.startsWith(section.id) ||
        (!suggestion.field && section.type === 'summary'); // Default to summary if no field specified

      if (!fieldMatches) {
        return section;
      }

      const updatedContent = { ...section.content };

      // Apply suggestion based on section type
      switch (section.type) {
        case 'summary':
          updatedContent.summary = suggestion.suggestedValue;
          break;
        case 'contact':
          // For contact, try to infer which field to update from the message
          if (suggestion.message.toLowerCase().includes('email')) {
            updatedContent.contact = { ...updatedContent.contact, email: suggestion.suggestedValue };
          } else if (suggestion.message.toLowerCase().includes('phone')) {
            updatedContent.contact = { ...updatedContent.contact, phone: suggestion.suggestedValue };
          } else if (suggestion.message.toLowerCase().includes('name')) {
            updatedContent.contact = { ...updatedContent.contact, name: suggestion.suggestedValue };
          } else {
            // Default: update the entire contact if it's a rewrite
            if (suggestion.type === 'rewrite' && updatedContent.contact) {
              updatedContent.contact = { ...updatedContent.contact };
            }
          }
          break;
        case 'experience':
          // For experience, if it's a rewrite, update the description of the first item
          if (suggestion.type === 'rewrite' && updatedContent.experience && updatedContent.experience.length > 0) {
            updatedContent.experience = updatedContent.experience.map((exp: any, idx: number) => {
              if (idx === 0 || suggestion.field?.includes(exp.id)) {
                return { ...exp, description: suggestion.suggestedValue };
              }
              return exp;
            });
          }
          break;
        case 'skills':
          // For skills, append or update based on suggestion
          if (suggestion.type === 'keyword' && updatedContent.skills) {
            // Add as a new skill if it's a keyword suggestion
            const newSkill = {
              id: `skill-${Date.now()}`,
              category: 'Other',
              name: suggestion.suggestedValue,
            };
            updatedContent.skills = [...updatedContent.skills, newSkill];
          }
          break;
        default:
          // For other types, try to update description or content
          if (updatedContent.description !== undefined) {
            updatedContent.description = suggestion.suggestedValue;
          } else if (updatedContent.content !== undefined) {
            updatedContent.content = suggestion.suggestedValue;
          }
      }

      return { ...section, content: updatedContent };
    });

    onOptimizationComplete(updatedSections);
    toast.success("Suggestion applied");
    
    // Remove applied suggestion
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
  };

  const applyAllSuggestions = () => {
    const applicableSuggestions = suggestions.filter(s => s.suggestedValue);
    
    if (applicableSuggestions.length === 0) {
      toast.info("No suggestions to apply");
      return;
    }

    let updatedSections = [...sections];

    // Apply each suggestion
    applicableSuggestions.forEach((suggestion) => {
      updatedSections = updatedSections.map((section) => {
        const fieldMatches = 
          suggestion.field === section.id ||
          suggestion.field === section.type ||
          suggestion.field?.startsWith(section.id) ||
          (!suggestion.field && section.type === 'summary');

        if (!fieldMatches) {
          return section;
        }

        const updatedContent = { ...section.content };

        switch (section.type) {
          case 'summary':
            updatedContent.summary = suggestion.suggestedValue;
            break;
          case 'contact':
            if (suggestion.message.toLowerCase().includes('email')) {
              updatedContent.contact = { ...updatedContent.contact, email: suggestion.suggestedValue };
            } else if (suggestion.message.toLowerCase().includes('phone')) {
              updatedContent.contact = { ...updatedContent.contact, phone: suggestion.suggestedValue };
            } else if (suggestion.message.toLowerCase().includes('name')) {
              updatedContent.contact = { ...updatedContent.contact, name: suggestion.suggestedValue };
            }
            break;
          case 'experience':
            if (suggestion.type === 'rewrite' && updatedContent.experience && updatedContent.experience.length > 0) {
              updatedContent.experience = updatedContent.experience.map((exp: any, idx: number) => {
                if (idx === 0 || suggestion.field?.includes(exp.id)) {
                  return { ...exp, description: suggestion.suggestedValue };
                }
                return exp;
              });
            }
            break;
          case 'skills':
            if (suggestion.type === 'keyword' && updatedContent.skills) {
              const newSkill = {
                id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                category: 'Other',
                name: suggestion.suggestedValue,
              };
              updatedContent.skills = [...updatedContent.skills, newSkill];
            }
            break;
          default:
            if (updatedContent.description !== undefined) {
              updatedContent.description = suggestion.suggestedValue;
            } else if (updatedContent.content !== undefined) {
              updatedContent.content = suggestion.suggestedValue;
            }
        }

        return { ...section, content: updatedContent };
      });
    });

    if (onOptimizationComplete) {
      onOptimizationComplete(updatedSections);
      toast.success(`${applicableSuggestions.length} suggestion${applicableSuggestions.length === 1 ? '' : 's'} applied`);
      setSuggestions([]);
    }
  };

  const handleQuickSuggestions = async () => {
    setLoading(true);
    try {
      // Prefer v2 suggestions API
      let response = await fetch(`/api/v2/resumes/${draftId}/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "",
          job_description: "",
        }),
      });

      if (!response.ok) {
        // Fallback to legacy endpoint if available
        response = await fetch(`/api/resumes/${draftId}/suggest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_title: "",
            job_description: "",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData.error || "Failed to get suggestions";
          throw new Error(message);
        }
      }

      const data = await response.json();
      
      // Log response for debugging
      console.log("[AIPanel] Quick suggestions response:", data);
      
      // Handle error response
      if (data.error) {
        console.error("[AIPanel] API returned error:", data.error);
        toast.error(data.error || "Failed to get suggestions");
        setSuggestions([]);
        return;
      }
      
      // Parse and store suggestions
      const suggestionsArray = Array.isArray(data.suggestions) ? data.suggestions : [];
      const parsedSuggestions: AISuggestion[] = suggestionsArray.map((s: any, idx: number) => ({
        id: s.id || `suggestion-${Date.now()}-${idx}`,
        type: s.type || 'keyword',
        message: s.message || s.text || s.text || '',
        severity: s.severity || 'info',
        suggestedValue: s.suggestedValue || s.suggested_value || s.value || '',
        field: s.field,
      }));
      
      console.log(`[AIPanel] Parsed ${parsedSuggestions.length} suggestions`);
      setSuggestions(parsedSuggestions);
      
      if (parsedSuggestions.length === 0) {
        toast.info("No suggestions available at this time. Try adding more content to your resume.");
      } else {
        toast.success(`${parsedSuggestions.length} suggestion${parsedSuggestions.length === 1 ? '' : 's'} loaded`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleJobOptimize = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v2/resumes/${draftId}/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: jobTitle,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || "Failed to optimize for job";
        throw new Error(message);
      }

      const data = await response.json();
      
      // Log response for debugging
      console.log("[AIPanel] Job optimize response:", data);
      
      // Handle error response
      if (data.error) {
        console.error("[AIPanel] API returned error:", data.error);
        toast.error(data.error || "Failed to optimize for job");
        return;
      }
      
      // Parse and store suggestions if available
      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const parsedSuggestions: AISuggestion[] = data.suggestions.map((s: any, idx: number) => ({
          id: s.id || `suggestion-${Date.now()}-${idx}`,
          type: s.type || 'keyword',
          message: s.message || s.text || '',
          severity: s.severity || 'info',
          suggestedValue: s.suggestedValue || s.suggested_value || s.value || '',
          field: s.field,
        }));
        setSuggestions(parsedSuggestions);
        toast.success(`${parsedSuggestions.length} optimization suggestion${parsedSuggestions.length === 1 ? '' : 's'} loaded`);
      } else if (onOptimizationComplete && Array.isArray(data.sections)) {
        // If sections are returned, apply them directly
        onOptimizationComplete(data.sections);
        toast.success("Resume optimized successfully");
      } else {
        toast.info("No specific suggestions available. Your resume may already be well-optimized for this job.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to optimize");
    } finally {
      setLoading(false);
    }
  };

  const handleFullOptimize = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v2/resumes/${draftId}/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "",
          job_description: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || "Failed to optimize resume";
        throw new Error(message);
      }

      const data = await response.json();
      
      // Log response for debugging
      console.log("[AIPanel] Full optimize response:", data);
      
      // Handle error response
      if (data.error) {
        console.error("[AIPanel] API returned error:", data.error);
        toast.error(data.error || "Failed to optimize resume");
        return;
      }
      
      // Parse and store suggestions if available
      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const parsedSuggestions: AISuggestion[] = data.suggestions.map((s: any, idx: number) => ({
          id: s.id || `suggestion-${Date.now()}-${idx}`,
          type: s.type || 'keyword',
          message: s.message || s.text || '',
          severity: s.severity || 'info',
          suggestedValue: s.suggestedValue || s.suggested_value || s.value || '',
          field: s.field,
        }));
        setSuggestions(parsedSuggestions);
        toast.success(`${parsedSuggestions.length} optimization suggestion${parsedSuggestions.length === 1 ? '' : 's'} loaded`);
      } else if (onOptimizationComplete && Array.isArray(data.sections)) {
        // If sections are returned, apply them directly
        onOptimizationComplete(data.sections);
        toast.success("Resume optimized successfully");
      } else {
        toast.info("No specific suggestions available. Your resume may already be well-optimized.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to optimize");
    } finally {
      setLoading(false);
    }
  };

  // Shared suggestion list renderer used across all three tabs
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;
    return (
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">
            {suggestions.length} Suggestion{suggestions.length === 1 ? "" : "s"}
          </div>
          {suggestions.some((s) => s.suggestedValue) && (
            <button
              onClick={applyAllSuggestions}
              className="text-xs px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
            >
              Apply All
            </button>
          )}
        </div>
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-3 rounded-lg border ${
              suggestion.severity === "error"
                ? "border-red-200 bg-red-50"
                : suggestion.severity === "warning"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-2">
              {suggestion.severity === "error" || suggestion.severity === "warning" ? (
                <FiAlertCircle
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    suggestion.severity === "error" ? "text-red-600" : "text-yellow-600"
                  }`}
                />
              ) : (
                <FiInfo className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {suggestion.type === "keyword" && "Keyword Suggestion"}
                  {suggestion.type === "completeness" && "Completeness Check"}
                  {suggestion.type === "formatting" && "Formatting Suggestion"}
                  {suggestion.type === "rewrite" && "Rewrite Suggestion"}
                </div>
                <div className="text-sm text-gray-900">{suggestion.message}</div>
                {suggestion.suggestedValue && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Suggested:</div>
                    <div className="text-sm text-gray-900 break-words">{suggestion.suggestedValue}</div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {suggestion.suggestedValue && (
                  <button
                    onClick={() => applySuggestion(suggestion)}
                    className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                    title="Apply suggestion"
                  >
                    <FiCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setSuggestions(suggestions.filter((s) => s.id !== suggestion.id))}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Dismiss"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[30rem] bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-2">
          <FiZap className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "suggestions", label: "Suggestions", icon: FiZap },
          { id: "job", label: "Job Match", icon: FiTarget },
          { id: "full", label: "Full Optimize", icon: FiRefreshCw },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === id
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "suggestions" && (
          <div className="space-y-4">
            <button
              onClick={handleQuickSuggestions}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
            >
              <FiZap className="h-4 w-4" />
              {loading ? "Analysing your resume..." : "Get Quick Suggestions"}
            </button>
            {!loading && suggestions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                Click above to get AI-powered suggestions for your resume.
              </p>
            )}
            {renderSuggestions()}
          </div>
        )}

        {activeTab === "job" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-gray-400 font-normal">(optional but recommended)</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description for more targeted suggestions..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
            </div>
            <button
              onClick={handleJobOptimize}
              disabled={loading || !jobTitle.trim()}
              className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
            >
              <FiTarget className="h-4 w-4" />
              {loading ? "Matching to job..." : "Optimize for This Job"}
            </button>
            {renderSuggestions()}
          </div>
        )}

        {activeTab === "full" && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium mb-1">ATS Full Optimisation</p>
              <p className="text-xs text-emerald-700">
                Scans every section for missing keywords, weak phrasing, formatting issues, and completeness gaps.
              </p>
            </div>
            <button
              onClick={handleFullOptimize}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Running full scan..." : "Start Full Optimisation"}
            </button>
            {renderSuggestions()}
          </div>
        )}
      </div>
    </div>
  );
}

