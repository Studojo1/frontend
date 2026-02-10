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
}

export function AIPanel({ draftId, sections, onOptimizationComplete }: AIPanelProps) {
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
      
      // Parse and store suggestions
      const parsedSuggestions: AISuggestion[] = (data.suggestions || []).map((s: any, idx: number) => ({
        id: s.id || `suggestion-${Date.now()}-${idx}`,
        type: s.type || 'keyword',
        message: s.message || s.text || '',
        severity: s.severity || 'info',
        suggestedValue: s.suggestedValue || s.suggested_value || s.value,
        field: s.field,
      }));
      
      setSuggestions(parsedSuggestions);
      
      if (parsedSuggestions.length === 0) {
        toast.info("No suggestions available at this time");
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
      
      // Parse and store suggestions if available
      if (data.suggestions && Array.isArray(data.suggestions)) {
        const parsedSuggestions: AISuggestion[] = data.suggestions.map((s: any, idx: number) => ({
          id: s.id || `suggestion-${Date.now()}-${idx}`,
          type: s.type || 'keyword',
          message: s.message || s.text || '',
          severity: s.severity || 'info',
          suggestedValue: s.suggestedValue || s.suggested_value || s.value,
          field: s.field,
        }));
        setSuggestions(parsedSuggestions);
        toast.success(`${parsedSuggestions.length} optimization suggestion${parsedSuggestions.length === 1 ? '' : 's'} loaded`);
      } else if (onOptimizationComplete && Array.isArray(data.sections)) {
        // If sections are returned, apply them directly
        onOptimizationComplete(data.sections);
        toast.success("Resume optimized successfully");
      } else {
        toast.success("Job optimization suggestions loaded");
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
      
      // Parse and store suggestions if available
      if (data.suggestions && Array.isArray(data.suggestions)) {
        const parsedSuggestions: AISuggestion[] = data.suggestions.map((s: any, idx: number) => ({
          id: s.id || `suggestion-${Date.now()}-${idx}`,
          type: s.type || 'keyword',
          message: s.message || s.text || '',
          severity: s.severity || 'info',
          suggestedValue: s.suggestedValue || s.suggested_value || s.value,
          field: s.field,
        }));
        setSuggestions(parsedSuggestions);
        toast.success(`${parsedSuggestions.length} optimization suggestion${parsedSuggestions.length === 1 ? '' : 's'} loaded`);
      } else if (onOptimizationComplete && Array.isArray(data.sections)) {
        // If sections are returned, apply them directly
        onOptimizationComplete(data.sections);
        toast.success("Resume optimized successfully");
      } else {
        toast.success("Full optimization suggestions loaded");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to optimize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">AI Assistant</h2>
        <button className="text-gray-400 hover:text-gray-600">
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
            className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === id
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "suggestions" && (
          <div className="space-y-4">
            <button
              onClick={handleQuickSuggestions}
              disabled={loading}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get Quick Suggestions"}
            </button>
            <p className="text-sm text-gray-600">
              Get instant suggestions for improving your resume sections.
            </p>
            
            {/* Display Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    {suggestions.length} Suggestion{suggestions.length === 1 ? '' : 's'}
                  </div>
                  {suggestions.some(s => s.suggestedValue) && (
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
                      suggestion.severity === 'error' ? 'border-red-200 bg-red-50' :
                      suggestion.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {suggestion.severity === 'error' ? (
                        <FiAlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : suggestion.severity === 'warning' ? (
                        <FiAlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FiInfo className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          {suggestion.type === 'keyword' && 'Keyword Suggestion'}
                          {suggestion.type === 'completeness' && 'Completeness Check'}
                          {suggestion.type === 'formatting' && 'Formatting Suggestion'}
                          {suggestion.type === 'rewrite' && 'Rewrite Suggestion'}
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
                          onClick={() => setSuggestions(suggestions.filter(s => s.id !== suggestion.id))}
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
            )}
          </div>
        )}

        {activeTab === "job" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={handleJobOptimize}
              disabled={loading || !jobTitle.trim()}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? "Optimizing..." : "Optimize for Job"}
            </button>
            
            {/* Display Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    {suggestions.length} Suggestion{suggestions.length === 1 ? '' : 's'}
                  </div>
                  {suggestions.some(s => s.suggestedValue) && (
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
                      suggestion.severity === 'error' ? 'border-red-200 bg-red-50' :
                      suggestion.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {suggestion.severity === 'error' ? (
                        <FiAlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : suggestion.severity === 'warning' ? (
                        <FiAlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FiInfo className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          {suggestion.type === 'keyword' && 'Keyword Suggestion'}
                          {suggestion.type === 'completeness' && 'Completeness Check'}
                          {suggestion.type === 'formatting' && 'Formatting Suggestion'}
                          {suggestion.type === 'rewrite' && 'Rewrite Suggestion'}
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
                          onClick={() => setSuggestions(suggestions.filter(s => s.id !== suggestion.id))}
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
            )}
          </div>
        )}

        {activeTab === "full" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Perform a complete optimization of your resume with ATS-friendly formatting and keyword optimization.
            </p>
            <button
              onClick={handleFullOptimize}
              disabled={loading}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? "Optimizing..." : "Start Full Optimization"}
            </button>
            
            {/* Display Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    {suggestions.length} Suggestion{suggestions.length === 1 ? '' : 's'}
                  </div>
                  {suggestions.some(s => s.suggestedValue) && (
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
                      suggestion.severity === 'error' ? 'border-red-200 bg-red-50' :
                      suggestion.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {suggestion.severity === 'error' ? (
                        <FiAlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : suggestion.severity === 'warning' ? (
                        <FiAlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FiInfo className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          {suggestion.type === 'keyword' && 'Keyword Suggestion'}
                          {suggestion.type === 'completeness' && 'Completeness Check'}
                          {suggestion.type === 'formatting' && 'Formatting Suggestion'}
                          {suggestion.type === 'rewrite' && 'Rewrite Suggestion'}
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
                          onClick={() => setSuggestions(suggestions.filter(s => s.id !== suggestion.id))}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

