import { eq } from "drizzle-orm";
import db from "~/lib/db";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import { normalizeLinks } from "~/lib/talent-profile";
import { user, userProfile, type ProfileLinks, type TalentStore } from "../../auth-schema";
import type { Route } from "./+types/api.start.save";

/**
 * POST /api/start/save: stores one /start step on the student's profile.
 *
 *  { step: "confirm", basics: {fullName, college, course, yearOfStudy},
 *    resume: {skills, experience, city, gradYear}, links, edited: ["college", ...] }
 *  { step: "prefs", prefs: {clusters, avoid, cities, minMonthly, titles, liked, passed} }
 *  { step: "chat", chat: {companyStage, dreamCompanies, workMode, startWhen, proud} }
 *
 * Writes the basics to user_profile (and the account name), and merges the
 * rest into the shared talent store with where each fact came from.
 */

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strs = (v: unknown, max = 60, limit = 30) =>
  Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, limit) : [];

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  const session = await getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Sign in first." }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const userId = session.user.id;
  const [existing] = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1);
  const talent: TalentStore = { ...(existing?.talent ?? {}) };
  const now = new Date().toISOString();

  if (body?.step === "confirm") {
    const basics = body.basics ?? {};
    const fullName = str(basics.fullName, 80);
    if (fullName.length < 2) return Response.json({ error: "Add your name." }, { status: 400 });

    let links: ProfileLinks | undefined;
    if (body.links !== undefined) {
      const r = normalizeLinks(body.links);
      if ("error" in r) return Response.json({ error: r.error }, { status: 400 });
      links = r.links;
    }

    const resume = body.resume ?? {};
    const exp = Array.isArray(resume.experience)
      ? resume.experience
          .map((e: any) => ({ title: str(e?.title, 100), company: str(e?.company, 100) }))
          .filter((e: { title: string }) => e.title)
          .slice(0, 6)
      : [];
    const gradYear = Number(resume.gradYear);
    talent.resume = {
      skills: strs(resume.skills, 32, 24),
      experience: exp,
      city: str(resume.city, 60) || null,
      gradYear: Number.isInteger(gradYear) && gradYear > 1980 && gradYear < 2040 ? gradYear : null,
    };
    const edited = new Set(strs(body.edited, 30, 20));
    const sources: TalentStore["sources"] = { ...(talent.sources ?? {}) };
    for (const k of ["name", "college", "course", "year", "city", "skills"]) sources[k] = edited.has(k) ? "you" : "resume";
    talent.sources = sources;
    talent.updatedAt = now;

    const values = {
      fullName,
      college: str(basics.college) || "Not specified",
      course: str(basics.course) || "Not specified",
      yearOfStudy: str(basics.yearOfStudy, 40) || "Not specified",
      talent,
      ...(links ? { links: { ...(existing?.links ?? {}), ...links } } : {}),
    };
    await db.transaction(async (tx) => {
      if (existing) await tx.update(userProfile).set(values).where(eq(userProfile.userId, userId));
      else await tx.insert(userProfile).values({ id: crypto.randomUUID(), userId, ...values });
      await tx.update(user).set({ name: fullName }).where(eq(user.id, userId));
    });
    return Response.json({ ok: true });
  }

  if (body?.step === "prefs") {
    const p = body.prefs ?? {};
    const min = Number(p.minMonthly);
    talent.prefs = {
      clusters: strs(p.clusters, 30, 12),
      avoid: strs(p.avoid, 30, 12),
      cities: strs(p.cities, 60, 10),
      minMonthly: Number.isFinite(min) && min > 0 && min < 1_000_000 ? Math.round(min) : null,
      titles: strs(p.titles, 100, 8),
      liked: strs(p.liked, 40, 40),
      passed: strs(p.passed, 40, 40),
      likedCompanies: strs(p.likedCompanies, 60, 12),
    };
    talent.sources = { ...(talent.sources ?? {}), roles: "swipes", cities: "swipes", pay: "swipes" };
    talent.updatedAt = now;
    if (existing) await db.update(userProfile).set({ talent }).where(eq(userProfile.userId, userId));
    else
      await db.insert(userProfile).values({
        id: crypto.randomUUID(),
        userId,
        fullName: session.user.name || "Not specified",
        college: "Not specified",
        course: "Not specified",
        yearOfStudy: "Not specified",
        talent,
      });
    return Response.json({ ok: true });
  }

  if (body?.step === "chat") {
    if (!existing) return Response.json({ error: "Finish the earlier steps first." }, { status: 400 });
    const c = body.chat ?? {};
    talent.chat = {
      companyStage: str(c.companyStage, 40) || undefined,
      dreamCompanies: strs(c.dreamCompanies, 60, 10),
      workMode: str(c.workMode, 30) || undefined,
      startWhen: str(c.startWhen, 40) || undefined,
      proud: str(c.proud, 400) || undefined,
    };
    talent.sources = { ...(talent.sources ?? {}), companyStage: "chat", dreamCompanies: "chat", workMode: "chat", startWhen: "chat", proud: "chat" };
    talent.updatedAt = now;
    await db.update(userProfile).set({ talent }).where(eq(userProfile.userId, userId));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown step" }, { status: 400 });
}
