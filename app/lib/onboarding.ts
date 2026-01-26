import { eq } from "drizzle-orm";
import { auth } from "~/lib/auth";
import db from "./db";
import { userProfile } from "../../auth-schema";

const MAX_LENGTH = 200;

export type OnboardingProfile = {
  id: string;
  userId: string;
  fullName: string;
  college: string;
  yearOfStudy: string;
  course: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getSessionFromRequest(request: { headers: Headers }) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function getProfileStatus(userId: string) {
  const rows = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);
  const profile = rows[0] ?? null;
  return {
    completed: !!profile,
    profile: profile
      ? {
          id: profile.id,
          userId: profile.userId,
          fullName: profile.fullName,
          college: profile.college,
          yearOfStudy: profile.yearOfStudy,
          course: profile.course,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        }
      : null,
  };
}

export function validateOnboardingBody(body: {
  fullName?: unknown;
  college?: unknown;
  yearOfStudy?: unknown;
  course?: unknown;
}): { ok: true; data: { fullName: string; college: string; yearOfStudy: string; course: string } } | { ok: false; error: string } {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const college = typeof body.college === "string" ? body.college.trim() : "";
  const yearOfStudy = typeof body.yearOfStudy === "string" ? body.yearOfStudy.trim() : "";
  const course = typeof body.course === "string" ? body.course.trim() : "";

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (fullName.length > MAX_LENGTH) return { ok: false, error: "Full name is too long." };
  if (!college) return { ok: false, error: "College/University is required." };
  if (college.length > MAX_LENGTH) return { ok: false, error: "College/University is too long." };
  if (!yearOfStudy) return { ok: false, error: "Year of study is required." };
  if (yearOfStudy.length > MAX_LENGTH) return { ok: false, error: "Year of study is too long." };
  if (!course) return { ok: false, error: "Course/Major is required." };
  if (course.length > MAX_LENGTH) return { ok: false, error: "Course/Major is too long." };

  return { ok: true, data: { fullName, college, yearOfStudy, course } };
}

export async function createProfile(
  userId: string,
  data: { fullName: string; college: string; yearOfStudy: string; course: string }
) {
  const id = crypto.randomUUID();
  await db.insert(userProfile).values({
    id,
    userId,
    fullName: data.fullName,
    college: data.college,
    yearOfStudy: data.yearOfStudy,
    course: data.course,
  });
  const [row] = await db.select().from(userProfile).where(eq(userProfile.id, id)).limit(1);
  return row!;
}
