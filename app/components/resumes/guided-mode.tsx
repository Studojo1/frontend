import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiCheckCircle, FiCircle } from "react-icons/fi";
import type { ResumeSection } from "~/lib/resume-draft";

interface GuidedModeProps {
  sections: ResumeSection[];
}

export function GuidedMode({ sections }: GuidedModeProps) {
  const [expanded, setExpanded] = useState(true);

  const checklist = [
    {
      id: "contact",
      label: "Add contact information",
      check: () => sections.some((s) => s.type === "contact" && s.content.contact?.name),
    },
    {
      id: "summary",
      label: "Write a professional summary",
      check: () => sections.some((s) => s.type === "summary" && s.content.summary?.trim()),
    },
    {
      id: "experience",
      label: "Add work experience",
      check: () =>
        sections.some(
          (s) => s.type === "experience" && (s.content.experience?.length || 0) > 0
        ),
    },
    {
      id: "education",
      label: "Add education",
      check: () =>
        sections.some((s) => s.type === "education" && (s.content.education?.length || 0) > 0),
    },
    {
      id: "skills",
      label: "List your skills",
      check: () =>
        sections.some((s) => s.type === "skills" && (s.content.skills?.length || 0) > 0),
    },
  ];

  const completedCount = checklist.filter((item) => item.check()).length;
  const progress = (completedCount / checklist.length) * 100;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Resume Checklist</h3>
            <p className="text-sm text-blue-700">
              {completedCount} of {checklist.length} completed
            </p>
          </div>
          <div className="w-32 bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {expanded ? (
          <FiChevronUp className="h-5 w-5 text-blue-600" />
        ) : (
          <FiChevronDown className="h-5 w-5 text-blue-600" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {checklist.map((item) => {
            const isCompleted = item.check();
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded ${
                  isCompleted ? "bg-blue-100" : "bg-white"
                }`}
              >
                {isCompleted ? (
                  <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <FiCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    isCompleted ? "text-gray-600 line-through" : "text-gray-900"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

