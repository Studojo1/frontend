import { redirect } from "react-router";

export async function loader() {
  throw redirect("/", 301);
}

export default function Careers() {
  return null;
}
