import { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { ConfirmModal } from "~/components/confirm-modal";
import type { Template } from "~/lib/template-store";
import { normalizeTemplates } from "~/lib/template-store";

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
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className={`relative p-4 border-2 rounded-lg text-left transition-all ${
              selectedTemplateId === template.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            {selectedTemplateId === template.id && (
              <div className="absolute top-2 right-2">
                <FiCheck className="h-5 w-5 text-emerald-500" />
              </div>
            )}
            <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
            <div className="text-sm text-gray-600">{template.description}</div>
            <div className="text-xs text-gray-500 mt-2 capitalize">{template.category}</div>
          </button>
        ))}
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

