import { redirect } from "react-router";

// Career Analysis is now a panel inside the single-page chat at /cc/chat.
export function loader() {
  return redirect("/cc/chat");
}

export default function CcAnalysisRedirect() {
  return null;
}
