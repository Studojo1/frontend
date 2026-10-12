// /jernew: concept preview of the remade B2C Outreach onboarding. Public, no
// login, no loader, no network calls: everything runs on sample data in the
// browser. The flow lives in app/components/jernew/.
import { FlowProvider } from "~/components/jernew/flow";
import { Shell } from "~/components/jernew/shell";

export function meta() {
  return [
    { title: "Studojo | Your page, your people, your inbox" },
    {
      name: "description",
      content:
        "Concept preview: turn your resume into a page you approve, matched hiring managers, and personal emails from your own Gmail.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function JerNewRoute() {
  return (
    <FlowProvider>
      <Shell />
    </FlowProvider>
  );
}
