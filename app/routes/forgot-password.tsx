import { redirect } from "react-router";
import { ResetPaused } from "~/components/auth/reset-paused";
import { googleOnlyEnabled } from "~/lib/google-only";
import type { Route } from "./+types/forgot-password";

// RELAUNCH (2 Nov 2026, the owner): reset emails are paused, so this page sends nothing. It shows the note
// (components/auth/reset-paused.tsx). With GOOGLE_ONLY on there are no passwords to reset: straight to sign-in.

export function loader() {
  if (googleOnlyEnabled()) throw redirect("/auth?mode=signin");
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Forgot Password | Studojo" }, { name: "robots", content: "noindex" }];
}

export default function ForgotPassword() {
  return <ResetPaused title="Forgot Password?" />;
}
