import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { redirect } from "react-router";
import { toast } from "sonner";
import { Header } from "~/components";
import { getSessionFromRequest, requireOnboardingComplete } from "~/lib/onboarding.server";
import type { Route } from "./+types/resumes.$id.edit";
import type { ResumeDraft, ResumeSection } from "~/lib/resume-draft";
import { autoSaveDraft, cancelAutoSave, convertLegacyResumeToSections } from "~/lib/resume-draft";
import { ResumeDocument } from "~/lib/resume-document";
import { ResumeEditor } from "~/components/resumes/resume-editor";
import { PDFPreview } from "~/components/resumes/pdf-preview";
import { AIPanel } from "~/components/resumes/ai-panel";
import { ExportDialog } from "~/components/resumes/export-dialog";
import db from "~/lib/db";
import { resumeDrafts } from "../../auth-schema";
import { eq } from "drizzle-orm";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) throw redirect("/auth");
  
  const onboardingStatus = await requireOnboardingComplete(session.user.id);
  if (!onboardingStatus.complete) {
    throw redirect("/onboarding");
  }

  const origin = new URL(request.url).origin;
  const cookieHeader = request.headers.get("Cookie") || "";

  // Try loading draft first (v2 API)
  let draftRes = await fetch(`${origin}/api/v2/resumes/${params.id}`, {
    headers: { Cookie: cookieHeader },
  });

  if (draftRes.ok) {
  const { draft } = await draftRes.json();
  return { draft };
  }

  // If not found, try loading legacy resume (v1 API) and convert to draft
  const legacyRes = await fetch(`${origin}/api/resumes/${params.id}`, {
    headers: { Cookie: cookieHeader },
  });

  if (legacyRes.ok) {
    const { resume } = await legacyRes.json();
    // Convert legacy resume to sections format
    const sections = convertLegacyResumeToSections(resume.resumeData);
    
    // Check if draft already exists
    const [existingDraft] = await db
      .select()
      .from(resumeDrafts)
      .where(eq(resumeDrafts.id, params.id))
      .limit(1);
    
    if (existingDraft) {
      return { draft: existingDraft };
    }
    
    // Create draft from legacy resume
    const [newDraft] = await db
      .insert(resumeDrafts)
      .values({
        id: resume.id,
        userId: resume.userId,
        name: resume.name,
        templateId: resume.templateId || "modern",
        sections,
        version: resume.version || 1,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      })
      .returning();
    
    return { draft: newDraft };
  }

  // Not found in either table
  throw redirect("/resumes");
}

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Single source of truth: ResumeDocument
  const [document, setDocument] = useState<ResumeDocument | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Auto-save timeout ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track last successful preview generation to prevent infinite loops
  const lastPreviewHashRef = useRef<string>("");
  const previewGenerationBlockedRef = useRef<boolean>(false);

  const pollPreviewJob = useCallback(async (jobId: string) => {
    const { getJob } = await import("~/lib/control-plane");
    const maxAttempts = 30; // 60 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const job = await getJob(jobId);
        
        if (job.status === "COMPLETED") {
          const result = job.result as any;
          if (result?.preview_url) {
            // Use proxy endpoint to ensure PDF displays inline instead of downloading
            const proxyUrl = `/api/v2/resumes/preview-proxy?url=${encodeURIComponent(result.preview_url)}`;
            setPreviewUrl(proxyUrl);
            setPreviewLoading(false);
          } else {
            throw new Error("Preview URL not found in result");
          }
        } else if (job.status === "FAILED") {
          throw new Error(job.error || "Preview generation failed");
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          throw new Error("Preview generation timeout");
        }
      } catch (error: any) {
        console.error("Preview polling error:", error);
        setPreviewLoading(false);
        toast.error(error.message || "Preview generation failed");
      }
    };

    poll();
  }, []);

  const generatePreview = useCallback(async () => {
    if (!document) return;
    if (previewGenerationBlockedRef.current) return; // Skip if blocked

    setPreviewLoading(true);
    try {
      const response = await fetch(`/api/v2/resumes/${document.id}/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: document.templateId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to generate preview";
        
        // Block future attempts if auth fails
        if (response.status === 401 || errorMessage.includes("token") || errorMessage.includes("Authentication")) {
          previewGenerationBlockedRef.current = true;
          console.warn("Preview generation blocked: authentication required");
          setPreviewLoading(false);
          return; // Silently fail, don't spam errors
        }
        
        throw new Error(errorMessage);
      }

      // Reset block on success
      previewGenerationBlockedRef.current = false;
      const { job_id } = await response.json();
      
      // Poll for job completion
      await pollPreviewJob(job_id);
    } catch (error: any) {
      console.error("Error generating preview:", error);
      setPreviewLoading(false);
      
      // Block future attempts if auth fails
      if (error.message?.includes("token") || error.message?.includes("Authentication") || error.status === 401) {
        previewGenerationBlockedRef.current = true;
        console.warn("Preview generation blocked: authentication required");
        return; // Silently fail, don't spam errors
      }
      
      toast.error(error.message || "Failed to generate preview");
    }
  }, [document, pollPreviewJob]);

  const loadDraft = useCallback(async () => {
    try {
      const response = await fetch(`/api/v2/resumes/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load draft");
      }
      const { draft: draftData } = await response.json();
      // Create ResumeDocument from draft data
      const doc = ResumeDocument.fromDraft(draftData);
      setDocument(doc);
    } catch (error) {
      console.error("Error loading draft:", error);
      navigate("/resumes");
    }
  }, [id, navigate]);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Auto-save on document changes
  useEffect(() => {
    if (!document || !isDirty) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const draft = document.toDraft();
        const updatedDraft = await autoSaveDraft(draft.id, draft.sections, draft.templateId);
        // Update document with saved draft
        const updatedDocument = ResumeDocument.fromDraft(updatedDraft);
        setDocument(updatedDocument);
        setIsDirty(false);
        
        // Reset preview hash to force regeneration after autosave
        const newHash = `${updatedDocument.id}-${updatedDocument.templateId}-${updatedDocument.sections.length}-${updatedDocument.sections.map(s => s.id).join(",")}`;
        lastPreviewHashRef.current = ""; // Clear hash to force preview regeneration
        
        // Trigger preview regeneration after successful autosave
        // Use a small delay to ensure the document state is updated
        setTimeout(() => {
          generatePreview();
        }, 500);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      cancelAutoSave();
    };
  }, [document, isDirty, generatePreview]);

  // Generate preview on document changes (debounced) and on mount
  useEffect(() => {
    if (!document || !showPreview || document.sections.length === 0) return;
    if (previewGenerationBlockedRef.current) return; // Block if auth failed

    // Create stable hash of document state
    const documentHash = `${document.id}-${document.templateId}-${document.sections.length}-${document.sections.map(s => s.id).join(",")}`;
    
    // Skip if document hasn't changed
    if (documentHash === lastPreviewHashRef.current && previewUrl) {
      return;
    }

    // Generate preview immediately on mount, then debounce subsequent changes
    const isInitialMount = !previewUrl && !previewLoading;
    const delay = isInitialMount ? 500 : 2000; // Faster on initial mount

    const timeoutId = setTimeout(() => {
      generatePreview();
      lastPreviewHashRef.current = documentHash;
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [document, showPreview, previewUrl, previewLoading, generatePreview]);

  const handleSectionUpdate = useCallback((updatedSections: ResumeSection[]) => {
    if (!document) return;
    // Create new document with updated sections
    const updatedDoc = document.setSections(updatedSections);
    setDocument(updatedDoc);
    setIsDirty(true);
  }, [document]);

  const handleTemplateChange = useCallback((newTemplateId: string) => {
    if (!document) return;
    // Create new document with updated template
    const updatedDoc = document.setTemplate(newTemplateId);
    setDocument(updatedDoc);
    setIsDirty(true);
  }, [document]);

  if (!document) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-600">Loading resume...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/resumes")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{document.name}</h1>
              {isDirty && (
                <span className="text-xs text-gray-500">Unsaved changes</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600"
              >
                AI Assistant
              </button>
              <button
                onClick={() => setShowExportDialog(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Editor Layout */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Editor Pane */}
          <div className={`flex-1 overflow-y-auto ${showPreview || showAIPanel ? "border-r border-gray-200" : ""}`}>
            <div className="mx-auto max-w-3xl px-4 py-8">
              <ResumeEditor
                sections={document.getSortedSections()}
                templateId={document.templateId}
                onSectionsChange={handleSectionUpdate}
                onTemplateChange={handleTemplateChange}
                showGuidedMode={true}
                draftId={document.id}
              />
            </div>
          </div>

          {/* Preview Pane */}
          {showPreview && !showAIPanel && (
            <div className="w-1/2 bg-gray-100 overflow-y-auto">
              <PDFPreview
                previewUrl={previewUrl}
                loading={previewLoading}
                templateId={document.templateId}
                onGeneratePreview={generatePreview}
              />
            </div>
          )}

          {/* AI Panel */}
          {showAIPanel && (
            <AIPanel
              draftId={document.id}
              sections={document.getSortedSections()}
              onOptimizationComplete={(optimized) => {
                if (!document) return;
                const updatedDoc = document.setSections(optimized);
                setDocument(updatedDoc);
                setIsDirty(true);
              }}
            />
          )}
        </div>

        {/* Export Dialog */}
        {showExportDialog && (
          <ExportDialog
            draftId={document.id}
            sections={document.getSortedSections()}
            templateId={document.templateId}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    </>
  );
}

