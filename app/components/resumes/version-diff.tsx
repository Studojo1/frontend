import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { ResumeSection } from "~/lib/resume-draft";

interface VersionDiffProps {
  oldSections: ResumeSection[];
  newSections: ResumeSection[];
  oldVersion: number;
  newVersion: number;
}

export function VersionDiff({
  oldSections,
  newSections,
  oldVersion,
  newVersion,
}: VersionDiffProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Create a map of sections by ID for comparison
  const oldSectionsMap = new Map(oldSections.map(s => [s.id, s]));
  const newSectionsMap = new Map(newSections.map(s => [s.id, s]));

  // Find all section IDs (union of both versions)
  const allSectionIds = new Set([
    ...oldSections.map(s => s.id),
    ...newSections.map(s => s.id),
  ]);

  const getSectionDiff = (sectionId: string) => {
    const oldSection = oldSectionsMap.get(sectionId);
    const newSection = newSectionsMap.get(sectionId);

    if (!oldSection && newSection) {
      return { type: 'added', old: null, new: newSection };
    }
    if (oldSection && !newSection) {
      return { type: 'removed', old: oldSection, new: null };
    }
    if (oldSection && newSection) {
      const oldContent = JSON.stringify(oldSection.content);
      const newContent = JSON.stringify(newSection.content);
      if (oldContent !== newContent || oldSection.order !== newSection.order) {
        return { type: 'modified', old: oldSection, new: newSection };
      }
    }
    return { type: 'unchanged', old: oldSection, new: newSection };
  };

  const formatSectionContent = (section: ResumeSection | null): string => {
    if (!section) return "";
    
    switch (section.type) {
      case 'contact':
        const contact = section.content.contact;
        return contact ? [
          contact.name && `Name: ${contact.name}`,
          contact.email && `Email: ${contact.email}`,
          contact.phone && `Phone: ${contact.phone}`,
          contact.location && `Location: ${contact.location}`,
        ].filter(Boolean).join('\n') : '';
      case 'summary':
        return section.content.summary || '';
      case 'experience':
        return (section.content.experience || [])
          .map((exp: any) => `${exp.role} at ${exp.company}\n${exp.description}`)
          .join('\n\n');
      case 'education':
        return (section.content.education || [])
          .map((edu: any) => `${edu.degree} from ${edu.institution}`)
          .join('\n');
      case 'skills':
        return (section.content.skills || [])
          .map((skill: any) => skill.name)
          .join(', ');
      case 'projects':
        return (section.content.projects || [])
          .map((proj: any) => `${proj.title}\n${proj.description}`)
          .join('\n\n');
      case 'certifications':
        return (section.content.certifications || [])
          .map((cert: any) => `${cert.name} - ${cert.issuer}`)
          .join('\n');
      case 'custom':
        return section.content.custom?.content || '';
      default:
        return JSON.stringify(section.content, null, 2);
    }
  };

  const highlightDiff = (oldText: string, newText: string): { old: string; new: string } => {
    // Simple word-by-word diff highlighting
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    
    // This is a simplified diff - in production, use a proper diff library
    const oldHighlighted = oldWords.map(word => {
      if (!newWords.includes(word)) {
        return `<span class="bg-red-200 line-through">${word}</span>`;
      }
      return word;
    }).join(' ');

    const newHighlighted = newWords.map(word => {
      if (!oldWords.includes(word)) {
        return `<span class="bg-green-200">${word}</span>`;
      }
      return word;
    }).join(' ');

    return { old: oldHighlighted, new: newHighlighted };
  };

  return (
    <div className="space-y-4">
      {/* Section List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Sections</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from(allSectionIds).map((sectionId) => {
            const diff = getSectionDiff(sectionId);
            const section = diff.new || diff.old;
            
            return (
              <button
                key={sectionId}
                onClick={() => setSelectedSection(selectedSection === sectionId ? null : sectionId)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedSection === sectionId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {section?.type || 'Unknown'}
                    </span>
                    {diff.type === 'added' && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        Added
                      </span>
                    )}
                    {diff.type === 'removed' && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                        Removed
                      </span>
                    )}
                    {diff.type === 'modified' && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                        Modified
                      </span>
                    )}
                  </div>
                  {selectedSection === sectionId ? (
                    <FiChevronRight className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FiChevronLeft className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diff Viewer */}
      {selectedSection && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Changes</h3>
            <button
              onClick={() => setSelectedSection(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            {/* Old Version */}
            <div className="p-4 bg-red-50">
              <div className="text-xs font-semibold text-red-700 mb-2 uppercase">
                Version {oldVersion}
              </div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                {formatSectionContent(getSectionDiff(selectedSection).old || null)}
              </div>
            </div>

            {/* New Version */}
            <div className="p-4 bg-green-50">
              <div className="text-xs font-semibold text-green-700 mb-2 uppercase">
                Version {newVersion}
              </div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                {formatSectionContent(getSectionDiff(selectedSection).new || null)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

