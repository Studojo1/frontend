export function inferProxy(locale?: string, timezone?: string): { country: string; city: string } {
  if (timezone?.includes("Asia/Kolkata") || locale === "en-IN") return { country: "IN", city: "bangalore" };
  if (timezone?.includes("America/") || locale?.startsWith("en-US")) return { country: "US", city: "new_york" };
  if (timezone?.includes("Europe/London") || locale === "en-GB") return { country: "GB", city: "london" };
  if (timezone?.includes("Asia/Dubai") || locale === "en-AE") return { country: "AE", city: "dubai" };
  if (timezone?.includes("Asia/Singapore") || locale === "en-SG") return { country: "SG", city: "singapore" };
  return { country: "IN", city: "bangalore" };
}
