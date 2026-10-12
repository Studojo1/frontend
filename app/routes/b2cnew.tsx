// /b2cnew: concept preview of the day-to-day Studojo app after /jernew
// onboarding. Senpai (the agent) plus a workspace with tabs, built around
// named hiring managers, emails from your own Gmail, an evidence-backed page
// and honest reply tracking. Public, no login, no loader, no network calls:
// everything runs on sample data in the browser. Code in
// app/components/b2cnew/.
import { B2CProvider } from "~/components/b2cnew/core/store";
import { Shell } from "~/components/b2cnew/shell/shell";

export function meta() {
  return [
    { title: "Studojo | Your search, run with Senpai" },
    {
      name: "description",
      content:
        "Concept preview: your matched hiring managers, drafts to approve, replies and your page in one place, with Senpai doing the legwork. Nothing is sent.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function B2CNewRoute() {
  return (
    <B2CProvider>
      <Shell />
    </B2CProvider>
  );
}
