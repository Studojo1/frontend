// Phone verifier — the gate that decides whether a number counts as a usable
// personal mobile. Office landlines, switchboards, toll-free and VOIP lines are
// rejected so the cascade falls through to the next source.
//
// Two signals are combined:
//   1. Line type from libphonenumber (max metadata) — MOBILE vs FIXED_LINE etc.
//   2. The provider's own label (SalesQL/Apollo tag phones "Work" / "Personal").
// For India (+91) the number shape is authoritative when the library is unsure.
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

// Strict mode: a number tagged Work/Office by the provider is rejected even if
// it is mobile-shaped. Set false to keep reachable work mobiles.
const STRICT_WORK_LABEL = true;

const OFFICE_WORDS = ["work", "office", "hq", "head", "main", "company", "switchboard", "corporate", "desk", "reception"];
const PERSONAL_WORDS = ["personal", "mobile", "cell", "direct", "home"];

export type LineType = "mobile" | "landline" | "voip" | "tollfree" | "unknown" | "invalid";
export type PhoneVerdict = {
  ok: boolean; // true = usable personal mobile
  number: string; // normalized E.164
  lineType: LineType;
  workTagged: boolean;
  reason: string;
};

function mapType(t?: string): LineType {
  switch (t) {
    case "MOBILE":
      return "mobile";
    case "FIXED_LINE":
      return "landline";
    case "VOIP":
      return "voip";
    case "TOLL_FREE":
      return "tollfree";
    case "PERSONAL_NUMBER":
      return "mobile";
    case "FIXED_LINE_OR_MOBILE":
    default:
      return "unknown";
  }
}

export function classifyPhone(raw?: string, label?: string): PhoneVerdict {
  const lab = (label || "").toLowerCase();
  const workTagged = OFFICE_WORDS.some((w) => lab.includes(w));
  const personalTagged = PERSONAL_WORDS.some((w) => lab.includes(w));

  const cleaned = (raw || "").replace(/[^\d+]/g, "");
  if (!cleaned) return { ok: false, number: "", lineType: "invalid", workTagged, reason: "no number returned" };
  const guess = cleaned.startsWith("+") ? cleaned : "+" + cleaned;

  const pn = parsePhoneNumberFromString(guess);
  if (!pn || !pn.isValid()) {
    return { ok: false, number: guess, lineType: "invalid", workTagged, reason: "not a valid phone number" };
  }
  const number = pn.number; // E.164
  let lineType = mapType(pn.getType());

  // India shape decides ambiguous cases reliably: +91 [6-9]######### is mobile.
  if (lineType === "unknown" && number.startsWith("+91")) {
    lineType = /^\+91[6-9]\d{9}$/.test(number) ? "mobile" : "landline";
  }

  let ok = false;
  let reason: string;
  if (lineType === "landline") reason = "office / landline";
  else if (lineType === "tollfree") reason = "toll-free line";
  else if (lineType === "voip") reason = "voip line";
  else if (lineType === "mobile") {
    if (workTagged && STRICT_WORK_LABEL) reason = "mobile tagged Work/Office";
    else {
      ok = true;
      reason = personalTagged ? "personal mobile" : "mobile";
    }
  } else {
    // unknown line type
    if (personalTagged && !workTagged) {
      ok = true;
      reason = "personal (line type unverified)";
    } else if (workTagged) reason = "tagged Work/Office, line type unverified";
    else reason = "line type could not be confirmed as mobile";
  }

  return { ok, number, lineType, workTagged, reason };
}
