import { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import type { Template } from "~/lib/template-store";
import { normalizeTemplates } from "~/lib/template-store";

interface TemplateGalleryProps {
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  showPreviews?: boolean;
  sampleResumeData?: any; // Optional sample resume data for previews
}

export function TemplateGallery({
  selectedTemplateId,
  onTemplateSelect,
  showPreviews = false,
  sampleResumeData,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewErrors, setPreviewErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/resumes/templates");
      
      if (!response.ok) {
        throw new Error("Failed to load templates");
      }

      const data = await response.json();
      
      // Use unified normalization from template-store
      const normalizedTemplates = normalizeTemplates(data);
      
      if (normalizedTemplates.length === 0) {
        console.warn("No valid templates found");
      }
      
      setTemplates(normalizedTemplates);
    } catch (error: any) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };


  const handleTemplateSelect = (templateId: string) => {
    if (!templateId || templateId.trim() === "") {
      console.error("Invalid template ID:", templateId);
      toast.error("Invalid template selected");
      return;
    }

    const validId = templateId.trim();
    
    // Don't select if already selected
    if (selectedTemplateId === validId) {
      return;
    }
    
    onTemplateSelect(validId);
    
    // Find template and show success message
    const template = templates.find(t => t.id === validId);
    const templateName = template?.name || validId;
    toast.success(`Selected ${templateName}`);
  };

  const handlePreviewError = (templateId: string) => {
    // Mark preview as failed, show placeholder
    setPreviewErrors({ ...previewErrors, [templateId]: true });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <p className="mt-2 text-gray-600">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No templates available. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => {
          const templateId = template.id;
          const isSelected = selectedTemplateId === templateId;
          
          return (
          <div
            key={templateId}
            className={`relative group cursor-pointer rounded-xl border-2 transition-all ${
              isSelected
                ? "border-emerald-500 bg-emerald-50 shadow-lg scale-105"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => handleTemplateSelect(templateId)}
          >
          {isSelected && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-emerald-500 rounded-full p-1.5">
                <FiCheck className="h-4 w-4 text-white" />
              </div>
            </div>
          )}

          {/* Template Preview - Static Image Only */}
          <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center relative overflow-hidden">
            {template.previewUrl && !previewErrors[templateId] ? (
                <img
                src={template.previewUrl}
                alt={`${template.name} Preview`}
                  className="w-full h-full object-contain"
                onError={() => handlePreviewError(templateId)}
              />
            ) : (
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-gray-400 mb-2">
                  {template.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">{template.category}</div>
                {!template.previewUrl && (
                  <div className="text-xs text-gray-400 mt-2">Preview unavailable</div>
                )}
              </div>
            )}
          </div>

          {/* Template Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {template.category}
              </span>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}

