import { redirect } from "react-router";
import { ResetPaused } from "~/components/auth/reset-paused";
import { googleOnlyEnabled } from "~/lib/google-only";
import type { Route } from "./+types/reset-password";

// RELAUNCH (2 Nov 2026, the owner): reset emails are paused, and a link from an older email is not honoured here
// either. The page shows the note (components/auth/reset-paused.tsx). With GOOGLE_ONLY on: straight to sign-in.

export function loader() {
  if (googleOnlyEnabled()) throw redirect("/auth?mode=signin");
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Reset Password | Studojo" }, { name: "robots", content: "noindex" }];
}

export default function ResetPassword() {
  return <ResetPaused title="Reset your password" />;
}
