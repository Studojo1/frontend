import { redirect } from "react-router";

// /old is the short way to the time machine (app/routes/time-machine.tsx).
export function loader() {
  return redirect("/time-machine", 301);
}

export default function Old() {
  return null;
}
