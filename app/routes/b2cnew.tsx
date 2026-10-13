import { redirectDocument } from "react-router";

// /b2cnew is served by a separate app (Studojo1/career-agent): the ingress sends
// studojo.pro/b2cnew/* there. This route is only reached by in-app navigation on
// the main site (for example /auth sending a student back after sign-in), and
// forces a full page load so the request reaches that app.
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  return redirectDocument(`/b2cnew/${url.search}`);
}

export default function B2cNewHandoff() {
  return null;
}
