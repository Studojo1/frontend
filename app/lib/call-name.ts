// The name to call someone by: their first name, unless it is only an
// initial. "A J Mohamed Nihal" used to come out as "A" ("I'm A at ...",
// "Hi A,"), so when the name opens with an initial use the full name.
// Same rule as _signoff_name in job-outreach-svc's email generator.
export function callName(full: string | null | undefined): string {
  const words = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  return words[0].replace(/\./g, "").length <= 1 ? words.join(" ") : words[0];
}
