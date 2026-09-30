import { redirect } from "react-router";

// LinkedIn plans are retired: no invite has been sent since 5 Jul 2026 and no
// campaign runs, so this page no longer sells them (audit NEW-09). Existing
// LinkedIn customers keep /linkedin/dashboard.
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  // /outreach, not /outreach/enrichment: that page needs a resume in
  // progress, so a logged-out visitor saw a blank screen and was bounced on.
  return redirect(`/outreach${url.search}`, 301);
}

export default function Retired() {
  return null;
}
