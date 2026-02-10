/**
 * Template Store - Single source of truth for template state management
 * 
 * Provides unified Template interface and centralized template loading
 * from blob storage (localstack/Azure) with fallback to database.
 */

export interface Template {
  id: string;
  version: string;
  name: string;
  description: string;
  category: string;
  previewUrl?: string;
  assets: {
    latexFile: string; // Path in blob storage
    previewImage?: string; // Path in blob storage
  };
}

/**
 * Normalize template data from various sources (DB, blob storage, etc.)
 * to unified Template interface
 */
export function normalizeTemplate(data: any): Template | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const id = String(data.id || data.ID || data.Id || "").trim();
  if (!id || id === "undefined" || id === "null" || id === "") {
    return null;
  }

  return {
    id,
    version: String(data.version || data.Version || "1.0").trim(),
    name: String(data.name || data.Name || "").trim(),
    description: String(data.description || data.Description || "").trim(),
    category: String(data.category || data.Category || "").trim(),
    previewUrl: data.previewUrl || data.preview_url || undefined,
    assets: {
      latexFile: String(data.assets?.latexFile || data.latex_file || data.LaTeXFile || "").trim(),
      previewImage: data.assets?.previewImage || data.preview_image || undefined,
    },
  };
}

/**
 * Normalize array of templates
 */
export function normalizeTemplates(data: any[]): Template[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(normalizeTemplate)
    .filter((t): t is Template => t !== null);
}

/**
 * Template cache for client-side template state
 */
class TemplateCache {
  private templates: Map<string, Template> = new Map();
  private loading: Set<string> = new Set();
  private loaded = false;

  setTemplates(templates: Template[]): void {
    this.templates.clear();
    templates.forEach((t) => this.templates.set(t.id, t));
    this.loaded = true;
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  clear(): void {
    this.templates.clear();
    this.loaded = false;
  }

  setLoading(id: string, loading: boolean): void {
    if (loading) {
      this.loading.add(id);
    } else {
      this.loading.delete(id);
    }
  }

  isLoading(id: string): boolean {
    return this.loading.has(id);
  }
}

// Singleton template cache instance
export const templateCache = new TemplateCache();

