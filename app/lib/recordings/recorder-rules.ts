// RECORDINGS (5 Nov 2026): the recorder's rules, safe in the browser and pure, for tests (tests/recordings.test.ts).
// The same file is in Studojo1/career-agent (app/lib/recordings/recorder-rules.ts): keep the two copies the same.
// The contract (cookies, chunks, the blob layout) is career-agent's app/lib/recordings/rec.ts.
//
// Privacy (the owner, 5 Nov 2026): screen and UI only, never audio. Typed inputs, phone numbers, email addresses,
// resume contents and payment are masked; Stu's captions and the call transcript stay readable (admins can read call
// transcripts in admin already). In the recorder (recordings/recorder.ts):
//   - every input, textarea and select value is masked by rrweb (maskAllInputs);
//   - every text node goes through maskText: whole when it sits in a masked area (MASKED_AREAS: the resume and cover
//     letter sheets, the call's resume scan, anything marked data-rec-mask), else only its emails and phone numbers;
//   - scrubEvent does the same to the attributes rrweb keeps (title, alt, aria-label, placeholder, value, data-*,
//     mailto: and tel: links) and drops the query and hash from the page address;
//   - BLOCKED is never recorded at all (a grey box in the replay): audio and video elements, the Razorpay checkout,
//     Google account photos, anything marked data-rec-block. Canvas and cross-origin frames are not recorded either (rrweb's defaults).

import { REC_OFF_COOKIE } from "./gate";

export { REC_OFF_COOKIE, mayRecord } from "./gate";
export const REC_COOKIE = "stu_rec";
export const VISIT_IDLE_MS = 30 * 60_000;
export const VISIT_MAX_MS = 4 * 60 * 60_000;

/** Never recorded: a placeholder box of the same size in the replay. */
export const BLOCKED =
  "audio, video, [data-rec-block], .razorpay-container, .razorpay-checkout-frame, iframe[src*='razorpay'], iframe[src*='checkout'], img[src*='googleusercontent.com']";

/**
 * Text masked whole: resume and cover letter sheets (rs-sheet, rs-letter, the studio's rs-edit), anything typed into
 * an editable area (contenteditable: rrweb masks inputs and textareas, not these), and data-rec-mask.
 */
export const MASKED_AREAS = "[data-rec-mask], .rs-sheet, .rs-letter, .rs-edit, [contenteditable]:not([contenteditable='false'])";

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
// A phone number: 10 to 19 digits with spaces, dots, dashes or brackets between them, an optional + in front.
const PHONE_RE = /(?:\+|\b)\d(?:[\s().-]{0,3}\d){9,18}\b/g;

const star = (s: string) => s.replace(/\S/g, "*");

/** A text with its email addresses and phone numbers masked, the rest as it is. Pure. */
export function scrubText(text: string): string {
  if (!text || !/\d|@/.test(text)) return text;
  return text.replace(EMAIL_RE, star).replace(PHONE_RE, (m) => m.replace(/\d/g, "*"));
}

interface ClosestEl {
  closest(selector: string): unknown;
}

/** rrweb's maskTextFn: the whole text in a masked area, else only its emails and phone numbers. */
export function maskText(text: string, el: ClosestEl | null | undefined, masked: string = MASKED_AREAS): string {
  try {
    if (el && typeof el.closest === "function" && el.closest(masked)) return star(text);
  } catch {
    return star(text);
  }
  return scrubText(text);
}

const SCRUB_ATTRS = new Set(["title", "alt", "aria-label", "aria-description", "placeholder", "value", "content", "label", "name"]);

/** One attribute's value as recorded. Pure. */
export function scrubAttr(key: string, value: unknown): unknown {
  if (typeof value !== "string" || !value) return value;
  const k = key.toLowerCase();
  if (k === "href" || k === "src" || k === "action" || k === "srcset") {
    const scheme = /^\s*(mailto|tel|sms|whatsapp):/i.exec(value);
    if (scheme) return `${scheme[1].toLowerCase()}:***`;
    return value.replace(EMAIL_RE, star);
  }
  if (SCRUB_ATTRS.has(k) || k.startsWith("data-") || k.startsWith("aria-")) return scrubText(value);
  return value;
}

type Node = { type?: number; tagName?: string; attributes?: Record<string, unknown>; childNodes?: Node[] };

