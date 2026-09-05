// Turning any API error shape into words a human can read.
//
// This exists because of a real bug that reached a student: the CRM showed
// "Couldn't send: [object Object]". The cause was `String(e.body.detail)`.
//
// The trap is that `detail` arrives in TWO shapes from the same service:
//
//   our own HTTPException  ->  detail: "needs_gmail: Connect Gmail…"        (string)
//   a validation failure   ->  detail: [{loc:[...], msg:"…"}, …]            (array)
//
// Code written against the first shape looks correct, passes every test you
// think to write, and then fails on the first request that trips the second —
// printing "[object Object]" and hiding the real reason. `||` and `??` do not
// help: an array is truthy, so it wins the fallback and then stringifies to
// nothing useful.
//
// Use this anywhere an API error is turned into text. Never String() a detail.

/** One pydantic validation item. */
interface ValidationItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

/**
 * A readable sentence for any error shape.
 *
 * Accepts the error itself, or a bare `detail` value. Always returns a
 * non-empty string — a formatter that can return "" just moves the problem.
 */
export function describeError(e: unknown, fallback = "Something went wrong."): string {
  const detail =
    (e as { body?: { detail?: unknown } })?.body?.detail ??
    (e as { detail?: unknown })?.detail ??
    e;

  const text = stringifyDetail(detail);
  if (text) return text;

  const message = (e as { message?: unknown })?.message;
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
}

function stringifyDetail(detail: unknown): string | null {
  if (detail == null) return null;
  if (typeof detail === "string") return detail.trim() || null;
  if (typeof detail === "number" || typeof detail === "boolean") return String(detail);

  // Pydantic: one entry per bad field. Name the field — "contact_name: String
  // should have at least 1 character" is actionable; "String should have at
  // least 1 character" is not.
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item: ValidationItem | unknown) => {
        if (typeof item === "string") return item;
        const it = item as ValidationItem;
        const msg = typeof it?.msg === "string" ? it.msg : null;
        if (!msg) return null;
        const loc = Array.isArray(it.loc) ? it.loc : null;
        // Skip the leading "body"/"query" segment — it names the container,
        // not the field, and reads as noise.
        const field = loc && loc.length ? String(loc[loc.length - 1]) : null;
        return field && field !== "body" ? `${field}: ${msg}` : msg;
      })
      .filter((x): x is string => Boolean(x));
    return parts.length ? parts.join("; ") : null;
  }

  if (typeof detail === "object") {
    // Some services nest the message one level down.
    const nested =
      (detail as { message?: unknown }).message ??
      (detail as { error?: unknown }).error ??
      (detail as { msg?: unknown }).msg;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
    // Last resort: JSON beats "[object Object]" — it is ugly but it is TRUE,
    // and it is what lets whoever reads the log find the real cause.
    try {
      const json = JSON.stringify(detail);
      return json && json !== "{}" ? json : null;
    } catch {
      return null;
    }
  }

  return null;
}
