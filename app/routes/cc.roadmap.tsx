import { redirect } from "react-router";

// Roadmap is now a panel inside the single-page chat at /cc/chat.
export function loader() {
  return redirect("/cc/chat");
}

export default function CcRoadmapRedirect() {
  return null;
}
