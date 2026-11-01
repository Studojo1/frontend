import { useRouteLoaderData } from "react-router";

// GOOGLE_ONLY (RELAUNCH, 2 Nov 2026): one switch for "sign in with Google only".
//
// Off by default (the owner keeps email and password sign-up and sign-in). When the server's GOOGLE_ONLY is "1"
// (or true, on, yes):
//   - /auth shows only "Continue with Google": no email form, no sign-up tab, no passkey button.
//   - the server refuses email sign-up (better-auth emailAndPassword.disableSignUp, app/lib/auth.ts).
//   - /forgot-password and /reset-password send the visitor to sign-in.
//   - /settings hides the password, passkey and two-factor sections.
// Email sign-in stays open on the server either way, so nobody with a password is locked out of the API.
//
// No email goes to a student in either state (no verification, welcome or reset email, app/lib/auth.ts).

/** Whether a GOOGLE_ONLY value turns Google-only sign-in on. Pure, for tests. */
export function googleOnlyFrom(value: string | null | undefined): boolean {
  return /^(1|true|on|yes)$/i.test((value ?? "").trim());
}

/** This server's switch (server only: loaders, app/lib/auth.ts). */
export function googleOnlyEnabled(): boolean {
  return googleOnlyFrom(typeof process !== "undefined" ? process.env?.GOOGLE_ONLY : undefined);
}

/** The switch in a page, from the root loader (root.tsx). Off when the root has no data (a 404). */
export function useGoogleOnly(): boolean {
  const data = useRouteLoaderData("root") as { googleOnly?: boolean } | undefined;
  return data?.googleOnly === true;
}
