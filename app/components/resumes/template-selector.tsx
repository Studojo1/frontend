import { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { ConfirmModal } from "~/components/confirm-modal";
import type { Template } from "~/lib/template-store";
import { normalizeTemplates } from "~/lib/template-store";

// Visual placeholder shown when no preview image is available
function TemplatePlaceholder({ templateId, category }: { templateId: string; category: string }) {
  // Map template categories to visual styles
  const styles: Record<string, { header: string; accent: string; lines: string[] }> = {
    professional: { header: "#1e293b", accent: "#3b82f6", lines: ["w-3/4", "w-full", "w-5/6", "w-full", "w-2/3"] },
    modern:       { header: "#7c3aed", accent: "#a78bfa", lines: ["w-full", "w-4/5", "w-full", "w-3/4", "w-full"] },
    minimal:      { header: "#374151", accent: "#6b7280", lines: ["w-2/3", "w-full", "w-5/6", "w-4/5", "w-full"] },
    creative:     { header: "#059669", accent: "#34d399", lines: ["w-full", "w-3/4", "w-full", "w-5/6", "w-2/3"] },
    academic:     { header: "#b45309", accent: "#f59e0b", lines: ["w-3/4", "w-full", "w-2/3", "w-full", "w-5/6"] },
  };
  const style = styles[category?.toLowerCase()] || styles.professional;

  return (
    <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 select-none" aria-hidden>
      {/* Header bar */}
      <div className="rounded h-5 w-full mb-1" style={{ backgroundColor: style.header }} />
      {/* Accent line */}
      <div className="rounded h-1 w-1/3 mb-2" style={{ backgroundColor: style.accent }} />
      {/* Content lines */}
      {style.lines.map((w, i) => (
        <div key={i} className={`rounded h-1.5 bg-gray-200 ${w}`} />
      ))}
      <div className="mt-auto rounded h-1 w-2/5" style={{ backgroundColor: style.accent }} />
    </div>
  );
}

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onTemplateChange: (templateId: string) => void;
}

export function TemplateSelector({
  selectedTemplateId,
  onTemplateChange,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

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
    if (templateId === selectedTemplateId) return;
    
    setPendingTemplateId(templateId);
    setConfirmModalOpen(true);
  };

  const handleConfirmTemplateChange = () => {
    if (!pendingTemplateId) return;
    onTemplateChange(pendingTemplateId);
    toast.success(`Template changed to ${templates.find(t => t.id === pendingTemplateId)?.name || pendingTemplateId}`);
    setConfirmModalOpen(false);
    setPendingTemplateId(null);
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Loading templates...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const previewSrc = template.previewUrl || template.assets?.previewImage;
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`relative border-2 rounded-lg text-left transition-all overflow-hidden ${
                selectedTemplateId === template.id
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-gray-200 hover:border-gray-400 bg-white"
              }`}
            >
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 z-10 bg-emerald-500 rounded-full p-0.5">
                  <FiCheck className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              {/* Preview area */}
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-200">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt={`${template.name} preview`}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <TemplatePlaceholder templateId={template.id} category={template.category} />
                )}
              </div>
              {/* Info */}
              <div className="p-3">
                <div className="font-semibold text-gray-900 text-sm">{template.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 capitalize">{template.category}</div>
              </div>
            </button>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingTemplateId(null);
        }}
        onConfirm={handleConfirmTemplateChange}
        title="Change Template"
        message="Changing template will create a new version. Continue?"
        confirmText="Continue"
        cancelText="Cancel"
        variant="info"
      />
    </>
  );
}

