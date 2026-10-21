import { stagingHost, STAGING_NOINDEX } from "~/lib/staging-host";

/** NOINDEX: studojo.pro (staging) asks every crawler to stay out; studojo.com's rules below are unchanged. */
const STAGING_ROBOTS = "User-agent: *\nDisallow: /\n";

export async function loader({ request }: { request: Request }) {
  if (stagingHost(request.headers.get("host"))) {
    return new Response(STAGING_ROBOTS, {
      headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600", "X-Robots-Tag": STAGING_NOINDEX },
    });
  }
  const baseUrl = "https://studojo.com";

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin/API/auth routes
Disallow: /api/
Disallow: /auth
Disallow: /settings
Disallow: /onboarding
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}