function scrubNode(node: Node | null | undefined, depth = 0): void {
  if (!node || depth > 400) return;
  const attrs = node.attributes;
  if (attrs && typeof attrs === "object") {
    for (const k of Object.keys(attrs)) if (k !== "_cssText" && k !== "style") attrs[k] = scrubAttr(k, attrs[k]);
    // rrweb masks every input kind but hidden ones, which can carry a token or an id: their value goes whole.
    if (node.tagName === "input" && String(attrs.type ?? "").toLowerCase() === "hidden" && typeof attrs.value === "string") attrs.value = "*";
  }
  if (Array.isArray(node.childNodes)) for (const c of node.childNodes) scrubNode(c, depth + 1);
}

/** An address as recorded: origin and path, never the query or the hash (tokens, codes, emails). Pure. */
export function cleanHref(href: string): string {
  try {
    const u = new URL(href);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "";
  }
}

/**
 * An rrweb event as it is sent: attributes scrubbed in full snapshots (type 2) and in mutations (type 3, source 0),
 * and the address of a meta event (type 4) without its query. Changes the event in place and returns it.
 */
export function scrubEvent<T extends { type: number; data: unknown }>(e: T): T {
  const d = e.data as Record<string, any> | null;
  if (!d || typeof d !== "object") return e;
  if (e.type === 4 && typeof d.href === "string") d.href = cleanHref(d.href);
  else if (e.type === 2) scrubNode(d.node);
  else if (e.type === 3 && d.source === 0) {
    if (Array.isArray(d.adds)) for (const a of d.adds) scrubNode(a?.node);
    if (Array.isArray(d.attributes)) {
      for (const a of d.attributes) {
        const at = a?.attributes;
        if (at && typeof at === "object") for (const k of Object.keys(at)) if (k !== "style") at[k] = scrubAttr(k, at[k]);
      }
    }
  }
  return e;
}

// ---------------------------------------------------------------- the visit cookie

export interface Visit {
  id: string;
  start: number;
  last: number;
}

/** The visit a stu_rec cookie names, while it is still going at `now` (30 idle minutes, 4 hours at most). Pure. */
export function visitFromCookie(cookie: string | null | undefined, now: number): Visit | null {
  const m = new RegExp(`(?:^|;\\s*)${REC_COOKIE}=([0-9a-z]{8,9}-[0-9a-z]{10})\\.([0-9a-z]{1,10})(?:;|$)`).exec(cookie ?? "");
  if (!m) return null;
  const start = parseInt(m[1].split("-")[0], 36);
  const last = parseInt(m[2], 36);
  if (!Number.isFinite(start) || !Number.isFinite(last)) return null;
  if (now - last > VISIT_IDLE_MS || now - start > VISIT_MAX_MS || start > now + 60_000) return null;
  return { id: m[1], start, last };
}

/** A random id of base 36 characters. */
export function randomId(len: number, rand: () => number = Math.random): string {
  let s = "";
  try {
    const a = new Uint8Array(len);
    crypto.getRandomValues(a);
    for (const b of a) s += (b % 36).toString(36);
    return s;
  } catch {
    for (let i = 0; i < len; i++) s += Math.floor(rand() * 36).toString(36);
    return s;
  }
}

/** A new visit starting at `now`. */
export function newVisit(now: number): Visit {
  return { id: `${now.toString(36)}-${randomId(10)}`, start: now, last: now };
}

/** The parent domain the visit cookie lives on, so the website and the platform share it; null on other hosts. Pure. */
export function cookieDomain(hostname: string): string | null {
  const h = hostname.toLowerCase();
  for (const d of ["studojo.com", "studojo.pro"]) if (h === d || h.endsWith(`.${d}`)) return `.${d}`;
  return null;
}

/** The Set-Cookie strings (document.cookie) for the visit and for "stop". Pure. */
export function visitCookie(v: Visit, hostname: string, secure: boolean): string {
  const d = cookieDomain(hostname);
  return [`${REC_COOKIE}=${v.id}.${v.last.toString(36)}`, "Path=/", `Max-Age=${VISIT_IDLE_MS / 1000}`, "SameSite=Lax", ...(d ? [`Domain=${d}`] : []), ...(secure ? ["Secure"] : [])].join("; ");
}

export function offCookie(hostname: string, secure: boolean): string {
  const d = cookieDomain(hostname);
  return [`${REC_OFF_COOKIE}=1`, "Path=/", "Max-Age=3600", "SameSite=Lax", ...(d ? [`Domain=${d}`] : []), ...(secure ? ["Secure"] : [])].join("; ");
}
