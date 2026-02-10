import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMenu, FiX } from "react-icons/fi";
import type { ResumeSection } from "~/lib/resume-draft";
import { addSection, removeSection, reorderSections } from "~/lib/resume-draft";
import { SectionEditor } from "./section-editor";
import { GuidedMode } from "./guided-mode";
import { TemplateSelector } from "./template-selector";
import { AISuggestionsInline } from "./ai-suggestions-inline";
import { ConfirmModal } from "~/components/confirm-modal";

interface ResumeEditorProps {
  sections: ResumeSection[];
  templateId: string;
  onSectionsChange: (sections: ResumeSection[]) => void;
  onTemplateChange: (templateId: string) => void;
  showGuidedMode?: boolean;
  draftId?: string;
}

export function ResumeEditor({
  sections,
  templateId,
  onSectionsChange,
  onTemplateChange,
  showGuidedMode = false,
  draftId,
}: ResumeEditorProps) {
  const [guidedModeEnabled, setGuidedModeEnabled] = useState(showGuidedMode);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteSectionModalOpen, setDeleteSectionModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  const handleAddSection = (type: ResumeSection["type"]) => {
    const newSections = addSection(sections, type, {});
    onSectionsChange(newSections);
  };

  const handleRemoveSectionClick = (sectionId: string) => {
    setSectionToDelete(sectionId);
    setDeleteSectionModalOpen(true);
  };

  const handleRemoveSection = () => {
    if (!sectionToDelete) return;
    const newSections = removeSection(sections, sectionToDelete);
    onSectionsChange(newSections);
    setDeleteSectionModalOpen(false);
    setSectionToDelete(null);
  };

  const handleSectionUpdate = (sectionId: string, content: any) => {
    const newSections = sections.map((s) =>
      s.id === sectionId ? { ...s, content } : s
    );
    onSectionsChange(newSections);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = reorderSections(sections, draggedIndex, index);
    onSectionsChange(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const sectionTypes: Array<{ type: ResumeSection["type"]; label: string }> = [
    { type: "contact", label: "Contact" },
    { type: "summary", label: "Summary" },
    { type: "experience", label: "Experience" },
    { type: "education", label: "Education" },
    { type: "skills", label: "Skills" },
    { type: "projects", label: "Projects" },
    { type: "certifications", label: "Certifications" },
    { type: "custom", label: "Custom Section" },
  ];

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Template</h2>
        <TemplateSelector
          selectedTemplateId={templateId}
          onTemplateChange={onTemplateChange}
        />
      </div>

      {/* Guided Mode Toggle */}
      {showGuidedMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Guided Mode</h3>
              <p className="text-sm text-blue-700">
                Get step-by-step help building your resume
              </p>
            </div>
            <button
              onClick={() => setGuidedModeEnabled(!guidedModeEnabled)}
              className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {guidedModeEnabled ? "Disable" : "Enable"}
            </button>
          </div>
        </div>
      )}

      {/* Guided Mode Hints */}
      {guidedModeEnabled && (
        <GuidedMode sections={sections} />
      )}

      {/* Sections */}
      <AnimatePresence>
        <div className="space-y-4">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg border p-4 transition-all ${
                  draggedIndex === index
                    ? "border-emerald-500 shadow-lg scale-105 opacity-90"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
              <div className="flex items-start gap-3">
                <div className="mt-2 cursor-move text-gray-400 hover:text-gray-600">
                  <FiMenu className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {section.type === "custom" && section.content.custom
                        ? section.content.custom.title
                        : section.type}
                    </h3>
                    <button
                      onClick={() => handleRemoveSectionClick(section.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                  <SectionEditor
                    section={section}
                    onUpdate={(content) => handleSectionUpdate(section.id, content)}
                  />
                  {draftId && (
                    <AISuggestionsInline
                      sectionId={section.id}
                      sectionType={section.type}
                      content={section.content}
                      draftId={draftId}
                      onApplySuggestion={(suggestionId, suggestedValue) => {
                        // Apply suggestion to section content
                        const updatedSections = sections.map(s => {
                          if (s.id === section.id) {
                            // Simple text replacement - can be enhanced based on suggestion type
                            const updatedContent = { ...s.content };
                            if (section.type === 'summary' && updatedContent.summary) {
                              updatedContent.summary = suggestedValue;
                            }
                            return { ...s, content: updatedContent };
                          }
                          return s;
                        });
                        onSectionsChange(updatedSections);
                      }}
                    />
                  )}
                </div>
              </div>
              </motion.div>
            ))}
        </div>
      </AnimatePresence>

      {/* Add Section Button */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
        <div className="text-center">
          <button
            onClick={() => {
              const type = sectionTypes[0].type; // Default to first type
              handleAddSection(type);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
          >
            <FiPlus className="h-4 w-4" />
            Add Section
          </button>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {sectionTypes.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => handleAddSection(type)}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                + {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteSectionModalOpen}
        onClose={() => {
          setDeleteSectionModalOpen(false);
          setSectionToDelete(null);
        }}
        onConfirm={handleRemoveSection}
        title="Remove Section"
        message="Are you sure you want to remove this section? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}

