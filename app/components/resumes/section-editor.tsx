import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import type { ResumeSection, SectionContent } from "~/lib/resume-draft";

interface SectionEditorProps {
  section: ResumeSection;
  onUpdate: (content: SectionContent) => void;
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  const handleContentUpdate = (updates: Partial<SectionContent>) => {
    onUpdate({ ...section.content, ...updates });
  };

  switch (section.type) {
    case "contact":
      return (
        <ContactSectionEditor
          content={section.content.contact || {}}
          onUpdate={(contact) => handleContentUpdate({ contact })}
        />
      );
    case "summary":
      return (
        <SummarySectionEditor
          content={section.content.summary || ""}
          onUpdate={(summary) => handleContentUpdate({ summary })}
        />
      );
    case "experience":
      return (
        <ExperienceSectionEditor
          content={section.content.experience || []}
          onUpdate={(experience) => handleContentUpdate({ experience })}
        />
      );
    case "education":
      return (
        <EducationSectionEditor
          content={section.content.education || []}
          onUpdate={(education) => handleContentUpdate({ education })}
        />
      );
    case "skills":
      return (
        <SkillsSectionEditor
          content={section.content.skills || []}
          onUpdate={(skills) => handleContentUpdate({ skills })}
        />
      );
    case "projects":
      return (
        <ProjectsSectionEditor
          content={section.content.projects || []}
          onUpdate={(projects) => handleContentUpdate({ projects })}
        />
      );
    case "certifications":
      return (
        <CertificationsSectionEditor
          content={section.content.certifications || []}
          onUpdate={(certifications) => handleContentUpdate({ certifications })}
        />
      );
    case "custom":
      return (
        <CustomSectionEditor
          content={section.content.custom || { title: "", content: "" }}
          onUpdate={(custom) => handleContentUpdate({ custom })}
        />
      );
    default:
      return <div>Unknown section type</div>;
  }
}

