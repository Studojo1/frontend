import { stagingHost, STAGING_NOINDEX } from "~/lib/staging-host";
import { robotsTxt } from "~/lib/crawl-policy";

/** NOINDEX: studojo.pro (staging) asks every crawler to stay out; studojo.com's rules are app/lib/crawl-policy.ts. */
const STAGING_ROBOTS = "User-agent: *\nDisallow: /\n";

export async function loader({ request }: { request: Request }) {
  if (stagingHost(request.headers.get("host"))) {
    return new Response(STAGING_ROBOTS, {
      headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600", "X-Robots-Tag": STAGING_NOINDEX },
    });
  }
  return new Response(robotsTxt("https://studojo.com"), {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
