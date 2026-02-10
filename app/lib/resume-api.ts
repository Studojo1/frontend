// Client-side resume API utilities
// Auto-save functionality with debouncing

export interface Resume {
  id: string;
  userId: string;
  name: string;
  resumeData: any;
  version: number;
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  resumeData: any;
  templateId: string | null;
  changeSummary: string | null;
  createdAt: Date;
  createdBy: string;
}

let autoSaveTimeout: NodeJS.Timeout | null = null;
const AUTO_SAVE_DELAY = 30000; // 30 seconds

/**
 * Auto-save resume data with debouncing
 * Creates a new version if data has changed
 */
export async function autoSave(
  resumeId: string,
  resumeData: any,
  templateId?: string,
  changeSummary?: string
): Promise<Resume> {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  return new Promise((resolve, reject) => {
    autoSaveTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeData,
            templateId,
            changeSummary: changeSummary || "Auto-saved",
          }),
        });

        if (!response.ok) {
          throw new Error(`Auto-save failed: ${response.statusText}`);
        }

        const data = await response.json();
        resolve(data.resume);
      } catch (error) {
        reject(error);
      } finally {
        autoSaveTimeout = null;
      }
    }, AUTO_SAVE_DELAY);
  });
}

/**
 * Cancel pending auto-save
 */
export function cancelAutoSave() {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
}

/**
 * Create a new resume
 */
export async function createResume(
  name: string,
  resumeData: any,
  templateId: string = "modern"
): Promise<Resume> {
  const response = await fetch("/api/resumes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      resumeData,
      templateId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create resume: ${response.statusText}`);
  }

  const data = await response.json();
  return data.resume;
}

/**
 * Get a resume by ID
 */
export async function getResume(resumeId: string): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}`);

  if (!response.ok) {
    throw new Error(`Failed to get resume: ${response.statusText}`);
  }

  const data = await response.json();
  return data.resume;
}

/**
 * List all resumes for the current user
 */
export async function listResumes(
  limit: number = 50,
  offset: number = 0
): Promise<Resume[]> {
  const response = await fetch(
    `/api/resumes?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error(`Failed to list resumes: ${response.statusText}`);
  }

  const data = await response.json();
  return data.resumes;
}

/**
 * Update resume (manual save - creates new version immediately)
 */
export async function updateResume(
  resumeId: string,
  updates: {
    name?: string;
    resumeData?: any;
    templateId?: string;
    changeSummary?: string;
  }
): Promise<Resume> {
  const response = await fetch(`/api/resumes/${resumeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update resume: ${response.statusText}`);
  }

  const data = await response.json();
  return data.resume;
}

/**
 * Get all versions of a resume
 */
export async function getResumeVersions(
  resumeId: string
): Promise<ResumeVersion[]> {
  const response = await fetch(`/api/resumes/${resumeId}/versions`);

  if (!response.ok) {
    throw new Error(`Failed to get versions: ${response.statusText}`);
  }

  const data = await response.json();
  return data.versions;
}

/**
 * Get a specific version of a resume
 */
export async function getResumeVersion(
  resumeId: string,
  version: number
): Promise<ResumeVersion> {
  const response = await fetch(
    `/api/resumes/${resumeId}/versions/${version}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get version: ${response.statusText}`);
  }

  const data = await response.json();
  return data.version;
}

/**
 * Restore a specific version of a resume
 */
export async function restoreResumeVersion(
  resumeId: string,
  version: number
): Promise<Resume> {
  const response = await fetch(
    `/api/resumes/${resumeId}/versions/${version}/restore`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to restore version: ${response.statusText}`);
  }

  const data = await response.json();
  return data.resume;
}