function ContactSectionEditor({
  content,
  onUpdate,
}: {
  content: SectionContent["contact"];
  onUpdate: (contact: SectionContent["contact"]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { key: "name", label: "Full Name", placeholder: "John Doe" },
        { key: "email", label: "Email", placeholder: "john@example.com", type: "email" },
        { key: "phone", label: "Phone", placeholder: "+1 (555) 123-4567", type: "tel" },
        { key: "location", label: "Location", placeholder: "City, State" },
        { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/johndoe" },
        { key: "website", label: "Website", placeholder: "johndoe.com" },
      ].map(({ key, label, placeholder, type = "text" }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            type={type}
            value={content?.[key as keyof typeof content] || ""}
            onChange={(e) => onUpdate({ ...content, [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      ))}
    </div>
  );
}

function SummarySectionEditor({
  content,
  onUpdate,
}: {
  content: string;
  onUpdate: (summary: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Professional Summary
      </label>
      <textarea
        value={content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Write a brief summary of your professional background..."
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>
  );
}

function ExperienceSectionEditor({
  content,
  onUpdate,
}: {
  content: SectionContent["experience"];
  onUpdate: (experience: SectionContent["experience"]) => void;
}) {
  const addEntry = () => {
    onUpdate([
      ...(content || []),
      {
        id: `exp-${Date.now()}`,
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      },
    ]);
  };

  const updateEntry = (id: string, updates: any) => {
    onUpdate(
      (content || []).map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const removeEntry = (id: string) => {
    onUpdate((content || []).filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-4">
      {(content || []).map((entry) => (
        <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-gray-900">Experience Entry</h4>
            <button
              onClick={() => removeEntry(entry.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={entry.company}
                onChange={(e) => updateEntry(entry.id, { company: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={entry.role}
                onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="text"
                value={entry.startDate || ""}
                onChange={(e) => updateEntry(entry.id, { startDate: e.target.value })}
                placeholder="MM/YYYY"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="text"
                value={entry.endDate || ""}
                onChange={(e) => updateEntry(entry.id, { endDate: e.target.value })}
                placeholder={entry.isCurrent ? "Present" : "MM/YYYY"}
                disabled={entry.isCurrent}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={entry.isCurrent}
                onChange={(e) => updateEntry(entry.id, { isCurrent: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs text-gray-700">Currently working here</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={entry.description}
              onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
      >
        <FiPlus className="h-4 w-4" />
        Add Experience
      </button>
    </div>
  );
}

function EducationSectionEditor({
  content,
  onUpdate,
}: {
  content: SectionContent["education"];
  onUpdate: (education: SectionContent["education"]) => void;
}) {
  const addEntry = () => {
    onUpdate([
      ...(content || []),
      {
        id: `edu-${Date.now()}`,
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      },
    ]);
  };

  const updateEntry = (id: string, updates: any) => {
    onUpdate(
      (content || []).map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const removeEntry = (id: string) => {
    onUpdate((content || []).filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-4">
      {(content || []).map((entry) => (
        <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-gray-900">Education Entry</h4>
            <button
              onClick={() => removeEntry(entry.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
              <input
                type="text"
                value={entry.institution}
                onChange={(e) => updateEntry(entry.id, { institution: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Degree</label>
              <input
                type="text"
                value={entry.degree}
                onChange={(e) => updateEntry(entry.id, { degree: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Field of Study</label>
              <input
                type="text"
                value={entry.fieldOfStudy || ""}
                onChange={(e) => updateEntry(entry.id, { fieldOfStudy: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dates</label>
              <input
                type="text"
                value={`${entry.startDate || ""} - ${entry.isCurrent ? "Present" : entry.endDate || ""}`}
                placeholder="MM/YYYY - MM/YYYY"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                readOnly
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
      >
        <FiPlus className="h-4 w-4" />
        Add Education
      </button>
    </div>
  );
}

function SkillsSectionEditor({
  content,
  onUpdate,
}: {
  content: SectionContent["skills"];
  onUpdate: (skills: SectionContent["skills"]) => void;
}) {
  const addSkill = () => {
    onUpdate([
      ...(content || []),
      {
        id: `skill-${Date.now()}`,
        category: "Technical",
        name: "",
      },
    ]);
  };

  const updateSkill = (id: string, updates: any) => {
    onUpdate(
      (content || []).map((skill) => (skill.id === id ? { ...skill, ...updates } : skill))
    );
  };

  const removeSkill = (id: string) => {
    onUpdate((content || []).filter((skill) => skill.id !== id));
  };

  return (
    <div className="space-y-2">
      {(content || []).map((skill) => (
        <div key={skill.id} className="flex items-center gap-2">
          <input
            type="text"
            value={skill.name}
            onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
            placeholder="Skill name"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <select
            value={skill.category}
            onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option>Technical</option>
            <option>Soft Skills</option>
            <option>Languages</option>
            <option>Tools</option>
            <option>Other</option>
          </select>
          <button
            onClick={() => removeSkill(skill.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addSkill}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
      >
        <FiPlus className="h-4 w-4" />
        Add Skill
      </button>
    </div>
  );
}

function ProjectsSectionEditor({
  content,
  onUpdate,
}: {
  content: SectionContent["projects"];
  onUpdate: (projects: SectionContent["projects"]) => void;
}) {
  const addProject = () => {
    onUpdate([
      ...(content || []),
      {
        id: `proj-${Date.now()}`,
        title: "",
        description: "",
      },
    ]);
  };

  const updateProject = (id: string, updates: any) => {
    onUpdate(
      (content || []).map((proj) => (proj.id === id ? { ...proj, ...updates } : proj))
    );
  };

  const removeProject = (id: string) => {
    onUpdate((content || []).filter((proj) => proj.id !== id));
  };

  return (
    <div className="space-y-4">
      {(content || []).map((project) => (
        <div key={project.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(project.id, { title: e.target.value })}
              placeholder="Project title"
              className="flex-1 font-medium text-gray-900 border-none focus:outline-none"
            />
            <button
              onClick={() => removeProject(project.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={project.description}
            onChange={(e) => updateProject(project.id, { description: e.target.value })}
            rows={3}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="Describe the project..."
          />
        </div>
      ))}
      <button
        onClick={addProject}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
      >
        <FiPlus className="h-4 w-4" />
        Add Project
      </button>
    </div>
  );
}

function CertificationsSectionEditor({
  content,
  onUpdate,
}: {
  content: SectionContent["certifications"];
  onUpdate: (certifications: SectionContent["certifications"]) => void;
}) {
  const addCert = () => {
    onUpdate([
      ...(content || []),
      {
        id: `cert-${Date.now()}`,
        name: "",
        issuer: "",
      },
    ]);
  };

  const updateCert = (id: string, updates: any) => {
    onUpdate(
      (content || []).map((cert) => (cert.id === id ? { ...cert, ...updates } : cert))
    );
  };

  const removeCert = (id: string) => {
    onUpdate((content || []).filter((cert) => cert.id !== id));
  };

  return (
    <div className="space-y-2">
      {(content || []).map((cert) => (
        <div key={cert.id} className="flex items-center gap-2">
          <input
            type="text"
            value={cert.name}
            onChange={(e) => updateCert(cert.id, { name: e.target.value })}
            placeholder="Certification name"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <input
            type="text"
            value={cert.issuer}
            onChange={(e) => updateCert(cert.id, { issuer: e.target.value })}
            placeholder="Issuer"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <button
            onClick={() => removeCert(cert.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addCert}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
      >
        <FiPlus className="h-4 w-4" />
        Add Certification
      </button>
    </div>
  );
}

function CustomSectionEditor({
  content,
  onUpdate,
}: {
  content: SectionContent["custom"];
  onUpdate: (custom: SectionContent["custom"]) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={content?.title || ""}
          onChange={(e) => onUpdate({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={content?.content || ""}
          onChange={(e) => onUpdate({ ...content, content: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
}

