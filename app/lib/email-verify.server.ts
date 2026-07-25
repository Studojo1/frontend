// Email verification with no external vendor: syntax + MX record lookup.
// Deep SMTP-RCPT probing is often blocked from cloud egress and is unreliable,
// so we report syntax validity and whether the domain can receive mail (MX).
import { resolveMx } from "dns/promises";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EmailVerdict = {
  email: string;
  valid: boolean; // syntactically valid AND the domain has MX
  syntax: boolean;
  mx: boolean;
  catch_all: boolean | null; // not probed here
};

export async function verifyEmail(raw: string): Promise<EmailVerdict> {
  const email = (raw || "").trim();
  const syntax = EMAIL_RE.test(email);
  if (!syntax) {
    return { email, valid: false, syntax: false, mx: false, catch_all: null };
  }
  const domain = email.split("@")[1];
  let mx = false;
  try {
    const records = await resolveMx(domain);
    mx = Array.isArray(records) && records.length > 0;
  } catch {
    mx = false;
  }
  return { email, valid: syntax && mx, syntax, mx, catch_all: null };
}
