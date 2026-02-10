import { useState, useEffect } from "react";
import { FiZap, FiCheck, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";
import { toast } from "sonner";

interface AISuggestion {
  id: string;
  type: 'keyword' | 'completeness' | 'formatting' | 'rewrite';
  message: string;
  severity: 'info' | 'warning' | 'error';
  suggestedValue?: string;
  field?: string;
}

interface AISuggestionsInlineProps {
  sectionId: string;
  sectionType: string;
  content: any;
  draftId: string;
  onApplySuggestion?: (suggestionId: string, suggestedValue: string) => void;
}

export function AISuggestionsInline({
  sectionId,
  sectionType,
  content,
  draftId,
  onApplySuggestion,
}: AISuggestionsInlineProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Auto-load suggestions when content changes (debounced)
    const timeoutId = setTimeout(() => {
      loadSuggestions();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, sectionId]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // Try v2 API first, fallback to v1
      let response = await fetch(`/api/v2/resumes/${draftId}/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: "",
          job_description: "",
          section_id: sectionId,
          section_type: sectionType,
          section_content: content,
        }),
      });

      if (!response.ok) {
        // Fallback to v1 API
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
      }

      if (!response.ok) {
        throw new Error("Failed to load suggestions");
      }

      const data = await response.json();
      
      // Filter suggestions for this specific section
      const sectionSuggestions = (data.suggestions || []).filter(
        (s: AISuggestion) => s.field?.startsWith(sectionId) || !s.field
      );
      
      setSuggestions(sectionSuggestions);
    } catch (error: any) {
      console.error("Error loading suggestions:", error);
      // Don't show error toast for inline suggestions
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (suggestion: AISuggestion) => {
    if (suggestion.suggestedValue && onApplySuggestion) {
      onApplySuggestion(suggestion.id, suggestion.suggestedValue);
      toast.success("Suggestion applied");
      // Remove applied suggestion
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    }
  };

  const handleDismiss = (suggestionId: string) => {
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
  };

  if (suggestions.length === 0 && !loading) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <FiAlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <FiAlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FiInfo className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <FiZap className="h-4 w-4 text-emerald-500" />
        <span>
          {suggestions.length} AI {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
        </span>
        {loading && (
          <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></span>
        )}
      </button>

      {expanded && (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-3 rounded-lg border ${getSeverityColor(suggestion.severity)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  {getSeverityIcon(suggestion.severity)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {suggestion.type === 'keyword' && 'Keyword Suggestion'}
                      {suggestion.type === 'completeness' && 'Completeness Check'}
                      {suggestion.type === 'formatting' && 'Formatting Suggestion'}
                      {suggestion.type === 'rewrite' && 'Rewrite Suggestion'}
                    </div>
                    <div className="text-sm text-gray-700">{suggestion.message}</div>
                    {suggestion.suggestedValue && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Suggested:</div>
                        <div className="text-sm text-gray-900">{suggestion.suggestedValue}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {suggestion.suggestedValue && (
                    <button
                      onClick={() => handleApply(suggestion)}
                      className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                      title="Apply suggestion"
                    >
                      <FiCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
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
  );
}

