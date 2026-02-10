/**
 * Resume Document - Immutable document model for resume data
 * 
 * Single source of truth for resume state. All mutations create new instances.
 * This ensures predictable state updates and makes React rendering efficient.
 */

import type { ResumeSection, ResumeDraft } from "./resume-draft";

export class ResumeDocument {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly templateId: string;
  readonly sections: readonly ResumeSection[];
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isArchived: boolean;

  constructor(data: ResumeDraft) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.templateId = data.templateId;
    this.sections = Object.freeze([...data.sections]);
    this.version = data.version;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isArchived = data.isArchived;
  }

  /**
   * Create a new document instance with updated template
   */
  setTemplate(templateId: string): ResumeDocument {
    return new ResumeDocument({
      ...this.toDraft(),
      templateId,
      updatedAt: new Date(),
    });
  }

  /**
   * Create a new document instance with updated sections
   */
  setSections(sections: ResumeSection[]): ResumeDocument {
    return new ResumeDocument({
      ...this.toDraft(),
      sections,
      updatedAt: new Date(),
    });
  }

  /**
   * Create a new document instance with updated section
   */
  updateSection(sectionId: string, updates: Partial<ResumeSection>): ResumeDocument {
    const sections = this.sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    return this.setSections(sections);
  }

  /**
   * Create a new document instance with section content updated
   */
  updateSectionContent(sectionId: string, content: any): ResumeDocument {
    return this.updateSection(sectionId, { content });
  }

  /**
   * Create a new document instance with added section
   */
  addSection(type: ResumeSection["type"], content: any, order?: number): ResumeDocument {
    const newSection: ResumeSection = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      order: order !== undefined ? order : this.sections.length,
      content,
    };
    return this.setSections([...this.sections, newSection]);
  }

  /**
   * Create a new document instance with removed section
   */
  removeSection(sectionId: string): ResumeDocument {
    const sections = this.sections
      .filter((s) => s.id !== sectionId)
      .map((s, idx) => ({ ...s, order: idx }));
    return this.setSections(sections);
  }

  /**
   * Create a new document instance with reordered sections
   */
  reorderSections(fromIndex: number, toIndex: number): ResumeDocument {
    const sections = [...this.sections];
    const [removed] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, removed);
    const reordered = sections.map((s, idx) => ({ ...s, order: idx }));
    return this.setSections(reordered);
  }

  /**
   * Create a new document instance with updated name
   */
  setName(name: string): ResumeDocument {
    return new ResumeDocument({
      ...this.toDraft(),
      name,
      updatedAt: new Date(),
    });
  }

  /**
   * Create a new document instance with incremented version
   */
  incrementVersion(): ResumeDocument {
    return new ResumeDocument({
      ...this.toDraft(),
      version: this.version + 1,
      updatedAt: new Date(),
    });
  }

  /**
   * Get section by ID
   */
  getSection(sectionId: string): ResumeSection | undefined {
    return this.sections.find((s) => s.id === sectionId);
  }

  /**
   * Get sections sorted by order
   */
  getSortedSections(): ResumeSection[] {
    return [...this.sections].sort((a, b) => a.order - b.order);
  }

  /**
   * Convert to ResumeDraft format (for API/DB)
   */
  toDraft(): ResumeDraft {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      templateId: this.templateId,
      sections: [...this.sections],
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isArchived: this.isArchived,
    };
  }

  /**
   * Create ResumeDocument from ResumeDraft
   */
  static fromDraft(draft: ResumeDraft): ResumeDocument {
    return new ResumeDocument(draft);
  }

  /**
   * Create empty ResumeDocument
   */
  static empty(userId: string, name: string, templateId: string = "modern"): ResumeDocument {
    return new ResumeDocument({
      id: `draft-${Date.now()}`,
      userId,
      name,
      templateId,
      sections: [],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
    });
  }

  /**
   * Validate document structure
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === "") {
      errors.push("Document ID is required");
    }

    if (!this.name || this.name.trim() === "") {
      errors.push("Document name is required");
    }

    if (!this.templateId || this.templateId.trim() === "") {
      errors.push("Template ID is required");
    }

    // Validate sections
    const sectionIds = new Set<string>();
    for (const section of this.sections) {
      if (!section.id || section.id.trim() === "") {
        errors.push("Section ID is required");
      }
      if (sectionIds.has(section.id)) {
        errors.push(`Duplicate section ID: ${section.id}`);
      }
      sectionIds.add(section.id);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

