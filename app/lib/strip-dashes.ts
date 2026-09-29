// Product rule: no em or en dashes in anything Studojo shows or sends.
// They read as AI-written, and model output is full of them.
//
// Mirrors strip_em_dashes in bob-svc (services/bob/textrails.py) so every
// surface behaves the same: numeric ranges become a hyphen (2-5), every other
// dash becomes a comma. Line breaks are preserved.
const RANGE = /(?<=\d)[ \t]*[\u2013\u2014][ \t]*(?=\d)/g;
const DASH = /[ \t]*[\u2013\u2014]+[ \t]*/g;

export function stripDashes(text: string): string;
export function stripDashes(text: string | null | undefined): string | null | undefined;
export function stripDashes(text: string | null | undefined) {
  if (!text) return text;
  return text
    .replace(RANGE, "-")
    .replace(DASH, ", ")
    .replace(/, ([,.;:!?)])/g, "$1") // "word, ." -> "word."
    .replace(/(^|\n), /g, "$1") // a dash that opened a line
    .replace(/, (?=\n)/g, ",") // no trailing space before a line break
    .replace(/,\s*$/, ""); // nor a dangling comma at the very end
}

/** stripDashes over every string in a parsed model response (objects and
 *  arrays walked, keys and non-string values untouched). For JSON-mode calls
 *  where the prose sits several levels deep. */
export function stripDashesDeep<T>(value: T): T {
  if (typeof value === "string") return stripDashes(value) as T;
  if (Array.isArray(value)) return value.map((v) => stripDashesDeep(v)) as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = stripDashesDeep(v);
    return out as T;
  }
  return value;
}
