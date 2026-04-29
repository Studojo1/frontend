import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, useLoaderData } from "react-router";
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
import { resumeDrafts, resumes } from "../../auth-schema";
import { eq, and } from "drizzle-orm";

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) throw redirect("/auth");
    
    const onboardingStatus = await requireOnboardingComplete(session.user.id);
    if (!onboardingStatus.complete) {
      throw redirect("/onboarding");
    }

    console.log(`[resumes.$id.edit] Loading resume ${params.id} for user ${session.user.id}`);

    // Query database directly since we already have authenticated session
    // This avoids auth issues with server-side fetch calls
    const [existingDraft] = await db
      .select()
      .from(resumeDrafts)
      .where(and(eq(resumeDrafts.id, params.id), eq(resumeDrafts.userId, session.user.id)))
      .limit(1);

    if (existingDraft) {
      console.log(`[resumes.$id.edit] Found draft for ${params.id}`);
      return { draft: existingDraft };
    }

    console.log(`[resumes.$id.edit] Draft not found, checking legacy resumes table`);

    // If not found in drafts, check legacy resumes table
    const [legacyResume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, params.id), eq(resumes.userId, session.user.id)))
      .limit(1);

    // If not found in drafts, check legacy resumes table
    if (legacyResume) {
      console.log(`[resumes.$id.edit] Found legacy resume for ${params.id}, userId: ${legacyResume.userId}, session userId: ${session.user.id}`);
      
      // Ownership already verified in query with and(eq(resumes.userId, session.user.id))
      // Convert legacy resume to sections format
      const sections = convertLegacyResumeToSections(legacyResume.resumeData);
      console.log(`[resumes.$id.edit] Converted to ${sections.length} sections`);
      
      // Check if draft already exists
      const [existingDraft] = await db
        .select()
        .from(resumeDrafts)
        .where(eq(resumeDrafts.id, params.id))
        .limit(1);
      
      if (existingDraft) {
        console.log(`[resumes.$id.edit] Draft already exists, returning it`);
        return { draft: existingDraft };
      }
      
      // Create draft from legacy resume
      try {
        const [newDraft] = await db
          .insert(resumeDrafts)
          .values({
            id: legacyResume.id,
            userId: legacyResume.userId,
            name: legacyResume.name,
            templateId: legacyResume.templateId || "modern",
            sections,
            version: legacyResume.version || 1,
            createdAt: legacyResume.createdAt,
            updatedAt: legacyResume.updatedAt,
          })
          .returning();
        
        console.log(`[resumes.$id.edit] Created new draft for ${params.id}`);
        return { draft: newDraft };
      } catch (error: any) {
        console.error("[resumes.$id.edit] Error creating draft:", error);
        // If insert fails (e.g., duplicate key), try to fetch existing draft
        const [existingDraft] = await db
          .select()
          .from(resumeDrafts)
          .where(eq(resumeDrafts.id, params.id))
          .limit(1);
        
        if (existingDraft) {
          console.log(`[resumes.$id.edit] Found existing draft after insert error`);
          return { draft: existingDraft };
        }
        console.error(`[resumes.$id.edit] Failed to create draft and no existing draft found`);
        throw redirect("/resumes");
      }
    }

    console.error(`[resumes.$id.edit] Resume ${params.id} not found in any table, redirecting`);
    // Not found in either table
    throw redirect("/resumes");
  } catch (error: any) {
    // Re-throw redirects
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
    console.error(`[resumes.$id.edit] Unexpected error:`, error);
    throw redirect("/resumes");
  }
}

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draft: initialDraft } = useLoaderData<typeof loader>();

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
  // Don't auto-generate preview on initial load - only on subsequent user edits
  const isFirstLoadRef = useRef<boolean>(true);


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
          toast.error("Preview unavailable - please refresh and sign in again.");
          setPreviewLoading(false);
          return;
        }
        
        throw new Error(errorMessage);
      }

      // Reset block on success
      previewGenerationBlockedRef.current = false;
      
      // Get PDF blob directly (no job polling needed)
      const pdfBlob = await response.blob();
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Clean up previous blob URL if exists
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(blobUrl);
      setPreviewLoading(false);
    } catch (error: any) {
      console.error("Error generating preview:", error);
      setPreviewLoading(false);
      
      // Block future attempts if auth fails
      if (error.message?.includes("token") || error.message?.includes("Authentication") || error.status === 401) {
        previewGenerationBlockedRef.current = true;
        toast.error("Preview unavailable - please refresh and sign in again.");
        return;
      }
      
      const isNetworkError = !error.message || error.message === "fetch failed" || error.message === "Failed to fetch" || error.message.includes("ECONNREFUSED");
      toast.error(isNetworkError ? "Preview unavailable - click Generate Preview to retry." : (error.message || "Failed to generate preview"));
    }
  }, [document, previewUrl]);

  // Initialise document from SSR loader data (no extra network round-trip)
  useEffect(() => {
    if (!initialDraft) {
      navigate("/resumes");
      return;
    }
    setDocument(ResumeDocument.fromDraft(initialDraft));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  // Auto-generate preview on document changes (debounced), but NOT on initial load
  useEffect(() => {
    if (!document || !showPreview || document.sections.length === 0) return;
    if (previewGenerationBlockedRef.current) return;

    // Skip the very first time document is set (initial load)
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    const documentHash = `${document.id}-${document.templateId}-${document.sections.length}-${document.sections.map(s => s.id).join(",")}`;
    if (documentHash === lastPreviewHashRef.current && previewUrl) return;

    const timeoutId = setTimeout(() => {
      generatePreview();
      lastPreviewHashRef.current = documentHash;
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [document, showPreview, previewUrl, generatePreview]);

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

  // Warn on browser close/refresh when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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
                onClick={() => {
                  if (isDirty && !window.confirm("You have unsaved changes. Leave anyway?")) return;
                  navigate("/resumes");
                }}
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
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                AI Assistant
              </button>
              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-neutral-800 rounded-lg hover:bg-neutral-900 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF
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
              onClose={() => setShowAIPanel(false)}
              onOptimizationComplete={(optimized) => {
                if (!document) return;
                const updatedDoc = document.setSections(optimized);
                setDocument(updatedDoc);
                setIsDirty(true);
              }}
              onClose={() => setShowAIPanel(false)}
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

