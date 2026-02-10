import type { Route } from "./+types/api.admin.templates.upload";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { uploadTemplateMetadata, uploadTemplateLaTeX, uploadTemplatePreviewImage } from "~/lib/blob-storage.server";
import db from "~/lib/db";
import { resumeTemplates } from "../../auth-schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/admin/templates/upload - Upload template to blob storage
 * 
 * Requires admin authentication.
 * Accepts multipart form data with:
 * - templateId: string
 * - metadata: JSON string with template metadata
 * - latexFile: File (LaTeX template content)
 * - previewImage: File (optional PNG preview)
 */
export async function action({ request }: Route.ActionArgs) {
  // Check authentication
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Add admin role check here
  // For now, allow any authenticated user (should be restricted in production)

  try {
    const formData = await request.formData();
    
    const templateId = formData.get("templateId")?.toString();
    const metadataJson = formData.get("metadata")?.toString();
    const latexFile = formData.get("latexFile") as File | null;
    const previewImage = formData.get("previewImage") as File | null;

    if (!templateId || !metadataJson || !latexFile) {
      return Response.json(
        { error: "Missing required fields: templateId, metadata, latexFile" },
        { status: 400 }
      );
    }

    // Parse metadata
    let metadata: any;
    try {
      metadata = JSON.parse(metadataJson);
    } catch (error) {
      return Response.json(
        { error: "Invalid metadata JSON" },
        { status: 400 }
      );
    }

    // Validate metadata
    if (!metadata.name || !metadata.description || !metadata.category) {
      return Response.json(
        { error: "Metadata must include: name, description, category" },
        { status: 400 }
      );
    }

    // Read LaTeX file content
    const latexContent = await latexFile.text();

    // Upload to blob storage
    const metadataUrl = await uploadTemplateMetadata(templateId, {
      id: templateId,
      version: metadata.version || "1.0",
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
    });

    const latexUrl = await uploadTemplateLaTeX(templateId, latexContent);

    let previewUrl: string | undefined;
    if (previewImage) {
      const previewBuffer = Buffer.from(await previewImage.arrayBuffer());
      previewUrl = await uploadTemplatePreviewImage(templateId, previewBuffer);
    }

    // Update or create database record
    const existingTemplate = await db
      .select()
      .from(resumeTemplates)
      .where(eq(resumeTemplates.id, templateId))
      .limit(1);

    if (existingTemplate.length > 0) {
      // Update existing template
      await db
        .update(resumeTemplates)
        .set({
          version: metadata.version || "1.0",
          name: metadata.name,
          description: metadata.description,
          category: metadata.category,
          latexFile: latexUrl, // Store blob URL
          updatedAt: new Date(),
        })
        .where(eq(resumeTemplates.id, templateId));
    } else {
      // Create new template
      await db.insert(resumeTemplates).values({
        id: templateId,
        version: metadata.version || "1.0",
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        latexFile: latexUrl, // Store blob URL
        isActive: true,
      });
    }

    return Response.json({
      success: true,
      template: {
        id: templateId,
        version: metadata.version || "1.0",
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        assets: {
          latexFile: latexUrl,
          previewImage: previewUrl,
        },
        metadataUrl,
      },
    });
  } catch (error: any) {
    console.error("[api.admin.templates.upload] Error uploading template:", error);
    return Response.json(
      { error: error.message || "Failed to upload template" },
      { status: 500 }
    );
  }
}

