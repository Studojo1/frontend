// RECORDINGS (5 Nov 2026): the one rule the page itself loads before the recorder (recordings/boot.ts): whether
// this browser may record at all. Kept apart from recorder-rules.ts so the rest of the rules travel only in the
// recorder's own chunk, loaded late. The same file is in Studojo1/career-agent (app/lib/recordings/gate.ts). Pure.

export const REC_OFF_COOKIE = "stu_rec_off";

const OFF_RE = new RegExp(`(?:^|;\\s*)${REC_OFF_COOKIE}=1`);

/** Whether a page may load the recorder at all: not a crawler (the audit robot is let through), not told to stop. Pure. */
export function mayRecord(ua: string | null | undefined, cookie: string | null | undefined): boolean {
  const s = ua ?? "";
  if (/StudojoAudit-bot\/1\.0/.test(s)) return !OFF_RE.test(cookie ?? "");
  if (/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|prerender|preview|facebookexternalhit|bingpreview|python|curl|wget/i.test(s)) return false;
  return !OFF_RE.test(cookie ?? "");
}
