// HOMEPAGE V2 (27 Oct 2026): what the homepage's live Stu says and where her sign-up card leads. Pure, for tests
// (app/lib/home-v2.test.mjs).
//
// The owner's flow is fixed: start the call, Stu's pre-recorded line, sign up with Google (or email), the call, the
// resume inside the call. The homepage does the first two steps in place instead of on /b2cnew/join, in the same
// order, with the same recording, the same words and the same links. Each piece below is a copy of career-agent's
// own (Studojo1/career-agent), named where it comes from, so a change there is a change here:
//   JOIN_LINE, lineVersion   app/lib/voice/lines.ts (LINES.join, lineVersion)
//   JOIN_AUDIO               app/lib/voice/spoken.ts clip(): `${BASE}voice/say/join?v=...`, BASE "/b2cnew/"
//   CARRY, carried, signInLink  app/lib/voice/sign-in-link.ts (the /join loader's signIn)
//   BACKED                   app/routes/join.tsx (the card's "Backed by")
import { STU_HOME, startHref } from "../home-b2c/links";

/** Stu's line on /b2cnew/join, word for word (career-agent lines.ts LINES.join). */
export const JOIN_LINE =
  "Hi! I'm Stu, your career agent at Studojo. I find the jobs that fit you, and get you in front of the people who hire. Let's start with a quick sign-up, so your account is ready.";

/** A fingerprint of a line's words, the ?v= of its recording's address (career-agent lines.ts lineVersion). */
export function lineVersion(text: string): string {
  let h = 0x811c9dc5;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return h.toString(36);
}

/** The very recording /b2cnew/join plays: the call service's WAV of the line, cached under its words' address. */
export const JOIN_AUDIO = `/b2cnew/voice/say/join?v=${lineVersion(JOIN_LINE)}`;

/** The visit's attribution keys that ride on to sign-in and the call (sign-in-link.ts CARRY). */
export const CARRY = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "via", "how"] as const;

/** The visit's attribution keys from a query, as a query of their own ("" when none). sign-in-link.ts carried(). */
export function carried(search: string): string {
  const from = new URLSearchParams(search);
  const keep = new URLSearchParams();
  for (const k of CARRY) {
    const v = from.get(k)?.trim();
    if (v) keep.set(k, v.slice(0, 200));
  }
  return keep.toString();
}

/**
 * The main site's sign-in, back to the voice call, with the visit's attribution on both (sign-in-link.ts
 * signInLink). /join puts PUBLIC_ORIGIN in front; the homepage is on that same origin, so the path is the same link.
 */
export function signInLink(search: string): string {
  const tail = carried(search);
  const next = `/b2cnew/start?fresh${tail ? `&${tail}` : ""}`;
  return `/auth?redirect=${encodeURIComponent(next)}${tail ? `&${tail}` : ""}`;
}

/** The homepage's own review toggles, never carried on: ?stu=circle (the purple disc behind Stu). */
const OWN_KEYS = ["stu"];

function landingOnly(landingSearch: string | null | undefined): string {
  const q = new URLSearchParams(landingSearch ?? "");
  for (const k of OWN_KEYS) q.delete(k);
  return q.toString();
}

/** Where /b2cnew/join would be opened from this visit (links.ts startHref: the landing query, then via=home&how=voice). */
export function joinHref(landingSearch: string | null | undefined): string {
  return startHref(landingOnly(landingSearch));
}

/**
 * The sign-up card's link for this visit: exactly what /b2cnew/join's loader would build for the /join address the
 * homepage would have opened (the landing query plus via=home&how=voice), so the call starts at /b2cnew/start?fresh
 * with utm_*, gclid, fbclid, via and how kept.
 */
export function homeSignIn(landingSearch: string | null | undefined): string {
  const join = joinHref(landingSearch);
  return signInLink(join.slice(join.indexOf("?")));
}

/** Signed in: their desk, never a new onboarding. */
export const DESK = STU_HOME;

/** /join's card: "Backed by". */
export const BACKED = ["Microsoft for Startups", "Google for Startups", "Startup Grind", "Mesa"] as const;

/** The line's words with where each starts, for the subtitles (career-agent SpokenText). */
export function wordsOf(text: string): { w: string; start: number }[] {
  const out: { w: string; start: number }[] = [];
  const re = /\S+/g;
  for (let m = re.exec(text); m; m = re.exec(text)) out.push({ w: m[0], start: m.index });
  return out;
}

/** How many characters of the line she has said at `now` (audio clock, read ahead included) (spoken.ts tick). */
export function saidAt(now: number, start: number, duration: number, length: number): number {
  if (now < start || duration <= 0) return 0;
  return Math.min(length, Math.floor(((now - start) / duration) * length));
}

export type Stage = "idle" | "speaking" | "signup";
