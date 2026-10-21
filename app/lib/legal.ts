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

// The Terms' own date since version 2.1 (section 5, Your Studojo page). In production a material change takes effect
// at least 7 days after we email every user about it (Terms section 23), so set this to that date when it ships there.
export const TERMS_EFFECTIVE_DATE = "22 October 2026";

// Bump a version whenever that document changes materially. Signed-in users
// whose stored version is older see the update notice and accept again.
export const POLICY_VERSIONS = {
  // 2.1 (22 Oct 2026): section 5, Your Studojo page (the public profile page the job search makes).
  terms: "2.1",
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
