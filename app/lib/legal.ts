// One place for the legal entity's details and the current policy versions.
//
// Every legal page reads from here, so a value is filled in once. Anything
// still set to TO_FILL renders as "[to be confirmed]" and fails
// scripts/check-legal.mjs, which blocks merges to main. The v2.0 refund
// policy shipped with __GRIEVANCE_OFFICER_NAME__ on studojo.com because
// nothing checked for placeholders.

export const TO_FILL = "TO_FILL";

export const LEGAL_ENTITY = {
  name: "Studojo Labs Private Limited",
  city: "Bengaluru, Karnataka, India",
  email: "admin@studojo.com",
};

export const EFFECTIVE_DATE = "2 October 2026";

// Bump a version whenever that document changes materially. Signed-in users
// whose stored version is older see the update notice and accept again.
export const POLICY_VERSIONS = {
  terms: "2.0",
  privacy: "2.0",
  refund: "3.0",
} as const;

export function fill(value: string): string {
  return value === TO_FILL ? "[to be confirmed]" : value;
}

export function needsPolicyAcceptance(user: {
  termsVersion?: string | null;
  privacyVersion?: string | null;
  refundVersion?: string | null;
}): boolean {
  return (
    user.termsVersion !== POLICY_VERSIONS.terms ||
    user.privacyVersion !== POLICY_VERSIONS.privacy ||
    user.refundVersion !== POLICY_VERSIONS.refund
  );
}
