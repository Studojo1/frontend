import { trackMetaCustom } from "~/lib/meta-pixel";
import { capturePostHog } from "~/lib/posthog";

// Stu's embed loads no analytics of its own. Each step is a "stu" CustomEvent on window, detail
// { event, mode, size, signed_in, ... }, and the homepage forwards it to PostHog and the Meta Pixel under the
// page's existing gates: both send from production hosts only, after the visitor's consent where it is needed,
// and the pixel copy is a browser-only custom event, never the Conversions API (meta-pixel.ts trackMetaCustom).

export const STU_EVENTS = ["stu_open", "stu_mode_choice", "stu_signup_start", "stu_qa", "stu_close"] as const;
export type StuEvent = (typeof STU_EVENTS)[number];

// The fields the embed sends (career-agent app/embed/stu-embed.ts). Anything else is dropped.
const FIELDS = ["mode", "size", "signed_in", "via", "choice", "topic", "turn"] as const;
// Ids and flags only, never free text a visitor typed.
const SAFE_STRING = /^[A-Za-z0-9_-]{1,40}$/;

/** A known Stu event with its known fields, or null. Pure, for tests. */
export function stuEventProps(detail: unknown): { event: StuEvent; props: Record<string, string | number | boolean> } | null {
  if (!detail || typeof detail !== "object") return null;
  const d = detail as Record<string, unknown>;
  const event = d.event;
  if (typeof event !== "string" || !(STU_EVENTS as readonly string[]).includes(event)) return null;
  const props: Record<string, string | number | boolean> = { surface: "home_b2c" };
  for (const key of FIELDS) {
    const v = d[key];
    if (typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v))) props[key] = v;
    else if (typeof v === "string" && SAFE_STRING.test(v)) props[key] = v;
  }
  return { event: event as StuEvent, props };
}

/** Forwards one "stu" event. Never throws. */
export function forwardStuEvent(detail: unknown): boolean {
  const parsed = stuEventProps(detail);
  if (!parsed) return false;
  try {
    capturePostHog(parsed.event, parsed.props);
  } catch {
    // PostHog failing must not stop the pixel copy
  }
  try {
    trackMetaCustom(parsed.event, parsed.props);
  } catch {
    // Analytics must never break the page
  }
  return true;
}
