import { redirect } from "react-router";

// Dashboard is now a panel inside the single-page chat at /cc/chat.
export function loader() {
  return redirect("/cc/chat");
}

export default function CcDashboardRedirect() {
  return null;
}
