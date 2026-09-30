/**
 * Profile details read from the student's parsed outreach resume (audit PH-28).
 *
 * Students who sign up with email through Outreach never see the profile
 * form, so /profile showed their email prefix as a name and "0% complete"
 * although their resume already says who they are and where they study.
 * The profile page uses this to prefill its form; nothing is saved until the
 * student presses Save.
 *
 * parsed_json comes from an LLM and its shape varies: education can be a
 * list of objects (degree / institution / year keys under several names) or
 * of plain strings. Anything unrecognised is ignored rather than guessed.
 */

export type ResumeProfile = {
  name: string | null;
  college: string | null;
  course: string | null;
  /** e.g. "Graduating 2027" (or "Graduated 2023"), from the first education entry. */
  yearOfStudy: string | null;
};

const str = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 1 && t.length <= 120 ? t : null;
};

const first = (o: Record<string, unknown>, keys: string[]): string | null => {
  for (const k of keys) {
    const v = str(o[k]);
    if (v) return v;
  }
  return null;
};

function yearOf(o: Record<string, unknown>): number | null {
  for (const k of ["graduation_year", "end_year", "year", "end_date", "dates", "duration"]) {
    const v = o[k];
    const text = typeof v === "number" ? String(v) : typeof v === "string" ? v : "";
    const years = text.match(/(19|20)\d{2}/g);
    if (years?.length) return Number(years[years.length - 1]);
  }
  return null;
}

export function profileFromResume(parsed: unknown, now: Date = new Date()): ResumeProfile {
  const out: ResumeProfile = { name: null, college: null, course: null, yearOfStudy: null };
  if (!parsed || typeof parsed !== "object") return out;
  const p = parsed as Record<string, unknown>;
  const info = (p.personal_info && typeof p.personal_info === "object" ? p.personal_info : {}) as Record<string, unknown>;
  const name = first(info, ["name", "full_name"]) ?? first(p, ["name", "full_name"]);
  out.name = name && name.length > 2 && !name.includes("@") ? name : null;

  const edu = Array.isArray(info.education) && info.education.length ? info.education : p.education;
  if (!Array.isArray(edu) || edu.length === 0) return out;
  const top = edu[0];
  if (top && typeof top === "object") {
    const e = top as Record<string, unknown>;
    out.college = first(e, ["institution", "school", "university", "college", "institute"]);
    out.course = first(e, ["degree", "course", "program", "programme", "field_of_study", "major"]);
    const y = yearOf(e);
    if (y) out.yearOfStudy = `${y < now.getFullYear() ? "Graduated" : "Graduating"} ${y}`;
  }
  return out;
}
