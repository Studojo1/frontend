import { eq, desc } from "drizzle-orm";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import db from "~/lib/db";
import { resumes, resumeVersions } from "../../auth-schema";
import type { Route } from "./+types/api.resumes.$id";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = params.id;
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Resume ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const [resume] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.id, id))
    .limit(1);

  if (!resume) {
    return new Response(
      JSON.stringify({ error: "Resume not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (resume.userId !== session.user.id) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      resume: {
        id: resume.id,
        userId: resume.userId,
        name: resume.name,
        resumeData: resume.resumeData,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function action({ params, request }: Route.ActionArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = params.id;
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Resume ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check if resume exists and belongs to user
  const [existing] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.id, id))
    .limit(1);

  if (!existing) {
    return new Response(
      JSON.stringify({ error: "Resume not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (existing.userId !== session.user.id) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (request.method === "PUT") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { name, resumeData, templateId, changeSummary } = body as {
      name?: unknown;
      resumeData?: unknown;
      templateId?: unknown;
      changeSummary?: unknown;
    };

    const updateData: {
      name?: string;
      resumeData?: any;
      templateId?: string;
      version?: number;
      updatedAt?: Date;
    } = {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return new Response(
          JSON.stringify({ error: "Name must be a non-empty string" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      updateData.name = name.trim();
    }
    if (resumeData !== undefined) {
      if (typeof resumeData !== "object" || resumeData === null) {
        return new Response(
          JSON.stringify({ error: "resumeData must be an object" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      updateData.resumeData = resumeData;
    }
    if (templateId !== undefined) {
      if (typeof templateId !== "string") {
        return new Response(
          JSON.stringify({ error: "templateId must be a string" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      updateData.templateId = templateId;
    }

    // Get next version number if resumeData or templateId changed
    if (resumeData !== undefined || templateId !== undefined) {
      const [latestVersion] = await db
        .select()
        .from(resumeVersions)
        .where(eq(resumeVersions.resumeId, id))
        .orderBy(desc(resumeVersions.version))
        .limit(1);

      const nextVersion = (latestVersion?.version || existing.version) + 1;
      updateData.version = nextVersion;
      updateData.updatedAt = new Date();

      // Create new version record
      await db.insert(resumeVersions).values({
        resumeId: id,
        version: nextVersion,
        resumeData: (resumeData as any) || existing.resumeData,
        templateId: (templateId as string) || existing.templateId || "modern",
        changeSummary:
          (typeof changeSummary === "string" ? changeSummary : null) ||
          "Updated",
        createdBy: session.user.id,
      });
    } else {
      updateData.updatedAt = new Date();
    }

    const [updated] = await db
      .update(resumes)
      .set(updateData)
      .where(eq(resumes.id, id))
      .returning();

    return new Response(
      JSON.stringify({
        resume: {
          id: updated.id,
          userId: updated.userId,
          name: updated.name,
          resumeData: updated.resumeData,
          version: updated.version,
          templateId: updated.templateId,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (request.method === "DELETE") {
    await db.delete(resumes).where(eq(resumes.id, id));

    return new Response(
      JSON.stringify({ message: "Resume deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
