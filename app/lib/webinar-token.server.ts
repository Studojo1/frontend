import { createHmac, timingSafeEqual } from "crypto";

// Signs/verifies the one-click "register for the next one" token. The token
// carries the recipient's email + name so the link can register them with no
// form, and is HMAC-signed with the shared internal secret so it can't be
// forged or edited. Same secret the frontend uses to talk to the emailer.

function secret(): string {
  return process.env.EMAILER_INTERNAL_SECRET || process.env.INTERNAL_SECRET || "";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export interface QuickRegPayload {
  email: string;
  name: string;
}

// Produce a token: base64url(json).base64url(hmac). Server-side only.
export function signQuickRegToken(payload: QuickRegPayload): string {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

// Verify + decode. Returns the payload or null if the token is invalid/tampered.
export function verifyQuickRegToken(token: string): QuickRegPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString("utf8")) as QuickRegPayload;
    if (!payload.email) return null;
    return payload;
  } catch {
    return null;
  }
}
