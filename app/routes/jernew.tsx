// /jernew was the concept preview of the remade onboarding, run on a sample
// resume. The real flow is at /flow (Studojo1/outreach-flow), so this address
// now sends people there instead of showing the old six-question concept.
import { redirect } from "react-router";

export function loader() {
  throw redirect("/flow/");
}

export default function JerNewRoute() {
  return null;
}
